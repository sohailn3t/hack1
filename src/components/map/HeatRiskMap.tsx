import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { NeighborhoodRecord, RiskCategory } from '../../types/heat';
import { useHeatData, MapLayerMode } from '../../context/HeatDataContext';
import { Layers, Maximize2, RefreshCw, ZoomIn, ZoomOut, MapPin, Eye } from 'lucide-react';

interface HeatRiskMapProps {
  heightClass?: string;
  showControls?: boolean;
  onSelectNeighborhood?: (neighborhood: NeighborhoodRecord) => void;
}

export const HeatRiskMap: React.FC<HeatRiskMapProps> = ({
  heightClass = 'h-[520px]',
  showControls = true,
  onSelectNeighborhood,
}) => {
  const {
    neighborhoods,
    selectedNeighborhood,
    selectedLocation,
    setSelectedNeighborhood,
    activeMapLayer,
    studyArea,
    formatTemp,
    osmFeatures,
    showOsmFeatures,
    setShowOsmFeatures,
    isOsmLoading,
    osmSource,
    externalRiskScore,
    useSimulatedVulnerabilityForExternal,
  } = useHeatData();

  const [viewMode, setViewMode] = useState<'leaflet' | 'vector'>('leaflet');
  const [selectedRadiusKm] = useState(0.5);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<NeighborhoodRecord | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [id: string]: L.Polygon }>({});
  const markersRef = useRef<{ [id: string]: L.Marker | L.CircleMarker }>({});
  const osmLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const radiusLayerRef = useRef<L.Circle | null>(null);

  const handleSelect = (n: NeighborhoodRecord) => {
    setSelectedNeighborhood(n);
    if (onSelectNeighborhood) {
      onSelectNeighborhood(n);
    }
  };

  const getColorForExternalScore = (category: RiskCategory): string => {
    switch (category) {
      case 'High':
        return '#DC2626';
      case 'Elevated':
        return '#F97316';
      case 'Moderate':
        return '#EAB308';
      default:
        return '#16A34A';
    }
  };

  // Helper to get fill color based on active layer
  const getColorForRecord = (record: NeighborhoodRecord): string => {
    if (activeMapLayer === 'risk') {
      switch (record.estimatedCategory) {
        case 'High':
          return '#DC2626'; // Red
        case 'Elevated':
          return '#F97316'; // Orange
        case 'Moderate':
          return '#EAB308'; // Yellow/Amber
        case 'Lower':
          return '#16A34A'; // Green
        default:
          return '#64748B';
      }
    } else if (activeMapLayer === 'surfaceTemp') {
      // Scale from 32°C to 54°C
      if (record.landSurfaceTemperature >= 50) return '#DC2626';
      if (record.landSurfaceTemperature >= 44) return '#EA580C';
      if (record.landSurfaceTemperature >= 38) return '#F59E0B';
      return '#10B981';
    } else if (activeMapLayer === 'canopyGap') {
      // Tree canopy gap %
      if (record.treeCanopyGapPercent >= 85) return '#991B1B';
      if (record.treeCanopyGapPercent >= 70) return '#D97706';
      if (record.treeCanopyGapPercent >= 50) return '#CA8A04';
      return '#059669';
    } else {
      // Vulnerability (SVI)
      if (record.vulnerabilityIndex >= 75) return '#7C3AED';
      if (record.vulnerabilityIndex >= 50) return '#9333EA';
      if (record.vulnerabilityIndex >= 35) return '#A855F7';
      return '#C084FC';
    }
  };

  // Calculate center of current neighbourhoods
  const mapCenter = useMemo<[number, number]>(() => {
    if (neighborhoods.length === 0) return [34.052, -118.243];
    const avgLat = neighborhoods.reduce((sum, n) => sum + n.lat, 0) / neighborhoods.length;
    const avgLng = neighborhoods.reduce((sum, n) => sum + n.lng, 0) / neighborhoods.length;
    return [avgLat, avgLng];
  }, [neighborhoods]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode !== 'leaflet') return;
    if (!mapContainerRef.current) return;

    // Check if map already exists
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: studyArea === 'Demo Metro Core' ? 13 : 12,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap standard tiles (100% free, no API key required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Attribution control in corner
      L.control
        .attribution({
          position: 'bottomright',
          prefix: 'Basemap: OpenStreetMap',
        })
        .addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView(
        selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : mapCenter,
        selectedLocation ? 14 : studyArea === 'Demo Metro Core' ? 13 : 12
      );
    }

    const map = leafletMapRef.current;

    // Clean up old layers
    Object.values(polygonLayersRef.current).forEach((layer) => layer.remove());
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    polygonLayersRef.current = {};
    markersRef.current = {};

    // Render neighbourhood polygons
    neighborhoods.forEach((record) => {
      const isSelected = !selectedLocation && selectedNeighborhood?.id === record.id;
      const color = getColorForRecord(record);

      const polygon = L.polygon(record.polygon, {
        color: isSelected ? '#1E40AF' : color,
        weight: isSelected ? 3.5 : 1.5,
        opacity: isSelected ? 1 : 0.85,
        fillColor: color,
        fillOpacity: isSelected ? 0.72 : 0.5,
      }).addTo(map);

      // Popup/Tooltip
      polygon.bindTooltip(
        `<div class="text-xs p-1 font-sans">
          <div class="font-bold text-slate-900">${record.name} (${record.code})</div>
          <div class="text-slate-600 mt-0.5">Est. Risk Score: <b>${record.estimatedScore}</b> (${record.estimatedCategory})</div>
          <div class="text-slate-500">Surface Temp: ${formatTemp(record.landSurfaceTemperature)}</div>
        </div>`,
        { sticky: true }
      );

      polygon.on('click', () => {
        handleSelect(record);
      });

      polygon.on('mouseover', () => {
        setHoveredNeighborhood(record);
        if (!isSelected) {
          polygon.setStyle({ weight: 2.5, fillOpacity: 0.65 });
        }
      });

      polygon.on('mouseout', () => {
        setHoveredNeighborhood(null);
        if (!isSelected) {
          polygon.setStyle({ weight: 1.5, fillOpacity: 0.5 });
        }
      });

      polygonLayersRef.current[record.id] = polygon;

      // Small center circle marker with label
      const centerMarker = L.circleMarker([record.lat, record.lng], {
        radius: isSelected ? 6 : 4,
        color: isSelected ? '#1E40AF' : '#FFFFFF',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).addTo(map);

      centerMarker.on('click', () => handleSelect(record));
      markersRef.current[record.id] = centerMarker;
    });

    if (radiusLayerRef.current) {
      radiusLayerRef.current.remove();
      radiusLayerRef.current = null;
    }

    if (selectedLocation) {
      radiusLayerRef.current = L.circle([selectedLocation.lat, selectedLocation.lng], {
        radius: selectedRadiusKm * 1000,
        color: '#2563EB',
        weight: 2,
        opacity: 0.9,
        fillColor: '#2563EB',
        fillOpacity: 0.06,
        dashArray: '6 5',
      }).addTo(map);

      if (externalRiskScore) {
        const cellSizeKm = 0.2;
        const cellSizeLat = cellSizeKm / 111;
        const cellSizeLng = cellSizeKm / (111 * Math.cos((selectedLocation.lat * Math.PI) / 180));
        const color = getColorForExternalScore(externalRiskScore.category);
        const cellRange = Math.ceil(selectedRadiusKm / cellSizeKm);
        for (let row = -cellRange; row <= cellRange; row += 1) {
          for (let column = -cellRange; column <= cellRange; column += 1) {
            const northSouthKm = row * cellSizeKm;
            const eastWestKm = column * cellSizeKm;
            if (Math.hypot(northSouthKm, eastWestKm) > selectedRadiusKm) continue;

            const centerLat = selectedLocation.lat + row * cellSizeLat;
            const centerLng = selectedLocation.lng + column * cellSizeLng;
            const cell = L.rectangle(
              [
                [centerLat - cellSizeLat / 2, centerLng - cellSizeLng / 2],
                [centerLat + cellSizeLat / 2, centerLng + cellSizeLng / 2],
              ],
              {
                color,
                weight: 1.5,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: 0.5,
              }
            ).addTo(map);
            cell.bindTooltip(
              `<div class="text-xs p-1 font-sans"><div class="font-bold">SIMULATED DEMONSTRATION DATA</div><div class="text-slate-600">${externalRiskScore.category} · ${externalRiskScore.score}/100</div><div class="text-slate-500">Location-level score; not measured cell-by-cell</div><div class="text-slate-500">Within ${selectedRadiusKm} km radius</div></div>`
            );
            polygonLayersRef.current[`external-${row}-${column}`] = cell;
          }
        }
      }
    }

    // Clean up old OSM layer group if exists
    if (osmLayerGroupRef.current) {
      osmLayerGroupRef.current.remove();
      osmLayerGroupRef.current = null;
    }

    // Render real OpenStreetMap geographic features (parks, water, cooling amenities)
    if (showOsmFeatures && osmFeatures && osmFeatures.length > 0) {
      const osmGroup = L.layerGroup().addTo(map);
      osmFeatures.forEach((feat) => {
        const markerColor =
          feat.category === 'park'
            ? '#059669' // Green for parks
            : feat.category === 'water'
            ? '#0284C7' // Blue for water
            : '#6366F1'; // Indigo for cooling amenities

        const marker = L.circleMarker([feat.lat, feat.lng], {
          radius: 5,
          color: '#FFFFFF',
          weight: 1.5,
          fillColor: markerColor,
          fillOpacity: 0.9,
        });

        marker.bindTooltip(
          `<div class="text-xs p-1 font-sans">
            <div class="font-bold text-slate-900">${feat.name}</div>
            <div class="text-[11px] text-slate-600 capitalize">OSM ${feat.category.replace('_', ' ')}</div>
            <div class="text-[10px] text-slate-400 font-mono">Source: ${feat.source}</div>
          </div>`,
          { sticky: true }
        );

        marker.addTo(osmGroup);
      });
      osmLayerGroupRef.current = osmGroup;
    }

    // Auto-fit demo bounds only when no external geocoded location is selected.
    if (!selectedLocation && neighborhoods.length > 0) {
      const allCoords = neighborhoods.flatMap((n) => n.polygon);
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [24, 24] });
    }

    if (selectedLocation) {
      L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(map)
        .bindTooltip(
          `<div class="text-xs p-1 font-sans"><div class="font-bold">${selectedLocation.displayName}</div><div class="text-slate-500">Selected location · score unavailable without verified vulnerability</div></div>`
        );
    }

    return () => {
      // In effect cleanup, keep map instance intact unless unmounted
    };
  }, [
    viewMode,
    studyArea,
    neighborhoods,
    activeMapLayer,
    selectedNeighborhood?.id,
    selectedLocation?.id,
    selectedLocation?.lat,
    selectedLocation?.lng,
    selectedLocation?.displayName,
    externalRiskScore?.score,
    externalRiskScore?.category,
    selectedRadiusKm,
    useSimulatedVulnerabilityForExternal,
    showOsmFeatures,
    osmFeatures,
  ]);

  // Pan to selected neighborhood smoothly
  useEffect(() => {
    if (leafletMapRef.current && selectedLocation) {
      leafletMapRef.current.panTo([selectedLocation.lat, selectedLocation.lng], {
        animate: true,
        duration: 0.6,
      });
      return;
    }

    if (leafletMapRef.current && selectedNeighborhood) {
      leafletMapRef.current.panTo([selectedNeighborhood.lat, selectedNeighborhood.lng], {
        animate: true,
        duration: 0.6,
      });

      // Update polygon styling
      Object.entries(polygonLayersRef.current).forEach(([id, layer]) => {
        const isSelected = id === selectedNeighborhood.id;
        const record = neighborhoods.find((n) => n.id === id);
        if (record) {
          const color = getColorForRecord(record);
          layer.setStyle({
            color: isSelected ? '#1E40AF' : color,
            weight: isSelected ? 3.5 : 1.5,
            fillOpacity: isSelected ? 0.72 : 0.5,
          });
        }
      });
    }
  }, [selectedNeighborhood?.id]);

  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();
  const handleResetView = () => {
    if (selectedLocation && leafletMapRef.current && radiusLayerRef.current) {
      leafletMapRef.current.fitBounds(radiusLayerRef.current.getBounds(), { padding: [30, 30] });
      return;
    }
    if (leafletMapRef.current && neighborhoods.length > 0) {
      const allCoords = neighborhoods.flatMap((n) => n.polygon);
      leafletMapRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [30, 30] });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
      {/* Top Map Action Bar */}
      {showControls && (
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              Radius
              <select
                value={selectedRadiusKm}
                disabled
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 disabled:opacity-100"
                aria-label="Selected map radius"
              >
                <option value={0.5}>0.5 km</option>
              </select>
            </label>
            {/* View Mode Toggle: Leaflet vs High-Resolution Vector Grid */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('leaflet')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'leaflet'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Geographic Basemap Layer"
              >
                Basemap
              </button>
            </div>

            {viewMode === 'leaflet' && (
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Recenter Map"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container View */}
      <div className={`relative w-full ${heightClass} bg-slate-50 overflow-hidden`}>
        {viewMode === 'leaflet' ? (
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        ) : (
          /* High-res Interactive SVG Vector Microclimate Grid View */
          <div className="w-full h-full bg-[#0F172A] p-4 flex flex-col justify-between relative overflow-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono">
                {selectedLocation
                  ? `Selected location · ${externalRiskScore ? '9-cell location-level visualization' : 'grid risk unavailable'}`
                  : `Study Area: ${studyArea} · ${neighborhoods.length} Analyzed Geospatial Cells`}
              </span>
              <span className="text-[11px] text-slate-500">
                Click any cell to inspect microclimate profile
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-auto max-w-4xl mx-auto w-full">
              {selectedLocation ? (
                externalRiskScore ? (
                  Array.from({ length: 9 }, (_, index) => (
                    <div
                      key={`external-cell-${index}`}
                      className="p-3 rounded-lg text-left relative border flex flex-col justify-between h-28"
                      style={{
                        borderColor: getColorForExternalScore(externalRiskScore.category),
                        backgroundColor: `${getColorForExternalScore(externalRiskScore.category)}80`,
                      }}
                    >
                      <span className="text-xs font-semibold text-white">SIMULATED DEMO CELL</span>
                      <span className="text-[11px] text-white/80 font-mono">Location-level score</span>
                      <span className="font-mono font-bold text-white">
                        {externalRiskScore.score}/100 · {externalRiskScore.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full max-w-lg mx-auto text-center border border-slate-700 rounded-lg p-6">
                    <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-100">External location selected</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Grid-level risk is unavailable until all required location inputs are valid. Available live layers and the exact location marker remain available in Basemap view.
                    </p>
                  </div>
                )
              ) : neighborhoods.map((n) => {
                const isSelected = selectedNeighborhood?.id === n.id;
                const color = getColorForRecord(n);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelect(n)}
                    className={`p-3 rounded-lg text-left transition-all relative border flex flex-col justify-between h-28 ${
                      isSelected
                        ? 'border-blue-400 bg-slate-800/90 shadow-md ring-2 ring-blue-500/50'
                        : 'border-slate-700/80 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {n.name}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: color }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {n.code} · {formatTemp(n.landSurfaceTemperature)} LST
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">{n.estimatedCategory}</span>
                      <span className="font-mono font-bold text-slate-200">
                        {n.estimatedScore}/100
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center text-[11px] text-slate-500 pt-2 font-mono">
              Vector polygon projection · Resolution 70m ECOSTRESS thermal grid
            </div>
          </div>
        )}

        {/* Floating Quick Stats on Selected Area */}
        {selectedLocation ? (
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-blue-200 rounded-lg p-2.5 shadow-md max-w-xs pointer-events-none">
            <div className="text-[11px] text-blue-600 uppercase tracking-wider font-semibold">Geocoded Focus</div>
            <div className="text-sm font-bold text-[#14213D] truncate">{selectedLocation.displayName}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {externalRiskScore
                ? `Location-level ${externalRiskScore.category} visualization (${externalRiskScore.score}/100). It is not measured cell-by-cell${useSimulatedVulnerabilityForExternal ? ' and uses SIMULATED DEMONSTRATION DATA.' : '.'}`
                : 'Live weather, air quality, and available satellite indicators requested for this place. External grid-level risk is unavailable until required inputs are connected.'}
            </div>
          </div>
        ) : selectedNeighborhood && (
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-lg p-2.5 shadow-md max-w-xs pointer-events-none">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Active Focus
            </div>
            <div className="text-sm font-bold text-[#14213D] truncate">
              {selectedNeighborhood.name}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getColorForRecord(selectedNeighborhood) }}
              />
              <span className="font-semibold text-slate-700">
                {selectedNeighborhood.estimatedCategory} Risk ({selectedNeighborhood.estimatedScore})
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-mono">
                {formatTemp(selectedNeighborhood.airTemperature)}
              </span>
            </div>
          </div>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-lg p-3 shadow-md max-w-[210px]">
          <div className="text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-2">
            {activeMapLayer === 'risk' && 'Estimated Heat-Risk'}
            {activeMapLayer === 'surfaceTemp' && 'Satellite LST (°C)'}
            {activeMapLayer === 'canopyGap' && 'Tree Canopy Gap'}
            {activeMapLayer === 'vulnerability' && 'Social Vulnerability (SVI)'}
          </div>

          {activeMapLayer === 'risk' && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#DC2626]" /> High
                </span>
                <span className="font-mono text-slate-500 text-[11px]">75–100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#F97316]" /> Elevated
                </span>
                <span className="font-mono text-slate-500 text-[11px]">50–74</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#EAB308]" /> Moderate
                </span>
                <span className="font-mono text-slate-500 text-[11px]">25–49</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#16A34A]" /> Lower
                </span>
                <span className="font-mono text-slate-500 text-[11px]">0–24</span>
              </div>
            </div>
          )}

          {activeMapLayer === 'surfaceTemp' && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#DC2626]" /> &gt; 50°C
                </span>
                <span className="text-slate-500 text-[11px]">Severe Hotspot</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#EA580C]" /> 44–50°C
                </span>
                <span className="text-slate-500 text-[11px]">Elevated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#F59E0B]" /> 38–44°C
                </span>
                <span className="text-slate-500 text-[11px]">Moderate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#10B981]" /> &lt; 38°C
                </span>
                <span className="text-slate-500 text-[11px]">Buffered</span>
              </div>
            </div>
          )}

          {activeMapLayer === 'canopyGap' && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#991B1B]" /> 85%+ Gap
                </span>
                <span className="text-slate-500 text-[11px]">Barren/Concrete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#D97706]" /> 70–85% Gap
                </span>
                <span className="text-slate-500 text-[11px]">Sparse Trees</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#CA8A04]" /> 50–70% Gap
                </span>
                <span className="text-slate-500 text-[11px]">Moderate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#059669]" /> &lt; 50% Gap
                </span>
                <span className="text-slate-500 text-[11px]">Canopy Dense</span>
              </div>
            </div>
          )}

          {activeMapLayer === 'vulnerability' && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#7C3AED]" /> 75–100
                </span>
                <span className="text-slate-500 text-[11px]">High Vulnerability</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#9333EA]" /> 50–74
                </span>
                <span className="text-slate-500 text-[11px]">Elevated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-3 h-3 rounded bg-[#C084FC]" /> &lt; 50
                </span>
                <span className="text-slate-500 text-[11px]">Baseline</span>
              </div>
            </div>
          )}

          {/* OpenStreetMap Landmark Overlay Legend */}
          {showOsmFeatures && (
            <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] space-y-1">
              <span className="font-semibold text-slate-600 block text-[10px] uppercase tracking-wider">
                OSM Landmarks ({osmFeatures.length})
              </span>
              <span className="text-[10px] text-slate-500 block">{osmSource}</span>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0" />
                <span>Parks &amp; Green Spaces</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#0284C7] shrink-0" />
                <span>Open Water Bodies</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#6366F1] shrink-0" />
                <span>Hydration &amp; Civic Shading</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer & OpenStreetMap Attribution directly beneath map */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="italic">
          Demo visualization only. Risk categories are illustrative and are not validated health predictions.
        </span>
        <span className="text-[10px] text-slate-400">
          Basemap &amp; Features &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline text-slate-600">OpenStreetMap contributors</a> (ODbL). Note: Mapped parks do not provide physical tree-canopy % or population vulnerability.
        </span>
      </div>
    </div>
  );
};
