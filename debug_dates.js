const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://iiqwbxjfmoajdfewlfuf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QkF5mh3svPARkqGeDtOyZw_CN2L-bxN';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDates() {
    const { data, error } = await supabase
        .from('gestione_cantiere')
        .select('id, data, ore_lavorate, dipendenti(nome)')
        .order('data', { ascending: true })
        .limit(10);

    if (error) {
        console.error('Errore:', error);
        return;
    }

    console.log('--- RAW DATABASE DATES ---');
    data.forEach(p => {
        console.log(`ID: ${p.id}, Data DB: ${p.data}, Operaio: ${p.dipendenti?.nome}, JS Date: ${new Date(p.data).toISOString()}`);
    });
}

checkDates();
