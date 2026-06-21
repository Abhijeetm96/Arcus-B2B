import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const materialsCategories = [
  {
    name: 'Plumbing',
    slug: 'plumbing',
    icon: 'plumbing',
    subcategories: ['Pipes & Fittings', 'Water Tanks', 'Valves', 'Pumps', 'Bathroom Fittings']
  },
  {
    name: 'Electrical',
    slug: 'electrical',
    icon: 'bolt',
    subcategories: ['Wires & Cables', 'Switches & Sockets', 'Protection Devices', 'Lighting & Fans']
  },
  {
    name: 'Cement & Concrete',
    slug: 'cement-concrete',
    icon: 'architecture',
    subcategories: ['OPC & PPC Cement', 'Ready Mix Concrete', 'Concrete Products']
  },
  {
    name: 'Steel & Structural',
    slug: 'steel-structural',
    icon: 'construction',
    subcategories: ['TMT Bars (Fe500+)', 'Angles & Channels', 'Beams & Mesh']
  },
  {
    name: 'Paints & Chemicals',
    slug: 'paints-chemicals',
    icon: 'format_paint',
    subcategories: ['Interior & Exterior', 'Waterproofing', 'Adhesives & Grouts']
  },
  {
    name: 'Tiles & Flooring',
    slug: 'tiles-flooring',
    icon: 'layers',
    subcategories: ['Vitrified & Ceramic', 'Granite & Marble', 'Wooden & Vinyl']
  },
  {
    name: 'Hardware & Tools',
    slug: 'hardware-tools',
    icon: 'handyman',
    subcategories: ['Fasteners & Screws', 'Hand & Power Tools', 'Safety Equipment']
  },
  {
    name: 'Building Materials',
    slug: 'building-materials',
    icon: 'home_work',
    subcategories: ['Bricks & Blocks', 'Roofing & Doors', 'Plywood & Laminates']
  }
]

const servicesCategories = [
  {
    name: 'Plumbing Services',
    slug: 'plumbing-services',
    icon: 'plumbing',
    types: ['Pipe Installation', 'Water Tank Services', 'Pump Services', 'Bathroom Fittings', 'Drainage Solutions']
  },
  {
    name: 'Electrical Services',
    slug: 'electrical-services',
    icon: 'bolt',
    types: ['Wiring Services', 'Switches & Sockets', 'Lighting Solutions', 'Power Backup', 'Electrical Maintenance']
  },
  {
    name: 'Carpentry Services',
    slug: 'carpentry-services',
    icon: 'handyman',
    types: ['Furniture Works', 'Modular Solutions', 'Doors & Windows', 'Interior Woodwork', 'Repair Services']
  },
  {
    name: 'Painting & Finishing',
    slug: 'painting-finishing',
    icon: 'format_paint',
    types: ['Interior Painting', 'Exterior Painting', 'Decorative Finishes', 'Protective Coatings', 'Surface Preparation']
  },
  {
    name: 'Civil & Construction',
    slug: 'civil-construction',
    icon: 'foundation',
    types: ['Residential Construction', 'Commercial Construction', 'Structural Works', 'Masonry Works', 'Renovation Projects']
  },
  {
    name: 'Architecture & Design',
    slug: 'architecture-design',
    icon: 'architecture',
    types: ['Architectural Design', 'Interior Design', 'Structural Design', 'Visualization', 'Consultancy']
  },
  {
    name: 'Equipment Rental',
    slug: 'equipment-rental',
    icon: 'construction',
    types: ['Earthmoving Equipment', 'Lifting Equipment', 'Concrete Equipment', 'Site Infrastructure', 'Power Equipment']
  },
  {
    name: 'Maintenance & Specialized',
    slug: 'maintenance-specialized',
    icon: 'build',
    types: ['Building Maintenance', 'Waterproofing', 'Repair Services', 'Inspection & Audits', 'Specialized Works']
  }
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartItems, cartCount, cartTotal, updateQty, removeFromCart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredMaterialsCategory, setHoveredMaterialsCategory] = useState(0)
  const [hoveredServicesCategory, setHoveredServicesCategory] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getDashboardRoute = () => {
    if (!user) return '#/auth';
    if (user.role === 'Business') return '#/business-dashboard';
    if (user.role === 'Professional') return '#/professional-dashboard';
    if (user.role === 'Admin') return '#/admin';
    return '#/account';
  };

  return (
    <header className="sticky top-0 w-full h-[88px] z-50 bg-surface dark:bg-surface-dim shadow-sm transition-all duration-300 ease-in-out border-b border-surface-variant">
      <div className="flex items-center justify-between px-lg max-w-[1440px] mx-auto w-full h-full gap-xl">
        {/* Brand Logo */}
        <a className="flex items-center shrink-0" href="#/">
          <img
            alt="ARCUS Groups"
            className="w-[160px] h-auto object-contain brightness-0"
            src="/logo.png"
          />
        </a>

        {/* Search Bar */}
        <div className="flex-1 max-w-[480px] hidden lg:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary z-10">
              search
            </span>
            <input
              className="w-full h-12 pl-[44px] pr-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 transition-all font-body-sm text-on-surface placeholder:text-secondary-fixed-dim outline-none shadow-sm"
              placeholder="Search cement, steel, tiles, plumbers..."
              type="text"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-lg xl:gap-xl">
          {/* Materials Hover Dropdown */}
          <div className="relative group py-md">
            <a
              className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-[15px] font-bold tracking-wider nav-link-hover flex items-center gap-xs cursor-pointer select-none"
              href="#/materials"
            >
              Materials
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:rotate-180">expand_more</span>
            </a>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-xs w-[720px] bg-white border border-surface-variant shadow-2xl rounded-md hidden group-hover:flex z-50 overflow-hidden text-left">
              {/* Left Column: Categories List */}
              <div className="w-[260px] bg-surface-container-low border-r border-surface-variant py-md">
                {materialsCategories.map((cat, idx) => (
                  <a
                    key={cat.slug}
                    href={`#/materials/${cat.slug}`}
                    onMouseEnter={() => setHoveredMaterialsCategory(idx)}
                    className={`flex items-center justify-between px-md py-sm transition-colors font-label-caps text-[13px] font-bold tracking-wide select-none ${
                      hoveredMaterialsCategory === idx 
                        ? 'bg-primary-container text-on-primary-container' 
                        : 'text-secondary hover:bg-surface-variant/40'
                    }`}
                  >
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                      {cat.name}
                    </div>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </a>
                ))}
              </div>
              
              {/* Right Column: Subcategories list */}
              <div className="flex-1 p-lg bg-white min-h-[340px]">
                <h4 className="font-bold text-body-md text-on-surface border-b border-surface-variant pb-xs mb-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {materialsCategories[hoveredMaterialsCategory].icon}
                  </span>
                  {materialsCategories[hoveredMaterialsCategory].name} Subcategories
                </h4>
                <div className="grid grid-cols-2 gap-sm">
                  {materialsCategories[hoveredMaterialsCategory].subcategories.map((subName) => {
                    const subSlug = subName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/\(|\)/g, '')
                    return (
                      <a
                        key={subName}
                        href={`#/materials/${materialsCategories[hoveredMaterialsCategory].slug}/${subSlug}`}
                        className="p-sm hover:bg-surface-container-low rounded-md transition-colors text-body-sm font-semibold text-secondary hover:text-primary block text-left"
                      >
                        {subName}
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Services Hover Dropdown */}
          <div className="relative group py-md">
            <a
              className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-[15px] font-bold tracking-wider nav-link-hover flex items-center gap-xs cursor-pointer select-none"
              href="#/services"
            >
              Services
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:rotate-180">expand_more</span>
            </a>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-xs w-[720px] bg-white border border-surface-variant shadow-2xl rounded-md hidden group-hover:flex flex-col z-50 overflow-hidden text-left">
              <div className="flex">
                {/* Left Column: Categories List */}
                <div className="w-[260px] bg-surface-container-low border-r border-surface-variant py-md">
                  {servicesCategories.map((cat, idx) => (
                    <a
                      key={cat.slug}
                      href={`#/services/${cat.slug}`}
                      onMouseEnter={() => setHoveredServicesCategory(idx)}
                      className={`flex items-center justify-between px-md py-sm transition-colors font-label-caps text-[13px] font-bold tracking-wide select-none ${
                        hoveredServicesCategory === idx 
                          ? 'bg-primary-container text-on-primary-container' 
                          : 'text-secondary hover:bg-surface-variant/40'
                      }`}
                    >
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                        {cat.name}
                      </div>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </a>
                  ))}
                </div>
                
                {/* Right Column: Service Types list */}
                <div className="flex-1 p-lg bg-white min-h-[340px]">
                  <h4 className="font-bold text-body-md text-on-surface border-b border-surface-variant pb-xs mb-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {servicesCategories[hoveredServicesCategory].icon}
                    </span>
                    {servicesCategories[hoveredServicesCategory].name} Service Types
                  </h4>
                  <div className="grid grid-cols-2 gap-sm">
                    {servicesCategories[hoveredServicesCategory].types.map((typeName) => {
                      const typeSlug = typeName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/\(|\)/g, '')
                      return (
                        <a
                          key={typeName}
                          href={`#/services/${servicesCategories[hoveredServicesCategory].slug}/${typeSlug}`}
                          className="p-sm hover:bg-surface-container-low rounded-md transition-colors text-body-sm font-semibold text-secondary hover:text-primary block text-left"
                        >
                          {typeName}
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Bottom Actions Row */}
              <div className="bg-surface-container border-t border-surface-variant p-md flex justify-between items-center gap-md">
                <a
                  href="#/services"
                  className="flex items-center gap-xs text-xs font-bold text-primary font-label-caps uppercase tracking-wider hover:underline"
                >
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                  Browse All Services
                </a>
                <button
                  onClick={() => alert('Simulator: Service partner registration form will release shortly.')}
                  className="flex items-center gap-xs text-xs font-bold text-primary font-label-caps uppercase tracking-wider hover:underline bg-transparent border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">handshake</span>
                  Become A Service Partner
                </button>
              </div>
            </div>
          </div>

          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-[15px] font-bold tracking-wider nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#/brands"
          >
            Brands
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-[15px] font-bold tracking-wider nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#/bulk-orders"
          >
            Bulk Orders
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-[15px] font-bold tracking-wider nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#/projects"
          >
            Projects
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-[15px] font-bold tracking-wider nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#/resources"
          >
            Resources
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-sm shrink-0">
          <button className="hidden lg:flex items-center justify-center p-sm text-secondary hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center justify-center p-sm text-secondary hover:text-primary transition-colors relative"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -top-1 -right-1 bg-primary-container text-on-primary-fixed font-label-caps text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          </button>
          <div className="hidden lg:block w-px h-6 bg-surface-variant mx-sm"></div>
          {user ? (
            <div ref={profileRef} className="hidden lg:block relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-xs cursor-pointer select-none"
              >
                <div className="w-10 h-10 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-full flex items-center justify-center border border-[#E9ECEF] hover:shadow-md transition-shadow">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-body-xs font-bold text-[#0A0A0A] leading-tight max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] text-secondary font-label-caps leading-none font-bold tracking-wide">{user.role}</span>
                </div>
                <span className={`material-symbols-outlined text-[18px] text-secondary transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-xs w-48 bg-white border border-surface-variant shadow-2xl rounded-md z-50 py-xs text-left">
                  <div className="px-md py-sm border-b border-surface-variant">
                    <p className="text-[9px] font-bold text-[#6C757D] font-label-caps uppercase tracking-wider">Account Details</p>
                    {user.companyName && (
                      <p className="text-body-xs font-semibold text-[#0A0A0A] mt-2 truncate flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm text-[#FFC107]">business</span>
                        {user.companyName}
                      </p>
                    )}
                    <p className="text-body-xs text-[#6C757D] truncate mt-1 flex items-center gap-xs">
                      <span className="material-symbols-outlined text-sm text-[#6C757D]">email</span>
                      {user.email}
                    </p>
                  </div>
                  
                  {/* Menu links based on design spec */}
                  <a
                    href={getDashboardRoute()}
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-md py-sm hover:bg-[#F8F9FA] transition-colors text-body-sm font-semibold text-[#0A0A0A] flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">dashboard</span>
                    Dashboard
                  </a>
                  <a
                    href="#/account/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-md py-sm hover:bg-[#F8F9FA] transition-colors text-body-sm font-semibold text-[#0A0A0A] flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">shopping_cart</span>
                    Orders
                  </a>
                  {user && ['Business', 'Professional', 'Contractor', 'Supplier'].includes(user.role) && (
                    <a
                      href="#/account/rfqs"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-md py-sm hover:bg-[#F8F9FA] transition-colors text-body-sm font-semibold text-[#0A0A0A] flex items-center gap-sm"
                    >
                      <span className="material-symbols-outlined text-[20px] text-secondary">receipt_long</span>
                      RFQs
                    </a>
                  )}
                  <a
                    href="#/account/saved"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-md py-sm hover:bg-[#F8F9FA] transition-colors text-body-sm font-semibold text-[#0A0A0A] flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">bookmark</span>
                    Saved Items
                  </a>
                  <a
                    href="#/account/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-md py-sm hover:bg-[#F8F9FA] transition-colors text-body-sm font-semibold text-[#0A0A0A] flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-[20px] text-secondary">settings</span>
                    Settings
                  </a>
                  
                  <div className="h-px bg-surface-variant my-xs"></div>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      window.location.hash = '#/auth?tab=login';
                    }}
                    className="w-full text-left px-md py-sm hover:bg-[#F8F9FA] transition-colors text-body-sm font-semibold text-red-600 flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href="#/auth?tab=login"
                className="hidden lg:block text-secondary hover:text-primary font-label-caps text-[15px] font-bold tracking-wider px-sm transition-colors cursor-pointer"
              >
                Login
              </a>
              <a
                href="#/auth?tab=register"
                className="hidden lg:flex items-center justify-center px-md h-10 bg-[#121212] text-white font-semibold rounded-md hover:bg-on-surface transition-all duration-200 shadow-sm whitespace-nowrap"
              >
                Register
              </a>
            </>
          )}
          <button
            className="md:hidden flex items-center justify-center p-sm text-on-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-[28px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[88px] left-0 w-full bg-surface border-b border-surface-variant z-40 p-lg shadow-lg flex flex-col gap-md">
          {/* Search bar inside mobile menu */}
          <div className="relative group w-full mb-sm">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary z-10">
              search
            </span>
            <input
              className="w-full h-12 pl-[44px] pr-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 transition-all font-body-sm text-on-surface placeholder:text-secondary-fixed-dim outline-none shadow-sm"
              placeholder="Search..."
              type="text"
            />
          </div>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant text-left"
            href="#/materials"
            onClick={() => setMobileMenuOpen(false)}
          >
            Materials
          </a>
          <div className="flex flex-col gap-xs pl-sm text-left pb-sm border-b border-surface-variant">
            <span className="font-bold text-[10px] uppercase text-secondary tracking-widest">Materials Categories</span>
            <div className="grid grid-cols-2 gap-sm text-[12px] pt-xs">
              <a href="#/materials/cement-concrete" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Cement &amp; Concrete</a>
              <a href="#/materials/steel-structural" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Steel &amp; Structural</a>
              <a href="#/materials/plumbing" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Plumbing</a>
              <a href="#/materials/electrical" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Electrical</a>
              <a href="#/materials/paints-chemicals" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Paints &amp; Waterproofing</a>
              <a href="#/materials/tiles-flooring" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Tiles &amp; Flooring</a>
            </div>
          </div>
          
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant text-left"
            href="#/services"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </a>
          <div className="flex flex-col gap-xs pl-sm text-left pb-sm border-b border-surface-variant">
            <span className="font-bold text-[10px] uppercase text-secondary tracking-widest">Services Categories</span>
            <div className="grid grid-cols-2 gap-sm text-[12px] pt-xs">
              <a href="#/services/plumbing" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Plumbing Services</a>
              <a href="#/services/electrical" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Electrical Services</a>
              <a href="#/services/carpentry" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Carpentry &amp; Woodwork</a>
              <a href="#/services/painting" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Painting &amp; Polishing</a>
              <a href="#/services/civil" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Civil Construction</a>
              <a href="#/services/architecture" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors font-medium">Architecture &amp; Design</a>
            </div>
          </div>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#/brands"
            onClick={() => setMobileMenuOpen(false)}
          >
            Brands
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#/bulk-orders"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bulk Orders
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#/projects"
            onClick={() => setMobileMenuOpen(false)}
          >
            Projects
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2"
            href="#/resources"
            onClick={() => setMobileMenuOpen(false)}
          >
            Resources
          </a>
          {user ? (
            <div className="border-t border-surface-variant pt-sm flex flex-col gap-sm text-left">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-full flex items-center justify-center border border-[#E9ECEF] text-[18px]">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-body-md font-bold text-[#0A0A0A]">{user.name}</span>
                  <span className="text-xs text-[#6C757D] font-label-caps font-bold tracking-wider">{user.role}</span>
                  {user.companyName && (
                    <span className="text-xs text-[#6C757D] mt-1 flex items-center gap-xs">
                      <span className="material-symbols-outlined text-xs text-[#FFC107]">business</span>
                      {user.companyName}
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Profile Sub-links */}
              <div className="grid grid-cols-2 gap-sm text-xs font-semibold py-xs border-t border-b border-surface-variant my-xs">
                <a href={getDashboardRoute()} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-xs p-xs hover:bg-[#F8F9FA] rounded"><span className="material-symbols-outlined text-[18px] text-secondary">dashboard</span> Dashboard</a>
                <a href="#/account/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-xs p-xs hover:bg-[#F8F9FA] rounded"><span className="material-symbols-outlined text-[18px] text-secondary">shopping_cart</span> Orders</a>
                {user && ['Business', 'Professional', 'Contractor', 'Supplier'].includes(user.role) && (
                  <a href="#/account/rfqs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-xs p-xs hover:bg-[#F8F9FA] rounded"><span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span> RFQs</a>
                )}
                <a href="#/account/saved" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-xs p-xs hover:bg-[#F8F9FA] rounded"><span className="material-symbols-outlined text-[18px] text-secondary">bookmark</span> Saved Items</a>
                <a href="#/account/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-xs p-xs hover:bg-[#F8F9FA] rounded"><span className="material-symbols-outlined text-[18px] text-secondary">settings</span> Settings</a>
              </div>

              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                  window.location.hash = '#/auth?tab=login'
                }}
                className="w-full py-3 bg-transparent border-2 border-red-600 text-red-600 font-semibold rounded-md hover:bg-red-50 transition-colors flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-md pt-sm">
              <a
                href="#/auth?tab=login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-3 bg-transparent border-2 border-[#1E1E1E] text-[#1E1E1E] text-center font-semibold rounded-md hover:bg-[#1E1E1E] hover:text-white transition-colors"
              >
                Login
              </a>
              <a
                href="#/auth?tab=register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-3 bg-[#121212] text-white text-center font-semibold rounded-md hover:bg-on-surface transition-all"
              >
                Register
              </a>
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-xl border-b border-surface-variant flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">shopping_cart</span>
            <h3 className="font-bold text-body-lg text-on-surface">Your Procurement Cart</h3>
            <span className="bg-primary-container text-on-primary-container text-xs font-bold px-md py-0.5 rounded-full">
              {cartCount}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-sm text-secondary hover:text-primary transition-colors flex items-center justify-center rounded-full hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-xl space-y-md">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-md">
              <span className="material-symbols-outlined text-[64px] text-secondary">shopping_cart_off</span>
              <div>
                <p className="font-bold text-body-md text-on-surface">Your cart is empty</p>
                <p className="text-secondary text-xs mt-xs">Add materials from our catalog to request quotes or buy.</p>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); window.location.hash = '#/materials'; }}
                className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] font-bold px-lg py-md rounded-xl text-body-sm transition-all shadow-sm w-full"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-md p-md border border-surface-variant rounded-2xl bg-[#F8F9FA] relative group hover:border-primary-container transition-all">
                {/* Item Image */}
                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-surface-variant">
                  <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                </div>

                {/* Item details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                  <div>
                    <h4 className="font-bold text-body-sm text-on-surface truncate pr-xl">{item.name}</h4>
                    <p className="text-secondary text-xs mt-xs">{item.categoryTitle}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-sm">
                    {/* Qty Counter */}
                    <div className="flex items-center border border-surface-variant bg-white rounded-lg scale-90 origin-left">
                      <button 
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="px-sm py-xs text-secondary hover:text-primary font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-sm py-xs text-secondary hover:text-primary font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-body-sm text-on-surface">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-secondary">₹{item.price.toFixed(2)} {item.unit}</p>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-md right-md text-secondary hover:text-error transition-colors p-xs rounded-full hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer (Subtotal & Actions) */}
        {cartItems.length > 0 && (
          <div className="p-xl border-t border-surface-variant bg-[#F8F9FA] space-y-xl text-left">
            <div className="space-y-sm">
              <div className="flex justify-between items-center text-body-sm text-secondary">
                <span>Items Subtotal</span>
                <span className="font-bold text-on-surface">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-body-sm text-secondary">
                <span>Logistics / GST estimate</span>
                <span className="text-xs">Calculated at Checkout</span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-surface-variant pt-md font-bold text-on-surface">
                <span>Estimated Total</span>
                <span className="text-primary text-headline-h3 leading-none">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-md">
              <button 
                onClick={() => { setIsCartOpen(false); window.location.hash = '#/checkout'; }}
                className="flex-1 bg-primary-container text-on-primary-container hover:bg-[#fabd00] h-14 rounded-xl font-bold flex items-center justify-center gap-sm transition-all shadow-md text-body-sm"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
