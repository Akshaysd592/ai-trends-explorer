import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  const params = new URLSearchParams();
  if (query) params.set('q', query);

  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/trends/search?${params.toString()}`, {
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
      { error: `Failed to search trends: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    );
  }
}
