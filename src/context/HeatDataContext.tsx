import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from './AuthContext';
import {
  NeighborhoodRecord,
  RiskWeights,
  RiskCategory,
  DataQuality,
  ReviewTask,
  HeatAlertNotification,
  RealWeatherData,
  RealAirQualityData,
  RealLSTData,
  OsmGeographicFeature,
  GeocodedLocation,
} from '../types/heat';
import {
  DEMO_METRO_NEIGHBORHOODS,
  VALLEY_BASIN_NEIGHBORHOODS,
  DEFAULT_WEIGHTS,
  DEFAULT_SIMULATED_VULNERABILITY_INDEX,
  INITIAL_REVIEW_TASKS,
  computeRiskScore,
} from '../data/mockHeatData';
import { fetchRealWeather } from '../services/weatherService';
import { fetchRealAirQuality } from '../services/airQualityService';
import { fetchOsmFeatures } from '../services/osmFeatureService';
import { fetchRealLST } from '../services/lstService';

export type NavTab = 'overview' | 'map' | 'explorer' | 'analysis' | 'actions' | 'about' | 'history';
export type MapLayerMode = 'risk' | 'surfaceTemp' | 'canopyGap' | 'vulnerability';

interface HeatDataContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  studyArea: 'Demo Metro Core' | 'Valley Regional Basin';
  setStudyArea: (area: 'Demo Metro Core' | 'Valley Regional Basin') => void;
  neighborhoods: NeighborhoodRecord[];
  allNeighborhoods: NeighborhoodRecord[];
  selectedNeighborhood: NeighborhoodRecord;
  setSelectedNeighborhood: (n: NeighborhoodRecord) => void;
  selectNeighborhoodById: (id: string) => void;
  selectedLocation: GeocodedLocation | null;
  setSelectedLocation: (location: GeocodedLocation) => void;
  weights: RiskWeights;
  setWeights: React.Dispatch<React.SetStateAction<RiskWeights>>;
  updateWeight: (key: keyof RiskWeights, value: number) => void;
  resetWeights: () => void;
  temperatureUnit: 'C' | 'F';
  setTemperatureUnit: (unit: 'C' | 'F') => void;
  formatTemp: (celsius: number) => string;
  activeMapLayer: MapLayerMode;
  setActiveMapLayer: (layer: MapLayerMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  riskCategoryFilter: string;
  setRiskCategoryFilter: (cat: string) => void;
  dataQualityFilter: string;
  setDataQualityFilter: (dq: string) => void;
  filteredNeighborhoods: NeighborhoodRecord[];
  reviewTasks: ReviewTask[];
  toggleTaskComplete: (taskId: string) => void;
  addTask: (task: Omit<ReviewTask, 'id' | 'completed'>) => void;
  notifications: HeatAlertNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;
  uploadedDataset: NeighborhoodRecord[] | null;
  loadUploadedDataset: (records: NeighborhoodRecord[]) => void;
  resetAllDemoData: () => void;
  highRiskCount: number;
  elevatedRiskCount: number;
  moderateRiskCount: number;
  lowerRiskCount: number;
  // Real weather integration state
  realWeather: RealWeatherData | null;
  isWeatherLoading: boolean;
  weatherError: string | null;
  refetchRealWeather: () => Promise<void>;
  useLiveWeatherInScore: boolean;
  setUseLiveWeatherInScore: (val: boolean) => void;
  liveRecalculatedScore: { score: number; category: RiskCategory } | null;
  externalRiskScore: { score: number; category: RiskCategory } | null;
  externalRiskMissingInputs: string[];
  useSimulatedVulnerabilityForExternal: boolean;
  setUseSimulatedVulnerabilityForExternal: (enabled: boolean) => void;
  useSimulatedVulnerabilityInDemo: boolean;
  setUseSimulatedVulnerabilityInDemo: (enabled: boolean) => void;
  simulatedVulnerabilityIndex: number;
  setSimulatedVulnerabilityIndex: (value: number) => void;
  // Real air quality integration state (Open-Meteo)
  realAirQuality: RealAirQualityData | null;
  isAirQualityLoading: boolean;
  airQualityError: string | null;
  refetchRealAirQuality: () => Promise<void>;
  realLST: RealLSTData | null;
  isLSTLoading: boolean;
  lstError: string | null;
  refetchRealLST: () => Promise<void>;
  // OpenStreetMap geographic features state
  osmFeatures: OsmGeographicFeature[];
  isOsmLoading: boolean;
  showOsmFeatures: boolean;
  setShowOsmFeatures: (val: boolean) => void;
  osmSource: string;
  refetchOsmFeatures: () => Promise<void>;
}

const HeatDataContext = createContext<HeatDataContextType | undefined>(undefined);

export const HeatDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const upsertHistory = useMutation(api.history.upsert);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [studyArea, setStudyArea] = useState<'Demo Metro Core' | 'Valley Regional Basin'>('Demo Metro Core');
  const [weights, setWeights] = useState<RiskWeights>(DEFAULT_WEIGHTS);
  const [useSimulatedVulnerabilityInDemo, setUseSimulatedVulnerabilityInDemo] = useState(false);
  const [useSimulatedVulnerabilityForExternal, setUseSimulatedVulnerabilityForExternal] = useState(true);
  const [simulatedVulnerabilityIndex, setSimulatedVulnerabilityIndex] = useState(
    DEFAULT_SIMULATED_VULNERABILITY_INDEX
  );
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [activeMapLayer, setActiveMapLayer] = useState<MapLayerMode>('risk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskCategoryFilter, setRiskCategoryFilter] = useState<string>('All');
  const [dataQualityFilter, setDataQualityFilter] = useState<string>('All');
  const [reviewTasks, setReviewTasks] = useState<ReviewTask[]>(INITIAL_REVIEW_TASKS);
  const [notifications, setNotifications] = useState<HeatAlertNotification[]>([]);
  const [uploadedDataset, setUploadedDataset] = useState<NeighborhoodRecord[] | null>(null);

  // Real weather state from Open-Meteo
  const [realWeather, setRealWeather] = useState<RealWeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [useLiveWeatherInScore, setUseLiveWeatherInScore] = useState<boolean>(false);

  // Real air quality state (Open-Meteo)
  const [realAirQuality, setRealAirQuality] = useState<RealAirQualityData | null>(null);
  const [isAirQualityLoading, setIsAirQualityLoading] = useState<boolean>(false);
  const [airQualityError, setAirQualityError] = useState<string | null>(null);
  const [realLST, setRealLST] = useState<RealLSTData | null>(null);
  const [isLSTLoading, setIsLSTLoading] = useState<boolean>(false);
  const [lstError, setLSTError] = useState<string | null>(null);

  // OSM geographic features state
  const [osmFeatures, setOsmFeatures] = useState<OsmGeographicFeature[]>([]);
  const [isOsmLoading, setIsOsmLoading] = useState<boolean>(false);
  const [showOsmFeatures, setShowOsmFeatures] = useState<boolean>(true);
  const [osmSource, setOsmSource] = useState<string>('OpenStreetMap (ODbL)');

  // Raw base neighborhoods for current study area or uploaded dataset
  const baseRecords = useMemo(() => {
    if (uploadedDataset && uploadedDataset.length > 0) {
      return uploadedDataset;
    }
    return studyArea === 'Demo Metro Core' ? DEMO_METRO_NEIGHBORHOODS : VALLEY_BASIN_NEIGHBORHOODS;
  }, [studyArea, uploadedDataset]);

  // Dynamically recompute risk scores when weights change
  const recomputedNeighborhoods = useMemo(() => {
    return baseRecords.map((item) => {
      const demoRecord =
        useSimulatedVulnerabilityInDemo && studyArea === 'Demo Metro Core'
          ? { ...item, vulnerabilityIndex: simulatedVulnerabilityIndex }
          : item;
      const { score, category } = computeRiskScore(demoRecord, weights);
      return {
        ...demoRecord,
        estimatedScore: score,
        estimatedCategory: category,
      };
    });
  }, [baseRecords, simulatedVulnerabilityIndex, studyArea, useSimulatedVulnerabilityInDemo, weights]);

  // Keep track of selected neighborhood
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(
    DEMO_METRO_NEIGHBORHOODS[0].id
  );
  const [selectedLocation, setSelectedLocationState] = useState<GeocodedLocation | null>(null);

  // Sync selected neighborhood if study area changes or current selection isn't in current list
  const selectedNeighborhood = useMemo(() => {
    const found = recomputedNeighborhoods.find((n) => n.id === selectedNeighborhoodId);
    if (found) return found;
    // Default to the highest score neighborhood in the list
    const sorted = [...recomputedNeighborhoods].sort((a, b) => b.estimatedScore - a.estimatedScore);
    return sorted[0] || recomputedNeighborhoods[0];
  }, [recomputedNeighborhoods, selectedNeighborhoodId]);

  // Update selected id when area changes
  useEffect(() => {
    if (recomputedNeighborhoods.length > 0) {
      const exists = recomputedNeighborhoods.some((n) => n.id === selectedNeighborhoodId);
      if (!exists) {
        // pick highest risk one
        const highest = [...recomputedNeighborhoods].sort((a, b) => b.estimatedScore - a.estimatedScore)[0];
        if (highest) setSelectedNeighborhoodId(highest.id);
      }
    }
  }, [studyArea, recomputedNeighborhoods, selectedNeighborhoodId]);

  // Fetch real weather when selected neighborhood changes
  const refetchRealWeather = useCallback(async () => {
    if (!selectedNeighborhood && !selectedLocation) return;
    setRealWeather(null);
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const result = await fetchRealWeather(
        selectedLocation?.lat ?? selectedNeighborhood.lat,
        selectedLocation?.lng ?? selectedNeighborhood.lng
      );
      setRealWeather(result);
    } catch (err: any) {
      setWeatherError(err.message || 'Unable to fetch real-time weather from Open-Meteo.');
    } finally {
      setIsWeatherLoading(false);
    }
  }, [selectedLocation?.lat, selectedLocation?.lng, selectedNeighborhood?.lat, selectedNeighborhood?.lng]);

  // Fetch real air quality from Open-Meteo Air Quality API
  const refetchRealAirQuality = useCallback(async () => {
    if (!selectedNeighborhood && !selectedLocation) return;
    setRealAirQuality(null);
    setIsAirQualityLoading(true);
    setAirQualityError(null);
    try {
      const result = await fetchRealAirQuality(
        selectedLocation?.lat ?? selectedNeighborhood.lat,
        selectedLocation?.lng ?? selectedNeighborhood.lng
      );
      setRealAirQuality(result);
    } catch (err: any) {
      setAirQualityError(err.message || 'Unable to fetch real-time air quality from Open-Meteo.');
    } finally {
      setIsAirQualityLoading(false);
    }
  }, [selectedLocation?.lat, selectedLocation?.lng, selectedNeighborhood?.lat, selectedNeighborhood?.lng]);

  const refetchRealLST = useCallback(async () => {
    if (!selectedLocation) {
      setRealLST(null);
      setLSTError(null);
      return;
    }
    setRealLST(null);
    setIsLSTLoading(true);
    setLSTError(null);
    try {
      setRealLST(await fetchRealLST(selectedLocation.lat, selectedLocation.lng));
    } catch (err: any) {
      setLSTError(err.message || 'Unable to fetch satellite LST.');
    } finally {
      setIsLSTLoading(false);
    }
  }, [selectedLocation?.lat, selectedLocation?.lng]);

  // Fetch real OpenStreetMap geographic features for study area and coordinates
  const refetchOsmFeatures = useCallback(async () => {
    if (!selectedNeighborhood && !selectedLocation) return;
    setOsmFeatures([]);
    setIsOsmLoading(true);
    try {
      const result = await fetchOsmFeatures(
        studyArea,
        selectedLocation?.lat ?? selectedNeighborhood.lat,
        selectedLocation?.lng ?? selectedNeighborhood.lng,
        !selectedLocation
      );
      setOsmFeatures(result.features);
      setOsmSource(result.source);
    } catch (err: any) {
      // Keep existing features gracefully
    } finally {
      setIsOsmLoading(false);
    }
  }, [studyArea, selectedLocation?.lat, selectedLocation?.lng, selectedNeighborhood?.lat, selectedNeighborhood?.lng]);

  useEffect(() => {
    refetchRealWeather();
  }, [refetchRealWeather]);

  useEffect(() => {
    refetchRealAirQuality();
  }, [refetchRealAirQuality]);

  useEffect(() => {
    refetchRealLST();
  }, [refetchRealLST]);

  useEffect(() => {
    refetchOsmFeatures();
  }, [refetchOsmFeatures]);

  // Compute live recalculated risk score when real weather is fetched
  const liveRecalculatedScore = useMemo(() => {
    if (selectedLocation || !selectedNeighborhood || !realWeather) return null;
    return computeRiskScore(
      {
        ...selectedNeighborhood,
        airTemperature: realWeather.temperature,
        relativeHumidity: realWeather.relativeHumidity,
      },
      weights
    );
  }, [selectedLocation, selectedNeighborhood, realWeather, weights]);

  const externalRiskMissingInputs = useMemo(() => {
    if (!selectedLocation) return [];
    const spatial = realLST?.spatial;
    const simulatedVulnerabilityInput =
      Number.isFinite(simulatedVulnerabilityIndex) &&
      simulatedVulnerabilityIndex >= 0 &&
      simulatedVulnerabilityIndex <= 100
        ? simulatedVulnerabilityIndex
        : null;
    const inputs: Array<[string, number | null | undefined]> = [
      ['air temperature', realWeather?.temperature],
      ['relative humidity', realWeather?.relativeHumidity],
      ['land-surface temperature', realLST?.temperatureCelsius],
      ['NDVI', spatial?.ndvi],
      ['built-environment ratio', spatial?.builtEnvironmentRatio],
      ['vulnerability index', useSimulatedVulnerabilityForExternal ? simulatedVulnerabilityInput : null],
    ];
    return inputs
      .filter(([, value]) => value === null || value === undefined || !Number.isFinite(value))
      .map(([name]) => name);
  }, [realLST, realWeather, selectedLocation, simulatedVulnerabilityIndex, useSimulatedVulnerabilityForExternal]);

  const externalRiskScore = useMemo(() => {
    const vulnerabilityCandidate = useSimulatedVulnerabilityForExternal
      ? simulatedVulnerabilityIndex
      : null;
    const vulnerabilityIndex =
      vulnerabilityCandidate !== null &&
      Number.isFinite(vulnerabilityCandidate) &&
      vulnerabilityCandidate >= 0 &&
      vulnerabilityCandidate <= 100
        ? vulnerabilityCandidate
        : null;
    if (
      !selectedLocation ||
      externalRiskMissingInputs.length > 0 ||
      !realWeather ||
      !realLST?.spatial ||
      vulnerabilityIndex === null
    ) {
      return null;
    }
    return computeRiskScore(
      {
        airTemperature: realWeather.temperature,
        relativeHumidity: realWeather.relativeHumidity,
        landSurfaceTemperature: realLST.temperatureCelsius,
        vegetationIndex: realLST.spatial.ndvi as number,
        builtEnvironmentRatio: realLST.spatial.builtEnvironmentRatio as number,
        vulnerabilityIndex,
      },
      weights
    );
  }, [
    externalRiskMissingInputs,
    realLST,
    realWeather,
    selectedLocation,
    simulatedVulnerabilityIndex,
    useSimulatedVulnerabilityForExternal,
    weights,
  ]);

  useEffect(() => {
    if (!token || !user || !selectedLocation) return;
    void upsertHistory({
      token,
      locationId: selectedLocation.id,
      displayName: selectedLocation.displayName,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      radiusKm: 0.5,
      riskScore: externalRiskScore?.score,
      riskCategory: externalRiskScore?.category,
      isSimulated: Boolean(externalRiskScore),
    });
  }, [externalRiskScore, selectedLocation, token, upsertHistory, user]);

  const setSelectedNeighborhood = (n: NeighborhoodRecord) => {
    setSelectedNeighborhoodId(n.id);
    setSelectedLocationState(null);
    setRealWeather(null);
    setRealAirQuality(null);
    setRealLST(null);
    setWeatherError(null);
    setAirQualityError(null);
    setLSTError(null);
    setOsmFeatures([]);
  };

  const setSelectedLocation = (location: GeocodedLocation) => {
    setSelectedLocationState(location);
    setRealWeather(null);
    setRealAirQuality(null);
    setRealLST(null);
    setWeatherError(null);
    setAirQualityError(null);
    setLSTError(null);
    setOsmFeatures([]);
  };

  const selectNeighborhoodById = (id: string) => {
    const found = recomputedNeighborhoods.find((n) => n.id === id);
    if (found) {
      setSelectedNeighborhoodId(id);
    }
  };

  const updateWeight = (key: keyof RiskWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(1, value)),
    }));
  };

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    setUseSimulatedVulnerabilityInDemo(false);
    setUseSimulatedVulnerabilityForExternal(true);
    setSimulatedVulnerabilityIndex(DEFAULT_SIMULATED_VULNERABILITY_INDEX);
  };

  const formatTemp = (celsius: number): string => {
    if (temperatureUnit === 'F') {
      const f = (celsius * 9) / 5 + 32;
      return `${f.toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  };

  // Filtered neighbourhoods
  const filteredNeighborhoods = useMemo(() => {
    return recomputedNeighborhoods.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        riskCategoryFilter === 'All' || item.estimatedCategory === riskCategoryFilter;
      const matchesQuality =
        dataQualityFilter === 'All' || item.dataQuality === dataQualityFilter;
      return matchesSearch && matchesCategory && matchesQuality;
    });
  }, [recomputedNeighborhoods, searchQuery, riskCategoryFilter, dataQualityFilter]);

  // Category counts
  const highRiskCount = useMemo(
    () => recomputedNeighborhoods.filter((n) => n.estimatedCategory === 'High').length,
    [recomputedNeighborhoods]
  );
  const elevatedRiskCount = useMemo(
    () => recomputedNeighborhoods.filter((n) => n.estimatedCategory === 'Elevated').length,
    [recomputedNeighborhoods]
  );
  const moderateRiskCount = useMemo(
    () => recomputedNeighborhoods.filter((n) => n.estimatedCategory === 'Moderate').length,
    [recomputedNeighborhoods]
  );
  const lowerRiskCount = useMemo(
    () => recomputedNeighborhoods.filter((n) => n.estimatedCategory === 'Lower').length,
    [recomputedNeighborhoods]
  );

  const toggleTaskComplete = (taskId: string) => {
    setReviewTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            }
          : t
      )
    );
  };

  const addTask = (task: Omit<ReviewTask, 'id' | 'completed'>) => {
    const newTask: ReviewTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setReviewTasks((prev) => [newTask, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const loadUploadedDataset = (records: NeighborhoodRecord[]) => {
    setUploadedDataset(records);
    if (records.length > 0) {
      setSelectedNeighborhoodId(records[0].id);
    }
  };

  const resetAllDemoData = () => {
    setUploadedDataset(null);
    setWeights(DEFAULT_WEIGHTS);
    setSearchQuery('');
    setRiskCategoryFilter('All');
    setDataQualityFilter('All');
    setReviewTasks(INITIAL_REVIEW_TASKS);
    setNotifications([]);
    setStudyArea('Demo Metro Core');
    setSelectedNeighborhoodId(DEMO_METRO_NEIGHBORHOODS[0].id);
    setSelectedLocationState(null);
  };

  return (
    <HeatDataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        studyArea,
        setStudyArea,
        neighborhoods: recomputedNeighborhoods,
        allNeighborhoods: recomputedNeighborhoods,
        selectedNeighborhood,
        setSelectedNeighborhood,
        selectNeighborhoodById,
        selectedLocation,
        setSelectedLocation,
        weights,
        setWeights,
        updateWeight,
        resetWeights,
        temperatureUnit,
        setTemperatureUnit,
        formatTemp,
        activeMapLayer,
        setActiveMapLayer,
        searchQuery,
        setSearchQuery,
        riskCategoryFilter,
        setRiskCategoryFilter,
        dataQualityFilter,
        setDataQualityFilter,
        filteredNeighborhoods,
        reviewTasks,
        toggleTaskComplete,
        addTask,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationCount,
        uploadedDataset,
        loadUploadedDataset,
        resetAllDemoData,
        highRiskCount,
        elevatedRiskCount,
        moderateRiskCount,
        lowerRiskCount,
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
        setUseSimulatedVulnerabilityForExternal,
        useSimulatedVulnerabilityInDemo,
        setUseSimulatedVulnerabilityInDemo,
        simulatedVulnerabilityIndex,
        setSimulatedVulnerabilityIndex,
        realAirQuality,
        isAirQualityLoading,
        airQualityError,
        refetchRealAirQuality,
        realLST,
        isLSTLoading,
        lstError,
        refetchRealLST,
        osmFeatures,
        isOsmLoading,
        showOsmFeatures,
        setShowOsmFeatures,
        osmSource,
        refetchOsmFeatures,
      }}
    >
      {children}
    </HeatDataContext.Provider>
  );
};

export const useHeatData = () => {
  const context = useContext(HeatDataContext);
  if (!context) {
    throw new Error('useHeatData must be used within a HeatDataProvider');
  }
  return context;
};
