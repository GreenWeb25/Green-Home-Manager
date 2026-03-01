-- 1. Assicuriamoci che la tabella esista (senza toccare i dati)
CREATE TABLE IF NOT EXISTS public.subappalti (
  id              BIGSERIAL PRIMARY KEY,
  data            DATE DEFAULT CURRENT_DATE,
  fornitore       TEXT NOT NULL,
  descrizione     TEXT,
  importo         NUMERIC(12,2) DEFAULT 0,
  cantiere_id     BIGINT REFERENCES cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Abilitiamo la RLS (Row Level Security) per rendere la tabella visibile all'API
ALTER TABLE public.subappalti ENABLE ROW LEVEL SECURITY;

-- 3. Creiamo una policy per permettere l'accesso (come nelle altre tabelle)
-- Nota: 'true' permette l'accesso a tutti (anonimi/autenticati), utile per lo sviluppo attuale.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subappalti' AND policyname = 'allow_all_subappalti'
    ) THEN
        CREATE POLICY "allow_all_subappalti" ON public.subappalti FOR ALL USING (true);
    END IF;
END $$;

-- 4. Forza il ricaricamento della cache di PostgREST (Supabase API)
NOTIFY pgrst, 'reload schema';

-- 5. Se il NOTIFY non basta, eseguire una query dummy può aiutare in alcuni casi
SELECT count(*) FROM public.subappalti;
