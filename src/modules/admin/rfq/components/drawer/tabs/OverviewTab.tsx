import { useState, useEffect } from 'react';
import { 
  Building, MapPin, DollarSign, Calendar, ShieldAlert, 
  Eye, Clock, UserCheck 
} from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { PRIORITY_COLORS } from '../../../constants/priority';
import { cn } from '../../../../../../components/ui/utils';
import { useAuth } from '../../../../../../context/AuthContext';
import { rfqService } from '../../../services/rfq.service';

interface OverviewTabProps {
  rfq: RFQDetail;
  onRefresh?: () => void;
}

export function OverviewTab({ rfq, onRefresh }: OverviewTabProps) {
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(rfq.owner || 'Unassigned');
  const [isWatching, setIsWatching] = useState(false);
  const [watchers, setWatchers] = useState<any[]>([]);

  // Watchers list
  const rfqWatchers = (rfq as any).watchers || [];
  
  useEffect(() => {
    setWatchers(rfqWatchers);
    if (user) {
      const watching = rfqWatchers.some((w: any) => w.user_id === user.id);
      setIsWatching(watching);
    }
  }, [rfqWatchers, user]);

  const handleToggleWatch = async () => {
    if (!user) return;
    try {
      if (isWatching) {
        // Remove watcher
        await rfqService.assignOwner(rfq.id, rfq.owner, user.name, user.role); // trigger update
        // We'll call direct api through window or services if available
        const token = localStorage.getItem('arcus_token');
        await fetch(`http://localhost:5000/api/admin/rfqs/${rfq.id}/watchers/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        setIsWatching(false);
        setWatchers(prev => prev.filter(w => w.user_id !== user.id));
      } else {
        // Add watcher
        const token = localStorage.getItem('arcus_token');
        await fetch(`http://localhost:5000/api/admin/rfqs/${rfq.id}/watchers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ userId: user.id })
        });
        setIsWatching(true);
        setWatchers(prev => [...prev, { user_id: user.id, name: user.name }]);
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to toggle watch state:', err);
    }
  };

  const handleAssignOwner = async (newOwnerName: string) => {
    if (!user) return;
    try {
      await rfqService.assignOwner(rfq.id, newOwnerName, user.name, user.role);
      setSelectedOwner(newOwnerName);
      setIsAssigning(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to assign owner:', err);
    }
  };

  // SLA Calculation
  const getSLADurationHours = (priority: string): number => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 6;
      case 'HIGH': return 12;
      case 'MEDIUM': return 24;
      case 'LOW': return 48;
      default: return 24;
    }
  };

  const createdTime = new Date(rfq.lastUpdated || rfq.dueDate).getTime();
  const slaDurationHours = getSLADurationHours(rfq.priority);
  const slaDurationMs = slaDurationHours * 60 * 60 * 1000;
  const timeElapsedMs = Date.now() - createdTime;
  const percentElapsed = Math.min(100, Math.max(0, (timeElapsedMs / slaDurationMs) * 100));
  const hoursLeft = Math.max(0, (slaDurationMs - timeElapsedMs) / (60 * 60 * 1000));
  const isSlaBreached = timeElapsedMs > slaDurationMs;

  const dates = [
    { label: 'Date Received', date: rfq.lastUpdated },
    { label: 'Expiration / Response Due', date: rfq.dueDate }
  ];

  // List of potential sales managers/reps to assign
  const adminUsersList = [
    'Rajesh Varma',
    'Karan Mehra',
    'Ananya Shrivastava',
    'Siddharth Malhotra',
    'Unassigned'
  ];

  return (
    <div className="space-y-6 text-left select-none animate-in fade-in duration-200">
      
      {/* SLA Widget Card */}
      <div className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            SLA Commitment Status
          </span>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded",
            isSlaBreached ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          )}>
            {isSlaBreached ? "SLA Breached" : "Active SLA"}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">SLA Class: {rfq.priority} ({slaDurationHours} Hours)</span>
            <span className="font-semibold text-slate-800">
              {isSlaBreached ? "Overdue" : `${hoursLeft.toFixed(1)} Hours Remaining`}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isSlaBreached ? "bg-rose-500" : percentElapsed > 75 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${percentElapsed}%` }}
            />
          </div>
        </div>
      </div>

      {/* Brief Card */}
      <div className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm">
        <h4 className="font-extrabold text-sm text-slate-800 mb-2">Project Brief Summary</h4>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 border border-slate-200/60 rounded">
          {rfq.description || 'No project description was provided for this RFQ.'}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            Project Context
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400">Type:</div>
            <div className="font-bold text-xs text-slate-800">{rfq.projectType || 'N/A'}</div>
            <div className="text-[10px] text-slate-400 mt-1">Industry:</div>
            <div className="font-semibold text-xs text-slate-500 truncate">{rfq.customer?.industry || 'Infrastructure'}</div>
          </div>
        </div>

        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            Delivery Location
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400">Site Address:</div>
            <div className="font-bold text-xs text-slate-800 leading-normal">{rfq.customer?.location || 'N/A'}</div>
          </div>
        </div>

        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            Target Value
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400">Estimated Budget:</div>
            <div className="font-extrabold text-base text-slate-800">
              ₹{rfq.value?.toLocaleString('en-IN') || '0'}
            </div>
          </div>
        </div>

        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
            Priority Class
          </span>
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400">SLA Priority:</div>
            <div>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', PRIORITY_COLORS[rfq.priority as keyof typeof PRIORITY_COLORS])}>
                {rfq.priority}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment & Watchers Panel */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Assignment Card */}
        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between relative">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-slate-400" />
            Active Assignment
          </span>
          {isAssigning ? (
            <div className="space-y-1.5 mt-1 z-10 bg-white absolute inset-x-2 bottom-2 rounded border p-1 shadow-md">
              <div className="text-[9px] font-bold text-slate-500 mb-1">Choose Owner:</div>
              {adminUsersList.map(o => (
                <button
                  key={o}
                  onClick={() => handleAssignOwner(o)}
                  className="w-full text-left text-xs px-2 py-1 hover:bg-slate-50 text-slate-800 rounded font-medium block"
                >
                  {o}
                </button>
              ))}
            </div>
          ) : null}
          <div className="space-y-1 mt-1">
            <div className="text-[10px] text-slate-400">Primary Owner:</div>
            <div className="font-bold text-xs text-indigo-600 truncate">{selectedOwner}</div>
            <button
              onClick={() => setIsAssigning(!isAssigning)}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 mt-2 flex items-center gap-0.5 hover:underline"
            >
              Reassign Owner
            </button>
          </div>
        </div>

        {/* Watchers Card */}
        <div className="p-3 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            Watchers ({watchers.length})
          </span>
          <div className="space-y-1">
            <div className="flex -space-x-1.5 overflow-hidden py-1">
              {watchers.map((w, idx) => (
                <div 
                  key={idx} 
                  title={w.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                >
                  {w.name?.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {watchers.length === 0 && (
                <span className="text-[10px] text-slate-400 italic">No operators watching</span>
              )}
            </div>
            <button
              onClick={handleToggleWatch}
              className={cn(
                "text-[10px] font-bold mt-2 flex items-center gap-1 hover:underline",
                isWatching ? "text-rose-500 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-800"
              )}
            >
              {isWatching ? "Unwatch RFQ" : "Watch RFQ"}
            </button>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm">
        <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          SLA Timelines
        </h4>
        <div className="space-y-2">
          {dates.map((d, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0">
              <span className="text-slate-500 font-semibold">{d.label}</span>
              <span className="font-bold text-slate-800">
                {d.date ? new Date(d.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
