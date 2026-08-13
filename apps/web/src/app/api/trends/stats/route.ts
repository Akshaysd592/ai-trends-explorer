import { NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/trends/stats`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API Gateway responded with ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch dashboard stats: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    );
  }
}