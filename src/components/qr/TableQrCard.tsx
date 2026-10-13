import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, RefreshCw, Smartphone, Eye } from 'lucide-react';
import { RestaurantTable } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

interface TableQrCardProps {
  table: RestaurantTable;
}

export const TableQrCard: React.FC<TableQrCardProps> = ({ table }) => {
  const { currentTenant, regenerateTableQr, simulateQrScan } = useRestaurant();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isStandPreviewOpen, setIsStandPreviewOpen] = useState(false);

  // Generate QR code data URL using qrcode library
  useEffect(() => {
    // Clean path structure: app_name/restaurant_id_or_name/menu_id_or_table_id/auth
    const scanUrl = `${window.location.origin}/${currentTenant.slug}/${table.id}/auth`;
    QRCode.toDataURL(scanUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: currentTenant.primaryColor || '#07543a',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [table.id, table.qrToken, currentTenant.slug, currentTenant.primaryColor]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${currentTenant.slug}-${table.tableNumber.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    a.click();
  };

  const handleTestScan = () => {
    simulateQrScan(table.qrToken);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-[#C2DFD4] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-[#0D1914] glinster-font">
                {table.tableNumber}
              </h3>
              <span className="text-[11px] text-neutral-400">
                Capacity: {table.capacity} guests
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
              {table.qrToken.slice(0, 10)}...
            </span>
          </div>

          {/* QR Image Container */}
          <div className="my-3 p-3 bg-[#F4F8F6] rounded-xl flex flex-col items-center justify-center border border-[#C2DFD4]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${table.tableNumber}`}
                className="w-32 h-32 rounded-lg shadow-2xs"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-neutral-200 animate-pulse flex items-center justify-center text-xs text-neutral-400">
                Generating...
              </div>
            )}
            <span className="text-[10px] text-neutral-400 mt-2 font-medium">
              Scan to Dine & Order
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTestScan}
            className="flex-1 py-1.5 px-2 rounded-lg bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Simulate scanning on a phone"
          >
            <Smartphone className="w-3 h-3" />
            <span>Simulate</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStandPreviewOpen(true)}
            className="p-1.5 rounded-lg bg-[#F4F8F6] hover:bg-[#E6F2ED] hover:text-[#07543a] text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
            title="Preview Printable Stand"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-[#F4F8F6] hover:bg-[#E6F2ED] hover:text-[#07543a] text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
            title="Download QR Image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => regenerateTableQr(table.id)}
            className="p-1.5 rounded-lg bg-[#F4F8F6] hover:bg-[#E6F2ED] hover:text-[#07543a] text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
            title="Rotate Security Token"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Printable Stand Modal */}
      {isStandPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border-4 border-[#07543a]">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#07543a] mb-1">
              Table Stand Card Preview
            </div>
            {currentTenant.logoUrl && (
              <div className="flex justify-center mb-1.5">
                <img
                  src={currentTenant.logoUrl}
                  alt={currentTenant.name}
                  className="h-9 max-w-[120px] object-contain drop-shadow-xs"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-[#0D1914] glinster-font">
              {currentTenant.name}
            </h2>
            <p className="text-xs text-neutral-500 mb-4">{currentTenant.tagline}</p>

            <div className="p-4 bg-[#F4F8F6] rounded-2xl inline-block border-2 border-[#C2DFD4] shadow-inner mb-4">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${table.tableNumber}`}
                  className="w-44 h-44 rounded-xl mx-auto shadow-sm"
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-lg font-black text-[#0D1914] glinster-font">
                {table.tableNumber}
              </div>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                Aim your phone camera at this QR code to view our live digital menu, customize dishes, and place your order.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-3 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
              <button
                onClick={() => setIsStandPreviewOpen(false)}
                className="py-2 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
