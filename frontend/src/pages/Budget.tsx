import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Wallet } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { api } from '../lib/axios';

interface BudgetProject {
  id: string;
  name: string;
  limitAmount: number;
  spentAmount: number;
  remaining: number;
  percent: number;
  payments: Payment[];
}

interface Payment {
  id: string;
  dekontNo: string;
  amount: number;
  paymentDate: string;
}

interface BudgetSummary {
  totalSpent: number;
  totalLimit: number;
  pendingPayments: number;
  approvedBudget: number;
  analysisCount: number;
  orderCount: number;
}

const formatTry = (value: number) =>
  value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const Budget = () => {
  const [projects, setProjects] = useState<BudgetProject[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [projectsRes, summaryRes] = await Promise.all([
          api.get('/budget'),
          api.get('/budget/summary'),
        ]);
        
        const projectsData = projectsRes?.data;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setSummary(summaryRes?.data || null);
      } catch (err) {
        console.error('Bütçe bilgileri yüklenemedi:', err);
        setError('Bütçe bilgileri yüklenirken bir hata oluştu.');
        toast.error('Bütçe bilgileri yüklenemedi');
        setProjects([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Calculate summary values
  const totalBalance = summary?.totalLimit ? summary.totalLimit - summary.totalSpent : (projects || []).reduce((sum, p) => sum + (p?.remaining || 0), 0);
  const pendingPayments = summary?.pendingPayments ?? (projects || []).reduce((sum, p) => sum + (p?.limitAmount - p?.spentAmount || 0), 0);
  const completedPayments = summary?.totalSpent ?? (projects || []).reduce((sum, p) => sum + (p?.spentAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />

      <div className="ml-64 pt-16 p-8">
        <div className="flex items-center gap-3 mb-8">
          <Wallet className="w-8 h-8 text-accent-500" />
          <h1 className="text-3xl font-bold">Bütçe ve Ödemeler</h1>
        </div>

        {loading ? (
          <p className="text-slate-400 text-xl">Bütçe bilgileri yükleniyor...</p>
        ) : error ? (
          <div className="text-red-400 text-xl">{error}</div>
        ) : !projects || projects.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-400 text-xl">Henüz bir ödeme veya bütçe kaydı bulunmamaktadır</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 mb-2">Toplam Bakiye</p>
                <p className="text-3xl font-bold text-emerald-400">{formatTry(totalBalance)}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 mb-2">Bekleyen Ödemeler</p>
                <p className="text-3xl font-bold text-orange-400">{formatTry(pendingPayments)}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <p className="text-slate-400 mb-2">Gerçekleşen Ödemeler</p>
                <p className="text-3xl font-bold text-blue-400">{formatTry(completedPayments)}</p>
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">İşlem Geçmişi</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Tarih</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">İşlem Tipi</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Tutar</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(projects || []).flatMap((project) =>
                      (project?.payments || []).map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">{formatDate(payment.paymentDate)}</td>
                          <td className="py-3 px-4">Ödeme</td>
                          <td className="py-3 px-4 text-right">{formatTry(payment.amount)}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                              Tamamlandı
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {projects.every((p) => !p?.payments || p.payments.length === 0) && (
                  <div className="py-8 text-center text-slate-400">
                    Henüz işlem geçmişi bulunmamaktadır
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            {projects.map((project) => (
              <div key={project.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <span className="text-sm text-slate-400">{project.percent}% kullanıldı</span>
                </div>

                <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all ${
                      project.percent >= 90 ? 'bg-red-500' : project.percent >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${project.percent}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-700/60 rounded-lg p-4">
                    <p className="text-slate-400 mb-1">Toplam Limit</p>
                    <p className="text-lg font-semibold">{formatTry(project.limitAmount)}</p>
                  </div>
                  <div className="bg-slate-700/60 rounded-lg p-4">
                    <p className="text-slate-400 mb-1">Harcanan</p>
                    <p className="text-lg font-semibold text-orange-400">{formatTry(project.spentAmount)}</p>
                  </div>
                  <div className="bg-slate-700/60 rounded-lg p-4">
                    <p className="text-slate-400 mb-1">Kalan Bütçe</p>
                    <p className="text-lg font-semibold text-emerald-400">{formatTry(project.remaining)}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
