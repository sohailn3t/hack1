import React from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import { X, RotateCcw, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const {
    temperatureUnit,
    setTemperatureUnit,
    resetWeights,
    resetAllDemoData,
    studyArea,
    setStudyArea,
  } = useHeatData();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 text-[#14213D] rounded-lg">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D]">
                Dashboard Settings
              </h3>
              <p className="text-xs text-slate-500">
                HeatShield AI preferences & demo controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-slate-700">
          {/* Temperature Units */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1.5">
              Temperature Unit Display
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTemperatureUnit('C')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  temperatureUnit === 'C'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Celsius (°C)</span>
                {temperatureUnit === 'C' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setTemperatureUnit('F')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  temperatureUnit === 'F'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Fahrenheit (°F)</span>
                {temperatureUnit === 'F' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Active Study Area */}
          <div>
            <label className="font-semibold text-slate-900 block mb-1.5">
              Active Pilot Study Area
            </label>
            <select
              value={studyArea}
              onChange={(e) => setStudyArea(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F5F7FB] border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Demo Metro Core">Demo Metro Core (16 Urban Cells)</option>
              <option value="Valley Regional Basin">Valley Regional Basin (8 Regional Cells)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Fictional baseline study areas configured for hackathon demonstration.
            </p>
          </div>

          {/* Reset Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="font-semibold text-slate-900 block">
              Demo State Management
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetWeights();
                }}
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Weights
              </button>

              <button
                onClick={() => {
                  resetAllDemoData();
                  onClose();
                }}
                className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Problem Statement HC-04</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#14213D] text-white rounded-md font-sans font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
