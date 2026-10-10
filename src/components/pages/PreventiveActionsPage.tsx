import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '../../context/AuthContext';
import { useHeatData } from '../../context/HeatDataContext';
import { RiskBadge } from '../common/RiskBadge';
import {
  AlertTriangle,
  Plus,
  Radio,
  Printer,
  Users,
  HardHat,
  Landmark,
  ThermometerSun,
  MapPin,
  ShieldAlert,
  Crown,
  LockKeyhole,
  X,
} from 'lucide-react';
import { RiskCategory } from '../../types/heat';

type ActionAudience = 'Residents' | 'Outdoor workers' | 'Community organisations' | 'Local authorities';

interface Protocol {
  summary: string;
  actions: Record<ActionAudience, string[]>;
}

const AUDIENCES: ActionAudience[] = [
  'Residents',
  'Outdoor workers',
  'Community organisations',
  'Local authorities',
];

const PROTOCOLS: Record<RiskCategory, Protocol> = {
  Lower: {
    summary: 'Routine prevention is appropriate while conditions and forecasts are monitored.',
    actions: {
      Residents: ['Drink water regularly; use shade and light clothing outdoors.', 'Monitor the forecast and plan errands around hotter periods.'],
      'Outdoor workers': ['Use available shade and water access and follow the normal heat-safety plan.', 'Monitor yourself and coworkers for worsening heat symptoms.'],
      'Community organisations': ['Keep drinking-water points and shaded areas usable and signposted.', 'Share routine heat-safety information with residents and visitors.'],
      'Local authorities': ['Monitor forecast and neighbourhood indicators before the next review.', 'Verify public water access and shaded routes remain available.'],
    },
  },
  Moderate: {
    summary: 'Reduce avoidable exposure and add rest and social-support checks during peak heat.',
    actions: {
      Residents: ['Reduce strenuous activity during peak heat and take more frequent rest breaks.', 'Check on older adults, young children, people with chronic conditions, and neighbours living alone.'],
      'Outdoor workers': ['Schedule strenuous work for cooler periods, increase rest breaks, and use shade and water.', 'Use a buddy system and stop work if heat-illness symptoms develop.'],
      'Community organisations': ['Check on vulnerable people and share local water, shade, and cooling information.', 'Adjust outdoor activities to cooler hours and provide additional rest breaks.'],
      'Local authorities': ['Issue a local heat advisory and coordinate checks with community partners.', 'Review water, shade, and cooling-facility readiness before peak heat.'],
    },
  },
  Elevated: {
    summary: 'Prioritise exposure reduction, targeted outreach, and confirmation of cooling access.',
    actions: {
      Residents: ['Avoid non-essential outdoor exposure during peak heat; use a cool indoor place when possible.', 'Contact a trusted person before heat exposure and check on vulnerable neighbours.'],
      'Outdoor workers': ['Move work to cooler hours where feasible, enforce frequent shaded rest and hydration breaks, and use a buddy system.', 'Follow the employer heat plan and seek immediate help for confusion, fainting, or worsening symptoms.'],
      'Community organisations': ['Run targeted outreach to vulnerable residents and share verified cooling locations and hours.', 'Review transport, water, and staffing plans for cooling or respite spaces.'],
      'Local authorities': ['Confirm cooling-facility access, opening hours, transport, water, and staffing.', 'Target public messages to this neighbourhood and coordinate outreach with health and social-care partners.'],
    },
  },
  High: {
    summary: 'Use urgent heat-safety precautions, cool environments, assistance for at-risk people, and public-warning escalation.',
    actions: {
      Residents: ['Avoid outdoor activity during peak heat and move to a cool or air-conditioned environment.', 'Assist at-risk people with transport, water, and check-ins; seek immediate professional help for suspected heatstroke.'],
      'Outdoor workers': ['Pause or reschedule non-essential outdoor work where possible; use a cool rest area, water, shade, and close buddy monitoring.', 'Follow the employer emergency procedure and report heat-illness symptoms immediately.'],
      'Community organisations': ['Activate targeted welfare checks and help at-risk residents reach verified cool environments.', 'Coordinate water, transport, and accessible cooling support; escalate medical emergencies to professionals.'],
      'Local authorities': ['Escalate the appropriate public warning through authorised channels and coordinate emergency partners.', 'Open or extend verified cooling options and prioritise assistance for high-risk residents and workers.'],
    },
  },
};

const audienceIcons: Record<ActionAudience, React.ElementType> = {
  Residents: Users,
  'Outdoor workers': HardHat,
  'Community organisations': Landmark,
  'Local authorities': Radio,
};

interface LocationPrecaution {
  title: string;
  what: string;
  why: string;
  when: string;
  next: string;
}

const PREMIUM_PREVIEW_FEATURES = [
  ['Personalised Daily Hydration Plan', 'Plan regular water breaks based on activity and heat conditions.'],
  ['Outdoor Exercise Planner', 'Suggest safer times for outdoor exercise and when to reduce strenuous activity.'],
  ['Workplace Heat-Safety Plan', 'Schedule rest breaks, shade, cooling, and hydration for outdoor workers.'],
  ['Sleep and Indoor Cooling Plan', 'Practical ways to keep sleeping and living spaces cooler during hot weather.'],
  ['Family Vulnerability Check', 'A checklist to help check on older adults, children, and people at increased risk.'],
  ['Weekly Heat-Safety Report', 'Review completed precautions and identify actions still pending.'],
] as const;

const LOCATION_PROTOCOLS: Record<RiskCategory, LocationPrecaution[]> = {
  High: [
    {
      title: 'Move to a cool place and stop strenuous activity',
      what: 'Avoid non-essential outdoor activity and use an air-conditioned or otherwise cool place.',
      why: 'Reducing heat exposure is the fastest way to lower heat strain during high-risk conditions.',
      when: 'Now and during the hottest part of the day.',
      next: 'Plan transport to a verified cooling space and tell someone where you are going.',
    },
    {
      title: 'Drink water regularly',
      what: 'Drink water regularly and do not wait until you feel thirsty; follow any clinician-provided fluid advice.',
      why: 'Heat increases fluid loss through sweating.',
      when: 'Before, during, and after time in the heat.',
      next: 'Carry water and set a reminder to drink during outdoor tasks.',
    },
    {
      title: 'Check on people at higher risk',
      what: 'Contact older adults, young children, pregnant people, people with chronic illness, and anyone living alone.',
      why: 'Some people are less able to regulate body temperature or access cooling.',
      when: 'At least twice during a hot day and whenever conditions worsen.',
      next: 'Arrange a call, visit, transport, or access to a cool place.',
    },
    {
      title: 'Treat suspected heatstroke as an emergency',
      what: 'Confusion, fainting, seizures, or loss of consciousness require immediate emergency medical help. Move the person to a cool place and cool them while help is coming.',
      why: 'Heatstroke is life-threatening and needs urgent professional treatment.',
      when: 'Immediately if these symptoms occur.',
      next: 'Call the local emergency number; do not leave the person alone.',
    },
  ],
  Elevated: [
    {
      title: 'Reduce outdoor heat exposure',
      what: 'Move errands and exercise to cooler hours and use shade or a cool indoor place.',
      why: 'Avoiding peak heat reduces cumulative heat strain.',
      when: 'Especially during the hottest part of the day.',
      next: 'Reschedule one non-essential outdoor activity today.',
    },
    {
      title: 'Hydrate and take cooling breaks',
      what: 'Drink water regularly and take frequent breaks in shade or a cool place.',
      why: 'Rest and fluids help limit heat stress during activity.',
      when: 'Before and throughout outdoor activity.',
      next: 'Carry water and identify a shaded rest point before leaving.',
    },
    {
      title: 'Check on vulnerable people',
      what: 'Contact people who may need help accessing water, shade, transport, or cooling.',
      why: 'Risk can increase when people are isolated or cannot cool themselves.',
      when: 'During the hot period and after prolonged heat exposure.',
      next: 'Make a check-in plan with a family member, neighbour, or caregiver.',
    },
    {
      title: 'Know the emergency signs',
      what: 'For confusion, fainting, seizures, or loss of consciousness, call emergency services and cool the person while waiting.',
      why: 'These can indicate a medical emergency such as heatstroke.',
      when: 'Immediately if symptoms occur.',
      next: 'Save the local emergency number and do not leave the person alone.',
    },
  ],
  Moderate: [
    {
      title: 'Drink water and use shade',
      what: 'Drink regularly, wear light clothing, and choose shaded or cool routes.',
      why: 'Basic exposure reduction helps prevent heat illness.',
      when: 'Whenever outdoors in warm conditions.',
      next: 'Carry water and check where shade or cooling is available.',
    },
    {
      title: 'Avoid strenuous activity at peak heat',
      what: 'Use cooler morning or evening hours for exercise and heavy work.',
      why: 'Physical exertion adds heat to the body.',
      when: 'During the hottest hours.',
      next: 'Move today’s demanding task to a cooler time if possible.',
    },
    {
      title: 'Monitor yourself and others',
      what: 'Check on people who may be more affected by heat and watch for worsening symptoms.',
      why: 'Early action can prevent heat illness from becoming severe.',
      when: 'Throughout the day.',
      next: 'Agree on a check-in time with someone who may need support.',
    },
  ],
  Lower: [
    {
      title: 'Keep routine heat-safety habits',
      what: 'Drink water, use shade, wear light clothing, and monitor the forecast.',
      why: 'Routine prevention reduces avoidable heat exposure.',
      when: 'Whenever spending time outdoors.',
      next: 'Carry water and plan a shaded route.',
    },
    {
      title: 'Plan strenuous activity for cooler hours',
      what: 'Take breaks and avoid unnecessary exertion during the hottest period.',
      why: 'Heat strain can still develop during prolonged activity.',
      when: 'During warm days or long outdoor tasks.',
      next: 'Identify a cool rest location before starting.',
    },
    {
      title: 'Check on anyone needing support',
      what: 'Make sure people who live alone or have health concerns can access fluids and a cool place.',
      why: 'Support and early recognition help prevent heat illness.',
      when: 'During sustained warm weather.',
      next: 'Send a quick check-in message or call.',
    },
  ],
};

export const PreventiveActionsPage: React.FC = () => {
  const { token } = useAuth();
  const historyEntries = useQuery(api.history.list, token ? { token } : 'skip') ?? [];
  const saveProgress = useMutation(api.history.saveProgress);
  const {
    reviewTasks,
    toggleTaskComplete,
    addTask,
    neighborhoods,
    selectedNeighborhood,
    setSelectedNeighborhood,
    realWeather,
    realAirQuality,
    weatherError,
    airQualityError,
    selectedLocation,
    realLST,
    isLSTLoading,
    externalRiskScore,
    externalRiskMissingInputs,
    useSimulatedVulnerabilityForExternal,
    simulatedVulnerabilityIndex,
  } = useHeatData();

  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showPremiumPreview, setShowPremiumPreview] = useState(false);
  const [showPremiumMessage, setShowPremiumMessage] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [completedLocationPrecautions, setCompletedLocationPrecautions] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('heatshield-location-precautions') || '{}');
    } catch {
      return {};
    }
  });
  const currentHistoryEntry = historyEntries.find((entry) => entry.locationId === selectedLocation?.id);

  useEffect(() => {
    if (!currentHistoryEntry) return;
    setCompletedLocationPrecautions(Object.fromEntries(currentHistoryEntry.completedTitles.map((title) => [title, true])));
  }, [currentHistoryEntry]);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskNeighborhoodId, setNewTaskNeighborhoodId] = useState(neighborhoods[0]?.id || '');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [newTaskTeam, setNewTaskTeam] = useState('Urban Health Operations');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetNeighbor = neighborhoods.find((n) => n.id === newTaskNeighborhoodId) || neighborhoods[0];

    addTask({
      neighborhoodId: targetNeighbor.id,
      neighborhoodName: targetNeighbor.name,
      category: targetNeighbor.estimatedCategory,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Custom review protocol logged by heat analyst.',
      priority: newTaskPriority,
      assignedTeam: newTaskTeam,
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskModal(false);
  };

  const filteredTasks = reviewTasks.filter((t) => {
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Completed' && t.completed) ||
      (filterStatus === 'Pending' && !t.completed);
    return matchesPriority && matchesStatus;
  });

  const completedCount = reviewTasks.filter((t) => t.completed).length;
  const protocol = PROTOCOLS[selectedNeighborhood.estimatedCategory];
  const isExternalLocation = Boolean(selectedLocation);
  const locationCategory = externalRiskScore?.category;
  const locationPrecautions = locationCategory
    ? LOCATION_PROTOCOLS[locationCategory]
    : LOCATION_PROTOCOLS.Moderate;
  const locationActionKeys = locationPrecautions.map((precaution) => precaution.title);
  const completedLocationCount = locationActionKeys.filter((key) => completedLocationPrecautions[key]).length;
  const visibleLocationPrecautions = locationPrecautions.filter((precaution) => {
    const completed = Boolean(completedLocationPrecautions[precaution.title]);
    return filterStatus === 'All' || (filterStatus === 'Completed' && completed) || (filterStatus === 'Pending' && !completed);
  });
  const actionItems = useMemo(
    () => AUDIENCES.flatMap((audience) => protocol.actions[audience].map((action) => `${audience}:${action}`)),
    [protocol]
  );
  const completedProtocolActions = actionItems.filter((item) => completedActions[item]).length;

  const toggleProtocolAction = (action: string) => {
    setCompletedActions((current) => ({ ...current, [action]: !current[action] }));
  };

  const toggleLocationPrecaution = (title: string) => {
    setCompletedLocationPrecautions((current) => {
      const next = { ...current, [title]: !current[title] };
      localStorage.setItem('heatshield-location-precautions', JSON.stringify(next));
      if (token && currentHistoryEntry) {
        void saveProgress({
          token,
          historyId: currentHistoryEntry._id,
          completedTitles: Object.entries(next).filter(([, done]) => done).map(([name]) => name),
        });
      }
      return next;
    });
  };

  const printActionReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Operational Response Planning
          </div>
          <h2 className="text-xl font-bold text-[#14213D]">
            Preventive Actions & Mitigation Protocols
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Translate available heat indicators into practical public-health actions. Essential safety guidance is always free.
          </p>
        </div>

        <button
          onClick={() => setShowAddTaskModal(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Review Task</span>
        </button>
      </div>

      {isExternalLocation && selectedLocation && (
        <section className="space-y-4" aria-live="polite">
          <div className="bg-white rounded-xl border border-blue-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Selected location precautions</div>
                <h3 className="text-lg font-bold text-[#14213D] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {selectedLocation.displayName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)} · OpenStreetMap geocoded coordinates
                </p>
              </div>
              {externalRiskScore ? (
                <div className="text-right">
                  <RiskBadge category={externalRiskScore.category} score={externalRiskScore.score} size="lg" />
                  {useSimulatedVulnerabilityForExternal && (
                    <span className="block text-[10px] font-semibold text-amber-800 mt-1">
                      SIMULATED DEMONSTRATION SCORE
                    </span>
                  )}
                </div>
              ) : (
                <span className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
                  Verified risk score unavailable
                </span>
              )}
            </div>

            {!externalRiskScore && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                <strong>Location-specific score unavailable.</strong> The existing six-input model requires verified
                {externalRiskMissingInputs.length > 0 ? ` ${externalRiskMissingInputs.join(', ')}` : ' local inputs'}.
                No Demo Metro Core or simulated vulnerability values are used here. The guidance below is general heat-safety advice.
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">Air temperature</span><strong>{realWeather ? `${realWeather.temperature}°C` : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">Open-Meteo · {realWeather?.timestamp ?? 'not loaded'}</span></div>
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">Humidity</span><strong>{realWeather ? `${realWeather.relativeHumidity}%` : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">Open-Meteo live reading</span></div>
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">Air quality</span><strong>{realAirQuality?.pm2_5 !== null && realAirQuality?.pm2_5 !== undefined ? `PM2.5 ${realAirQuality.pm2_5.toFixed(1)} µg/m³` : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">{realAirQuality ? `Open-Meteo · ${realAirQuality.timestamp}` : airQualityError ?? 'not loaded'}</span></div>
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">MODIS LST</span><strong>{isLSTLoading ? 'Loading' : realLST ? `${realLST.temperatureCelsius.toFixed(1)}°C` : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">{realLST ? `${realLST.source} · ${realLST.observationStart}` : 'not connected'}</span></div>
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">NDVI</span><strong>{realLST?.spatial?.ndvi !== null && realLST?.spatial?.ndvi !== undefined ? realLST.spatial.ndvi.toFixed(3) : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">{realLST?.spatial?.ndviObservationDate ? `${realLST.spatial.sources.ndvi} · ${realLST.spatial.ndviObservationDate}` : 'not connected'}</span></div>
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">Built surface</span><strong>{realLST?.spatial?.builtEnvironmentRatio !== null && realLST?.spatial?.builtEnvironmentRatio !== undefined ? `${realLST.spatial.builtEnvironmentRatio.toFixed(1)}%` : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">{realLST?.spatial?.builtObservationDate ? `${realLST.spatial.sources.builtEnvironment} · ${realLST.spatial.builtObservationDate}` : 'not connected'}</span></div>
              <div className="rounded-lg bg-slate-50 p-3"><span className="text-slate-500 block">Population</span><strong>{realLST?.spatial?.population !== null && realLST?.spatial?.population !== undefined ? Math.round(realLST.spatial.population).toLocaleString() : 'Unavailable'}</strong><span className="block text-[10px] text-slate-500">{realLST?.spatial?.populationObservationDate ? `${realLST.spatial.sources.population} · ${realLST.spatial.populationObservationDate}` : 'not connected'} · vulnerability unavailable</span></div>
              {useSimulatedVulnerabilityForExternal && <div className="rounded-lg bg-amber-50 p-3 border border-amber-200"><span className="text-amber-800 block">Vulnerability</span><strong className="text-amber-900">{simulatedVulnerabilityIndex}/100</strong><span className="block text-[10px] text-amber-800">SIMULATED DEMO VALUE</span></div>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-[#14213D]">{locationCategory ? `${locationCategory} risk precautions` : 'General heat-safety precautions'}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
              {(['All', 'Pending', 'Completed'] as const).map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)} className={`px-2.5 py-1 rounded-md border ${filterStatus === status ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold' : 'border-slate-200 text-slate-600'}`}>
                  {status}
                </button>
              ))}
              <span className="ml-auto text-slate-500">
                Total {locationActionKeys.length} · Pending {locationActionKeys.length - completedLocationCount} · Completed {completedLocationCount}
              </span>
            </div>
            <div className="space-y-3">
              {visibleLocationPrecautions.map((precaution) => (
                <article key={precaution.title} className="rounded-lg border border-slate-200 p-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={Boolean(completedLocationPrecautions[precaution.title])} onChange={() => toggleLocationPrecaution(precaution.title)} className="mt-1 accent-blue-600" />
                    <h4 className={`text-sm font-bold text-[#14213D] ${completedLocationPrecautions[precaution.title] ? 'line-through text-slate-400' : ''}`}>{precaution.title}</h4>
                  </label>
                  <dl className="mt-2 grid gap-1 text-xs text-slate-700">
                    <div><dt className="inline font-semibold">Do: </dt><dd className="inline">{precaution.what}</dd></div>
                    <div><dt className="inline font-semibold">Why: </dt><dd className="inline">{precaution.why}</dd></div>
                    <div><dt className="inline font-semibold">When: </dt><dd className="inline">{precaution.when}</dd></div>
                    <div><dt className="inline font-semibold">Next step: </dt><dd className="inline">{precaution.next}</dd></div>
                  </dl>
                </article>
              ))}
              {visibleLocationPrecautions.length === 0 && <p className="text-xs text-slate-500">No precautions match this filter.</p>}
            </div>
            <p className="mt-4 text-[11px] text-slate-500">
              Public-health basis: WHO, <a className="text-blue-600 hover:underline" href="https://www.who.int/news-room/fact-sheets/detail/heat-and-health" target="_blank" rel="noreferrer">Heat and health</a>. This tool is not a medical diagnostic system.
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-950">
            <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><p><strong>Emergency guidance:</strong> For confusion, fainting, seizures, or loss of consciousness, call the local emergency number immediately, move the person to a cool place, cool them while help is coming, and do not leave them alone.</p></div>
          </div>
        </section>
      )}

      {!isExternalLocation && <section className="space-y-4" aria-live="polite">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Selected neighbourhood protocol</div>
              <div className="flex flex-wrap items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedNeighborhood.id}
                  onChange={(event) => {
                    const next = neighborhoods.find((n) => n.id === event.target.value);
                    if (next) setSelectedNeighborhood(next);
                  }}
                  className="text-base font-bold text-[#14213D] bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500"
                  aria-label="Select neighbourhood for action protocol"
                >
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</option>
                  ))}
                </select>
                <RiskBadge category={selectedNeighborhood.estimatedCategory} score={selectedNeighborhood.estimatedScore} size="lg" />
              </div>
              <p className="text-xs text-slate-600 mt-3 max-w-3xl">{protocol.summary}</p>
            </div>
            <button onClick={printActionReport} className="print:hidden px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print action report
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500 block">Risk score</span><strong className="text-lg text-[#14213D]">{selectedNeighborhood.estimatedScore}/100</strong></div>
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500 block">Data quality</span><strong className="text-[#14213D]">{selectedNeighborhood.dataQuality}</strong></div>
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500 block">Checklist</span><strong className="text-[#14213D]">{completedProtocolActions}/{actionItems.length}</strong></div>
            <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500 block">Last record</span><strong className="text-[#14213D]">{selectedNeighborhood.timestamp}</strong></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center gap-2 mb-3"><ThermometerSun className="w-4 h-4 text-orange-500" /><h3 className="text-sm font-bold text-[#14213D]">Why this protocol appears</h3></div>
          <p className="text-xs text-slate-600 mb-3">The category is calculated by the shared risk model from the selected neighbourhood&apos;s six weighted indicators. These are the recorded contributors; no new score is calculated here.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedNeighborhood.contributingFactors.map((factor) => (
              <div key={factor.factor} className="border border-slate-100 rounded-lg p-3 text-xs">
                <div className="flex justify-between gap-2 font-semibold text-slate-800"><span>{factor.factor}</span><span className="text-slate-500">{factor.impact} impact</span></div>
                <p className="text-slate-600 mt-1">{factor.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">Modelled record: score, category, indicators</span>
            <span className={`px-2 py-1 rounded ${realWeather ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              Weather: {realWeather ? 'live Open-Meteo data available' : weatherError ? 'unavailable' : 'not loaded'}
            </span>
            <span className={`px-2 py-1 rounded ${realAirQuality ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              Air quality: {realAirQuality ? 'live Open-Meteo data available' : airQualityError ? 'unavailable' : 'not loaded'}
            </span>
            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">Cooling capacity and population fields are prototype/sample data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIENCES.map((audience) => {
            const Icon = audienceIcons[audience];
            return (
              <div key={audience} className="bg-white rounded-xl border border-slate-200/90 p-5">
                <div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-blue-600" /><h3 className="text-sm font-bold text-[#14213D]">{audience}</h3></div>
                <div className="space-y-2">
                  {protocol.actions[audience].map((action) => {
                    const key = `${audience}:${action}`;
                    return <label key={key} className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer"><input type="checkbox" checked={Boolean(completedActions[key])} onChange={() => toggleProtocolAction(key)} className="mt-0.5 accent-blue-600" /><span className={completedActions[key] ? 'line-through text-slate-400' : ''}>{action}</span></label>;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
          <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><p><strong>Safety note:</strong> HeatShield AI is a prototype risk-planning tool, not a medical diagnostic system. Suspected heatstroke, confusion, fainting, loss of consciousness, or rapidly worsening symptoms require immediate professional medical assistance. Call the appropriate local emergency number (for example, 112/911 according to your location).</p></div>
        </div>
      </section>}

      {/* Interactive Review Priorities Task Tracker */}
      {!isExternalLocation && <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Task Tracker Header & Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#14213D]">
                Recommended Review Priorities
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                {completedCount}/{reviewTasks.length} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Action checklists linked to current heat-risk hot spots. Click checkbox to complete in demo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterStatus === 'All' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                All ({reviewTasks.length})
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterStatus === 'Pending' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                Pending ({reviewTasks.filter((t) => !t.completed).length})
              </button>
              <button
                onClick={() => setFilterStatus('Completed')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterStatus === 'Completed' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                Done ({completedCount})
              </button>
            </div>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#F5F7FB] border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tasks matching current filter parameters.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                  task.completed ? 'bg-slate-50/60 opacity-75' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskComplete(task.id)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          task.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : task.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="font-semibold text-slate-600">
                        {task.neighborhoodName}
                      </span>
                      <span>·</span>
                      <span>Assigned: {task.assignedTeam}</span>
                      {task.completedAt && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-sans font-medium">
                            Completed at {task.completedAt}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <RiskBadge category={task.category} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>}

      <section className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3" aria-label="Premium features">
        <div className="flex items-center gap-2.5">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-[#14213D]">Premium</h3>
            <p className="text-xs text-slate-500">Advanced heat-action planning and reports</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowPremiumMessage(false);
            setShowPremiumPreview(true);
          }}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Explore Premium
        </button>
      </section>

      {showPremiumPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowPremiumPreview(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-preview-title"
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold tracking-wider">
                  <Crown className="w-3 h-3" /> PREMIUM
                </div>
                <h2 id="premium-preview-title" className="text-lg font-bold text-[#14213D] mt-2">Premium Heat-Safety Plan</h2>
                <p className="text-xs text-slate-500 mt-1">Preview advanced planning tools. Essential precautions remain free.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPremiumPreview(false)}
                aria-label="Close Premium preview"
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              {PREMIUM_PREVIEW_FEATURES.map(([title, description]) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-start gap-2">
                    <LockKeyhole className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-[#14213D]">{title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{description}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-slate-500">PREMIUM — LOCKED PREVIEW</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-[11px] text-slate-500">Payment and subscription activation are not available yet.</p>
              <button
                type="button"
                onClick={() => setShowPremiumMessage(true)}
                className="px-3 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
            {showPremiumMessage && (
              <p role="status" className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-900">
                Premium subscriptions are not available yet.
              </p>
            )}
          </section>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden p-6">
            <h3 className="text-base font-bold text-[#14213D] mb-1">
              Log Preventive Review Task
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a verified heat mitigation priority for operational follow-up.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Inspect backup generators at Community Senior Center"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Target Neighbourhood Cell
                </label>
                <select
                  value={newTaskNeighborhoodId}
                  onChange={(e) => setNewTaskNeighborhoodId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.estimatedCategory} - Score: {n.estimatedScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Action Details & Context
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specific instructions or verification protocols for field inspectors..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Assigned Liaison Team
                  </label>
                  <input
                    type="text"
                    value={newTaskTeam}
                    onChange={(e) => setNewTaskTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
