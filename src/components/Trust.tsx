interface TrustFactor {
  title: string
  desc: string
  icon: string
}

const trustFactors: TrustFactor[] = [
  {
    title: '100% Verified Suppliers',
    desc: 'Every seller undergoes strict KYC and quality checks.',
    icon: 'verified_user',
  },
  {
    title: 'Secure Payments',
    desc: 'Escrow-backed payments ensure your money is safe until delivery.',
    icon: 'payments',
  },
  {
    title: 'Fast Reliable Delivery',
    desc: 'Optimized logistics network for on-time site deliveries.',
    icon: 'local_shipping',
  },
  {
    title: 'Easy Returns & Claims',
    desc: 'Hassle-free dispute resolution for damaged or incorrect goods.',
    icon: 'assignment_return',
  },
]

export default function Trust() {
  return (
    <section className="w-full py-xxl bg-surface border-b border-surface-variant">
      <div className="max-w-[1440px] mx-auto px-lg w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
          {trustFactors.map((factor) => (
            <div
              key={factor.title}
              className="flex flex-col items-center text-center gap-sm p-md"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-fixed-dim mb-xs">
                <span className="material-symbols-outlined text-[24px]">
                  {factor.icon}
                </span>
              </div>
              <h4 className="font-body-sm font-bold text-on-surface">
                {factor.title}
              </h4>
              <p className="font-label-caps text-[10px] text-secondary normal-case leading-relaxed">
                {factor.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
