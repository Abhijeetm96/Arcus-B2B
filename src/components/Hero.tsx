export default function Hero() {
  return (
    <section className="relative w-full min-h-[850px] bg-surface flex items-center overflow-hidden pt-xxl lg:pt-0">
      {/* Ambient Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-primary-container/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[60%] rounded-full bg-tertiary-container/20 blur-[100px]"></div>
      </div>
      <div className="max-w-[1440px] mx-auto px-lg w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-4xl items-center relative py-4xl">
        {/* Left Content */}
        <div className="lg:col-span-6 flex flex-col gap-xl">
          <div className="inline-flex items-center gap-sm bg-surface-container-highest px-md py-sm rounded-full w-fit border border-surface-variant shadow-sm">
            <span
              className="material-symbols-outlined text-primary-container text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              India's Construction Commerce Platform
            </span>
          </div>
          <h1 className="font-headline-h1-mobile md:font-headline-h1 text-headline-h1-mobile md:text-headline-h1 text-on-surface max-w-2xl leading-tight text-left">
            Build Faster.
            <br />
            Procure Smarter.
            <br />
            <span className="text-[#FFC107]">Deliver Better.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-xl text-left">
            Procure materials, hire contractors, manage deliveries and complete projects faster with an uncompromisingly professional platform designed for the heavy-duty demands of B2B construction.
          </p>
          {/* Quick Search */}
          <div className="relative max-w-xl mt-sm group w-full">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary z-10 text-[24px]">
              search
            </span>
            <input
              className="w-full h-16 pl-[52px] pr-[120px] rounded-xl border-2 border-surface-variant bg-surface-container-lowest focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all font-body-md text-on-surface placeholder:text-secondary-fixed-dim outline-none shadow-md"
              placeholder="Search by product, brand, or service..."
              type="text"
            />
            <button className="absolute right-sm top-1/2 -translate-y-1/2 h-12 px-lg bg-inverse-surface text-inverse-on-surface font-label-caps rounded-lg hover:bg-on-surface transition-colors">
              Search
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-md mt-sm">
            <button className="h-14 px-xl bg-primary-container text-on-primary-fixed font-label-caps text-label-caps rounded-lg hover:bg-inverse-primary hover:-translate-y-1 transition-all duration-200 shadow-[0_4px_20px_rgba(255,193,7,0.3)] flex items-center justify-center gap-sm">
              Get Started
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="h-14 px-xl bg-surface-container-lowest border-2 border-on-surface text-on-surface font-label-caps text-label-caps rounded-lg hover:bg-on-surface hover:text-on-primary hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-sm">
              Request Bulk Quote
            </button>
          </div>
          {/* Trust Metrics (In Hero) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md mt-xl pt-lg border-t border-surface-variant">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  inventory
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-on-surface leading-none mb-0.5">
                  10,000+
                </p>
                <p className="font-label-caps text-[10px] text-secondary">
                  Products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">
                  factory
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-on-surface leading-none mb-0.5">
                  500+
                </p>
                <p className="font-label-caps text-[10px] text-secondary">
                  Suppliers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">
                  location_city
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-on-surface leading-none mb-0.5">
                  100+
                </p>
                <p className="font-label-caps text-[10px] text-secondary">
                  Cities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">
                  support_agent
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-on-surface leading-none mb-0.5">
                  24/7
                </p>
                <p className="font-label-caps text-[10px] text-secondary">
                  Support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Floating Dashboard Mockup) */}
        <div className="lg:col-span-6 relative mt-4xl lg:mt-0 hidden md:block perspective-1000">
          <div className="relative w-full max-w-[620px] h-[700px] bg-surface-container-lowest rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] border border-surface-variant p-lg flex flex-col gap-md overflow-hidden transform rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out z-10 ml-auto">
            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-sm border-b border-surface-variant">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    dashboard
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-body-sm text-body-sm text-on-surface font-bold">
                    Project Overview
                  </h3>
                  <p className="font-label-caps text-[10px] text-secondary">
                    ID: PRJ-9824-X
                  </p>
                </div>
              </div>
              <div className="flex gap-xs">
                <div className="w-3 h-3 rounded-full bg-error-container"></div>
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              </div>
            </div>
            {/* Mockup Grid */}
            <div className="grid grid-cols-2 gap-md h-full overflow-y-auto pr-2 custom-scrollbar">
              {/* Material Orders */}
              <div className="col-span-1 bg-surface rounded-lg p-md border border-surface-variant flex flex-col gap-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-16 h-16 bg-primary-container/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary-fixed-dim">
                    inventory_2
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    more_horiz
                  </span>
                </div>
                <h4 className="font-body-sm text-body-sm text-on-surface font-bold mt-auto text-left">
                  Material Orders
                </h4>
                <div className="flex justify-between items-end">
                  <span className="font-headline-h3 text-[24px] font-bold text-on-surface leading-none">
                    1,240
                  </span>
                  <span className="font-label-caps text-[10px] text-[#10B981] bg-[#10B981]/10 px-xs rounded leading-none">
                    +12%
                  </span>
                </div>
              </div>
              {/* Delivery Tracking */}
              <div className="col-span-1 bg-surface rounded-lg p-0 border border-surface-variant flex flex-col relative overflow-hidden group h-[120px]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMCA1MCBRIDEwMCAxMDAgMjAwIDUwIFQgNDAwIDUwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWEwMGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0Ii8+PC9zdmc+')] bg-cover opacity-50"></div>
                <div className="p-md flex flex-col h-full z-10 bg-gradient-to-t from-surface to-transparent">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-[#10B981]">
                      local_shipping
                    </span>
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                  </div>
                  <h4 className="font-body-sm text-body-sm text-on-surface font-bold mt-auto text-left">
                    Active Deliveries
                  </h4>
                  <div className="flex justify-between items-end">
                    <span className="font-headline-h3 text-[24px] font-bold text-on-surface leading-none">
                      48
                    </span>
                    <span className="font-label-caps text-[10px] text-primary bg-primary-container/20 px-xs rounded leading-none">
                      In Transit
                    </span>
                  </div>
                </div>
              </div>
              {/* Live Pricing Graph Mockup */}
              <div className="col-span-2 bg-inverse-surface rounded-lg p-md border border-on-tertiary-fixed-variant flex flex-col gap-sm">
                <div className="flex justify-between items-center text-on-primary">
                  <h4 className="font-body-sm text-body-sm font-bold">
                    Live Steel Pricing
                  </h4>
                  <span className="material-symbols-outlined text-primary-container text-[18px]">
                    show_chart
                  </span>
                </div>
                <div className="flex-1 mt-sm relative flex items-end gap-1 h-[80px]">
                  <div className="w-full bg-surface-tint h-[20%] rounded-t-sm"></div>
                  <div className="w-full bg-surface-tint h-[30%] rounded-t-sm"></div>
                  <div className="w-full bg-surface-tint h-[25%] rounded-t-sm"></div>
                  <div className="w-full bg-surface-tint h-[45%] rounded-t-sm"></div>
                  <div className="w-full bg-surface-tint h-[60%] rounded-t-sm"></div>
                  <div className="w-full bg-primary-container h-[85%] rounded-t-sm relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-on-primary text-inverse-surface font-label-caps text-[9px] px-1 rounded">
                      ₹65k
                    </div>
                  </div>
                  <div className="w-full bg-surface-tint h-[70%] rounded-t-sm"></div>
                </div>
              </div>
              {/* Service Bookings */}
              <div className="col-span-1 bg-surface rounded-lg p-md border border-surface-variant flex flex-col gap-sm">
                <div className="flex items-center gap-sm mb-sm justify-start">
                  <span className="material-symbols-outlined text-secondary">
                    engineering
                  </span>
                  <h4 className="font-body-sm text-[12px] font-bold">
                    Contractors
                  </h4>
                </div>
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-sm bg-surface-container-low p-xs rounded text-left">
                    <div className="w-6 h-6 rounded bg-surface-variant flex items-center justify-center text-[10px] font-bold shrink-0">
                      PL
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-[10px] font-bold leading-none truncate">
                        Plumbing Team A
                      </p>
                      <p className="font-label-caps text-[8px] text-secondary">
                        Site 4 • Tomorrow
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm bg-surface-container-low p-xs rounded text-left">
                    <div className="w-6 h-6 rounded bg-surface-variant flex items-center justify-center text-[10px] font-bold shrink-0">
                      EL
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-[10px] font-bold leading-none truncate">
                        ElectroCorp
                      </p>
                      <p className="font-label-caps text-[8px] text-secondary">
                        Site 2 • Ongoing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* RFQ Status */}
              <div className="col-span-1 bg-surface rounded-lg p-md border border-surface-variant flex flex-col gap-sm">
                <div className="flex items-center gap-sm mb-sm justify-start">
                  <span className="material-symbols-outlined text-secondary">
                    request_quote
                  </span>
                  <h4 className="font-body-sm text-[12px] font-bold">
                    Recent RFQs
                  </h4>
                </div>
                <div className="flex flex-col gap-xs">
                  <div className="flex justify-between items-center py-xs border-b border-surface-variant text-left">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary-container shrink-0"></div>
                      <span className="font-body-sm text-[10px] text-on-surface truncate max-w-[80px]">
                        UltraTech Cement
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-secondary shrink-0">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-xs border-b border-surface-variant text-left">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></div>
                      <span className="font-body-sm text-[10px] text-on-surface truncate max-w-[80px]">
                        Tata Tiscon TMT
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-[#10B981] shrink-0">
                      Quoted
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-xs text-left">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-error shrink-0"></div>
                      <span className="font-body-sm text-[10px] text-on-surface truncate max-w-[80px]">
                        Asian Paints 20L
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-error shrink-0">
                      Expired
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements behind mockup */}
          <div className="absolute -top-lg -right-lg w-32 h-32 bg-[radial-gradient(#c8c6c5_2px,transparent_2px)] [background-size:12px_12px] z-0"></div>
          <div className="absolute -bottom-lg -left-lg w-48 h-48 bg-[radial-gradient(#c8c6c5_2px,transparent_2px)] [background-size:12px_12px] z-0"></div>
        </div>
      </div>
    </section>
  )
}
