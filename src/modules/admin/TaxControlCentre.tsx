/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sliders,
  Database,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Download,
  Plus,
  Play,
  CheckCircle,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { EnterpriseGrid } from '../../platform/grid/EnterpriseGrid';
import type { ColumnDef } from '@tanstack/react-table';

interface DslRule {
  id: string;
  name: string;
  dsl: string;
  version: string;
  status: 'PUBLISHED' | 'DRAFT' | 'RETIRED';
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  approvedBy?: string;
}

interface HsnCodeMapping {
  code: string;
  type: 'HSN' | 'SAC';
  description: string;
  standardGst: number;
  taxClass: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const TaxControlCentre: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'hsn' | 'filings' | 'gateway'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic ERP database objects
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem('arcus_token');
        const [ordRes, prodRes] = await Promise.all([
          apiFetch('/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          apiFetch('/admin/products', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (Array.isArray(ordData)) setOrders(ordData);
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          let flat: any[] = [];
          if (Array.isArray(prodData)) {
            if (prodData.length > 0 && 'products' in prodData[0]) {
              prodData.forEach((c: any) => flat.push(...c.products));
            } else {
              flat = prodData;
            }
          }
          setProducts(flat);
        }
      } catch (err) {
        console.error('Failed to fetch tax report source dataset', err);
      }
    };
    fetchReportData();
  }, []);

  // Government gateway sync states
  const [gstnStatus, setGstnStatus] = useState<'CONNECTED' | 'STANDBY' | 'DISCONNECTED'>('STANDBY');
  const [eInvoiceStatus, setEInvoiceStatus] = useState<'CONNECTED' | 'STANDBY' | 'DISCONNECTED'>('STANDBY');

  // Rule engine mock data
  const [rules, setRules] = useState<DslRule[]>([
    {
      id: 'rule_001',
      name: 'SEZ Zero Rated Rule',
      dsl: 'IF Customer.Type == SEZ THEN GST = 0 AND PlaceOfSupply = EXPORT_ZERO_RATED',
      version: 'v1.4.0',
      status: 'PUBLISHED',
      effectiveFrom: '2026-04-01',
      createdBy: 'Amit Sharma',
      approvedBy: 'Rajesh Nair',
    },
    {
      id: 'rule_002',
      name: 'Interstate IGST Rule',
      dsl: 'IF Destination.State != Seller.State THEN GST = IGST',
      version: 'v2.1.0',
      status: 'PUBLISHED',
      effectiveFrom: '2026-04-01',
      createdBy: 'Amit Sharma',
      approvedBy: 'Rajesh Nair',
    },
    {
      id: 'rule_003',
      name: 'Intrastate CGST SGST Rule',
      dsl: 'IF Destination.State == Seller.State THEN GST = CGST + SGST',
      version: 'v2.0.0',
      status: 'PUBLISHED',
      effectiveFrom: '2026-04-01',
      createdBy: 'Amit Sharma',
      approvedBy: 'Rajesh Nair',
    },
    {
      id: 'rule_004',
      name: 'Reverse Charge (RCM) Cement Draft',
      dsl: 'IF Supplier.IsUnregistered AND Product.Category == CEMENT THEN TAX_PAYER = BUYER',
      version: 'v0.9.1-beta',
      status: 'DRAFT',
      effectiveFrom: '2026-08-01',
      createdBy: 'Suresh Kumar',
    },
  ]);

  // HSN Master mock data
  const [hsnMappings] = useState<HsnCodeMapping[]>([
    { code: '8481', type: 'HSN', description: 'Taps, cocks, valves and similar appliances for pipes', standardGst: 18, taxClass: 'Goods Standard', status: 'ACTIVE' },
    { code: '7306', type: 'HSN', description: 'Other tubes, pipes and hollow profiles of iron or steel', standardGst: 18, taxClass: 'Goods Standard', status: 'ACTIVE' },
    { code: '2523', type: 'HSN', description: 'Portland cement, aluminous cement, slag cement', standardGst: 28, taxClass: 'Goods Luxury/Sin', status: 'ACTIVE' },
    { code: '9987', type: 'SAC', description: 'Plumbing and water plumbing services', standardGst: 18, taxClass: 'Services Standard', status: 'ACTIVE' },
    { code: '9986', type: 'SAC', description: 'Support services to mining, electricity, gas and water', standardGst: 18, taxClass: 'Services Standard', status: 'ACTIVE' },
    { code: '3214', type: 'HSN', description: 'Glaziers putty, grafting putty, resin cements', standardGst: 18, taxClass: 'Goods Standard', status: 'ACTIVE' },
  ]);

  // DSL Rule Form
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDsl, setNewRuleDsl] = useState('');
  const [showRuleModal, setShowRuleModal] = useState(false);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: DslRule = {
      id: `rule_00${rules.length + 1}`,
      name: newRuleName,
      dsl: newRuleDsl,
      version: 'v1.0.0-draft',
      status: 'DRAFT',
      effectiveFrom: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
    };
    setRules([newRule, ...rules]);
    setNewRuleName('');
    setNewRuleDsl('');
    setShowRuleModal(false);
    triggerNotification('New Tax Rule DSL drafted successfully!');
  };

  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSyncPortal = async (portal: 'GSTN' | 'E-INVOICE') => {
    setIsLoading(true);
    // Simulate API connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (portal === 'GSTN') {
      setGstnStatus('CONNECTED');
      triggerNotification('Successfully synchronized ledger balances with GSTN portal.');
    } else {
      setEInvoiceStatus('CONNECTED');
      triggerNotification('Connected to E-Invoice sandbox server (NIC).');
    }
    setIsLoading(false);
  };

  // Dynamic CSV Report Generator Template
  const [activeDownload, setActiveDownload] = useState<{ url: string; filename: string } | null>(null);

  const handleExportGstr = (gstrType: string) => {
    let headers: string[];
    let rows: string[][];

    if (gstrType === 'GSTR-1') {
      headers = ['GSTIN of Recipient', 'Trade Name', 'Invoice Number', 'Invoice Date', 'Invoice Value', 'Place of Supply', 'Tax Rate', 'Taxable Value', 'Integrated Tax Amount', 'Central Tax Amount', 'State Tax Amount'];
      if (orders.length > 0) {
        rows = orders.map((o: any) => {
          const total = Number(o.amount || o.totalAmount || o.totalPrice || 25000);
          const taxable = Number((total / 1.18).toFixed(2));
          const gst = Number((total - taxable).toFixed(2));
          const cgst = Number((gst / 2).toFixed(2));
          const sgst = Number((gst / 2).toFixed(2));
          const orderDate = o?.createdAt || o?.timestamp || o?.date;
          let formattedDate = '2026-07-21';
          if (orderDate) {
            try {
              const d = new Date(orderDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
              }
            } catch {
              formattedDate = '2026-07-21';
            }
          }

          return [
            o.gstNumber || o.buyerGstin || '29AABCP1234A1Z1',
            o.userId || o.buyerName || 'Arcus Org Client',
            o.id || 'INV-2026-001',
            formattedDate,
            total.toFixed(2),
            o.placeOfSupply || '29-Karnataka',
            '18%',
            taxable.toFixed(2),
            '0.00',
            cgst.toFixed(2),
            sgst.toFixed(2),
          ];
        });
      } else {
        rows = [
          ['29AABCP1234A1Z1', 'Arcus Org', 'INV-2026-001', '2026-07-15', '59000.00', '29-Karnataka', '18%', '50000.00', '0.00', '4500.00', '4500.00'],
          ['36AAACP9876C2Z3', 'Hyderabad Builders', 'INV-2026-002', '2026-07-18', '11800.00', '36-Telangana', '18%', '10000.00', '1800.00', '0.00', '0.00'],
          ['29BBBCP4321D1Z5', 'Mysore Steel Corp', 'INV-2026-003', '2026-07-20', '128000.00', '29-Karnataka', '28%', '100000.00', '0.00', '14000.00', '14000.00'],
        ];
      }
    } else if (gstrType === 'GSTR-2B') {
      headers = ['GSTIN of Supplier', 'Supplier Name', 'Invoice Number', 'Invoice Date', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'ITC AvailabilityStatus'];
      if (products.length > 0) {
        rows = products.slice(0, 10).map((p: any, idx: number) => {
          const price = Number(p.price || p.procurementPrice || 1200);
          const taxable = Number((price * 10).toFixed(2));
          const gst = Number((taxable * 0.18).toFixed(2));
          const cgst = Number((gst / 2).toFixed(2));
          const sgst = Number((gst / 2).toFixed(2));
          return [
            p.vendorGstin || '29AAAFN2020A1Z2',
            p.brand || p.vendorName || 'Finolex Wires Ltd',
            `SUP-INV-${100 + idx}`,
            '2026-07-10',
            taxable.toFixed(2),
            '0.00',
            cgst.toFixed(2),
            sgst.toFixed(2),
            'AVAILABLE',
          ];
        });
      } else {
        rows = [
          ['29AAAFN2020A1Z2', 'Finolex Wires Ltd', 'FNX-7362', '2026-07-02', '35000.00', '0.00', '3150.00', '3150.00', 'AVAILABLE'],
          ['27AAACT1010C1Z4', 'Astral Pipes Ltd', 'AST-9920', '2026-07-05', '85000.00', '15300.00', '0.00', '0.00', 'AVAILABLE'],
          ['29AABCS8899D2Z1', 'UltraTech Cement', 'UT-4410', '2026-07-12', '120000.00', '0.00', '16800.00', '16800.00', 'AVAILABLE'],
        ];
      }
    } else {
      headers = ['Tax Heading', 'Total Taxable Value', 'IGST Payable', 'CGST Payable', 'SGST Payable', 'Eligible ITC'];
      let totalOutwardTaxable = 0;
      let totalOutwardCgst = 0;
      let totalOutwardSgst = 0;

      orders.forEach((o: any) => {
        const amt = Number(o.amount || o.totalAmount || o.totalPrice || 25000);
        const taxable = amt / 1.18;
        const gst = amt - taxable;
        totalOutwardTaxable += taxable;
        totalOutwardCgst += gst / 2;
        totalOutwardSgst += gst / 2;
      });

      if (orders.length === 0) {
        totalOutwardTaxable = 160000;
        totalOutwardCgst = 18500;
        totalOutwardSgst = 18500;
      }

      rows = [
        ['Outward Taxable Supplies', totalOutwardTaxable.toFixed(2), '1800.00', totalOutwardCgst.toFixed(2), totalOutwardSgst.toFixed(2), '0.00'],
        ['Eligible ITC Mapped', '0.00', '15300.00', '19950.00', '19950.00', '55200.00'],
      ];
    }

    const filename = `${gstrType}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    const csvLines = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    setActiveDownload({ url, filename });

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerNotification(`${gstrType} CSV exported successfully.`);
  };

  // Column definitions for HSN Master Grid
  const hsnColumns: ColumnDef<HsnCodeMapping, any>[] = [
    { id: 'code', header: 'Code/Number', accessorKey: 'code', size: 100 },
    { id: 'type', header: 'Type', accessorKey: 'type', size: 80 },
    { id: 'description', header: 'Description', accessorKey: 'description', size: 250 },
    { id: 'standardGst', header: 'GST Rate (%)', accessorKey: 'standardGst', size: 100 },
    { id: 'taxClass', header: 'Tax Classification', accessorKey: 'taxClass', size: 150 },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 100,
      cell: ({ row }) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          row.original.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
        }`}>
          {row.original.status}
        </span>
      ),
    },
  ];

  // Native CSV Data URI Generator
  const getReportDataUrl = (gstrType: string): string => {
    let headers: string[];
    let rows: string[][];

    if (gstrType === 'GSTR-1') {
      headers = ['GSTIN of Recipient', 'Trade Name', 'Invoice Number', 'Invoice Date', 'Invoice Value', 'Place of Supply', 'Tax Rate', 'Taxable Value', 'Integrated Tax Amount', 'Central Tax Amount', 'State Tax Amount'];
      if (orders.length > 0) {
        rows = orders.map((o: any) => {
          const total = Number(o.amount || o.totalAmount || o.totalPrice || 25000);
          const taxable = Number((total / 1.18).toFixed(2));
          const gst = Number((total - taxable).toFixed(2));
          const cgst = Number((gst / 2).toFixed(2));
          const sgst = Number((gst / 2).toFixed(2));
          const orderDate = o?.createdAt || o?.timestamp || o?.date;
          let formattedDate = '2026-07-21';
          if (orderDate) {
            try {
              const d = new Date(orderDate);
              if (!isNaN(d.getTime())) {
                formattedDate = d.toISOString().split('T')[0];
              }
            } catch {
              formattedDate = '2026-07-21';
            }
          }

          return [
            o.gstNumber || o.buyerGstin || '29AABCP1234A1Z1',
            o.userId || o.buyerName || 'Arcus Org Client',
            o.id || 'INV-2026-001',
            formattedDate,
            total.toFixed(2),
            o.placeOfSupply || '29-Karnataka',
            '18%',
            taxable.toFixed(2),
            '0.00',
            cgst.toFixed(2),
            sgst.toFixed(2),
          ];
        });
      } else {
        rows = [
          ['29AABCP1234A1Z1', 'Arcus Org', 'INV-2026-001', '2026-07-15', '59000.00', '29-Karnataka', '18%', '50000.00', '0.00', '4500.00', '4500.00'],
          ['36AAACP9876C2Z3', 'Hyderabad Builders', 'INV-2026-002', '2026-07-18', '11800.00', '36-Telangana', '18%', '10000.00', '1800.00', '0.00', '0.00'],
          ['29BBBCP4321D1Z5', 'Mysore Steel Corp', 'INV-2026-003', '2026-07-20', '128000.00', '29-Karnataka', '28%', '100000.00', '0.00', '14000.00', '14000.00'],
        ];
      }
    } else if (gstrType === 'GSTR-2B') {
      headers = ['GSTIN of Supplier', 'Supplier Name', 'Invoice Number', 'Invoice Date', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'ITC AvailabilityStatus'];
      if (products.length > 0) {
        rows = products.slice(0, 10).map((p: any, idx: number) => {
          const price = Number(p.price || p.procurementPrice || 1200);
          const taxable = Number((price * 10).toFixed(2));
          const gst = Number((taxable * 0.18).toFixed(2));
          const cgst = Number((gst / 2).toFixed(2));
          const sgst = Number((gst / 2).toFixed(2));
          return [
            p.vendorGstin || '29AAAFN2020A1Z2',
            p.brand || p.vendorName || 'Finolex Wires Ltd',
            `SUP-INV-${100 + idx}`,
            '2026-07-10',
            taxable.toFixed(2),
            '0.00',
            cgst.toFixed(2),
            sgst.toFixed(2),
            'AVAILABLE',
          ];
        });
      } else {
        rows = [
          ['29AAAFN2020A1Z2', 'Finolex Wires Ltd', 'FNX-7362', '2026-07-02', '35000.00', '0.00', '3150.00', '3150.00', 'AVAILABLE'],
          ['27AAACT1010C1Z4', 'Astral Pipes Ltd', 'AST-9920', '2026-07-05', '85000.00', '15300.00', '0.00', '0.00', 'AVAILABLE'],
          ['29AABCS8899D2Z1', 'UltraTech Cement', 'UT-4410', '2026-07-12', '120000.00', '0.00', '16800.00', '16800.00', 'AVAILABLE'],
        ];
      }
    } else {
      headers = ['Tax Heading', 'Total Taxable Value', 'IGST Payable', 'CGST Payable', 'SGST Payable', 'Eligible ITC'];
      let totalOutwardTaxable = 0;
      let totalOutwardCgst = 0;
      let totalOutwardSgst = 0;

      orders.forEach((o: any) => {
        const amt = Number(o.amount || o.totalAmount || o.totalPrice || 25000);
        const taxable = amt / 1.18;
        const gst = amt - taxable;
        totalOutwardTaxable += taxable;
        totalOutwardCgst += gst / 2;
        totalOutwardSgst += gst / 2;
      });

      if (orders.length === 0) {
        totalOutwardTaxable = 160000;
        totalOutwardCgst = 18500;
        totalOutwardSgst = 18500;
      }

      rows = [
        ['Outward Taxable Supplies', totalOutwardTaxable.toFixed(2), '1800.00', totalOutwardCgst.toFixed(2), totalOutwardSgst.toFixed(2), '0.00'],
        ['Eligible ITC Mapped', '0.00', '15300.00', '19950.00', '19950.00', '55200.00'],
      ];
    }

    const csvLines = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))].join('\r\n');
    return 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csvLines);
  };

  return (
    <div className="h-full flex flex-col relative">
      {successMsg && (
        <div className="fixed top-20 right-8 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 text-xs font-bold flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <span>{successMsg}</span>
          {activeDownload && (
            <a
              href={activeDownload.url}
              download={activeDownload.filename}
              className="bg-primary text-slate-950 px-2.5 py-1 rounded text-[11px] font-extrabold hover:bg-amber-400 transition-colors shrink-0"
            >
              Click to Download
            </a>
          )}
        </div>
      )}

      {/* Tabs Subheader */}
      <div className="flex border-b border-slate-200 bg-white px-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'overview' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp size={14} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'rules' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sliders size={14} /> Tax Rule DSL
        </button>
        <button
          onClick={() => setActiveTab('hsn')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'hsn' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Database size={14} /> HSN & SAC Mappings
        </button>
        <button
          onClick={() => setActiveTab('filings')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'filings' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={14} /> GST Ledgers & Filings
        </button>
        <button
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'gateway' ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <RefreshCw size={14} /> Government Gateway
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 overflow-auto bg-slate-50">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Metric widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Tax Collected (Q2)
                </span>
                <span className="text-xl font-bold text-slate-800">₹4,28,450.00</span>
                <div className="text-[10px] text-green-600 font-semibold mt-1">
                  ▲ +14% compared to Q1 FY26
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  IGST (Inter-State)
                </span>
                <span className="text-xl font-bold text-slate-800">₹2,84,300.00</span>
                <span className="text-3xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 ml-2 font-mono">
                  66% Share
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  CGST + SGST (Intra-State)
                </span>
                <span className="text-xl font-bold text-slate-800">₹1,44,150.00</span>
                <span className="text-3xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 ml-2 font-mono">
                  34% Share
                </span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Filing Audit Flags
                </span>
                <div className="flex items-center gap-1.5 text-xl font-bold text-yellow-600 mt-0.5">
                  <AlertTriangle size={20} />
                  <span>2 Mismatches</span>
                </div>
                <div className="text-3xs text-slate-400 font-semibold mt-1">
                  Difference found in GSTR-2B ITC matching
                </div>
              </div>
            </div>

            {/* Collected Tax Rates Breakdown Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-800">GST Rates Mapped Invoices Summary</h3>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/50 font-bold text-slate-500">
                    <th className="p-3">GST Slab</th>
                    <th className="p-3 text-right">Taxable Value</th>
                    <th className="p-3 text-right">CGST Collected</th>
                    <th className="p-3 text-right">SGST Collected</th>
                    <th className="p-3 text-right">IGST Collected</th>
                    <th className="p-3 text-right">Total GST Mapped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr>
                    <td className="p-3">GST 5% (Bulk Freight/Sand)</td>
                    <td className="p-3 text-right">₹3,50,000.00</td>
                    <td className="p-3 text-right">₹4,250.00</td>
                    <td className="p-3 text-right">₹4,250.00</td>
                    <td className="p-3 text-right">₹9,000.00</td>
                    <td className="p-3 text-right font-bold text-slate-800">₹17,500.00</td>
                  </tr>
                  <tr>
                    <td className="p-3">GST 12% (Construction Support)</td>
                    <td className="p-3 text-right">₹4,80,000.00</td>
                    <td className="p-3 text-right">₹11,400.00</td>
                    <td className="p-3 text-right">₹11,400.00</td>
                    <td className="p-3 text-right">₹34,800.00</td>
                    <td className="p-3 text-right font-bold text-slate-800">₹57,600.00</td>
                  </tr>
                  <tr>
                    <td className="p-3">GST 18% (Standard pipes, valves, wiring)</td>
                    <td className="p-3 text-right">₹15,40,000.00</td>
                    <td className="p-3 text-right">₹48,200.00</td>
                    <td className="p-3 text-right">₹48,200.00</td>
                    <td className="p-3 text-right">₹1,80,800.00</td>
                    <td className="p-3 text-right font-bold text-slate-800">₹2,77,200.00</td>
                  </tr>
                  <tr>
                    <td className="p-3">GST 28% (Luxury items / Cement)</td>
                    <td className="p-3 text-right">₹2,72,000.00</td>
                    <td className="p-3 text-right">₹8,150.00</td>
                    <td className="p-3 text-right">₹8,150.00</td>
                    <td className="p-3 text-right">₹59,850.00</td>
                    <td className="p-3 text-right font-bold text-slate-800">₹76,150.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="p-6 space-y-6">
            {/* Header control */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  <Sliders size={16} /> Tax DSL Logic Engine
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Define, version control and draft rule calculations</p>
              </div>
              <button
                onClick={() => setShowRuleModal(true)}
                className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary-hover"
              >
                <Plus size={14} /> Add Tax Rule
              </button>
            </div>

            {/* List of Versioned DSL rules */}
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-xs">{rule.name}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.2 rounded-full border border-slate-200">
                        {rule.version}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                        rule.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {rule.status}
                      </span>
                    </div>

                    <div className="bg-slate-900 text-green-400 rounded-lg p-2.5 font-mono text-[10px] flex items-center gap-2 overflow-x-auto border border-slate-850">
                      <FileCode size={12} className="text-slate-500 shrink-0" />
                      <span>{rule.dsl}</span>
                    </div>

                    <div className="flex items-center gap-4 text-3xs text-slate-400 mt-2 font-medium">
                      <span>Effective: {rule.effectiveFrom}</span>
                      <span>•</span>
                      <span>By: {rule.createdBy}</span>
                      {rule.approvedBy && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 flex items-center gap-0.5">
                            <ShieldCheck size={10} /> Approved by {rule.approvedBy}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end self-end md:self-center">
                    {rule.status === 'DRAFT' && (
                      <button
                        onClick={() => {
                          const updated = rules.map((r) => r.id === rule.id ? { ...r, status: 'PUBLISHED' as const, approvedBy: 'Rajesh Nair' } : r);
                          setRules(updated);
                          triggerNotification(`Rule "${rule.name}" approved and published.`);
                        }}
                        className="flex items-center gap-1 border border-primary text-primary hover:bg-[#FFFDF5] text-xs font-semibold px-2.5 py-1 rounded-md"
                      >
                        <Play size={10} /> Approve & Publish
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const updated = rules.filter((r) => r.id !== rule.id);
                        setRules(updated);
                        triggerNotification('Rule retired successfully.');
                      }}
                      className="text-3xs text-slate-400 hover:text-red-500 font-semibold"
                    >
                      Delete Rule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hsn' && (
          <div className="h-full flex flex-col p-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Database size={16} /> HSN & SAC Master Mapping Directory
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Verify standard tax percentages mapping on items</p>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs min-h-[300px]">
              <EnterpriseGrid<HsnCodeMapping>
                gridId="hsn_master_grid"
                columns={hsnColumns}
                data={hsnMappings}
                exportFileName="HSN_SAC_Master"
              />
            </div>
          </div>
        )}

        {activeTab === 'filings' && (
          <div className="p-6 space-y-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <FileText size={16} /> GST Returns & Ledgers Mapped CSV
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Export standard government formatted templates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs mb-1">GSTR-1 (Outward Supplies)</h4>
                  <p className="text-2xs text-slate-400 font-semibold leading-relaxed">
                    Export complete b2b and b2c sales details mapped against matching place of supply codes.
                  </p>
                </div>
                <a
                  href={getReportDataUrl('GSTR-1')}
                  download={`GSTR-1_Report_${new Date().toISOString().split('T')[0]}.csv`}
                  onClick={() => handleExportGstr('GSTR-1')}
                  className="flex items-center justify-center gap-1.5 bg-primary text-slate-950 hover:bg-amber-400 text-xs font-extrabold py-2.5 rounded-lg shadow-xs transition-all no-underline cursor-pointer"
                >
                  <Download size={14} /> Download GSTR-1 CSV
                </a>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs mb-1">GSTR-2B Reconciliation</h4>
                  <p className="text-2xs text-slate-400 font-semibold leading-relaxed">
                    ITC ledger reconciliation logs to identify mismatches between supplier filings and purchases.
                  </p>
                </div>
                <a
                  href={getReportDataUrl('GSTR-2B')}
                  download={`GSTR-2B_Report_${new Date().toISOString().split('T')[0]}.csv`}
                  onClick={() => handleExportGstr('GSTR-2B')}
                  className="flex items-center justify-center gap-1.5 bg-primary text-slate-950 hover:bg-amber-400 text-xs font-extrabold py-2.5 rounded-lg shadow-xs transition-all no-underline cursor-pointer"
                >
                  <Download size={14} /> Download GSTR-2B CSV
                </a>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs mb-1">GSTR-3B Monthly Return</h4>
                  <p className="text-2xs text-slate-400 font-semibold leading-relaxed">
                    Consolidated summary of liabilities, input tax credits claimed and offsets settled.
                  </p>
                </div>
                <a
                  href={getReportDataUrl('GSTR-3B')}
                  download={`GSTR-3B_Report_${new Date().toISOString().split('T')[0]}.csv`}
                  onClick={() => handleExportGstr('GSTR-3B')}
                  className="flex items-center justify-center gap-1.5 bg-primary text-slate-950 hover:bg-amber-400 text-xs font-extrabold py-2.5 rounded-lg shadow-xs transition-all no-underline cursor-pointer"
                >
                  <Download size={14} /> Download GSTR-3B CSV
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gateway' && (
          <div className="p-6 space-y-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <RefreshCw size={16} /> Government E-Invoice & GSTN API Adapters
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Verify connection statuses and synchronize ledger states</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 text-xs">GSTN API Ledger Sync</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      gstnStatus === 'CONNECTED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200 animate-pulse'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${gstnStatus === 'CONNECTED' ? 'bg-green-600' : 'bg-yellow-500'}`} />
                      {gstnStatus}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-400 font-semibold leading-relaxed">
                    Enables retrieval of ledger balances (Cash, Tax and Interest Ledger) directly from GSTN.
                  </p>
                </div>
                <button
                  onClick={() => handleSyncPortal('GSTN')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold py-2 rounded-lg"
                >
                  {isLoading ? 'Syncing...' : 'Sync Portal Ledgers'}
                </button>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900 text-xs">NIC E-Invoicing Gateway</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      eInvoiceStatus === 'CONNECTED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200 animate-pulse'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${eInvoiceStatus === 'CONNECTED' ? 'bg-green-600' : 'bg-yellow-500'}`} />
                      {eInvoiceStatus}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-400 font-semibold leading-relaxed">
                    Auto-register outbound orders to generate IRNs (Invoice Reference Numbers) and dynamic QR codes.
                  </p>
                </div>
                <button
                  onClick={() => handleSyncPortal('E-INVOICE')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold py-2 rounded-lg"
                >
                  {isLoading ? 'Syncing...' : 'Authenticate E-Invoice Gate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Tax Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <form onSubmit={handleAddRule} className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-md w-full text-xs font-semibold text-slate-600">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sliders size={16} className="text-primary" />
              Draft Dynamic Tax Rule DSL
            </h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-slate-400 text-3xs font-bold uppercase tracking-wider mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Export Zone zero tax"
                  className="w-full border-slate-200 rounded-lg py-2 px-3 text-xs focus:ring-primary focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-3xs font-bold uppercase tracking-wider mb-1">DSL Code Logic</label>
                <textarea
                  required
                  value={newRuleDsl}
                  onChange={(e) => setNewRuleDsl(e.target.value)}
                  rows={4}
                  placeholder="e.g. IF Customer.Type == SEZ THEN GST = 0"
                  className="w-full border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white focus:ring-primary focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => { setShowRuleModal(false); }}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-md shadow-xs"
              >
                Draft Rule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
