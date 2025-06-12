import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

// GET handler to list all session IDs that have chat histories
export async function GET() {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      console.error('Vercel KV environment variables not set');
      return new NextResponse('Internal Server Error: KV configuration missing', { status: 500 });
    }

    // Scan for all keys matching the chat history pattern
    let cursor = 0;
    const allKeys: string[] = [];
    do {
      const scanResponse = await fetch(`${url}/scan/${cursor}/match/chats:*`, {
          headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!scanResponse.ok) {
          const errorBody = await scanResponse.json();
          console.error('Error scanning keys from Vercel KV:', errorBody);
          return new NextResponse('Internal Server Error: Failed to scan keys', { status: 500 });
      }
      
      const scanResult = await scanResponse.json();
      if (scanResult && Array.isArray(scanResult.result) && scanResult.result.length === 2) {
        cursor = scanResult.result[0];
        const keys: string[] = scanResult.result[1];
        if (keys && keys.length > 0) {
          allKeys.push(...keys);
        }
      } else {
        console.error("Unexpected scan result format from Vercel KV:", scanResult);
        cursor = 0; // Exit loop on unexpected format
      }
    } while (cursor !== 0);

    if (allKeys.length === 0) {
        return NextResponse.json({ sessions: [] });
    }
    
    // Extract just the session IDs from the full keys
    const sessionIds = allKeys.map(key => key.split('/')[1]).filter(Boolean);

    // Return the list of session IDs
    return NextResponse.json({ sessions: sessionIds });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('Error processing GET request to /api/export:', errorMessage);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
