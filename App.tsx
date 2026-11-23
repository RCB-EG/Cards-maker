import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  Download, 
  Upload, 
  Move,
  Dices
} from 'lucide-react';
import CardCanvas, { CardCanvasHandle } from './components/CardCanvas';
import { 
  RapperCardData, 
  CardRarity, 
  AspectRatio, 
  ImageSize, 
  CardStats,
  DEFAULT_SUPERPOWERS,
  SuperPower,
  RarityConfig,
  DEFAULT_RARITY_CONFIGS,
  CardRarityValues
} from './types';

const INITIAL_STATS: CardStats = {
  ovr: 82,
  lyricism: 83,
  flow: 83,
  sing: 82,
  live: 82,
  diss: 78,
  charisma: 82
};

const INITIAL_DATA: RapperCardData = {
  name: "3AB3AZ",
  rarity: CardRarityValues.GOLD,
  stats: INITIAL_STATS,
  image: null,
  imagePosition: { x: 0, y: 0, scale: 1 },
  superpowers: []
};

export default function App() {
  const [rarityConfigs, setRarityConfigs] = useState<RarityConfig[]>(() => {
    try {
      const saved = localStorage.getItem('customRarities');
      if (saved) {
        const parsed = JSON.parse(saved) as RarityConfig[];
        return parsed.map(c => {
          const matchedDefault = DEFAULT_RARITY_CONFIGS.find(d => d.id === c.id);
          return {
            ...c,
            textColorName: c.textColorName || matchedDefault?.textColorName || '#0a0a0a',
            textColorStatsLabel: c.textColorStatsLabel || matchedDefault?.textColorStatsLabel || '#5c4d3c',
            textColorStatsValue: c.textColorStatsValue || matchedDefault?.textColorStatsValue || '#0a0a0a',
            textColorOvr: c.textColorOvr || matchedDefault?.textColorOvr || '#F5E6C8',
          };
        });
      }
      return DEFAULT_RARITY_CONFIGS;
    } catch {
      return DEFAULT_RARITY_CONFIGS;
    }
  });
  const [availableSuperpowers, setAvailableSuperpowers] = useState<SuperPower[]>(() => {
    try {
      const saved = localStorage.getItem('customSuperpowers');
      return saved ? JSON.parse(saved) : DEFAULT_SUPERPOWERS;
    } catch {
      return DEFAULT_SUPERPOWERS;
    }
  });
  const [raritiesSaved, setRaritiesSaved] = useState(false);
  const [superpowersSaved, setSuperpowersSaved] = useState(false);
  
  const saveRarities = () => {
    localStorage.setItem('customRarities', JSON.stringify(rarityConfigs));
    setRaritiesSaved(true);
    setTimeout(() => setRaritiesSaved(false), 2000);
  };

  const saveSuperpowers = () => {
    localStorage.setItem('customSuperpowers', JSON.stringify(availableSuperpowers));
    setSuperpowersSaved(true);
    setTimeout(() => setSuperpowersSaved(false), 2000);
  };

  const [cardData, setCardData] = useState<RapperCardData>(INITIAL_DATA);
  
  const canvasRef = useRef<CardCanvasHandle>(null);

  // Handlers
  const handleInputChange = (field: keyof RapperCardData, value: any) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (stat: keyof CardStats, value: number) => {
    setCardData(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: value }
    }));
  };

  const toggleSuperpower = (power: SuperPower) => {
    setCardData(prev => {
      const exists = prev.superpowers.find(p => p.id === power.id);
      if (exists) {
        return {
          ...prev,
          superpowers: prev.superpowers.filter(p => p.id !== power.id)
        };
      } else {
        if (prev.superpowers.length >= 4) return prev;
        return {
          ...prev,
          superpowers: [...prev.superpowers, power]
        };
      }
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleInputChange('image', event.target.result as string);
          // Reset position on new image
          setCardData(prev => ({ ...prev, imagePosition: { x: 0, y: 0, scale: 1 } }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const adjustPosition = (dx: number, dy: number, dScale: number) => {
    setCardData(prev => ({
      ...prev,
      imagePosition: {
        x: prev.imagePosition.x + dx,
        y: prev.imagePosition.y + dy,
        scale: Math.max(0.1, prev.imagePosition.scale + dScale)
      }
    }));
  };

  const handleRandomizeStats = () => {
    const ovr = cardData.stats.ovr;
    
    // Base offsets to ensure the average of face stats is slightly lower than OVR
    // Example for 85 OVR: +1, +1, -2, -2, -5, -5
    const baseOffsets = [1, 1, -2, -2, -5, -5];
    
    // Add a little bit of noise (-1, 0, or +1) to each offset for variety
    const noisyOffsets = baseOffsets.map(offset => offset + Math.floor(Math.random() * 3) - 1);
    
    // Shuffle the offsets
    for (let i = noisyOffsets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [noisyOffsets[i], noisyOffsets[j]] = [noisyOffsets[j], noisyOffsets[i]];
    }

    const applyOffset = (index: number) => {
      return Math.max(1, Math.min(99, ovr + noisyOffsets[index]));
    };

    setCardData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        lyricism: applyOffset(0),
        flow: applyOffset(1),
        sing: applyOffset(2),
        live: applyOffset(3),
        diss: applyOffset(4),
        charisma: applyOffset(5)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-yellow-500 to-amber-700 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette w-8 h-8 text-white"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
              RAPPER CARD FORGE
            </h1>
            <p className="text-gray-400 text-sm">Create Legendary Trading Cards</p>
          </div>
        </div>
        <button 
          onClick={() => canvasRef.current?.download()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-green-500/20"
        >
          <Download className="w-5 h-5" />
          Download Card
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Card Identity */}
          <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-yellow-500">01.</span> Identity & Base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rapper Name</label>
                <input 
                  type="text" 
                  value={cardData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 focus:border-yellow-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rarity</label>
                <select 
                  value={cardData.rarity}
                  onChange={(e) => handleInputChange('rarity', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 outline-none"
                >
                  {rarityConfigs.map(c => (
                    <option key={c.id} value={c.id}>{c.id}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 2. Image Upload */}
          <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-blue-500">02.</span> Visual Studio
            </h2>
            
            <div className="space-y-4">
              <div className="border-t border-neutral-700 pt-4">
                 <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 hover:bg-neutral-800 p-3 rounded transition-colors justify-center border border-dashed border-gray-600">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Upload your own PNG</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                 </label>
              </div>
            </div>
          </section>

          {/* 3. Positioning Controls */}
          <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-green-500">03.</span> Composition
            </h2>
            <div className="flex gap-4 items-center justify-center bg-neutral-900 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-2">
                    <button className="bg-neutral-700 p-2 rounded hover:bg-neutral-600" onClick={() => adjustPosition(-10, 0, 0)}>←</button>
                    <div className="flex flex-col gap-2">
                         <button className="bg-neutral-700 p-2 rounded hover:bg-neutral-600" onClick={() => adjustPosition(0, -10, 0)}>↑</button>
                         <button className="bg-neutral-700 p-2 rounded hover:bg-neutral-600" onClick={() => adjustPosition(0, 10, 0)}>↓</button>
                    </div>
                    <button className="bg-neutral-700 p-2 rounded hover:bg-neutral-600" onClick={() => adjustPosition(10, 0, 0)}>→</button>
                </div>
                <div className="border-l border-neutral-700 h-16 mx-4"></div>
                <div className="flex flex-col gap-2">
                    <button className="bg-neutral-700 px-4 py-2 rounded hover:bg-neutral-600" onClick={() => adjustPosition(0, 0, 0.1)}>+</button>
                    <Move className="w-6 h-6 text-gray-500 self-center" />
                    <button className="bg-neutral-700 px-4 py-2 rounded hover:bg-neutral-600" onClick={() => adjustPosition(0, 0, -0.1)}>-</button>
                </div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Adjust position & scale of the rapper image</p>
          </section>

          {/* 4. Stats */}
           <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-red-500">04.</span> Power Stats
               </h2>
               <button 
                 onClick={handleRandomizeStats}
                 className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 px-3 py-1.5 rounded text-sm font-medium transition-colors"
               >
                 <Dices className="w-4 h-4 text-yellow-500" />
                 Randomize
               </button>
             </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(INITIAL_STATS).map((statKey) => (
                    <div key={statKey}>
                        <label className="block text-xs uppercase text-gray-400 mb-1">{statKey}</label>
                        <input 
                            type="number" 
                            min="0" max="99"
                            value={cardData.stats[statKey as keyof CardStats]} 
                            onChange={(e) => handleStatChange(statKey as keyof CardStats, parseInt(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-center font-bold font-mono"
                        />
                    </div>
                ))}
            </div>
           </section>

          {/* 5. Superpowers */}
           <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-500">05.</span> Superpowers (Max 4)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSuperpowers.map(power => {
                const isSelected = cardData.superpowers.some(p => p.id === power.id);
                return (
                  <button
                    key={power.id}
                    onClick={() => toggleSuperpower(power)}
                    disabled={!isSelected && cardData.superpowers.length >= 4}
                    className={`
                      relative p-2 rounded-lg border text-left transition-all flex flex-col items-center gap-2
                      ${isSelected 
                        ? 'bg-purple-900/50 border-purple-500' 
                        : 'bg-neutral-900 border-neutral-700 hover:border-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed'
                      }
                    `}
                  >
                    <img src={power.iconUrl} alt={power.name} className="w-10 h-10 object-contain" />
                    <span className="text-xs font-bold text-center leading-tight">{power.name}</span>
                    {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                  </button>
                );
              })}
            </div>
           </section>

          {/* 6. Custom Rarities */}
          <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-500">06.</span> Custom Rarities
            </h2>
            <p className="text-sm text-gray-400 mb-4">Modify existing rarity backgrounds, or add brand new rarities.</p>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {rarityConfigs.map((config, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-neutral-900 p-4 rounded-lg border border-neutral-700 relative group">
                      <div className="flex justify-between items-center gap-2">
                        <input 
                           type="text"
                           value={config.id}
                           onChange={e => {
                              const newConfigs = [...rarityConfigs];
                              const oldId = newConfigs[idx].id;
                              const newId = e.target.value;
                              newConfigs[idx].id = newId;
                              setRarityConfigs(newConfigs);
                              if (cardData.rarity === oldId) {
                                  handleInputChange('rarity', newId);
                              }
                           }}
                           placeholder="Rarity Name (e.g. CUSTOM ELITE)"
                           className="flex-1 bg-neutral-800 border border-neutral-600 rounded p-2 font-bold focus:border-orange-500 outline-none transition-colors"
                        />
                        {rarityConfigs.length > 1 && (
                          <button
                            onClick={() => {
                              const newConfigs = rarityConfigs.filter((_, i) => i !== idx);
                              setRarityConfigs(newConfigs);
                              if (cardData.rarity === config.id) {
                                handleInputChange('rarity', newConfigs[0].id);
                              }
                            }}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-500 p-2 rounded transition-colors"
                            title="Delete Rarity"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                      <input 
                         type="text"
                         value={config.imageUrl}
                         onChange={e => {
                            const newConfigs = [...rarityConfigs];
                            newConfigs[idx].imageUrl = e.target.value;
                            setRarityConfigs(newConfigs);
                         }}
                         placeholder="Background Image URL"
                         className="bg-neutral-800 border border-neutral-600 rounded p-2 text-sm focus:border-orange-500 outline-none transition-colors"
                      />
                      <input 
                         type="text"
                         value={config.videoUrl || ''}
                         onChange={e => {
                            const newConfigs = [...rarityConfigs];
                            newConfigs[idx].videoUrl = e.target.value;
                            setRarityConfigs(newConfigs);
                         }}
                         placeholder="Animated Video URL (Optional)"
                         className="bg-neutral-800 border border-neutral-600 rounded p-2 text-sm focus:border-orange-500 outline-none transition-colors"
                      />
                      
                      {/* Color Overrides */}
                      <div className="grid grid-cols-2 gap-2 mt-2 bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Name Text Color</label>
                          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1">
                            <input 
                              type="color"
                              value={config.textColorName || '#0a0a0a'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorName = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent block"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={config.textColorName || '#0a0a0a'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorName = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-full bg-transparent text-[10px] outline-none font-mono text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Stats Labels</label>
                          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1">
                            <input 
                              type="color"
                              value={config.textColorStatsLabel || '#5c4d3c'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorStatsLabel = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent block"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={config.textColorStatsLabel || '#5c4d3c'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorStatsLabel = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-full bg-transparent text-[10px] outline-none font-mono text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Stats Values</label>
                          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1">
                            <input 
                              type="color"
                              value={config.textColorStatsValue || '#0a0a0a'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorStatsValue = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent block"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={config.textColorStatsValue || '#0a0a0a'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorStatsValue = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-full bg-transparent text-[10px] outline-none font-mono text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">OVR Number</label>
                          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 rounded px-1.5 py-1">
                            <input 
                              type="color"
                              value={config.textColorOvr || '#F5E6C8'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorOvr = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent block"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={config.textColorOvr || '#F5E6C8'}
                              onChange={e => {
                                const newConfigs = [...rarityConfigs];
                                newConfigs[idx].textColorOvr = e.target.value;
                                setRarityConfigs(newConfigs);
                              }}
                              className="w-full bg-transparent text-[10px] outline-none font-mono text-white"
                            />
                          </div>
                        </div>
                      </div>
                  </div>
               ))}
            </div>
            <div className="flex gap-2 mt-4">
                <button 
                    onClick={() => setRarityConfigs([...rarityConfigs, { 
                      id: 'NEW RARITY ' + (rarityConfigs.length + 1), 
                      imageUrl: 'https://i.imghippo.com/files/tUt8745JBc.png',
                      textColorName: '#0a0a0a',
                      textColorStatsLabel: '#5c4d3c',
                      textColorStatsValue: '#0a0a0a',
                      textColorOvr: '#F5E6C8'
                    }])}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 py-3 rounded font-bold transition-colors text-sm"
                >
                    + Add New Rarity
                </button>
                <button 
                    onClick={saveRarities}
                    className={`flex-1 py-3 rounded font-bold transition-colors text-sm ${raritiesSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                    {raritiesSaved ? "✓ Saved!" : "Save Rarities"}
                </button>
            </div>
          </section>

          {/* 7. Custom Superpowers */}
          <section className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-500">07.</span> Custom Superpowers
            </h2>
            <p className="text-sm text-gray-400 mb-4">Modify existing superpowers, or add brand new ones.</p>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               {availableSuperpowers.map((power, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-neutral-900 p-4 rounded-lg border border-neutral-700 relative group">
                      <div className="flex justify-between items-center gap-2">
                        <input 
                           type="text"
                           value={power.name}
                           onChange={e => {
                              const newPowers = [...availableSuperpowers];
                              newPowers[idx].name = e.target.value;
                              setAvailableSuperpowers(newPowers);
                           }}
                           placeholder="Power Name (e.g. Master of Flow)"
                           className="flex-1 bg-neutral-800 border border-neutral-600 rounded p-2 font-bold focus:border-purple-500 outline-none transition-colors"
                        />
                        {availableSuperpowers.length > 1 && (
                          <button
                            onClick={() => {
                              const newPowers = availableSuperpowers.filter((_, i) => i !== idx);
                              setAvailableSuperpowers(newPowers);
                              // Remove from selected superpowers if it was selected
                              if (cardData.superpowers.find(p => p.id === power.id)) {
                                setCardData(prev => ({
                                  ...prev,
                                  superpowers: prev.superpowers.filter(p => p.id !== power.id)
                                }));
                              }
                            }}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-500 p-2 rounded transition-colors"
                            title="Delete Superpower"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                      <input 
                         type="text"
                         value={power.iconUrl}
                         onChange={e => {
                            const newPowers = [...availableSuperpowers];
                            newPowers[idx].iconUrl = e.target.value;
                            setAvailableSuperpowers(newPowers);
                            // Also update selected superpowers to reflect the new icon
                            if (cardData.superpowers.find(p => p.id === power.id)) {
                              setCardData(prev => ({
                                ...prev,
                                superpowers: prev.superpowers.map(p => p.id === power.id ? { ...p, iconUrl: e.target.value } : p)
                              }));
                            }
                         }}
                         placeholder="Icon URL"
                         className="bg-neutral-800 border border-neutral-600 rounded p-2 text-sm focus:border-purple-500 outline-none transition-colors"
                      />
                  </div>
               ))}
            </div>
            <div className="flex gap-2 mt-4">
                <button 
                    onClick={() => setAvailableSuperpowers([...availableSuperpowers, { id: 'new-power-' + Date.now(), name: 'New Power', iconUrl: '' }])}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 py-3 rounded font-bold transition-colors text-sm"
                >
                    + Add Superpower
                </button>
                <button 
                    onClick={saveSuperpowers}
                    className={`flex-1 py-3 rounded font-bold transition-colors text-sm ${superpowersSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {superpowersSaved ? "✓ Saved!" : "Save Superpowers"}
                </button>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Preview */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-8">
                <h3 className="text-lg font-bold text-gray-400 mb-4 text-center">Live Preview</h3>
                <div className="flex justify-center">
                    <CardCanvas 
                        ref={canvasRef} 
                        data={cardData} 
                        rarityConfigs={rarityConfigs}
                        width={400} 
                        height={600} 
                    />
                </div>
                
            </div>
        </div>
      </main>
    </div>
  );
}