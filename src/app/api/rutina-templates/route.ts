import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.rutina_templates (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      nombre varchar(255) NOT NULL,
      descripcion text,
      created_by varchar(255),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.rutina_template_ejercicios (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      template_id uuid NOT NULL,
      ejercicio_id uuid,
      nombre varchar(255),
      series int,
      repeticiones int,
      peso_sugerido numeric(10,2),
      dia varchar(20),
      notas text,
      orden int,
      created_at timestamptz DEFAULT now(),
      CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES public.rutina_templates(id) ON DELETE CASCADE
    )
  `)
}

export async function GET(req: Request) {
  try {
    await ensureTables()
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    const whereClause = q ? {
      name: {
        contains: q,
        mode: 'insensitive' as const
      }
    } : {}

    const templates = await prisma.routineTemplates.findMany({
      where: whereClause,
      orderBy: [
        { updated_at: 'desc' },
        { created_at: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true
      }
    })

    // Map English fields to Spanish for API response
    const templatesResponse = templates.map(template => ({
      id: template.id,
      nombre: template.name,
      descripcion: template.description,
      created_at: template.created_at,
      updated_at: template.updated_at
    }))

    return NextResponse.json({ templates: templatesResponse })
  } catch (err) {
    console.error('GET /api/rutina-templates error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await ensureTables()
    const body = await req.json()
    const { nombre, descripcion } = body
    if (!nombre) return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })

    const template = await prisma.routineTemplates.create({
      data: {
        name: nombre,
        description: descripcion ?? null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        updated_at: true
      }
    })

    // Map English fields to Spanish for API response
    const templateResponse = {
      id: template.id,
      nombre: template.name,
      descripcion: template.description,
      created_at: template.created_at,
      updated_at: template.updated_at
    }

    return NextResponse.json(templateResponse, { status: 201 })
  } catch (err) {
    console.error('POST /api/rutina-templates error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}