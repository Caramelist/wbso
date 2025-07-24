import { NextRequest, NextResponse } from 'next/server';

const FIREBASE_FUNCTIONS_BASE_URL = process.env.FIREBASE_FUNCTIONS_URL || 'https://europe-west1-wbso-automation-platform.cloudfunctions.net';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Forward the request to the Firebase Function
    const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/startWBSOChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error proxying to Firebase Function:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 