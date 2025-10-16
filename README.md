# 🏋️‍♂️ FitGym - Sistema de Gestión de Gimnasio

Sistema completo de gestión para gimnasios desarrollado con **Next.js (App Router) + TypeScript + Supabase**.

## 🚀 Demo en Vivo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/fitgym)

## ✨ Características

- 👥 **Gestión de Clientes**: CRUD completo con información detallada
- 💳 **Gestión de Membresías**: Tipos, precios, estados y asignación
- 📊 **Dashboard**: Estadísticas en tiempo real y métricas clave
- 🔍 **Búsqueda Avanzada**: Por nombre, teléfono, email
- 📱 **Responsive Design**: Optimizado para móviles y desktop
- 🔒 **Autenticación**: Sistema seguro con Supabase Auth
- ⚡ **Tiempo Real**: Actualizaciones instantáneas con Supabase

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Despliegue**: Vercel
- **Herramientas**: ESLint, PostCSS

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

### Configuración Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/fitgym.git
   cd fitgym
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   
   Edita `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

4. **Configurar base de datos**:
   - Ve a tu proyecto en Supabase
   - Ejecuta los scripts `supabase-schema.sql` y `supabase-functions.sql` en el SQL Editor

5. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## 🌐 Despliegue en Vercel

### Despliegue Automático desde GitHub

1. **Subir a GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Conectar con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
  - Configura las variables de entorno:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `DATABASE_URL` (si usas Prisma)

3. **¡Listo!** Tu aplicación estará disponible en tu dominio de Vercel.

Para más detalles, consulta [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md)

## 📁 Estructura del Proyecto

```
src/
├── app/                 # Rutas Next (App Router)
│   ├── (protected)/     # Rutas protegidas con GymLayout
│   ├── login/           # Login (Google OAuth)
│   ├── registro/        # Registro
│   ├── layout.tsx       # Root layout y Providers
│   └── globals.css      # Estilos base (Tailwind + shadcn)
├── components/          # Componentes reutilizables
│   ├── ui/              # Componentes de UI (shadcn/ui)
│   └── GymLayout.tsx    # Layout principal
├── features/            # Funcionalidades por módulo
├── hooks/               # Custom hooks
├── lib/                 # Utilidades y configuración
│   ├── supabase.ts      # Cliente de Supabase
│   └── utils.ts         # Funciones utilitarias
└── public/              # Assets estáticos
```

## 🗄️ Base de Datos

### Tablas Principales

- **clientes**: Información de clientes del gimnasio
- **membresias**: Tipos y configuración de membresías
- **asistencias**: Registro de asistencias (futuro)

### Schema

El schema completo está disponible en `supabase-schema.sql`

## 🧩 Prisma (Admin Server-only)

Esta app es un dashboard admin. Para operaciones de servidor que no requieren RLS puedes usar Prisma contra la base de datos de Supabase.

- Instalación:
  ```bash
  npm i @prisma/client && npm i -D prisma
  npx prisma init --datasource-provider postgresql
  ```

- Variables de entorno (solo servidor):
  ```env
  # Usar el pooler de Supabase (puerto 6543) y limitar conexiones
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:6543/postgres?pgbouncer=true&connection_limit=1
  ```
  Nunca expongas `DATABASE_URL` en el cliente. Configúralo en `.env` local y en Vercel (Environment Variables).

- Uso en Next.js:
  - Cliente singleton en `src/lib/prisma.ts` (ya incluido).
  - Ejemplo de API en `src/app/api/clientes/route.ts` (GET lista clientes con membresía).

- Notas:
  - Con `DATABASE_URL` usas credenciales administrativas; las políticas RLS no aplican. Implementa autorización por código en tus handlers.
  - Mantén los triggers y funciones en SQL (archivo `supabase-schema.sql`), Prisma no gestiona lógica en DB.

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (Next)
npm run build        # Build de producción (Next)
npm run lint         # Linter ESLint
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la [documentación de despliegue](./DESPLIEGUE_VERCEL.md)
2. Abre un [issue](https://github.com/tu-usuario/fitgym/issues)
3. Consulta la [documentación de Supabase](https://supabase.com/docs)

---

Desarrollado con ❤️ para la comunidad fitness
