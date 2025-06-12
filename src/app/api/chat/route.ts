import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

const CHAT_SESSION_KEY = 'chat_history:main_session';

// GET handler to fetch chat history
export async function GET() {
  try {
    const history = await kv.lrange<string>(CHAT_SESSION_KEY, 0, -1);
    const parsedHistory = history.map(item => JSON.parse(item));
    return NextResponse.json(parsedHistory);
  } catch (error) {
    console.error('Error fetching chat history from Vercel KV:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST handler to save a new message
export async function POST(request: Request) {
  try {
    const message = await request.json();
    if (!message || !message.role || !message.text) {
      return new NextResponse('Bad Request: Invalid message format', { status: 400 });
    }
    
    await kv.rpush(CHAT_SESSION_KEY, JSON.stringify(message));
    
    // Optional: Trim the list to keep it from growing indefinitely
    // 可选：修剪列表以防止其无限增长
    await kv.ltrim(CHAT_SESSION_KEY, -100, -1); // Keep the last 100 messages

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error saving message to Vercel KV:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
