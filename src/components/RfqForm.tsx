import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateRfqForm } from '../../shared/validation';
import { apiFetch } from '../lib/api';

interface MaterialItem {
  itemName: string;
  description: string;
  unit: string;
  quantity: string;
}

export default function RfqForm() {
  const { user } = useAuth();
  const [rfqType, setRfqType] = useState<'assisted' | 'detailed'>('assisted');
  const [submitted, setSubmitted] = useState(false);
  const [rfqError, setRfqError] = useState('');
  
  // Assisted RFQ Form State
  const [assistedData, setAssistedData] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    city: '',
    location: '',
    details: '',
  });

  // Detailed RFQ Form State
  const [detailedData, setDetailedData] = useState({
    companyName: '',
    gstNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    projectName: '',
    location: '',
    deliveryAddress: '',
    deliveryDate: '',
    targetBudget: '',
    commercialNotes: '',
  });

  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([
    { itemName: '', description: '', unit: 'Nos', quantity: '' }
  ]);

  // Prepopulate form data if user is logged in
  useEffect(() => {
    if (user) {
      setAssistedData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        companyName: user.companyName || '',
        city: user.city || '',
      }));

      setDetailedData((prev) => ({
        ...prev,
        companyName: user.companyName || '',
        gstNumber: user.gstNumber || '',
        contactPerson: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  // Sync B2B default type
  useEffect(() => {
    if (user?.customerType === 'BUSINESS') {
      setRfqType('detailed');
    } else {
      setRfqType('assisted');
    }
  }, [user]);

  const handleAddMaterial = () => {
    setMaterialItems([...materialItems, { itemName: '', description: '', unit: 'Nos', quantity: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    if (materialItems.length === 1) return;
    setMaterialItems(materialItems.filter((_, idx) => idx !== index));
  };

  const handleMaterialChange = (index: number, field: keyof MaterialItem, value: string) => {
    const updated = [...materialItems];
    updated[index][field] = value;
    setMaterialItems(updated);
  };

  const handleSubmitAssisted = async (e: React.FormEvent) => {
    e.preventDefault();
    setRfqError('');

    const validationErrors = validateRfqForm({
      name: assistedData.name,
      phone: assistedData.phone,
      quantity: '1', // dummy for validation
      location: assistedData.location || assistedData.city,
      details: assistedData.details
    });

    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      setRfqError(firstError);
      return;
    }

    try {
      const token = localStorage.getItem('arcus_token');
      const payload = {
        name: assistedData.name,
        phone: assistedData.phone,
        category: 'Assisted Inquiry',
        quantity: '1',
        location: `${assistedData.city}, ${assistedData.location}`,
        timeline: 'Requirement Gathering',
        details: `[Assisted RFQ] Details: ${assistedData.details}. Company: ${assistedData.companyName || 'None'}. Email: ${assistedData.email}`,
        budget: '',
        title: `Inquiry by ${assistedData.name}`,
        attachmentUrls: []
      };

      const response = await apiFetch('/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Server error');
      }
      setSubmitted(true);
    } catch (err: any) {
      setRfqError(err.message || 'Failed to submit inquiry.');
    }
  };

  const handleSubmitDetailed = async (e: React.FormEvent) => {
    e.preventDefault();
    setRfqError('');

    // Validations
    if (!detailedData.companyName.trim()) return setRfqError('Company name is required.');
    if (!detailedData.gstNumber.trim()) return setRfqError('GST number is required.');
    if (!detailedData.deliveryAddress.trim()) return setRfqError('Delivery address is required.');
    
    // Check material items
    const invalidItem = materialItems.some(item => !item.itemName.trim() || !item.quantity.trim());
    if (invalidItem) {
      return setRfqError('Please fill in Item Name and Quantity for all materials.');
    }

    try {
      const token = localStorage.getItem('arcus_token');
      const payload = {
        name: detailedData.contactPerson,
        phone: detailedData.phone,
        category: 'Detailed B2B RFQ',
        location: `${detailedData.location || ''}, ${detailedData.deliveryAddress}`,
        timeline: `Deliver By: ${detailedData.deliveryDate || 'Flexible'}`,
        details: `[Detailed B2B RFQ] Company: ${detailedData.companyName}. GST: ${detailedData.gstNumber}. Notes: ${detailedData.commercialNotes}`,
        budget: detailedData.targetBudget,
        title: `${detailedData.projectName || 'Bulk Material Procurement'}`,
        items: materialItems,
        attachmentUrls: []
      };

      const response = await apiFetch('/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Server error');
      }
      setSubmitted(true);
    } catch (err: any) {
      setRfqError(err.message || 'Failed to submit Detailed RFQ.');
    }
  };

  const isB2B = user?.customerType === 'BUSINESS';

  return (
    <section className="w-full py-16 bg-[#121212] text-white">
      <div className="max-w-[1200px] mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Side: Specifications & Core Value Props */}
        <div className="lg:col-span-4 flex flex-col gap-6 self-start">
          <div className="flex flex-col gap-2">
            <span className="text-primary-container font-semibold tracking-wider uppercase text-xs">ARCUS Procurement</span>
            <h2 className="text-3xl font-bold font-headline text-white">
              Request a Bulk Quote
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Bypass middlemen. ARCUS aggregates bulk material requirements and manages procurement directly with tier-1 manufacturers.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-md">
              <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Not a Marketplace
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  We are your primary supplier. All quotes originate from ARCUS Admins for maximum accountability.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-md">
              <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5">
                gavel
              </span>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  B2B Negotiation
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Verified B2B accounts enjoy full multi-version price negotiations, credit terms, and custom contracts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-md">
              <span className="material-symbols-outlined text-primary-container shrink-0 mt-0.5">
                local_shipping
              </span>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  Enterprise Logistics
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Dedicated fleet management and onsite material offloading across all major project sites.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Multi-type RFQ Form Console */}
        <div className="lg:col-span-8 bg-white border border-surface-variant text-on-surface rounded p-6 shadow">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <span className="material-symbols-outlined text-[#10B981] text-6xl">
                check_circle
              </span>
              <h3 className="text-2xl font-bold text-gray-900">RFQ Submitted Successfully!</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Thank you for submitting your requirements. The ARCUS procurement desk has received your request and will prepare a custom quotation shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2.5 bg-gray-950 text-white font-semibold text-xs uppercase tracking-wider rounded-md hover:bg-gray-800 transition-all"
              >
                Submit Another RFQ
              </button>
            </div>
          ) : (
            <>
              {/* Tabs for Form Selection */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => setRfqType('assisted')}
                  className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
                    rfqType === 'assisted'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Type 1: Assisted Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setRfqType('detailed')}
                  className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
                    rfqType === 'detailed'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Type 2: Detailed B2B RFQ
                </button>
              </div>

              {rfqError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs rounded mb-4">
                  {rfqError}
                </div>
              )}

              {/* Assisted Inquiry Form */}
              {rfqType === 'assisted' && (
                <form onSubmit={handleSubmitAssisted} className="flex flex-col gap-4">
                  <div className="text-left mb-2">
                    <h4 className="text-lg font-bold text-gray-900">Assisted Procurement Inquiry</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Tell us what materials you are looking for in plain text. An ARCUS procurement manager will coordinate requirements and draft a structured bill of quantities (BOQ) quote for you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact Person *</label>
                      <input
                        required
                        type="text"
                        value={assistedData.name}
                        onChange={(e) => setAssistedData({ ...assistedData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mobile Number *</label>
                      <input
                        required
                        type="tel"
                        value={assistedData.phone}
                        onChange={(e) => setAssistedData({ ...assistedData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                      <input
                        type="email"
                        value={assistedData.email}
                        onChange={(e) => setAssistedData({ ...assistedData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        placeholder="email@company.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Company Name (Optional)</label>
                      <input
                        type="text"
                        value={assistedData.companyName}
                        onChange={(e) => setAssistedData({ ...assistedData, companyName: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        placeholder="Company Ltd"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">City *</label>
                      <input
                        required
                        type="text"
                        value={assistedData.city}
                        onChange={(e) => setAssistedData({ ...assistedData, city: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Project Location / Address</label>
                      <input
                        type="text"
                        value={assistedData.location}
                        onChange={(e) => setAssistedData({ ...assistedData, location: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                        placeholder="Project Site Area"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Requirement Details *</label>
                    <textarea
                      required
                      rows={4}
                      value={assistedData.details}
                      onChange={(e) => setAssistedData({ ...assistedData, details: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 resize-none"
                      placeholder='Write your items and counts. Example: "We need 50 CPVC pipes, 3 overhead tanks and 1 motor for our apartment project."'
                    />
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Upload BOQ / Drawings (Optional)</label>
                    <input
                      type="file"
                      disabled
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400">File uploads simulated. Document verification occurs during requirement review.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-primary-container text-gray-950 font-bold uppercase tracking-wider rounded hover:bg-[#fabd00] transition-all text-xs mt-4"
                  >
                    Submit Procurement Request
                  </button>
                </form>
              )}

              {/* Detailed B2B Negotiation RFQ Form */}
              {rfqType === 'detailed' && (
                <div>
                  {!isB2B ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded text-center">
                      <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
                        lock
                      </span>
                      <h4 className="font-bold text-gray-900">B2B Verified Account Required</h4>
                      <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                        Detailed RFQs with multi-item table spec matching and price renegotiations are exclusively available to registered Business customers.
                      </p>
                      <div className="flex gap-3">
                        <a
                          href="#/login"
                          className="px-4 py-2 bg-gray-950 text-white font-bold text-[10px] uppercase tracking-wider rounded hover:bg-gray-800 transition-all"
                        >
                          Login / Register
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitDetailed} className="flex flex-col gap-4">
                      <div className="text-left mb-2">
                        <h4 className="text-lg font-bold text-gray-900">Detailed B2B RFQ Specification</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Build your materials requirement sheet below. ARCUS Admins will match exact specifications and issue a formal pricing proposal.
                        </p>
                      </div>

                      {/* Section 1: Company Details */}
                      <div className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">1. Business Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Company Name *</label>
                            <input
                              required
                              type="text"
                              value={detailedData.companyName}
                              onChange={(e) => setDetailedData({ ...detailedData, companyName: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                              placeholder="Registered Entity Name"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">GSTIN *</label>
                            <input
                              required
                              type="text"
                              value={detailedData.gstNumber}
                              onChange={(e) => setDetailedData({ ...detailedData, gstNumber: e.target.value.toUpperCase() })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                              placeholder="29AAAAA0000A1Z5"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact Person *</label>
                            <input
                              required
                              type="text"
                              value={detailedData.contactPerson}
                              onChange={(e) => setDetailedData({ ...detailedData, contactPerson: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mobile Number *</label>
                            <input
                              required
                              type="tel"
                              value={detailedData.phone}
                              onChange={(e) => setDetailedData({ ...detailedData, phone: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Project Details */}
                      <div className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">2. Project & Logistical Info</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Project Name (Optional)</label>
                            <input
                              type="text"
                              value={detailedData.projectName}
                              onChange={(e) => setDetailedData({ ...detailedData, projectName: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                              placeholder="Apartment Project Phase 1"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Required Delivery Date</label>
                            <input
                              type="date"
                              value={detailedData.deliveryDate}
                              onChange={(e) => setDetailedData({ ...detailedData, deliveryDate: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Site Delivery Address *</label>
                            <textarea
                              required
                              rows={2}
                              value={detailedData.deliveryAddress}
                              onChange={(e) => setDetailedData({ ...detailedData, deliveryAddress: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 resize-none bg-white"
                              placeholder="Full address where materials should be dispatched"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Material Table */}
                      <div className="border border-gray-200 rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">3. Material Requirements Sheet</h5>
                          <button
                            type="button"
                            onClick={handleAddMaterial}
                            className="flex items-center gap-1 text-[10px] font-bold bg-gray-900 hover:bg-gray-800 text-white px-3 py-1 rounded"
                          >
                            <span className="material-symbols-outlined text-[12px]">add</span> Add Item
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                                <th className="p-2 w-1/3">Item Name *</th>
                                <th className="p-2 w-1/3">Specification / Description</th>
                                <th className="p-2 w-1/12">Unit</th>
                                <th className="p-2 w-1/6">Qty *</th>
                                <th className="p-2 text-center w-1/12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {materialItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-150 hover:bg-gray-50">
                                  <td className="p-1">
                                    <input
                                      required
                                      type="text"
                                      value={item.itemName}
                                      onChange={(e) => handleMaterialChange(idx, 'itemName', e.target.value)}
                                      placeholder="e.g. CPVC Pipe 1 Inch"
                                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-gray-950"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <input
                                      type="text"
                                      value={item.description}
                                      onChange={(e) => handleMaterialChange(idx, 'description', e.target.value)}
                                      placeholder="e.g. SDR11 Astral"
                                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-gray-950"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <select
                                      value={item.unit}
                                      onChange={(e) => handleMaterialChange(idx, 'unit', e.target.value)}
                                      className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-gray-900 focus:outline-none focus:border-gray-950"
                                    >
                                      <option value="Nos">Nos</option>
                                      <option value="Bags">Bags</option>
                                      <option value="Tons">Tons</option>
                                      <option value="Meters">Meters</option>
                                      <option value="Feet">Feet</option>
                                    </select>
                                  </td>
                                  <td className="p-1">
                                    <input
                                      required
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                                      placeholder="Qty"
                                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-gray-950"
                                    />
                                  </td>
                                  <td className="p-1 text-center">
                                    <button
                                      type="button"
                                      disabled={materialItems.length === 1}
                                      onClick={() => handleRemoveMaterial(idx)}
                                      className={`text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed`}
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Section 4: Target Pricing Expectations */}
                      <div className="border border-gray-200 rounded p-4 bg-gray-50">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">4. Commercial & Budget Expectations (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Target Budget (INR)</label>
                            <input
                              type="number"
                              value={detailedData.targetBudget}
                              onChange={(e) => setDetailedData({ ...detailedData, targetBudget: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                              placeholder="e.g. 180000"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Commercial Notes / Expectations</label>
                            <input
                              type="text"
                              value={detailedData.commercialNotes}
                              onChange={(e) => setDetailedData({ ...detailedData, commercialNotes: e.target.value })}
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-900 bg-white"
                              placeholder="e.g. Looking for best pricing for repeat business."
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-12 bg-primary-container text-gray-950 font-bold uppercase tracking-wider rounded hover:bg-[#fabd00] transition-all text-xs mt-4"
                      >
                        Submit B2B Detailed RFQ
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </section>
  );
}
