import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { AnalysisInfoModal } from '../components/AnalysisInfoModal';
import { api } from '../lib/axios';

interface Sample {
  id: string;
  numuneAdi: string;
  ambalajSekli: 'CAM' | 'PLASTIK' | 'KARTON';
  kartonBoyutu?: string;
  numuneHazirlik?: string;
  baskaSoru?: string;
  iadeEdilecekMi: boolean;
  tehlikeliMi: boolean;
  analyses: AnalysisSelection[];
}

interface AnalysisSelection {
  analysisTypeId: string;
  analysisName: string;
  price: number;
  elements?: string[];
  numuneHazirlik?: string;
}

interface AnalysisCategory {
  id: string;
  name: string;
  analysisTypes: AnalysisType[];
}

interface AnalysisType {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

const ELEMENTS = [
  'Manganez', 'Magnezyum', 'Sodyum', 'Potasyum', 'Kalsiyum', 'Demir', 'Çinko', 'Bakır', 'Kurşun', 'Kadmiyum',
  'Nikel', 'Krom', 'Kobalt', 'Alüminyum', 'Titanyum', 'Vanadyum', 'Molibden', 'Tungsten', 'Gümüş', 'Altın'
];

export const NewAnalysisRequest = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AnalysisCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [sampleCount, setSampleCount] = useState(1);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [samples]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setCategoriesError(null);
      const response = await api.get('/analysis/categories');
      const data = response?.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategoriesError('Analiz kategorileri yüklenirken bir hata oluştu.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    samples.forEach(sample => {
      sample.analyses.forEach(analysis => {
        total += analysis.price;
        if (analysis.elements && analysis.elements.length > 0) {
          total += analysis.elements.length * 50; // Element başına 50 TL
        }
        if (analysis.numuneHazirlik === 'ISTIYORUM') {
          total += 100; // Numune hazırlık ücreti
        }
      });
    });
    setTotalPrice(total);
  };

  const addSamples = () => {
    const newSamples: Sample[] = [];
    for (let i = 0; i < sampleCount; i++) {
      newSamples.push({
        id: `sample-${Date.now()}-${i}`,
        numuneAdi: '',
        ambalajSekli: 'CAM',
        kartonBoyutu: '',
        numuneHazirlik: '',
        baskaSoru: '',
        iadeEdilecekMi: false,
        tehlikeliMi: false,
        analyses: [],
      });
    }
    setSamples([...samples, ...newSamples]);
    setSampleCount(1);
  };

  const copyFromPrevious = (currentIndex: number) => {
    if (currentIndex === 0) return;
    const previousSample = samples[currentIndex - 1];
    const updatedSamples = [...samples];
    updatedSamples[currentIndex] = {
      ...previousSample,
      id: `sample-${Date.now()}`,
      analyses: previousSample.analyses.map(a => ({ ...a })),
    };
    setSamples(updatedSamples);
  };

  const updateSample = (index: number, field: keyof Sample, value: any) => {
    const updatedSamples = [...samples];
    updatedSamples[index] = { ...updatedSamples[index], [field]: value };
    setSamples(updatedSamples);
  };

  const openAnalysisModal = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setShowModal(true);
  };

  const addAnalysisToSample = (analysisType: AnalysisType) => {
    if (!selectedSampleId) return;
    const updatedSamples = samples.map(sample => {
      if (sample.id === selectedSampleId) {
        return {
          ...sample,
          analyses: [
            ...sample.analyses,
            {
              analysisTypeId: analysisType.id,
              analysisName: analysisType.name,
              price: analysisType.price,
              elements: [],
              numuneHazirlik: '',
            },
          ],
        };
      }
      return sample;
    });
    setSamples(updatedSamples);
    setShowModal(false);
  };

  const removeAnalysisFromSample = (sampleIndex: number, analysisIndex: number) => {
    const updatedSamples = [...samples];
    updatedSamples[sampleIndex].analyses.splice(analysisIndex, 1);
    setSamples(updatedSamples);
  };

  const updateAnalysisElements = (sampleIndex: number, analysisIndex: number, elements: string[]) => {
    const updatedSamples = [...samples];
    updatedSamples[sampleIndex].analyses[analysisIndex].elements = elements;
    setSamples(updatedSamples);
  };

  const updateAnalysisPreparation = (sampleIndex: number, analysisIndex: number, value: string) => {
    const updatedSamples = [...samples];
    updatedSamples[sampleIndex].analyses[analysisIndex].numuneHazirlik = value;
    setSamples(updatedSamples);
  };

  const handleSubmit = async () => {
    if (samples.length === 0) {
      alert('Lütfen en az bir numune ekleyin.');
      return;
    }

    const invalidSample = samples.find(s => !s.numuneAdi || s.analyses.length === 0);
    if (invalidSample) {
      alert('Tüm numuneler için ad ve en az bir analiz seçilmelidir.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/analysis/create-request', {
        samples,
        requestType: 'ANALIZ_BASVURUSU',
      });
      
      if (response.status === 201 || response.status === 200) {
        navigate('/analysis/my');
      }
    } catch (error) {
      console.error('Analiz talebi gönderilirken hata:', error);
      alert('Analiz talebi gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.analysisTypes.some(type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const isElementBased = (analysisName: string) => {
    return analysisName.includes('AAS') || analysisName.includes('ICP') || analysisName.includes('XRF');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <Topbar />
      
      <div className="ml-64 pt-16 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Yeni Analiz Talebi</h1>
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold"
          >
            <Info className="w-5 h-5" />
            Bilgilendirme
          </button>
        </div>

        {/* Sample Count Input */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Numune/Paket Sayısı</label>
              <input
                type="number"
                min="1"
                value={sampleCount}
                onChange={(e) => setSampleCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
              />
            </div>
            <button
              onClick={addSamples}
              className="px-6 py-3 bg-accent-600 hover:bg-accent-700 rounded-lg font-semibold mt-6"
            >
              Ekle
            </button>
          </div>
        </div>

        {/* Sample Cards */}
        <div className="space-y-6 mb-8">
          {samples.map((sample, index) => (
            <div key={sample.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              {index > 0 && (
                <button
                  onClick={() => copyFromPrevious(index)}
                  className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold"
                >
                  Üstteki Numuneden Kopyala
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Numune Adı</label>
                  <input
                    type="text"
                    value={sample.numuneAdi}
                    onChange={(e) => updateSample(index, 'numuneAdi', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                    placeholder="Numune adı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ambalaj Şekli</label>
                  <select
                    value={sample.ambalajSekli}
                    onChange={(e) => updateSample(index, 'ambalajSekli', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                  >
                    <option value="CAM">Cam</option>
                    <option value="PLASTIK">Plastik</option>
                    <option value="KARTON">Karton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Karton Boyutu</label>
                  <input
                    type="text"
                    value={sample.kartonBoyutu || ''}
                    onChange={(e) => updateSample(index, 'kartonBoyutu', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                    placeholder="Örn: 30x40x50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Numune Hazırlık</label>
                  <input
                    type="text"
                    value={sample.numuneHazirlik || ''}
                    onChange={(e) => updateSample(index, 'numuneHazirlik', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                    placeholder="Hazırlık notları"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Başka Soru</label>
                  <input
                    type="text"
                    value={sample.baskaSoru || ''}
                    onChange={(e) => updateSample(index, 'baskaSoru', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-accent-500"
                    placeholder="Ek sorular"
                  />
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sample.iadeEdilecekMi}
                      onChange={(e) => updateSample(index, 'iadeEdilecekMi', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">İade Edilecek</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sample.tehlikeliMi}
                      onChange={(e) => updateSample(index, 'tehlikeliMi', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">Tehlikeli</span>
                  </label>
                </div>
              </div>

              {/* Analyses List */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Seçilen Analizler</h3>
                  <button
                    onClick={() => openAnalysisModal(sample.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
                  >
                    Analiz Ekle
                  </button>
                </div>

                {sample.analyses.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">Henüz analiz seçilmedi</p>
                ) : (
                  <div className="space-y-4">
                    {sample.analyses.map((analysis, aIndex) => (
                      <div key={aIndex} className="bg-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{analysis.analysisName}</h4>
                            <p className="text-sm text-slate-400">Birim Fiyat: {analysis.price} TL</p>
                          </div>
                          <button
                            onClick={() => removeAnalysisFromSample(index, aIndex)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            Kaldır
                          </button>
                        </div>

                        {isElementBased(analysis.analysisName) && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">Element Seçiniz (En az 1 element seçilmelidir)</p>
                            <div className="grid grid-cols-4 gap-2">
                              {ELEMENTS.map(element => (
                                <label key={element} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={analysis.elements?.includes(element)}
                                    onChange={(e) => {
                                      const currentElements = analysis.elements || [];
                                      const newElements = e.target.checked
                                        ? [...currentElements, element]
                                        : currentElements.filter(el => el !== element);
                                      updateAnalysisElements(index, aIndex, newElements);
                                    }}
                                    className="w-4 h-4"
                                  />
                                  {element}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">Numune Hazırlık</label>
                          <select
                            value={analysis.numuneHazirlik || ''}
                            onChange={(e) => updateAnalysisPreparation(index, aIndex, e.target.value)}
                            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:border-accent-500"
                          >
                            <option value="">İstemiyorum (0.00 TL)</option>
                            <option value="ISTIYORUM">İstiyorum (100.00 TL)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Toplam Tutar</h3>
            <p className="text-slate-400">KDV dahil</p>
          </div>
          <div className="text-3xl font-bold text-accent-500">{(Number(totalPrice) || 0).toFixed(2)} TL</div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg"
        >
          {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
        </button>
      </div>

      {/* Analysis Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Analiz Seç</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold"
                >
                  <Info className="w-4 h-4" />
                  Bilgilendirme
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Kapat
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Analiz Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg mb-4 focus:outline-none focus:border-accent-500"
            />

            <div className="flex gap-4 overflow-hidden flex-1">
              {loadingCategories ? (
                <div className="w-full flex items-center justify-center py-12">
                  <p className="text-slate-300">Analizler Yükleniyor...</p>
                </div>
              ) : categoriesError ? (
                <div className="w-full flex items-center justify-center py-12">
                  <p className="text-red-400">{categoriesError}</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="w-full flex items-center justify-center py-12">
                  <p className="text-slate-400">Sistemde kayıtlı analiz bulunamadı</p>
                </div>
              ) : (
                <>
                  {/* Categories */}
                  <div className="w-1/3 overflow-y-auto">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-4 py-3 rounded-lg ${!selectedCategory ? 'bg-accent-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                      >
                        Tümü
                      </button>
                      {filteredCategories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-4 py-3 rounded-lg ${selectedCategory === category.id ? 'bg-accent-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Types */}
                  <div className="w-2/3 overflow-y-auto">
                    <div className="space-y-2">
                      {filteredCategories
                        .filter(cat => !selectedCategory || cat.id === selectedCategory)
                        .map(category => (
                          <div key={category.id}>
                            <h3 className="font-semibold mb-2 text-accent-500">{category.name}</h3>
                            {(category.analysisTypes || [])
                              .filter(type =>
                                type.name?.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map(type => (
                                <button
                                  key={type.id}
                                  onClick={() => addAnalysisToSample(type)}
                                  className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg mb-2 flex justify-between items-center"
                                >
                                  <span>{type.name}</span>
                                  <span className="text-accent-500">{type.price} TL</span>
                                </button>
                              ))}
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <AnalysisInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </div>
  );
};
