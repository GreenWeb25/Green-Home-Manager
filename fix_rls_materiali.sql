-- =========================================================
-- FIX PERMESSI (RLS) PER TABELLA MATERIALI
-- Esegui questo script in: Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. Assicuriamoci che RLS sia attivo
ALTER TABLE materiali ENABLE ROW LEVEL SECURITY;

-- 2. Eliminiamo policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Permetti tutto su materiali" ON materiali;

-- 3. Creiamo una policy che permette qualsiasi operazione (SELECT, INSERT, UPDATE, DELETE)
-- Nota: 'true' significa che chiunque (anche anonimo con anon_key) può operare.
-- Se preferisci restringere solo agli utenti loggati, usa: FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permetti tutto su materiali" ON materiali FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Ricarica schema PostgREST
NOTIFY pgrst, 'reload schema';

-- FINE SCRIPT
