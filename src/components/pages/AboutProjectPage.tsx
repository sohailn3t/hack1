import React from 'react';
import {
  Shield,
  Layers,
  Cpu,
  Database,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileCode2,
  Users,
  LineChart,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-[#14213D] text-white p-8 rounded-xl shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Hackathon Challenge HC-04</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            HeatShield AI — Hyperlocal Heat-Health Risk Prediction
          </h2>

          <p className="text-base text-slate-300 font-medium leading-relaxed mb-4">
            Predict Heat. Protect Lives. An AI-powered geospatial platform unifying satellite thermal infrared imagery, meteorological sensor telemetry, and socio-demographic vulnerability indicators to anticipate urban heat risks at neighbourhood resolution.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="px-2.5 py-1 bg-slate-800 rounded">Domain: AI + Climate Tech + Public Health</span>
            <span className="px-2.5 py-1 bg-slate-800 rounded">Status: Prototype Working Demo</span>
            <span className="px-2.5 py-1 bg-slate-800 rounded">Pilot: Urban Microclimate Evaluation</span>
          </div>
        </div>

        {/* Subtle geometric background motif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-gradient-to-l from-orange-400 to-transparent flex items-center justify-center">
          <Shield className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Trust Framework Principles (Slide 12) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          Trust & Safety Foundation
        </div>
        <h3 className="text-lg font-bold text-[#14213D] mb-4">
          Four Core Principles for Responsible Climate-Health AI (Slide 12)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-[#F5F7FB] rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">1</span>
              <span>Data Quality</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Verified provenance from official sources (NASA, Berkeley Earth, CDC). Documented sensor gaps and transparent quality flags across all spatial cells.
            </p>
          </div>

          <div className="p-4 bg-[#F5F7FB] rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">2</span>
              <span>Model Validation</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cross-validation testing and benchmark comparisons against historical extreme heat admissions. Strict separation between prototype estimates and medical truths.
            </p>
          </div>

          <div className="p-4 bg-[#F5F7FB] rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">3</span>
              <span>Transparency</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Explicit uncertainty displays, transparent mathematical formula representation, source attribution, and full feature contribution explainability.
            </p>
          </div>

          <div className="p-4 bg-[#F5F7FB] rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono">4</span>
              <span>Human Oversight</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              No automated emergency dispatch. All elevated and high-risk alerts require expert review. Human-in-the-loop governance prevents arbitrary action triggers.
            </p>
          </div>
        </div>
      </div>

      {/* Proposed Technology Stack (Slide 11) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          Engineering Architecture
        </div>
        <h3 className="text-lg font-bold text-[#14213D] mb-4">
          Proposed Layered Technology Stack (Slide 11)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F7FB]">
            <div className="font-bold text-[#14213D] text-sm mb-1">
              Data Processing & Pipelines
            </div>
            <div className="text-blue-600 font-mono text-[11px] font-semibold mb-2">
              Python · Pandas · NumPy
            </div>
            <p className="text-slate-600 leading-relaxed">
              Automated ingestion pipelines, spatial coordinate reprojection, outlier normalization, and missing value interpolation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F7FB]">
            <div className="font-bold text-[#14213D] text-sm mb-1">
              Machine Learning & Modeling
            </div>
            <div className="text-blue-600 font-mono text-[11px] font-semibold mb-2">
              Scikit-learn · XGBoost · GBDT
            </div>
            <p className="text-slate-600 leading-relaxed">
              Logistic Regression validation baselines, Random Forest for non-linear canopy interactions, and gradient boosted regression trees.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F7FB]">
            <div className="font-bold text-[#14213D] text-sm mb-1">
              Data Storage & Provenance
            </div>
            <div className="text-blue-600 font-mono text-[11px] font-semibold mb-2">
              PostgreSQL · PostGIS · GeoJSON · CSV
            </div>
            <p className="text-slate-600 leading-relaxed">
              Spatially indexed polygon tables, census tract boundary geometries, time-series thermal archive with audit provenance.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F7FB]">
            <div className="font-bold text-[#14213D] text-sm mb-1">
              Geospatial Operations
            </div>
            <div className="text-blue-600 font-mono text-[11px] font-semibold mb-2">
              GeoPandas · Rasterio · Shapely
            </div>
            <p className="text-slate-600 leading-relaxed">
              Raster extraction from ECOSTRESS thermal TIFFs, zonal statistics across neighbourhood polygon masks, and NDVI calculation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F7FB]">
            <div className="font-bold text-[#14213D] text-sm mb-1">
              Interactive Web Dashboard
            </div>
            <div className="text-blue-600 font-mono text-[11px] font-semibold mb-2">
              React · TypeScript · Tailwind CSS · Leaflet
            </div>
            <p className="text-slate-600 leading-relaxed">
              Interactive polygon layers, vector microclimate grid mesh, dynamic parameter tuning sliders, and accessible data views.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-[#F5F7FB]">
            <div className="font-bold text-[#14213D] text-sm mb-1">
              Deployment & Infrastructure
            </div>
            <div className="text-blue-600 font-mono text-[11px] font-semibold mb-2">
              Google Cloud Run · Vite · Docker
            </div>
            <p className="text-slate-600 leading-relaxed">
              Containerized serverless deployment ensuring low latency for municipal emergency response coordinators.
            </p>
          </div>
        </div>
      </div>

      {/* Special Technical Investigations: OSMnx & NASA ECOSTRESS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Technical Investigations & Data Integrity Audit
        </div>
        <h3 className="text-lg font-bold text-[#14213D]">
          OSMnx Evaluation, NASA ECOSTRESS Realities &amp; Spatial Multi-Scale Resolution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: OSMnx vs Client-Side OSM */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>OSMnx vs. Client-Side Overpass</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Python vs JS</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <b>Why OSMnx was not added:</b> OSMnx is a specialized Python library designed for complex street network graph topology and walkability calculations. Because HeatShield AI is built as a pure client-side React + TypeScript application, adding OSMnx would require deploying an unnecessary Python backend server.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Instead, client-side OpenStreetMap Overpass queries and cached ODbL datasets provide the required geographic features (parks, water, drinking amenities) with zero server overhead. OSMnx would only provide meaningful value if graph-based street walkability routing or isochrone distances to cooling shelters were calculated.
            </p>
          </div>

          {/* Card 2: NASA ECOSTRESS Latency & Access */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>NASA ECOSTRESS (Product ECO2LSTE)</span>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Delayed Research Data</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <b>Why ECOSTRESS is not live:</b> ECOSTRESS operates on the International Space Station with a 70m thermal infrared resolution. It has a precessing orbit (1–4 day diurnal revisit) with 24–72 hour processing latency from NASA LP DAAC. It is <b>not a real-time point API</b>.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Downloading raw ECOSTRESS data requires NASA Earthdata Login credentials and heavy HDF5/GeoTIFF raster clipping. To maintain scientific integrity without fabricating offline satellite downloads, our prototype clearly labels LST readings as <b>representative research baselines</b>.
            </p>
          </div>

          {/* Card 3: Geographic Correctness & Spatial Scales */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Spatial Scale &amp; Study Areas</span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Multi-Scale Resolution</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <b>Explicit Geographic Anchors:</b> The pilot territory is explicitly anchored in the Greater Los Angeles Basin (Metro Core: 34.05°N, 118.24°W and Valley Basin: 34.18°N, 118.44°W). Valid coordinates are queried for each neighborhood.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <b>Resolution Limitations:</b> Open-Meteo numerical weather models operate on a ~1km to ~11km grid, and Copernicus CAMS Air Quality operates on a ~10km grid. In contrast, urban thermal hotspots and tree canopies vary at 10m–70m block scales. Atmospheric models provide boundary forcing, but local microclimate differences arise from urban surface materials.
            </p>
          </div>
        </div>
      </div>

      {/* Challenges & Mitigations Matrix (Slide 15) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          Deployment Readiness
        </div>
        <h3 className="text-lg font-bold text-[#14213D] mb-4">
          Challenges & Mitigations Before Real Deployment (Slide 15)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FB] text-slate-500 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4 w-1/3">Technical Challenge</th>
                <th className="py-2.5 px-4 w-2/3">Operational Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Data Resolution & Granularity</td>
                <td className="py-2.5 px-4">Select appropriate spatial aggregation scale; flag low-coverage boundaries clearly.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Data Freshness & Latency</td>
                <td className="py-2.5 px-4">Prioritize most recent ingest; display UTC timestamps visibly on every panel.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Cloud Cover & Sensor Gaps</td>
                <td className="py-2.5 px-4">Use multi-satellite orbital redundancy; interpolate missing cells with explicit quality flags.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Health Outcome Data Access</td>
                <td className="py-2.5 px-4">Partner with municipal health departments; use non-PHI demographic vulnerability proxies (CDC HHI).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Spatial Layer Alignment</td>
                <td className="py-2.5 px-4">Harmonize all satellite raster grids and municipal polygon boundaries to a standardized coordinate reference frame.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Model Bias & Fairness</td>
                <td className="py-2.5 px-4">Audit training weights across diverse socio-economic areas to avoid under-reporting informal settlements.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Operational Safety & Oversight</td>
                <td className="py-2.5 px-4">Enforce strict human-in-the-loop review; strictly prohibit automated emergency dispatch without human sign-off.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Roadmap & Citations (Slide 13 & 19) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roadmap (Slide 13) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Development Roadmap
          </div>
          <h4 className="text-base font-bold text-[#14213D]">
            From Prototype to Field Deployment (Slide 13)
          </h4>

          <div className="space-y-3 text-xs text-slate-600 pt-2">
            <div className="flex gap-3">
              <span className="font-mono font-bold text-blue-600 shrink-0">Phase 1:</span>
              <div>
                <span className="font-semibold text-slate-900">Build Baseline Pipeline:</span> Ingest weather station records and initial baseline risk scoring across pilot territory.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-mono font-bold text-blue-600 shrink-0">Phase 2:</span>
              <div>
                <span className="font-semibold text-slate-900">Interactive Demo (Current):</span> Interactive map interface with demo data, neighbourhood polygons, and explainability sliders.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-mono font-bold text-blue-600 shrink-0">Phase 3:</span>
              <div>
                <span className="font-semibold text-slate-900">Validate & Calibrate:</span> Backtest model against recorded extreme heat waves and hospital admission spikes.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-mono font-bold text-blue-600 shrink-0">Phase 4:</span>
              <div>
                <span className="font-semibold text-slate-900">Deploy Responsibly:</span> Establish formal alert protocols with city emergency managers and community shelters.
              </div>
            </div>
          </div>
        </div>

        {/* References & Citations (Slide 19) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Academic & Public Data Citations
          </div>
          <h4 className="text-base font-bold text-[#14213D]">
            Key Data Foundations (Slide 19)
          </h4>

          <div className="space-y-2.5 text-xs text-slate-600 pt-2">
            <div className="p-2.5 bg-[#F5F7FB] rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Berkeley Earth Surface Temperature</div>
                <div className="text-slate-500 text-[11px]">Global meteorological analysis & anomalies</div>
              </div>
              <a
                href="https://berkeleyearth.org/data/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                berkeleyearth.org <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-2.5 bg-[#F5F7FB] rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">NASA JPL ECOSTRESS</div>
                <div className="text-slate-500 text-[11px]">Thermal infrared urban heat island radiometry</div>
              </div>
              <a
                href="https://www.jpl.nasa.gov/images/pia24987-ecostress-detects-heat-islands-in-indian-heat-wave/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                jpl.nasa.gov <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-2.5 bg-[#F5F7FB] rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">CDC/ATSDR Heat & Health Index</div>
                <div className="text-slate-500 text-[11px]">Socio-demographic vulnerability metrics</div>
              </div>
              <a
                href="https://www.atsdr.cdc.gov/place-health/php/hhi/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                atsdr.cdc.gov <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Official Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed text-center">
        <b>Mandatory Disclaimer:</b> HeatShield AI is an environmental risk planning support system designed for hackathon problem statement HC-04. It is strictly intended to enhance municipal situational awareness and does not provide individualized clinical advice, medical triage, or automated emergency dispatch.
      </div>
    </div>
  );
};
