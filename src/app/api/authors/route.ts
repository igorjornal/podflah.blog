import { NextResponse } from 'next/server';
import { db, authors } from '@/lib/db';

export async function GET() {
  const all = await db.select().from(authors);
  return NextResponse.json(all);
}
