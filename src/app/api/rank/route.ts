// app/api/rank/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// 캐싱 방지 (항상 최신 데이터 불러오기)
export const dynamic = 'force-dynamic';

// 랭킹 불러오기 (GET)
export async function GET() {
  try {
    const data = await kv.get('gw_rankings');
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

// 랭킹 저장하기 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 데이터베이스에 저장
    await kv.set('gw_rankings', body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}