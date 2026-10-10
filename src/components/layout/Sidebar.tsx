import React from 'react';
import { useHeatData, NavTab } from '../../context/HeatDataContext';
import {
  Shield,
  LayoutDashboard,
  Map,
  BarChart3,
  CheckSquare,
  Settings,
  Flame,
  X,
  AlertCircle,
  History as HistoryIcon,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
  onOpenSettings,
}) => {
  const { activeTab, setActiveTab } = useHeatData();

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Heat Risk Map', icon: Map },
    { id: 'analysis', label: 'Risk Analysis', icon: BarChart3 },
    { id: 'actions', label: 'Preventive Actions', icon: CheckSquare },
    { id: 'history', label: 'History', icon: HistoryIcon },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#14213D] text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800/80 shadow-lg lg:shadow-none`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-950/40">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span>HEATSHIELD AI</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Hyperlocal Heat Intelligence
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 mb-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
              <span>HC-04 Hackathon</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Pre-validation risk scoring model for urban heat vulnerability.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 font-mono">v1.0.4-demo</span>
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Dashboard Settings & Reset"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
