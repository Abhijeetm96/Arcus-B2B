interface Service {
  name: string
  desc: string
  rating: string
  countText: string
  img: string
  link: string
  subLinks: { name: string; href: string }[]
}

const services: Service[] = [
  {
    name: 'Plumbers',
    desc: 'Experienced plumbing professionals for residential and commercial projects. Pipe installation, repair, and maintenance.',
    rating: '4.8',
    countText: '(120+ verified pros)',
    img: '/pdp_cpvc_pipe_install.png',
    link: '#/services/plumbing-services',
    subLinks: [
      { name: 'Pipe Installation', href: '#/services/plumbing-services/pipe-installation' },
      { name: 'Water Tanks', href: '#/services/plumbing-services/water-tank-services' },
      { name: 'Pumps & Fittings', href: '#/services/plumbing-services/pump-services' },
    ],
  },
  {
    name: 'Carpenters',
    desc: 'Skilled carpenters for structural woodwork, custom furniture, cabinetry, and finishing.',
    rating: '4.9',
    countText: '(85+ verified pros)',
    img: '/services_modular_kitchen.png',
    link: '#/services/carpentry-services',
    subLinks: [
      { name: 'Modular Kitchen', href: '#/services/carpentry-services/modular-kitchen' },
      { name: 'Furniture Assembly', href: '#/services/carpentry-services/furniture-assembly' },
      { name: 'Doors & Windows', href: '#/services/carpentry-services/door-window' },
    ],
  },
  {
    name: 'Electricians',
    desc: 'Certified electricians for wiring, panel installation, lighting, and industrial electrical systems.',
    rating: '4.7',
    countText: '(150+ verified pros)',
    img: '/services_washing_machine.png',
    link: '#/services/electrical-services',
    subLinks: [
      { name: 'Wiring & Cables', href: '#/services/electrical-services/wiring-cables' },
      { name: 'Switches & Sockets', href: '#/services/electrical-services/switches-sockets' },
      { name: 'Protection Devices', href: '#/services/electrical-services/protection-devices' },
    ],
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
              className="bg-white border border-surface-variant rounded-md overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-shadow group flex flex-col text-left"
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
                <div className="flex flex-wrap gap-xs my-sm">
                  {service.subLinks.map((subLink) => (
                    <a
                      key={subLink.name}
                      href={subLink.href}
                      className="text-[11px] bg-[#F8F9FA] hover:bg-primary-container text-on-surface hover:text-[#121212] transition-colors px-sm py-xs rounded font-medium border border-surface-variant"
                    >
                      {subLink.name}
                    </a>
                  ))}
                </div>
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
                <a
                  href={service.link}
                  className="w-full mt-sm py-sm bg-transparent border-2 border-[#1E1E1E] text-[#1E1E1E] font-semibold rounded-md hover:bg-[#1E1E1E] hover:text-white transition-colors font-label-caps text-center flex items-center justify-center h-10"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
          {/* CTA Card */}
          <div className="bg-primary-container border border-primary-container rounded-md overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform group flex flex-col items-center justify-center p-xl text-center md:col-span-2 lg:col-span-3 min-h-[160px]">
            <h3 className="font-headline-h3 text-on-primary-fixed mb-sm">
              Need a specialized contractor?
            </h3>
            <p className="font-body-md text-on-primary-fixed-variant mb-md max-w-2xl">
              We have hundreds of verified painters, civil contractors, masons, and project managers ready for your next big build.
            </p>
            <a
              href="#/services"
              className="px-xl py-md bg-[#121212] text-white font-semibold rounded-md hover:bg-on-surface transition-colors flex items-center gap-sm font-label-caps"
            >
              View All Services
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
