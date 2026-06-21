/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { validateCheckoutForm } from '../../shared/validation';

interface RecommendedItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  rating: string;
  image: string;
  categoryTitle: string;
  desc: string;
  brand: string;
}

const RECOMMENDED_ITEMS: RecommendedItem[] = [
  {
    id: 'rec-wall-putty',
    name: 'Birla White WallCare Putty',
    price: 950,
    unit: '/ Bag',
    rating: '4.9',
    image: '/pdp_ultratech_cement.png',
    categoryTitle: 'Paints',
    desc: 'Premium white-cement based wall putty for mirror-smooth walls.',
    brand: 'Birla White'
  },
  {
    id: 'rec-waterproofing',
    name: 'Dr. Fixit Super Latex SBR',
    price: 1200,
    unit: '/ Can',
    rating: '4.8',
    image: '/pdp_cpvc_pipe_main.png',
    categoryTitle: 'Paints',
    desc: 'Styrene-butadiene rubber based liquid waterproofing agent.',
    brand: 'Dr. Fixit'
  },
  {
    id: 'rec-paint-roller',
    name: 'Asian Paints TruCare Roller',
    price: 240,
    unit: '/ Unit',
    rating: '4.7',
    image: '/pdp_supreme_elbow.png',
    categoryTitle: 'Paints',
    desc: 'High-density woven fabric roller for exterior/interior paint.',
    brand: 'Asian Paints'
  },
  {
    id: 'rec-scraper-blade',
    name: 'TruCare Scraper Putty Knife',
    price: 95,
    unit: '/ Unit',
    rating: '4.6',
    image: '/pdp_supreme_elbow.png',
    categoryTitle: 'Paints',
    desc: 'Flexible stainless steel blade for wall putty and finishing.',
    brand: 'Asian Paints'
  },
  {
    id: 'rec-paint-brush',
    name: 'Asian Paints Paint Brush 4"',
    price: 135,
    unit: '/ Unit',
    rating: '4.7',
    image: '/pdp_supreme_elbow.png',
    categoryTitle: 'Paints',
    desc: 'Premium synthetic bristles for superior paint pickup.',
    brand: 'Asian Paints'
  },
  {
    id: 'rec-solvent-cement',
    name: 'Astral CPVC Solvent Cement',
    price: 180,
    unit: '/ Can',
    rating: '4.9',
    image: '/pdp_cpvc_elbow.png',
    categoryTitle: 'Plumbing',
    desc: 'Heavy duty, fast setting solvent cement for CPVC joints.',
    brand: 'Astral'
  },
  {
    id: 'rec-havells-mcb',
    name: 'Havells 16A SP MCB',
    price: 185,
    unit: '/ Piece',
    rating: '4.8',
    image: '/pdp_finolex_wire.png',
    categoryTitle: 'Electrical',
    desc: 'Euro-II Series 16A SP MCB with 10kA breaking capacity.',
    brand: 'Havells'
  },
  {
    id: 'rec-insulation-tape',
    name: 'Steelgrip Insulation Tape',
    price: 18,
    unit: '/ Roll',
    rating: '4.7',
    image: '/pdp_finolex_wire.png',
    categoryTitle: 'Electrical',
    desc: 'High quality self-adhesive PVC tape for electrical joints.',
    brand: 'Steelgrip'
  },
  {
    id: 'rec-binding-wire',
    name: 'Tata Wiron Binding Wire (1kg)',
    price: 90,
    unit: '/ Coil',
    rating: '4.6',
    image: '/pdp_ultratech_cement.png',
    categoryTitle: 'Steel',
    desc: 'High-flexibility annealed steel wire for slab rebars.',
    brand: 'Tata'
  },
  {
    id: 'rec-trowel',
    name: 'Stanley Plastering Trowel',
    price: 320,
    unit: '/ Piece',
    rating: '4.8',
    image: '/pdp_ultratech_cement.png',
    categoryTitle: 'Cement',
    desc: 'Rust-resistant flat steel trowel for wall plastering.',
    brand: 'Stanley'
  }
];

export const Checkout: React.FC = () => {
  const { cartItems, cartTotal, clearCart, updateQty, removeFromCart, addToCart } = useCart();
  const { user, loading, refreshUser } = useAuth();
  const isB2b = !!user && ['Business', 'Contractor', 'Supplier', 'Professional'].includes(user.role);
  
  // State for Address Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    billingSameAsShipping: true,
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    paymentMethod: 'Pay on Delivery / Pay on Site'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States & Refs for Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`arcus-user-addresses-${user.id}`);
      if (saved) {
        try {
          setSavedAddresses(JSON.parse(saved));
        } catch {
          setSavedAddresses([
            'Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048',
            'Site B, 24th Main, HSR Layout, Sector 2, Bengaluru - 560102'
          ]);
        }
      } else {
        setSavedAddresses([
          'Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048',
          'Site B, 24th Main, HSR Layout, Sector 2, Bengaluru - 560102'
        ]);
      }
    }
  }, [user]);

  const handleSelectSavedAddress = (fullAddr: string) => {
    const zipMatch = fullAddr.match(/\b\d{6}\b/);
    const zipCode = zipMatch ? zipMatch[0] : '';
    
    let cleanAddr = fullAddr.replace(/\b\d{6}\b/, '').trim();
    cleanAddr = cleanAddr.replace(/^[-,\s]+|[-,\s]+$/g, '').trim();
    
    const parts = cleanAddr.split(',').map(p => p.trim()).filter(Boolean);
    
    if (parts.length > 0) {
      let city = '';
      let state = '';
      const streetAddressParts = [...parts];

      const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
        'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
        'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
        'Uttarakhand', 'West Bengal', 'Delhi'
      ];

      const findStateIndex = (arr: string[]) => {
        for (let i = arr.length - 1; i >= 0; i--) {
          const itemLower = arr[i].toLowerCase();
          if (indianStates.some(s => {
            const sLower = s.toLowerCase();
            return itemLower === sLower || itemLower.endsWith(' ' + sLower) || itemLower.startsWith(sLower + ' ');
          })) {
            return i;
          }
        }
        return -1;
      };

      const stateIdx = findStateIndex(streetAddressParts);
      if (stateIdx !== -1) {
        state = streetAddressParts[stateIdx];
        streetAddressParts.splice(stateIdx, 1);
      }

      if (streetAddressParts.length > 0) {
        city = streetAddressParts[streetAddressParts.length - 1];
        streetAddressParts.splice(streetAddressParts.length - 1, 1);
      }

      if (!state) state = 'Karnataka';
      if (!city) city = 'Bengaluru';

      const addressLine1 = streetAddressParts.join(', ');

      setFormData(prev => ({
        ...prev,
        addressLine1: addressLine1 || cleanAddr,
        city: city,
        state: state,
        zipCode: zipCode
      }));
    }
  };

  const handleSelectSavedBillingAddress = (fullAddr: string) => {
    const zipMatch = fullAddr.match(/\b\d{6}\b/);
    const zipCode = zipMatch ? zipMatch[0] : '';
    
    let cleanAddr = fullAddr.replace(/\b\d{6}\b/, '').trim();
    cleanAddr = cleanAddr.replace(/^[-,\s]+|[-,\s]+$/g, '').trim();
    
    const parts = cleanAddr.split(',').map(p => p.trim()).filter(Boolean);
    
    if (parts.length > 0) {
      let city = '';
      let state = '';
      const streetAddressParts = [...parts];

      const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
        'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
        'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
        'Uttarakhand', 'West Bengal', 'Delhi'
      ];

      const findStateIndex = (arr: string[]) => {
        for (let i = arr.length - 1; i >= 0; i--) {
          const itemLower = arr[i].toLowerCase();
          if (indianStates.some(s => {
            const sLower = s.toLowerCase();
            return itemLower === sLower || itemLower.endsWith(' ' + sLower) || itemLower.startsWith(sLower + ' ');
          })) {
            return i;
          }
        }
        return -1;
      };

      const stateIdx = findStateIndex(streetAddressParts);
      if (stateIdx !== -1) {
        state = streetAddressParts[stateIdx];
        streetAddressParts.splice(stateIdx, 1);
      }

      if (streetAddressParts.length > 0) {
        city = streetAddressParts[streetAddressParts.length - 1];
        streetAddressParts.splice(streetAddressParts.length - 1, 1);
      }

      if (!state) state = 'Karnataka';
      if (!city) city = 'Bengaluru';

      const billingAddressLine1 = streetAddressParts.join(', ');

      setFormData(prev => ({
        ...prev,
        billingAddressLine1: billingAddressLine1 || cleanAddr,
        billingCity: city,
        billingState: state,
        billingZipCode: zipCode
      }));
    }
  };

  // States for Coupons and Offers
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // States & Refs for Recommendation Carousel
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleAddRecommended = (item: RecommendedItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      images: [item.image],
      categoryTitle: item.categoryTitle
    }, 1);
    
    setAddedItemIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const getRecommendedItems = () => {
    const cartCategories = cartItems.map(item => item.categoryTitle.toLowerCase());
    
    const hasPaintOrPutty = cartItems.some(item => 
      item.name.toLowerCase().includes('putty') || 
      item.name.toLowerCase().includes('paint') || 
      item.name.toLowerCase().includes('fixit') ||
      item.categoryTitle.toLowerCase() === 'paints'
    );
    
    const hasPlumbing = cartCategories.includes('plumbing');
    const hasElectrical = cartCategories.includes('electrical');
    const hasCementOrSteel = cartCategories.includes('cement') || cartCategories.includes('steel');
    
    return RECOMMENDED_ITEMS.filter(item => {
      return !cartItems.some(cartItem => cartItem.id === item.id || cartItem.name.toLowerCase() === item.name.toLowerCase());
    }).sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      const catA = a.categoryTitle.toLowerCase();
      const catB = b.categoryTitle.toLowerCase();
      
      if (hasPaintOrPutty) {
        if (catA === 'paints') scoreA += 10;
        if (catB === 'paints') scoreB += 10;
      }
      if (hasPlumbing) {
        if (catA === 'plumbing') scoreA += 10;
        if (catB === 'plumbing') scoreB += 10;
      }
      if (hasElectrical) {
        if (catA === 'electrical') scoreA += 10;
        if (catB === 'electrical') scoreB += 10;
      }
      if (hasCementOrSteel) {
        if (catA === 'cement' || catA === 'steel') scoreA += 10;
        if (catB === 'cement' || catB === 'steel') scoreB += 10;
      }
      
      return scoreB - scoreA;
    });
  };

  // Prefill details from user profile and load saved checkout history
  useEffect(() => {
    if (user) {
      const savedKey = `arcus-saved-checkout-details-${user.id}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Prioritize live auth profile info if not set in cache
            name: user.name || parsed.name || '',
            phone: user.phone || parsed.phone || '',
            companyName: user.companyName || parsed.companyName || '',
            gstNumber: user.gstNumber || parsed.gstNumber || ''
          }));
          return;
        } catch (e) {
          console.warn('Failed to parse cached address data:', e);
        }
      }

      // If no localStorage, try to fetch last order from backend to prefill
      const fetchLastOrder = async () => {
        try {
          const token = localStorage.getItem('arcus_token');
          if (!token) return;
          const res = await fetch('http://localhost:5000/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const orders = await res.json();
            if (orders && orders.length > 0) {
              // Get the latest order (last item in array)
              const latest = orders[orders.length - 1];
              const shippingStr = latest.shippingAddress || '';
              const parts = shippingStr.split(',').map((p: string) => p.trim());
              if (parts.length >= 3) {
                const zipPart = parts[parts.length - 1]; // e.g. "Karnataka - 560001" or "560001"
                const zipMatch = zipPart.match(/\d{6}/);
                const zipCode = zipMatch ? zipMatch[0] : '';
                
                const state = zipPart.replace(zipCode, '').replace('-', '').trim() || parts[parts.length - 2] || '';
                const city = parts[parts.length - (zipPart.includes('-') ? 2 : 3)] || '';
                const addressLine1 = parts.slice(0, parts.length - (zipPart.includes('-') ? 2 : 3)).join(', ');

                // Parse billing same as shipping
                const billingStr = latest.billingAddress || '';
                const billingSameAsShipping = shippingStr === billingStr;

                let billingAddressLine1 = '';
                let billingCity = '';
                let billingState = '';
                let billingZipCode = '';

                if (!billingSameAsShipping) {
                  const bParts = billingStr.split(',').map((p: string) => p.trim());
                  if (bParts.length >= 3) {
                    const bZipPart = bParts[bParts.length - 1];
                    const bZipMatch = bZipPart.match(/\d{6}/);
                    billingZipCode = bZipMatch ? bZipMatch[0] : '';
                    billingState = bZipPart.replace(billingZipCode, '').replace('-', '').trim() || bParts[bParts.length - 2] || '';
                    billingCity = bParts[bParts.length - (bZipPart.includes('-') ? 2 : 3)] || '';
                    billingAddressLine1 = bParts.slice(0, bParts.length - (bZipPart.includes('-') ? 2 : 3)).join(', ');
                  }
                }

                setFormData(prev => ({
                  ...prev,
                  name: user.name || prev.name || '',
                  phone: user.phone || prev.phone || '',
                  companyName: user.companyName || prev.companyName || '',
                  gstNumber: user.gstNumber || latest.gstNumber || prev.gstNumber || '',
                  addressLine1,
                  city,
                  state,
                  zipCode,
                  billingSameAsShipping,
                  billingAddressLine1,
                  billingCity,
                  billingState,
                  billingZipCode
                }));
              }
            }
          }
        } catch (err) {
          console.warn('Failed to fetch last order for autopopulate:', err);
        }
      };

      fetchLastOrder();

      // Default prefill fallback
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
        gstNumber: user.gstNumber || ''
      }));
    }
  }, [user]);

  // If loading user profile, show a nice loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect prompt if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-xl">
        <div className="max-w-md w-full bg-white border border-surface-variant p-xxl rounded-2xl shadow-sm text-center">
          <span className="material-symbols-outlined text-[64px] text-primary-container">account_circle</span>
          <h2 className="font-bold text-headline-h3 text-on-surface mt-md">Authentication Required</h2>
          <p className="text-secondary text-body-sm mt-sm">
            To place an order on ARCUS and view your order status, you must be logged into your buyer or business account.
          </p>
          <button 
            onClick={() => window.location.hash = '#/auth?tab=login'}
            className="w-full bg-primary-container text-on-primary-container hover:bg-[#fabd00] h-12 rounded-xl font-bold mt-xl transition-all shadow-sm"
          >
            Log In / Register
          </button>
          <button 
            onClick={() => window.location.hash = '#/'}
            className="w-full border border-surface-variant hover:bg-surface-container-low h-12 rounded-xl font-bold mt-sm transition-all text-secondary"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-xl">
        <div className="max-w-md w-full bg-white border border-surface-variant p-xxl rounded-2xl shadow-sm text-center">
          <span className="material-symbols-outlined text-[64px] text-secondary">shopping_cart</span>
          <h2 className="font-bold text-headline-h3 text-on-surface mt-md">Your Cart is Empty</h2>
          <p className="text-secondary text-body-sm mt-sm">
            You don't have any items in your cart to checkout. Browse our materials catalog to get started.
          </p>
          <button 
            onClick={() => window.location.hash = '#/materials'}
            className="w-full bg-primary-container text-on-primary-container hover:bg-[#fabd00] h-12 rounded-xl font-bold mt-xl transition-all shadow-sm"
          >
            Browse Materials
          </button>
        </div>
      </div>
    );
  }

  // Calculations
  const shippingFee = cartTotal >= 5000 ? 0 : 350;
  
  // Bulk Discount: 5% off if subtotal is >= ₹10,000
  const bulkDiscount = cartTotal >= 10000 ? Math.round(cartTotal * 0.05) : 0;
  
  // Coupon Discount
  const couponDiscount = couponDiscountAmount > 0 
    ? couponDiscountAmount 
    : Math.round(cartTotal * (couponDiscountPercent / 100));
  const totalDiscounts = bulkDiscount + couponDiscount;

  const discountedSubtotal = Math.max(0, cartTotal - totalDiscounts);
  const gstAmount = Math.round(discountedSubtotal * 0.18);
  const finalTotal = discountedSubtotal + shippingFee + gstAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'billingSameAsShipping') {
      setFormData(prev => ({ ...prev, billingSameAsShipping: !prev.billingSameAsShipping }));
      return;
    }
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const getAvailableCoupons = () => {
    if (isB2b) {
      return [
        { code: 'ARCUS10', discount: '10%', desc: 'Exclusive 10% off for verified contractors and builders.', label: 'B2B Special' },
        { code: 'B2B50K', discount: '₹5,000', desc: 'Get ₹5,000 off on bulk B2B orders above ₹50,000.', label: 'Volume Discount' }
      ];
    } else {
      return [
        { code: 'WELCOME5', discount: '5%', desc: 'Get 5% off on your first procurement order.', label: 'First Order' },
        { code: 'HOMEMAKER', discount: '₹500', desc: 'Get ₹500 off on home renovation orders above ₹5,000.', label: 'Home Special' }
      ];
    }
  };

  const handleApplyCoupon = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code.startsWith('BP-')) {
      const stored = localStorage.getItem(`arcus-user-coupons-${user.id}`);
      const userCoupons = stored ? JSON.parse(stored) : [];
      const matched = userCoupons.find((c: { code: string; used: boolean; discountValue: number }) => c.code === code);
      if (matched) {
        if (matched.used) {
          setCouponError('This coupon has already been redeemed.');
          return;
        }
        setAppliedCoupon(code);
        setCouponDiscountAmount(matched.discountValue);
        setCouponDiscountPercent(0);
        setCouponSuccess(`Coupon ${code} applied: ₹${matched.discountValue.toLocaleString()} off subtotal!`);
        return;
      } else {
        setCouponError('This coupon was not found or is not linked to your account.');
        return;
      }
    }

    if (code === 'WELCOME5') {
      setAppliedCoupon('WELCOME5');
      setCouponDiscountPercent(5);
      setCouponDiscountAmount(0);
      setCouponSuccess('Coupon WELCOME5 applied: 5% off subtotal!');
    } else if (code === 'ARCUS10') {
      setAppliedCoupon('ARCUS10');
      setCouponDiscountPercent(10);
      setCouponDiscountAmount(0);
      setCouponSuccess('Coupon ARCUS10 applied: 10% off subtotal!');
    } else if (code === 'B2B50K') {
      if (cartTotal < 50000) {
        setCouponError('This coupon requires a minimum subtotal of ₹50,000.');
        return;
      }
      setAppliedCoupon('B2B50K');
      setCouponDiscountAmount(5000);
      setCouponDiscountPercent(0);
      setCouponSuccess('Coupon B2B50K applied: ₹5,000 off subtotal!');
    } else if (code === 'HOMEMAKER') {
      if (cartTotal < 5000) {
        setCouponError('This coupon requires a minimum subtotal of ₹5,000.');
        return;
      }
      setAppliedCoupon('HOMEMAKER');
      setCouponDiscountAmount(500);
      setCouponDiscountPercent(0);
      setCouponSuccess('Coupon HOMEMAKER applied: ₹500 off subtotal!');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
    setCouponDiscountAmount(0);
    setCouponSuccess(null);
    setCouponCode('');
  };

  const validateForm = () => {
    const newErrors = validateCheckoutForm({
      name: formData.name,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      billingSameAsShipping: formData.billingSameAsShipping,
      billingAddressLine1: formData.billingAddressLine1,
      billingCity: formData.billingCity,
      billingState: formData.billingState,
      billingZipCode: formData.billingZipCode
    });

    if (formData.gstNumber && formData.gstNumber.trim()) {
      if (formData.gstNumber.trim().length !== 15) {
        newErrors.gstNumber = 'GSTIN must be 15 characters long if provided';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMessage(null);

    const productsSummary = cartItems.map(item => `${item.name} x ${item.qty}`).join(', ');
    const shippingAddressStr = `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ', ' : ''}${formData.city}, ${formData.state} - ${formData.zipCode}`;
    const billingAddressStr = formData.billingSameAsShipping 
      ? shippingAddressStr 
      : `${formData.billingAddressLine1}, ${formData.billingAddressLine2 ? formData.billingAddressLine2 + ', ' : ''}${formData.billingCity}, ${formData.billingState} - ${formData.billingZipCode}`;

    const orderPayload = {
      products: productsSummary,
      amount: `₹${finalTotal.toLocaleString('en-IN')}`,
      items: cartItems.map(item => ({ name: item.name, qty: item.qty, price: item.price, image: item.image })),
      shippingAddress: shippingAddressStr,
      billingAddress: billingAddressStr,
      gstNumber: isB2b ? user.gstNumber : undefined,
      paymentMethod: formData.paymentMethod
    };

    try {
      const token = localStorage.getItem('arcus_token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // Cache address details scoped to user ID for future auto-populations
      const savedKey = `arcus-saved-checkout-details-${user.id}`;
      localStorage.setItem(savedKey, JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        billingSameAsShipping: formData.billingSameAsShipping,
        billingAddressLine1: formData.billingAddressLine1,
        billingAddressLine2: formData.billingAddressLine2,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingZipCode: formData.billingZipCode
      }));

      // Order placed successfully!
      if (appliedCoupon && appliedCoupon.startsWith('BP-')) {
        const stored = localStorage.getItem(`arcus-user-coupons-${user.id}`);
        if (stored) {
          try {
            const userCoupons = JSON.parse(stored);
            const updated = userCoupons.map((c: { code: string; used: boolean; discountValue: number }) => c.code === appliedCoupon ? { ...c, used: true } : c);
            localStorage.setItem(`arcus-user-coupons-${user.id}`, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to burn coupon:', e);
          }
        }
      }
      clearCart();
      window.location.hash = `#/checkout/success?id=${data.id}`;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-3xl px-lg">
      <div className="max-w-[1440px] mx-auto">
        <h1 className="font-bold text-headline-h3 text-on-surface text-left mb-xl">Procurement Checkout</h1>

        {errorMessage && (
          <div className="bg-error-container text-on-error-container p-md rounded-xl border border-error/20 mb-lg text-left text-body-sm font-semibold flex items-center gap-sm">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-xxl">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-xl text-left">
            {/* Customer Details */}
            <div className="bg-white border border-surface-variant p-xl rounded-2xl shadow-sm space-y-md">
              <h3 className="font-bold text-body-lg text-on-surface border-b border-surface-variant pb-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                1. Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="block text-secondary text-label-caps text-[11px] mb-xs">Contact Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                  {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-secondary text-label-caps text-[11px] mb-xs">Contact Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                  {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-secondary text-label-caps text-[11px] mb-xs">Company Name (Optional)</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className={!isB2b ? "opacity-60 pointer-events-none select-none" : ""}>
                  <label className="block text-secondary text-label-caps text-[11px] mb-xs">GSTIN for B2B Invoice</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={isB2b ? (user.gstNumber || '') : ''}
                    disabled={true}
                    placeholder={isB2b ? (user.gstNumber ? "" : "No GSTIN on profile") : "B2B Accounts Only"}
                    className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-surface-container disabled:opacity-75 uppercase"
                  />
                  {isB2b ? (
                    <p className="text-secondary text-[10px] mt-1">Verified B2B GSTIN (managed via account settings).</p>
                  ) : (
                    <p className="text-secondary text-[10px] mt-1">B2B Accounts Only (Business, Contractor, Supplier, Professional).</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-surface-variant p-xl rounded-2xl shadow-sm space-y-md">
              <h3 className="font-bold text-body-lg text-on-surface border-b border-surface-variant pb-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                2. Shipping & Delivery Address
              </h3>
              <div className="space-y-md">
                {/* Select Saved Address Dropdown */}
                {savedAddresses.length > 0 && (
                  <div className="bg-[#F8F9FA] border border-surface-variant p-md rounded-xl space-y-xs">
                    <label className="block text-secondary text-label-caps text-[11px] font-bold">Select Saved Address from Profile</label>
                    <select
                      onChange={(e) => handleSelectSavedAddress(e.target.value)}
                      className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Choose a saved address to autofill --</option>
                      {savedAddresses.map((addr, idx) => (
                        <option key={idx} value={addr}>
                          {idx === 0 ? `Default: ${addr}` : `Address #${idx + 1}: ${addr}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-secondary text-label-caps text-[11px] mb-xs">Street Address / Site Location *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Plot No, Building / Site Name, Area"
                    className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                  {errors.addressLine1 && <p className="text-error text-xs mt-1">{errors.addressLine1}</p>}
                </div>
                <div>
                  <label className="block text-secondary text-label-caps text-[11px] mb-xs">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Near metro, opposite park..."
                    className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div>
                    <label className="block text-secondary text-label-caps text-[11px] mb-xs">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                    />
                    {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-secondary text-label-caps text-[11px] mb-xs">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                    />
                    {errors.state && <p className="text-error text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-secondary text-label-caps text-[11px] mb-xs">PIN Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="6 digits"
                      className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                    />
                    {errors.zipCode && <p className="text-error text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address Toggle */}
            <div className="bg-white border border-surface-variant p-xl rounded-2xl shadow-sm space-y-md">
              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  id="billingSameAsShipping"
                  name="billingSameAsShipping"
                  checked={formData.billingSameAsShipping}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingSameAsShipping: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary h-5 w-5 cursor-pointer"
                />
                <label htmlFor="billingSameAsShipping" className="text-body-sm font-semibold text-on-surface cursor-pointer select-none">
                  Billing address is same as shipping address
                </label>
              </div>

              {!formData.billingSameAsShipping && (
                <div className="space-y-md pt-md border-t border-surface-variant animate-fade-in">
                  <h4 className="font-bold text-body-md text-on-surface">Billing Address Details</h4>
                  {savedAddresses.length > 0 && (
                    <div className="bg-[#F8F9FA] border border-surface-variant p-md rounded-xl space-y-xs">
                      <label className="block text-secondary text-label-caps text-[11px] font-bold">Select Saved Address for Billing</label>
                      <select
                        onChange={(e) => handleSelectSavedBillingAddress(e.target.value)}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Choose a saved address to autofill --</option>
                        {savedAddresses.map((addr, idx) => (
                          <option key={idx} value={addr}>
                            {idx === 0 ? `Default: ${addr}` : `Address #${idx + 1}: ${addr}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-secondary text-label-caps text-[11px] mb-xs">Billing Street Address *</label>
                    <input
                      type="text"
                      name="billingAddressLine1"
                      value={formData.billingAddressLine1}
                      onChange={handleInputChange}
                      className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                    />
                    {errors.billingAddressLine1 && <p className="text-error text-xs mt-1">{errors.billingAddressLine1}</p>}
                  </div>
                  <div>
                    <label className="block text-secondary text-label-caps text-[11px] mb-xs">Billing Address Line 2</label>
                    <input
                      type="text"
                      name="billingAddressLine2"
                      value={formData.billingAddressLine2}
                      onChange={handleInputChange}
                      className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div>
                      <label className="block text-secondary text-label-caps text-[11px] mb-xs">Billing City *</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                      {errors.billingCity && <p className="text-error text-xs mt-1">{errors.billingCity}</p>}
                    </div>
                    <div>
                      <label className="block text-secondary text-label-caps text-[11px] mb-xs">Billing State *</label>
                      <input
                        type="text"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                      {errors.billingState && <p className="text-error text-xs mt-1">{errors.billingState}</p>}
                    </div>
                    <div>
                      <label className="block text-secondary text-label-caps text-[11px] mb-xs">Billing PIN Code *</label>
                      <input
                        type="text"
                        name="billingZipCode"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                      {errors.billingZipCode && <p className="text-error text-xs mt-1">{errors.billingZipCode}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-surface-variant p-xl rounded-2xl shadow-sm space-y-md">
              <h3 className="font-bold text-body-lg text-on-surface border-b border-surface-variant pb-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                3. Payment Method
              </h3>
              <div className="space-y-md">
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Pay on Delivery / Pay on Site' }))}
                  className={`border p-lg rounded-2xl cursor-pointer hover:border-primary-container transition-all flex items-start gap-md ${
                    formData.paymentMethod === 'Pay on Delivery / Pay on Site' ? 'border-primary-container bg-primary-container/5' : 'border-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Pay on Delivery / Pay on Site"
                    checked={formData.paymentMethod === 'Pay on Delivery / Pay on Site'}
                    onChange={() => {}}
                    className="mt-1 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <h5 className="font-bold text-body-sm text-on-surface">Pay on Delivery / Pay on Site</h5>
                    <p className="text-secondary text-xs mt-xs">
                      Ideal for heavy construction shipments. Verify materials on-site first, then settle via Cash, Cheque, or UPI.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'B2B Net Banking / Bank Transfer' }))}
                  className={`border p-lg rounded-2xl cursor-pointer hover:border-primary-container transition-all flex items-start gap-md ${
                    formData.paymentMethod === 'B2B Net Banking / Bank Transfer' ? 'border-primary-container bg-primary-container/5' : 'border-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="B2B Net Banking / Bank Transfer"
                    checked={formData.paymentMethod === 'B2B Net Banking / Bank Transfer'}
                    onChange={() => {}}
                    className="mt-1 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <h5 className="font-bold text-body-sm text-on-surface">B2B Net Banking / Bank Transfer</h5>
                    <p className="text-secondary text-xs mt-xs">
                      Settle invoices securely via NEFT, RTGS, or IMPS. Bank coordinates will be provided on the order confirmation.
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Credit / Debit Card' }))}
                  className={`border p-lg rounded-2xl cursor-pointer hover:border-primary-container transition-all flex items-start gap-md ${
                    formData.paymentMethod === 'Credit / Debit Card' ? 'border-primary-container bg-primary-container/5' : 'border-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit / Debit Card"
                    checked={formData.paymentMethod === 'Credit / Debit Card'}
                    onChange={() => {}}
                    className="mt-1 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <h5 className="font-bold text-body-sm text-on-surface">Credit / Debit Card</h5>
                    <p className="text-secondary text-xs mt-xs">
                      Pay instantly using Visa, MasterCard, RuPay, or Corporate Cards. Surcharges may apply for B2B accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Accessories Carousel */}
            {getRecommendedItems().length > 0 && (
              <div className="bg-white border border-surface-variant p-xl rounded-2xl shadow-sm space-y-lg relative overflow-hidden mt-xl">
                <div className="flex justify-between items-end border-b border-surface-variant pb-md">
                  <div>
                    <h3 className="font-bold text-body-lg text-on-surface flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
                      Frequently Ordered Together
                    </h3>
                    <p className="text-secondary text-xs mt-0.5">
                      Ensure you have the necessary accessories and consumables for your project.
                    </p>
                  </div>
                  <div className="flex gap-sm shrink-0">
                    <button
                      type="button"
                      onClick={() => scroll('left')}
                      className="w-8 h-8 rounded-full border border-surface-variant flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scroll('right')}
                      className="w-8 h-8 rounded-full border border-surface-variant flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>

                <div 
                  ref={carouselRef}
                  className="flex gap-md overflow-x-auto pb-sm scrollbar-none scroll-smooth snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {getRecommendedItems().map((item) => (
                    <div 
                      key={item.id}
                      className="w-[220px] shrink-0 border border-surface-variant rounded-xl p-md bg-[#F8F9FA] hover:bg-white hover:border-[#FFC107] hover:shadow-md transition-all duration-300 snap-start flex flex-col justify-between"
                    >
                      <div>
                        {/* Image & Badge */}
                        <div className="relative w-full h-[120px] bg-white rounded-lg overflow-hidden border border-surface-variant/50 flex items-center justify-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="max-h-[100px] max-w-[90%] object-contain"
                          />
                          <span className="absolute top-xs left-xs bg-primary-container text-on-primary-container text-[9px] font-extrabold px-sm py-0.5 rounded uppercase tracking-wider border border-[#FFE082]">
                            {item.categoryTitle}
                          </span>
                        </div>

                        {/* Title & Brand */}
                        <div className="mt-md space-y-0.5 text-left">
                          <div className="flex justify-between items-start gap-xs">
                            <span className="text-[10px] text-[#FFC107] font-bold tracking-wider uppercase font-label-caps shrink-0">
                              {item.brand}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0 bg-yellow-50 px-1 rounded">
                              <span className="material-symbols-outlined text-[10px] text-yellow-600">star</span>
                              <span className="text-[9px] font-bold text-yellow-800">{item.rating}</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-xs text-on-surface line-clamp-1" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-secondary text-[10px] line-clamp-2 leading-relaxed min-h-[30px]">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & Add Button */}
                      <div className="mt-md pt-sm border-t border-surface-variant flex items-center justify-between">
                        <div className="text-left">
                          <span className="font-bold text-body-sm text-[#0A0A0A]">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-secondary ml-0.5">
                            {item.unit}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddRecommended(item)}
                          disabled={addedItemIds[item.id]}
                          className={`px-md py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-0.5 select-none ${
                            addedItemIds[item.id]
                              ? 'bg-green-600 text-white shadow'
                              : 'bg-primary-container text-on-primary-container hover:bg-[#fabd00] border border-[#FFE082]'
                          }`}
                        >
                          {addedItemIds[item.id] ? (
                            <>
                              <span className="material-symbols-outlined text-[12px] font-extrabold">check</span>
                              Added
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[12px] font-extrabold">add</span>
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5 text-left space-y-lg">
            {/* Promo / Coupon Box */}
            <div className="bg-white border border-surface-variant rounded-2xl shadow-sm p-xl space-y-md">
              <h3 className="font-bold text-body-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">sell</span>
                Ongoing Offers & Coupons
              </h3>
              {/* Offer Alerts & Progress Bar */}
              <div className="space-y-md">
                <div className="flex flex-col gap-xs bg-surface-container-low border border-surface-variant p-md rounded-xl">
                  <div className="flex justify-between items-center text-xs font-bold text-secondary">
                    <span>Bulk Discount Tracker</span>
                    {cartTotal < 10000 ? (
                      <span>Spend ₹{(10000 - cartTotal).toLocaleString('en-IN')} more for 5% off</span>
                    ) : (
                      <span className="text-green-600 font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> 5% Bulk Discount Unlocked!
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-[#E9ECEF] rounded-full overflow-hidden mt-xs">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (cartTotal / 10000) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Available Coupon Cards */}
                <div className="space-y-sm mt-md">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-secondary font-label-caps">Available Offers (Click to Apply)</p>
                  <div className="grid grid-cols-1">
                    {getAvailableCoupons().map((promo) => (
                      <div
                        key={promo.code}
                        onClick={() => {
                          if (appliedCoupon === promo.code) {
                            handleRemoveCoupon();
                          } else {
                            setCouponCode(promo.code);
                            setAppliedCoupon(promo.code);
                            if (promo.code === 'WELCOME5') {
                              setCouponDiscountPercent(5);
                              setCouponDiscountAmount(0);
                            } else if (promo.code === 'ARCUS10') {
                              setCouponDiscountPercent(10);
                              setCouponDiscountAmount(0);
                            } else if (promo.code === 'B2B50K') {
                              if (cartTotal < 50000) {
                                setCouponError('This coupon requires a minimum subtotal of ₹50,000.');
                                return;
                              }
                              setCouponDiscountAmount(5000);
                              setCouponDiscountPercent(0);
                            } else if (promo.code === 'HOMEMAKER') {
                              if (cartTotal < 5000) {
                                setCouponError('This coupon requires a minimum subtotal of ₹5,000.');
                                return;
                              }
                              setCouponDiscountAmount(500);
                              setCouponDiscountPercent(0);
                            }
                            setCouponSuccess(`Coupon ${promo.code} applied successfully!`);
                            setCouponError(null);
                          }
                        }}
                        className={`border-2 border-dashed p-md rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between select-none ${
                          appliedCoupon === promo.code
                            ? 'border-green-500 bg-green-50/30 ring-1 ring-green-500'
                            : 'border-surface-variant hover:border-[#FFC107] hover:bg-[#FFFDF5] bg-[#F8F9FA]'
                        }`}
                      >
                        <div className="text-left min-w-0 pr-sm">
                          <div className="flex items-center gap-sm">
                            <span className="font-extrabold text-xs bg-primary-container text-on-primary-container px-md py-0.5 rounded border border-[#FFE082]">
                              {promo.code}
                            </span>
                            <span className="text-[9px] text-[#FFC107] font-bold font-label-caps tracking-wider uppercase">
                              {promo.label}
                            </span>
                          </div>
                          <p className="text-secondary text-[11px] mt-1.5 leading-relaxed">{promo.desc}</p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          <span className="font-black text-body-lg text-[#0A0A0A]">{promo.discount} OFF</span>
                          {appliedCoupon === promo.code ? (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
                              <span className="material-symbols-outlined text-[12px]">check</span> Applied
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#FFC107] font-bold uppercase tracking-wider mt-1 hover:underline">
                              Apply
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="flex gap-sm mt-md">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon(e);
                    }
                  }}
                  disabled={!!appliedCoupon}
                  className="flex-1 h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm uppercase disabled:bg-surface-container disabled:text-secondary bg-white"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="bg-error text-white px-lg h-11 rounded-xl font-bold text-xs hover:bg-[#ba1a1a] transition-all flex items-center justify-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="bg-primary-container text-on-primary-container px-xl h-11 rounded-xl font-bold text-xs hover:bg-[#fabd00] transition-all"
                  >
                    Apply
                  </button>
                )}
              </div>

              {couponError && <p className="text-error text-xs font-semibold">{couponError}</p>}
              {couponSuccess && <p className="text-green-600 text-xs font-semibold">{couponSuccess}</p>}
            </div>

            <div className="bg-white border border-surface-variant rounded-2xl shadow-sm p-xl space-y-xl sticky top-[96px]">
              <h3 className="font-bold text-body-lg text-on-surface border-b border-surface-variant pb-sm">Order Summary</h3>

              {/* Items List */}
              <div className="max-h-[260px] overflow-y-auto divide-y divide-surface-variant pr-xs">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-md py-md items-center">
                    <div className="w-14 h-14 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 border border-surface-variant">
                      <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-body-sm text-on-surface truncate">{item.name}</h5>
                      <div className="flex items-center justify-between mt-sm">
                        <div className="flex items-center border border-surface-variant rounded-lg bg-surface-container-low overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-6 h-6 flex items-center justify-center text-on-surface hover:bg-surface-variant/40 transition-all font-bold text-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-on-surface">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-6 h-6 flex items-center justify-center text-on-surface hover:bg-surface-variant/40 transition-all font-bold text-xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>
                        <span className="text-[11px] text-secondary font-medium ml-xs shrink-0">
                          ₹{item.price.toLocaleString('en-IN')} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-secondary hover:text-error transition-all flex items-center justify-center p-0.5 rounded hover:bg-surface-variant/40"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="font-bold text-body-sm text-on-surface shrink-0 ml-md">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-md border-t border-surface-variant pt-lg">
                <div className="flex justify-between text-body-sm text-secondary">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-on-surface">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-body-sm text-green-600 font-medium">
                    <span>Bulk Discount (5% Off)</span>
                    <span>-₹{bulkDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-body-sm text-green-600 font-medium">
                    <span>Coupon Discount {couponDiscountPercent > 0 ? `(${couponDiscountPercent}%)` : ''}</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-body-sm text-secondary">
                  <span>Shipping & Logistics</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-green-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-on-surface">₹{shippingFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-body-sm text-secondary">
                  <span>B2B GST (18%)</span>
                  <span className="font-semibold text-on-surface">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-body-md border-t border-dashed border-surface-variant pt-md font-bold text-on-surface">
                  <span>Total (Incl. Taxes)</span>
                  <span className="text-primary text-headline-h3 leading-none">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-container text-on-primary-container hover:bg-[#fabd00] h-14 rounded-xl font-bold flex items-center justify-center gap-sm transition-all shadow-md text-body-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                    Place Order (₹{finalTotal.toLocaleString('en-IN')})
                  </>
                )}
              </button>
              <p className="text-secondary text-[11px] text-center leading-normal">
                By placing this order, you authorize Arcus to process coordinates, execute shipping logistics, and contact you regarding delivery and payment on site.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CheckoutSuccess: React.FC = () => {
  // Extract order ID from url query/hash
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const orderId = urlParams.get('id') || 'ARC-XXXXX';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-xl">
      <div className="max-w-xl w-full bg-white border border-surface-variant p-5xl rounded-3xl shadow-lg text-center space-y-xl relative overflow-hidden">
        {/* Animated green background burst */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[400px] h-[400px] bg-green-50 rounded-full -translate-y-1/2 -z-0 pointer-events-none opacity-50 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner border border-green-200">
            <span className="material-symbols-outlined text-green-600 text-[48px] animate-pulse">done_all</span>
          </div>
          
          <div className="space-y-sm">
            <p className="text-label-caps text-green-600 font-bold tracking-wider">Order Confirmed</p>
            <h2 className="font-bold text-headline-h2 text-on-surface">Order Placed Successfully!</h2>
          </div>

          <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-lg w-full max-w-sm flex flex-col space-y-sm text-left">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-secondary">Order ID:</span>
              <span className="font-bold text-on-surface">{orderId}</span>
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-secondary">Delivery Status:</span>
              <span className="bg-[#FFF8E1] text-[#E65100] text-[10px] font-bold px-md py-0.5 rounded-full border border-[#FFE082]">Awaiting Delivery</span>
            </div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-secondary">ETA:</span>
              <span className="font-semibold text-on-surface">Within 24-48 Hours</span>
            </div>
          </div>

          <p className="text-secondary text-body-sm max-w-md">
            Thank you for buying through ARCUS. Our procurement desk will verify your shipment coordinates and contact you at your registered phone number.
          </p>

          <div className="flex flex-col sm:flex-row gap-md w-full max-w-sm pt-md">
            <button 
              onClick={() => window.location.hash = '#/account'}
              className="flex-1 bg-[#121212] hover:bg-on-surface text-white h-12 rounded-xl font-bold flex items-center justify-center gap-xs transition-all shadow"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Track Order
            </button>
            <button 
              onClick={() => window.location.hash = '#/materials'}
              className="flex-1 bg-primary-container text-on-primary-container hover:bg-[#fabd00] h-12 rounded-xl font-bold flex items-center justify-center gap-xs transition-all shadow"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
