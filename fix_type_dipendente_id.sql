-- =========================================================
-- CORREZIONE TIPO DATO DIPENDENTE_ID (UUID -> BIGINT)
-- Esegui questo script in: Supabase Dashboard > SQL Editor
-- =========================================================

-- 1. Cambiamo il tipo della colonna esistente in modo sicuro
-- Usiamo USING per assicurarci che i dati esistenti siano convertiti correttamente
ALTER TABLE materiali 
ALTER COLUMN dipendente_id TYPE BIGINT USING dipendente_id::text::bigint;

-- 2. Ripristiniamo il vincolo di chiave esterna (Foreign Key) 
-- Assicurati che punti alla tabella dipendenti
ALTER TABLE materiali 
DROP CONSTRAINT IF EXISTS materiali_dipendente_id_fkey,
ADD CONSTRAINT materiali_dipendente_id_fkey 
FOREIGN KEY (dipendente_id) REFERENCES dipendenti(id);

-- 3. Assicuriamoci che RLS permetta l'operazione
DROP POLICY IF EXISTS "Permetti tutto su materiali" ON materiali;
CREATE POLICY "Permetti tutto su materiali" ON materiali 
FOR ALL TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Ricarica schema PostgREST
NOTIFY pgrst, 'reload schema';

-- FINE SCRIPT
