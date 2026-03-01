import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iiqwbxjfmoajdfewlfuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcXdieGpmbW9hamRmZXdsZnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODIwNzIsImV4cCI6MjA4NjU1ODA3Mn0.FQoVbEtlrRSH_HMB2fsmRfMTVAFHwip9P7_ejimJiK8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: fetch cantieri
export const fetchCantieri = () => supabase.from('cantieri').select('*').order('created_at', { ascending: false });

// Helper: fetch dipendenti
export const fetchDipendenti = () => supabase.from('dipendenti').select('*').order('nome');

// Helper: fetch materiali
export const fetchMateriali = () => supabase.from('materiali').select('*').order('created_at', { ascending: false });

// Helper: fetch costi vari
export const fetchCostiVari = () => supabase.from('costi_vari').select('*').order('created_at', { ascending: false });

// Helper: fetch presenze
export const fetchPresenze = () => supabase.from('gestione_cantiere').select('*, dipendenti(nome)').order('data', { ascending: false });
