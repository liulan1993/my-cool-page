import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge';

interface LogEntry {
    question: string;
    timestamp: string;
}

// GET handler to export a single user's chat history
// FIX: Corrected the function signature for a dynamic route handler in Next.js App Router.
// 修复：修正了Next.js App Router中动态路由处理程序的函数签名。
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    if (!sessionId) {
      return new NextResponse('Bad Request: Session ID is required', { status: 400 });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      console.error('Vercel KV environment variables not set');
      return new NextResponse('Internal Server Error: KV configuration missing', { status: 500 });
    }

    const userChatHistoryKey = `chats/${sessionId}`;
    
    const historyResponse = await fetch(`${url}/lrange/${userChatHistoryKey}/0/-1`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!historyResponse.ok) {
        const errorBody = await historyResponse.json();
        console.error(`Error fetching history for session ${sessionId}:`, errorBody);
        return new NextResponse('Internal Server Error: Failed to fetch history', { status: 500 });
    }

    const historyResult = await historyResponse.json();
    const history: string[] | null = historyResult.result;

    if (!history || history.length === 0) {
        return NextResponse.json({ message: `No history found for session ${sessionId}.` });
    }

    const exportData: LogEntry[] = history.map((entry: string): LogEntry | null => {
        try {
            const parsed = JSON.parse(entry);
            if (parsed && typeof parsed.question === 'string' && typeof parsed.timestamp === 'string') {
                return parsed;
            }
            return null;
        } catch {
            return null;
        }
    }).filter((item): item is LogEntry => item !== null);

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="chat_history_${sessionId}.json"`,
      },
    });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('Error processing GET request for single session export:', errorMessage);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
