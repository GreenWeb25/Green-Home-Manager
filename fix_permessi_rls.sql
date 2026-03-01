-- =========================================================
-- FIX PERMESSI (RLS) PER APP MOBILE
-- Esegui questo script in: Supabase Dashboard > SQL Editor
-- Se l'app mobile non vede i dipendenti, è probabile che RLS sia attivo
-- ma manchino le policy di accesso.
-- =========================================================

-- 1. Assicuriamoci che RLS sia attivo (best practice)
ALTER TABLE dipendenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE cantieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestione_cantiere ENABLE ROW LEVEL SECURITY;

-- 2. Eliminiamo policy esistenti per evitare conflitti (opzionale)
DROP POLICY IF EXISTS "Permetti tutto a utenti anonimi" ON dipendenti;
DROP POLICY IF EXISTS "Permetti tutto a utenti anonimi" ON cantieri;
DROP POLICY IF EXISTS "Permetti tutto a utenti anonimi" ON gestione_cantiere;

-- 3. Creiamo policy per permettere l'accesso anonimo (usando la anon key)
CREATE POLICY "Permetti tutto a utenti anonimi" ON dipendenti FOR ALL USING (true);
CREATE POLICY "Permetti tutto a utenti anonimi" ON cantieri FOR ALL USING (true);
CREATE POLICY "Permetti tutto a utenti anonimi" ON gestione_cantiere FOR ALL USING (true);

-- 4. Ricarica schema
NOTIFY pgrst, 'reload schema';

-- FINE SCRIPT
