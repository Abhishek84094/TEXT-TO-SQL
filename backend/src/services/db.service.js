const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv-parser');

// Store connections per user
const userConnections = {};

const connectExternalDb = async (userId, type, credentials) => {
    let connection, schema;
    
    if (type === 'postgres') {
        const connectionConfig = {
            ...credentials,
            ssl: { rejectUnauthorized: false } // Required for most cloud databases
        };
        connection = new Client(connectionConfig);
        try {
            await connection.connect();
        } catch (err) {
            console.error('Postgres Connection Error:', err);
            throw new Error(`Postgres Connection Failed: ${err.message}`);
        }
        
        // Fetch schema
        const res = await connection.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
        `);
        schema = formatSchema(res.rows, 'postgres');
        
    } else if (type === 'mysql') {
        try {
            const connectionConfig = {
                ...credentials,
                ssl: { rejectUnauthorized: false }
            };
            connection = await mysql.createConnection(connectionConfig);
        } catch (err) {
            console.error('MySQL Connection Error:', err);
            throw new Error(`MySQL Connection Failed: ${err.message}`);
        }
        
        const [rows] = await connection.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = ?
        `, [credentials.database]);
        schema = formatSchema(rows, 'mysql');
        
    } else {
        throw new Error('Unsupported external database type');
    }

    userConnections[userId] = { type, connection, schema };
    return { schema };
};

const processUploadedFile = async (userId, file) => {
    let connection, schema;
    const filePath = file.path;
    
    if (file.originalname.endsWith('.db') || file.originalname.endsWith('.sqlite')) {
        connection = new sqlite3.Database(filePath);
        
        schema = await new Promise((resolve, reject) => {
            connection.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
                if (err) return reject(err);
                let schemaStr = '';
                let processed = 0;
                
                if (tables.length === 0) return resolve(schemaStr);
                
                tables.forEach(table => {
                    connection.all(`PRAGMA table_info(${table.name})`, (err, cols) => {
                        if (err) return reject(err);
                        schemaStr += `Table: ${table.name}\nColumns: ${cols.map(c => c.name + ' (' + c.type + ')').join(', ')}\n\n`;
                        processed++;
                        if (processed === tables.length) resolve(schemaStr);
                    });
                });
            });
        });
        
        userConnections[userId] = { type: 'sqlite', connection, schema };
        return { schema };
        
    } else if (file.originalname.endsWith('.csv')) {
        // Create an in-memory SQLite database and load the CSV
        connection = new sqlite3.Database(':memory:');
        
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    if (results.length === 0) return reject(new Error('Empty CSV file'));
                    
                    const headers = Object.keys(results[0]);
                    const createTable = `CREATE TABLE data (${headers.map(h => `\`${h}\` TEXT`).join(', ')})`;
                    
                    connection.serialize(() => {
                        connection.run(createTable);
                        const stmt = connection.prepare(`INSERT INTO data VALUES (${headers.map(() => '?').join(', ')})`);
                        results.forEach(row => {
                            stmt.run(Object.values(row));
                        });
                        stmt.finalize();
                        
                        schema = `Table: data\nColumns: ${headers.join(', ')}\n`;
                        userConnections[userId] = { type: 'sqlite', connection, schema };
                        
                        // Cleanup uploaded file
                        fs.unlinkSync(filePath);
                        resolve({ schema });
                    });
                })
                .on('error', (err) => reject(err));
        });
    } else {
        throw new Error('Unsupported file type');
    }
};

const getSchema = async (userId) => {
    if (!userConnections[userId]) return null;
    return userConnections[userId].schema;
};

const executeQuery = async (userId, sql) => {
    const userConn = userConnections[userId];
    if (!userConn) throw new Error('No active database connection');
    
    // Safety check: only allow SELECT
    if (!sql.toLowerCase().trim().startsWith('select')) {
        throw new Error('Only SELECT queries are allowed for safety.');
    }
    
    const { type, connection } = userConn;
    
    if (type === 'postgres') {
        const res = await connection.query(sql);
        return res.rows;
    } else if (type === 'mysql') {
        const [rows] = await connection.query(sql);
        return rows;
    } else if (type === 'sqlite') {
        return new Promise((resolve, reject) => {
            connection.all(sql, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
};

const formatSchema = (rows, type) => {
    const tables = {};
    rows.forEach(row => {
        const tName = row.table_name || row.TABLE_NAME;
        const cName = row.column_name || row.COLUMN_NAME;
        const dType = row.data_type || row.DATA_TYPE;
        
        if (!tables[tName]) tables[tName] = [];
        tables[tName].push(`${cName} (${dType})`);
    });
    
    let schemaStr = '';
    for (const [table, cols] of Object.entries(tables)) {
        schemaStr += `Table: ${table}\nColumns: ${cols.join(', ')}\n\n`;
    }
    return schemaStr;
};

module.exports = {
    connectExternalDb,
    processUploadedFile,
    getSchema,
    executeQuery
};
