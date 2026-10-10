import React, { useEffect, useRef, useState } from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import { reverseGeocode, searchPlaces } from '../../services/geocodingService';
import { GeocodedLocation } from '../../types/heat';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Sparkles,
  MapPin,
  LocateFixed,
} from 'lucide-react';

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleMobileMenu,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const {
    activeTab,
    studyArea,
    setStudyArea,
    searchQuery,
    setSearchQuery,
    unreadNotificationCount,
    neighborhoods,
    setSelectedNeighborhood,
    setSelectedLocation,
  } = useHeatData();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [geocodedResults, setGeocodedResults] = useState<GeocodedLocation[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const geocodingAbortRef = useRef<AbortController | null>(null);

  const tabTitles = {
    overview: 'Overview',
    map: 'Heat Risk Map',
    explorer: 'Data Explorer',
    analysis: 'Risk Analysis & Scoring',
    actions: 'Preventive Actions',
    about: 'About Project',
  };

  // Quick search results
  const matchingNeighborhoods = searchQuery.trim()
    ? neighborhoods.filter(
        (n) =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const query = searchQuery.trim();
    setGeocodingError(null);
    setHasSearched(false);
    setGeocodedResults([]);
    geocodingAbortRef.current?.abort();
    if (query.length < 3) {
      setIsGeocoding(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      geocodingAbortRef.current = controller;
      setIsGeocoding(true);
      try {
        setGeocodedResults(await searchPlaces(query, controller.signal));
        setHasSearched(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setGeocodingError((error as Error).message || 'Unable to search OpenStreetMap locations.');
          setHasSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsGeocoding(false);
      }
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const handleCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Browser geolocation is not available.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setSelectedLocation(await reverseGeocode(coords.latitude, coords.longitude));
          setSearchQuery('');
          setIsSearchFocused(false);
        } catch {
          setSelectedLocation({
            id: `current-${coords.latitude.toFixed(6)}-${coords.longitude.toFixed(6)}`,
            displayName: `Current location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`,
            lat: coords.latitude,
            lng: coords.longitude,
            source: 'OpenStreetMap Nominatim',
          });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. No location was selected.'
            : 'Unable to retrieve your current location. No location was selected.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>HeatShield AI</span>
              <span>/</span>
              <span className="text-slate-600 font-medium capitalize">
                {tabTitles[activeTab]}
              </span>
            </div>
            <h1 className="text-base lg:text-lg font-bold text-[#14213D] leading-tight">
              {tabTitles[activeTab]}
            </h1>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="relative max-w-xs md:max-w-sm w-full hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search neighbourhood or place..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F7FB] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="absolute left-full ml-2 top-0 whitespace-nowrap px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            title="Use current browser location"
          >
            <LocateFixed className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
            {isLocating ? 'Locating…' : 'Current Location'}
          </button>
          {locationError && <div className="absolute top-full mt-1 text-[10px] text-red-600">{locationError}</div>}

          {/* Quick Search Popover */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Areas ({matchingNeighborhoods.length})
              </div>
              {matchingNeighborhoods.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedNeighborhood(n);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600">
                      {n.name}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                      ({n.code})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-600">
                    Risk {n.estimatedScore}
                  </span>
                </button>
              ))}
              {isGeocoding && <div className="px-3 py-2 text-xs text-slate-500">Searching OpenStreetMap…</div>}
              {!isGeocoding && geocodingError && <div className="px-3 py-2 text-xs text-red-600">{geocodingError}</div>}
              {!isGeocoding && !geocodingError && hasSearched && geocodedResults.length === 0 && matchingNeighborhoods.length === 0 && <div className="px-3 py-2 text-xs text-slate-500">No places found.</div>}
              {geocodedResults.length > 0 && <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OpenStreetMap places</div>}
              {geocodedResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    setSelectedLocation(result);
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-start gap-2 group"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <span className="font-medium text-slate-700 group-hover:text-blue-600">{result.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Study-area selector */}
          <div className="relative hidden md:flex items-center">
            <label htmlFor="study-area-select" className="sr-only">Study Area</label>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-[#F5F7FB] border border-slate-200 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                id="study-area-select"
                value={studyArea}
                onChange={(e) => setStudyArea(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Demo Metro Core">Demo Metro Core (16 cells)</option>
                <option value="Valley Regional Basin">Valley Regional Basin (8 cells)</option>
              </select>
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Heat Alerts & System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 pl-2 border-l border-slate-200"
            title="Profile & Preferences"
          >
            <div className="w-8 h-8 rounded-full bg-[#14213D] text-white flex items-center justify-center text-xs font-bold overflow-hidden border border-slate-300 shadow-xs">
              <img
                src="/src/assets/images/analyst_avatar_1791526286359.jpg"
                alt="Heat Analyst"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to text initials if image cannot load
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[11px]">HS</span>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-[#14213D] leading-none">
                H. Stewart
              </div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Heat Analyst
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
