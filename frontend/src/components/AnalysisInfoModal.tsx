import { Beaker, FlaskConical, TestTube2, X } from 'lucide-react';

interface AnalysisInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export const AnalysisInfoModal = ({ open, onClose }: AnalysisInfoModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-xl border border-amber-500/40 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-amber-400">Bilgilendirme</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <p className="text-amber-200 font-medium mb-2">Bilgilendirme ve Kabul Kriterleri</p>
          <p className="text-slate-200 leading-relaxed">
            Bazı analiz ve çalışmalar paketlenmiş olarak gelen numuneye uygulanır. Numunelerin kabul kriterlerine uygun ambalajlarda teslim edilmesi zorunludur.
          </p>
        </div>

        <p className="text-slate-300 font-semibold mb-4">Laboratuvar Numune Tüpü Rehberi</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2 bg-slate-700/70 rounded-lg p-4">
            <FlaskConical className="w-10 h-10 text-sky-400" />
            <span className="text-xs text-slate-300 text-center">Cam tüp</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-slate-700/70 rounded-lg p-4">
            <TestTube2 className="w-10 h-10 text-emerald-400" />
            <span className="text-xs text-slate-300 text-center">Laboratuvar tüpü</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-slate-700/70 rounded-lg p-4">
            <Beaker className="w-10 h-10 text-violet-400" />
            <span className="text-xs text-slate-300 text-center">Hazırlık kabı</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold"
        >
          Anladım
        </button>
      </div>
    </div>
  );
};
