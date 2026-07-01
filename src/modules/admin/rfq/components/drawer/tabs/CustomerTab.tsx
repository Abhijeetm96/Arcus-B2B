import { User, Building2, Mail, Phone, FileSignature } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';

interface CustomerTabProps {
  rfq: RFQDetail;
}

export function CustomerTab({ rfq }: CustomerTabProps) {
  const customer = rfq.customer;

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      {/* Primary Customer Profile Card */}
      <div className="p-4 border border-border rounded bg-surface space-y-4">
        <h4 className="font-extrabold text-xs text-text-secondary uppercase tracking-wider mb-2">
          Corporate Buyer Account
        </h4>
        
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-text-secondary" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-text-primary mb-0.5">
              {customer.companyName}
            </h5>
            <span className="text-[10px] bg-slate-150 text-text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {customer.industry || 'B2B Client'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-text-secondary shrink-0" />
            <div>
              <span className="block text-[10px] text-text-secondary font-semibold">Contact Person</span>
              <span className="font-bold text-text-primary">{customer.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-text-secondary shrink-0" />
            <div>
              <span className="block text-[10px] text-text-secondary font-semibold">Phone Contact</span>
              <span className="font-bold font-mono text-text-primary">{customer.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-text-secondary shrink-0" />
            <div>
              <span className="block text-[10px] text-text-secondary font-semibold">Registered Email</span>
              <a href={`mailto:${customer.email}`} className="font-bold text-text-primary hover:underline">
                {customer.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-text-secondary shrink-0" />
            <div>
              <span className="block text-[10px] text-text-secondary font-semibold">Tax GSTIN</span>
              <span className="font-bold font-mono text-text-primary">{customer.gstNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
