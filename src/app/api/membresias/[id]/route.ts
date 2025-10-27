import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const membership = await prisma.memberships.findUnique({ where: { id: params.id } })
    if (!membership) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    
    // Map English model fields to Spanish response
    const membresia = {
      id: membership.id,
      nombre: membership.name,
      descripcion: membership.description,
      tipo: membership.type,
      modalidad: membership.mode,
      precio: membership.price,
      duracion: membership.duration,
      caracteristicas: membership.features,
      activa: membership.is_active,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
    }
    
    return NextResponse.json(membresia)
  } catch (err) {
    console.error('GET /api/membresias/[id] error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const data: any = {}
    
    // Map Spanish request fields to English model fields
    const fieldMapping = {
      nombre: 'name',
      descripcion: 'description',
      tipo: 'type',
      modalidad: 'mode',
      precio: 'price',
      duracion: 'duration',
      caracteristicas: 'features',
      activa: 'is_active',
    }
    
    for (const [spanishField, englishField] of Object.entries(fieldMapping)) {
      if (body[spanishField] !== undefined) {
        data[englishField] = body[spanishField]
      }
    }

    const membership = await prisma.memberships.update({ where: { id: params.id }, data })
    
    // Map English model fields to Spanish response
    const membresia = {
      id: membership.id,
      nombre: membership.name,
      descripcion: membership.description,
      tipo: membership.type,
      modalidad: membership.mode,
      precio: membership.price,
      duracion: membership.duration,
      caracteristicas: membership.features,
      activa: membership.is_active,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
    }
    
    return NextResponse.json(membresia)
  } catch (err: any) {
    console.error('PUT /api/membresias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.memberships.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('DELETE /api/membresias/[id] error', err)
    if (err?.code === 'P2025') return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}