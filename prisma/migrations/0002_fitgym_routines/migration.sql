-- FitGym routines tables aligned with Prisma schema (English model names)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clientes(id) ON UPDATE NO ACTION,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  name VARCHAR(255) NOT NULL,
  sets INT,
  reps INT,
  day VARCHAR(20),
  notes TEXT,
  "order" INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at trigger function if not already present
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();