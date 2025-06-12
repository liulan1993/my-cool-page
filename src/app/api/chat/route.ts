import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

// Define an interface for the expected request body for type safety.
// 为请求体定义一个明确的接口，以保证类型安全。
interface ChatRequestBody {
    message: {
        role: 'user'; // We only care about user messages for logging
        text: string;
    };
    sessionId: string;
}

// POST handler to save a new message
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, sessionId } = body;

    // Requirement 2: Only save messages from the user.
    // 需求2：只保存来自用户的消息。
    if (!message || message.role !== 'user' || !message.text || !sessionId) {
      // If it's an AI response, invalid, or missing session ID, return OK.
      // 如果是AI的回复、格式无效或缺少会话ID，直接返回成功。
      return new NextResponse('OK (Not logged)', { status: 200 });
    }
    
    // UPDATE: Use a folder-like naming convention for keys.
    // 更新：为键使用类似文件夹的命名约定。
    const userChatHistoryKey = `chats/${sessionId}`;

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
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('Error processing POST request to /api/chat:', errorMessage);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
