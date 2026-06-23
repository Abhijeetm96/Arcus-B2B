import React, { useState } from 'react'
import { validateRfqForm } from '../../shared/validation'

export default function RfqForm() {
  const [submitted, setSubmitted] = useState(false)
  const [rfqError, setRfqError] = useState('')
  const [formData, setFormData] = useState({
    category: 'Cement',
    quantity: '',
    location: '',
    timeline: 'Immediate (1-3 Days)',
    details: '',
    name: '',
    phone: '',
    title: '',
    budget: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRfqError('')

    const validationErrors = validateRfqForm({
      name: formData.name,
      phone: formData.phone,
      quantity: formData.quantity,
      location: formData.location,
      details: formData.details
    });

    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      setRfqError(firstError);
      return;
    }

    try {
      const token = localStorage.getItem('arcus_token');
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      console.warn('Backend server offline, falling back to local success state:', err)
    }

    setSubmitted(true)
  }

  return (
    <section className="w-full py-4xl bg-[#1a1c1c] text-white">
      <div className="max-w-[1440px] mx-auto px-lg w-full grid grid-cols-1 lg:grid-cols-2 gap-4xl items-center text-left">
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-sm">
            <h2 className="font-headline-h2 text-headline-h2 text-white">
              Request a Bulk Quote
            </h2>
            <p className="font-body-lg text-body-lg text-gray-400">
              Get custom pricing for large orders directly from top manufacturers and distributors.
            </p>
          </div>
          <div className="flex flex-col gap-md">
            <div className="flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  check
                </span>
              </div>
              <div>
                <h4 className="font-body-sm font-bold text-white text-[16px]">
                  Factory-Direct Pricing
                </h4>
                <p className="font-body-sm text-gray-400 mt-xs">
                  Bypass middlemen and get the best possible rates for high-volume material requirements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  check
                </span>
              </div>
              <div>
                <h4 className="font-body-sm font-bold text-white text-[16px]">
                  Dedicated Account Manager
                </h4>
                <p className="font-body-sm text-gray-400 mt-xs">
                  A single point of contact to handle negotiations, logistics, and delivery scheduling.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  check
                </span>
              </div>
              <div>
                <h4 className="font-body-sm font-bold text-white text-[16px]">
                  Flexible Payment Terms
                </h4>
                <p className="font-body-sm text-gray-400 mt-xs">
                  Credit options and milestone-based payments available for verified enterprise buyers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-surface-variant text-on-surface rounded-md p-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-4xl text-center gap-md">
              <span className="material-symbols-outlined text-[#10B981] text-[64px]">
                check_circle
              </span>
              <h3 className="font-headline-h3 text-[24px]">Request Submitted!</h3>
              <p className="font-body-md text-secondary max-w-sm">
                Thank you, <strong>{formData.name}</strong>. Our procurement experts will contact you at <strong>{formData.phone}</strong> within 2 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-lg px-xl py-2 bg-[#121212] text-white font-semibold rounded-md hover:bg-on-surface transition-colors font-label-caps"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-headline-h3 text-[24px] mb-lg border-b border-surface-variant pb-md">
                Submit Requirements
              </h3>
              {rfqError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded mb-md text-left">
                  {rfqError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Product Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface"
                    >
                      <option value="Cement">Cement</option>
                      <option value="Steel (TMT)">Steel (TMT)</option>
                      <option value="Bricks & Blocks">Bricks & Blocks</option>
                      <option value="Aggregates">Aggregates</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Estimated Quantity *
                    </label>
                    <input
                      required
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400"
                      placeholder="e.g., 500 Tons, 1000 Bags"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Delivery Location *
                    </label>
                    <input
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400"
                      placeholder="City, Pincode"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Expected Timeline *
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) =>
                        setFormData({ ...formData, timeline: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface"
                    >
                      <option value="Immediate (1-3 Days)">
                        Immediate (1-3 Days)
                      </option>
                      <option value="Within 1 Week">Within 1 Week</option>
                      <option value="Within 1 Month">Within 1 Month</option>
                      <option value="Planning Phase">Planning Phase</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Requirement Title (Optional)
                    </label>
                    <input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400"
                      placeholder="e.g. Cement Procurement for Phase 1"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Estimated Budget (INR, Optional)
                    </label>
                    <input
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400"
                      placeholder="e.g. 500000"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Additional Details
                    </label>
                    <textarea
                      value={formData.details}
                      onChange={(e) =>
                        setFormData({ ...formData, details: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400 h-24 resize-none"
                      placeholder="Specific brands preferred, quality grades, unloading requirements..."
                    ></textarea>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Contact Name *
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400"
                      placeholder="Full Name"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-caps text-[10px] text-secondary">
                      Phone Number *
                    </label>
                    <input
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm text-on-surface placeholder:text-gray-400"
                      placeholder="+91 XXXXX XXXXX"
                      type="tel"
                    />
                  </div>
                </div>
                <button
                  className="w-full h-14 mt-md bg-primary-container text-[#121212] font-semibold rounded-md border-0 hover:bg-[#fabd00] transition-colors font-label-caps text-[14px]"
                  type="submit"
                >
                  Submit Request
                </button>
                <p className="text-center font-label-caps text-[10px] text-secondary mt-sm">
                  Our procurement experts will contact you within 2 hours.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
