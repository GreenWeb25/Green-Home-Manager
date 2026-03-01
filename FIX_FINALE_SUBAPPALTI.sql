-- 1. Assicuriamoci che la tabella esista e sia nello schema public
CREATE TABLE IF NOT EXISTS public.subappalti (
  id              BIGSERIAL PRIMARY KEY,
  data            DATE DEFAULT CURRENT_DATE,
  fornitore       TEXT NOT NULL,
  descrizione     TEXT,
  importo         NUMERIC(12,2) DEFAULT 0,
  cantiere_id     BIGINT REFERENCES public.cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Permessi espliciti per i ruoli API di Supabase (FONDAMENTALE)
GRANT ALL ON TABLE public.subappalti TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Attiva RLS
ALTER TABLE public.subappalti ENABLE ROW LEVEL SECURITY;

-- 4. Crea la policy (rimuovendola se già esiste)
DROP POLICY IF EXISTS "allow_all_subappalti" ON public.subappalti;
CREATE POLICY "allow_all_subappalti" ON public.subappalti FOR ALL USING (true);

-- 5. Forza il refresh della cache di PostgREST
NOTIFY pgrst, 'reload schema';

-- 6. Verifica se la tabella è visibile nello schema cache (query di test)
SELECT * FROM public.subappalti LIMIT 1;
