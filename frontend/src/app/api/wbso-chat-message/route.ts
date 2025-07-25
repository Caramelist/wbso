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
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        const err = error as Error;
        lastError = err;
      }
    }

    // SECURITY: Sanitized error response without debug information
    return NextResponse.json(
      { 
        success: false, 
        error: 'Service temporarily unavailable'
      },
      { status: 503 }
    );

  } catch (error) {
    // SECURITY: Generic error message without system details
    return NextResponse.json(
      { 
        success: false, 
        error: 'Request failed'
      },
      { status: 500 }
    );
  }
} 