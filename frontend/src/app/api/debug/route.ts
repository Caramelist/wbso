import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebase: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      configured: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    },
    functions: {
      customUrl: process.env.FIREBASE_FUNCTIONS_URL,
      expectedRegionalUrl: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
        ? `https://europe-west1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`
        : 'PROJECT_ID_NOT_SET',
      possibleUrls: [
        process.env.FIREBASE_FUNCTIONS_URL,
        'https://europe-west1-wbso-automation-platform.cloudfunctions.net',
        'https://us-central1-wbso-automation-platform.cloudfunctions.net',
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
          ? `https://europe-west1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`
          : null
      ].filter(Boolean)
    },
    deployment: {
      host: request.headers.get('host'),
      url: request.url,
      origin: request.headers.get('origin'),
    }
  };

  return NextResponse.json(debugInfo, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
} 