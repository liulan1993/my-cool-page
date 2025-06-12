import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

// Define a type for the log entries for type safety
// 为日志条目定义一个明确的类型接口以保证类型安全
interface LogEntry {
    question: string;
    timestamp: string;
}

// GET handler to export all chat histories
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
      if (keys) {
        allKeys.push(...keys);
      }

    } while (cursor !== 0);


    if (allKeys.length === 0) {
        return NextResponse.json({ message: "No chat histories found." });
    }

    // 2. Fetch all chat logs in batches to avoid overwhelming the API
    // 2. 为避免API超负荷，分批获取所有聊天记录
    const exportData: Record<string, LogEntry[]> = {};
    const batchSize = 10; // Process 10 keys at a time

    for (let i = 0; i < allKeys.length; i += batchSize) {
        const batchKeys = allKeys.slice(i, i + batchSize);
        const pipeline = batchKeys.map(key => ['LRANGE', key, 0, -1]);

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
            console.error(`Error fetching batch starting from key ${batchKeys[0]}:`, errorBody);
            continue; 
        }

        const histories = await multiExecResponse.json();

        // 3. Format the data for export
        // 3. 格式化数据以供导出
        // FIX: Added robust checking for the histories.result to prevent runtime errors.
        // 修复：增加了对histories.result的健壮性检查，以防止运行时错误。
        if (histories && histories.result && Array.isArray(histories.result)) {
            batchKeys.forEach((key, index) => {
                const userIdentifier = key.split(':')[1] || `unknown_user_${key}`;
                const userHistory: string[] | null = histories.result[index];
                
                if(Array.isArray(userHistory)) {
                    exportData[userIdentifier] = userHistory.map((entry: string): LogEntry => {
                        try {
                            return JSON.parse(entry);
                        } catch {
                            return { question: "Invalid JSON entry", timestamp: new Date().toISOString() };
                        }
                    });
                } else {
                     exportData[userIdentifier] = []; // Assign empty array if history is null
                }
            });
        }
    }
    
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
