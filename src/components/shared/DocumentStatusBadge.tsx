import React from 'react';

interface Props {
  status: string;
}

export const DocumentStatusBadge: React.FC<Props> = ({ status }) => {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-250';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-250';
      case 'REJECTED':
      case 'DECLINED':
        return 'bg-red-50 text-red-700 border-red-250';
      case 'SENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-250';
      case 'EXPIRED':
        return 'bg-rose-50 text-rose-700 border-rose-250';
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStyles()}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
export default DocumentStatusBadge;
