import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Smartphone,
  Eye,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Palette,
  Hash,
  Wifi,
  Utensils,
  Wine,
  ChefHat,
  RotateCcw,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

const QR_COLOR_OPTIONS = [
  { name: 'Retro Green', hex: '#30673A', bg: 'bg-[#30673A]' },
  { name: 'Tangerine', hex: '#E3792F', bg: 'bg-[#E3792F]' },
  { name: 'Midnight Charcoal', hex: '#1E231F', bg: 'bg-[#1E231F]' },
  { name: 'Bistro Espresso', hex: '#451A03', bg: 'bg-[#451A03]' },
  { name: 'Deep Pine', hex: '#14532D', bg: 'bg-[#14532D]' },
];

const QR_BG_OPTIONS = [
  { name: 'Crisp White', hex: '#FFFFFF', bg: 'bg-white' },
  { name: 'Soft Pistachio', hex: '#E9E9C7', bg: 'bg-[#E9E9C7]' },
  { name: 'Warm Linen', hex: '#FAF8F2', bg: 'bg-[#FAF8F2]' },
];

export const TableStandStudio: React.FC = () => {
  const {
    currentTenant,
    tables,
    currentTableId,
    setCurrentTableId,
    setCurrentRole,
    simulateQrScan,
    updateTableNumber,
    setIsTableAuthorized,
  } = useRestaurant();

  // Active table
  const selectedTable = tables.find((t) => t.id === currentTableId) || tables[0];

  // Mode: Universal Single QR vs Dedicated Table-Specific QR
  const [qrMode, setQrMode] = useState<'universal' | 'table_specific'>('table_specific');
  const [editableTableNumber, setEditableTableNumber] = useState(
    selectedTable?.tableNumber || 'Table 4'
  );

  // Customization state
  const [customBrandName, setCustomBrandName] = useState(currentTenant.name);
  const [customTagline, setCustomTagline] = useState('SCAN. ORDER. ENJOY.');
  const [customInstruction, setCustomInstruction] = useState('SCAN TO VIEW MENU & ORDER');
  const [standFormat, setStandFormat] = useState<'a6' | 'a5' | 'tent_fold'>('a6');
  const [viewMode, setViewMode] = useState<'flat' | 'tabletop_3d' | 'tent_fold'>('flat');
  const [usePlaceholderQr, setUsePlaceholderQr] = useState(false);

  // QR Color & Logo Customization
  const [qrColor, setQrColor] = useState('#30673A');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrCenterIcon, setQrCenterIcon] = useState<'monogram' | 'utensils' | 'wine' | 'chef' | 'table_num' | 'none'>('monogram');

  // Wi-Fi Display Options
  const [showWifi, setShowWifi] = useState(false);
  const [wifiSsid, setWifiSsid] = useState(`${currentTenant.name.replace(/\s+/g, '')}-Guest`);
  const [wifiPassword] = useState('welcome2026');

  // QR Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const standRef = useRef<HTMLDivElement>(null);

  // Sync custom brand name when tenant changes
  useEffect(() => {
    setCustomBrandName(currentTenant.name);
    setWifiSsid(`${currentTenant.name.replace(/\s+/g, '')}-Guest`);
  }, [currentTenant.name]);

  // Sync editable table number when selected table changes
  useEffect(() => {
    if (selectedTable) {
      setEditableTableNumber(selectedTable.tableNumber);
    }
  }, [selectedTable]);

  // Handle table number change
  const handleTableNumberChange = (newVal: string) => {
    setEditableTableNumber(newVal);
    if (selectedTable && newVal.trim()) {
      updateTableNumber(selectedTable.id, newVal.trim());
    }
  };

  // Destination URL for QR
  const scanUrl =
    qrMode === 'universal'
      ? `${window.location.origin}?tenant=${currentTenant.slug}&universal=true`
      : `${window.location.origin}?tenant=${currentTenant.slug}&table=${selectedTable?.id}&token=${selectedTable?.qrToken}`;

  // Generate real, high-contrast QR code with optional center badge
  useEffect(() => {
    if (usePlaceholderQr) {
      setQrDataUrl('');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    QRCode.toCanvas(canvas, scanUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'H', // 30% error correction allows center badge without corrupting scan
      color: {
        dark: qrColor,
        light: qrBgColor,
      },
    })
      .then(() => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Render center logo emblem if requested
        if (qrCenterIcon !== 'none') {
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const radius = 54;

          // Draw center white pill/circle background
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = qrBgColor;
          ctx.fill();
          ctx.lineWidth = 6;
          ctx.strokeStyle = qrColor;
          ctx.stroke();

          // Draw icon / monogram inside
          ctx.fillStyle = qrColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (qrCenterIcon === 'monogram') {
            ctx.font = 'bold 42px "Fraunces", serif';
            ctx.fillText(currentTenant.name.charAt(0) || 'A', cx, cy + 2);
          } else if (qrCenterIcon === 'table_num') {
            ctx.font = 'bold 30px "JetBrains Mono", monospace';
            const numMatch = editableTableNumber.replace(/\D/g, '');
            ctx.fillText(numMatch ? `#${numMatch}` : '#1', cx, cy + 2);
          } else if (qrCenterIcon === 'utensils') {
            ctx.font = '36px sans-serif';
            ctx.fillText('🍴', cx, cy + 2);
          } else if (qrCenterIcon === 'wine') {
            ctx.font = '36px sans-serif';
            ctx.fillText('🍷', cx, cy + 2);
          } else if (qrCenterIcon === 'chef') {
            ctx.font = '36px sans-serif';
            ctx.fillText('👨‍🍳', cx, cy + 2);
          }
        }

        setQrDataUrl(canvas.toDataURL('image/png'));
      })
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [scanUrl, usePlaceholderQr, qrColor, qrBgColor, qrCenterIcon, currentTenant.name, editableTableNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!qrDataUrl && !usePlaceholderQr) return;
    const a = document.createElement('a');
    a.href = qrDataUrl || '';
    const label =
      qrMode === 'universal'
        ? 'universal-stand'
        : editableTableNumber.toLowerCase().replace(/\s+/g, '-');
    a.download = `auradine-table-stand-${label}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestScan = () => {
    if (qrMode === 'universal') {
      setIsTableAuthorized(false);
      setCurrentRole('customer');
    } else if (selectedTable) {
      simulateQrScan(selectedTable.qrToken);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E231F] text-[#FAF8F2] p-4 sm:p-6 pb-28">
      {/* Print-only CSS rules */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, nav, footer, .no-print {
            display: none !important;
          }
          .print-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-stand-card {
            box-shadow: none !important;
            border: 2px solid #30673A !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800 no-print">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#30673A] text-white flex items-center justify-center font-bold text-xl shadow-lg border border-[#E9E9C7]/20">
              <Sparkles className="w-6 h-6 text-[#E9E9C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold glinster-font text-white">
                  AuraDine · Table QR Stand Studio
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E3792F]/20 text-[#E3792F] border border-[#E3792F]/40 font-mono">
                  Hospitality Print Suite
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Print-ready physical stands with single universal QR code or table-specific custom QR codes
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Stand</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleTestScan}
              className="py-2 px-3.5 rounded-xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Test scan and open phone customer view"
            >
              <Smartphone className="w-4 h-4" />
              <span>{qrMode === 'universal' ? 'Test Scan (Prompts Table #)' : 'Simulate Phone Scan'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#30673A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'URL Copied!' : 'Copy Menu URL'}</span>
            </button>
          </div>
        </div>

        {/* View Selector & Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-2xl border border-neutral-800">
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'flat'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#30673A]" />
              <span>Front-View Stand</span>
            </button>

            <button
              onClick={() => setViewMode('tabletop_3d')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'tabletop_3d'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#E3792F]" />
              <span>3D Tabletop Acrylic Mockup</span>
            </button>

            <button
              onClick={() => setViewMode('tent_fold')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'tent_fold'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Double-Sided Tent Fold</span>
            </button>
          </div>

          {/* QR Code Mode Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
              <input
                type="checkbox"
                checked={usePlaceholderQr}
                onChange={(e) => setUsePlaceholderQr(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#30673A]"
              />
              <span className="text-neutral-300">
                {usePlaceholderQr ? 'Showing Placeholder QR' : 'Active Functional QR'}
              </span>
            </label>
          </div>
        </div>

        {/* Main Grid: Customization Controls (Left) + Artwork Canvas (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Customization Controls */}
          <div className="lg:col-span-4 space-y-4 no-print">
            
            {/* 1. QR Code Mode Selection */}
            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#30673A]" />
                  QR Stand Architecture Mode
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQrMode('universal')}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    qrMode === 'universal'
                      ? 'bg-[#30673A]/20 border-[#30673A] text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E3792F]" />
                    Single Universal QR
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-tight">
                    One QR code for all tables. Diner writes Table # upon scan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQrMode('table_specific')}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    qrMode === 'table_specific'
                      ? 'bg-[#30673A]/20 border-[#30673A] text-white'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Hash className="w-3 h-3 text-[#30673A]" />
                    Table-Specific QR
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-tight">
                    Custom pre-assigned QR stand per table.
                  </p>
                </button>
              </div>

              {/* Table Number Customizer (Editable text input giving freedom to write table number) */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <label className="block text-neutral-300 font-semibold text-xs flex items-center justify-between">
                  <span>Write / Customize Table Number</span>
                  {qrMode === 'universal' && (
                    <span className="text-[10px] text-[#E3792F] font-normal">Optional display badge</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editableTableNumber}
                    onChange={(e) => handleTableNumberChange(e.target.value)}
                    placeholder="e.g. Table 4, Patio 2, Booth 7..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-bold text-xs focus:ring-1 focus:ring-[#30673A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleTableNumberChange('Table 4')}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs"
                    title="Reset to default Table 4"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {qrMode === 'table_specific' && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tables.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setCurrentTableId(t.id);
                          setEditableTableNumber(t.tableNumber);
                        }}
                        className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          selectedTable?.id === t.id
                            ? 'bg-[#30673A] text-white border-[#30673A]'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        {t.tableNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. QR Code Style & Visual Customization */}
            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3.5 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#E3792F]" />
                Freedom to Customize QR Code
              </h3>

              {/* QR Module Color Palette */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  QR Code Module Color
                </label>
                <div className="flex items-center gap-2">
                  {QR_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setQrColor(c.hex)}
                      className={`w-7 h-7 rounded-full ${c.bg} border-2 transition-transform cursor-pointer ${
                        qrColor === c.hex
                          ? 'border-white scale-110 shadow-md ring-2 ring-white/20'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* QR Background Tone */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  QR Background Surface
                </label>
                <div className="flex items-center gap-2">
                  {QR_BG_OPTIONS.map((bg) => (
                    <button
                      key={bg.hex}
                      type="button"
                      onClick={() => setQrBgColor(bg.hex)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                        qrBgColor === bg.hex
                          ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                          : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {bg.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Center Monogram / Emblem */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Center Logo / Monogram Badge
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQrCenterIcon('monogram')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 cursor-pointer ${
                      qrCenterIcon === 'monogram'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs">{currentTenant.name.charAt(0)}</span>
                    <span>Initials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrCenterIcon('table_num')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 cursor-pointer ${
                      qrCenterIcon === 'table_num'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Hash className="w-3 h-3 text-[#E3792F]" />
                    <span>Table #</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrCenterIcon('utensils')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 cursor-pointer ${
                      qrCenterIcon === 'utensils'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Utensils className="w-3 h-3 text-[#30673A]" />
                    <span>Fork/Knife</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrCenterIcon('wine')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 cursor-pointer ${
                      qrCenterIcon === 'wine'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Wine className="w-3 h-3 text-red-400" />
                    <span>Wine Glass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrCenterIcon('chef')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 cursor-pointer ${
                      qrCenterIcon === 'chef'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ChefHat className="w-3 h-3 text-amber-400" />
                    <span>Chef Hat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrCenterIcon('none')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 cursor-pointer ${
                      qrCenterIcon === 'none'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Plain QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Typography & Brand Content */}
            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3.5 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Stand Branding & Copy
              </h3>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Establishment Name
                </label>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Secondary Tagline
                </label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  QR Call-To-Action Instruction
                </label>
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                />
              </div>

              {/* Guest Wi-Fi details toggle */}
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-[#30673A]" />
                    Include Guest Wi-Fi Details
                  </span>
                  <input
                    type="checkbox"
                    checked={showWifi}
                    onChange={(e) => setShowWifi(e.target.checked)}
                    className="w-4 h-4 rounded text-[#30673A]"
                  />
                </label>

                {showWifi && (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="Network Name"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-[11px]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Stand Format Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStandFormat('a6')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      standFormat === 'a6'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    A6 (105 × 148 mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStandFormat('a5')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      standFormat === 'a5'
                        ? 'border-[#30673A] bg-[#30673A]/20 text-white'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    A5 (148 × 210 mm)
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Stand Artwork Canvas Preview */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-4 sm:p-8 bg-neutral-900/60 rounded-3xl border border-neutral-800 overflow-hidden min-h-[640px]">
            
            {/* VIEW MODE 1: FLAT FRONT-VIEW ARTWORK */}
            {viewMode === 'flat' && (
              <div className="print-container flex flex-col items-center">
                {/* Physical Stand Face */}
                <div
                  ref={standRef}
                  className={`print-stand-card relative bg-[#E9E9C7] text-[#1E231F] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between items-center text-center select-none ${
                    standFormat === 'a6'
                      ? 'w-[315px] min-h-[460px] p-7'
                      : 'w-[380px] min-h-[550px] p-9'
                  }`}
                  style={{
                    border: '3px solid #30673A',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(48, 103, 58, 0.25)',
                  }}
                >
                  {/* Subtle Inner Decorative Border */}
                  <div
                    className="absolute inset-2.5 rounded-xl pointer-events-none"
                    style={{
                      border: '1px solid #30673A',
                      opacity: 0.35,
                    }}
                  />

                  {/* Corner Flourishes */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#30673A]" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#30673A]" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#30673A]" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#30673A]" />

                  {/* 1. TOP SECTION — Hotel Branding */}
                  <div className="w-full space-y-1 z-10 pt-1">
                    <h2
                      className="text-2xl sm:text-3xl font-bold tracking-tight text-[#30673A] glinster-font uppercase leading-tight line-clamp-2"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {customBrandName}
                    </h2>

                    {customTagline && (
                      <div className="text-[11px] font-bold tracking-widest text-[#E3792F] uppercase">
                        {customTagline}
                      </div>
                    )}

                    {/* Table Number Pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-[#30673A]/30 mt-2 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E3792F]" />
                      <span className="text-xs font-black tracking-wider uppercase text-[#30673A] font-mono">
                        {qrMode === 'universal'
                          ? 'ENTER TABLE # ON SCAN'
                          : (editableTableNumber || selectedTable?.tableNumber || 'TABLE 04')}
                      </span>
                    </div>
                  </div>

                  {/* 2. MIDDLE SECTION — High-Contrast Centered QR Code */}
                  <div
                    className="my-4 p-3.5 rounded-2xl border-2 border-[#30673A] shadow-md z-10 flex flex-col items-center justify-center transition-colors"
                    style={{ backgroundColor: qrBgColor }}
                  >
                    {usePlaceholderQr ? (
                      /* Placeholder mode for visual approval */
                      <div className="w-44 h-44 border-2 border-dashed border-[#30673A] bg-[#FAF8F2] flex flex-col items-center justify-center p-4 text-center rounded-lg">
                        <div className="text-xs font-mono font-bold text-[#30673A] uppercase tracking-wider">
                          [ DEMO QR CODE ]
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1 leading-snug">
                          Visual Approval Placeholder
                        </div>
                      </div>
                    ) : qrDataUrl ? (
                      /* Active Functional Scannable QR */
                      <img
                        src={qrDataUrl}
                        alt="QR Code Table Stand"
                        className="w-44 h-44 rounded-lg"
                      />
                    ) : (
                      <div className="w-44 h-44 bg-neutral-200 animate-pulse rounded-lg flex items-center justify-center text-xs text-neutral-500">
                        Generating QR Code...
                      </div>
                    )}
                  </div>

                  {/* Optional Wi-Fi box */}
                  {showWifi && (
                    <div className="mb-2 px-3 py-1 rounded-lg bg-white/70 border border-[#30673A]/20 text-[10px] text-[#30673A] font-semibold z-10">
                      📶 Wi-Fi: <span className="font-bold">{wifiSsid}</span> · Pass: <span className="font-mono">{wifiPassword}</span>
                    </div>
                  )}

                  {/* 3. INSTRUCTION BELOW QR CODE */}
                  <div className="w-full space-y-1 z-10 pb-2">
                    <div className="text-xs sm:text-sm font-bold text-[#30673A] tracking-wider uppercase font-sans">
                      {customInstruction}
                    </div>
                    <p className="text-[10px] text-neutral-600 max-w-xs mx-auto leading-tight">
                      {qrMode === 'universal'
                        ? 'Point camera to scan · You will be prompted to enter table number'
                        : 'Point phone camera at QR code · No app installation required'}
                    </p>
                  </div>

                  {/* 4. BOTTOM SECTION — Powered by AuraDine */}
                  <div className="w-full pt-2 border-t border-[#30673A]/20 z-10 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-[#30673A] tracking-tight">
                      Powered by <strong className="font-bold">AuraDine</strong>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 mt-4 text-center no-print">
                  Exact {standFormat.toUpperCase()} print format ({qrMode === 'universal' ? 'Single Universal Stand' : `Bound to ${editableTableNumber}`} · Matte Finish Recommended)
                </p>
              </div>
            )}

            {/* VIEW MODE 2: 3D REALISTIC TABLETOP ACRYLIC STAND MOCKUP */}
            {viewMode === 'tabletop_3d' && (
              <div className="w-full max-w-lg flex flex-col items-center justify-center py-6">
                
                {/* 3D Acrylic Stand Assembly on Restaurant Table Surface */}
                <div className="relative w-full flex flex-col items-center">
                  
                  {/* Freestanding Clear Acrylic Stand Frame with Glass Bevel Reflection */}
                  <div
                    className="relative w-[290px] h-[420px] bg-[#E9E9C7] rounded-t-xl p-6 flex flex-col justify-between items-center text-center shadow-2xl border-4 border-white/60"
                    style={{
                      boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7), 0 0 0 6px rgba(255,255,255,0.2)',
                      transform: 'perspective(1000px) rotateX(4deg)',
                    }}
                  >
                    {/* Glass Sheen Gradient Overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 pointer-events-none rounded-t-lg"
                      style={{ zIndex: 20 }}
                    />

                    {/* Inner Content */}
                    <div className="w-full space-y-1 pt-1 z-10">
                      <h3 className="text-2xl font-bold tracking-tight text-[#30673A] glinster-font uppercase">
                        {customBrandName}
                      </h3>
                      <div className="text-[10px] font-bold tracking-widest text-[#E3792F] uppercase">
                        {customTagline}
                      </div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/70 border border-[#30673A]/30 text-[11px] font-bold text-[#30673A]">
                        {qrMode === 'universal' ? 'ALL TABLES' : editableTableNumber}
                      </div>
                    </div>

                    {/* QR Code in Acrylic */}
                    <div
                      className="p-2.5 rounded-xl border-2 border-[#30673A] shadow-md z-10"
                      style={{ backgroundColor: qrBgColor }}
                    >
                      {qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="QR Mockup"
                          className="w-36 h-36 rounded-md"
                        />
                      )}
                    </div>

                    <div className="w-full space-y-0.5 z-10 pb-1">
                      <div className="text-xs font-bold text-[#30673A] uppercase tracking-wide">
                        {customInstruction}
                      </div>
                      <div className="text-[9px] text-neutral-600">
                        {qrMode === 'universal' ? 'Write table # upon scan' : 'Instant Contactless Dining'}
                      </div>
                    </div>

                    <div className="w-full pt-1.5 border-t border-[#30673A]/20 z-10">
                      <span className="text-[10px] text-[#30673A] font-semibold">
                        Powered by <strong>AuraDine</strong>
                      </span>
                    </div>
                  </div>

                  {/* Realistic Clear Acrylic Base Foot */}
                  <div
                    className="w-[330px] h-7 bg-white/70 rounded-md border border-white/90 shadow-2xl flex items-center justify-center -mt-1 z-10"
                    style={{
                      boxShadow: '0 15px 35px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.9)',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(220,225,220,0.6) 100%)',
                    }}
                  >
                    <div className="w-48 h-1 bg-[#30673A]/30 rounded-full" />
                  </div>

                  {/* Surface Shadow */}
                  <div className="w-[360px] h-4 bg-black/50 blur-md rounded-full mt-1" />
                </div>
              </div>
            )}

            {/* VIEW MODE 3: DOUBLE-SIDED TENT FOLD */}
            {viewMode === 'tent_fold' && (
              <div className="w-full flex flex-col items-center py-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border border-dashed border-neutral-700 p-6 rounded-2xl bg-neutral-950">
                  {/* Front Side */}
                  <div className="w-[220px] h-[310px] bg-[#E9E9C7] rounded-xl p-4 flex flex-col justify-between items-center text-center border-2 border-[#30673A]">
                    <div className="text-xs font-bold text-[#30673A] glinster-font uppercase">
                      {customBrandName}
                    </div>
                    {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-24 h-24" />}
                    <div className="text-[9px] font-bold text-[#30673A]">FRONT FACE</div>
                  </div>

                  {/* Fold Line */}
                  <div className="h-40 border-l-2 border-dashed border-neutral-600 hidden sm:block" />

                  {/* Reverse Side */}
                  <div className="w-[220px] h-[310px] bg-[#E9E9C7] rounded-xl p-4 flex flex-col justify-between items-center text-center border-2 border-[#30673A]">
                    <div className="text-xs font-bold text-[#30673A] glinster-font uppercase">
                      {customBrandName}
                    </div>
                    {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-24 h-24" />}
                    <div className="text-[9px] font-bold text-[#30673A]">REVERSE FACE</div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
