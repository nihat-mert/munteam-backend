import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/axios';
import toast from 'react-hot-toast';

interface AnalysisType {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

type TabType = 'analysis' | 'general';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
  });

  useEffect(() => {
    if (activeTab === 'analysis') {
      fetchAnalysisTypes();
      fetchCategories();
    }
  }, [activeTab]);

  const fetchAnalysisTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AnalysisType[]>('/analysis-types');
      setAnalysisTypes(response.data);
    } catch (err) {
      setError('Analiz türleri yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('/analysis/categories');
      setCategories(response.data);
    } catch (err) {
      toast.error('Kategoriler yüklenirken hata oluştu');
      console.error('Kategoriler yüklenirken hata oluştu:', err);
    }
  };

  const handleCreate = async () => {
    const name = formData.name.trim();
    const categoryId = formData.categoryId;
    const price = formData.price.trim();

    if (!name || !categoryId || price === '') {
      toast.error('Tüm alanları doldurun');
      return;
    }

    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      toast.error('Geçerli bir fiyat girin');
      return;
    }

    try {
      await api.post('/analysis-types', {
        name,
        categoryId,
        price: priceValue,
      });
      toast.success('Analiz türü başarıyla eklendi');
      setShowCreateModal(false);
      setFormData({ name: '', categoryId: '', price: '' });
      fetchAnalysisTypes();
    } catch (err) {
      toast.error('Analiz türü eklenirken hata oluştu');
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedType || !formData.name || !formData.price) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    try {
      await api.put(`/analysis-types/${selectedType.id}`, {
        name: formData.name,
        price: Number(formData.price),
      });
      toast.success('Fiyat başarıyla güncellendi');
      setShowEditModal(false);
      setSelectedType(null);
      setFormData({ name: '', categoryId: '', price: '' });
      fetchAnalysisTypes();
    } catch (err) {
      toast.error('Güncelleme başarısız');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;

    try {
      await api.delete(`/analysis-types/${selectedType.id}`);
      toast.success('Analiz türü başarıyla silindi');
      setShowDeleteModal(false);
      setSelectedType(null);
      fetchAnalysisTypes();
    } catch (err) {
      toast.error('Silme başarısız');
      console.error(err);
    }
  };

  const openEditModal = (type: AnalysisType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      categoryId: type.categoryId,
      price: type.price.toString(),
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (type: AnalysisType) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };

  if (loading && activeTab === 'analysis') {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Sistem Ayarları</h1>
          <div className="bg-slate-800 rounded-xl p-12 text-center">
            <div className="animate-pulse text-slate-400">Yükleniyor...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sistem Ayarları</h1>

        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'analysis'
                  ? 'bg-accent-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Analiz ve Fiyat Yönetimi
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'general'
                  ? 'bg-accent-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Genel Ayarlar
            </button>
          </div>
        </div>

        {activeTab === 'analysis' && (
          <>
            {error ? (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-12 text-center mb-6">
                <div className="text-red-400 text-lg">{error}</div>
                <button
                  onClick={fetchAnalysisTypes}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => {
                      setFormData({ name: '', categoryId: '', price: '' });
                      setShowCreateModal(true);
                    }}
                    className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold text-white transition-colors"
                  >
                    + Yeni Analiz Ekle
                  </button>
                </div>

                <div className="bg-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Analiz Adı</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kategori</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Birim Fiyat (TL)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Eklenme Tarihi</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {analysisTypes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                              Analiz türü bulunamadı
                            </td>
                          </tr>
                        ) : (
                          analysisTypes.map((type) => (
                            <tr key={type.id} className="hover:bg-slate-700/50 transition-colors">
                              <td className="px-6 py-4 text-white">{type.name}</td>
                              <td className="px-6 py-4 text-slate-300">{type.category.name}</td>
                              <td className="px-6 py-4 text-white font-semibold">
                                {Number(type.price).toFixed(2)} TL
                              </td>
                              <td className="px-6 py-4 text-slate-300">
                                {new Date(type.createdAt).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEditModal(type)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                                    title="Düzenle"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(type)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
                                    title="Sil"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'general' && (
          <div className="bg-slate-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">⚙️</div>
            <h2 className="text-2xl font-bold mb-4">Genel Ayarlar</h2>
            <p className="text-slate-400 text-lg">
              Bu modül şu an yapım aşamasındadır.
            </p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Yeni Analiz Ekle</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', categoryId: '', price: '' });
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Analiz Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                    placeholder="Örn: pH Analizi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                  >
                                      <option value="">Kategori Seçin</option>
                    
                    
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Birim Fiyat (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCreate}
                    className="flex-1 py-2 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold text-white transition-colors"
                  >
                    Ekle
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', categoryId: '', price: '' });
                    }}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedType && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Fiyat Güncelle</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedType(null);
                    setFormData({ name: '', categoryId: '', price: '' });
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Analiz Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Birim Fiyat (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 py-2 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold text-white transition-colors"
                  >
                    Güncelle
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedType(null);
                      setFormData({ name: '', categoryId: '', price: '' });
                    }}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedType && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl w-full max-w-md">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Silme Onayı</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedType(null);
                  }}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <p className="text-white mb-6">
                  <strong>{selectedType.name}</strong> analiz türünü silmek istediğinize emin misiniz?
                  Bu işlem geri alınamaz.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition-colors"
                  >
                    Sil
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedType(null);
                    }}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
