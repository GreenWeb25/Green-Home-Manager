-- TABELLA SUBAPPALTI
CREATE TABLE IF NOT EXISTS subappalti (
  id              BIGSERIAL PRIMARY KEY,
  data            DATE DEFAULT CURRENT_DATE,
  fornitore       TEXT NOT NULL,
  descrizione     TEXT,
  importo         NUMERIC(12,2) DEFAULT 0,
  cantiere_id     BIGINT REFERENCES cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_subappalti_cantiere ON subappalti(cantiere_id);

-- Ricarica schema cache
NOTIFY pgrst, 'reload schema';
