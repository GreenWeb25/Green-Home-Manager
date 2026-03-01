-- =============================================
--  GREEN HOME MANAGER — Supabase SQL Schema Completo
--  Esegui questo script nel SQL Editor di Supabase
--  ATTENZIONE: Questo script elimina e ricrea tutte le tabelle
-- =============================================

-- Elimina tutte le tabelle esistenti (CASCADE elimina anche le dipendenze)
DROP TABLE IF EXISTS ricavi CASCADE;
DROP TABLE IF EXISTS gestione_cantiere CASCADE;
DROP TABLE IF EXISTS materiali CASCADE;
DROP TABLE IF EXISTS costi_vari CASCADE;
DROP TABLE IF EXISTS dipendenti CASCADE;
DROP TABLE IF EXISTS cantieri CASCADE;

-- =============================================
-- CREAZIONE TABELLE
-- =============================================

-- 1. CANTIERI
CREATE TABLE cantieri (
  id          BIGSERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  indirizzo   TEXT,
  budget      NUMERIC(12,2) DEFAULT 19000,
  stato       TEXT DEFAULT 'In corso',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DIPENDENTI
CREATE TABLE dipendenti (
  id              BIGSERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  ruolo           TEXT,
  tariffa_oraria  NUMERIC(8,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Inserimento iniziale dei 3 operai
INSERT INTO dipendenti (nome, ruolo, tariffa_oraria)
VALUES
  ('Gino',  'Muratore',    16.00),
  ('Beppe', 'Elettricista', 18.50),
  ('Tony',  'Manovale',    14.00);

-- 3. MATERIALI
CREATE TABLE materiali (
  id              BIGSERIAL PRIMARY KEY,
  data            DATE DEFAULT CURRENT_DATE,
  fornitore       TEXT,
  descrizione     TEXT NOT NULL,
  importo         NUMERIC(12,2) DEFAULT 0,
  cantiere_id     BIGINT REFERENCES cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COSTI VARI
CREATE TABLE costi_vari (
  id          BIGSERIAL PRIMARY KEY,
  data        DATE DEFAULT CURRENT_DATE,
  categoria   TEXT NOT NULL,
  importo     NUMERIC(12,2) DEFAULT 0,
  cantiere_id BIGINT REFERENCES cantieri(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GESTIONE CANTIERE (Registro Presenze)
CREATE TABLE gestione_cantiere (
  id              BIGSERIAL PRIMARY KEY,
  dipendente_id   BIGINT REFERENCES dipendenti(id) ON DELETE CASCADE,
  data            DATE NOT NULL,
  ore_lavorate    NUMERIC(5,2) DEFAULT 8,
  note            TEXT,
  cantiere_id     BIGINT REFERENCES cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RICAVI (Tracciamento pagamenti ricevuti)
CREATE TABLE ricavi (
  id              BIGSERIAL PRIMARY KEY,
  cantiere_id     BIGINT REFERENCES cantieri(id) ON DELETE CASCADE,
  tipo            TEXT, -- SAL, Acconto, Saldo, Extra
  descrizione     TEXT,
  importo         NUMERIC(12,2),
  data            DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDICI per migliorare le performance
-- =============================================
CREATE INDEX idx_materiali_cantiere ON materiali(cantiere_id);
CREATE INDEX idx_costi_vari_cantiere ON costi_vari(cantiere_id);
CREATE INDEX idx_gestione_cantiere_cantiere ON gestione_cantiere(cantiere_id);
CREATE INDEX idx_ricavi_cantiere ON ricavi(cantiere_id);
CREATE INDEX idx_gestione_cantiere_dipendente ON gestione_cantiere(dipendente_id);
CREATE INDEX idx_materiali_data ON materiali(data);
CREATE INDEX idx_costi_vari_data ON costi_vari(data);
CREATE INDEX idx_gestione_cantiere_data ON gestione_cantiere(data);
CREATE INDEX idx_ricavi_data ON ricavi(data);

-- =============================================
-- Ricarica lo schema cache di PostgREST
-- =============================================
NOTIFY pgrst, 'reload schema';

-- =============================================
-- Row Level Security (RLS) — Opzionale
-- Da configurare in Supabase Dashboard > Authentication > Policies
-- =============================================
-- Per lo sviluppo puoi abilitare l'accesso anonimo:
-- ALTER TABLE cantieri           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dipendenti         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE materiali          ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE costi_vari         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gestione_cantiere  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ricavi             ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "allow_all" ON cantieri          FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON dipendenti        FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON materiali         FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON costi_vari        FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON gestione_cantiere FOR ALL USING (true);
-- CREATE POLICY "allow_all" ON ricavi            FOR ALL USING (true);
-- =============================================
