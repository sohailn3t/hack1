import React from 'react';
import { useHeatData } from '../../context/HeatDataContext';
import { X, Bell, Check, AlertTriangle, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ open, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    selectNeighborhoodById,
    setActiveTab,
  } = useHeatData();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  Heat Alerts & System Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time microclimate threshold triggers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {notifications.length} data-supported alerts
            </span>
            <button
              onClick={markAllNotificationsRead}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          </div>

          {/* List of Notifications */}
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No active notifications or alerts.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    notif.read
                      ? 'bg-white border-slate-200/80 text-slate-600'
                      : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-[#14213D] leading-tight">
                      {notif.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {notif.timeAgo}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-2.5">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <RiskBadge category={notif.category} size="sm" />
                    <span className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer">
                      Focus area →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="italic">Only data-supported alerts are shown</span>
            <button
              onClick={() => {
                setActiveTab('actions');
                onClose();
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Open action planner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
