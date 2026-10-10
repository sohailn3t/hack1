import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  accentColor: 'orange' | 'blue' | 'purple' | 'amber' | 'green';
  badgeText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
  badgeText = 'Illustrative sample',
}) => {
  const colorMap = {
    orange: {
      iconBg: 'bg-orange-50 text-orange-600',
      valueText: 'text-orange-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      valueText: 'text-blue-600',
    },
    purple: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueText: 'text-indigo-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      valueText: 'text-amber-600',
    },
    green: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueText: 'text-emerald-600',
    },
  };

  const selectedColor = colorMap[accentColor] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:border-slate-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${selectedColor.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="truncate pr-2">{subtitle}</span>
        <span className="text-[11px] text-slate-400 shrink-0 font-normal">
          {badgeText}
        </span>
      </div>
    </div>
  );
};
