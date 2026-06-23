import { Category } from '../modules/catalog/Category';

export const defaultCategories: Category[] = [
  { id: 'plumbing', name: 'Plumbing', icon: 'plumbing', count: '2,100+ Products', href: '#/materials/plumbing' },
  { id: 'electrical', name: 'Electrical', icon: 'electrical_services', count: '3,400+ Products', href: '#/materials/electrical' },
  { id: 'interior', name: 'Interior', icon: 'weekend', count: '2,800+ Products', href: '#/materials/tiles-flooring' },
  { id: 'paints', name: 'Paints', icon: 'format_paint', count: '1,500+ Products', href: '#/materials/paints-chemicals' },
  { id: 'cement', name: 'Cement', icon: 'foundation', count: '1,200+ Products', href: '#/materials/cement-concrete' },
  { id: 'steel', name: 'Steel', icon: 'architecture', count: '850+ Products', href: '#/materials/steel-structural' },
  { id: 'hardware', name: 'Hardware', icon: 'hardware', count: '4,000+ Products', href: '#/materials/hardware-tools' },
  { id: 'safety', name: 'Safety', icon: 'health_and_safety', count: '900+ Products', href: '#/materials/building-materials' }
];
