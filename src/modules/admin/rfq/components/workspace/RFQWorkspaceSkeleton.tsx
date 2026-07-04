export function RFQWorkspaceSkeleton() {
  return (
    <div className="w-full space-y-6 text-left select-none animate-pulse">
      {/* View Switcher skeleton */}
      <div className="h-14 bg-slate-200 border border-slate-100 rounded-xl w-full" />

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 h-36 flex flex-col justify-between">
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            <div className="space-y-2 mt-4">
              <div className="h-2 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-12 bg-slate-200 rounded-full mt-2" />
          </div>
        ))}
      </div>

      {/* Main Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Work Queue skeleton */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 h-96 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-2 w-16 bg-slate-200 rounded" />
            </div>
            <div className="space-y-4 py-4 flex-grow">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                    <div className="h-2.5 w-48 bg-slate-200 rounded" />
                  </div>
                  <div className="h-7 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Actions skeleton */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 h-52 flex flex-col justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
