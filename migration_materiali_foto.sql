-- Migrazione per supportare foto e dipendente nella tabella materiali
ALTER TABLE materiali 
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS dipendente_id BIGINT REFERENCES dipendenti(id);

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_materiali_dipendente ON materiali(dipendente_id);
