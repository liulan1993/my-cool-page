import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

// POST handler to save a new message
export async function POST(request: NextRequest) { // Use NextRequest to access IP
  try {
    const message = await request.json();
    
    // Requirement 2: Only save messages from the user.
    // 需求2：只保存来自用户的消息。
    if (!message || message.role !== 'user' || !message.text) {
      // If it's an AI response or invalid, return OK without saving.
      // 如果是AI的回复或格式无效，直接返回成功，不进行保存。
      return new NextResponse('OK (AI response - not logged)', { status: 200 });
    }
    
    // Requirement 1: Differentiate logs by user's IP address.
    // 需求1：根据用户的IP地址区分日志。
    const ip = request.ip || 'unknown';
    const userChatHistoryKey = `chat_history:${ip}`;

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        console.error('Vercel KV environment variables not set');
        return new NextResponse('Internal Server Error: KV configuration missing', { status: 500 });
    }

    // Prepare the data to be saved: user's question with a timestamp.
    // 准备要保存的数据：用户的问题和一个时间戳。
    const logEntry = {
        question: message.text,
        timestamp: new Date().toISOString(),
    };

    // 1. Save the new user message using RPUSH command
    const saveResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(['RPUSH', userChatHistoryKey, JSON.stringify(logEntry)])
    });

    if (!saveResponse.ok) {
        const errorBody = await saveResponse.json();
        console.error('Error saving message to Vercel KV:', errorBody);
        return new NextResponse('Internal Server Error: Failed to save message', { status: 500 });
    }

    // 2. Trim the list for this specific user to keep the last 50 questions
    const trimResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(['LTRIM', userChatHistoryKey, -50, -1])
    });
    
    if (!trimResponse.ok) {
        // Log the trim error but don't fail the request, as saving is more critical
        const errorBody = await trimResponse.json();
        console.error('Error trimming chat history in Vercel KV:', errorBody);
    }

    return new NextResponse('OK (User question logged)', { status: 200 });
  } catch (error) {
    console.error('Error processing POST request to /api/chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
