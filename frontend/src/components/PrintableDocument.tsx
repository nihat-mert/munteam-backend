import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';

interface PrintableDocumentProps {
  documentType: 'ORDER' | 'ANALYSIS_REQUEST';
  documentNumber: string;
  requestDate: string;
  customerInfo: {
    adSoyad?: string;
    kurum?: string;
    tcKimlik?: string;
    vergiNo?: string;
    telefon?: string;
    email?: string;
    faturaAdresi?: string;
    kullanimAmaci?: string;
    projeNo?: string;
  };
  items: Array<{
    code: string;
    name: string;
    details?: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  kdv: number;
  total: number;
  onClose?: () => void;
}

export const PrintableDocument = ({
  documentType,
  documentNumber,
  requestDate,
  customerInfo,
  items,
  subtotal,
  kdv,
  total,
  onClose,
}: PrintableDocumentProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${documentType === 'ORDER' ? 'Sipariş' : 'Analiz Talep'} - ${documentNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' TL';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* Print Controls - Hidden when printing */}
      <div className="no-print mb-6 flex gap-4">
        <button
          onClick={() => handlePrint()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
        >
          Yazdır / PDF İndir
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold text-white"
          >
            Kapat
          </button>
        )}
      </div>

      {/* Printable Document */}
      <div
        ref={componentRef}
        className="bg-white text-black max-w-[210mm] mx-auto p-[10mm] shadow-2xl"
        style={{ minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-start justify-between">
            {/* Logo Area */}
            <div className="w-32 h-32 border-2 border-black flex items-center justify-center bg-gray-100">
              <span className="text-xs text-gray-500 text-center px-2">KURUM LOGOSU</span>
            </div>

            {/* Official Title */}
            <div className="flex-1 ml-6 text-center">
              <h1 className="text-lg font-bold uppercase tracking-wide">
                T.C. BİLİMSEL VE TEKNOLOJİK ARAŞTIRMALAR MERKEZİ
              </h1>
              <h2 className="text-base font-semibold mt-1">LABORATUVARI</h2>
              <h3 className="text-sm font-bold mt-3 border-t border-black pt-2">
                {documentType === 'ORDER' ? 'FİYAT TEKLİF FORMU' : 'ANALİZ TALEP VE FİYAT TEKLİF FORMU'}
              </h3>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={`${documentType}-${documentNumber}-${requestDate}`}
                size={80}
                level="H"
                includeMargin={false}
              />
              <span className="text-xs mt-1">Doğrulama Kodu</span>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="flex justify-between mb-6 text-sm">
          <div className="space-y-1">
            <p>
              <span className="font-semibold">Belge No:</span> {documentNumber}
            </p>
            <p>
              <span className="font-semibold">Belge Türü:</span>{' '}
              {documentType === 'ORDER' ? 'Fiyat Teklifi' : 'Analiz Talebi'}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p>
              <span className="font-semibold">İstek Tarihi:</span> {formatDate(requestDate)}
            </p>
            <p>
              <span className="font-semibold">Geçerlilik:</span> 30 Gün
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h4 className="font-bold text-sm border-b border-black pb-1 mb-3 uppercase">
            Müşteri ve Proje Bilgileri
          </h4>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2 w-1/3 font-semibold">Ad Soyad / Yetkili:</td>
                <td className="py-2">{customerInfo.adSoyad || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">Kurum / Ünvan:</td>
                <td className="py-2">{customerInfo.kurum || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">T.C. Kimlik No:</td>
                <td className="py-2">{customerInfo.tcKimlik || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">Vergi No:</td>
                <td className="py-2">{customerInfo.vergiNo || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">Telefon:</td>
                <td className="py-2">{customerInfo.telefon || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">E-posta:</td>
                <td className="py-2">{customerInfo.email || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">Fatura Adresi:</td>
                <td className="py-2">{customerInfo.faturaAdresi || '-'}</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2 font-semibold">Kullanım Amacı:</td>
                <td className="py-2">{customerInfo.kullanimAmaci || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Proje No:</td>
                <td className="py-2">{customerInfo.projeNo || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h4 className="font-bold text-sm border-b border-black pb-1 mb-3 uppercase">
            {documentType === 'ORDER' ? 'Sipariş Kalemleri' : 'Numune ve Analiz Detayları'}
          </h4>
          <table className="w-full text-sm border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black py-2 px-2 text-left font-semibold">
                  {documentType === 'ORDER' ? 'Ürün Kodu' : 'Numune Kodu'}
                </th>
                <th className="border border-black py-2 px-2 text-left font-semibold">
                  {documentType === 'ORDER' ? 'Ürün Adı' : 'Analiz Adı / Element Detayları'}
                </th>
                {documentType === 'ANALYSIS_REQUEST' && (
                  <th className="border border-black py-2 px-2 text-left font-semibold">Ambalaj Türü</th>
                )}
                <th className="border border-black py-2 px-2 text-right font-semibold">Birim Fiyat</th>
                <th className="border border-black py-2 px-2 text-right font-semibold">Miktar</th>
                <th className="border border-black py-2 px-2 text-right font-semibold">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black py-2 px-2">{item.code}</td>
                  <td className="border border-black py-2 px-2">
                    {item.name}
                    {item.details && (
                      <div className="text-xs text-gray-600 mt-1">{item.details}</div>
                    )}
                  </td>
                  {documentType === 'ANALYSIS_REQUEST' && (
                    <td className="border border-black py-2 px-2">{item.details || '-'}</td>
                  )}
                  <td className="border border-black py-2 px-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="border border-black py-2 px-2 text-right">{item.quantity}</td>
                  <td className="border border-black py-2 px-2 text-right font-semibold">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="py-2 text-right font-semibold">Ara Toplam:</td>
                <td className="py-2 text-right font-semibold w-40">{formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td className="py-2 text-right font-semibold">KDV (%20):</td>
                <td className="py-2 text-right font-semibold w-40">{formatCurrency(kdv)}</td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="py-3 text-right font-bold text-lg">GENEL TOPLAM:</td>
                <td className="py-3 text-right font-bold text-lg w-40">{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Information */}
        <div className="mb-6 border-t border-black pt-4">
          <h4 className="font-bold text-sm border-b border-black pb-1 mb-3 uppercase">
            Banka ve Ödeme Bilgileri
          </h4>
          <div className="bg-gray-50 p-4 border border-gray-300">
            <p className="font-semibold mb-2">Ziraat Bankası</p>
            <p className="text-sm mb-1">
              <span className="font-semibold">IBAN:</span> TR12 0001 0002 0003 0004 0005 0006
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">Hesap Sahibi:</span> Bilimsel ve Teknolojik Araştırmalar Merkezi
            </p>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300">
              <p className="text-xs text-yellow-800 font-semibold">
                ⚠️ Ödeme açıklamasına mutlaka başvuru referans kodunu yazınız: {documentNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black pt-4 mt-6">
          <div className="flex justify-between text-xs text-gray-600">
            <div className="text-center">
              <p className="font-semibold mb-8">Müşteri İmza</p>
              <div className="border-b border-gray-400 w-48"></div>
            </div>
            <div className="text-center">
              <p className="font-semibold mb-8">Onaylayan İmza</p>
              <div className="border-b border-gray-400 w-48"></div>
            </div>
          </div>
          <p className="text-center text-xs mt-4 text-gray-500">
            Bu belge bilgisayar ortamında üretilmiştir. Belge doğruluğu için QR kodu taratınız.
          </p>
        </div>
      </div>
    </div>
  );
};
