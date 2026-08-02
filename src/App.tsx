import { useState } from 'react';
import { parseEmail, analyzeBatch } from './lib/tauri';
import type {
  EmailAnalysis,
  BatchAnalysisResult,
  EmailFileInput,
} from './types/email';

function App() {
  const [result, setResult] = useState<EmailAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [batchResult, setBatchResult] = useState<BatchAnalysisResult | null>(
    null,
  );
  const [batchError, setBatchError] = useState<string | null>(null);

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

  async function handleBatchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBatchError(null);
    setBatchResult(null);

    try {
      const inputs: EmailFileInput[] = await Promise.all(
        Array.from(files).map(async (file) => {
          const buffer = await file.arrayBuffer();
          const bytes = Array.from(new Uint8Array(buffer));
          return { filename: file.name, raw_eml: bytes };
        }),
      );

      const batch = await analyzeBatch(inputs);
      setBatchResult(batch);
    } catch (err) {
      setBatchError(String(err));
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-6">
          OhMyPhishDetective! — Single File Test
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
          <pre className="bg-slate-800 p-4 rounded overflow-auto text-sm max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-6">
          Batch Test (select multiple .eml files)
        </h1>
        <input
          type="file"
          accept=".eml"
          multiple
          onChange={handleBatchChange}
          className="mb-6 block"
        />
        {batchError && (
          <div className="bg-red-900 text-red-200 p-4 rounded mb-4">
            Error: {batchError}
          </div>
        )}
        {batchResult && (
          <>
            <div className="bg-slate-800 p-4 rounded mb-4">
              <p>Total: {batchResult.summary.total_emails}</p>
              <p>
                Clean: {batchResult.summary.clean_count} (
                {batchResult.summary.clean_percentage.toFixed(1)}%)
              </p>
              <p>
                Suspicious: {batchResult.summary.suspicious_count} (
                {batchResult.summary.suspicious_percentage.toFixed(1)}%)
              </p>
              <p>
                Malicious: {batchResult.summary.malicious_count} (
                {batchResult.summary.malicious_percentage.toFixed(1)}%)
              </p>
              <p>Recurring IOCs: {batchResult.summary.recurring_iocs.length}</p>
            </div>
            <pre className="bg-slate-800 p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(batchResult, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
