import { NextRequest, NextResponse } from 'next/server';

// Google API 연결 테스트
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    // 직접 fetch로 Google API 테스트
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log('Testing Google API connection...');
    console.log('URL:', testUrl.replace(apiKey, 'AIza***'));

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: data.error?.message || JSON.stringify(data),
      }, { status: response.status });
    }

    // 사용 가능한 모델 목록 추출
    const models = data.models?.map((m: { name: string }) => m.name) || [];
    console.log('Available models:', models);

    return NextResponse.json({
      success: true,
      modelsCount: models.length,
      models: models.slice(0, 10), // 처음 10개만
    });

  } catch (error) {
    console.error('Network error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      error: `Network error: ${errorMessage}`,
      hint: '방화벽이나 프록시 설정을 확인하세요.',
    }, { status: 500 });
  }
}
