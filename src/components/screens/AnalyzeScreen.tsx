import { useState, useRef, type DragEvent } from 'react';
import { ArrowLeft, UploadCloud, FileText, X, Search } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { CustomText } from '../ui/CustomText';
import { CustomCard } from '../ui/CustomCard';
import { CustomBadge } from '../ui/CustomBadge';
import { SkeletonStat } from '../ui/SkeletonPresets';
import { analyzeBatch } from '../../lib/tauri';
import type { BatchAnalysisResult, EmailFileInput } from '../../types/email';

interface AnalyzeScreenProps {
  onBack: () => void;
  onAnalysisComplete: (result: BatchAnalysisResult) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AnalyzeScreen({
  onBack,
  onAnalysisComplete,
}: AnalyzeScreenProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justDroppedRef = useRef(false);

  function addFiles(newFiles: FileList | File[]) {
    const incoming = Array.from(newFiles).filter(
      (f) => f.name.endsWith('.eml') || f.name.endsWith('.msg'),
    );
    setFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}_${f.size}`));
      const deduped = incoming.filter(
        (f) => !existingKeys.has(`${f.name}_${f.size}`),
      );
      return [...prev, ...deduped];
    });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
    justDroppedRef.current = true;
    setTimeout(() => {
      justDroppedRef.current = false;
    }, 300);
  }

  function handleDropzoneClick() {
    if (isDragOver || justDroppedRef.current) return;
    inputRef.current?.click();
  }

  function handleRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleStartAnalysis() {
    setError(null);
    setIsAnalyzing(true);

    try {
      const inputs: EmailFileInput[] = await Promise.all(
        files.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const bytes = Array.from(new Uint8Array(buffer));
          return { filename: file.name, raw_eml: bytes };
        }),
      );

      const result = await analyzeBatch(inputs);
      onAnalysisComplete(result);
    } catch (err) {
      setError(String(err));
      setIsAnalyzing(false);
    }
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[var(--color-ink)] px-6 py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          <CustomText variant="h4" align="center">
            Analyzing {files.length} email{files.length > 1 ? 's' : ''}…
          </CustomText>
          <CustomText variant="body-sm" color="muted" align="center">
            Checking headers, extracting links, cross-referencing indicators
          </CustomText>
          <div className="grid grid-cols-3 gap-3 w-full mt-4">
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ink)] px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <CustomButton
          label="Back"
          icon={<ArrowLeft size={16} />}
          variant="flat"
          size="sm"
          onClick={onBack}
          className="mb-6"
        />

        <CustomText as="h1" variant="h3" className="mb-1">
          New Analysis
        </CustomText>
        <CustomText variant="body-sm" color="muted" className="mb-8">
          Drop one or more .eml / .msg files, or browse to select them.
        </CustomText>

        {error && (
          <CustomCard
            variant="error"
            padding="md"
            shadow="none"
            className="mb-6"
          >
            <CustomText variant="body-sm" color="error">
              {error}
            </CustomText>
          </CustomCard>
        )}

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={handleDropzoneClick}
          className={[
            'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors duration-200 py-14 px-6 mb-6',
            isDragOver
              ? 'border-[var(--color-evidence)] bg-[var(--color-evidence)]/5'
              : 'border-[var(--color-line)] bg-[var(--color-ink-soft)] hover:border-[var(--color-paper-dim)]',
          ].join(' ')}
        >
          <UploadCloud
            size={36}
            className={
              isDragOver
                ? 'text-[var(--color-evidence)]'
                : 'text-[var(--color-paper-dim)]'
            }
          />
          <CustomText
            variant="body"
            color={isDragOver ? 'primary' : 'muted'}
            align="center"
          >
            {isDragOver
              ? 'Drop files here'
              : 'Drag & drop files, or click to browse'}
          </CustomText>
          <CustomText variant="caption" color="subtle">
            Supported formats: .eml, .msg
          </CustomText>
          <input
            ref={inputRef}
            type="file"
            accept=".eml,.msg"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {/* Selected files list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center justify-between mb-1">
              <CustomText variant="label" color="muted">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </CustomText>
              <CustomButton
                label="Clear all"
                variant="flat"
                size="xs"
                onClick={() => setFiles([])}
              />
            </div>

            {files.map((file, i) => (
              <CustomCard
                key={`${file.name}_${file.size}_${i}`}
                padding="sm"
                shadow="none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-[var(--color-paper-dim)] shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <CustomText variant="body-sm" truncate>
                      {file.name}
                    </CustomText>
                    <CustomText variant="caption" color="subtle">
                      {formatFileSize(file.size)}
                    </CustomText>
                  </div>
                  <CustomBadge
                    label={file.name.endsWith('.msg') ? 'MSG' : 'EML'}
                    variant="neutral"
                    size="xs"
                  />
                  <button
                    onClick={() => handleRemove(i)}
                    className="flex items-center justify-center w-7 h-7 rounded-full text-[var(--color-paper-dim)] hover:bg-white/10 hover:text-[var(--color-malicious)] transition-colors duration-150 shrink-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </CustomCard>
            ))}
          </div>
        )}

        <CustomButton
          label={
            files.length > 0
              ? `Analyze ${files.length} file${files.length > 1 ? 's' : ''}`
              : 'Analyze'
          }
          icon={<Search size={18} />}
          variant="primary"
          size="lg"
          fullWidth
          disabled={files.length === 0}
          onClick={handleStartAnalysis}
        />
      </div>
    </div>
  );
}
