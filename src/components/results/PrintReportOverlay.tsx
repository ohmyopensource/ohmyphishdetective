import { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { PrintReport } from './PrintReport';
import { CustomButton } from '../ui/CustomButton';
import type { BatchAnalysisResult } from '../../types/email';

interface PrintReportOverlayProps {
  result: BatchAnalysisResult;
  onClose: () => void;
}

export function PrintReportOverlay({
  result,
  onClose,
}: PrintReportOverlayProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const generatedAt = useRef(new Date()).current;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-report-overlay">
      <div className="print-report-toolbar">
        <CustomButton
          label="Close"
          icon={<X size={16} />}
          variant="ghost"
          size="sm"
          onClick={onClose}
        />
        <CustomButton
          label="Print / Save as PDF"
          icon={<Printer size={16} />}
          variant="primary"
          size="sm"
          onClick={handlePrint}
        />
      </div>
      <PrintReport ref={reportRef} result={result} generatedAt={generatedAt} />
    </div>
  );
}
