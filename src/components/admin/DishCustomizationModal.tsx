import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Layers, Check, AlertCircle } from 'lucide-react';
import { MenuItem, MenuItemVariant, MenuItemAddon } from '../../types';

interface DishCustomizationModalProps {
  isOpen: boolean;
  dish: MenuItem | null;
  currencySymbol: string;
  onClose: () => void;
  onSave: (
    dishId: string,
    variants: MenuItemVariant[] | undefined,
    addons: MenuItemAddon[] | undefined
  ) => void;
}

export const DishCustomizationModal: React.FC<DishCustomizationModalProps> = ({
  isOpen,
  dish,
  currencySymbol,
  onClose,
  onSave,
}) => {
  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  const [addons, setAddons] = useState<MenuItemAddon[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'variants' | 'addons'>('variants');

  useEffect(() => {
    if (dish) {
      setVariants(dish.variants ? JSON.parse(JSON.stringify(dish.variants)) : []);
      setAddons(dish.addons ? JSON.parse(JSON.stringify(dish.addons)) : []);
    }
  }, [dish]);

  if (!isOpen || !dish) return null;

  // Add a new blank variant
  const handleAddVariant = () => {
    const newId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isFirst = variants.length === 0;
    setVariants((prev) => [
      ...prev,
      {
        id: newId,
        name: isFirst ? 'Regular Portion' : '',
        priceDelta: 0,
      },
    ]);
  };

  // Add a new blank add-on
  const handleAddAddon = () => {
    const newId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setAddons((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        price: 1.5,
      },
    ]);
  };

  // Quick preset helpers for variants
  const applyVariantPreset = (type: 'half_full' | 'regular_large' | 'single_platter') => {
    if (type === 'half_full') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Half Plate', priceDelta: 0 },
        { id: `v-${Date.now()}-2`, name: 'Full Plate', priceDelta: 4.5 },
      ]);
    } else if (type === 'regular_large') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Regular Portion', priceDelta: 0 },
        { id: `v-${Date.now()}-2`, name: 'Large / Sharing', priceDelta: 5.5 },
      ]);
    } else if (type === 'single_platter') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Individual Bowl', priceDelta: 0 },
        { id: `v-${Date.now()}-2`, name: 'Sharing Platter (2-3 Pax)', priceDelta: 7.0 },
      ]);
    }
  };

  // Quick preset helper for add-ons
  const addAddonPreset = (name: string, price: number) => {
    const newId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setAddons((prev) => [...prev, { id: newId, name, price }]);
  };

  const handleSave = () => {
    const cleanVariants = variants
      .filter((v) => v.name.trim().length > 0)
      .map((v) => ({
        id: v.id || `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: v.name.trim(),
        priceDelta: Number(v.priceDelta) || 0,
      }));

    const cleanAddons = addons
      .filter((a) => a.name.trim().length > 0)
      .map((a) => ({
        id: a.id || `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: a.name.trim(),
        price: Math.max(0, Number(a.price) || 0),
      }));

    onSave(
      dish.id,
      cleanVariants.length > 0 ? cleanVariants : undefined,
      cleanAddons.length > 0 ? cleanAddons : undefined
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-customization-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-neutral-200/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                {dish.imagePath ? (
                  <img
                    src={dish.imagePath}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-400">
                    DISH
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#07543a] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Customize Options</span>
                </div>
                <h3
                  id="dish-customization-title"
                  className="text-base font-bold text-[#151815] glinster-font truncate"
                >
                  {dish.name}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  Base Price: {currencySymbol}{dish.basePrice.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtabs for Variants vs Addons */}
          <div className="grid grid-cols-2 gap-1.5 mt-3 bg-[#FAF8F5] p-1 rounded-xl border border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActiveSubTab('variants')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'variants'
                  ? 'bg-white text-[#07543a] shadow-2xs font-extrabold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Portion Sizes ({variants.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('addons')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'addons'
                  ? 'bg-white text-[#07543a] shadow-2xs font-extrabold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add-on Extras ({addons.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {activeSubTab === 'variants' ? (
            <div className="space-y-4">
              {/* Presets */}
              <div className="p-3 bg-white rounded-xl border border-neutral-200/80">
                <div className="text-[11px] font-bold text-neutral-600 mb-2">
                  Quick Size Presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('regular_large')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Regular / Large (+{currencySymbol}5.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('half_full')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Half / Full (+{currencySymbol}4.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyVariantPreset('single_platter')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Single / Platter (+{currencySymbol}7.00)
                  </button>
                </div>
              </div>

              {/* Variants List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700">
                    Configured Portion Sizes:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#07543a] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size Option</span>
                  </button>
                </div>

                {variants.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-neutral-300 text-center space-y-2">
                    <p className="text-xs text-neutral-500">
                      No portion size variants configured. The dish will sell at the standard base price ({currencySymbol}{dish.basePrice.toFixed(2)}).
                    </p>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 rounded-lg bg-[#07543a] text-white text-xs font-bold hover:bg-[#053d2a] cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Size Variant</span>
                    </button>
                  </div>
                ) : (
                  variants.map((v, index) => {
                    const finalPrice = dish.basePrice + (Number(v.priceDelta) || 0);
                    return (
                      <div
                        key={v.id || index}
                        className="p-3 bg-white rounded-xl border border-neutral-200/90 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-neutral-400">
                            Size #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setVariants((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="p-1 text-neutral-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                            title="Remove size"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                              Portion Name *
                            </label>
                            <input
                              type="text"
                              value={v.name}
                              placeholder="e.g. Regular Platter (4 pcs)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setVariants((prev) =>
                                  prev.map((item, i) =>
                                    i === index ? { ...item, name: val } : item
                                  )
                                );
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                              Price Adjustment (+{currencySymbol})
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.50"
                                value={v.priceDelta}
                                placeholder="0.00"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setVariants((prev) =>
                                    prev.map((item, i) =>
                                      i === index ? { ...item, priceDelta: val } : item
                                    )
                                  );
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5] font-mono focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                              />
                              <span className="text-[10px] font-mono font-bold text-[#07543a] shrink-0">
                                ={currencySymbol}{finalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Presets for addons */}
              <div className="p-3 bg-white rounded-xl border border-neutral-200/80">
                <div className="text-[11px] font-bold text-neutral-600 mb-2">
                  Quick Add-on Presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => addAddonPreset('Extra Garlic Truffle Dip', 1.5)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Extra Dip (+{currencySymbol}1.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => addAddonPreset('Artisanal Garlic Naan', 2.5)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Garlic Naan (+{currencySymbol}2.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => addAddonPreset('Extra Smoked Cheese Grate', 2.0)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Extra Cheese (+{currencySymbol}2.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => addAddonPreset('Crisp Shallot Crunch', 1.0)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF8F5] hover:bg-[#EAE8D5]/40 text-[#07543a] rounded-lg border border-[#07543a]/20 transition-colors cursor-pointer"
                  >
                    + Crunch Topping (+{currencySymbol}1.00)
                  </button>
                </div>
              </div>

              {/* Addons List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700">
                    Configured Add-on Extras:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#07543a] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Extra Option</span>
                  </button>
                </div>

                {addons.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-neutral-300 text-center space-y-2">
                    <p className="text-xs text-neutral-500">
                      No optional add-ons configured for this dish. Diners will not see extra add-on choices.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddAddon}
                      className="px-3 py-1.5 rounded-lg bg-[#07543a] text-white text-xs font-bold hover:bg-[#053d2a] cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Add-on</span>
                    </button>
                  </div>
                ) : (
                  addons.map((addon, index) => (
                    <div
                      key={addon.id || index}
                      className="p-3 bg-white rounded-xl border border-neutral-200/90 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-neutral-400">
                          Extra #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddons((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="p-1 text-neutral-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          title="Remove extra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                            Add-on Name *
                          </label>
                          <input
                            type="text"
                            value={addon.name}
                            placeholder="e.g. Extra Truffle Mayo"
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddons((prev) =>
                                prev.map((item, i) =>
                                  i === index ? { ...item, name: val } : item
                                )
                              );
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                            Extra Price ({currencySymbol})
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={addon.price}
                            placeholder="1.50"
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setAddons((prev) =>
                                prev.map((item, i) =>
                                  i === index ? { ...item, price: val } : item
                                )
                              );
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5] font-mono focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-500">
            {variants.length} {variants.length === 1 ? 'size' : 'sizes'} · {addons.length}{' '}
            {addons.length === 1 ? 'add-on' : 'add-ons'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-4 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Customizations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
