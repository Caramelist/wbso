import { NextRequest, NextResponse } from 'next/server';

// MAINTENANCE MODE - Disable debug endpoint completely
const MAINTENANCE_MODE = true;

export async function GET(request: NextRequest) {
  if (MAINTENANCE_MODE) {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint uitgeschakeld tijdens onderhoud',
      maintenance: true
    }, { status: 503 });
  }

  // Original debug code disabled for security
  return NextResponse.json({
    success: false,
    error: 'Debug endpoint disabled'
  }, { status: 404 });
} 