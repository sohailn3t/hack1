import React from 'react';
import { RiskCategory } from '../../types/heat';
import { AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface RiskBadgeProps {
  category: RiskCategory;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  category,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    High: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-600',
      icon: AlertTriangle,
      label: 'High Relative Risk',
    },
    Elevated: {
      bg: 'bg-amber-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      icon: AlertCircle,
      label: 'Elevated Relative Risk',
    },
    Moderate: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      icon: Info,
      label: 'Moderate Relative Risk',
    },
    Lower: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
      icon: ShieldCheck,
      label: 'Lower Relative Risk',
    },
  };

  const config = configs[category] || configs.Moderate;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]} whitespace-nowrap`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{category}</span>
      {score !== undefined && (
        <span className="font-mono tabular-nums opacity-90">({score})</span>
      )}
    </span>
  );
};
