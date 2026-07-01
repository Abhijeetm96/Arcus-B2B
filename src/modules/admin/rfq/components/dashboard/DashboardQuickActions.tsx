import { UserPlus, FileSignature, MessageSquarePlus, Paperclip, Mail, CheckSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';

interface DashboardQuickActionsProps {
  onActionClick: (actionName: string) => void;
}

export function DashboardQuickActions({ onActionClick }: DashboardQuickActionsProps) {
  const actions = [
    {
      name: 'Assign Rep',
      icon: UserPlus,
      description: 'Route RFQ to sales rep',
      color: 'text-amber-600 bg-amber-500/10'
    },
    {
      name: 'Create Quotation',
      icon: FileSignature,
      description: 'Draft revised proposal',
      color: 'text-blue-600 bg-blue-500/10'
    },
    {
      name: 'Add Note',
      icon: MessageSquarePlus,
      description: 'Append internal review comment',
      color: 'text-emerald-600 bg-emerald-500/10'
    },
    {
      name: 'Upload Attachment',
      icon: Paperclip,
      description: 'Upload BOQ sheets/CAD dwg',
      color: 'text-indigo-600 bg-indigo-500/10'
    },
    {
      name: 'Email Customer',
      icon: Mail,
      description: 'Send clarification update',
      color: 'text-rose-600 bg-rose-500/10'
    },
    {
      name: 'Convert to Order',
      icon: CheckSquare,
      description: 'Close RFQ & create booking',
      color: 'text-purple-600 bg-purple-500/10'
    }
  ];

  return (
    <Card className="h-full flex flex-col text-left">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold">Quick Actions Gateway</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 p-4 md:p-6 pt-0">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.name}
              onClick={() => onActionClick(act.name)}
              className="flex flex-col items-start p-3 border border-border rounded bg-surface hover:border-primary hover:bg-slate-50/20 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm"
            >
              <div className={`h-8 w-8 rounded flex items-center justify-center mb-2 ${act.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-xs text-text-primary mb-0.5">{act.name}</span>
              <span className="text-[10px] text-text-secondary leading-normal">{act.description}</span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
