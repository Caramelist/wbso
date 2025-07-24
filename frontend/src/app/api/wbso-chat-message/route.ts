import { NextRequest, NextResponse } from 'next/server';

// GDPR COMPLIANCE: Only EU regions for Firebase Functions - UPDATED WITH DEPLOYED URLS
const POSSIBLE_FIREBASE_URLS = [
  process.env.FIREBASE_FUNCTIONS_URL,
  'https://europe-west1-wbso-application.cloudfunctions.net', // Legacy format
  'https://processwbsochatmessage-z44g5hzbna-ew.a.run.app' // New Cloud Run format - CONFIRMED DEPLOYED
].filter((url): url is string => Boolean(url));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    console.log('Chat Message API Route called');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Try different Firebase Functions URLs
    let lastError: Error | null = null;
    
    for (const functionUrl of POSSIBLE_FIREBASE_URLS) {
      try {
        // For the new Cloud Run URLs, use the URL directly
        // For legacy URLs, append the function name
        const requestUrl = functionUrl.includes('run.app') 
          ? functionUrl 
          : `${functionUrl}/processWBSOChatMessage`;

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        } else {
          const errorText = await response.text();
          console.log('Error response from Firebase Function:', response.status, errorText);
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        const err = error as Error;
        console.log('Network/fetch error:', err.message);
        lastError = err;
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Firebase Functions not accessible',
        debug: {
          lastError: lastError?.message
        }
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        debug: {
          message: (error as Error).message
        }
      },
      { status: 500 }
    );
  }
} 