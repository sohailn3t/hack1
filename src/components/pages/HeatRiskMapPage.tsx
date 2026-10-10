import React, { useState } from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import { HeatRiskMap } from '../map/HeatRiskMap';
import { NeighborhoodDetailPanel } from '../map/NeighborhoodDetailPanel';
import { RiskBadge } from '../common/RiskBadge';
import {
  Layers,
  ArrowLeftRight,
  Filter,
  Search,
  Compass,
  Thermometer,
  Trees,
  Users,
  Info,
  X,
  Building,
} from 'lucide-react';
import { NeighborhoodRecord } from '../../types/heat';

export const HeatRiskMapPage: React.FC = () => {
  const {
    neighborhoods,
    selectedNeighborhood,
    setSelectedNeighborhood,
    activeMapLayer,
    setActiveMapLayer,
    riskCategoryFilter,
    setRiskCategoryFilter,
    searchQuery,
    setSearchQuery,
    formatTemp,
    filteredNeighborhoods,
  } = useHeatData();

  // Side-by-side comparison state
  const [isComparing, setIsComparing] = useState(false);
  const [compareNeighborA, setCompareNeighborA] = useState<NeighborhoodRecord | null>(null);
  const [compareNeighborB, setCompareNeighborB] = useState<NeighborhoodRecord | null>(null);

  const startComparison = (n1?: NeighborhoodRecord) => {
    const first = n1 || selectedNeighborhood;
    // Pick the most contrasting neighbourhood (e.g. lowest risk if first is high)
    const opposite = [...neighborhoods].sort(
      (a, b) =>
        first.estimatedCategory === 'High'
          ? a.estimatedScore - b.estimatedScore
          : b.estimatedScore - a.estimatedScore
    )[0];

    setCompareNeighborA(first);
    setCompareNeighborB(opposite);
    setIsComparing(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#14213D] leading-tight">
            Interactive Heat-Risk Geospatial Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize satellite thermal radiance, vegetative tree canopy deficit, and community vulnerability at neighbourhood level.
          </p>
        </div>

        {/* Comparison Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => startComparison()}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-2 transition-all hover:bg-slate-50"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Compare 2 Neighbourhoods</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isComparing && compareNeighborA && compareNeighborB && (
        <div className="bg-white rounded-xl border-2 border-blue-500 p-5 shadow-lg relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#14213D]">
                Microclimate Disparity Comparison: Urban Heat Island vs Shaded Green Space
              </h3>
            </div>
            <button
              onClick={() => setIsComparing(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Area A */}
            <div className="bg-[#F5F7FB] p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Area A
                </span>
                <select
                  value={compareNeighborA.id}
                  onChange={(e) => {
                    const found = neighborhoods.find((n) => n.id === e.target.value);
                    if (found) setCompareNeighborA(found);
                  }}
                  className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1"
                >
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.estimatedCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-[#14213D]">
                  {compareNeighborA.name}
                </h4>
                <RiskBadge
                  category={compareNeighborA.estimatedCategory}
                  score={compareNeighborA.estimatedScore}
                  size="sm"
                />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Air Temperature</span>
                  <span className="font-bold">{formatTemp(compareNeighborA.airTemperature)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Satellite Surface (LST)</span>
                  <span className="font-bold text-red-600">{formatTemp(compareNeighborA.landSurfaceTemperature)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Tree Canopy Gap</span>
                  <span className="font-bold">{compareNeighborA.treeCanopyGapPercent}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Built Impervious Surface</span>
                  <span className="font-bold">{compareNeighborA.builtEnvironmentRatio}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Social Vulnerability</span>
                  <span className="font-bold">{compareNeighborA.vulnerabilityIndex}/100</span>
                </div>
              </div>
            </div>

            {/* Area B */}
            <div className="bg-[#F5F7FB] p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Area B
                </span>
                <select
                  value={compareNeighborB.id}
                  onChange={(e) => {
                    const found = neighborhoods.find((n) => n.id === e.target.value);
                    if (found) setCompareNeighborB(found);
                  }}
                  className="text-xs font-bold bg-white border border-slate-200 rounded px-2 py-1"
                >
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.estimatedCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-[#14213D]">
                  {compareNeighborB.name}
                </h4>
                <RiskBadge
                  category={compareNeighborB.estimatedCategory}
                  score={compareNeighborB.estimatedScore}
                  size="sm"
                />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Air Temperature</span>
                  <span className="font-bold">{formatTemp(compareNeighborB.airTemperature)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Satellite Surface (LST)</span>
                  <span className="font-bold text-red-600">{formatTemp(compareNeighborB.landSurfaceTemperature)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Tree Canopy Gap</span>
                  <span className="font-bold">{compareNeighborB.treeCanopyGapPercent}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-sans">Built Impervious Surface</span>
                  <span className="font-bold">{compareNeighborB.builtEnvironmentRatio}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Social Vulnerability</span>
                  <span className="font-bold">{compareNeighborB.vulnerabilityIndex}/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 text-center font-sans">
            Delta Surface Temp Difference: <b>{Math.abs(compareNeighborA.landSurfaceTemperature - compareNeighborB.landSurfaceTemperature).toFixed(1)}°C</b> · Slide 2 disparity confirmation: Urban materials & tree cover create sharp localized microclimate contrasts.
          </div>
        </div>
      )}

      {/* Main Grid: Left Map, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <HeatRiskMap heightClass="h-[640px]" />
        </div>

        <div className="lg:col-span-4 min-h-[640px]">
          <NeighborhoodDetailPanel />
        </div>
      </div>
    </div>
  );
};
