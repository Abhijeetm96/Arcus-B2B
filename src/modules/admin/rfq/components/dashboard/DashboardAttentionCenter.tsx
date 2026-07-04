import { AlertTriangle, ShieldAlert, FileWarning, TrendingDown, Hourglass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';

export function DashboardAttentionCenter() {
  const alerts = [
    {
      id: 'overdue-rfq',
      type: 'error',
      icon: Hourglass,
      title: "SLA Response Breach",
      desc: "2 assigned RFQs have breached the 24-hour initial SLA response target.",
      badge: "Overdue",
      color: "border-rose-100 bg-rose-50/30 text-rose-700",
      iconColor: "text-rose-500",
      actionLabel: "Re-assign",
      action: () => alert("Opened assignment console.")
    },
    {
      id: 'expired-quote',
      type: 'warning',
      icon: FileWarning,
      title: "Expired Quotation",
      desc: "Quotation draft #qt_812 for BuildCon Group has exceeded its pricing validity window.",
      badge: "Action Required",
      color: "border-amber-100 bg-amber-50/30 text-amber-700",
      iconColor: "text-amber-500",
      actionLabel: "Renew Price",
      action: () => alert("Initiated quotation price renewal workflow.")
    },
    {
      id: 'missing-docs',
      type: 'info',
      icon: ShieldAlert,
      title: "Missing Customer Verification",
      desc: "RFQ #rfq_4812 (GMR Projects) is missing valid GSTIN certificates and site delivery layout specifications.",
      badge: "Pending Docs",
      color: "border-blue-100 bg-blue-50/30 text-blue-700",
      iconColor: "text-blue-500",
      actionLabel: "Request Docs",
      action: () => alert("Dispatched email requesting GSTIN certificates.")
    },
    {
      id: 'margin-risk',
      type: 'error',
      icon: TrendingDown,
      title: "Low Margin Risk Alert",
      desc: "Prepared quotation draft #qt_904 has a projected gross margin of 7.2% (minimum target 12%).",
      badge: "Margin Warning",
      color: "border-rose-100 bg-rose-50/30 text-rose-700",
      iconColor: "text-rose-500",
      actionLabel: "Optimize",
      action: () => alert("Redirecting to Quote Optimizer tool.")
    }
  ];

  return (
    <Card className="border border-slate-100 bg-white shadow-sm rounded-xl text-left">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Attention Center
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-lg border flex gap-3 items-start justify-between ${alert.color} transition-all duration-150 hover:brightness-98`}
              >
                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5 shrink-0">
                    <Icon className={`h-4.5 w-4.5 ${alert.iconColor}`} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-800">{alert.title}</span>
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white border border-current shrink-0 tracking-wider">
                        {alert.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      {alert.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={alert.action}
                  className="shrink-0 text-[10px] font-black underline hover:text-slate-900 cursor-pointer"
                >
                  {alert.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
