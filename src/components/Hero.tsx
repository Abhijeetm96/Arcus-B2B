export default function Hero() {
  return (
    <section className="relative w-full min-h-[850px] bg-surface flex items-center overflow-hidden pt-xxl lg:pt-0">
      {/* Ambient Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[60%] rounded-full bg-slate-200/20 blur-[100px]"></div>
      </div>
      <div className="max-w-[1440px] mx-auto px-lg w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-4xl items-center relative py-4xl">
        {/* Left Content */}
        <div className="lg:col-span-6 flex flex-col gap-xl">
          <div className="inline-flex items-center gap-sm bg-slate-100 px-md py-sm rounded-full w-fit border border-slate-200 shadow-sm">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="font-label-caps text-label-caps text-slate-600">
              India's Construction Commerce Platform
            </span>
          </div>
          <h1 className="font-headline-h1-mobile md:font-headline-h1 text-headline-h1-mobile md:text-headline-h1 text-slate-900 max-w-2xl leading-tight text-left">
            Build Faster.
            <br />
            Procure Smarter.
            <br />
            <span className="text-primary">Deliver Better.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-slate-600 max-w-xl text-left">
            Procure materials, hire contractors, manage deliveries and complete projects faster with an uncompromisingly professional platform designed for the heavy-duty demands of B2B construction.
          </p>
          {/* Quick Search */}
          <div className="relative max-w-xl mt-sm group w-full">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 z-10 text-[24px]">
              search
            </span>
            <input
              className="w-full h-16 pl-[52px] pr-[120px] rounded-md border border-slate-200 bg-white focus:border-2 focus:border-primary focus:ring-0 transition-all font-body-md text-slate-900 placeholder:text-slate-400 outline-none shadow-md"
              placeholder="Search by product, brand, or service..."
              type="text"
            />
            <button className="absolute right-sm top-1/2 -translate-y-1/2 h-12 px-lg bg-[#121212] text-white font-semibold rounded-md hover:bg-slate-800 transition-colors">
              Search
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-md mt-sm">
            <button className="h-14 px-xl bg-primary text-[#121212] font-semibold rounded-md border-0 hover:bg-[#e5ad00] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-sm">
              Get Started
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="h-14 px-xl bg-transparent border-2 border-[#1E1E1E] text-[#1E1E1E] font-semibold rounded-md hover:bg-[#1E1E1E] hover:text-white hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-sm">
              Request Bulk Quote
            </button>
          </div>
          {/* Trust Metrics (In Hero) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-md mt-xl pt-lg border-t border-slate-200">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">
                  inventory
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-slate-900 leading-none mb-0.5">
                  10,000+
                </p>
                <p className="font-label-caps text-[10px] text-slate-500">
                  Products
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <span className="material-symbols-outlined text-[20px]">
                  factory
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-slate-900 leading-none mb-0.5">
                  500+
                </p>
                <p className="font-label-caps text-[10px] text-slate-500">
                  Brands
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <span className="material-symbols-outlined text-[20px]">
                  location_city
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-slate-900 leading-none mb-0.5">
                  100+
                </p>
                <p className="font-label-caps text-[10px] text-slate-500">
                  Cities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-[20px]">
                  support_agent
                </span>
              </div>
              <div className="text-left">
                <p className="font-headline-h3 text-[18px] text-slate-900 leading-none mb-0.5">
                  24/7
                </p>
                <p className="font-label-caps text-[10px] text-slate-500">
                  Support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Floating Dashboard Mockup) */}
        <div className="lg:col-span-6 relative mt-4xl lg:mt-0 hidden md:block perspective-1000">
          <div className="relative w-full max-w-[620px] h-[700px] bg-white rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200 p-lg flex flex-col gap-md overflow-hidden transform rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out z-10 ml-auto">
            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-sm border-b border-slate-200">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-700">
                    dashboard
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="font-body-sm text-body-sm text-slate-800 font-bold">
                    Project Overview
                  </h3>
                  <p className="font-label-caps text-[10px] text-slate-500">
                    ID: PRJ-9824-X
                  </p>
                </div>
              </div>
              <div className="flex gap-xs">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
            </div>
            {/* Mockup Grid */}
            <div className="grid grid-cols-2 gap-md h-full overflow-y-auto pr-2 custom-scrollbar">
              {/* Material Orders */}
              <div className="col-span-1 bg-white rounded-md p-md border border-slate-200 flex flex-col gap-sm relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="absolute right-0 top-0 w-16 h-16 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary">
                    inventory_2
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    more_horiz
                  </span>
                </div>
                <h4 className="font-body-sm text-body-sm text-slate-700 font-bold mt-auto text-left">
                  Material Orders
                </h4>
                <div className="flex justify-between items-end">
                  <span className="font-headline-h3 text-[24px] font-bold text-slate-900 leading-none">
                    1,240
                  </span>
                  <span className="font-label-caps text-[10px] text-emerald-600 bg-emerald-50 px-xs rounded-md leading-none">
                    +12%
                  </span>
                </div>
              </div>
              {/* Delivery Tracking */}
              <div className="col-span-1 bg-white rounded-md p-0 border border-slate-200 flex flex-col relative overflow-hidden group h-[120px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNMCA1MCBRIDEwMCAxMDAgMjAwIDUwIFQgNDAwIDUwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWEwMGIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0Ii8+PC9zdmc+')] bg-cover opacity-50"></div>
                <div className="p-md flex flex-col h-full z-10 bg-gradient-to-t from-white to-transparent">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-emerald-500">
                      local_shipping
                    </span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <h4 className="font-body-sm text-body-sm text-slate-700 font-bold mt-auto text-left">
                    Active Deliveries
                  </h4>
                  <div className="flex justify-between items-end">
                    <span className="font-headline-h3 text-[24px] font-bold text-slate-900 leading-none">
                      48
                    </span>
                    <span className="font-label-caps text-[10px] text-primary bg-primary/10 px-xs rounded-md leading-none">
                      In Transit
                    </span>
                  </div>
                </div>
              </div>
              {/* Live Pricing Graph Mockup */}
              <div className="col-span-2 bg-slate-900 rounded-md p-md border border-slate-800 flex flex-col gap-sm">
                <div className="flex justify-between items-center text-white">
                  <h4 className="font-body-sm text-body-sm font-bold">
                    Live Steel Pricing
                  </h4>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    show_chart
                  </span>
                </div>
                <div className="flex-1 mt-sm relative flex items-end gap-1 h-[80px]">
                  <div className="w-full bg-white/20 h-[20%] rounded-t-sm"></div>
                  <div className="w-full bg-white/20 h-[30%] rounded-t-sm"></div>
                  <div className="w-full bg-white/20 h-[25%] rounded-t-sm"></div>
                  <div className="w-full bg-white/20 h-[45%] rounded-t-sm"></div>
                  <div className="w-full bg-white/20 h-[60%] rounded-t-sm"></div>
                  <div className="w-full bg-primary h-[85%] rounded-t-sm relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-label-caps text-[9px] px-1 rounded-md">
                      ₹65k
                    </div>
                  </div>
                  <div className="w-full bg-white/20 h-[70%] rounded-t-sm"></div>
                </div>
              </div>
              {/* Service Bookings */}
              <div className="col-span-1 bg-white rounded-md p-md border border-slate-200 flex flex-col gap-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-sm mb-sm justify-start">
                  <span className="material-symbols-outlined text-slate-500">
                    engineering
                  </span>
                  <h4 className="font-body-sm text-[12px] font-bold text-slate-800">
                    Contractors
                  </h4>
                </div>
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-sm bg-slate-50 p-xs rounded-md text-left">
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0 text-slate-700">
                      PL
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-[10px] font-bold leading-none truncate text-slate-800">
                        Plumbing Team A
                      </p>
                      <p className="font-label-caps text-[8px] text-slate-500">
                        Site 4 • Tomorrow
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm bg-slate-50 p-xs rounded-md text-left">
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold shrink-0 text-slate-700">
                      EL
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-[10px] font-bold leading-none truncate text-slate-800">
                        ElectroCorp
                      </p>
                      <p className="font-label-caps text-[8px] text-slate-500">
                        Site 2 • Ongoing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* RFQ Status */}
              <div className="col-span-1 bg-white rounded-md p-md border border-slate-200 flex flex-col gap-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-sm mb-sm justify-start">
                  <span className="material-symbols-outlined text-slate-500">
                    request_quote
                  </span>
                  <h4 className="font-body-sm text-[12px] font-bold text-slate-800">
                    Recent RFQs
                  </h4>
                </div>
                <div className="flex flex-col gap-xs">
                  <div className="flex justify-between items-center py-xs border-b border-slate-100 text-left">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                      <span className="font-body-sm text-[10px] text-slate-700 truncate max-w-[80px]">
                        UltraTech Cement
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-primary bg-primary/10 px-xs rounded-md font-bold shrink-0">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-xs border-b border-slate-100 text-left">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="font-body-sm text-[10px] text-slate-700 truncate max-w-[80px]">
                        Tata Tiscon TMT
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-emerald-600 bg-emerald-50 px-xs rounded-md font-bold shrink-0">
                      Quoted
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-xs text-left">
                    <div className="flex items-center gap-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                      <span className="font-body-sm text-[10px] text-slate-700 truncate max-w-[80px]">
                        Asian Paints 20L
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-red-600 bg-red-50 px-xs rounded-md font-bold shrink-0">
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
  );
}
