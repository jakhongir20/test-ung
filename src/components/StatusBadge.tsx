import type { FC } from 'react';
import { useI18n } from '../i18n';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Completed/Passed statuses - Green
  'completed': 'bg-green-50 text-green-700 ring-green-200',
  'passed': 'bg-green-50 text-green-700 ring-green-200',
  'Passed': 'bg-green-50 text-green-700 ring-green-200',

  // Never started/Active statuses - Blue
  'never_started': 'bg-blue-50 text-blue-700 ring-blue-200',
  'active': 'bg-blue-50 text-blue-700 ring-blue-200',
  'Active': 'bg-blue-50 text-blue-700 ring-blue-200',

  // In progress/Started statuses - Yellow/Orange
  'started': 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  'in_progress': 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  'Started': 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  'In Progress': 'bg-yellow-50 text-yellow-700 ring-yellow-200',

  // Failed/Expired/Cancelled statuses - Red
  'failed': 'bg-red-50 text-red-700 ring-red-200',
  'Failed': 'bg-red-50 text-red-700 ring-red-200',
  'expired': 'bg-red-50 text-red-700 ring-red-200',
  'cancelled': 'bg-red-50 text-red-700 ring-red-200',
  'Cancelled': 'bg-red-50 text-red-700 ring-red-200',
  'Expired': 'bg-red-50 text-red-700 ring-red-200',

  // Refunded status - Emerald
  'refunded': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Refunded': 'bg-emerald-50 text-emerald-700 ring-emerald-200',

  // Answer statuses
  'correct': 'bg-green-50 text-green-700 ring-green-200',
  'incorrect': 'bg-red-50 text-red-700 ring-red-200',

  // Default fallback - Gray
  'default': 'bg-gray-50 text-gray-700 ring-gray-200',
};

export const StatusBadge: FC<StatusBadgeProps> = ({status, className = ''}) => {
  const {t} = useI18n();

  const statusKey = `status.${status.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const translatedStatus = t(statusKey as string) || status;

  const styleClass = statusStyles[status] || statusStyles['default'];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styleClass} ${className}`}>
      {translatedStatus}
    </span>
  );
};
