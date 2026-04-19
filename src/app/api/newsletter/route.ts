import { NextRequest, NextResponse } from 'next/server';
import { db, subscribers } from '@/lib/db';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  let email: string | null = null;

  if (contentType.includes('application/json')) {
    const body = await req.json();
    email = body.email;
  } else {
    const form = await req.formData();
    email = form.get('email') as string;
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  }

  try {
    await db.insert(subscribers).values({ email }).onConflictDoNothing();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
