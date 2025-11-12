-- ============================================================================
-- Configuración de Supabase Storage para bucket 'avatars'
-- ============================================================================
-- Ejecuta TODOS estos comandos en el SQL Editor de Supabase Dashboard
-- Dashboard → SQL Editor → Nuevo Query → Copiar y Pegar → Run
-- ============================================================================

-- PASO 1: Crear el bucket 'avatars' si no existe
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB límite
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880;

-- PASO 2: Políticas RLS (Row Level Security) para el bucket 'avatars'
-- ============================================================================

-- POLÍTICA 1: Permitir lectura pública (SELECT)
-- Cualquiera puede descargar/ver las imágenes del bucket
CREATE POLICY "avatars_public_read" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'avatars');

-- POLÍTICA 2: Permitir que usuarios autenticados suban archivos (INSERT)
-- Solo usuarios logueados pueden subir nuevas imágenes
CREATE POLICY "avatars_authenticated_upload" ON storage.objects FOR
INSERT
    TO authenticated
WITH
    CHECK (bucket_id = 'avatars');

-- POLÍTICA 3: Permitir que usuarios actualicen sus propios archivos (UPDATE)
-- Los usuarios pueden actualizar archivos que subieron
CREATE POLICY "avatars_user_update" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'avatars')
WITH
    CHECK (bucket_id = 'avatars');

-- POLÍTICA 4: Permitir que usuarios eliminen sus propios archivos (DELETE)
-- Los usuarios pueden eliminar archivos que subieron
CREATE POLICY "avatars_user_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Después de ejecutar el script anterior, verifica que todo funcione:
--
-- 1. En Dashboard → Storage → avatars bucket
--    Debes ver que el bucket está marcado como PUBLIC
--
-- 2. En Dashboard → Storage → Policies
--    Debes ver 4 políticas listadas (read, upload, update, delete)
--
-- 3. En tu terminal, ejecuta:
--    curl http://localhost:3000/test-storage-check | jq .
--
-- Si obtienes "success": true, ¡Storage está funcionando! ✅
-- ============================================================================