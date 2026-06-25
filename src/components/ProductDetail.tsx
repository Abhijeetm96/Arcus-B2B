import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { validateQuantity } from '../../shared/validation'

interface PriceTier {
  min: number
  max: number
  price: number
  save: number
}

const MOCK_TIERS: PriceTier[] = [
  { min: 1, max: 50, price: 165, save: 0 },
  { min: 51, max: 100, price: 160, save: 3 },
  { min: 101, max: 500, price: 154, save: 7 },
  { min: 501, max: Infinity, price: 145, save: 12 },
]

interface RecommendedProduct {
  id: string
  name: string
  category: string
  price: number
  stock: string
  image: string
  multiplier: number
}

const MOCK_RECOMMENDED: RecommendedProduct[] = [
  {
    id: 'elbow',
    name: 'Astral CPVC Elbow 90° (1")',
    category: 'Plumbing',
    price: 45,
    stock: 'In Stock',
    image: '/pdp_cpvc_elbow.png',
    multiplier: 2.0,
  },
  {
    id: 'tee',
    name: 'Astral CPVC Tee (1")',
    category: 'Plumbing',
    price: 58,
    stock: 'In Stock',
    image: '/pdp_cpvc_tee.png',
    multiplier: 1.0,
  },
  {
    id: 'cement',
    name: 'CPVC Solvent Cement (100ml)',
    category: 'Plumbing',
    price: 110,
    stock: 'In Stock',
    image: '/pdp_cpvc_solvent.png',
    multiplier: 0.2,
  },
  {
    id: 'clamps',
    name: 'Galvanized Pipe Clamps (1")',
    category: 'Plumbing',
    price: 15,
    stock: 'In Stock',
    image: '/pdp_pipe_clamp.png',
    multiplier: 0.5,
  },
  {
    id: 'valve',
    name: 'Astral CPVC Ball Valve (1")',
    category: 'Plumbing',
    price: 180,
    stock: 'In Stock',
    image: '/pdp_ball_valve.png',
    multiplier: 0.1,
  },
]

interface Review {
  initials: string
  name: string
  role: string
  rating: number
  date: string
  comment: string
}

const MOCK_REVIEWS: Review[] = [
  {
    initials: 'MK',
    name: 'Mahesh K.',
    role: 'Site Manager, L&T',
    rating: 5,
    date: '2 weeks ago',
    comment: '"Best in class heat resistance for high-rise plumbing. The delivery from ARCUS was 4 hours faster than local distributors."',
  },
  {
    initials: 'AP',
    name: 'Amit P.',
    role: 'Procurement Specialist, Sobha Developers',
    rating: 5,
    date: '3 weeks ago',
    comment: '"Extremely consistent quality and perfect dimensions. The SDR 11 CPVC standard compliance is verified. Highly recommend Arcus bulk pricing."',
  },
  {
    initials: 'RK',
    name: 'Rajesh K.',
    role: 'Contractor, RK Builders',
    rating: 4,
    date: '1 month ago',
    comment: '"Good CPVC pipe. Arrived in clean bundles. Solvent weld joints are holding up perfectly under high pressure testing."',
  },
  {
    initials: 'VS',
    name: 'Vikram S.',
    role: 'Project Head, Prestige Group',
    rating: 5,
    date: '1 month ago',
    comment: '"Centralized procurement and direct factory billing saved us 15% on taxes and logistics. Standard thickness is accurate across all batches."',
  },
  {
    initials: 'SA',
    name: 'Srinivas A.',
    role: 'Lead Plumber, Casa Grande',
    rating: 5,
    date: '2 months ago',
    comment: '"Excellent bend strength and heat toleration. Did not fracture during manual cold bending. Will procure again for phase 2."',
  },
]

export default function ProductDetail() {
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [productUnit, setProductUnit] = useState('/ Unit')
  const [stock, setStock] = useState<number>(100)
  const [status, setStatus] = useState<'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'COMING_SOON' | 'RFQ_ONLY'>('ACTIVE')
  const [syncingStock, setSyncingStock] = useState(false)

  const handleSyncStock = async () => {
    setSyncingStock(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productSlug}/sync-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stock !== undefined) {
          setStock(data.stock);
          setToastMessage('Live inventory synced successfully!');
        }
      } else {
        setToastMessage('Failed to sync live stock from vendor.');
      }
    } catch (e) {
      console.error(e);
      setToastMessage('Failed to sync live stock: Network error.');
    } finally {
      setSyncingStock(false);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleAddToCart = () => {
    const check = validateQuantity(qty);
    if (!check.valid) {
      setToastMessage(check.error || 'Invalid quantity.');
      return;
    }
    if (customerType === 'BUSINESS') {
      if (qty < minimumOrderQuantity) {
        setToastMessage(`Business orders require a minimum of ${minimumOrderQuantity} ${minimumOrderUnit}.`);
        return;
      }
      if (orderMultiple > 1 && qty % orderMultiple !== 0) {
        setToastMessage(`Quantity must be a multiple of ${orderMultiple}.`);
        return;
      }
    }
    if (qty > stock) {
      setToastMessage(`Cannot add to cart: only ${stock} units in stock.`);
      return;
    }
    addToCart({
      id: productSlug,
      name: productName,
      price: baseUnitPrice,
      unit: productUnit,
      images: images,
      categoryTitle: categoryTitle,
      priceTiers: tiers,
      stock: stock,
      minimumOrderQuantity,
      orderMultiple,
      minimumOrderUnit
    }, qty)
    setToastMessage(`Added ${qty} x ${productName} to cart!`)
  }

  const handleBuyNow = () => {
    const check = validateQuantity(qty);
    if (!check.valid) {
      setToastMessage(check.error || 'Invalid quantity.');
      return;
    }
    if (customerType === 'BUSINESS') {
      if (qty < minimumOrderQuantity) {
        setToastMessage(`Business orders require a minimum of ${minimumOrderQuantity} ${minimumOrderUnit}.`);
        return;
      }
      if (orderMultiple > 1 && qty % orderMultiple !== 0) {
        setToastMessage(`Quantity must be a multiple of ${orderMultiple}.`);
        return;
      }
    }
    if (qty > stock) {
      setToastMessage(`Cannot purchase: only ${stock} units in stock.`);
      return;
    }
    addToCart({
      id: productSlug,
      name: productName,
      price: baseUnitPrice,
      unit: productUnit,
      images: images,
      categoryTitle: categoryTitle,
      priceTiers: tiers,
      stock: stock,
      minimumOrderQuantity,
      orderMultiple,
      minimumOrderUnit
    }, qty)
    window.location.hash = '#/checkout'
  }

  const handleAddKitToCart = () => {
    if (customerType === 'BUSINESS') {
      if (qty < minimumOrderQuantity) {
        setToastMessage(`Business orders require a minimum of ${minimumOrderQuantity} ${minimumOrderUnit}.`);
        return;
      }
      if (orderMultiple > 1 && qty % orderMultiple !== 0) {
        setToastMessage(`Quantity must be a multiple of ${orderMultiple}.`);
        return;
      }
    }
    if (qty > stock) {
      setToastMessage(`Cannot add kit: main product has only ${stock} units in stock.`);
      return;
    }
    // Add main product
    addToCart({
      id: productSlug,
      name: productName,
      price: baseUnitPrice,
      unit: productUnit,
      images: images,
      categoryTitle: categoryTitle,
      priceTiers: tiers,
      stock: stock,
      minimumOrderQuantity,
      orderMultiple,
      minimumOrderUnit
    }, qty)

    // Add selected recommended products
    recommendedProducts.forEach(item => {
      if (selectedRecommendations[item.id]) {
        const itemQty = getRecQty(item.id, item.multiplier)
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          unit: '/ Unit',
          images: [item.image],
          categoryTitle: categoryTitle
        }, itemQty)
      }
    })

    setToastMessage('Complete Kit added to cart!')
  }
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'documents' | 'warranty' | 'shipping'>('overview')
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [rfqSubmitted, setRfqSubmitted] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxScale, setLightboxScale] = useState(1)
  
  // Quick RFQ states
  const [showQuickRfqModal, setShowQuickRfqModal] = useState(false)
  const [quickRfqForm, setQuickRfqForm] = useState({
    quantity: '',
    budget: '',
    phone: '',
    notes: ''
  })
  const [quickRfqSubmitted, setQuickRfqSubmitted] = useState(false)
  const [quickRfqError, setQuickRfqError] = useState('')

  const [rfqForm, setRfqForm] = useState({
    projectType: 'Commercial',
    qty: '',
    email: '',
  })

  // Extract slug from URL hash
  const hash = window.location.hash
  const productSlug = hash.replace(/^#\/?products?\/?/, '').split('?')[0] || 'astral-cpvc-pipe'

  const getCategorySlug = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('cement') || t.includes('concrete')) return 'cement-concrete'
    if (t.includes('steel') || t.includes('structural')) return 'steel-structural'
    if (t.includes('plumb')) return 'plumbing'
    if (t.includes('elect')) return 'electrical'
    if (t.includes('paint') || t.includes('chemical')) return 'paints-chemicals'
    if (t.includes('tile') || t.includes('floor')) return 'tiles-flooring'
    if (t.includes('hardw') || t.includes('tool')) return 'hardware-tools'
    if (t.includes('build') || t.includes('safety')) return 'building-materials'
    return 'building-materials'
  }

  const { user } = useAuth()
  const customerType = user?.customerType || (user?.role && ['Business', 'Contractor', 'Supplier'].includes(user.role) ? 'BUSINESS' : 'INDIVIDUAL');

  // Dynamic B2B details state
  const [productName, setProductName] = useState('Astral CPVC Pipe 1 Inch SDR 11')
  const [brand, setBrand] = useState('ASTRAL')
  const [categoryTitle, setCategoryTitle] = useState('Plumbing')
  const [productRating, setProductRating] = useState('4.8')
  const [productDescription, setProductDescription] = useState('Astral CPVC PRO pipes and fittings are manufactured from a specialty plastic chemically known as Chlorinated Poly Vinyl Chloride (CPVC). This CPVC compound is designed for hot and cold water distribution systems. Easy installation with solvent cement, superior pressure rating, and long-term reliability in high-rise residential and commercial complexes.')
  
  // B2B states
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState<number>(1)
  const [minimumOrderUnit, setMinimumOrderUnit] = useState<string>('Piece')
  const [orderMultiple, setOrderMultiple] = useState<number>(1)
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3)
  const [allowB2B, setAllowB2B] = useState<boolean>(true)
  const [allowB2C, setAllowB2C] = useState<boolean>(true)

  const [images, setImages] = useState<string[]>([
    '/pdp_cpvc_pipe_main.png',
    '/pdp_cpvc_pipe_warehouse.png',
    '/pdp_cpvc_pipe_install.png',
    '/pdp_cpvc_pipe_fittings_group.png',
  ])
  const [tiers, setTiers] = useState<PriceTier[]>(MOCK_TIERS)
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>(MOCK_RECOMMENDED)
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [specifications, setSpecifications] = useState<Record<string, string>>({
    'Material': 'CPVC (Chlorinated Poly Vinyl Chloride)',
    'SDR Rating': 'SDR 11',
    'Standard': 'ASTM D2846 / IS 15778',
    'Manufacturer': 'Astral Poly Technik Limited',
  })

  // Fetch B2B product details dynamically
  useEffect(() => {
    fetch(`/api/products/${productSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        if (data.name) setProductName(data.name)
        if (data.brand) setBrand(data.brand)
        if (data.categoryTitle) setCategoryTitle(data.categoryTitle)
        if (data.rating) setProductRating(data.rating)
        if (data.description) setProductDescription(data.description)
        if (data.unit) setProductUnit(data.unit)
        if (data.images && data.images.length > 0) setImages(data.images);
        if (data.priceTiers && data.priceTiers.length > 0) {
          const uniqueTiers: PriceTier[] = [];
          data.priceTiers.forEach((t: any) => {
            const isDup = uniqueTiers.some(
              (ut) => ut.min === t.min && ut.max === (t.max === 999999 ? Infinity : t.max) && ut.price === t.price
            );
            if (!isDup) {
              uniqueTiers.push({
                min: t.min,
                max: t.max === 999999 ? Infinity : t.max,
                price: t.price,
                save: t.save || 0
              });
            }
          });
          setTiers(uniqueTiers);
        }
        if (data.specifications) setSpecifications(data.specifications);
        if (data.recommendedAccessories && data.recommendedAccessories.length > 0) {
          setRecommendedProducts(data.recommendedAccessories);
        }
        if (data.reviews && data.reviews.length > 0) setReviews(data.reviews);
        
        const availableStock = data.inventory?.available !== undefined ? data.inventory.available : (data.stock !== undefined ? data.stock : 100);
        setStock(availableStock);
        if (data.status) setStatus(data.status);

        const moq = data.minimumOrderQuantity !== undefined ? data.minimumOrderQuantity : 1;
        setMinimumOrderQuantity(moq);
        if (data.minimumOrderUnit) setMinimumOrderUnit(data.minimumOrderUnit);
        if (data.orderMultiple !== undefined) setOrderMultiple(data.orderMultiple);
        if (data.leadTimeDays !== undefined) setLeadTimeDays(data.leadTimeDays);
        if (data.allowB2B !== undefined) setAllowB2B(data.allowB2B);
        if (data.allowB2C !== undefined) setAllowB2C(data.allowB2C);

        if (customerType === 'BUSINESS') {
          setQty(moq);
        } else {
          setQty(1);
        }
      })
      .catch((err) => {
        console.warn('Backend server offline or product not found. Using local static product fallback.', err);
      });
  }, [productSlug, customerType]);

  // State for Everything You Need section
  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, boolean>>({
    elbow: true,
    tee: true,
    cement: true,
    clamps: true,
    valve: true,
  })
  const [recManualQtys, setRecManualQtys] = useState<Record<string, number>>({})

  const getRecQty = (id: string, multiplier: number) => {
    if (recManualQtys[id] !== undefined) {
      return recManualQtys[id]
    }
    return Math.max(1, Math.round(qty * multiplier))
  }

  const handleRecQtyChange = (id: string, val: number) => {
    setRecManualQtys(prev => ({
      ...prev,
      [id]: Math.max(1, val)
    }))
  }

  const toggleRecSelection = (id: string) => {
    setSelectedRecommendations(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true)
      } else {
        setShowStickyBar(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate pricing values
  const baseUnitPrice = tiers[0].price
  const activeTier = tiers.find((t) => qty >= t.min && qty <= t.max) || tiers[0]
  const currentUnitPrice = activeTier.price
  const total = qty * currentUnitPrice
  const savings = qty * (baseUnitPrice - currentUnitPrice)

  const activeIndex = tiers.indexOf(activeTier)
  const nextTier = activeIndex < tiers.length - 1 ? tiers[activeIndex + 1] : null

  // "Everything You Need" calculations
  const selectedRecsCount = Object.keys(selectedRecommendations).filter(id => selectedRecommendations[id]).length
  const totalProductsSelected = 1 + selectedRecsCount // Pipe is always selected

  const totalRecUnits = recommendedProducts.reduce((acc, item) => {
    if (selectedRecommendations[item.id]) {
      return acc + getRecQty(item.id, item.multiplier)
    }
    return acc
  }, 0)
  const totalUnits = qty + totalRecUnits

  const recommendedTotal = recommendedProducts.reduce((acc, item) => {
    if (selectedRecommendations[item.id]) {
      return acc + (getRecQty(item.id, item.multiplier) * item.price)
    }
    return acc
  }, 0)

  const individualTotal = (qty * currentUnitPrice) + recommendedTotal

  const getBundleDiscountPercentage = (count: number) => {
    if (count >= 6) return 10
    if (count === 5) return 7
    if (count === 4) return 5
    if (count === 3) return 4
    if (count === 2) return 2
    return 0
  }
  const bundleDiscountPercent = getBundleDiscountPercentage(totalProductsSelected)
  const bundleSavings = Math.round(individualTotal * (bundleDiscountPercent / 100))
  const finalTotal = individualTotal - bundleSavings

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  const getNextBundleTier = (count: number) => {
    if (count < 2) return { count: 2, discount: 2 }
    if (count === 2) return { count: 3, discount: 4 }
    if (count === 3) return { count: 4, discount: 5 }
    if (count === 4) return { count: 5, discount: 7 }
    if (count === 5) return { count: 6, discount: 10 }
    return null
  }
  const nextBundleTier = getNextBundleTier(totalProductsSelected)

  const handleQtyChange = (val: number) => {
    if (isNaN(val)) {
      setQty(customerType === 'BUSINESS' ? minimumOrderQuantity : 1);
      return;
    }
    const check = validateQuantity(val);
    if (!check.valid) {
      return;
    }
    
    let targetVal = Math.floor(val);
    if (customerType === 'BUSINESS') {
      if (targetVal < minimumOrderQuantity) {
        targetVal = minimumOrderQuantity;
      }
      if (orderMultiple > 1 && targetVal % orderMultiple !== 0) {
        const remainder = targetVal % orderMultiple;
        if (targetVal < qty) {
          // Decreasing quantity, round down to previous multiple
          targetVal = Math.max(minimumOrderQuantity, targetVal - remainder);
        } else {
          // Increasing quantity, round up to next multiple
          targetVal = targetVal + (orderMultiple - remainder);
        }
      }
    } else {
      if (targetVal < 1) {
        targetVal = 1;
      }
    }
    setQty(targetVal);
  }

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqForm.email) return;

    try {
      const token = localStorage.getItem('arcus_token');
      const payload = {
        name: 'Bulk Inquiry',
        phone: '9999999999', // Default phone for product details page RFQ
        category: categoryTitle,
        quantity: String(rfqForm.qty || 1000),
        location: 'Bengaluru', // Default location
        timeline: 'Within 1 Week', // Default timeline
        details: `Inquiry for product: ${productName}. Project Type: ${rfqForm.projectType}. Email: ${rfqForm.email}`,
        title: `Inquiry for ${productName}`,
        budget: undefined, // Optional
        attachmentUrls: []
      };

      const res = await fetch('http://localhost:5000/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setRfqSubmitted(true);
      } else {
        const errData = await res.json();
        setToastMessage(errData.error || 'Failed to submit RFQ.');
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Error submitting RFQ. Please try again.');
    }
  };

  const handleQuickRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickRfqError('');

    if (!quickRfqForm.quantity || Number(quickRfqForm.quantity) < 1) {
      return setQuickRfqError('Please enter a valid quantity.');
    }
    if (!quickRfqForm.phone.trim()) {
      return setQuickRfqError('Mobile number is required.');
    }

    try {
      const token = localStorage.getItem('arcus_token');
      const payload = {
        name: user?.name || 'Quick RFQ Customer',
        phone: quickRfqForm.phone,
        category: categoryTitle,
        quantity: quickRfqForm.quantity,
        location: 'Project Location',
        timeline: 'Flexible',
        details: `[Quick PDP RFQ] Product: ${productName} (ID: ${productSlug}). Target Budget: ${quickRfqForm.budget ? '₹' + quickRfqForm.budget : 'Not specified'}. Notes: ${quickRfqForm.notes}`,
        budget: quickRfqForm.budget,
        title: `Bulk Pricing Request for ${productName}`,
        items: [{
          itemName: productName,
          description: brand || 'ARCUS matched spec',
          unit: productUnit.replace('/', '').trim() || 'Piece',
          quantity: quickRfqForm.quantity
        }],
        attachmentUrls: []
      };

      const res = await fetch('http://localhost:5000/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setQuickRfqSubmitted(true);
      } else {
        const errData = await res.json();
        setQuickRfqError(errData.error || 'Failed to submit request.');
      }
    } catch (err) {
      console.error(err);
      setQuickRfqError('Network error. Please try again.');
    }
  };

  return (
    <div className="w-full bg-background min-h-screen text-on-surface pt-lg pb-5xl">
      {/* Sticky Purchase Bar */}
      <div
        className={`fixed top-0 left-0 w-full bg-white shadow-sm z-[60] border-b border-surface-variant transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-lg h-20 flex items-center justify-between">
          <div className="flex items-center gap-lg">
            <div className="w-12 h-12 bg-surface-container rounded hidden md:block overflow-hidden">
              <img className="w-full h-full object-cover" src={images[0]} alt={productName} />
            </div>
            <div className="text-left">
              <p className="font-bold text-body-sm leading-tight">{productName}</p>
              <div className="flex gap-md text-label-caps text-secondary text-[10px]">
                <span className="text-on-surface font-bold">₹{currentUnitPrice.toFixed(2)}</span>
                <span>GST Included</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-xl">
            <div className="hidden lg:flex items-center bg-surface-container rounded-md border border-surface-variant scale-90">
              <button
                className="px-md py-sm hover:text-primary font-bold"
                onClick={() => handleQtyChange(qty - 1)}
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-body-sm">{qty}</span>
              <button
                className="px-md py-sm hover:text-primary font-bold"
                onClick={() => handleQtyChange(qty + 1)}
              >
                +
              </button>
            </div>
            {status === 'COMING_SOON' ? (
              <button
                onClick={() => {
                  document.getElementById('enterprise-rfq-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-primary text-on-primary hover:bg-[#fabd00] hover:text-on-primary-container px-xxl h-11 rounded-md font-bold transition-all flex items-center gap-sm font-label-caps text-[14px]"
              >
                Inquire
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={qty > stock || stock === 0 || status === 'OUT_OF_STOCK'}
                className={`px-xxl h-11 rounded-md font-bold transition-all flex items-center gap-sm font-label-caps text-[14px] ${
                  qty > stock || stock === 0 || status === 'OUT_OF_STOCK'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-container text-on-primary-container hover:bg-[#fabd00]'
                }`}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-lg">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-sm text-label-caps text-secondary text-[11px] py-md text-left">
          <a className="hover:text-primary transition-colors" href="#/">Home</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <a className="hover:text-primary transition-colors" href="#/materials">Materials</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <a className="hover:text-primary transition-colors" href={`#/materials/${getCategorySlug(categoryTitle)}`}>{categoryTitle}</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-bold">{productName}</span>
        </nav>

        {/* Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl mt-lg">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-sm text-left">
            <div className="w-full bg-white rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative flex items-center justify-center h-[500px] md:h-[720px] overflow-hidden">
              <img
                className="w-full h-full object-cover cursor-zoom-in"
                id="mainImage"
                src={images[activeImage]}
                alt={productName}
                onClick={() => {
                  setShowLightbox(true)
                  setLightboxScale(1)
                }}
              />
              <div className="absolute bottom-6 right-6 flex gap-sm">
                <button
                  onClick={() => {
                    setShowLightbox(true)
                    setLightboxScale(1.5)
                  }}
                  className="bg-surface-container-low p-sm rounded-full shadow-md hover:bg-primary-container transition-colors"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </button>
                <button
                  onClick={() => {
                    setShowLightbox(true)
                    setLightboxScale(1)
                  }}
                  className="bg-surface-container-low p-sm rounded-full shadow-md hover:bg-primary-container transition-colors"
                  title="Fullscreen"
                >
                  <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                </button>
              </div>
            </div>
            {/* Gallery Thumbnails */}
            <div className="flex flex-row gap-sm shrink-0 justify-start">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-28 h-28 md:w-36 md:h-36 bg-white rounded-md cursor-pointer border p-xs overflow-hidden transition-all ${
                    activeImage === idx ? 'border-2 border-primary scale-105' : 'border-outline-variant hover:border-primary hover:scale-105'
                  }`}
                >
                  <img className="w-full h-full object-cover rounded" src={img} alt="CPVC pipe thumbnail" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Procurement Control Center */}
          <div className="lg:col-span-5 flex flex-col gap-lg text-left">
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <span className="bg-primary-container/10 text-on-primary-fixed-variant font-label-caps px-md py-1 rounded text-[11px] font-bold">
                  In Stock
                </span>
                <div className="flex items-center gap-xs text-on-surface">
                  <span className="material-symbols-outlined text-primary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold text-body-sm">{productRating}</span>
                  <span className="text-secondary text-body-sm">({reviews.length * 25 || 124} Reviews)</span>
                </div>
              </div>
              <h1 className="font-headline-h3 text-headline-h3 text-on-surface mt-xs leading-snug">
                {productName}
              </h1>
              <div className="flex flex-wrap items-center gap-md mt-sm">
                <span className="bg-surface-container text-on-surface font-black text-[11px] px-sm py-1 rounded">{brand.toUpperCase()}</span>
                <div className="h-4 w-px bg-surface-variant"></div>
                <div className="flex items-center gap-xs text-primary font-bold text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>ARCUS Verified</span>
                </div>
                <div className="flex items-center gap-xs text-green-600 font-bold text-[12px] bg-green-50 px-sm py-1 rounded-full">
                  <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                  <span>Best Seller in {categoryTitle}</span>
                </div>
              </div>
            </div>

            {/* Price Estimator Hub */}
            <div className="bg-white p-xl rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col gap-xl">
              <div className="flex flex-col gap-xs">
                <p className="text-label-caps text-secondary font-bold text-[10px] uppercase">Price per Unit</p>
                <div className="flex items-baseline gap-md">
                  <span className="font-headline-h3 text-[32px] text-on-surface" id="currentUnitPriceDisplay">
                    ₹{currentUnitPrice.toFixed(2)}
                  </span>
                  <span className="text-body-sm text-secondary">GST Included</span>
                </div>
              </div>

              {/* Real-time Inventory Status */}
              <div className="flex items-center justify-between p-md bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                <div className="flex items-center gap-sm">
                  <span 
                    className="h-2.5 w-2.5 rounded-full animate-pulse" 
                    style={{
                      backgroundColor: status === 'COMING_SOON' ? '#3B82F6'
                        : status === 'DISCONTINUED' ? '#6B7280'
                        : status === 'OUT_OF_STOCK' || stock === 0 ? '#EF4444'
                        : stock > 10 ? '#10B981'
                        : '#F59E0B'
                    }}
                  ></span>
                  <div>
                    <p className="text-xs text-[#6C757D] font-bold uppercase tracking-wider">Inventory Status</p>
                    <p className="text-body-sm font-extrabold text-[#0A0A0A]">
                      {status === 'COMING_SOON' ? 'Coming Soon'
                        : status === 'DISCONTINUED' ? 'Discontinued'
                        : status === 'OUT_OF_STOCK' || stock === 0 ? 'Out of Stock'
                        : stock > 10 ? `${stock} Units Available`
                        : `Low Stock: Only ${stock} left`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSyncStock}
                  disabled={syncingStock}
                  className="flex items-center gap-xs text-xs text-primary font-bold hover:underline bg-primary/10 py-xs px-sm rounded border border-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {syncingStock ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                  )}
                  {syncingStock ? 'Syncing...' : 'Sync Live Stock'}
                </button>
              </div>

              {/* B2B Specifications Info Panel */}
              {customerType === 'BUSINESS' && (
                <div className="bg-amber-50/50 p-lg rounded-md border border-amber-200/50 text-left space-y-md">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">business_center</span>
                    Procurement Information
                  </h4>
                  <div className="grid grid-cols-2 gap-md text-xs font-semibold text-amber-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-700/70 uppercase">Minimum Order Qty (MOQ)</span>
                      <span className="text-body-sm font-extrabold">{minimumOrderQuantity} {minimumOrderUnit}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-700/70 uppercase">Order Multiples</span>
                      <span className="text-body-sm font-extrabold">{orderMultiple} {minimumOrderUnit}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-700/70 uppercase">Standard Lead Time</span>
                      <span className="text-body-sm font-extrabold">{leadTimeDays} Days</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-700/70 uppercase">Allowed Segments</span>
                      <span className="text-body-sm font-extrabold">
                        {allowB2B && allowB2C ? 'B2B & B2C' : allowB2B ? 'B2B Only' : allowB2C ? 'B2C Only' : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selector and Progress Tracker */}
              <div className="flex flex-col gap-lg bg-surface-container-low p-lg rounded-md border border-surface-variant">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-body-md text-on-surface" htmlFor="qtyInput">Order Quantity</label>
                  <div className="flex items-center bg-white rounded-md border border-surface-variant overflow-hidden">
                    <button
                      className="px-md py-sm hover:bg-primary-container/20 transition-colors font-bold"
                      onClick={() => handleQtyChange(qty - 1)}
                    >
                      <span className="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <input
                      className="w-20 bg-transparent border-none text-center font-bold focus:ring-0 text-body-lg"
                      id="qtyInput"
                      min="1"
                      type="number"
                      value={qty}
                      onChange={(e) => handleQtyChange(Number(e.target.value))}
                    />
                    <button
                      className="px-md py-sm hover:bg-primary-container/20 transition-colors font-bold"
                      onClick={() => handleQtyChange(qty + 1)}
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar towards Next Discount Tier */}
                {nextTier && (
                  <div className="flex flex-col gap-sm" id="progressContainer">
                    <div className="flex justify-between items-end">
                      <span className="text-label-caps text-secondary font-bold text-xs" id="progressMessage">
                        Add {nextTier.min - qty} more units for {nextTier.save}% off
                      </span>
                      <span className="bg-primary-container text-on-primary-container text-[9px] font-black px-xs py-0.5 rounded" id="progressUrgency">
                        {nextTier.min - qty < 15 ? 'CRITICAL!' : 'ALMOST THERE!'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container transition-all duration-500 ease-out"
                        id="progressBar"
                        style={{ width: `${Math.min(100, (qty / nextTier.min) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {savings > 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-md py-sm rounded-md flex items-center gap-sm justify-center animate-pulse" id="successBanner">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span className="text-[12px] font-bold">Bulk Discount Applied!</span>
                  </div>
                )}

                {/* Bulk Pricing Grid */}
                <div className="grid grid-cols-2 gap-md pt-sm">
                  {tiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`p-md rounded-md border text-left transition-all ${
                        qty >= tier.min && qty <= tier.max
                          ? 'border-2 border-primary bg-white ring-1 ring-primary'
                          : 'border-surface-variant bg-white opacity-60'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase text-secondary">
                        {tier.max === Infinity ? `${tier.min}+ Units` : `${tier.min}-${tier.max} Units`}
                      </p>
                      <p className="text-body-lg font-black mt-xs text-on-surface">
                        ₹{tier.price}
                        <span className="text-xs font-normal text-secondary">/Unit</span>
                      </p>
                      {tier.save > 0 && (
                        <p className="text-xs text-green-600 font-bold mt-1">SAVE {tier.save}%</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Actions */}
              <div className="flex flex-col gap-lg">
                <div className="flex justify-between items-center p-lg bg-surface-container-high rounded-md border border-surface-variant">
                  <div>
                    <p className="text-label-caps text-secondary text-[11px]">Total Amount</p>
                    <p className="font-bold text-headline-h3 text-on-surface mt-xs" id="totalPrice">
                      ₹{total.toLocaleString('en-IN')}
                    </p>
                  </div>
                  {savings > 0 && (
                    <div className="text-right" id="savingsContainer">
                      <p className="text-label-caps text-green-600 font-bold text-[11px]">You Saved</p>
                      <p className="font-bold text-body-lg text-green-600 mt-xs" id="savingsAmount">
                        ₹{savings.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-sm">
                  {status === 'COMING_SOON' ? (
                      <button
                        onClick={() => {
                          setQuickRfqForm({
                            quantity: String(qty),
                            budget: '',
                            phone: user?.phone || '',
                            notes: 'Inquiry for upcoming product: ' + productName
                          });
                          setQuickRfqSubmitted(false);
                          setQuickRfqError('');
                          setShowQuickRfqModal(true);
                        }}
                        className="w-full h-16 bg-primary text-on-primary hover:bg-[#fabd00] hover:text-on-primary-container rounded-md font-bold transition-colors flex items-center justify-center gap-sm font-label-caps text-[16px] shadow-sm border-0"
                      >
                        <span className="material-symbols-outlined text-[22px]">contact_support</span> Inquire
                      </button>
                    ) : status === 'RFQ_ONLY' ? (
                      <button
                        onClick={() => {
                          setQuickRfqForm({
                            quantity: String(qty),
                            budget: '',
                            phone: user?.phone || '',
                            notes: ''
                          });
                          setQuickRfqSubmitted(false);
                          setQuickRfqError('');
                          setShowQuickRfqModal(true);
                        }}
                        className="w-full h-16 bg-[#ffc107] text-[#0a0a0a] hover:bg-[#fabd00] rounded-md font-bold transition-all flex items-center justify-center gap-sm font-label-caps text-[16px] shadow-md border-0"
                      >
                        <span className="material-symbols-outlined text-[22px]">sell</span> Request Bulk Pricing
                      </button>
                    ) : (
                      <>
                        {qty > stock && (
                          <div className="p-md bg-red-50 border border-red-200 text-red-800 rounded-md flex items-center gap-sm justify-center">
                            <span className="material-symbols-outlined text-[20px] text-red-600">warning</span>
                            <span className="text-[12px] font-bold">
                              Requested quantity ({qty}) exceeds available vendor inventory ({stock}).
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-md" id="standardActions">
                          <button 
                             onClick={handleAddToCart}
                             disabled={qty > stock || stock === 0 || status === 'OUT_OF_STOCK'}
                             className={`h-16 rounded-md font-bold transition-colors flex items-center justify-center gap-sm font-label-caps text-[16px] shadow-sm border-0 ${
                               qty > stock || stock === 0 || status === 'OUT_OF_STOCK'
                                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                 : 'bg-primary-container text-on-primary-container hover:bg-[#fabd00]'
                             }`}
                          >
                            <span className="material-symbols-outlined text-[22px]">shopping_cart</span> Add to Cart
                          </button>
                          <button 
                            onClick={handleBuyNow}
                            disabled={qty > stock || stock === 0 || status === 'OUT_OF_STOCK'}
                            className={`h-16 rounded-md font-bold transition-colors font-label-caps text-[16px] border-0 ${
                              qty > stock || stock === 0 || status === 'OUT_OF_STOCK'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#121212] text-white hover:bg-on-surface'
                            }`}
                          >
                            Buy Now
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                {qty >= 500 && (
                  <div className="flex flex-col gap-md mt-sm" id="rfqActions">
                    <div className="p-md bg-primary-container/10 border border-primary-container/30 rounded-md text-center">
                      <p className="text-body-sm font-bold text-primary">
                        {qty >= 1000 ? 'Enterprise Bulk Pricing Available' : 'Need Better Pricing?'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setQuickRfqForm({
                          quantity: String(qty),
                          budget: '',
                          phone: user?.phone || '',
                          notes: ''
                        });
                        setQuickRfqSubmitted(false);
                        setQuickRfqError('');
                        setShowQuickRfqModal(true);
                      }}
                      className="w-full bg-[#ffc107] text-[#0a0a0a] py-xl rounded-md font-bold hover:bg-[#fabd00] transition-colors flex items-center justify-center gap-sm font-label-caps text-[13px] border-0"
                    >
                      <span className="material-symbols-outlined text-[20px]">sell</span>
                      Request Bulk Pricing
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-xl justify-center pt-md border-t border-surface-variant">
                <div className="flex items-center gap-md text-secondary">
                  <span className="material-symbols-outlined text-[26px]">local_shipping</span>
                  <span className="text-[14px] font-bold text-on-surface">Free Over ₹10k</span>
                </div>
                <div className="flex items-center gap-md text-secondary">
                  <span className="material-symbols-outlined text-[26px]">verified_user</span>
                  <span className="text-[14px] font-bold text-on-surface">12 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Six Quick Specs Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md mt-xxl text-center">
          {[
            { icon: 'receipt_long', label: 'GST Invoice' },
            { icon: 'sell', label: 'Bulk Discounts' },
            { icon: 'verified_user', label: 'Manufacturer Warranty' },
            { icon: 'check_circle', label: 'Verified Product' },
            { icon: 'local_shipping', label: 'Fast Delivery' },
            { icon: 'support_agent', label: 'Technical Support' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-md bg-white rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="material-symbols-outlined text-primary mb-xs text-[24px]">{item.icon}</span>
              <span className="text-[11px] font-bold text-on-surface">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Tabbed Specs Section */}
        <section className="mt-5xl">
          <div className="sticky top-[88px] z-40 bg-background border-b border-surface-variant flex gap-xl overflow-x-auto no-scrollbar py-sm">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'specifications', name: 'Specifications' },
              { id: 'documents', name: 'Technical Documents' },
              { id: 'warranty', name: 'Warranty' },
              { id: 'shipping', name: 'Shipping Info' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-lg py-md font-bold whitespace-nowrap text-body-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="mt-xl grid grid-cols-1 lg:grid-cols-12 gap-xxl text-left">
            <div className="lg:col-span-8 space-y-xxl">
              {activeTab === 'overview' && (
                <div id="overview" className="space-y-lg">
                  <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Product Overview</h3>
                  <p className="text-body-lg text-secondary leading-relaxed">
                    {productDescription}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-xl pt-sm">
                    <div className="space-y-xs">
                      <h4 className="font-bold text-body-md text-on-surface">Key Benefits</h4>
                      <ul className="list-disc list-inside text-body-sm text-secondary space-y-xs">
                        <li>Hot &amp; Cold water compatible (up to 93°C)</li>
                        <li>Lead-free and non-toxic for drinking water</li>
                        <li>Corrosion and chemical resistant structure</li>
                        <li>Low thermal expansion rates</li>
                      </ul>
                    </div>
                    <div className="space-y-xs">
                      <h4 className="font-bold text-body-md text-on-surface">Why Contractors Prefer This</h4>
                      <p className="text-body-sm text-secondary leading-relaxed">
                        Easy installation with solvent cement, superior pressure rating, and long-term reliability in high-rise residential and commercial complexes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div id="specifications" className="space-y-lg">
                  <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Technical Specifications</h3>
                  <div className="overflow-hidden rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-high">
                        <tr className="border-b border-surface-variant">
                          <th className="p-md font-bold text-body-sm border-r border-surface-variant">Parameter</th>
                          <th className="p-md font-bold text-body-sm">Value</th>
                        </tr>
                      </thead>
                      <tbody className="text-body-sm">
                        {Object.entries(specifications).map(([key, val], idx) => (
                          <tr key={key} className={idx < Object.keys(specifications).length - 1 ? "border-b border-surface-variant" : ""}>
                            <td className="p-md bg-surface-container-low font-semibold border-r border-surface-variant">{key}</td>
                            <td className="p-md text-secondary">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div id="documents" className="space-y-lg">
                  <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Technical Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="p-lg border border-surface-variant rounded-md flex items-center justify-between hover:bg-surface-container-low transition-colors bg-white">
                      <div className="flex items-center gap-md">
                        <span className="material-symbols-outlined text-error text-3xl">picture_as_pdf</span>
                        <div>
                          <p className="font-bold text-body-sm">Technical Datasheet</p>
                          <p className="text-label-caps text-secondary text-[10px]">PDF • 2.4 MB</p>
                        </div>
                      </div>
                      <button className="material-symbols-outlined text-primary text-[20px]">download</button>
                    </div>
                    <div className="p-lg border border-surface-variant rounded-md flex items-center justify-between hover:bg-surface-container-low transition-colors bg-white">
                      <div className="flex items-center gap-md">
                        <span className="material-symbols-outlined text-error text-3xl">picture_as_pdf</span>
                        <div>
                          <p className="font-bold text-body-sm">Installation Guide</p>
                          <p className="text-label-caps text-secondary text-[10px]">PDF • 1.8 MB</p>
                        </div>
                      </div>
                      <button className="material-symbols-outlined text-primary text-[20px]">download</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'warranty' && (
                <div id="warranty" className="space-y-lg">
                  <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Warranty Information</h3>
                  <p className="text-body-sm text-secondary leading-relaxed">
                    Astral Poly Technik Limited provides a comprehensive **12-Year Limited Manufacturer Warranty** against defects in materials and workmanship from the date of purchase. For warranty claims or detailed terms, please check the warranty card supplied inside the shipment or contact the ARCUS procurement desk.
                  </p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div id="shipping" className="space-y-lg">
                  <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Shipping &amp; Logistics</h3>
                  <p className="text-body-sm text-secondary leading-relaxed">
                    We process and dispatch all plumbing orders from central logistics hubs in Bangalore, Mumbai, and Chennai.
                  </p>
                  <div className="overflow-hidden rounded-md border border-surface-variant max-w-md">
                    <div className="grid grid-cols-2 p-sm bg-surface-container-high border-b border-surface-variant font-bold text-body-sm">
                      <div>Destination City</div>
                      <div>Delivery Window</div>
                    </div>
                    <div className="grid grid-cols-2 p-sm border-b border-surface-variant text-body-sm">
                      <div>Bangalore Hub</div>
                      <div className="text-secondary">1-2 Business Days</div>
                    </div>
                    <div className="grid grid-cols-2 p-sm border-b border-surface-variant text-body-sm">
                      <div>Chennai Hub</div>
                      <div className="text-secondary">2-3 Business Days</div>
                    </div>
                    <div className="grid grid-cols-2 p-sm text-body-sm">
                      <div>Mumbai / Delhi</div>
                      <div className="text-secondary">3-5 Business Days</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Certifications & Shipping details */}
            <div className="lg:col-span-4 flex flex-col gap-xl">
              <div className="p-xl bg-white rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h4 className="font-bold text-body-md text-on-surface mb-md">Standards &amp; Certifications</h4>
                <div className="grid grid-cols-3 gap-md grayscale opacity-60">
                  <div className="aspect-square bg-surface border border-surface-variant rounded flex items-center justify-center font-black text-[11px]">ISI</div>
                  <div className="aspect-square bg-surface border border-surface-variant rounded flex items-center justify-center font-black text-[11px]">ISO</div>
                  <div className="aspect-square bg-surface border border-surface-variant rounded flex items-center justify-center font-black text-[11px]">ASTM</div>
                </div>
              </div>
              <div className="p-xl bg-white rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h4 className="font-bold text-body-md text-on-surface mb-md">Quick Logistics Check</h4>
                <div className="flex flex-col gap-md text-body-sm">
                  <div className="flex justify-between border-b border-surface-variant pb-xs">
                    <span className="text-secondary">Dispatch Window</span>
                    <span className="font-bold text-on-surface">Within 24 Hours</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant pb-xs">
                    <span className="text-secondary">Bangalore Hub</span>
                    <span className="font-bold text-on-surface">1-2 Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Chennai Hub</span>
                    <span className="font-bold text-on-surface">2-3 Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Everything You Need Section */}
        <section id="everything-you-need-section" className="w-full bg-[#FFFFFF] py-[96px] border-t border-surface-variant select-none">
          <div className="max-w-[1320px] mx-auto px-lg">
            <div className="text-left mb-12">
              <h2 className="font-sans font-bold text-[40px] text-[#0A0A0A] leading-[1.2] mb-sm">
                Everything You Need
              </h2>
              <p className="font-sans font-medium text-[18px] text-[#6C757D] max-w-[720px]">
                Complete your purchase with recommended products frequently used alongside this item.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] items-start">
              {/* Left Section: Recommended Products */}
              <div id="recommended-products-grid" className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                {recommendedProducts.map((item) => (
                  <div key={item.id} className="w-full h-[220px] bg-white border border-[#E9ECEF] rounded-[20px] p-lg flex flex-col justify-between transition-all duration-200 ease-out transform hover:-translate-y-1 hover:border-primary hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] relative group select-none text-left">
                    {/* Top Section */}
                    <div className="flex justify-between items-center w-full">
                      <label className="flex items-center gap-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRecommendations[item.id]}
                          onChange={() => toggleRecSelection(item.id)}
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer accent-[#FFC107]"
                        />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary font-label-caps ml-1">
                          Select Product
                        </span>
                      </label>
                      <span className="text-[11px] font-bold text-green-600 bg-green-50 px-sm py-0.5 rounded-full">
                        {item.stock}
                      </span>
                    </div>

                    {/* Middle Section */}
                    <div className="flex gap-md items-center mt-sm">
                      <div className="w-[80px] h-[80px] bg-surface-container rounded-md overflow-hidden flex items-center justify-center shrink-0 border border-[#E9ECEF]">
                        <img className="w-full h-full object-contain p-xs" src={item.image} alt={item.name} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-bold text-body-sm text-on-surface truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-secondary font-label-caps uppercase mt-0.5">
                          {item.category}
                        </p>
                        <p className="font-black text-body-md text-on-surface mt-xs">
                          ₹{item.price.toFixed(2)} <span className="text-[11px] text-secondary font-normal">/ Unit</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-center pt-md border-t border-[#E9ECEF] mt-sm">
                      <span className="text-[11px] font-bold text-secondary font-label-caps">
                        Recommended Qty
                      </span>
                      <div className="flex items-center bg-[#F8F9FA] rounded-md border border-[#E9ECEF] overflow-hidden scale-90 origin-right">
                        <button
                          type="button"
                          disabled={!selectedRecommendations[item.id]}
                          onClick={() => handleRecQtyChange(item.id, getRecQty(item.id, item.multiplier) - 1)}
                          className={`px-sm py-1 hover:bg-[#E9ECEF] transition-colors font-bold text-body-sm ${!selectedRecommendations[item.id] ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          disabled={!selectedRecommendations[item.id]}
                          value={getRecQty(item.id, item.multiplier)}
                          onChange={(e) => handleRecQtyChange(item.id, Number(e.target.value))}
                          className={`w-12 bg-transparent border-none text-center font-bold focus:ring-0 text-xs text-on-surface ${!selectedRecommendations[item.id] ? 'opacity-40' : ''}`}
                        />
                        <button
                          type="button"
                          disabled={!selectedRecommendations[item.id]}
                          onClick={() => handleRecQtyChange(item.id, getRecQty(item.id, item.multiplier) + 1)}
                          className={`px-sm py-1 hover:bg-[#E9ECEF] transition-colors font-bold text-body-sm ${!selectedRecommendations[item.id] ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Section: Project Summary Card */}
              <div className="lg:col-span-4 w-full">
                <div className="lg:sticky lg:top-[120px] flex flex-col gap-md">
                  {qty > 500 && (
                    <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-[16px] p-5 text-left flex flex-col gap-sm">
                      <div className="flex items-center gap-sm text-primary">
                        <span className="material-symbols-outlined text-[24px]">info</span>
                        <span className="font-bold text-body-sm text-[#0A0A0A]">Procurement Estimate</span>
                      </div>
                      <p className="text-[#6C757D] text-[12px] leading-relaxed">
                        Based on your selected quantity, we have calculated the recommended materials required for project completion.
                      </p>
                    </div>
                  )}

                  <div className="bg-[#FFFDF5] border border-[#FFE082] rounded-[24px] p-8 text-left flex flex-col gap-lg shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <h3 className="font-headline-h3 text-[24px] text-[#0A0A0A] font-bold">
                      Project Summary
                    </h3>

                    <div className="flex flex-col gap-sm border-b border-[#FFE082]/60 pb-md text-body-sm text-secondary">
                      <div className="flex justify-between">
                        <span>Products Selected</span>
                        <span className="font-bold text-on-surface">{totalProductsSelected} Item{totalProductsSelected > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Units</span>
                        <span className="font-bold text-on-surface">{totalUnits.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-white/50 p-md rounded border border-[#FFE082]/30 mt-xs text-[12px] space-y-1.5 font-medium max-h-48 overflow-y-auto no-scrollbar">
                        <div className="flex justify-between text-on-surface font-semibold">
                          <span className="truncate">Astral CPVC Pipe</span>
                          <span>× {qty}</span>
                        </div>
                        {recommendedProducts.map((item) => {
                          if (selectedRecommendations[item.id]) {
                            return (
                              <div key={item.id} className="flex justify-between text-secondary">
                                <span className="truncate">{item.name}</span>
                                <span>× {getRecQty(item.id, item.multiplier)}</span>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-sm pb-md border-b border-[#FFE082]/60">
                      <div className="flex justify-between text-body-sm text-secondary">
                        <span>Individual Total</span>
                        <span className="font-semibold text-on-surface">₹{individualTotal.toLocaleString('en-IN')}</span>
                      </div>
                      {bundleSavings > 0 && (
                        <div className="flex justify-between text-body-sm text-[#2E7D32]">
                          <span>Bundle Savings ({bundleDiscountPercent}%)</span>
                          <span className="font-semibold">-₹{bundleSavings.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline mt-xs">
                        <span className="font-bold text-body-md text-on-surface">Final Total</span>
                        <span className="font-black text-headline-h3 text-primary text-[24px]">
                          ₹{finalTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {bundleSavings > 0 && (
                        <div className="bg-[#E8F5E9] text-[#2E7D32] rounded-full px-4 py-2 text-center text-xs font-bold w-fit mt-xs self-start">
                          You Save ₹{bundleSavings.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    {nextBundleTier && (
                      <div className="flex flex-col gap-xs pb-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-secondary">
                            Add {nextBundleTier.count - totalProductsSelected} More Product{(nextBundleTier.count - totalProductsSelected) > 1 ? 's' : ''} to unlock {nextBundleTier.discount}% Bundle Savings
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(totalProductsSelected / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-md">
                      <button 
                        onClick={handleAddKitToCart}
                        className="w-full h-14 bg-primary text-[#0A0A0A] font-semibold rounded-[12px] hover:bg-[#fabd00] transition-colors flex items-center justify-center gap-sm text-[14px]"
                      >
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                        {qty > 500 ? 'Add Complete Procurement Package' : 'Add Complete Kit To Cart'}
                      </button>
                      <button 
                        onClick={() => {
                          document.getElementById('recommended-products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="w-full h-12 border border-[#0A0A0A] text-[#0A0A0A] font-semibold rounded-[12px] hover:bg-surface-container transition-colors flex items-center justify-center text-[13px]"
                      >
                        Customize Bundle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* High Volume Procurement Desk Form */}
        <section id="enterprise-rfq-section" className="mt-5xl bg-[#1a1c1c] text-white p-xxl md:p-5xl rounded-md relative overflow-hidden border border-surface-variant">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-xxl items-center text-left">
            <div className="flex flex-col gap-lg">
              <span className="bg-primary text-[#121212] font-bold px-md py-1 rounded w-fit text-[10px] font-label-caps tracking-wider">
                ENTERPRISE RFQ
              </span>
              <h2 className="font-headline-h2 text-headline-h2 leading-none text-white text-headline-h2-mobile md:text-headline-h2">
                High Volume Procurement
              </h2>
              <p className="text-body-lg text-secondary-fixed-dim opacity-80 leading-relaxed">
                Planning a major project? Get custom logistics, direct factory pricing, and priority allocation for orders exceeding 1,000 units.
              </p>
            </div>
            <div className="bg-white p-xl rounded-md text-on-surface shadow border border-surface-variant">
              {rfqSubmitted ? (
                <div className="py-xl text-center space-y-md">
                  <span className="material-symbols-outlined text-[54px] text-green-600 block">verified</span>
                  <h3 className="font-bold text-headline-h3 text-[22px] text-on-surface">Bulk RFQ Submitted</h3>
                  <p className="text-secondary text-body-sm max-w-sm mx-auto">
                    We will analyze structural requirements and revert with BOQs and concrete slab logistics quotes in 2 hours.
                  </p>
                  <button onClick={() => setRfqSubmitted(false)} className="text-primary font-bold hover:underline text-xs block mx-auto">
                    Submit Another Quote
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRfqSubmit} className="flex flex-col gap-lg">
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Project Type</label>
                      <select
                        value={rfqForm.projectType}
                        onChange={(e) => setRfqForm({ ...rfqForm, projectType: e.target.value })}
                        className="bg-surface-container-low border border-surface-variant rounded-md h-11 px-md text-body-sm focus:border-2 focus:border-primary-container focus:ring-0 outline-none"
                      >
                        <option value="Commercial">Commercial</option>
                        <option value="Residential">Residential</option>
                        <option value="Industrial">Industrial</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Estimated Qty</label>
                      <input
                        type="number"
                        value={rfqForm.qty}
                        onChange={(e) => setRfqForm({ ...rfqForm, qty: e.target.value })}
                        className="bg-white border border-surface-variant rounded-md h-11 px-md text-body-sm focus:border-2 focus:border-primary-container focus:ring-0 outline-none"
                        placeholder="e.g. 5000"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Contact Email</label>
                    <input
                      type="email"
                      value={rfqForm.email}
                      onChange={(e) => setRfqForm({ ...rfqForm, email: e.target.value })}
                      className="bg-white border border-surface-variant rounded-md h-11 px-md text-body-sm focus:border-2 focus:border-primary-container focus:ring-0 outline-none"
                      placeholder="procurement@company.com"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-primary-container text-on-primary-container font-bold h-16 rounded-md hover:bg-[#fabd00] transition-colors font-label-caps text-[16px] shadow-sm">
                    Submit RFQ
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Related Accessories */}
        <section className="mt-5xl text-left border-t border-surface-variant pt-4xl">
          <div className="flex justify-between items-center mb-xl">
            <h2 className="font-headline-h3 text-headline-h3 text-on-surface">Frequently Bought Together</h2>
            <a className="text-primary hover:text-[#fabd00] font-bold text-body-sm transition-colors" href="#/materials">
              View All Accessories
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {[
              {
                name: 'Astral CPVC Elbow 90°',
                spec: '1 Inch',
                price: '₹45.00',
                img: '/pdp_cpvc_elbow.png',
              },
              {
                name: 'Astral CPVC Tee',
                spec: '1x1x1 Inch',
                price: '₹58.00',
                img: '/pdp_cpvc_tee.png',
              },
              {
                name: 'CPVC Solvent Cement',
                spec: '100ml Tin',
                price: '₹110.00',
                img: '/pdp_cpvc_solvent.png',
              },
              {
                name: 'Hack Saw Blade',
                spec: '12 Inch',
                price: '₹35.00',
                img: '/pdp_cpvc_pipe_fittings_group.png',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-lg rounded-md border border-surface-variant hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="aspect-square rounded-md overflow-hidden bg-surface-container-low mb-md flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={item.img}
                    alt={item.name}
                  />
                </div>
                <h4 className="text-body-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                <p className="text-label-caps text-secondary text-[10px] mt-xs">{item.spec}</p>
                <div className="mt-sm flex justify-between items-center pt-xs border-t border-surface-variant">
                  <span className="font-black text-on-surface">{item.price}</span>
                  <span className="material-symbols-outlined text-primary-container text-[20px]">add_circle</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-5xl grid grid-cols-1 lg:grid-cols-3 gap-xxl text-left border-t border-surface-variant pt-4xl">
          <div className="lg:col-span-1 space-y-md">
            <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Reviews</h3>
            <div className="flex items-end gap-md">
              <span className="text-[54px] font-black text-on-surface leading-none">4.8</span>
              <div className="flex flex-col gap-xs pb-xs">
                <div className="flex text-primary-container">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="text-label-caps text-secondary text-[10px] uppercase font-bold">
                  Based on 124 corporate buys
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-md pt-sm">
              <div className="flex items-center gap-md">
                <span className="w-4 text-body-sm font-semibold">5</span>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-primary-container"></div>
                </div>
                <span className="w-8 text-body-sm text-secondary text-right">85%</span>
              </div>
              <div className="flex items-center gap-md">
                <span className="w-4 text-body-sm font-semibold">4</span>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="w-[12%] h-full bg-primary-container"></div>
                </div>
                <span className="w-8 text-body-sm text-secondary text-right">12%</span>
              </div>
            </div>

            {/* AI Review Summary Card */}
            <div className="mt-xl p-lg bg-surface-container-low border border-surface-variant rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-md text-left">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-body-md text-on-surface">AI Review Summary</h4>
                <span className="bg-primary-container/10 text-on-primary-fixed-variant font-label-caps px-md py-0.5 rounded text-[9px] font-bold tracking-wider flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[12px] font-bold">auto_awesome</span>
                  AI INSIGHT
                </span>
              </div>
              <p className="text-secondary text-[12px] leading-relaxed">
                Synthesized from 124 verified buyer reviews, focusing on core project parameters:
              </p>
              <div className="space-y-sm text-body-sm text-on-surface pt-xs">
                <div className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-[#2E7D32] text-[18px] mt-0.5">check_circle</span>
                  <p className="text-[12px]">
                    <strong className="font-bold">SDR 11 Compliance:</strong> 100% of reviews confirm precise fit and high-pressure resilience in high-rise plumbing.
                  </p>
                </div>
                <div className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-[#2E7D32] text-[18px] mt-0.5">local_shipping</span>
                  <p className="text-[12px]">
                    <strong className="font-bold">Logistics Efficiency:</strong> Delivery noted as up to 4 hours faster than local offline distributors.
                  </p>
                </div>
                <div className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-[#2E7D32] text-[18px] mt-0.5">payments</span>
                  <p className="text-[12px]">
                    <strong className="font-bold">Direct Cost Savings:</strong> Centralized direct-to-site billing saved contractors up to 15% on taxes and logistics.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-xl">
            {visibleReviews.map((review, rIdx) => (
              <div key={rIdx} className="p-xl bg-white border border-surface-variant rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-left">
                <div className="flex justify-between items-start mb-md">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center font-bold text-[#121212] font-label-caps text-[14px]">
                      {review.initials}
                    </div>
                    <div>
                      <p className="font-bold text-body-sm text-on-surface">
                        {review.name} <span className="ml-sm font-normal text-secondary text-[11px]">{review.role}</span>
                      </p>
                      <div className="flex text-primary-container text-[14px] mt-xs">
                        {Array.from({ length: review.rating }).map((_, idx) => (
                          <span key={idx} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="font-label-caps text-secondary text-[10px] uppercase">{review.date}</span>
                </div>
                <p className="text-body-md text-on-surface italic leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}

            {reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="mt-md bg-[#121212] hover:bg-[#2c2c2c] text-white transition-colors py-md px-xl rounded-md font-bold text-[12px] w-fit self-start uppercase tracking-wider font-label-caps shadow-sm"
              >
                {showAllReviews ? 'Show Less' : `Read All Reviews (${reviews.length})`}
              </button>
            )}
          </div>
        </section>

        {/* Recently Viewed Products */}
        <section className="mt-5xl text-left border-t border-surface-variant pt-4xl">
          <h3 className="font-headline-h3 text-headline-h3 text-on-surface mb-xl">Recently Viewed</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {[
              {
                name: 'CPVC Solvent Cement',
                price: '₹110.00',
                img: '/pdp_cpvc_solvent.png',
              },
              {
                name: 'Astral CPVC Pipe 1.5 Inch',
                price: '₹245.00',
                img: '/pdp_cpvc_pipe_main.png',
              },
              {
                name: 'TMT Steel Bar 12mm',
                price: '₹680.00',
                img: '/services_house_construction.png',
              },
              {
                name: 'OPC 53 Grade Cement',
                price: '₹420.00',
                img: '/pdp_cpvc_pipe_warehouse.png',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-sm group cursor-pointer bg-white border border-surface-variant p-md rounded-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all">
                <div className="aspect-square bg-surface-container-low rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={item.img}
                    alt={item.name}
                  />
                </div>
                <h4 className="text-body-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                <p className="font-black text-body-sm text-on-surface mt-xs">{item.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E9ECEF] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[55] px-lg py-sm flex items-center justify-between lg:hidden h-[72px] text-left select-none animate-slide-up">
          <div className="flex flex-col">
            <span className="text-[10px] text-secondary font-label-caps uppercase font-bold">Total Bundle Price</span>
            <span className="text-[20px] font-black text-on-surface leading-tight">₹{finalTotal.toLocaleString('en-IN')}</span>
            {bundleSavings > 0 && (
              <span className="text-[10px] text-[#2E7D32] font-bold">Save ₹{bundleSavings.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button className="bg-primary text-[#0A0A0A] px-xl h-11 rounded-[12px] font-bold text-xs hover:bg-[#fabd00] transition-colors flex items-center gap-xs shadow-sm">
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            {qty > 500 ? 'Add Procurement' : 'Add Complete Kit'}
          </button>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[99] flex flex-col items-center justify-center select-none animate-fade-in">
          {/* Top Bar with Controls */}
          <div className="absolute top-0 left-0 w-full p-lg flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent">
            <span className="font-bold text-body-sm">
              Astral CPVC Pipe Gallery ({activeImage + 1} / {images.length})
            </span>
            <div className="flex items-center gap-md">
              <button
                onClick={() => setLightboxScale(prev => Math.max(1, prev - 0.25))}
                className="p-sm hover:text-[#ffc107] transition-colors text-white flex items-center"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[24px]">zoom_out</span>
              </button>
              <button
                onClick={() => setLightboxScale(prev => Math.min(3, prev + 0.25))}
                className="p-sm hover:text-[#ffc107] transition-colors text-white flex items-center"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[24px]">zoom_in</span>
              </button>
              <button
                onClick={() => setLightboxScale(1)}
                className="p-sm hover:text-[#ffc107] transition-colors text-white flex items-center"
                title="Reset Zoom"
              >
                <span className="material-symbols-outlined text-[24px]">restart_alt</span>
              </button>
              <div className="h-6 w-px bg-white/20 mx-xs"></div>
              <button
                onClick={() => setShowLightbox(false)}
                className="p-sm hover:text-[#ffc107] transition-colors text-white flex items-center bg-white/10 rounded-full hover:bg-white/20"
                title="Close"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
          </div>

          {/* Left Arrow */}
          <button
            onClick={() => setActiveImage(prev => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-md bg-black/40 hover:bg-black/60 rounded-full text-white hover:text-[#ffc107] transition-all z-[100]"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_left</span>
          </button>

          {/* Image Container with Zoom Scale */}
          <div className="w-full h-full max-w-[85vw] max-h-[80vh] flex items-center justify-center overflow-auto p-lg">
            <img
              src={images[activeImage]}
              alt="CPVC pipe large preview"
              className="max-w-full max-h-full object-contain rounded transition-transform duration-200"
              style={{ transform: `scale(${lightboxScale})` }}
            />
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => setActiveImage(prev => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-md bg-black/40 hover:bg-black/60 rounded-full text-white hover:text-[#ffc107] transition-all z-[100]"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_right</span>
          </button>

          {/* Bottom Thumbnails Strip */}
          <div className="absolute bottom-6 flex gap-sm bg-black/40 p-sm rounded border border-white/10 max-w-[90vw] overflow-x-auto">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveImage(idx)
                  setLightboxScale(1)
                }}
                className={`w-16 h-16 bg-white rounded cursor-pointer border overflow-hidden p-xs transition-all ${
                  activeImage === idx ? 'border-2 border-[#ffc107] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img className="w-full h-full object-cover rounded-xs" src={img} alt="Thumbnail preview" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick RFQ Popup Modal (Type 3) */}
      {showQuickRfqModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white text-gray-900 rounded p-6 max-w-md w-full shadow relative text-left border border-gray-150">
            {/* Close Button */}
            <button
              onClick={() => setShowQuickRfqModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {quickRfqSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                <span className="material-symbols-outlined text-[#10B981] text-5xl">
                  check_circle
                </span>
                <h3 className="text-xl font-bold text-gray-900">Request Submitted!</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Your bulk pricing inquiry for <strong>{productName}</strong> has been received. Our sales managers will prepare a custom quotation and contact you shortly.
                </p>
                <button
                  onClick={() => setShowQuickRfqModal(false)}
                  className="mt-4 px-6 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickRfqSubmit} className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Request Bulk Pricing</h3>
                  <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                    Product: {productName}
                  </p>
                </div>

                {quickRfqError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-2 text-red-700 text-xs rounded">
                    {quickRfqError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Quantity *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={quickRfqForm.quantity}
                      onChange={(e) => setQuickRfqForm({ ...quickRfqForm, quantity: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-950"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Target Budget (INR)</label>
                    <input
                      type="number"
                      value={quickRfqForm.budget}
                      onChange={(e) => setQuickRfqForm({ ...quickRfqForm, budget: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-950"
                      placeholder="e.g. 120000"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mobile Number *</label>
                  <input
                    required
                    type="tel"
                    value={quickRfqForm.phone}
                    onChange={(e) => setQuickRfqForm({ ...quickRfqForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-950"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Notes / Requirements</label>
                  <textarea
                    rows={3}
                    value={quickRfqForm.notes}
                    onChange={(e) => setQuickRfqForm({ ...quickRfqForm, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-950 resize-none"
                    placeholder="Specific delivery instructions, brands, or payment terms desired..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-primary text-gray-950 hover:bg-[#fabd00] font-bold uppercase tracking-wider text-xs rounded transition-colors mt-2"
                >
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-on-surface text-white px-lg py-md rounded shadow z-50 animate-fade-in flex items-center gap-sm font-semibold border border-white/10 text-body-sm">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
