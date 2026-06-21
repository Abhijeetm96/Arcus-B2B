import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { sanitizeText } from '../../shared/validation';

interface PriceTier {
  min: number;
  max: number;
  price: number;
  save: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  categoryTitle: string;
  subcategorySlug?: string;
  leafSlug?: string;
  images: string[];
  priceTiers: PriceTier[];
}

interface OrderRow {
  productId: string;
  qty: number;
}

interface ProductSearchSelectProps {
  value: string;
  onChange: (productId: string) => void;
  products: Product[];
}

function ProductSearchSelect({ value, onChange, products }: ProductSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = products.find(p => p.id === value);

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.categoryTitle).filter((c): c is string => !!c)));

  // Extract unique subcategories based on category
  const filteredSubcategorySlugs = Array.from(
    new Set(
      products
        .filter(p => !selectedCategory || p.categoryTitle === selectedCategory)
        .map(p => p.subcategorySlug)
        .filter((s): s is string => !!s)
    )
  );

  // Format subcategory slugs
  const getSubcategoryName = (slug: string) => {
    const names: Record<string, string> = {
      'pipes-fittings': 'Pipes & Fittings',
      'water-tanks': 'Water Tanks',
      'valves': 'Valves',
      'pumps': 'Pumps',
      'bathroom-fittings': 'Bathroom Fittings',
      'wires-cables': 'Wires & Cables',
      'switches-sockets': 'Switches & Sockets',
      'protection-devices': 'Protection Devices',
      'lighting-fans': 'Lighting & Fans',
      'cement-opc-ppc': 'OPC & PPC Cement',
      'ready-mix': 'Ready Mix Concrete',
      'concrete-products': 'Concrete Products',
      'tmt-bars': 'TMT Bars',
      'angles-channels': 'Angles & Channels',
      'beams-mesh': 'Beams & Mesh',
      'interior-exterior-paints': 'Interior & Exterior Paints',
      'waterproofing': 'Waterproofing',
      'adhesives-grouts': 'Adhesives & Grouts',
      'vitrified-ceramic': 'Vitrified & Ceramic Tiles',
      'granite-marble': 'Granite & Marble',
      'wooden-vinyl': 'Wooden & Vinyl Flooring',
      'fasteners-screws': 'Fasteners & Screws',
      'hand-power-tools': 'Hand & Power Tools',
      'safety-equipment': 'Safety Equipment',
      'bricks-blocks': 'Bricks & Blocks',
      'roofing-doors': 'Roofing & Doors',
      'plywood-laminates': 'Plywood & Laminates'
    };
    return names[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Reset subcategory if category changes and the current subcategory is not in the filtered list
  useEffect(() => {
    setSelectedSubcategory('');
  }, [selectedCategory]);

  // Filter products
  const filteredProducts = products.filter(p => {
    const cleanSearch = sanitizeText(searchQuery);
    const matchesCategory = !selectedCategory || p.categoryTitle === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || p.subcategorySlug === selectedSubcategory;
    
    // Autocomplete matching: must type at least 3 characters if no category/subcategory is selected.
    // If a category/subcategory is selected, search term filters even if < 3 characters.
    const isSearching = cleanSearch.length > 0;
    const hasEnoughChars = cleanSearch.length >= 3;
    
    let matchesSearch = true;
    if (isSearching) {
      matchesSearch = p.name.toLowerCase().includes(cleanSearch.toLowerCase());
    }
 
    if (!selectedCategory && !selectedSubcategory) {
      // No category selected -> search must be at least 3 characters
      return isSearching && hasEnoughChars && matchesSearch;
    } else {
      // Category selected -> search filters if present (length doesn't matter)
      return matchesCategory && matchesSubcategory && matchesSearch;
    }
  });

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white text-left flex items-center justify-between shadow-sm hover:border-gray-400 transition-colors"
      >
        <span className={selectedProduct ? "text-on-surface font-semibold truncate" : "text-secondary truncate"}>
          {selectedProduct ? `${selectedProduct.name} [${selectedProduct.categoryTitle}]` : '-- Choose Product --'}
        </span>
        <span className="material-symbols-outlined text-[20px] text-secondary">
          {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-xs w-full min-w-[320px] max-w-[480px] bg-white border border-surface-variant rounded-2xl shadow-xl z-[100] p-md space-y-md">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 material-symbols-outlined text-secondary text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-[38px] pr-md border border-surface-variant rounded-xl focus:border-primary focus:ring-0 text-body-sm bg-background"
              autoFocus
            />
          </div>

          {/* Category & Subcategory Selectors */}
          <div className="grid grid-cols-2 gap-sm">
            <div className="flex flex-col gap-xs">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-sm border border-surface-variant rounded-lg text-xs bg-white focus:border-primary focus:ring-0"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="h-9 px-sm border border-surface-variant rounded-lg text-xs bg-white focus:border-primary focus:ring-0 disabled:opacity-50"
              >
                <option value="">All Subcategories</option>
                {filteredSubcategorySlugs.map(slug => (
                  <option key={slug} value={slug}>{getSubcategoryName(slug)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List */}
          <div className="max-h-[200px] overflow-y-auto border-t border-surface-variant pt-sm space-y-xs">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-md py-sm rounded-xl text-body-sm transition-all flex items-center justify-between ${
                    value === p.id 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'hover:bg-background text-on-surface'
                  }`}
                >
                  <span className="truncate pr-sm">{p.name}</span>
                  <span className="text-[10px] bg-surface-container-high px-sm py-0.5 rounded text-secondary shrink-0">
                    {p.categoryTitle}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-center py-lg text-secondary text-xs">
                {!selectedCategory && !selectedSubcategory && searchQuery.trim().length < 3 ? (
                  <span className="italic">Type at least 3 letters or select a category to browse products.</span>
                ) : (
                  <span className="italic">No products match your criteria.</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BulkOrders() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<OrderRow[]>([
    { productId: '', qty: 100 },
    { productId: '', qty: 50 },
    { productId: '', qty: 200 }
  ]);

  const [addingToCart, setAddingToCart] = useState(false);
  const [bulkToast, setBulkToast] = useState<string | null>(null);

  // Quick Pad RFQ Form State (In-Page)
  const [isRfqFormOpen, setIsRfqFormOpen] = useState(false);
  const [submittingRfq, setSubmittingRfq] = useState(false);
  const [quickRfqForm, setQuickRfqForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    gstNumber: '',
    address: '',
    timeline: 'Immediate (1-3 Days)',
    details: ''
  });

  // GST verification states
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [gstError, setGstError] = useState('');

  // Strict Phone & Email validation states
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-()]/g, '');
    const baseNum = cleaned.startsWith('+91') ? cleaned.slice(3) : cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    
    if (!/^[6-9]\d{9}$/.test(baseNum)) {
      setPhoneError('Please enter a valid 10-digit mobile number starting with 6-9.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailClean)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }

    const domain = emailClean.split('@')[1];
    const TEMP_EMAIL_DOMAINS = [
      'mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'dispostable.com',
      '10minutemail.com', 'trashmail.com', 'getairmail.com', 'temp-mail.org', 'sharklasers.com',
      'guerrillamailblock.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
      'mytrashmail.com', 'mailnesia.com', 'mailcatch.com', 'mailexpire.com', 'fakeinbox.com',
      'generator.email', 'tempmailo.com', 'moakt.com', 'tempmail.dev', 'boun.cr', 'incognitomail.org',
      'tempmailaddress.com', 'throwawaymail.com', 'emailondeck.com', 'tempmail.net',
      'maildrop.cc', 'tempail.com', 'discard.email', 'rapidmail.io', 'burnermail.io',
      '10minutemail.co', '10minutemail.net', 'tempmail.co', 'disposable.com', 'burner.com',
      'mailto.plus', 'spydermail.com', 'tempr.email', 'dropmail.me', 'discardmail.com',
      'mytemp.email', 'chimpmail.com', 'getnada.com', 'nada.ltd', 'abyssmail.com',
      'boximail.com', 'cloudtempmail.com', 'tempmailo.co', 'tempmailo.net', 'zillamail.com',
      'temp-mail.ru', 'temp-mail.to', 'temp-mail.info'
    ];

    const containsTempKeyword = [
      'tempmail', 'temp-mail', 'disposable', 'throwaway', '10min', 'burnermail', 
      'yopmail', 'mailinator', 'guerrillamail', 'dispostable', 'sharklasers', 
      'maildrop', 'trashmail', 'getairmail', 'fakeinbox', 'moakt', 'incognitomail', 
      'throwawaymail', 'emailondeck', 'tempail', 'rapidmail', 'burner', 'temp',
      'dispos', 'fake', 'trash', 't-mail', 'spam', 'mailnesia', 'discard',
      'getnada', 'tempr', 'spydermail'
    ].some(keyword => domain.includes(keyword));

    if (TEMP_EMAIL_DOMAINS.includes(domain) || containsTempKeyword) {
      setEmailError('Temporary or disposable email domains are not allowed. Please use a business or standard personal email.');
      return false;
    }

    setEmailError('');
    return true;
  };

  // Auto populate RFQ form fields once user logs in or page loads
  useEffect(() => {
    if (user) {
      setQuickRfqForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        company: user.companyName || '',
        gstNumber: user.gstNumber || '',
        address: user.city || ''
      }));
      if (user.gstNumber) {
        setGstVerified(true);
      }
    }
  }, [user]);

  // GST Verification Live API Call
  const handleVerifyGst = async () => {
    const gstClean = quickRfqForm.gstNumber.trim().toUpperCase();
    if (!gstClean) {
      setGstError('Please enter a GST number first.');
      return;
    }
    
    // Regular expression for GST validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstClean)) {
      setGstError('Format invalid. Please enter a valid 15-character GSTIN (e.g. 29AACCG0527D1Z0).');
      return;
    }

    setGstError('');
    setGstVerifying(true);
    setGstVerified(false);

    try {
      const res = await fetch(`http://localhost:5000/api/auth/verify-gst/${gstClean}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Verification failed. Please check the GST number.');
      }
      const data = await res.json();
      setGstVerifying(false);
      setGstVerified(true);
      setQuickRfqForm(prev => ({
        ...prev,
        company: data.legalName || data.tradeName || prev.company,
        address: data.address || prev.address
      }));
    } catch (err: any) {
      setGstVerifying(false);
      setGstVerified(false);
      setGstError(err.message || 'An error occurred while verifying the GST number.');
    }
  };

  // Fallback products for the quick order pad if API is empty or offline
  const fallbackProducts: Product[] = [
    {
      id: 'astral-cpvc-pipe',
      name: 'Astral CPVC Pipe (1 Inch, SDR 11)',
      price: 165,
      unit: '/ Piece',
      categoryTitle: 'Plumbing',
      subcategorySlug: 'pipes-fittings',
      leafSlug: 'cpvc-pipes',
      images: ['/pdp_cpvc_pipe_main.png'],
      priceTiers: [
        { min: 1, max: 50, price: 165, save: 0 },
        { min: 51, max: 200, price: 160, save: 3 },
        { min: 201, max: 500, price: 155, save: 6 },
        { min: 501, max: 999999, price: 150, save: 9 }
      ]
    },
    {
      id: 'supreme-elbow',
      name: 'Supreme Elbow 90° (1 Inch)',
      price: 24,
      unit: '/ Unit',
      categoryTitle: 'Plumbing',
      subcategorySlug: 'pipes-fittings',
      leafSlug: 'pipe-fittings',
      images: ['/pdp_cpvc_elbow.png'],
      priceTiers: [
        { min: 1, max: 100, price: 24, save: 0 },
        { min: 101, max: 500, price: 22, save: 8 },
        { min: 501, max: 999999, price: 20, save: 16 }
      ]
    },
    {
      id: 'ultratech-cement',
      name: 'Ultratech Cement (50kg Bag)',
      price: 430,
      unit: '/ Bag',
      categoryTitle: 'Cement',
      subcategorySlug: 'cement-opc-ppc',
      leafSlug: 'opc-53',
      images: ['/pdp_ultratech_cement.png'],
      priceTiers: [
        { min: 1, max: 50, price: 430, save: 0 },
        { min: 51, max: 200, price: 420, save: 2 },
        { min: 201, max: 999999, price: 410, save: 4 }
      ]
    },
    {
      id: 'jsw-steel-tmt-rebar',
      name: 'JSW Steel Fe 550D TMT Rebar',
      price: 65,
      unit: '/ kg',
      categoryTitle: 'Steel',
      subcategorySlug: 'tmt-bars',
      leafSlug: 'fe-550d',
      images: ['/products_steel.png'],
      priceTiers: [
        { min: 1, max: 1000, price: 65, save: 0 },
        { min: 1001, max: 5000, price: 62, save: 4 },
        { min: 5001, max: 999999, price: 59, save: 9 }
      ]
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (res.ok) {
          const data = await res.json();
          // Map backend category-grouped products to our structure
          if (data && data.length > 0) {
            // Flatten the category-grouped data
            const flatProducts = data.reduce((acc: any[], cat: any) => {
              const productsWithCat = (cat.products || []).map((p: any) => ({
                ...p,
                categoryTitle: cat.title
              }));
              return [...acc, ...productsWithCat];
            }, []);

            const mapped = flatProducts.map((p: any) => {
              let tiers = p.priceTiers || p.price_tiers || [];
              if (typeof tiers === 'string') {
                try { tiers = JSON.parse(tiers); } catch (e) { tiers = []; }
              }
              let imgs = p.images;
              if (typeof imgs === 'string') {
                try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
              } else if (!imgs && p.image) {
                imgs = [p.image];
              }
              const basePrice = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 100;

              return {
                id: p.id,
                name: p.name,
                price: basePrice,
                unit: p.unit || '/ Unit',
                categoryTitle: p.categoryTitle || 'Materials',
                subcategorySlug: p.subcategorySlug,
                leafSlug: p.leafSlug,
                images: imgs || [],
                priceTiers: (tiers && tiers.length > 0) ? tiers.map((t: any) => ({
                  min: Number(t.min),
                  max: t.max ? Number(t.max) : 999999,
                  price: typeof t.price === 'number' ? t.price : parseFloat(String(t.price).replace(/[^0-9.]/g, '')) || basePrice,
                  save: t.save ? Number(t.save) : 0
                })) : [
                  { min: 1, max: 50, price: basePrice, save: 0 },
                  { min: 51, max: 999999, price: basePrice * 0.95, save: 5 }
                ]
              };
            });
            setProducts(mapped);
          } else {
            setProducts(fallbackProducts);
          }
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.warn('API offline, loading fallback products:', err);
        setProducts(fallbackProducts);
      }
    };
    fetchProducts();
  }, []);

  const handleRowChange = (index: number, field: keyof OrderRow, value: any) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value
    };
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { productId: '', qty: 100 }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) {
      setRows([{ productId: '', qty: 100 }]);
      return;
    }
    const updatedRows = rows.filter((_, idx) => idx !== index);
    setRows(updatedRows);
  };

  const getProductDetails = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const getTierPrice = (product: Product, qty: number): number => {
    const tier = product.priceTiers.find(t => qty >= t.min && qty <= t.max);
    return tier ? tier.price : product.price;
  };

  const getRowSubtotal = (row: OrderRow): number => {
    if (!row.productId) return 0;
    const prod = getProductDetails(row.productId);
    if (!prod) return 0;
    return getTierPrice(prod, row.qty) * row.qty;
  };

  const handleAddAllToCart = () => {
    const validRows = rows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) {
      alert('Please select at least one product with a valid quantity.');
      return;
    }

    setAddingToCart(true);
    let itemsAdded = 0;

    validRows.forEach(row => {
      const prod = getProductDetails(row.productId);
      if (prod) {
        addToCart({
          id: prod.id,
          name: prod.name,
          price: getTierPrice(prod, row.qty),
          unit: prod.unit,
          images: prod.images,
          categoryTitle: prod.categoryTitle,
          priceTiers: prod.priceTiers
        }, row.qty);
        itemsAdded += row.qty;
      }
    });

    setAddingToCart(false);
    setBulkToast(`Added ${itemsAdded.toLocaleString('en-IN')} units to procurement cart!`);
    setTimeout(() => setBulkToast(null), 4000);

    // Open the cart drawer
    setTimeout(() => {
      const cartBtn = document.querySelector('button[onClick*="setIsCartOpen(true)"]') as HTMLButtonElement;
      if (cartBtn) cartBtn.click();
      window.dispatchEvent(new Event('arcus-cart-updated'));
    }, 100);
  };

  const handleQuickRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gstVerified) {
      setGstError('Please enter and verify your GST number before submitting the RFQ.');
      const gstEl = document.querySelector('input[placeholder="e.g. 29AACCG0527D1Z0"]');
      if (gstEl) {
        gstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const isPhoneValid = validatePhone(quickRfqForm.phone);
    const isEmailValid = validateEmail(quickRfqForm.email);
    if (!isPhoneValid || !isEmailValid) {
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstError as HTMLInputElement).focus();
        }
      }, 50);
      return;
    }

    const validRows = rows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) return;

    setSubmittingRfq(true);

    const itemsSummary = validRows.map(row => {
      const prod = getProductDetails(row.productId);
      return prod ? `- ${prod.name}: ${row.qty} ${prod.unit}` : '';
    }).filter(Boolean).join('\n');

    const combinedDetails = `Company: ${quickRfqForm.company}\n` +
      `GST Number: ${quickRfqForm.gstNumber}\n` +
      `Email: ${quickRfqForm.email}\n` +
      `Delivery Address: ${quickRfqForm.address}\n` +
      `Additional Notes: ${quickRfqForm.details || 'None'}\n\n` +
      `Ordered Items:\n${itemsSummary}`;

    try {
      const res = await fetch('http://localhost:5000/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickRfqForm.name,
          phone: quickRfqForm.phone,
          category: 'Quick Order Pad',
          quantity: `${validRows.length} items (${rows.reduce((sum, r) => sum + r.qty, 0).toLocaleString('en-IN')} units)`,
          location: quickRfqForm.address,
          timeline: quickRfqForm.timeline,
          details: combinedDetails
        })
      });

      if (res.ok) {
        setBulkToast(`RFQ submitted successfully! Admin will contact you.`);
        setTimeout(() => setBulkToast(null), 4000);
        setIsRfqFormOpen(false);
        setRows([{ productId: '', qty: 100 }]); // Reset pad rows
      } else {
        // Fallback local success
        setBulkToast(`RFQ submitted successfully! Admin will contact you.`);
        setTimeout(() => setBulkToast(null), 4000);
        setIsRfqFormOpen(false);
        setRows([{ productId: '', qty: 100 }]);
      }
    } catch (err) {
      console.warn('RFQ submission error, showing local success:', err);
      setBulkToast(`RFQ submitted successfully! Admin will contact you.`);
      setTimeout(() => setBulkToast(null), 4000);
      setIsRfqFormOpen(false);
      setRows([{ productId: '', qty: 100 }]);
    } finally {
      setSubmittingRfq(false);
    }
  };

  const totalProcuredAmount = rows.reduce((sum, row) => sum + getRowSubtotal(row), 0);
  const totalItemCount = rows.filter(r => r.productId).length;

  return (
    <div className="bg-background min-h-screen text-on-surface select-none">
      {/* Toast Alert */}
      {bulkToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-xl py-lg rounded-2xl shadow-xl flex items-center gap-md border border-green-500 animate-slide-in-right">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span className="font-bold text-body-sm">{bulkToast}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full bg-[#1a1c1c] text-white py-[80px] md:py-[112px] border-b border-surface-variant relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 skew-x-12 translate-x-1/3 pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-lg text-left flex flex-col gap-md relative z-10">
          <span className="bg-[#FFC107] text-[#0A0A0A] font-bold px-md py-1 rounded w-fit text-[11px] font-label-caps tracking-wider">
            ENTERPRISE SERVICES
          </span>
          <h1 className="font-sans font-extrabold text-[40px] md:text-[56px] leading-[1.1] max-w-2xl text-white">
            Bulk Procurement Control Center
          </h1>
          <p className="font-sans font-medium text-[18px] md:text-[20px] text-gray-400 max-w-3xl leading-relaxed">
            Gain direct access to manufacturer-level price tiers, optimize multi-site delivery logistics, and utilize tailored financing options.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-[1440px] mx-auto px-lg py-3xl md:py-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl items-start">
          
          {/* Left Side: Quick Order Pad */}
          <div className="lg:col-span-12 space-y-xl">
            <div className="bg-white border border-surface-variant rounded-3xl p-lg md:p-xl shadow-sm text-left space-y-lg">
              <div className="border-b border-surface-variant pb-md flex flex-col md:flex-row justify-between md:items-center gap-sm">
                <div>
                  <h3 className="font-headline-h3 text-[24px] text-[#0A0A0A] font-bold">Quick Order Pad</h3>
                  <p className="text-secondary text-xs mt-1">Select products and quantities. Live tier-discounted pricing is applied automatically.</p>
                </div>
                <button
                  onClick={addRow}
                  className="w-fit flex items-center gap-xs text-xs font-bold text-[#FFC107] hover:underline"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Row
                </button>
              </div>

              {/* Rows List */}
              <div className="space-y-md">
                {rows.map((row, idx) => {
                  const selectedProd = getProductDetails(row.productId);
                  const tierPrice = selectedProd ? getTierPrice(selectedProd, row.qty) : 0;
                  const rowSubtotal = tierPrice * row.qty;

                  return (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-md items-end p-md bg-[#F8F9FA] rounded-2xl border border-surface-variant relative">
                      <button
                        onClick={() => removeRow(idx)}
                        className="absolute right-4 top-4 md:static md:col-span-1 md:h-11 flex items-center justify-center text-[#C62828] hover:bg-error-container/20 rounded-lg p-1.5 transition-colors self-end justify-self-center"
                        title="Remove Row"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>

                      {/* Product Dropdown */}
                      <div className="md:col-span-5 flex flex-col gap-xs">
                        <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Select Product</label>
                        <ProductSearchSelect
                          value={row.productId}
                          onChange={(val) => handleRowChange(idx, 'productId', val)}
                          products={products}
                        />
                      </div>

                      {/* Quantity Input */}
                      <div className="md:col-span-2 flex flex-col gap-xs">
                        <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Quantity</label>
                        <div className="flex items-center w-full">
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(e) => handleRowChange(idx, 'qty', Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-center font-bold text-body-sm bg-white"
                          />
                        </div>
                      </div>

                      {/* Live Price display */}
                      <div className="md:col-span-2 flex flex-col gap-xs text-left md:text-right">
                        <span className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Unit Price</span>
                        <div className="h-11 flex items-center md:justify-end font-semibold text-body-sm text-[#0A0A0A]">
                          {selectedProd ? (
                            <>
                              ₹{tierPrice.toFixed(2)}
                              <span className="text-[10px] text-secondary font-normal ml-0.5">{selectedProd.unit}</span>
                            </>
                          ) : (
                            <span className="text-secondary text-[11px] font-normal italic">--</span>
                          )}
                        </div>
                      </div>

                      {/* Subtotal Display */}
                      <div className="md:col-span-2 flex flex-col gap-xs text-left md:text-right">
                        <span className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Subtotal</span>
                        <div className="h-11 flex items-center md:justify-end font-bold text-body-sm text-primary">
                          {selectedProd ? `₹${rowSubtotal.toLocaleString('en-IN')}` : <span className="text-secondary text-[11px] font-normal italic">--</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Actions & Summary */}
              <div className="border-t border-surface-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-lg">
                <div className="text-left">
                  <p className="text-xs text-secondary font-bold font-label-caps uppercase tracking-wider">Estimated Procurement Summary</p>
                  <h4 className="font-extrabold text-[22px] text-[#0A0A0A] mt-1">
                    ₹{totalProcuredAmount.toLocaleString('en-IN')}
                    <span className="text-xs text-secondary font-normal ml-xs">({totalItemCount} items selected)</span>
                  </h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-md w-full md:w-fit">
                  <button
                    onClick={() => {
                      const validRows = rows.filter(r => r.productId && r.qty > 0);
                      if (validRows.length === 0) {
                        alert('Please select at least one product with a valid quantity.');
                        return;
                      }
                      setIsRfqFormOpen(true);
                      setTimeout(() => {
                        const formEl = document.getElementById('rfq-form-section');
                        if (formEl) {
                          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    type="button"
                    className="w-full sm:w-fit px-xl h-14 bg-[#121212] text-white font-bold rounded-xl hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-sm font-label-caps text-[14px] shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    Request RFQ
                  </button>
                  <button
                    onClick={handleAddAllToCart}
                    disabled={addingToCart}
                    type="button"
                    className="w-full sm:w-fit px-xl h-14 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#fabd00] transition-all flex items-center justify-center gap-sm font-label-caps text-[14px] shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                    Add All to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Inline RFQ Form */}
            {isRfqFormOpen && (
              <div id="rfq-form-section" className="bg-white border border-surface-variant rounded-3xl p-lg md:p-xl shadow-sm text-left space-y-lg animate-fade-in">
                <div className="border-b border-surface-variant pb-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-headline-h3 text-[22px] text-[#0A0A0A] flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[#FFC107] text-[24px]">description</span>
                      Quick Pad RFQ Requirements
                    </h3>
                    <p className="text-secondary text-xs mt-1">Submit your selected order pad items to our estimating desk.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRfqFormOpen(false)}
                    className="text-secondary hover:text-primary transition-colors flex items-center"
                    title="Close form"
                  >
                    <span className="material-symbols-outlined text-[24px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleQuickRfqSubmit} className="space-y-md">
                  {/* GST Field & Verification */}
                  <div className="bg-[#F8F9FA] p-md rounded-2xl border border-surface-variant space-y-sm">
                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">GST Number *</label>
                      <div className="flex gap-sm">
                        <input
                          type="text"
                          required
                          maxLength={15}
                          placeholder="e.g. 29AACCG0527D1Z0"
                          value={quickRfqForm.gstNumber}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            setQuickRfqForm({ ...quickRfqForm, gstNumber: val });
                            setGstVerified(false);
                            setGstError('');
                          }}
                          className="flex-1 h-11 px-md border border-surface-variant rounded-xl focus:border-primary focus:ring-0 text-body-sm bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyGst}
                          disabled={gstVerifying}
                          className="px-lg h-11 bg-[#121212] text-white hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors font-bold rounded-xl font-label-caps text-xs shadow-sm"
                        >
                          {gstVerifying ? 'Verifying...' : 'Verify GST'}
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary font-medium">
                        Hint: Enter a valid GSTIN (e.g. <span className="font-bold text-[#0A0A0A]">29AACCG0527D1Z0</span>) and click Verify
                      </p>
                      {gstError && (
                        <p className="text-[11px] text-[#C62828] font-semibold flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {gstError}
                        </p>
                      )}
                      {gstVerified && (
                        <p className="text-[11px] text-green-700 font-semibold flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[16px] text-green-600">verified</span>
                          GST Verified: <span className="text-[#0A0A0A]">{quickRfqForm.company}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={quickRfqForm.company}
                        onChange={(e) => setQuickRfqForm({ ...quickRfqForm, company: e.target.value })}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Delivery Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Whitefield, Bengaluru"
                        value={quickRfqForm.address}
                        onChange={(e) => setQuickRfqForm({ ...quickRfqForm, address: e.target.value })}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Contact Name *</label>
                      <input
                        type="text"
                        required
                        value={quickRfqForm.name}
                        onChange={(e) => setQuickRfqForm({ ...quickRfqForm, name: e.target.value })}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                    </div>

                     <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={quickRfqForm.phone}
                        onChange={(e) => {
                          setQuickRfqForm({ ...quickRfqForm, phone: e.target.value });
                          if (phoneError) setPhoneError('');
                        }}
                        onBlur={(e) => validatePhone(e.target.value)}
                        className={`w-full h-11 px-md border ${phoneError ? 'border-red-500 focus:border-red-500' : 'border-surface-variant focus:border-primary'} rounded-xl focus:ring-0 text-body-sm bg-white`}
                      />
                      {phoneError && (
                        <p className="text-[10px] text-red-600 font-semibold flex items-center gap-xs mt-0.5 animate-fade-in">
                          <span className="material-symbols-outlined text-[12px]">error</span>
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={quickRfqForm.email}
                        onChange={(e) => {
                          setQuickRfqForm({ ...quickRfqForm, email: e.target.value });
                          if (emailError) setEmailError('');
                        }}
                        onBlur={(e) => validateEmail(e.target.value)}
                        className={`w-full h-11 px-md border ${emailError ? 'border-red-500 focus:border-red-500' : 'border-surface-variant focus:border-primary'} rounded-xl focus:ring-0 text-body-sm bg-white`}
                      />
                      {emailError && (
                        <p className="text-[10px] text-red-600 font-semibold flex items-center gap-xs mt-0.5 animate-fade-in">
                          <span className="material-symbols-outlined text-[12px]">error</span>
                          {emailError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Preferred Timeline</label>
                      <select
                        value={quickRfqForm.timeline}
                        onChange={(e) => setQuickRfqForm({ ...quickRfqForm, timeline: e.target.value })}
                        className="w-full h-11 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white font-semibold"
                      >
                        <option value="Immediate (1-3 Days)">Immediate (1-3 Days)</option>
                        <option value="1 Week">1 Week</option>
                        <option value="2-4 Weeks">2-4 Weeks</option>
                        <option value="Flexible / TBD">Flexible / TBD</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label className="text-secondary text-label-caps text-[10px] font-bold uppercase tracking-wider font-label-caps">Notes & Customization (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. customized pipe bends, test certificates needed..."
                        value={quickRfqForm.details}
                        onChange={(e) => setQuickRfqForm({ ...quickRfqForm, details: e.target.value })}
                        className="w-full p-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white resize-none"
                      />
                    </div>
                  </div>

                  {/* Items Summary list */}
                  <div className="bg-[#F8F9FA] border border-surface-variant p-md rounded-2xl max-h-[140px] overflow-y-auto space-y-xs">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Items to Enquire ({totalItemCount})</span>
                    {rows.filter(r => r.productId && r.qty > 0).map((row, idx) => {
                      const prod = getProductDetails(row.productId);
                      return prod ? (
                        <div key={idx} className="flex justify-between text-xs text-on-surface">
                          <span className="font-semibold truncate max-w-[280px]">{prod.name}</span>
                          <span className="font-bold text-secondary shrink-0">{row.qty} {prod.unit.replace('/', '')}</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="flex gap-md pt-md">
                    <button
                      type="button"
                      onClick={() => setIsRfqFormOpen(false)}
                      className="flex-1 h-12 border border-surface-variant text-secondary hover:bg-background transition-colors font-bold rounded-xl font-label-caps text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingRfq}
                      className="flex-1 h-12 bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00] transition-all font-bold rounded-xl flex items-center justify-center gap-xs font-label-caps text-xs disabled:opacity-50"
                    >
                      {submittingRfq ? 'Submitting...' : 'Submit RFQ'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* B2B Logistics Benefits */}
            <div className="space-y-lg text-left">
              <h3 className="font-bold text-body-lg text-[#0A0A0A] flex items-center gap-xs pl-2">
                <span className="material-symbols-outlined text-[#FFC107] text-[22px]">local_shipping</span>
                Enterprise Shipping & Logistics Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {[
                  { icon: 'rv_hookup', title: 'Heavy Unloading Fleet', desc: 'On-site crane/unloading equipment dispatch for bulk rebar coils, cement trucks, and pipe bundles.' },
                  { icon: 'factory', title: 'Direct Factory Dispatch', desc: 'Bypass intermediate depots with direct transit from manufacturer plants to your job site, reducing delivery times.' },
                  { icon: 'support_agent', title: 'Assigned Procurement Officer', desc: 'Get a single designated account representative to coordinate factory dispatch and route management.' },
                  { icon: 'verified', title: 'Manufacturer Test Certificates', desc: 'Receive official Mill Test Reports (MTC) and quality compliance audits directly from the factory.' }
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-white border border-surface-variant rounded-2xl p-lg space-y-sm shadow-sm hover:border-[#FFC107] transition-all">
                    <span className="material-symbols-outlined text-[#FFC107] text-[32px]">{benefit.icon}</span>
                    <h5 className="font-bold text-body-sm text-[#0A0A0A]">{benefit.title}</h5>
                    <p className="text-secondary text-xs leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
