import { NextResponse } from 'next/server';
import { debugConnections } from '@/lib/debug-connections';

export async function GET() {
  try {
    const debug = await debugConnections();
    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to debug connections', details: error },
      { status: 500 }
    );
  }
}