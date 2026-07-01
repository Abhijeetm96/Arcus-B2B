import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../../components/ui/Dialog';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { Select } from '../../../../../components/ui/Select';
import { RFQPriority } from '../../constants/priority';
import { LOCATIONS } from '../../constants/filters';

interface RFQCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    location: string;
    projectType: string;
    details: string;
    priority: string;
    dueDate: string;
    items: Array<{ itemName: string; quantity: number; description: string; unit: string; targetPrice: number }>;
  }) => void;
}

export function RFQCreateDialog({ isOpen, onClose, onSubmit }: RFQCreateDialogProps) {
  const [companyName, setCompanyName] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [location, setLocation] = React.useState<string>(LOCATIONS[0] || 'Bangalore, KA');
  const [projectType, setProjectType] = React.useState('Commercial Building');
  const [details, setDetails] = React.useState('');
  const [priority, setPriority] = React.useState<string>(RFQPriority.MEDIUM);
  const [dueDate, setDueDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  
  const [items, setItems] = React.useState<Array<{ itemName: string; quantity: number; description: string; unit: string; targetPrice: number }>>([
    { itemName: '', quantity: 1, description: '', unit: 'Piece', targetPrice: 0 }
  ]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleAddItem = () => {
    setItems([...items, { itemName: '', quantity: 1, description: '', unit: 'Piece', targetPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!contactName.trim()) errs.contactName = 'Contact Name is required.';
    if (!phone.trim()) errs.phone = 'Phone Number is required.';
    
    items.forEach((item, idx) => {
      if (!item.itemName.trim()) {
        errs[`item_${idx}_name`] = 'Required';
      }
      if (item.quantity <= 0) {
        errs[`item_${idx}_qty`] = 'Qty > 0';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      companyName,
      contactName,
      phone,
      email,
      location,
      projectType,
      details,
      priority,
      dueDate,
      items
    });
    
    // Reset Form
    setCompanyName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setLocation(LOCATIONS[0] || 'Bangalore, KA');
    setProjectType('Commercial Building');
    setDetails('');
    setPriority(RFQPriority.MEDIUM);
    setDueDate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      return d.toISOString().split('T')[0];
    });
    setItems([{ itemName: '', quantity: 1, description: '', unit: 'Piece', targetPrice: 0 }]);
    setErrors({});
  };

  const locationOptions = LOCATIONS.map(l => ({ label: l, value: l }));
  const priorityOptions = [
    { label: 'Low', value: RFQPriority.LOW },
    { label: 'Normal', value: RFQPriority.MEDIUM },
    { label: 'High', value: RFQPriority.HIGH },
    { label: 'Urgent', value: RFQPriority.CRITICAL }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border border-border p-6 shadow-2xl rounded text-left flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-text-primary tracking-tight">Create New Procurement RFQ</DialogTitle>
          <DialogDescription className="text-xs text-text-secondary mt-1">
            Fill in the client particulars and structural material items to dispatch a new procurement brief.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 text-xs select-none">
          {/* Client Details */}
          <div className="bg-surface-secondary/20 p-4 rounded border border-border/60">
            <h3 className="font-extrabold text-[10px] text-text-secondary uppercase tracking-wider mb-3">Client Particulars</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Company Name</label>
                <Input
                  placeholder="e.g. Prestige Builders"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 bg-surface border-border w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Contact Name *</label>
                <Input
                  placeholder="e.g. Manoj Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className={`h-9 bg-surface w-full ${errors.contactName ? 'border-danger' : 'border-border'}`}
                />
                {errors.contactName && <p className="text-[10px] text-danger font-medium mt-1">{errors.contactName}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Phone Number *</label>
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`h-9 bg-surface w-full ${errors.phone ? 'border-danger' : 'border-border'}`}
                />
                {errors.phone && <p className="text-[10px] text-danger font-medium mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Email Address</label>
                <Input
                  placeholder="e.g. client@prestige.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 bg-surface border-border w-full"
                />
              </div>
            </div>
          </div>

          {/* Project Parameters */}
          <div className="bg-surface-secondary/20 p-4 rounded border border-border/60">
            <h3 className="font-extrabold text-[10px] text-text-secondary uppercase tracking-wider mb-3">Project Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Location</label>
                <Select
                  options={locationOptions}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Project Type</label>
                <Input
                  placeholder="e.g. Apartment Project"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="h-9 bg-surface border-border w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Priority</label>
                <Select
                  options={priorityOptions}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Detailed Description</label>
                <textarea
                  placeholder="Provide scope description or logistics constraints..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-border p-2 focus:outline-none focus:ring-1 focus:ring-primary text-xs bg-surface text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 bg-surface border-border w-full"
                />
              </div>
            </div>
          </div>

          {/* RFQ Items Reinforcement */}
          <div className="bg-surface-secondary/20 p-4 rounded border border-border/60">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-[10px] text-text-secondary uppercase tracking-wider">Material Items Requested</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-7 text-[10px] font-bold flex items-center gap-1 border-dashed border-border"
              >
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-surface border border-border/60 rounded relative animate-in fade-in duration-150">
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1">Material Name *</label>
                    <Input
                      placeholder="e.g. OPC 53 Cement"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                      className={`h-8 text-xs bg-surface w-full ${errors[`item_${idx}_name`] ? 'border-danger' : 'border-border'}`}
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1">Qty *</label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 0)}
                      className={`h-8 text-xs bg-surface w-full ${errors[`item_${idx}_qty`] ? 'border-danger' : 'border-border'}`}
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1">Unit</label>
                    <Input
                      placeholder="e.g. Bags"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="h-8 text-xs bg-surface border-border w-full"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-1">Target Price (₹)</label>
                    <Input
                      type="number"
                      min={0}
                      value={item.targetPrice}
                      onChange={(e) => handleItemChange(idx, 'targetPrice', parseFloat(e.target.value) || 0)}
                      className="h-8 text-xs bg-surface border-border w-full"
                    />
                  </div>
                  <div className="self-end pb-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      className="h-8 px-2 border-danger text-danger hover:bg-danger/5 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="h-10 text-xs font-extrabold"
            >
              Create & Dispatch RFQ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
