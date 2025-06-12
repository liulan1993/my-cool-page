import { kv } from '@vercel/kv';
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
    
    await kv.rpush(CHAT_SESSION_KEY, JSON.stringify(message));
    
    // Optional: Trim the list to keep it from growing indefinitely
    // 可选：修剪列表以防止其无限增长
    await kv.ltrim(CHAT_SESSION_KEY, -200, -1); // Keep the last 200 messages for review

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error saving message to Vercel KV:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
