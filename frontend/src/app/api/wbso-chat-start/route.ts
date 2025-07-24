import { NextRequest, NextResponse } from 'next/server';

// GDPR COMPLIANCE: Only EU regions for Firebase Functions
const POSSIBLE_FIREBASE_URLS = [
  process.env.FIREBASE_FUNCTIONS_URL,
  'https://europe-west1-wbso-application.cloudfunctions.net', // Belgium
  'https://europe-west3-wbso-application.cloudfunctions.net'  // Frankfurt
].filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    console.log('API Route called with body:', JSON.stringify(body, null, 2));
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Try different Firebase Functions URLs
    let lastError: Error | null = null;
    
    for (const baseUrl of POSSIBLE_FIREBASE_URLS) {
      try {
        const functionUrl = `${baseUrl}/startWBSOChat`;
        console.log('Trying Firebase Function URL:', functionUrl);

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(body),
        });

        console.log('Firebase Function response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Firebase Function response data:', data);
          return NextResponse.json(data, { status: response.status });
        } else {
          const errorText = await response.text();
          console.log('Firebase Function error response:', errorText);
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.log('Error with URL', baseUrl, ':', error);
        lastError = error as Error;
        continue; // Try next URL
      }
    }

    // If all URLs failed, return error
    console.error('All Firebase Function URLs failed. Last error:', lastError?.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Firebase Functions not accessible',
        debug: {
          testedUrls: POSSIBLE_FIREBASE_URLS,
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