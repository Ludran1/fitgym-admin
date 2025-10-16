-- FitGym initial schema migration (Prisma raw SQL)
-- Safe to run on Supabase Postgres. No sample data inserts.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Base function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Tables
CREATE TABLE IF NOT EXISTS public.membresias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('mensual', 'trimestral')),
    modalidad VARCHAR(20) NOT NULL CHECK (modalidad IN ('diario', 'interdiario', 'libre')),
    precio DECIMAL(10,2) NOT NULL,
    duracion INTEGER NOT NULL,
    caracteristicas TEXT[] DEFAULT '{}',
    activa BOOLEAN DEFAULT true,
    clientes_activos INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    membresia_id UUID REFERENCES public.membresias(id) ON DELETE SET NULL,
    nombre_membresia VARCHAR(255),
    tipo_membresia VARCHAR(50),
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'vencida', 'suspendida')),
    asistencias INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrenamiento', 'evento', 'clase')),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(255),
    entrenador VARCHAR(255),
    duracion INTEGER NOT NULL DEFAULT 60,
    estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'completado', 'cancelado')),
    max_participantes INTEGER DEFAULT 1,
    participantes_actuales INTEGER DEFAULT 0,
    precio DECIMAL(10,2),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asistencias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    fecha_asistencia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'presente' CHECK (estado IN ('presente', 'ausente', 'tardanza')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(evento_id, cliente_id)
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers updated_at
CREATE TRIGGER update_membresias_updated_at
    BEFORE UPDATE ON public.membresias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at
    BEFORE UPDATE ON public.eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clientes activos counter
CREATE OR REPLACE FUNCTION update_clientes_activos()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.membresia_id IS NOT NULL AND (OLD.membresia_id IS NULL OR OLD.membresia_id != NEW.membresia_id) THEN
        UPDATE public.membresias SET clientes_activos = clientes_activos + 1 WHERE id = NEW.membresia_id;
        IF OLD.membresia_id IS NOT NULL THEN
            UPDATE public.membresias SET clientes_activos = clientes_activos - 1 WHERE id = OLD.membresia_id;
        END IF;
    END IF;

    IF NEW.membresia_id IS NULL AND OLD.membresia_id IS NOT NULL THEN
        UPDATE public.membresias SET clientes_activos = clientes_activos - 1 WHERE id = OLD.membresia_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION insert_cliente_with_membresia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.membresia_id IS NOT NULL THEN
        UPDATE public.membresias SET clientes_activos = clientes_activos + 1 WHERE id = NEW.membresia_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_membresias_clientes_activos
    AFTER UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION update_clientes_activos();

CREATE TRIGGER insert_clientes_membresia
    AFTER INSERT ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION insert_cliente_with_membresia();

-- Participantes counter
CREATE OR REPLACE FUNCTION update_participantes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.eventos SET participantes_actuales = participantes_actuales + 1 WHERE id = NEW.evento_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.eventos SET participantes_actuales = participantes_actuales - 1 WHERE id = OLD.evento_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_eventos_participantes
    AFTER INSERT OR DELETE ON public.asistencias
    FOR EACH ROW EXECUTE FUNCTION update_participantes_count();

-- Membership status auto-update
CREATE OR REPLACE FUNCTION update_membership_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_fin IS NOT NULL THEN
        IF NEW.fecha_fin < CURRENT_DATE THEN
            NEW.estado = 'vencida';
        ELSIF NEW.fecha_fin >= CURRENT_DATE AND NEW.fecha_inicio <= CURRENT_DATE THEN
            NEW.estado = 'activa';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_client_membership_status
    BEFORE INSERT OR UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION update_membership_status();

-- Helper functions
CREATE OR REPLACE FUNCTION get_days_remaining(client_id UUID)
RETURNS INTEGER AS $$
DECLARE days_left INTEGER; BEGIN
    SELECT CASE WHEN fecha_fin IS NULL THEN NULL WHEN fecha_fin < CURRENT_DATE THEN 0 ELSE EXTRACT(DAY FROM (fecha_fin - CURRENT_DATE))::INTEGER END
    INTO days_left FROM public.clientes WHERE id = client_id;
    RETURN days_left;
END; $$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION get_expiring_memberships(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (id UUID, nombre VARCHAR(255), email VARCHAR(255), telefono VARCHAR(20), fecha_fin TIMESTAMP WITH TIME ZONE, days_remaining INTEGER, nombre_membresia VARCHAR(255)) AS $$
BEGIN
    RETURN QUERY SELECT c.id, c.nombre, c.email, c.telefono, c.fecha_fin,
      EXTRACT(DAY FROM (c.fecha_fin - CURRENT_DATE))::INTEGER AS days_remaining,
      c.nombre_membresia
    FROM public.clientes c
    WHERE c.fecha_fin IS NOT NULL AND c.fecha_fin >= CURRENT_DATE AND c.fecha_fin <= CURRENT_DATE + INTERVAL '1 day' * days_ahead AND c.estado = 'activa'
    ORDER BY c.fecha_fin ASC;
END; $$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION renew_membership(client_id UUID, new_membresia_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE current_membresia_duration INTEGER; current_membresia_id UUID; BEGIN
    SELECT membresia_id INTO current_membresia_id FROM public.clientes WHERE id = client_id;
    IF new_membresia_id IS NULL THEN new_membresia_id := current_membresia_id; END IF;
    SELECT duracion INTO current_membresia_duration FROM public.membresias WHERE id = new_membresia_id;
    UPDATE public.clientes SET fecha_inicio = CURRENT_DATE, fecha_fin = CURRENT_DATE + INTERVAL '1 month' * current_membresia_duration, estado = 'activa', membresia_id = new_membresia_id, updated_at = NOW() WHERE id = client_id;
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN RETURN FALSE; END; $$ LANGUAGE 'plpgsql';

-- RLS (enabled) and permissive policies for development
ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic permissive policies (adjust for production as needed)
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