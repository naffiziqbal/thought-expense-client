'use client';

import { useState, useEffect } from 'react';

const CURL_TEXT = "curl -X POST /api/expenses \\\n  -d '{\"item\":\"Server\",\"cost\":50}'";
const RESPONSE_TEXT = 'HTTP/1.1 200 OK\n{ "id": "ex_01", "category": "Infrastructure" }';

export function TerminalHero() {
  const [curlVisible, setCurlVisible] = useState('');
  const [responseVisible, setResponseVisible] = useState('');
  const [phase, setPhase] = useState<'curl' | 'response'>('curl');

  useEffect(() => {
    if (phase === 'curl') {
      if (curlVisible.length < CURL_TEXT.length) {
        const t = setTimeout(() => {
          setCurlVisible(CURL_TEXT.slice(0, curlVisible.length + 1));
        }, 40);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('response'), 800);
      return () => clearTimeout(t);
    }
    if (responseVisible.length < RESPONSE_TEXT.length) {
      const t = setTimeout(() => {
        setResponseVisible(RESPONSE_TEXT.slice(0, responseVisible.length + 1));
      }, 30);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCurlVisible('');
      setResponseVisible('');
      setPhase('curl');
    }, 4000);
    return () => clearTimeout(t);
  }, [phase, curlVisible, responseVisible]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#0B1220] shadow-lg transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
      </div>
      <div className="font-mono text-sm text-gray-300 p-4">
        <pre className="whitespace-pre-wrap break-all">
          <span className="text-teal-400">$</span> {curlVisible}
          <span className="animate-pulse">|</span>
        </pre>
        {phase === 'response' && (
          <pre className="mt-2 whitespace-pre-wrap break-all text-green-400/90">
            {responseVisible}
            <span className="animate-pulse">|</span>
          </pre>
        )}
      </div>
    </div>
  );
}
