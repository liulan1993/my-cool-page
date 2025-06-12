'use client';

import { useState } from 'react';

export default function ExportPage() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('获取会话列表失败');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('发生未知错误');
      }
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">聊天记录导出</h1>
        <p className="text-gray-600 mb-6">
          点击下面的按钮来获取所有用户的会话列表。然后，您可以点击每个会话ID来单独下载该用户的聊天记录。
        </p>
        <button
          onClick={handleFetchSessions}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? '正在加载...' : '获取会话列表'}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {sessions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">可下载的会话:</h2>
            <ul className="space-y-2">
              {sessions.map((sessionId) => (
                <li key={sessionId} className="bg-gray-50 p-3 rounded-md">
                  <a
                    href={`/api/export/${sessionId}`}
                    download
                    className="text-blue-600 hover:underline font-mono text-sm"
                  >
                    {sessionId}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
