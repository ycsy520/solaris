import React, { useState } from 'react';
import { FireConfig } from '../types';

interface ControlsProps {
  config: FireConfig;
  setConfig: React.Dispatch<React.SetStateAction<FireConfig>>;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (key: keyof FireConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isCollapsed) {
    return (
      <button 
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur border border-white/10 text-white p-2 rounded hover:bg-white/10 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    )
  }

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto z-40 font-mono text-sm text-gray-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-wider">OBSERVATORY_CONTROLS</h2>
        <button onClick={() => setIsCollapsed(true)} className="text-gray-500 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="space-y-6">
        <div className="border-b border-white/10 pb-2 mb-4 text-xs font-bold text-gray-500 uppercase">Spectroscopy & Dynamics</div>

        {/* Colors */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1">Photosphere (Core)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={config.colorCore}
                onChange={(e) => handleChange('colorCore', e.target.value)}
                className="bg-transparent h-8 w-8 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={config.colorCore} 
                readOnly 
                className="flex-1 bg-black/30 border border-white/10 rounded px-2 text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1">Chromosphere (Edge)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={config.colorOuter}
                onChange={(e) => handleChange('colorOuter', e.target.value)}
                className="bg-transparent h-8 w-8 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={config.colorOuter} 
                readOnly 
                className="flex-1 bg-black/30 border border-white/10 rounded px-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <RangeControl label="Rotation Period" value={config.speed} min={0} max={5} step={0.1} onChange={(v) => handleChange('speed', v)} />
          <RangeControl label="Ejection Magnitude" value={config.turbulence} min={0} max={5} step={0.1} onChange={(v) => handleChange('turbulence', v)} />
          <RangeControl label="Surface Displacement" value={config.displacementScale} min={0} max={1} step={0.01} onChange={(v) => handleChange('displacementScale', v)} />
          <RangeControl label="Granulation Frequency" value={config.noiseScale} min={0.1} max={10} step={0.1} onChange={(v) => handleChange('noiseScale', v)} />
          <RangeControl label="Stellar Radius" value={config.scale} min={0.5} max={3} step={0.1} onChange={(v) => handleChange('scale', v)} />
        </div>
      </div>
      
      <div className="mt-8 text-[10px] text-gray-600 border-t border-white/5 pt-4">
        <p>TELESCOPE: SDO-LIKE</p>
        <p>ALGORITHM: MAGENTO-HYDRODYNAMIC APPROX</p>
        <p>BUILD: v3.0.0-SOLARIS</p>
      </div>
    </div>
  );
};

const RangeControl = ({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void }) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-xs">{label}</label>
      <span className="text-xs font-bold text-yellow-500">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-yellow-400"
    />
  </div>
);

export default Controls;