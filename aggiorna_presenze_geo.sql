-- =========================================================
-- AGGIORNAMENTO TABELLA gestione_cantiere
-- Per timbratura presenze con geolocalizzazione da app mobile
-- Esegui questo script in: Supabase Dashboard > SQL Editor
-- =========================================================

ALTER TABLE gestione_cantiere
  ADD COLUMN IF NOT EXISTS ora_inizio         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ora_fine           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS latitudine         DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitudine        DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS indirizzo_rilevato TEXT,
  ADD COLUMN IF NOT EXISTS timbrata_da_app    BOOLEAN DEFAULT false;

-- Indici per query frequenti dall'app mobile
CREATE INDEX IF NOT EXISTS idx_gestione_cantiere_ora_inizio
  ON gestione_cantiere(ora_inizio);

CREATE INDEX IF NOT EXISTS idx_gestione_cantiere_app
  ON gestione_cantiere(timbrata_da_app);

-- Ricarca lo schema di PostgREST
NOTIFY pgrst, 'reload schema';

-- =========================================================
-- Verifica che le colonne siano state aggiunte correttamente
-- =========================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gestione_cantiere'
ORDER BY ordinal_position;
