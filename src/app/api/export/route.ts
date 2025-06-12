import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

// Define a type for the log entries for type safety
// 为日志条目定义一个明确的类型接口以保证类型安全
interface LogEntry {
    question: string;
    timestamp: string;
}

// GET handler to export all chat histories
// FIX: Removed unused 'request' parameter to resolve the 'no-unused-vars' error.
// 修复：移除未使用的'request'参数以解决'no-unused-vars'错误。
export async function GET() {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      console.error('Vercel KV environment variables not set');
      return new NextResponse('Internal Server Error: KV configuration missing', { status: 500 });
    }

    // 1. Scan for all keys matching the chat history pattern
    // 1. 扫描所有匹配聊天记录模式的键
    // We'll scan in batches in case there are many keys.
    // 我们将分批扫描，以防有大量的键。
    let cursor = 0;
    const allKeys: string[] = [];
    do {
      const scanResponse = await fetch(`${url}/scan/${cursor}/match/chat_history:*`, {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!scanResponse.ok) {
          const errorBody = await scanResponse.json();
          console.error('Error scanning keys from Vercel KV:', errorBody);
          return new NextResponse('Internal Server Error: Failed to scan keys', { status: 500 });
      }
      
      const scanResult = await scanResponse.json();
      cursor = scanResult.result[0];
      const keys: string[] = scanResult.result[1];
      allKeys.push(...keys);

    } while (cursor !== 0);


    if (allKeys.length === 0) {
        return NextResponse.json({ message: "No chat histories found." });
    }

    // 2. Fetch all chat logs for each key using a pipeline for efficiency
    // 2. 使用pipeline高效地获取每个键的所有聊天记录
    const pipeline = allKeys.map(key => ['LRANGE', key, 0, -1]);

    const multiExecResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipeline)
    });
    
    if (!multiExecResponse.ok) {
        const errorBody = await multiExecResponse.json();
        console.error('Error fetching histories with pipeline from Vercel KV:', errorBody);
        return new NextResponse('Internal Server Error: Failed to fetch histories', { status: 500 });
    }

    const histories = await multiExecResponse.json();

    // 3. Format the data for export
    // 3. 格式化数据以供导出
    // FIX: Replaced 'any[]' with the specific 'LogEntry[]' type.
    // 修复：将 'any[]' 替换为更具体的 'LogEntry[]' 类型。
    const exportData: Record<string, LogEntry[]> = {};
    allKeys.forEach((key, index) => {
        // Extract the user identifier (session ID or IP) from the key
        const userIdentifier = key.split(':')[1] || `unknown_user_${index}`;
        const userHistory: string[] = histories.result[index] || [];
        // Parse each entry from a JSON string to an object
        exportData[userIdentifier] = userHistory.map((entry: string): LogEntry => JSON.parse(entry));
    });
    
    // 4. Return as a JSON file download
    // 4. 作为JSON文件下载返回
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="chat_histories_export_${new Date().toISOString()}.json"`,
      },
    });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('Error processing GET request to /api/export:', errorMessage);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
