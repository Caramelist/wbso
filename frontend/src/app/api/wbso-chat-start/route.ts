import { NextRequest, NextResponse } from 'next/server';

// GDPR COMPLIANCE: Only EU regions for Firebase Functions - VERIFIED WORKING URLS
const POSSIBLE_FIREBASE_URLS = [
  process.env.FIREBASE_FUNCTIONS_URL,
  'https://europe-west1-wbso-application.cloudfunctions.net' // Belgium - CONFIRMED DEPLOYED
].filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    console.log('API Route called with body:', JSON.stringify(body, null, 2));
    console.log('Auth header present:', !!authHeader);
    console.log('Available URLs:', POSSIBLE_FIREBASE_URLS);

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
        console.log('Making request with auth header:', authHeader?.substring(0, 20) + '...');

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(body),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('SUCCESS: Got valid response from Firebase Function');
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