interface Category {
  name: string
  icon: string
  count: string
}

const categories: Category[] = [
  { name: 'Cement', icon: 'foundation', count: '1,200+ Products' },
  { name: 'Steel', icon: 'architecture', count: '850+ Products' },
  { name: 'Electrical', icon: 'electrical_services', count: '3,400+ Products' },
  { name: 'Plumbing', icon: 'plumbing', count: '2,100+ Products' },
  { name: 'Paints', icon: 'format_paint', count: '1,500+ Products' },
  { name: 'Tiles', icon: 'grid_view', count: '2,800+ Products' },
  { name: 'Hardware', icon: 'hardware', count: '4,000+ Products' },
  { name: 'Safety', icon: 'health_and_safety', count: '900+ Products' },
]

export default function Categories() {
  return (
    <section className="w-full py-4xl bg-[#F9FAFB] border-t border-surface-variant">
      <div className="max-w-[1440px] mx-auto px-lg w-full flex flex-col gap-xl">
        <div className="flex flex-col items-center text-center gap-sm">
          <h2 className="font-headline-h2 text-headline-h2 text-on-surface">
            Product Categories
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            Everything You Need To Build
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-lg mt-lg">
          {categories.map((category) => (
            <a
              key={category.name}
              className="flex flex-col items-center gap-md bg-surface p-lg rounded-xl border border-surface-variant shadow-sm hover:shadow-lg hover:-translate-y-2 hover:border-primary-container transition-all duration-300 group"
              href="#"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
                <span className="material-symbols-outlined text-[32px] text-secondary group-hover:text-primary transition-colors">
                  {category.icon}
                </span>
              </div>
              <div className="text-center">
                <h3 className="font-body-sm text-body-sm font-bold text-on-surface">
                  {category.name}
                </h3>
                <p className="font-label-caps text-[10px] text-secondary mt-xs">
                  {category.count}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
