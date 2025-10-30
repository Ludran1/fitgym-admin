import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type Body = {
  dni?: string
  excludeId?: string | number | null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dni = searchParams.get('dni')?.toString().trim() || ''
    const excludeId = searchParams.get('excludeId') || null

    if (!dni) {
      return NextResponse.json({ ok: false, error: 'DNI requerido' }, { status: 400 })
    }

    // Buscar cliente con el mismo DNI, excluyendo el ID si se proporciona
    const where: any = { dni }
    if (excludeId !== null && excludeId !== undefined) {
      where.id = { not: String(excludeId) }
    }

    const existingCliente = await prisma.clientes.findFirst({
      where,
      include: {
        membresias: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            modalidad: true,
            precio: true
          }
        }
      }
    })

    const exists = !!existingCliente

    if (exists && existingCliente) {
      // Devolver datos completos del cliente para el QR scanner
      const clienteData = {
        id: existingCliente.id,
        nombre: existingCliente.nombre,
        dni: existingCliente.dni,
        email: existingCliente.email,
        telefono: existingCliente.telefono,
        fecha_nacimiento: existingCliente.fecha_nacimiento,
        membresia_id: existingCliente.membresia_id,
        nombre_membresia: existingCliente.membresias?.nombre || null,
        tipo_membresia: existingCliente.membresias?.tipo || null,
        fecha_inicio: existingCliente.fecha_inicio,
        fecha_fin: existingCliente.fecha_fin,
        estado: existingCliente.estado,
        avatar_url: existingCliente.avatar_url
      }
      
      return NextResponse.json({ ok: true, existe: true, cliente: clienteData })
    }

    return NextResponse.json({ ok: true, existe: false })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Error inesperado' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    let body: Body = {}
    try {
      body = (await req.json()) as Body
    } catch {
      return NextResponse.json({ ok: false, error: 'Body inválido: se esperaba JSON' }, { status: 400 })
    }

    const dni = (body.dni || '').toString().trim()
    const excludeId = body.excludeId ?? null

    if (!dni) {
      return NextResponse.json({ ok: false, error: 'DNI requerido' }, { status: 400 })
    }

    // Buscar cliente con el mismo DNI, excluyendo el ID si se proporciona
    const where: any = { dni }
    if (excludeId !== null && excludeId !== undefined) {
      where.id = { not: String(excludeId) }
    }

    const existingCliente = await prisma.clientes.findFirst({
      where,
      select: { id: true }
    })

    const exists = !!existingCliente

    return NextResponse.json({ ok: true, exists })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Error inesperado' }, { status: 500 })
  }
}