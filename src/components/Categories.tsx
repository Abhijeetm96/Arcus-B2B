import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api';

interface Category {
  name: string
  icon: string
  count: string
  href: string
}

const localCategories: Category[] = [
  { name: 'Plumbing',   icon: 'plumbing',           count: '2,100+ Products', href: '#/materials/plumbing' },
  { name: 'Electrical', icon: 'electrical_services', count: '3,400+ Products', href: '#/materials/electrical' },
  { name: 'Interior',   icon: 'weekend',             count: '2,800+ Products', href: '#/materials/tiles-flooring' },
  { name: 'Paints',     icon: 'format_paint',        count: '1,500+ Products', href: '#/materials/paints-chemicals' },
  { name: 'Cement',     icon: 'foundation',          count: '1,200+ Products', href: '#/materials/cement-concrete' },
  { name: 'Steel',      icon: 'architecture',        count: '850+ Products',   href: '#/materials/steel-structural' },
  { name: 'Hardware',   icon: 'hardware',            count: '4,000+ Products', href: '#/materials/hardware-tools' },
  { name: 'Safety',     icon: 'health_and_safety',   count: '900+ Products',   href: '#/materials/building-materials' },
]

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(localCategories)

  useEffect(() => {
    apiFetch('/admin/categories')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((cat: any) => ({
            name: cat.name,
            icon: cat.icon,
            count: cat.count || '0 Products',
            href: cat.href || `#/materials/${cat.id}`
          }))
          setCategories(mapped)
        }
      })
      .catch((err) => {
        console.warn('Backend categories endpoint offline, using local static fallback.', err)
      })
  }, [])

  return (
    <section className="w-full py-4xl bg-background border-t border-surface-variant">
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
              className="flex flex-col items-center gap-md bg-white p-lg rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:border-primary transition-all duration-300 group"
              href={category.href}
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
