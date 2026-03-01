-- 1. Assicuriamoci che la tabella esista
CREATE TABLE IF NOT EXISTS public.subappalti (
  id              BIGSERIAL PRIMARY KEY,
  data            DATE DEFAULT CURRENT_DATE,
  fornitore       TEXT NOT NULL,
  descrizione     TEXT,
  importo         NUMERIC(12,2) DEFAULT 0,
  cantiere_id     BIGINT REFERENCES cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attiva RLS
ALTER TABLE public.subappalti ENABLE ROW LEVEL SECURITY;

-- 3. Crea la policy in modo sicuro (rimuovendola se già esiste)
DROP POLICY IF EXISTS "allow_all_subappalti" ON public.subappalti;
CREATE POLICY "allow_all_subappalti" ON public.subappalti FOR ALL USING (true);

-- 4. Forza il refresh della cache di Supabase
NOTIFY pgrst, 'reload schema';

-- 5. Verifica finale
SELECT count(*) FROM public.subappalti;
