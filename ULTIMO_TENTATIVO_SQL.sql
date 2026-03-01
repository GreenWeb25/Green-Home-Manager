-- 1. Verifica se la tabella esiste davvero (esegui e guarda i risultati)
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'subappalti'
);

-- 2. Se non esiste, creala (ripetiamo per sicurezza)
CREATE TABLE IF NOT EXISTS public.subappalti (
  id              BIGSERIAL PRIMARY KEY,
  data            DATE DEFAULT CURRENT_DATE,
  fornitore       TEXT NOT NULL,
  descrizione     TEXT,
  importo         NUMERIC(12,2) DEFAULT 0,
  cantiere_id     BIGINT REFERENCES public.cantieri(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERMESSI (GRANTS) - Fondamentale per la visibilità nell'API
GRANT ALL ON TABLE public.subappalti TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. RLS e Policy
ALTER TABLE public.subappalti ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_subappalti" ON public.subappalti;
CREATE POLICY "allow_all_subappalti" ON public.subappalti FOR ALL USING (true);

-- 5. FORZA AGGIORNAMENTO SCHEMA CACHE (Hammer method)
COMMENT ON TABLE public.subappalti IS 'Tabella subappalti v2 - refresh';
NOTIFY pgrst, 'reload schema';

-- 6. Verifica finale per l'utente
SELECT 'Tabella pronta e permessi assegnati' as status;
