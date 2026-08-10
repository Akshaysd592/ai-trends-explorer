import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const topic = searchParams.get('topic') || 'artificial-intelligence';
  const language = searchParams.get('language') || '';
  const sort = searchParams.get('sort') || 'stars';

  const params = new URLSearchParams({
    page,
    limit,
    topic,
    sort,
  });
  if (language) params.set('language', language);

  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/trends?${params.toString()}`, {
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
      { error: `Failed to fetch trends: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    );
  }
}