import React, { useState } from 'react';
import { NeighborhoodRecord } from '../../types/heat';
import { useHeatData } from '../../context/HeatDataContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  Thermometer,
  Droplets,
  Satellite,
  Trees,
  Users,
  Clock,
  Database,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  MapPin,
  Sparkles,
  Zap,
  Wind,
  CloudSun,
} from 'lucide-react';

interface NeighborhoodDetailPanelProps {
  neighborhood?: NeighborhoodRecord;
}

export const NeighborhoodDetailPanel: React.FC<NeighborhoodDetailPanelProps> = ({
  neighborhood,
}) => {
  const {
    selectedNeighborhood,
    formatTemp,
    setActiveTab,
    reviewTasks,
    toggleTaskComplete,
    realWeather,
    isWeatherLoading,
    weatherError,
    refetchRealWeather,
    useLiveWeatherInScore,
    setUseLiveWeatherInScore,
    liveRecalculatedScore,
    externalRiskScore,
    externalRiskMissingInputs,
    useSimulatedVulnerabilityForExternal,
    simulatedVulnerabilityIndex,
    useSimulatedVulnerabilityInDemo,
    realAirQuality,
    isAirQualityLoading,
    airQualityError,
    refetchRealAirQuality,
    realLST,
    isLSTLoading,
    lstError,
    refetchRealLST,
    selectedLocation,
    osmFeatures,
    isOsmLoading,
    osmSource,
  } = useHeatData();

  const [liveTab, setLiveTab] = useState<'weather' | 'airQuality'>('weather');

  const record = neighborhood || selectedNeighborhood;
  const locationLat = selectedLocation?.lat ?? record?.lat;
  const locationLng = selectedLocation?.lng ?? record?.lng;
  const isExternalLocation = Boolean(selectedLocation);

  if (!record) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 flex flex-col items-center justify-center text-center h-full min-h-[460px]">
        <Database className="w-10 h-10 text-slate-300 mb-3" />
        <h3 className="text-base font-semibold text-slate-800">No Area Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Select any neighbourhood polygon or grid cell on the map to inspect its hyperlocal microclimate profile.
        </p>
      </div>
    );
  }

  // Related task
  const relatedTask = !isExternalLocation
    ? reviewTasks.find((t) => t.neighborhoodId === record.id)
    : undefined;

  // Active displayed score & category based on live toggle
  const currentCategory = useLiveWeatherInScore && liveRecalculatedScore
    ? liveRecalculatedScore.category
    : record.estimatedCategory;

  const currentScore = useLiveWeatherInScore && liveRecalculatedScore
    ? liveRecalculatedScore.score
    : record.estimatedScore;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between h-full space-y-4">
      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>{selectedLocation ? 'External geocoded place' : `${record.code} · ${record.studyArea}`}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-blue-500" />
                {(selectedLocation?.lat ?? record.lat).toFixed(3)}, {(selectedLocation?.lng ?? record.lng).toFixed(3)}
              </span>
            </span>
            <h2 className="text-lg font-bold text-[#14213D] leading-tight mt-0.5">
              {selectedLocation?.displayName ?? record.name}
            </h2>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            {selectedLocation ? (
              externalRiskScore ? (
                <div className="text-right">
                  <RiskBadge category={externalRiskScore.category} score={externalRiskScore.score} size="md" />
                  <span className="block text-[9px] font-semibold text-amber-800 mt-1">
                    SIMULATED DEMO MODE
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                  No risk score available
                </span>
              )
            ) : (
              <RiskBadge category={currentCategory} score={currentScore} size="md" />
            )}
            {!selectedLocation && (
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-1 rounded">
                {useSimulatedVulnerabilityInDemo
                  ? 'SIMULATED VULNERABILITY / DEMO SCORE'
                  : 'SIMULATED / DEMONSTRATION DATA'}
              </span>
            )}
            {!selectedLocation && useLiveWeatherInScore && (
              <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Live Open-Meteo Scored
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 pb-2 border-b border-slate-100 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono tabular-nums">
              {isExternalLocation ? 'Source: OpenStreetMap Nominatim coordinates' : `Baseline: ${record.timestamp}`}
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedLocation ? 'Geocoded coordinates' : `Quality: ${record.dataQuality}`}</span>
          </span>
        </div>
      </div>

      {selectedLocation && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          This place was selected through OpenStreetMap Nominatim. Only location-specific live weather, air quality, and mapped features are shown. Demo neighbourhood indicators are not substituted for this location.
        </div>
      )}

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#14213D] uppercase tracking-wider">
            Heat-Risk Assessment
          </span>
          {isExternalLocation ? (
            externalRiskScore ? (
              <RiskBadge category={externalRiskScore.category} score={externalRiskScore.score} size="sm" />
            ) : (
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-1 rounded">
                Score unavailable
              </span>
            )
          ) : (
            <RiskBadge category={currentCategory} score={currentScore} size="sm" />
          )}
        </div>

        {isExternalLocation ? (
          <p className="text-xs text-amber-900 leading-relaxed mt-2">
            {externalRiskScore
              ? `SIMULATED DEMONSTRATION SCORE — NOT A VERIFIED REAL-WORLD PREDICTION: ${externalRiskScore.score}/100 (${externalRiskScore.category}). Vulnerability input: simulated ${simulatedVulnerabilityIndex}/100.`
              : `Score unavailable. Missing or invalid inputs: ${externalRiskMissingInputs.join(', ') || 'data is still loading'}. Live data is never combined with Demo Metro Core values.`}
          </p>
        ) : (
          <p className="text-xs text-emerald-900 leading-relaxed mt-2">
            {useLiveWeatherInScore && liveRecalculatedScore
              ? 'Score uses this neighbourhood’s static spatial inputs with the live weather toggle enabled.'
              : 'Score uses the existing demonstration formula and weights for this neighbourhood.'}
            <span className="block font-semibold mt-1">
              SIMULATED / DEMONSTRATION DATA — not a verified real-world prediction.
            </span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#14213D] uppercase tracking-wider">
              Available Mapped Cooling Resources
            </span>
            <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-100 border border-indigo-200 px-2 py-1 rounded">
              {isOsmLoading ? 'Loading' : `${osmFeatures.length} mapped`}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {osmSource}
          </p>
          {!isOsmLoading && osmFeatures.length === 0 && (
            <p className="text-xs text-slate-700 mt-2">Unavailable for this location.</p>
          )}
          {!isOsmLoading && osmFeatures.length > 0 && (
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {osmFeatures.slice(0, 3).map((feature) => feature.name).join(' · ')}
              {osmFeatures.length > 3 ? ` · +${osmFeatures.length - 3} more` : ''}
            </p>
          )}
        </div>

      {/* Real Live API Ingestion Box (Open-Meteo Weather & Air Quality) */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/90 rounded-xl p-3.5 space-y-2.5">
        {/* Sub-Tabs: Weather vs Air Quality */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg text-xs">
            <button
              onClick={() => setLiveTab('weather')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                liveTab === 'weather'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5 text-blue-600" />
              <span>Real Weather</span>
            </button>
            <button
              onClick={() => setLiveTab('airQuality')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                liveTab === 'airQuality'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real Air Quality</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (liveTab === 'weather') refetchRealWeather();
              else refetchRealAirQuality();
            }}
            disabled={liveTab === 'weather' ? isWeatherLoading : isAirQualityLoading}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh current live feed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                (liveTab === 'weather' ? isWeatherLoading : isAirQualityLoading)
                  ? 'animate-spin text-blue-600'
                  : ''
              }`}
            />
          </button>
        </div>

        {/* Tab 1: Real Weather Data States */}
        {liveTab === 'weather' && (
          isWeatherLoading ? (
            <div className="py-2.5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Querying Open-Meteo for {locationLat.toFixed(4)}, {locationLng.toFixed(4)}...</span>
            </div>
          ) : weatherError ? (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="truncate">{weatherError}</span>
              </div>
              <button
                onClick={() => refetchRealWeather()}
                className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-[11px] shrink-0"
              >
                Retry
              </button>
            </div>
          ) : realWeather ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/90 p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Real Ambient Temp
                  </span>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums flex items-baseline gap-1 mt-0.5">
                    <span>{formatTemp(realWeather.temperature)}</span>
                    <span className="text-[10px] text-emerald-600 font-sans font-medium">
                      (Live 2m)
                    </span>
                  </div>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    Real Relative Humidity
                  </span>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums flex items-baseline gap-1 mt-0.5">
                    <span>{realWeather.relativeHumidity}%</span>
                    <span className="text-[10px] text-blue-600 font-sans font-medium">
                      (Live 2m)
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather Metadata & Attribution */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-blue-100/70 font-mono">
                <span className="truncate">
                  Observed: {realWeather.timestamp.replace('T', ' ')} UTC (Fetched: {realWeather.retrievedAt})
                </span>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-0.5 font-sans font-medium ml-auto"
                >
                  <span>Open-Meteo Attribution</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Toggle to apply real weather to risk score */}
              {!selectedLocation && <div className="pt-2 border-t border-blue-100/70 flex items-center justify-between">
                <label
                  htmlFor="live-scoring-toggle"
                  className="text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Apply Live Weather to Risk Score</span>
                </label>
                <input
                  id="live-scoring-toggle"
                  type="checkbox"
                  checked={useLiveWeatherInScore}
                  onChange={(e) => setUseLiveWeatherInScore(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
                />
              </div>}

              {!selectedLocation && useLiveWeatherInScore && liveRecalculatedScore && (
                <div className="text-[11px] bg-white/95 p-2 rounded-lg border border-emerald-200 text-slate-700 leading-relaxed">
                  <span className="font-semibold text-emerald-800 block">
                    Model Recalculated with Live Open-Meteo Feed:
                  </span>
                  Live score is <b>{liveRecalculatedScore.score}/100</b> ({liveRecalculatedScore.category}) vs demo baseline {record.estimatedScore}/100.
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    (Real: Temp {realWeather.temperature}°C, Hum {realWeather.relativeHumidity}%. Simulated: Satellite LST {record.landSurfaceTemperature}°C, Built {record.builtEnvironmentRatio}%, NDVI {record.vegetationIndex}, SVI {record.vulnerabilityIndex}).
                  </span>
                </div>
              )}
            </div>
          ) : null
        )}

        {/* Tab 2: Real Air Quality Data States */}
        {liveTab === 'airQuality' && (
          isAirQualityLoading ? (
            <div className="py-2.5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Querying Open-Meteo Air Quality for {locationLat.toFixed(4)}, {locationLng.toFixed(4)}...</span>
            </div>
          ) : airQualityError ? (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="truncate">{airQualityError}</span>
              </div>
              <button
                onClick={() => refetchRealAirQuality()}
                className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-[11px] shrink-0"
              >
                Retry
              </button>
            </div>
          ) : realAirQuality ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">PM2.5</span>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {realAirQuality.pm2_5 !== null ? realAirQuality.pm2_5.toFixed(1) : 'Unavailable'}
                    {realAirQuality.pm2_5 !== null && <span className="text-[9px] font-normal text-slate-500 ml-0.5">μg/m³</span>}
                  </div>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">PM10</span>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {realAirQuality.pm10 !== null ? realAirQuality.pm10.toFixed(1) : 'Unavailable'}
                    {realAirQuality.pm10 !== null && <span className="text-[9px] font-normal text-slate-500 ml-0.5">μg/m³</span>}
                  </div>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Ozone (O₃)</span>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {realAirQuality.ozone !== null ? realAirQuality.ozone.toFixed(1) : 'N/A'}
                    <span className="text-[9px] font-normal text-slate-500 ml-0.5">μg/m³</span>
                  </div>
                </div>
              </div>

              {/* Air Quality Metadata & Attribution */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                <span className="truncate">
                  Observed: {realAirQuality.timestamp.replace('T', ' ')} UTC (Fetched: {realAirQuality.retrievedAt})
                </span>
                <a
                  href="https://open-meteo.com/en/docs/air-quality-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-0.5 font-sans font-medium ml-auto"
                >
                  <span>Open-Meteo Air Quality</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="p-2 bg-slate-100/90 rounded-lg text-[10px] text-slate-600 leading-snug">
                <b>Co-Exposure Note:</b> Fine particulates (PM2.5) &amp; ozone exacerbate cardiovascular and respiratory strain during extreme heat events. These live values are displayed for situational awareness and are not silently altered in the heat-risk formula without documented medical weighting.
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Environmental & Demographic Indicators Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#14213D] uppercase tracking-wider">
          <span>{selectedLocation ? 'Selected Location — Live/Verified Data' : 'Observed Environmental Inputs — Demo Data'}</span>
          <span className="text-[10px] text-slate-400 font-normal normal-case">
            Source Provenance Tagged
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Air Temperature */}
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Air Temp
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-blue-100 text-blue-800 rounded">
                {isExternalLocation ? 'Live source' : 'Live available'}
              </span>
            </div>
            <div className="text-base font-bold text-[#14213D] font-mono tabular-nums">
              {isExternalLocation
                ? (realWeather ? formatTemp(realWeather.temperature) : 'Unavailable for this location')
                : formatTemp(useLiveWeatherInScore && realWeather ? realWeather.temperature : record.airTemperature)}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      10,
                      ((((isExternalLocation && realWeather
                        ? realWeather.temperature
                        : useLiveWeatherInScore && realWeather
                        ? realWeather.temperature
                        : record.airTemperature) - 25) / 20) * 100)
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Land Surface Temp */}
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-red-500" /> Surface Temp
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 text-slate-700 rounded">
                {isExternalLocation ? 'NASA MODIS live' : 'Simulated LST'}
              </span>
            </div>
            <div className="text-base font-bold text-[#14213D] font-mono tabular-nums">
              {isExternalLocation
                ? isLSTLoading
                  ? 'Loading satellite LST...'
                  : realLST
                  ? `${realLST.temperatureCelsius.toFixed(1)}°C`
                  : 'Unavailable for this location'
                : formatTemp(record.landSurfaceTemperature)}
            </div>
            {isExternalLocation && realLST && (
              <div className="text-[10px] text-slate-500 leading-relaxed mt-1">
                {realLST.source} · {realLST.observationStart} to {realLST.observationEnd} · {realLST.radiusMeters / 1000} km radius
              </div>
            )}
            {isExternalLocation && lstError && (
              <div className="text-[10px] text-red-700 leading-relaxed mt-1 flex items-center justify-between gap-2">
                <span>{lstError}</span>
                <button onClick={refetchRealLST} className="font-semibold underline shrink-0">Retry</button>
              </div>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full"
                style={{ width: isExternalLocation ? '0%' : `${Math.min(100, Math.max(10, ((record.landSurfaceTemperature - 30) / 25) * 100))}%` }}
              />
            </div>
          </div>

          {/* Relative Humidity & Wet-Bulb */}
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Humidity / WBGT
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-blue-100 text-blue-800 rounded">
                {isExternalLocation ? 'Live source' : 'Live available'}
              </span>
            </div>
            <div className="text-base font-bold text-[#14213D] font-mono tabular-nums">
              {isExternalLocation
                ? (realWeather ? `${realWeather.relativeHumidity}%` : 'Unavailable for this location')
                : `${useLiveWeatherInScore && realWeather ? realWeather.relativeHumidity : record.relativeHumidity}%`}
              {!isExternalLocation && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({formatTemp(record.wetBulbGlobeTemp)})
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: isExternalLocation ? `${realWeather?.relativeHumidity ?? 0}%` : `${useLiveWeatherInScore && realWeather ? realWeather.relativeHumidity : record.relativeHumidity}%` }}
              />
            </div>
          </div>

          {/* Vegetation Index (NDVI) & Canopy Gap */}
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-600" /> Vegetation (NDVI)
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 text-slate-700 rounded">
                {isExternalLocation ? (realLST?.spatial?.ndvi !== null && realLST?.spatial?.ndvi !== undefined ? 'MODIS live' : 'Unavailable') : 'Simulated NDVI'}
              </span>
            </div>
            <div className="text-base font-bold text-[#14213D] font-mono tabular-nums">
              {isExternalLocation
                ? realLST?.spatial?.ndvi !== null && realLST?.spatial?.ndvi !== undefined
                  ? realLST.spatial.ndvi.toFixed(3)
                  : 'Unavailable for this location'
                : record.vegetationIndex.toFixed(2)}
              {!isExternalLocation && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({record.treeCanopyGapPercent}% gap)
                </span>
              )}
            </div>
            {isExternalLocation && realLST?.spatial?.ndviObservationDate && (
              <div className="text-[10px] text-slate-500 mt-1">
                {realLST.spatial.sources.ndvi} · observed {realLST.spatial.ndviObservationDate}
              </div>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: isExternalLocation ? `${Math.min(100, Math.max(0, (realLST?.spatial?.ndvi ?? 0) * 100))}%` : `${Math.min(100, record.vegetationIndex * 100)}%` }}
              />
            </div>
          </div>

          {/* Built Environment Ratio */}
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-600" /> Built Surface
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 text-slate-700 rounded">
                {isExternalLocation ? (realLST?.spatial?.builtEnvironmentRatio !== null && realLST?.spatial?.builtEnvironmentRatio !== undefined ? 'GHSL live' : 'Unavailable') : 'Simulated built'}
              </span>
            </div>
            <div className="text-base font-bold text-[#14213D] font-mono tabular-nums">
              {isExternalLocation
                ? realLST?.spatial?.builtEnvironmentRatio !== null && realLST?.spatial?.builtEnvironmentRatio !== undefined
                  ? `${realLST.spatial.builtEnvironmentRatio.toFixed(1)}%`
                  : 'Unavailable for this location'
                : `${record.builtEnvironmentRatio}%`}
            </div>
            {isExternalLocation && realLST?.spatial?.builtObservationDate && (
              <div className="text-[10px] text-slate-500 mt-1">
                {realLST.spatial.sources.builtEnvironment} · observed {realLST.spatial.builtObservationDate}
              </div>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full"
                style={{ width: isExternalLocation ? `${realLST?.spatial?.builtEnvironmentRatio ?? 0}%` : `${record.builtEnvironmentRatio}%` }}
              />
            </div>
          </div>

          {/* Exposure proxy / demo vulnerability */}
          <div className="p-3 bg-[#F5F7FB] rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" /> {isExternalLocation ? 'Estimated Exposure (Proxy)' : 'Vulnerability'}
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 text-slate-700 rounded">
                {isExternalLocation ? 'Population · GHSL' : 'SIMULATED / Demo SVI'}
              </span>
            </div>
            <div className="text-base font-bold text-[#14213D] font-mono tabular-nums">
              {isExternalLocation
                ? realLST?.spatial?.population !== null && realLST?.spatial?.population !== undefined
                  ? Math.round(realLST.spatial.population).toLocaleString()
                  : 'Unavailable for this location'
                : `${record.vulnerabilityIndex}/100 (SIMULATED)`}
              {!isExternalLocation && (
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({record.seniorPopRatio}% 65+)
                </span>
              )}
            </div>
            {isExternalLocation && realLST?.spatial?.populationObservationDate && (
              <div className="text-[10px] text-slate-500 mt-1">
                {realLST.spatial.sources.population} · observed {realLST.spatial.populationObservationDate} · exposure proxy only
              </div>
            )}
            {isExternalLocation && (
              <div className="text-[10px] text-slate-500 mt-1">
                This population estimate is not a verified vulnerability index. Vulnerability remains unavailable unless simulated demo mode is enabled.
              </div>
            )}
            {!isExternalLocation && (
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${record.vulnerabilityIndex}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Why is this area highlighted? */}
      {!isExternalLocation && <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-2">
          Why is this area highlighted?
        </h4>

        <div className="space-y-2">
          {record.contributingFactors.map((factor, idx) => (
            <div
              key={idx}
              className="text-xs bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 flex items-start justify-between gap-3"
            >
              <div>
                <span className="font-semibold text-slate-800 block">
                  {factor.factor}
                </span>
                <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">
                  {factor.description}
                </span>
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                  factor.impact === 'High'
                    ? 'bg-red-100 text-red-700'
                    : factor.impact === 'Moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {factor.impact} Impact
              </span>
            </div>
          ))}

          {record.dataQuality === 'Sensor Gap / Flagged' && (
            <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5">
              Some station inputs may be incomplete or undergoing sensor maintenance; regional satellite proxy values were applied.
            </div>
          )}
        </div>
      </div>}

      {/* Action Planning Prompt & Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {relatedTask ? (
          <button
            onClick={() => toggleTaskComplete(relatedTask.id)}
            className={`text-xs px-3 py-2 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              relatedTask.completed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {relatedTask.completed ? 'Action Completed' : 'Mark Review Done'}
          </button>
        ) : (
          <div className="text-xs text-slate-500 truncate">
            {isExternalLocation
              ? 'Population exposure is shown separately from vulnerability; no verified vulnerability index is inferred.'
              : `Population: ~${record.populationEstimate.toLocaleString()}`}
          </div>
        )}

        <button
          onClick={() => setActiveTab('actions')}
          className="text-xs px-3 py-2 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 whitespace-nowrap ml-auto"
        >
          <span>View Action Plan</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
