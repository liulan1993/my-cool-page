import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge'; // Specify the runtime for Vercel

// GET handler to export all chat histories
export async function GET(request: NextRequest) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      console.error('Vercel KV environment variables not set');
      return new NextResponse('Internal Server Error: KV configuration missing', { status: 500 });
    }

    // 1. Scan for all keys matching the chat history pattern
    // 1. 扫描所有匹配聊天记录模式的键
    const scanResponse = await fetch(`${url}/scan/0/match/chat_history:*`, {
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
    const keys: string[] = scanResult.result[1];

    if (!keys || keys.length === 0) {
        return NextResponse.json({ message: "No chat histories found." });
    }

    // 2. Fetch all chat logs for each key
    // 2. 获取每个键的所有聊天记录
    const pipeline = keys.map(key => ['LRANGE', key, 0, -1]);

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
    const exportData: Record<string, any[]> = {};
    keys.forEach((key, index) => {
        const userIdentifier = key.split(':')[1] || 'unknown_user';
        const userHistory = histories.result[index] || [];
        exportData[userIdentifier] = userHistory.map((entry: string) => JSON.parse(entry));
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

  } catch (error) {
    console.error('Error processing GET request to /api/export:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
