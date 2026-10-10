import React from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  Sliders,
  RotateCcw,
  BarChart3,
  Search,
} from 'lucide-react';
import { RiskWeights, RiskCategory } from '../../types/heat';

export const RiskAnalysisPage: React.FC = () => {
  const {
    neighborhoods,
    weights,
    updateWeight,
    resetWeights,
    selectedNeighborhood,
    setSelectedNeighborhood,
    formatTemp,
    highRiskCount,
    elevatedRiskCount,
    moderateRiskCount,
    lowerRiskCount,
    riskCategoryFilter,
    setRiskCategoryFilter,
    dataQualityFilter,
    setDataQualityFilter,
    searchQuery,
    setSearchQuery,
    filteredNeighborhoods,
  } = useHeatData();

  // Total weights sum
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  // Quick weight presets
  const applyPreset = (preset: 'balanced' | 'surfaceFocus' | 'vulnerabilityFocus') => {
    if (preset === 'balanced') {
      resetWeights();
    } else if (preset === 'surfaceFocus') {
      updateWeight('surfaceTemp', 0.40);
      updateWeight('builtEnvironment', 0.20);
      updateWeight('airTemp', 0.15);
      updateWeight('vegetationGap', 0.15);
      updateWeight('humidity', 0.05);
      updateWeight('vulnerability', 0.05);
    } else if (preset === 'vulnerabilityFocus') {
      updateWeight('vulnerability', 0.35);
      updateWeight('surfaceTemp', 0.20);
      updateWeight('vegetationGap', 0.20);
      updateWeight('airTemp', 0.10);
      updateWeight('humidity', 0.10);
      updateWeight('builtEnvironment', 0.05);
    }
  };

  // Distribution chart bar heights maxed
  const maxCategoryCount = Math.max(1, highRiskCount, elevatedRiskCount, moderateRiskCount, lowerRiskCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Explainable Risk Scoring Engine
          </div>
          <h2 className="text-xl font-bold text-[#14213D]">
            Preliminary Heat-Risk Modeling & Parameter Tuning
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Configure indicator weighting parameters derived from expert consensus and inspect how environmental signals translate into neighbourhood risk categorizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => applyPreset('balanced')}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Default Balanced
          </button>
          <button
            onClick={() => applyPreset('surfaceFocus')}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Thermal LST Bias
          </button>
          <button
            onClick={() => applyPreset('vulnerabilityFocus')}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Socio-Demographic Bias
          </button>
        </div>
      </div>

      {/* Visual Pipeline Flow (Slide 4, Slide 7, Slide 17) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-xs font-bold text-[#14213D] uppercase tracking-wider mb-3">
          Analysis Pipeline Workflow
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/80">
            <div className="font-mono text-[11px] text-blue-600 font-bold mb-1">01. Ingestion</div>
            <div className="font-semibold text-slate-900">Multi-Layer Inputs</div>
            <p className="text-slate-500 text-[11px] mt-1">Satellite thermal, station air, NDVI, & CDC SVI census tracts.</p>
          </div>

          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/80">
            <div className="font-mono text-[11px] text-blue-600 font-bold mb-1">02. Prepare</div>
            <div className="font-semibold text-slate-900">Feature Normalization</div>
            <p className="text-slate-500 text-[11px] mt-1">Min-max scaling $[0, 1]$ across microclimate extremes.</p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
            <div className="font-mono text-[11px] text-blue-700 font-bold mb-1">03. Calculate</div>
            <div className="font-semibold text-blue-900">Weighted Risk Score</div>
            <p className="text-blue-700/80 text-[11px] mt-1">$\sum (w_i \cdot x_i)$ normalized 0–100 scale.</p>
          </div>

          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/80">
            <div className="font-mono text-[11px] text-blue-600 font-bold mb-1">04. Stratify</div>
            <div className="font-semibold text-slate-900">Risk Categorization</div>
            <p className="text-slate-500 text-[11px] mt-1">Lower (&lt;25), Moderate (25-49), Elevated (50-74), High (75+).</p>
          </div>

          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/80">
            <div className="font-mono text-[11px] text-blue-600 font-bold mb-1">05. Act</div>
            <div className="font-semibold text-slate-900">Preventive Response</div>
            <p className="text-slate-500 text-[11px] mt-1">Human-reviewed outreach, shade deployment, cooling centers.</p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Left Weight Tuner, Right Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Weights Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#14213D]">
                Weight Parameters ($w_1$ to $w_6$)
              </h3>
            </div>
            <button
              onClick={resetWeights}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Formula Display (Slide 7) */}
          <div className="p-3 bg-[#14213D] text-slate-200 rounded-lg text-xs font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-sans">
              Preliminary Heat-Risk Formula:
            </div>
            <div className="text-amber-400 font-bold leading-relaxed">
              Risk = w₁·T + w₂·H + w₃·S + w₄·B + w₅·V + w₆·E
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              Where T=Air, H=Humidity, S=Surface LST, B=Built, V=Canopy Gap, E=Exposure SVI.
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3.5 text-xs">
            {/* Satellite LST w3 */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>w₃: Satellite Surface Temp (LST)</span>
                <span className="font-mono text-blue-600">{Math.round(weights.surfaceTemp * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.surfaceTemp}
                onChange={(e) => updateWeight('surfaceTemp', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Radiant urban heat island absorption from ECOSTRESS</span>
            </div>

            {/* Ambient Air Temp w1 */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>w₁: Ambient Air Temperature</span>
                <span className="font-mono text-blue-600">{Math.round(weights.airTemp * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.airTemp}
                onChange={(e) => updateWeight('airTemp', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Meteorological weather station ambient observations</span>
            </div>

            {/* Built Environment w4 */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>w₄: Built-Up Impervious Ratio</span>
                <span className="font-mono text-blue-600">{Math.round(weights.builtEnvironment * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.builtEnvironment}
                onChange={(e) => updateWeight('builtEnvironment', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Concrete, asphalt, and non-reflective urban roof density</span>
            </div>

            {/* Tree Canopy Gap w5 */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>w₅: Tree Canopy Gap (1 - NDVI)</span>
                <span className="font-mono text-blue-600">{Math.round(weights.vegetationGap * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.vegetationGap}
                onChange={(e) => updateWeight('vegetationGap', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Deficit in vegetative shading and evapotranspiration</span>
            </div>

            {/* Humidity w2 */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>w₂: Relative Humidity / Heat Stress</span>
                <span className="font-mono text-blue-600">{Math.round(weights.humidity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.humidity}
                onChange={(e) => updateWeight('humidity', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Impairment to human perspiration and evaporative cooling</span>
            </div>

            {/* Social Vulnerability w6 */}
            <div>
              <div className="flex justify-between font-semibold text-slate-800 mb-1">
                <span>w₆: Demographic Exposure (CDC SVI)</span>
                <span className="font-mono text-blue-600">{Math.round(weights.vulnerability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.vulnerability}
                onChange={(e) => updateWeight('vulnerability', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Senior population share, lack of HVAC, and medical risk factors</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] leading-relaxed">
            <b>Disclaimer:</b> Preliminary Heat-Risk Score is illustrative and not a validated clinical diagnosis. Calibration against historical emergency admission logs is required prior to operational deployment.
          </div>

        </div>

        {/* Right Column: Model Options & Distribution Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Risk Distribution Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#14213D]">
                  Risk Distribution by Category
                </h3>
                <p className="text-xs text-slate-500">
                  Total cells in active pilot study area ({neighborhoods.length} total)
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Dynamically reacts to weight adjustments
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 items-end h-44 pt-4 border-b border-slate-100">
              {/* High */}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="font-mono font-bold text-xs text-red-700 mb-1">
                  {highRiskCount}
                </span>
                <div
                  className="w-full max-w-[56px] bg-red-600 rounded-t-md transition-all duration-300"
                  style={{ height: `${Math.max(12, (highRiskCount / maxCategoryCount) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-700 mt-2">High</span>
                <span className="text-[10px] text-slate-400 font-mono">75–100</span>
              </div>

              {/* Elevated */}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="font-mono font-bold text-xs text-orange-700 mb-1">
                  {elevatedRiskCount}
                </span>
                <div
                  className="w-full max-w-[56px] bg-orange-500 rounded-t-md transition-all duration-300"
                  style={{ height: `${Math.max(12, (elevatedRiskCount / maxCategoryCount) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-700 mt-2">Elevated</span>
                <span className="text-[10px] text-slate-400 font-mono">50–74</span>
              </div>

              {/* Moderate */}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="font-mono font-bold text-xs text-yellow-800 mb-1">
                  {moderateRiskCount}
                </span>
                <div
                  className="w-full max-w-[56px] bg-yellow-500 rounded-t-md transition-all duration-300"
                  style={{ height: `${Math.max(12, (moderateRiskCount / maxCategoryCount) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-700 mt-2">Moderate</span>
                <span className="text-[10px] text-slate-400 font-mono">25–49</span>
              </div>

              {/* Lower */}
              <div className="flex flex-col items-center h-full justify-end group">
                <span className="font-mono font-bold text-xs text-emerald-700 mb-1">
                  {lowerRiskCount}
                </span>
                <div
                  className="w-full max-w-[56px] bg-emerald-600 rounded-t-md transition-all duration-300"
                  style={{ height: `${Math.max(12, (lowerRiskCount / maxCategoryCount) * 100)}%` }}
                />
                <span className="text-xs font-semibold text-slate-700 mt-2">Lower</span>
                <span className="text-[10px] text-slate-400 font-mono">0–24</span>
              </div>
            </div>

            <div className="pt-3 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Provisional category thresholds are subject to public health calibration.</span>
              <span className="font-mono font-bold text-slate-700">
                Sum: {neighborhoods.length} cells
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filterable Comparison Table (Section 6C & 6D) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#14213D]">
              Neighbourhood Risk Score Comparison Table
            </h3>
            <p className="text-xs text-slate-500">
              Interactive filter and review matrix ({filteredNeighborhoods.length} displayed)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cell name..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F5F7FB] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Risk Category Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={riskCategoryFilter}
                onChange={(e) => setRiskCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F7FB] border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="High">High Only</option>
                <option value="Elevated">Elevated Only</option>
                <option value="Moderate">Moderate Only</option>
                <option value="Lower">Lower Only</option>
              </select>
            </div>

            {/* Quality Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Quality:</span>
              <select
                value={dataQualityFilter}
                onChange={(e) => setDataQualityFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F7FB] border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Quality</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Sensor Gap / Flagged">Flagged / Gap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FB] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Neighbourhood</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Risk Score</th>
                <th className="py-3 px-4 font-semibold text-right">Air Temp</th>
                <th className="py-3 px-4 font-semibold text-right">Humidity</th>
                <th className="py-3 px-4 font-semibold text-right">Surface LST</th>
                <th className="py-3 px-4 font-semibold text-right">Vegetation (NDVI)</th>
                <th className="py-3 px-4 font-semibold">Data Quality</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredNeighborhoods.map((n) => {
                const isSelected = selectedNeighborhood?.id === n.id;
                return (
                  <tr
                    key={n.id}
                    onClick={() => setSelectedNeighborhood(n)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans text-slate-800">
                      <span>{n.name}</span>
                      <span className="text-slate-400 font-mono text-[11px] block font-normal">
                        {n.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <RiskBadge category={n.estimatedCategory} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#14213D]">
                      {n.estimatedScore}/100
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {formatTemp(n.airTemperature)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {n.relativeHumidity}%
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-bold">
                      {formatTemp(n.landSurfaceTemperature)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700">
                      {n.vegetationIndex.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          n.dataQuality === 'High'
                            ? 'bg-emerald-50 text-emerald-700'
                            : n.dataQuality === 'Medium'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {n.dataQuality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNeighborhood(n);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
