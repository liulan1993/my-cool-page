import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

const CHAT_SESSION_KEY = 'chat_history_for_admin'; // Use a distinct key for admin-facing history

// This API route is now only for saving messages for admin review.
// GET handler is removed as the client will not fetch history.
// 此API路由现在仅用于保存消息供管理员审查。
// GET处理程序已移除，因为客户端不再获取历史记录。

// POST handler to save a new message
export async function POST(request: Request) {
  try {
    const message = await request.json();
    if (!message || !message.role || !message.text) {
      return new NextResponse('Bad Request: Invalid message format', { status: 400 });
    }
    
    // FIX: Use fetch with the Vercel KV REST API instead of the @vercel/kv package.
    // 修复：使用fetch和Vercel KV的REST API，以替代@vercel/kv包。
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        console.error('Vercel KV environment variables not set');
        return new NextResponse('Internal Server Error: KV configuration missing', { status: 500 });
    }

    // 1. Save the new message using RPUSH command
    const saveResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(['RPUSH', CHAT_SESSION_KEY, JSON.stringify(message)])
    });

    if (!saveResponse.ok) {
        const errorBody = await saveResponse.json();
        console.error('Error saving message to Vercel KV:', errorBody);
        return new NextResponse('Internal Server Error: Failed to save message', { status: 500 });
    }

    // 2. Trim the list to keep it from growing indefinitely using LTRIM command
    const trimResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(['LTRIM', CHAT_SESSION_KEY, -200, -1])
    });
    
    if (!trimResponse.ok) {
        // Log the trim error but don't fail the request, as saving is more critical
        const errorBody = await trimResponse.json();
        console.error('Error trimming chat history in Vercel KV:', errorBody);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing POST request to /api/chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
