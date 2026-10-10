import React, { useState } from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import {
  CheckCircle2,
  AlertCircle,
  Layers,
  Thermometer,
  Satellite,
  Droplets,
  Trees,
  Users,
  RefreshCw,
} from 'lucide-react';
import { NeighborhoodRecord } from '../../types/heat';

export const DataExplorerPage: React.FC = () => {
  const {
    neighborhoods,
    formatTemp,
    loadUploadedDataset,
    resetAllDemoData,
    uploadedDataset,
  } = useHeatData();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Parse and validate uploaded CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('File content is empty');

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one data row.');
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const requiredFields = ['name', 'air_temp', 'humidity', 'surface_temp', 'vegetation_ndvi', 'vulnerability_index'];
        const missing = requiredFields.filter((rf) => !headers.includes(rf));

        if (missing.length > 0) {
          throw new Error(
            `Missing required CSV columns: ${missing.join(', ')}. Please refer to the template schema.`
          );
        }

        const nameIdx = headers.indexOf('name');
        const airIdx = headers.indexOf('air_temp');
        const humIdx = headers.indexOf('humidity');
        const surfIdx = headers.indexOf('surface_temp');
        const vegIdx = headers.indexOf('vegetation_ndvi');
        const vulnIdx = headers.indexOf('vulnerability_index');

        const parsedRecords: NeighborhoodRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim());
          if (cols.length < headers.length) continue;

          const name = cols[nameIdx];
          const air = parseFloat(cols[airIdx]);
          const hum = parseFloat(cols[humIdx]);
          const surf = parseFloat(cols[surfIdx]);
          const veg = parseFloat(cols[vegIdx]);
          const vuln = parseFloat(cols[vulnIdx]);

          if (isNaN(air) || isNaN(hum) || isNaN(surf) || isNaN(veg) || isNaN(vuln)) {
            throw new Error(`Row ${i} contains non-numeric environmental indicators.`);
          }

          parsedRecords.push({
            id: `up-${i}-${Date.now()}`,
            name: name || `Uploaded Cell #${i}`,
            code: `UPL-${i}`,
            studyArea: 'Demo Metro Core',
            lat: 34.05 + (i * 0.005),
            lng: -118.25 + (i * 0.005),
            polygon: [
              [34.05 + (i * 0.005), -118.25 + (i * 0.005)],
              [34.055 + (i * 0.005), -118.245 + (i * 0.005)],
              [34.050 + (i * 0.005), -118.240 + (i * 0.005)],
            ],
            airTemperature: air,
            relativeHumidity: hum,
            landSurfaceTemperature: surf,
            vegetationIndex: Math.min(1, Math.max(0, veg)),
            builtEnvironmentRatio: 75,
            vulnerabilityIndex: Math.min(100, Math.max(0, vuln)),
            wetBulbGlobeTemp: Math.round(air * 0.8),
            estimatedScore: 50,
            estimatedCategory: 'Elevated',
            dataQuality: 'High',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
            populationEstimate: 20000,
            seniorPopRatio: 18,
            treeCanopyGapPercent: Math.round((1 - veg) * 100),
            contributingFactors: [
              { factor: 'Uploaded Surface Indicator', impact: 'Moderate', description: 'Extracted from user supplied CSV batch.', relativeWeight: 30 },
            ],
            suggestedActionHeadline: 'Review uploaded custom parameters against local thresholds',
          });
        }

        if (parsedRecords.length === 0) {
          throw new Error('No valid records could be parsed from the uploaded CSV file.');
        }

        loadUploadedDataset(parsedRecords);
        setUploadSuccess(`Successfully ingested ${parsedRecords.length} neighbourhood records! Live dashboard updated.`);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
  };

  // Download Sample CSV
  const handleDownloadSample = () => {
    const csvContent =
      'name,air_temp,humidity,surface_temp,vegetation_ndvi,vulnerability_index\n' +
      'North Harbor Basin,38.2,56,48.5,0.14,72\n' +
      'Sunnyvale Residential,34.0,52,38.2,0.45,35\n' +
      'Downtown Rail Depot,40.1,60,52.0,0.08,82\n' +
      'Forest Hill Reserve,31.5,62,33.0,0.68,24\n' +
      'South Commercial Way,37.5,58,45.2,0.22,65\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'heatshield_sample_indicators.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export current dataset as CSV
  const handleExportCurrent = () => {
    const header = 'id,name,code,air_temperature_c,humidity_pct,surface_temp_c,vegetation_ndvi,vulnerability_index,score,category,quality\n';
    const rows = neighborhoods.map(
      (n) =>
        `"${n.id}","${n.name}","${n.code}",${n.airTemperature},${n.relativeHumidity},${n.landSurfaceTemperature},${n.vegetationIndex},${n.vulnerabilityIndex},${n.estimatedScore},"${n.estimatedCategory}","${n.dataQuality}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `heatshield_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upload Feedback Banners */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">CSV Ingestion Failed</span>
              <span>{uploadError}</span>
            </div>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Custom Ingestion Active</span>
              <span>{uploadSuccess}</span>
            </div>
          </div>
          <button
            onClick={resetAllDemoData}
            className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900"
          >
            Restore Default Data
          </button>
        </div>
      )}

      {/* Feature Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#14213D]">
              Ingested Indicators Inventory
            </h3>
            <p className="text-xs text-slate-500">
              Normalized features engineered for baseline risk calculation ({neighborhoods.length} rows loaded)
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Prov. Status: Verified Demo Pipeline
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FB] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Neighbourhood</th>
                <th className="py-3 px-4 font-semibold text-right">Air Temp (°C)</th>
                <th className="py-3 px-4 font-semibold text-right">Humidity (%)</th>
                <th className="py-3 px-4 font-semibold text-right">Surface LST (°C)</th>
                <th className="py-3 px-4 font-semibold text-right">Vegetation (NDVI)</th>
                <th className="py-3 px-4 font-semibold text-right">Built %</th>
                <th className="py-3 px-4 font-semibold text-right">Vulnerability (SVI)</th>
                <th className="py-3 px-4 font-semibold">Data Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {neighborhoods.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                    {n.name}
                    <span className="text-slate-400 font-mono text-[11px] block font-normal">
                      {n.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {n.airTemperature.toFixed(1)}°C
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {n.relativeHumidity}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-bold text-red-600">
                    {n.landSurfaceTemperature.toFixed(1)}°C
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {n.vegetationIndex.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {n.builtEnvironmentRatio}%
                  </td>
                  <td className="py-3 px-4 text-right text-purple-700 font-bold">
                    {n.vulnerabilityIndex}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
