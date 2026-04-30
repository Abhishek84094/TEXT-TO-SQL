const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const saveQuery = async (userId, question, sqlQuery, results) => {
    console.log('Saving query to Supabase for user:', userId);
    const { data, error } = await supabase
        .from('queries')
        .insert([
            { 
                user_id: userId, 
                question, 
                sql_query: sqlQuery, 
                results,
                created_at: new Date().toISOString()
            }
        ]);
    
    if (error) {
        console.error('Supabase Save Error Details:', JSON.stringify(error, null, 2));
        throw error;
    }
    return data;
};

const getHistory = async (userId) => {
    console.log('Fetching history from Supabase for user:', userId);
    const { data, error } = await supabase
        .from('queries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Supabase Fetch Error Details:', JSON.stringify(error, null, 2));
        throw error;
    }
    console.log(`Found ${data?.length || 0} history items`);
    return data;
};

module.exports = {
    saveQuery,
    getHistory
};
