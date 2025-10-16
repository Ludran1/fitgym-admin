-- Hotfix: crear políticas RLS faltantes de manera idempotente
-- Se ejecuta después de que la migración 0001 falló en CREATE POLICY

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'membresias' AND policyname = 'Permitir todo en membresias'
  ) THEN
    CREATE POLICY "Permitir todo en membresias" ON public.membresias FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clientes' AND policyname = 'Permitir todo en clientes'
  ) THEN
    CREATE POLICY "Permitir todo en clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'eventos' AND policyname = 'Permitir todo en eventos'
  ) THEN
    CREATE POLICY "Permitir todo en eventos" ON public.eventos FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'asistencias' AND policyname = 'Permitir todo en asistencias'
  ) THEN
    CREATE POLICY "Permitir todo en asistencias" ON public.asistencias FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Permitir todo en profiles'
  ) THEN
    CREATE POLICY "Permitir todo en profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;