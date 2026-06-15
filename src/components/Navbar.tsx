import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 w-full h-[88px] z-50 bg-surface dark:bg-surface-dim shadow-sm transition-all duration-300 ease-in-out border-b border-surface-variant">
      <div className="flex items-center justify-between px-lg max-w-[1440px] mx-auto w-full h-full gap-xl">
        {/* Brand Logo */}
        <a className="flex items-center shrink-0" href="#">
          <img
            alt="ARCUS Groups"
            className="w-[160px] h-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzOq4Sh7N9NSRJPGZRkQk8555pFeFxwTU0RZZKd8YOcfqjlgNoyZll2b9tf_skJ1smtTfRd5onb6QcCakf9u5A3XMUvhH_bfNX39yr-mbi5KoF8JQEAkbIzWnSL7TDQuCnDnMrBfvRndOBmULuhNbY9BAJ1Ezne7W4J-3vJUt8mW1jBB-cY4gI1ZXS-kxt6ahvH3RZG0CYi2AANJGGjSSzMfqKQ5OIr09c8M_n0QfvljC7pUZEf1450MtLsllaGFiQ9Ts_7uFNUDA"
          />
        </a>

        {/* Search Bar */}
        <div className="flex-1 max-w-[480px] hidden lg:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary z-10">
              search
            </span>
            <input
              className="w-full h-12 pl-[44px] pr-md rounded-lg border-2 border-surface-variant bg-surface-container-lowest focus:border-primary-container focus:ring-0 transition-all font-body-sm text-on-surface placeholder:text-secondary-fixed-dim outline-none shadow-sm"
              placeholder="Search cement, steel, tiles, plumbers..."
              type="text"
            />
            <button className="absolute right-xs top-1/2 -translate-y-1/2 bg-surface-variant hover:bg-surface-dim text-on-surface rounded px-sm py-1 font-label-caps text-[10px] transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-lg xl:gap-xl">
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
          >
            Materials
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
          >
            Services
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
          >
            Contractors
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
          >
            Brands
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
          >
            Bulk Orders
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
          >
            Projects
          </a>
          <a
            className="text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed font-label-caps text-label-caps nav-link-hover hover:scale-105 transition-transform duration-200"
            href="#"
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
          <button className="hidden lg:flex items-center justify-center p-sm text-secondary hover:text-primary transition-colors relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -top-1 -right-1 bg-primary-container text-on-primary-fixed font-label-caps text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>
          <div className="hidden lg:block w-px h-6 bg-surface-variant mx-sm"></div>
          <button className="hidden lg:block text-secondary hover:text-primary font-label-caps text-label-caps px-sm transition-colors">
            Login
          </button>
          <button className="hidden lg:flex items-center justify-center px-md h-10 bg-inverse-surface text-inverse-on-surface font-label-caps text-label-caps rounded-lg hover:bg-on-surface transition-all duration-200 shadow-sm whitespace-nowrap">
            Register
          </button>
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
              className="w-full h-12 pl-[44px] pr-md rounded-lg border-2 border-surface-variant bg-surface-container-lowest focus:border-primary-container focus:ring-0 transition-all font-body-sm text-on-surface placeholder:text-secondary-fixed-dim outline-none shadow-sm"
              placeholder="Search..."
              type="text"
            />
          </div>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Materials
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contractors
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Brands
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bulk Orders
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2 border-b border-surface-variant"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Projects
          </a>
          <a
            className="text-secondary hover:text-primary font-label-caps text-label-caps py-2"
            href="#"
            onClick={() => setMobileMenuOpen(false)}
          >
            Resources
          </a>
          <div className="flex gap-md pt-sm">
            <button className="flex-1 py-3 border border-outline text-secondary hover:text-primary font-label-caps text-label-caps rounded-lg transition-colors">
              Login
            </button>
            <button className="flex-1 py-3 bg-inverse-surface text-inverse-on-surface font-label-caps text-label-caps rounded-lg hover:bg-on-surface transition-all">
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
