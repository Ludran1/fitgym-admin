import { NextResponse } from 'next/server'

export async function GET() {
  // Facebook webhook verification typically hits GET; we return disabled
  return NextResponse.json({ error: 'WhatsApp webhook deshabilitado temporalmente' }, { status: 410 })
}

export async function POST() {
  // Incoming webhook messages are disabled
  return NextResponse.json({ error: 'WhatsApp webhook deshabilitado temporalmente' }, { status: 410 })
}