interface Service {
  name: string
  desc: string
  rating: string
  countText: string
  img: string
}

const services: Service[] = [
  {
    name: 'Plumbers',
    desc: 'Experienced plumbing professionals for residential and commercial projects. Pipe installation, repair, and maintenance.',
    rating: '4.8',
    countText: '(120+ verified pros)',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9WL9qpICjVNzYuFtHP757fUi9mbJ5l25PjCC0fSwtR405W7ztmQyNL5xDnfichRI9J2CLMoocSoZgUMs1FWBY02qzv03r1Z47H8_LW-l3YbBSUxqKKdQCbe75Mk2sRcAVS0vRUkbu2-RpE0pA77RgWXCgt46E_dqoWUTZ1y1uvproA9u9iG-x2XEptJ3wrnXC2AgfA1U8sO4sVRZ9dtjMIk1LtgEweG0peZ81VUBbydzJxHEB17tzU-Kdk0k4kydWi0548ZdgT0M',
  },
  {
    name: 'Carpenters',
    desc: 'Skilled carpenters for structural woodwork, custom furniture, cabinetry, and finishing.',
    rating: '4.9',
    countText: '(85+ verified pros)',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDod9usySwzNXDejHZcE11gZeAh2DkJtUNRIL_nTJGAfWnemJND2MTdAPJEdiswkPt10MdkIkaY-9nUHRjiMYB8w6OuHygSuNWmqzd9_LHTPUZ4M-8ZBHGX8wsY9EuN5GZmMgNicwaXLiWqZI3OgF-6O978Cwaggolxtg0gGokF0v8OJcy3T7EYPuYhvxTKWaiV99m4WFCmSkFtu1gqw9Oe9pNGYq_uZy80zSpQ6G1tOJNTnjgLQUpGSpTEHv_XzSRxsNjehcCba2Q',
  },
  {
    name: 'Electricians',
    desc: 'Certified electricians for wiring, panel installation, lighting, and industrial electrical systems.',
    rating: '4.7',
    countText: '(150+ verified pros)',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOP2epZ8lqMkOHmbsu5azj5Q7gTdonEchG7VJDjYQ3nIbn3cxttTaZc8eeP02zFnaSef7Rpzb9RnhV8-QG_Mi1zwejByslRhwtBMkPSus9jVbnhYTtKPBw5A7UMBMdulnBksBr1IWgLMJW7AiwplWc_fkSAv2PvH7N8TkqEAdzInse_vcPhXFEnxR7O_tn6xjzycC4EAuYRsMDtSd8HUoWH7pe-Q3uBGwyirReqaMLy_23X5IJhiVvLxwUudd52cl0OtpgTmuuAlw',
  },
]

export default function Services() {
  return (
    <section className="w-full py-4xl bg-surface">
      <div className="max-w-[1440px] mx-auto px-lg w-full flex flex-col gap-xl">
        <div className="flex flex-col gap-sm text-left">
          <h2 className="font-headline-h2 text-headline-h2 text-on-surface">
            Expert Services
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            Hire Verified Construction Professionals
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col text-left"
            >
              <div className="h-48 bg-surface-dim relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img
                  alt={`${service.name} Services`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={service.img}
                />
                <div className="absolute bottom-md left-md z-20">
                  <h3 className="font-headline-h3 text-[24px] text-white">
                    {service.name}
                  </h3>
                </div>
              </div>
              <div className="p-md flex flex-col gap-sm flex-1">
                <p className="font-body-sm text-secondary line-clamp-2">
                  {service.desc}
                </p>
                <div className="flex items-center gap-xs mt-auto">
                  <span
                    className="material-symbols-outlined text-primary-container text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-label-caps text-[12px] font-bold">
                    {service.rating}
                  </span>
                  <span className="font-label-caps text-[12px] text-secondary">
                    {service.countText}
                  </span>
                </div>
                <button className="w-full mt-sm py-sm border border-outline-variant rounded hover:bg-surface-container transition-colors font-label-caps">
                  Book Now
                </button>
              </div>
            </div>
          ))}
          {/* CTA Card */}
          <div className="bg-primary-container border border-primary-container rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 transition-transform group flex flex-col items-center justify-center p-xl text-center md:col-span-2 lg:col-span-3 min-h-[160px]">
            <h3 className="font-headline-h3 text-on-primary-fixed mb-sm">
              Need a specialized contractor?
            </h3>
            <p className="font-body-md text-on-primary-fixed-variant mb-md max-w-2xl">
              We have hundreds of verified painters, civil contractors, masons, and project managers ready for your next big build.
            </p>
            <button className="px-xl py-md bg-inverse-surface text-inverse-on-surface font-label-caps rounded-lg hover:bg-on-surface transition-colors flex items-center gap-sm">
              View All Services
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
