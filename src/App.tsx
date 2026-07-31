import { useState } from 'react';
import { parseEmail } from './lib/tauri';
import type { EmailAnalysis } from './types/email';

function App() {
  const [result, setResult] = useState<EmailAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const parsed = await parseEmail(bytes);
      setResult(parsed);
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">
        OhMyPhishDetective! — Parser Test
      </h1>

      <input
        type="file"
        accept=".eml"
        onChange={handleFileChange}
        className="mb-6 block"
      />

      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      {result && (
        <pre className="bg-slate-800 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
