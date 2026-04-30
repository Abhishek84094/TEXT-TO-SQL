const { GoogleGenAI } = require('@google/genai');

// Retry helper with exponential backoff for transient errors (503, 429)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateSql = async (question, schema, maxRetries = 2) => {
    const provider = process.env.LLM_PROVIDER || 'gemini';
    
    // 1. Try Groq if it's the primary provider
    if (provider === 'groq' && process.env.GROQ_API_KEY) {
        try {
            console.log(`Attempting SQL generation with Groq (${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`);
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'You are a senior data analyst and SQL expert. Return ONLY the SQL query without markdown or explanation.' },
                        { role: 'user', content: `Schema:\n${schema}\n\nQuestion:\n${question}` }
                    ],
                    temperature: 0.1
                })
            });

            if (groqResponse.ok) {
                const data = await groqResponse.json();
                let sql = data.choices[0].message.content.trim();
                sql = sql.replace(/^\`\`\`sql/, '').replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
                return sql;
            } else {
                const errorData = await groqResponse.json().catch(() => ({}));
                console.warn(`Groq API returned error: ${groqResponse.status} - ${errorData.error?.message || 'Internal Server Error'}`);
            }
        } catch (error) {
            console.warn(`Groq primary failed: ${error.message}. Falling back to others...`);
        }
    }

    // 2. Try Ollama if it's the provider or if we want to fallback to it
    if (provider === 'ollama') {
        try {
            if (typeof fetch === 'undefined') {
                throw new Error('Native fetch is not available. Please upgrade to Node.js 18+ or install node-fetch.');
            }
            
            console.log(`Attempting SQL generation with local Ollama (${process.env.OLLAMA_MODEL || 'llama3:latest'})`);
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || 'llama3:latest',
                    prompt: `
You are a senior data analyst and SQL expert.
Given the database schema below, write a correct SQL query that answers the user's question.
Return ONLY the SQL query. No markdown, no explanation.

Schema:
${schema}

Question:
${question}
`,
                    stream: false
                })
            });

            if (response.ok) {
                const data = await response.json();
                let sql = data.response.trim();
                // Clean up any markdown
                sql = sql.replace(/^\`\`\`sql/, '').replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
                return sql;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`Ollama API returned error: ${response.status} - ${errorData.error || 'Internal Server Error'}`);
            }
        } catch (error) {
            console.warn(`Ollama check failed: ${error.message}. Falling back to Gemini...`);
        }
    }

    // 2. Gemini logic (as primary or fallback)
    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY
    });
    
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const baseModels = ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-3-pro-preview'];
    const modelChain = [primaryModel, ...baseModels.filter(m => m !== primaryModel)];

    const prompt = `
You are a senior data analyst and SQL expert.
Given the database schema below, write a correct SQL query that answers the user's question.
Rules:
- Use only the tables and columns in the schema.
- Return ONLY the SQL query, without markdown formatting like \`\`\`sql.

Schema:
${schema}

Question:
${question}
`;

    let lastError;
    for (const modelName of modelChain) {
        console.log(`Attempting SQL generation with Gemini model: ${modelName}`);
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Correct way to use the new @google/genai SDK
                const result = await ai.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                
                let sql = result.text.trim();
                
                sql = sql.replace(/^\`\`\`sql/, '').replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
                return sql;
            } catch (error) {
                lastError = error;
                const statusCode = error?.status || error?.code;
                const errorMessage = error?.message || '';
                console.warn(`Gemini ${modelName} failed (Attempt ${attempt + 1}): ${errorMessage.split('\n')[0]}`);

                // Check for rate limits or quota
                if (statusCode === 429 || errorMessage.includes('quota')) {
                    console.log(`Rate limit or Quota hit for ${modelName}. Trying next model...`);
                    break; // Move to next model in the chain
                }

                // Retry on transient server errors
                if ((statusCode === 503 || statusCode === 500) && attempt < maxRetries - 1) {
                    await sleep(Math.pow(2, attempt) * 2000);
                    continue;
                }
                break;
            }
        }
    }

    // 3. Groq logic (as final fallback)
    if (process.env.GROQ_API_KEY) {
        try {
            console.log(`Attempting SQL generation with Groq (${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`);
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: 'You are a senior data analyst and SQL expert. Return ONLY the SQL query without markdown or explanation.' },
                        { role: 'user', content: `Schema:\n${schema}\n\nQuestion:\n${question}` }
                    ],
                    temperature: 0.1
                })
            });

            if (groqResponse.ok) {
                const data = await groqResponse.json();
                let sql = data.choices[0].message.content.trim();
                sql = sql.replace(/^\`\`\`sql/, '').replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
                return sql;
            } else {
                const errorData = await groqResponse.json().catch(() => ({}));
                console.warn(`Groq API returned error: ${groqResponse.status} - ${errorData.error?.message || 'Internal Server Error'}`);
            }
        } catch (error) {
            console.warn(`Groq fallback failed: ${error.message}`);
        }
    }

    throw new Error('All LLM providers (Ollama, Gemini, and Groq) exhausted or failed. Last error: ' + lastError?.message);
};

module.exports = {
    generateSql
};
