import { NextResponse } from 'next/server';

// In-memory history as placeholder. Replace with DB logic.
let history: any[] = [];

export async function GET() {
  return NextResponse.json(history);
}

export async function POST(req: Request) {
  const item = await req.json();
  history.unshift(item);
  return NextResponse.json({ success: true });
}