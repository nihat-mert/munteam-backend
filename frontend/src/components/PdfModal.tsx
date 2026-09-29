interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export const PdfModal = ({ isOpen, onClose, pdfUrl, title }: PdfModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{title || 'PDF Preview'}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex-1 p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 rounded"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
};
