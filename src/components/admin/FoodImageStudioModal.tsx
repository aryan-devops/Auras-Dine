import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  Check,
  RefreshCw,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface FoodImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  itemName?: string;
  onSelectImage: (imageDataUrl: string) => void;
}

// Curated upscale gourmet dish photography presets
const GOURMET_PRESETS = [
  {
    name: 'Honey Glazed Chicken',
    category: 'Chicken & Poultry',
    url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pistachio Smoked Paneer Tikka',
    category: 'Starters & Tandoor',
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tangerine-Glazed Chicken Tikka',
    category: 'Starters & Grills',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Velvet 24-Hour Dal Makhani',
    category: 'Heirloom Mains',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Nizami Saffron Chicken Biryani',
    category: 'Fragrant Rice',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Harvest Quinoa & Avocado Vegan Bowl',
    category: 'Plant-Based & Healthy',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Campania Truffle Margherita',
    category: 'Stone-Oven Pizzas',
    url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Artisan Double Truffle Burger',
    category: 'Smash Burgers',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Warm Pistachio & Dark Chocolate Skillet',
    category: 'Whimsical Desserts',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Citrus Blossom & Juniper Tonic',
    category: 'Artisanal Drinks',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Golden Saffron Risotto',
    category: 'Gourmet Mains',
    url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Crispy Rosemary Calamari',
    category: 'Seafood Tapas',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
];

export const FoodImageStudioModal: React.FC<FoodImageStudioModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  itemName = 'Dish',
  onSelectImage,
}) => {
  const [tab, setTab] = useState<'upload' | 'camera' | 'presets'>('upload');
  const [previewImage, setPreviewImage] = useState<string>(currentImage || '');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setPreviewImage(currentImage || '');
  }, [currentImage, isOpen]);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to access camera.';
      setCameraError(
        `${msg} You can use the device photo capture button below instead.`
      );
      setIsCameraActive(false);
    }
  };

  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (previewImage) {
      onSelectImage(previewImage);
    }
    stopCamera();
    onClose();
  };

  const handleClear = () => {
    setPreviewImage('');
    onSelectImage('');
    stopCamera();
    onClose();
  };

  const handleTabChange = (newTab: 'upload' | 'camera' | 'presets') => {
    if (tab === 'camera' && newTab !== 'camera') {
      stopCamera();
    }
    setTab(newTab);
    if (newTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-studio-title"
      onClick={() => {
        stopCamera();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF8F2] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#30673A]/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#30673A]/10 text-[#30673A] font-mono">
                Food Image Studio
              </span>
            </div>
            <h2 id="image-studio-title" className="text-lg sm:text-xl font-bold text-[#1E231F] glinster-font mt-0.5">
              Food Photography · {itemName}
            </h2>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-neutral-200/60">
          <button
            type="button"
            onClick={() => handleTabChange('upload')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'upload'
                ? 'bg-[#30673A] text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('camera')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'camera'
                ? 'bg-[#30673A] text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Photo (Camera)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('presets')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              tab === 'presets'
                ? 'bg-[#30673A] text-white shadow-xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E3792F]" />
            <span>Gourmet Presets</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {/* TAB 1: UPLOAD */}
          {tab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#30673A]/30 hover:border-[#30673A] rounded-2xl p-8 text-center bg-white cursor-pointer transition-colors flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E9E9C7]/50 text-[#30673A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1E231F] mb-1">
                  Click to Browse or Drop Food Photo Here
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm">
                  PNG, JPG, or WebP. High-resolution dish photos appear beautifully on the customer menu card.
                </p>
              </div>

              {previewImage && (
                <div className="bg-white p-3 rounded-2xl border border-neutral-200 space-y-2">
                  <span className="text-xs font-bold text-neutral-700 block">
                    Active Preview
                  </span>
                  <div className="relative rounded-xl overflow-hidden h-48 bg-neutral-100 border border-neutral-200">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE CAMERA */}
          {tab === 'camera' && (
            <div className="space-y-4">
              {/* Native mobile camera fallback input */}
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-neutral-800 shadow-inner">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder crosshairs */}
                    <div className="absolute inset-8 border border-white/40 pointer-events-none rounded-xl" />
                  </>
                ) : (
                  <div className="p-6 text-center text-white space-y-3">
                    <Camera className="w-10 h-10 text-neutral-400 mx-auto" />
                    <p className="text-xs text-neutral-300 max-w-sm">
                      {cameraError || 'Camera feed paused or waiting for permission.'}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-2 px-4 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Start Live Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => mobileCameraInputRef.current?.click()}
                        className="py-2 px-4 rounded-xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Use Device Camera App
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shutter button if live */}
              {isCameraActive && (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={capturePhotoFromVideo}
                    className="py-3 px-6 rounded-full bg-[#E3792F] hover:bg-[#c96420] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Dish Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => mobileCameraInputRef.current?.click()}
                    className="py-3 px-4 rounded-full bg-white border border-neutral-300 text-neutral-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Use Device Camera
                  </button>
                </div>
              )}

              {previewImage && !isCameraActive && (
                <div className="bg-white p-3 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700">
                      Captured Photo
                    </span>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="text-xs text-[#30673A] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retake
                    </button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden h-48 bg-neutral-100 border border-neutral-200">
                    <img
                      src={previewImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GOURMET GALLERY PRESETS */}
          {tab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                Select from our curated restaurant food photography library:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {GOURMET_PRESETS.map((preset) => {
                  const isSelected = previewImage === preset.url;
                  return (
                    <div
                      key={preset.name}
                      onClick={() => setPreviewImage(preset.url)}
                      className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#30673A] ring-2 ring-[#30673A]/20 scale-102'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <div className="aspect-4/3 w-full bg-neutral-200 overflow-hidden">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 bg-white">
                        <h5 className="text-[11px] font-bold text-[#1E231F] truncate">
                          {preset.name}
                        </h5>
                        <span className="text-[10px] text-neutral-400 block truncate">
                          {preset.category}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#30673A] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-3">
          {previewImage ? (
            <button
              type="button"
              onClick={handleClear}
              className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!previewImage}
              className="py-2.5 px-5 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Apply Dish Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
