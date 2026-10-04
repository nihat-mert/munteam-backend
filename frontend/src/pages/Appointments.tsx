import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { api } from '../lib/axios';

const CIHAZLAR = ['SEM CİHAZI', 'UV-VIS SPEKTROFOTOMETRE', 'AAS CİHAZI'] as const;

interface Appointment {
  id: string;
  cihazAdi: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  status: string;
  aciklama?: string | null;
}

const emptyForm = {
  cihazAdi: '',
  baslangicTarihi: '',
  bitisTarihi: '',
  baslangicSaati: '09:00',
  bitisSaati: '10:00',
  aciklama: '',
};

function combineLocal(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function formatRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return `${start.toLocaleString('tr-TR', opts)} → ${end.toLocaleString('tr-TR', opts)}`;
}

export const Appointments = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'form' | 'list'>('form');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadList = async () => {
    try {
      setLoadingList(true);
      const response = await api.get('/appointments/my');
      setAppointments(response.data);
    } catch {
      toast.error('Randevular yüklenemedi');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      void loadList();
    }
  }, [view]);

  const save = async () => {
    if (!form.cihazAdi) {
      toast.error('Lütfen cihaz seçin');
      return false;
    }
    if (!form.baslangicTarihi || !form.bitisTarihi) {
      toast.error('Başlangıç ve bitiş tarihlerini girin');
      return false;
    }
    const start = combineLocal(form.baslangicTarihi, form.baslangicSaati);
    const end = combineLocal(form.bitisTarihi, form.bitisSaati);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error('Geçerli tarih ve saat girin');
      return false;
    }
    if (end <= start) {
      toast.error('Bitiş, başlangıçtan sonra olmalıdır');
      return false;
    }

    try {
      setSaving(true);
      await api.post('/appointments', {
        cihazAdi: form.cihazAdi,
        baslangicTarihi: start.toISOString(),
        bitisTarihi: end.toISOString(),
        aciklama: form.aciklama,
      });
      toast.success('Randevu kaydedildi');
      return true;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string | string[] } } };
      const message = axiosError.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message || 'Randevu kaydedilemedi');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndList = async () => {
    const ok = await save();
    if (ok) {
      setForm(emptyForm);
      setView('list');
    }
  };

  const handleSaveAndNew = async () => {
    const ok = await save();
    if (ok) {
      setForm(emptyForm);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />

      <div className="ml-64 pt-16 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-8 h-8 text-accent-500" />
            <h1 className="text-3xl font-bold">Cihaz Randevuları</h1>
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('form')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Yeni Randevu
            </button>
          )}
        </div>

        {view === 'form' ? (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Cihaz Adı</label>
                <select
                  value={form.cihazAdi}
                  onChange={(e) => setForm({ ...form, cihazAdi: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                >
                  <option value="">-boş-</option>
                  {CIHAZLAR.map((cihaz) => (
                    <option key={cihaz} value={cihaz}>
                      {cihaz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Randevu Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={form.baslangicTarihi}
                  onChange={(e) => setForm({ ...form, baslangicTarihi: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Randevu Bitiş Tarihi</label>
                <input
                  type="date"
                  value={form.bitisTarihi}
                  onChange={(e) => setForm({ ...form, bitisTarihi: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Başlangıç Saati</label>
                <input
                  type="time"
                  value={form.baslangicSaati}
                  onChange={(e) => setForm({ ...form, baslangicSaati: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bitiş Saati</label>
                <input
                  type="time"
                  value={form.bitisSaati}
                  onChange={(e) => setForm({ ...form, bitisSaati: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Analiz Hakkında Bilgi</label>
                <input
                  type="text"
                  value={form.aciklama}
                  onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
                  placeholder="Analiz hakkında kısa bilgi"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveAndList()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold"
              >
                Kaydet ve Listeye Dön
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveAndNew()}
                className="px-5 py-3 bg-slate-500 hover:bg-slate-400 disabled:opacity-50 rounded-lg font-semibold"
              >
                Kaydet ve Yeni Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('list');
                }}
                className="px-5 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold"
              >
                Geri Dön
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            {loadingList ? (
              <p className="text-slate-400">Yükleniyor...</p>
            ) : appointments.length === 0 ? (
              <p className="text-slate-400">Henüz randevu yok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300">Cihaz</th>
                      <th className="text-left py-3 px-4 text-slate-300">Tarih / Saat</th>
                      <th className="text-left py-3 px-4 text-slate-300">Durum</th>
                      <th className="text-left py-3 px-4 text-slate-300">Bilgi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr key={item.id} className="border-b border-slate-700">
                        <td className="py-3 px-4">{item.cihazAdi}</td>
                        <td className="py-3 px-4">{formatRange(item.baslangicTarihi, item.bitisTarihi)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === 'ONAYLANDI' ? 'bg-green-600 text-white' :
                            item.status === 'REDDEDILDI' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{item.aciklama || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-5 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold"
            >
              Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
