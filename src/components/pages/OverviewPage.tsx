import React from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import { KpiCard } from '../common/KpiCard';
import { HeatRiskMap } from '../map/HeatRiskMap';
import { NeighborhoodDetailPanel } from '../map/NeighborhoodDetailPanel';
import {
  MapPin,
  Grid,
  Layers,
  Database,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    neighborhoods,
    studyArea,
    setStudyArea,
    highRiskCount,
    elevatedRiskCount,
    moderateRiskCount,
    lowerRiskCount,
    setActiveTab,
  } = useHeatData();

  // Find max risk level in current dataset
  const highestRiskRecord = [...neighborhoods].sort(
    (a, b) => b.estimatedScore - a.estimatedScore
  )[0];

  const highestRiskLabel = highestRiskRecord
    ? `${highestRiskRecord.estimatedCategory} (${highestRiskRecord.estimatedScore})`
    : 'Elevated';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1 tracking-wide uppercase">
            <span>HC-04 Climate-Health Intelligence</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#14213D] tracking-tight">
            Good morning, Heat Analyst
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Understand local heat patterns. Identify areas that may need attention.
          </p>
        </div>

        {/* Study Area Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            <span className="block font-medium text-slate-700">Study Area Focus:</span>
            <span className="text-[11px] text-slate-400">Illustrative pilot territory</span>
          </div>

          <select
            value={studyArea}
            onChange={(e) => setStudyArea(e.target.value as any)}
            className="px-3 py-2 bg-[#F5F7FB] border border-slate-200 text-xs font-semibold text-[#14213D] rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Demo Metro Core">Demo Metro Core (16 Urban Cells)</option>
            <option value="Valley Regional Basin">Valley Regional Basin (8 Regional Cells)</option>
          </select>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 — Highest Estimated Risk */}
        <KpiCard
          title="Highest Estimated Risk"
          value={highestRiskLabel}
          subtitle={highestRiskRecord ? highestRiskRecord.name : 'Old Foundry District'}
          icon={MapPin}
          accentColor={highestRiskRecord?.estimatedCategory === 'High' ? 'orange' : 'amber'}
          badgeText="Preliminary Band"
        />

        {/* Card 2 — Areas Analysed */}
        <KpiCard
          title="Areas Analysed"
          value={`${neighborhoods.length} cells`}
          subtitle={`${studyArea} polygon boundary`}
          icon={Grid}
          accentColor="blue"
          badgeText="Spatial Extent"
        />

        {/* Card 3 — Environmental Inputs */}
        <KpiCard
          title="Environmental Inputs"
          value="6 indicators"
          subtitle="Air, LST, Humidity, Built, NDVI, SVI"
          icon={Layers}
          accentColor="purple"
          badgeText="Multi-Source"
        />

        {/* Card 4 — Data Sources */}
        <KpiCard
          title="Data Ingestion"
          value="Open-Meteo & OSM"
          subtitle="Real weather & AQI + OSM landmarks"
          icon={Database}
          accentColor="green"
          badgeText="Free Live APIs"
        />
      </div>

      {/* Risk Category Distribution Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Risk Distribution:
          </span>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>High: <b>{highRiskCount}</b></span>
            </span>
            <span className="flex items-center gap-1.5 text-orange-700">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Elevated: <b>{elevatedRiskCount}</b></span>
            </span>
            <span className="flex items-center gap-1.5 text-yellow-800">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>Moderate: <b>{moderateRiskCount}</b></span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Lower: <b>{lowerRiskCount}</b></span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('analysis')}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline ml-auto"
        >
          <span>Examine scoring formula & weights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Two-Column Section: Neighbourhood Heat-Risk Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#14213D]">
              Neighbourhood Heat-Risk Overview
            </h3>
            <p className="text-xs text-slate-500">
              Click any polygon or grid cell on the map to inspect microclimate drivers and trigger response planning.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="text-xs text-slate-600 hover:text-[#14213D] font-medium flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg bg-white shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span>Full Map Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Heat-Risk Map (7 cols) */}
          <div className="lg:col-span-7">
            <HeatRiskMap heightClass="h-[560px]" />
          </div>

          {/* Right Column: Selected Neighbourhood Details Panel (5 cols) */}
          <div className="lg:col-span-5 min-h-[560px]">
            <NeighborhoodDetailPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
