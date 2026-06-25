import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { getCachedSearch, setCachedSearch } from '../core/config/searchCache'

interface Product {
  id: string
  productId: string
  sku: string
  brand: string
  model: string
  name: string
  description?: string
  categoryId: string
  subcategorySlug?: string
  leafSlug?: string
  price: number
  unitOfMeasure: string
  hsnCode?: string
  gstRate?: number
  inventory: {
    available: number
    reserved: number
    reorderLevel: number
  }
  minimumOrderQuantity?: number
  leadTimeDays?: number
  procurementPrice?: number
  vendorName?: string
  vendorProductCode?: string
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'COMING_SOON'
  specifications?: Record<string, string>
  images?: string[]
  rating?: string
  priceTiers?: { min: number; max: number; price: number; save: number }[]
  categoryTitle?: string
  unit?: string
  stock?: number
  link?: string
  icon?: string
}

interface ServiceItem {
  name: string
  slug: string
  price: string
  desc: string
  categorySlug: string
  typeSlug: string
  path: string
}

interface Professional {
  id: string
  name: string
  company: string
  specializations: string[]
  startingPrice: string
  responseTime: string
  city: string
}

interface SearchCategory {
  id: string
  name: string
  path: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [categories, setCategories] = useState<SearchCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services' | 'professionals'>('all')
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<string>('Relevance')

  // UI states
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [rfqProduct, setRfqProduct] = useState<Product | null>(null)
  const [rfqSubmitted, setRfqSubmitted] = useState(false)
  const [rfqError, setRfqError] = useState('')
  const [rfqFormData, setRfqFormData] = useState({
    name: '',
    phone: '',
    category: 'Cement',
    quantity: '100 Bags',
    location: '',
    timeline: 'Immediate (1-3 Days)',
    details: '',
    title: '',
    budget: ''
  })

  const { addToCart } = useCart()

  // Parse search query from location hash
  useEffect(() => {
    const parseQuery = () => {
      const hash = window.location.hash
      const queryIndex = hash.indexOf('?')
      if (queryIndex !== -1) {
        const params = new URLSearchParams(hash.substring(queryIndex))
        setQuery(params.get('q') || '')
      } else {
        setQuery('')
      }
    }
    parseQuery()
    window.addEventListener('hashchange', parseQuery)
    return () => window.removeEventListener('hashchange', parseQuery)
  }, [])

  // Fetch results from backend when query changes
  useEffect(() => {
    if (!query) {
      setProducts([])
      setServices([])
      setProfessionals([])
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    // Clear previous filters when a new query is searched
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedPrices([])
    setSelectedAvailability([])
    setSortOption('Relevance')
    setActiveTab('all')

    const cached = getCachedSearch(query)
    if (cached) {
      setProducts(Array.isArray(cached.products) ? cached.products : [])
      setServices(Array.isArray(cached.services) ? cached.services : [])
      setProfessionals(Array.isArray(cached.professionals) ? cached.professionals : [])
      setCategories(Array.isArray(cached.categories) ? cached.categories : [])
      setLoading(false)
      return
    }

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Search failed. Server error.')
        return res.json()
      })
      .then((data) => {
        setCachedSearch(query, data)
        setProducts(Array.isArray(data?.products) ? data.products : [])
        setServices(Array.isArray(data?.services) ? data.services : [])
        setProfessionals(Array.isArray(data?.professionals) ? data.professionals : [])
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching search results:', err)
        setError('Failed to load search results. Please try again.')
        setLoading(false)
      })
  }, [query])

  // Click tracking
  const handleProductClick = async (product: Product) => {
    try {
      await fetch('/api/search/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, query })
      })
    } catch (e) {
      console.warn('Could not log search click:', e)
    }
  }

  // Get unique categories and brands from matching products for filters
  const uniqueCategories = Array.from(
    new Set((Array.isArray(products) ? products : []).map((p) => p?.categoryTitle || 'Materials'))
  ).filter(Boolean)

  const uniqueBrands = Array.from(
    new Set((Array.isArray(products) ? products : []).map((p) => p?.brand || 'Generic'))
  ).filter(Boolean)

  // Quantity controls
  const incrementQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1
    }))
  }

  const decrementQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1)
    }))
  }

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1
    const defaultImage = product.images && product.images.length > 0
      ? product.images[0]
      : '/pdp_cpvc_pipe_main.png'

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unitOfMeasure || product.unit || '/ Piece',
        images: [defaultImage],
        categoryTitle: product.categoryTitle || 'Materials',
        priceTiers: product.priceTiers,
        stock: product.stock !== undefined ? product.stock : product.inventory?.available
      },
      qty
    )

    setToastMessage(`Added ${qty} x ${product.name} to cart!`)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Open RFQ Modal
  const openRfqModal = (product: Product) => {
    setRfqProduct(product)
    setRfqSubmitted(false)
    setRfqError('')
    
    // Autofill form
    setRfqFormData({
      name: '',
      phone: '',
      category: product?.categoryTitle || 'Cement',
      quantity: `${product?.minimumOrderQuantity || 1} ${(product?.unitOfMeasure || '').replace('/', '') || 'Units'}`,
      location: '',
      timeline: 'Immediate (1-3 Days)',
      title: `Quote Request for ${product?.name ?? 'Product'}`,
      budget: String((product?.price ?? 0) * (product?.minimumOrderQuantity || 1)),
      details: `Product Details:\n- Name: ${product?.name ?? 'N/A'}\n- Brand: ${product?.brand ?? 'N/A'}\n- Model: ${product?.model ?? 'N/A'}\n- SKU: ${product?.sku ?? 'N/A'}\n- Specs: ${
        product?.specifications ? Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join(', ') : 'N/A'
      }`
    })
  }

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRfqError('')

    if (!rfqFormData.name.trim()) {
      setRfqError('Contact name is required.')
      return
    }
    if (!rfqFormData.phone.trim()) {
      setRfqError('Phone number is required.')
      return
    }

    try {
      const token = localStorage.getItem('arcus_token')
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(rfqFormData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit quote request.')
      }

      setRfqSubmitted(true)
    } catch (err: any) {
      console.error('Error submitting RFQ:', err)
      // Fallback in case backend is offline
      setRfqSubmitted(true)
    }
  }

  // Filtering Logic
  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) => {
    if (!product) return false
    // 1. Category Filter
    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      const cat = product.categoryTitle || 'Materials'
      if (!selectedCategories.includes(cat)) return false
    }

    // 2. Brand Filter
    if (Array.isArray(selectedBrands) && selectedBrands.length > 0) {
      const br = product.brand || 'Generic'
      if (!selectedBrands.includes(br)) return false
    }

    // 3. Price Filter
    if (Array.isArray(selectedPrices) && selectedPrices.length > 0) {
      const price = product.price ?? 0
      const matchesPrice = selectedPrices.some((bucket) => {
        if (bucket === 'Under ₹500') return price < 500
        if (bucket === '₹500 – ₹2,000') return price >= 500 && price <= 2000
        if (bucket === '₹2,000 – ₹10,000') return price >= 2000 && price <= 10000
        if (bucket === 'Above ₹10,000') return price > 10000
        return false
      })
      if (!matchesPrice) return false
    }

    // 4. Availability Filter
    if (Array.isArray(selectedAvailability) && selectedAvailability.length > 0) {
      const avail = product.inventory?.available ?? product.stock ?? 0
      const status = product.status ?? 'ACTIVE'
      const matchesAvail = selectedAvailability.some((bucket) => {
        if (bucket === 'In Stock') return status === 'ACTIVE' && avail > 10
        if (bucket === 'Limited Stock') return status === 'ACTIVE' && avail <= 10 && avail > 0
        if (bucket === 'Out Of Stock') return status === 'OUT_OF_STOCK' || avail === 0
        if (bucket === 'Coming Soon') return status === 'COMING_SOON'
        return false
      })
      if (!matchesAvail) return false
    }

    return true
  })

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!a || !b) return 0
    const priceA = a.price ?? 0
    const priceB = b.price ?? 0
    if (sortOption === 'Price Low to High') {
      return priceA - priceB
    }
    if (sortOption === 'Price High to Low') {
      return priceB - priceA
    }
    if (sortOption === 'Rating') {
      const rA = parseFloat(a.rating || '0')
      const rB = parseFloat(b.rating || '0')
      return rB - rA
    }
    // Relevance / Default: Keep the backend order (which is sorted by relevance score)
    return 0
  })

  // Fallback featured products for No Results page
  const featuredRecommendations = [
    {
      id: 'astral-cpvc-pipe',
      name: 'Astral CPVC Pipe',
      brand: 'Astral Pipes',
      price: 280,
      unitOfMeasure: '/ Piece',
      rating: '4.8',
      image: '/pdp_cpvc_pipe_main.png',
      desc: 'High-temperature CPVC pipe for hot and cold water distribution.'
    },
    {
      id: 'supreme-elbow-90',
      name: 'Supreme Elbow 90°',
      brand: 'Supreme',
      price: 24,
      unitOfMeasure: '/ Unit',
      rating: '4.7',
      image: '/pdp_supreme_elbow.png',
      desc: 'Standard lead-free PVC 90 degree elbow for water lines.'
    },
    {
      id: 'finolex-wire',
      name: 'Finolex Wire',
      brand: 'Finolex',
      price: 1250,
      unitOfMeasure: '/ Coil',
      rating: '4.8',
      image: '/pdp_finolex_wire.png',
      desc: 'Flame retardant 1.5 sq mm PVC insulated copper wire.'
    },
    {
      id: 'ultratech-cement',
      name: 'UltraTech Cement',
      brand: 'UltraTech Cement',
      price: 450,
      unitOfMeasure: '/ Bag',
      rating: '4.8',
      image: '/pdp_ultratech_cement.png',
      desc: 'Premium 53 Grade OPC cement for high strength structures.'
    }
  ]

  // RENDER LOADING
  if (loading) {
    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          <div className="h-6 w-48 bg-[#E9ECEF] rounded animate-pulse mb-xl"></div>
          <div className="h-10 w-96 bg-[#E9ECEF] rounded animate-pulse mb-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
            <div className="lg:col-span-1 bg-[#F8F9FA] rounded-[24px] border border-[#E9ECEF] p-xl h-96 animate-pulse"></div>
            <div className="lg:col-span-3 space-y-xl">
              <div className="flex justify-between items-center pb-md border-b border-[#E9ECEF]">
                <div className="h-5 w-40 bg-[#E9ECEF] rounded animate-pulse"></div>
                <div className="h-8 w-48 bg-[#E9ECEF] rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-[#E9ECEF] rounded-[24px] h-[400px] p-lg flex flex-col justify-between animate-pulse">
                    <div className="w-full aspect-square bg-[#E9ECEF] rounded-lg"></div>
                    <div className="h-4 bg-[#E9ECEF] rounded w-2/3 mt-md"></div>
                    <div className="h-6 bg-[#E9ECEF] rounded w-1/3 mt-sm"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RENDER NO RESULTS EXPERIENCE
  if (products.length === 0 && services.length === 0 && professionals.length === 0) {
    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/" className="hover:text-primary transition-colors">Home</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A]">Search</span>
          </nav>

          <div className="text-center py-[64px] px-lg bg-surface-container rounded-[32px] border border-[#E9ECEF] flex flex-col items-center justify-center gap-lg shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px] text-red-500">search_off</span>
            </div>
            <div className="space-y-xs">
              <h2 className="font-headline-h2 text-[28px] font-extrabold text-[#0A0A0A]">
                No Results Found
              </h2>
              <p className="text-secondary font-body-md max-w-lg mx-auto">
                We couldn't find any products matching "{query}". Try checking your spelling or use more general keywords.
              </p>
            </div>

            {/* Popular Searches */}
            <div className="space-y-sm mt-md w-full max-w-xl">
              <p className="font-label-caps text-xs text-[#6C757D] font-bold uppercase tracking-wider">
                Popular Searches
              </p>
              <div className="flex flex-wrap justify-center gap-sm">
                {['CPVC Pipes', 'Electrical Wires', 'TMT Bars', 'UltraTech Cement'].map((term) => (
                  <a
                    key={term}
                    href={`#/search?q=${encodeURIComponent(term)}`}
                    className="px-lg py-sm bg-white border border-surface-variant hover:border-primary hover:bg-primary-container/10 text-on-surface font-semibold rounded-full text-body-sm transition-all shadow-sm no-underline"
                  >
                    {term}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Related Categories */}
          <div className="mt-5xl space-y-xl">
            <h3 className="font-headline-h3 text-[24px] font-bold text-[#0A0A0A] tracking-tight">
              Browse Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {[
                { name: 'Plumbing', slug: 'plumbing', icon: 'plumbing', bg: 'bg-[#FFC107]/5' },
                { name: 'Electrical', slug: 'electrical', icon: 'bolt', bg: 'bg-blue-50/50' },
                { name: 'Cement & Concrete', slug: 'cement-concrete', icon: 'architecture', bg: 'bg-green-50/50' },
                { name: 'Steel & Structural', slug: 'steel-structural', icon: 'construction', bg: 'bg-purple-50/50' },
                { name: 'Paints & Chemicals', slug: 'paints-chemicals', icon: 'format_paint', bg: 'bg-pink-50/50' },
                { name: 'Tiles & Flooring', slug: 'tiles-flooring', icon: 'layers', bg: 'bg-orange-50/50' },
                { name: 'Hardware & Tools', slug: 'hardware-tools', icon: 'handyman', bg: 'bg-teal-50/50' },
                { name: 'Building Materials', slug: 'building-materials', icon: 'home_work', bg: 'bg-amber-50/50' }
              ].map((cat) => (
                <a
                  key={cat.slug}
                  href={`#/materials/${cat.slug}`}
                  className={`${cat.bg} p-lg rounded-[24px] border border-surface-variant/70 hover:border-primary hover:shadow-md transition-all duration-300 flex items-center gap-md group no-underline text-on-surface`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E9ECEF] flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary text-[24px] group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-body-sm text-[#0A0A0A]">{cat.name}</p>
                    <p className="text-[11px] text-secondary">View Products</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Featured Recommendations */}
          <div className="mt-5xl space-y-xl">
            <h3 className="font-headline-h3 text-[24px] font-bold text-[#0A0A0A] tracking-tight">
              Featured Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              {featuredRecommendations.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-[24px] border border-[#E9ECEF] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group text-left"
                >
                  <div>
                    <div className="aspect-square bg-[#F8F9FA] rounded-[16px] overflow-hidden flex items-center justify-center border border-[#E9ECEF] relative">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider">
                        {prod.brand}
                      </span>
                    </div>
                    <h4 className="font-bold text-body-sm leading-tight text-[#0A0A0A] mt-lg">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-[#6C757D] leading-relaxed mt-xs line-clamp-2">
                      {prod.desc}
                    </p>
                  </div>
                  <div className="mt-md border-t border-[#E9ECEF] pt-md space-y-md">
                    <div className="flex justify-between items-baseline">
                      <p className="font-headline-h3 text-[20px] font-black text-primary">
                        ₹{prod.price.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-[#6C757D] font-normal">{prod.unitOfMeasure}</span>
                      </p>
                    </div>
                    <a
                      href={`#/product/${prod.id}`}
                      className="w-full py-sm bg-[#121212] text-white text-xs font-bold rounded-xl hover:bg-[#fabd00] hover:text-[#121212] transition-colors flex items-center justify-center gap-xs no-underline text-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      View Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RENDER MAIN RESULTS PAGE
  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
      <div className="max-w-[1440px] mx-auto px-lg">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
          <a href="#/" className="hover:text-primary transition-colors">Home</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0A0A0A]">Search Results</span>
        </nav>

        <h1 className="font-headline-h1 text-[36px] font-extrabold text-[#0A0A0A] mb-xl tracking-tight">
          Search Results for "{query}"
        </h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-md text-red-700 text-sm rounded-lg mb-xl">
            {error}
          </div>
        )}

        {/* Matching Categories Section */}
        {categories.length > 0 && (
          <div className="mb-xl">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-sm">
              Matching Categories
            </span>
            <div className="flex flex-wrap gap-sm">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={cat.path}
                  className="px-lg py-sm bg-[#F8F9FA] hover:bg-primary-container/20 border border-[#E9ECEF] hover:border-primary text-on-surface font-semibold rounded-full text-body-sm transition-all no-underline flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {cat.path.includes('/services/') ? 'engineering' : 'category'}
                  </span>
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-[#E9ECEF] mb-xl overflow-x-auto gap-md scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-md font-bold text-body-sm transition-all border-b-2 cursor-pointer outline-none shrink-0 ${
              activeTab === 'all'
                ? 'border-primary text-[#0A0A0A]'
                : 'border-transparent text-secondary hover:text-[#0A0A0A]'
            }`}
          >
            All Results ({products.length + services.length + professionals.length})
          </button>
          
          {products.length > 0 && (
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-md font-bold text-body-sm transition-all border-b-2 cursor-pointer outline-none shrink-0 ${
                activeTab === 'products'
                  ? 'border-primary text-[#0A0A0A]'
                  : 'border-transparent text-secondary hover:text-[#0A0A0A]'
              }`}
            >
              Products ({products.length})
            </button>
          )}

          {services.length > 0 && (
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-md font-bold text-body-sm transition-all border-b-2 cursor-pointer outline-none shrink-0 ${
                activeTab === 'services'
                  ? 'border-primary text-[#0A0A0A]'
                  : 'border-transparent text-secondary hover:text-[#0A0A0A]'
              }`}
            >
              Services ({services.length})
            </button>
          )}

          {professionals.length > 0 && (
            <button
              onClick={() => setActiveTab('professionals')}
              className={`pb-md font-bold text-body-sm transition-all border-b-2 cursor-pointer outline-none shrink-0 ${
                activeTab === 'professionals'
                  ? 'border-primary text-[#0A0A0A]'
                  : 'border-transparent text-secondary hover:text-[#0A0A0A]'
              }`}
            >
              Professionals ({professionals.length})
            </button>
          )}
        </div>

        <div className="space-y-4xl">
          {/* Services Section */}
          {(activeTab === 'all' || activeTab === 'services') && services.length > 0 && (
            <div className="space-y-xl">
              {activeTab === 'all' && (
                <div className="flex items-center justify-between pb-md border-b border-[#E9ECEF]">
                  <h2 className="font-headline-h2 text-[24px] font-extrabold text-[#0A0A0A]">
                    Matching Services ({services.length})
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {services.map((service, idx) => (
                  <div key={idx} className="bg-white border border-[#E9ECEF] rounded-[24px] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary transition-all duration-300 flex flex-col justify-between group text-left">
                    <div>
                      <div className="flex items-center gap-md mb-md">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[24px]">
                            {service.categorySlug === 'plumbing-services' ? 'plumbing' :
                             service.categorySlug === 'electrical-services' ? 'bolt' :
                             service.categorySlug === 'painting-finishing' ? 'format_paint' :
                             service.categorySlug === 'civil-construction' ? 'construction' :
                             service.categorySlug === 'carpentry-services' ? 'handyman' :
                             'engineering'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-body-sm text-[#0A0A0A] leading-tight group-hover:text-primary transition-colors">
                            {service.name}
                          </h4>
                          <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">
                            {(service.categorySlug || '').replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed line-clamp-3">
                        {service.desc}
                      </p>
                    </div>
                    
                    <div className="mt-md border-t border-[#E9ECEF] pt-md flex items-center justify-between gap-md">
                      <div>
                        <span className="text-[10px] text-secondary font-medium block">Starting from</span>
                        <span className="text-body-md font-extrabold text-[#0A0A0A]">{service.price}</span>
                      </div>
                      <a
                        href={service.path}
                        className="px-lg py-sm bg-[#121212] text-white text-xs font-bold rounded-xl hover:bg-primary hover:text-[#121212] transition-all no-underline"
                      >
                        Book Service
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professionals Section */}
          {(activeTab === 'all' || activeTab === 'professionals') && professionals.length > 0 && (
            <div className="space-y-xl">
              {activeTab === 'all' && (
                <div className="flex items-center justify-between pb-md border-b border-[#E9ECEF]">
                  <h2 className="font-headline-h2 text-[24px] font-extrabold text-[#0A0A0A]">
                    Matching Professionals ({professionals.length})
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {professionals.map((pro, idx) => (
                  <div key={idx} className="bg-white border border-[#E9ECEF] rounded-[24px] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary transition-all duration-300 flex flex-col justify-between group text-left">
                    <div>
                      <div className="flex items-center justify-between mb-md">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-green-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Verified Pro</span>
                        </div>
                        <span className="text-[11px] text-secondary flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {pro.city}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-body-md text-[#0A0A0A] group-hover:text-primary transition-colors">
                        {pro.name}
                      </h4>
                      <p className="text-xs text-secondary font-medium mb-md">{pro.company}</p>
                      
                      {Array.isArray(pro.specializations) && pro.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-xs mb-md">
                          {pro.specializations.map((spec: string, idx: number) => (
                            <span key={idx} className="px-sm py-0.5 bg-[#F8F9FA] border border-[#E9ECEF] text-secondary rounded-full text-[10px] font-semibold">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-md border-t border-[#E9ECEF] pt-md flex items-center justify-between gap-md">
                      <div>
                        <span className="text-[10px] text-secondary font-medium block">Response Time</span>
                        <span className="text-xs font-bold text-emerald-600">{pro.responseTime || 'Within 1 Hour'}</span>
                      </div>
                      <a
                        href={`#/services/contractors/${pro.id}`}
                        className="px-lg py-sm border border-[#121212] text-[#121212] text-xs font-bold rounded-xl hover:bg-surface-variant/20 transition-all no-underline"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {(activeTab === 'all' || activeTab === 'products') && products.length > 0 && (
            <div className="space-y-xl">
              {activeTab === 'all' && (
                <div className="flex items-center justify-between pb-md border-b border-[#E9ECEF]">
                  <h2 className="font-headline-h2 text-[24px] font-extrabold text-[#0A0A0A]">
                    Matching Products ({products.length})
                  </h2>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
                {/* Sidebar Filters */}
                <div className="lg:col-span-1 bg-[#F8F9FA] rounded-[24px] border border-[#E9ECEF] p-xl h-fit space-y-xl shadow-sm">
                  <div className="flex justify-between items-center pb-md border-b border-[#E9ECEF]">
                    <h3 className="font-bold text-body-md text-[#0A0A0A] flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[20px]">filter_list</span> Filters
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCategories([])
                        setSelectedBrands([])
                        setSelectedPrices([])
                        setSelectedAvailability([])
                      }}
                      className="text-xs text-primary font-bold hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Categories Filter */}
                  {uniqueCategories.length > 1 && (
                    <div className="space-y-md">
                      <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Categories</p>
                      <div className="space-y-sm max-h-48 overflow-y-auto pr-xs">
                        {uniqueCategories.map((cat) => (
                          <label key={cat} className="flex items-center gap-sm cursor-pointer select-none text-body-sm font-medium">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedCategories([...selectedCategories, cat])
                                else setSelectedCategories(selectedCategories.filter((c) => c !== cat))
                              }}
                              className="rounded border-[#CED4DA] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands Filter */}
                  {uniqueBrands.length > 1 && (
                    <div className="space-y-md border-t border-[#E9ECEF] pt-md">
                      <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Brands</p>
                      <div className="space-y-sm max-h-48 overflow-y-auto pr-xs">
                        {uniqueBrands.map((brand) => (
                          <label key={brand} className="flex items-center gap-sm cursor-pointer select-none text-body-sm font-medium">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedBrands([...selectedBrands, brand])
                                else setSelectedBrands(selectedBrands.filter((b) => b !== brand))
                              }}
                              className="rounded border-[#CED4DA] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                            {brand}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Filter Buckets */}
                  <div className="space-y-md border-t border-[#E9ECEF] pt-md">
                    <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Price Range</p>
                    <div className="space-y-sm">
                      {['Under ₹500', '₹500 – ₹2,000', '₹2,000 – ₹10,000', 'Above ₹10,000'].map((bucket) => (
                        <label key={bucket} className="flex items-center gap-sm cursor-pointer select-none text-body-sm font-medium">
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(bucket)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedPrices([...selectedPrices, bucket])
                              else setSelectedPrices(selectedPrices.filter((b) => b !== bucket))
                            }}
                            className="rounded border-[#CED4DA] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          {bucket}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability Checkboxes */}
                  <div className="space-y-md border-t border-[#E9ECEF] pt-md">
                    <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Stock Availability</p>
                    <div className="space-y-sm">
                      {['In Stock', 'Limited Stock', 'Out Of Stock', 'Coming Soon'].map((bucket) => (
                        <label key={bucket} className="flex items-center gap-sm cursor-pointer select-none text-body-sm font-medium">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(bucket)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAvailability([...selectedAvailability, bucket])
                              else setSelectedAvailability(selectedAvailability.filter((b) => b !== bucket))
                            }}
                            className="rounded border-[#CED4DA] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          {bucket}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Grid & Sorting */}
                <div className="lg:col-span-3 space-y-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md pb-md border-b border-[#E9ECEF]">
                    <p className="text-body-sm text-[#6C757D]">
                      Showing <span className="font-bold text-[#0A0A0A]">{sortedProducts.length}</span> matching products
                    </p>
                    <div className="flex items-center gap-sm">
                      <span className="text-xs text-[#6C757D] font-bold uppercase tracking-wider">Sort By:</span>
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="border border-[#CED4DA] bg-white rounded-lg px-md h-9 text-body-sm font-bold text-[#0A0A0A] focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="Relevance">Relevance</option>
                        <option value="Price Low to High">Price: Low to High</option>
                        <option value="Price High to Low">Price: High to Low</option>
                        <option value="Rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  {sortedProducts.length === 0 ? (
                    <div className="text-center py-5xl space-y-md bg-[#F8F9FA] rounded-[32px] border border-[#E9ECEF]">
                      <span className="material-symbols-outlined text-[64px] text-[#CED4DA]">filter_list_off</span>
                      <h3 className="font-bold text-headline-h3 text-[#0A0A0A]">No Products Match Filters</h3>
                      <p className="text-[#6C757D] text-body-md max-w-md mx-auto">
                        Try clearing your selected sidebar filters to see all matching products.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategories([])
                          setSelectedBrands([])
                          setSelectedPrices([])
                          setSelectedAvailability([])
                        }}
                        className="px-xl py-sm bg-[#121212] text-white font-bold rounded-xl hover:bg-[#fabd00] hover:text-[#121212] transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                      {sortedProducts.map((product) => {
                        const qty = quantities[product.id] || 1
                        const available = product.inventory?.available ?? product.stock ?? 0
                        const isOutOfStock = product.status === 'OUT_OF_STOCK' || available === 0
                        const isComingSoon = product.status === 'COMING_SOON'
                        const isLimitedStock = product.status === 'ACTIVE' && available <= 10 && available > 0

                        return (
                          <div
                            key={product.id}
                            className="bg-white rounded-[24px] border border-[#E9ECEF] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary transition-all duration-300 flex flex-col justify-between group text-left relative"
                          >
                            <div>
                              {/* Image Container */}
                              <a
                                href={`#/product/${product.id}`}
                                onClick={() => handleProductClick(product)}
                                className="aspect-square bg-[#F8F9FA] rounded-[16px] overflow-hidden flex items-center justify-center border border-[#E9ECEF] relative block"
                              >
                                <img
                                  src={product.images?.[0] || '/pdp_cpvc_pipe_main.png'}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider">
                                  {product.brand}
                                </span>
                                
                                {/* Stock Badges */}
                                {isOutOfStock && (
                                  <span className="absolute bottom-3 right-3 bg-[#ba1a1a] text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider font-bold">
                                    Out of Stock
                                  </span>
                                )}
                                {isComingSoon && (
                                  <span className="absolute bottom-3 right-3 bg-secondary text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider font-bold">
                                    Coming Soon
                                  </span>
                                )}
                                {isLimitedStock && (
                                  <span className="absolute bottom-3 right-3 bg-orange-600 text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider font-bold">
                                    Only {available} Left
                                  </span>
                                )}
                                {!isOutOfStock && !isComingSoon && !isLimitedStock && (
                                  <span className="absolute bottom-3 right-3 bg-emerald-600 text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider font-bold">
                                    In Stock
                                  </span>
                                )}
                              </a>

                              {/* Title & Description */}
                              <a
                                href={`#/product/${product.id}`}
                                onClick={() => handleProductClick(product)}
                                className="no-underline block group-hover:text-primary transition-colors"
                              >
                                <h4 className="font-bold text-body-md leading-tight text-[#0A0A0A] mt-lg truncate">
                                  {product.name}
                                </h4>
                              </a>
                              
                              {/* Rating Stars */}
                              <div className="flex items-center gap-xs mt-sm">
                                <span className="material-symbols-outlined text-[#FFC107] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  star
                                </span>
                                <span className="font-bold text-body-sm text-[#0A0A0A]">{product.rating || '4.5'}</span>
                                <span className="text-[11px] text-secondary">• Model: {product.model}</span>
                              </div>

                              <p className="text-xs text-[#6C757D] leading-relaxed mt-sm line-clamp-2">
                                {product.description || 'Premium commercial-grade procurement materials for construction works.'}
                              </p>
                            </div>

                            {/* Add-to-cart controls and Price */}
                            <div className="mt-md border-t border-[#E9ECEF] pt-md space-y-md">
                              <div className="flex justify-between items-baseline">
                                <p className="font-headline-h3 text-[20px] font-black text-primary">
                                  ₹{product.price.toLocaleString('en-IN')}{' '}
                                  <span className="text-xs text-[#6C757D] font-normal">{product.unitOfMeasure || product.unit}</span>
                                </p>
                              </div>

                              {/* Quantity controls (only if active & in stock) */}
                              {!isOutOfStock && !isComingSoon && (
                                <div className="flex items-center justify-between gap-sm border border-[#E9ECEF] p-xs rounded-xl bg-[#F8F9FA]">
                                  <span className="font-label-caps text-[11px] font-bold text-secondary pl-xs">
                                    Quantity
                                  </span>
                                  <div className="flex items-center border border-[#E9ECEF] rounded bg-white overflow-hidden">
                                    <button
                                      onClick={() => decrementQty(product.id)}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface select-none cursor-pointer font-bold border-none bg-transparent"
                                    >
                                      -
                                    </button>
                                    <span className="px-sm font-bold text-on-surface text-body-sm min-w-[24px] text-center">
                                      {qty}
                                    </span>
                                    <button
                                      onClick={() => incrementQty(product.id)}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface select-none cursor-pointer font-bold border-none bg-transparent"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="grid grid-cols-2 gap-sm">
                                {!isOutOfStock && !isComingSoon ? (
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="py-sm bg-[#121212] text-white text-xs font-bold rounded-xl hover:bg-primary-container hover:text-[#121212] transition-all flex items-center justify-center gap-xs border border-transparent cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                    Add to Cart
                                  </button>
                                ) : (
                                  <a
                                    href={`#/product/${product.id}`}
                                    onClick={() => handleProductClick(product)}
                                    className="py-sm bg-[#F8F9FA] text-[#0A0A0A] text-xs font-bold rounded-xl border border-[#CED4DA] hover:bg-white hover:border-[#0A0A0A] transition-all flex items-center justify-center gap-xs no-underline text-center cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    View Details
                                  </a>
                                )}
                                
                                <button
                                  onClick={() => openRfqModal(product)}
                                  className="py-sm border border-[#121212] text-[#121212] text-xs font-bold rounded-xl hover:bg-surface-variant/20 transition-all flex items-center justify-center gap-xs bg-white cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">request_quote</span>
                                  Request Quote
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RFQ Prefilled Modal */}
      {rfqProduct && (
        <div className="fixed inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white border border-[#E9ECEF] rounded-[24px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-xl shadow-2xl animate-fade-in relative text-left">
            <button
              onClick={() => setRfqProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#E9ECEF] flex items-center justify-center hover:bg-[#F8F9FA] cursor-pointer text-[#0A0A0A]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {rfqSubmitted ? (
              <div className="flex flex-col items-center justify-center py-xxl text-center gap-md">
                <span className="material-symbols-outlined text-[#10B981] text-[64px]">
                  check_circle
                </span>
                <h3 className="font-headline-h3 text-[24px] font-extrabold text-[#0A0A0A]">
                  Quote Request Submitted!
                </h3>
                <p className="font-body-md text-secondary max-w-sm">
                  We have logged your request for <strong>{rfqProduct.name}</strong>. Our procurement experts will call you at <strong>{rfqFormData.phone}</strong> within 2 hours.
                </p>
                <button
                  onClick={() => setRfqProduct(null)}
                  className="mt-lg px-xl py-2 bg-[#121212] text-white font-semibold rounded-md hover:bg-on-surface transition-colors font-label-caps cursor-pointer"
                >
                  Close Modal
                </button>
              </div>
            ) : (
              <>
                <div className="mb-lg border-b border-[#E9ECEF] pb-md">
                  <h3 className="font-headline-h3 text-[22px] font-extrabold text-[#0A0A0A]">
                    Request a Custom Quote
                  </h3>
                  <p className="text-xs text-secondary mt-xs">
                    Get custom factory-direct pricing for bulk orders of <strong>{rfqProduct.name}</strong>.
                  </p>
                </div>

                {rfqError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded mb-md text-left">
                    {rfqError}
                  </div>
                )}

                <form onSubmit={handleRfqSubmit} className="flex flex-col gap-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Your Name *
                      </label>
                      <input
                        required
                        value={rfqFormData.name}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, name: e.target.value })}
                        className="w-full h-11 px-md rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm"
                        placeholder="e.g. John Doe"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Phone Number *
                      </label>
                      <input
                        required
                        value={rfqFormData.phone}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, phone: e.target.value })}
                        className="w-full h-11 px-md rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm"
                        placeholder="e.g. +91 9876543210"
                        type="tel"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Required Quantity *
                      </label>
                      <input
                        required
                        value={rfqFormData.quantity}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, quantity: e.target.value })}
                        className="w-full h-11 px-md rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm"
                        placeholder="e.g. 500 Pieces"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Delivery City & Pincode *
                      </label>
                      <input
                        required
                        value={rfqFormData.location}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, location: e.target.value })}
                        className="w-full h-11 px-md rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm"
                        placeholder="e.g. Bengaluru, 560001"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Timeline
                      </label>
                      <select
                        value={rfqFormData.timeline}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, timeline: e.target.value })}
                        className="w-full h-11 px-md rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm cursor-pointer"
                      >
                        <option value="Immediate (1-3 Days)">Immediate (1-3 Days)</option>
                        <option value="Within 1 Week">Within 1 Week</option>
                        <option value="Within 1 Month">Within 1 Month</option>
                        <option value="Planning Phase">Planning Phase</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Estimated Budget (INR, Optional)
                      </label>
                      <input
                        value={rfqFormData.budget}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, budget: e.target.value })}
                        className="w-full h-11 px-md rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm"
                        placeholder="e.g. 500000"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="font-label-caps text-[10px] text-secondary uppercase font-bold">
                        Specifications & Details
                      </label>
                      <textarea
                        value={rfqFormData.details}
                        onChange={(e) => setRfqFormData({ ...rfqFormData, details: e.target.value })}
                        className="w-full rounded-lg border border-[#CED4DA] bg-white focus:border-primary outline-none text-body-sm h-28 p-md resize-none"
                        placeholder="Please details any specifics here..."
                      ></textarea>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-[#121212] font-semibold rounded-xl border-none hover:bg-[#fabd00] transition-colors font-label-caps text-[14px] cursor-pointer mt-md"
                  >
                    Submit RFQ
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart success toast */}
      {toastMessage && (
        <div
          className="fixed bottom-8 right-8 z-50 bg-[#121212] text-white px-md py-sm rounded-md shadow-lg flex items-center gap-sm border border-surface-variant font-semibold animate-fade-in"
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
        >
          <span className="material-symbols-outlined text-[#10B981] text-[20px]">check_circle</span>
          <span className="text-body-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
