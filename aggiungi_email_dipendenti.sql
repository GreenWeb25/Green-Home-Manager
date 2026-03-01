-- =========================================================
-- AGGIUNTA CAMPO EMAIL PER GOOGLE AUTH
-- Esegui questo script in: Supabase Dashboard > SQL Editor
-- =========================================================

ALTER TABLE dipendenti ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Ricarica schema
NOTIFY pgrst, 'reload schema';
