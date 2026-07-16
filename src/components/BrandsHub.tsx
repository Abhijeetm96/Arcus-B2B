import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { sanitizeText } from '../../shared/validation'
import { apiFetch } from '../lib/api';

interface Brand {
  name: string
  slug: string
  logoText: string
  gradient: string
  desc: string
  categories: string[]
  origin: string
  founded: string
  headquarters: string
  certifications: string[]
  documents: { name: string; size: string; type: string }[]
}

const brandsList: Brand[] = [
  {
    name: 'Astral Pipes',
    slug: 'astral',
    logoText: 'AS',
    gradient: 'from-[#0D47A1] to-[#1976D2]',
    desc: 'Astral Poly Technik Limited was established in 1996 with the aim of manufacturing plumbing and drainage systems in India. Today, it stands as a pioneer in CPVC and Lead-Free PVC piping technologies, offering high-temperature CPVC pipe systems for hot and cold water distribution.',
    categories: ['Plumbing', 'Pipes & Fittings'],
    origin: 'India',
    founded: '1996',
    headquarters: 'Ahmedabad, Gujarat',
    certifications: ['ISO 9001:2015', 'ISI Certified', 'NSF/ANSI Standard 14'],
    documents: [
      { name: 'Astral CPVC Pro Catalog 2026.pdf', size: '5.2 MB', type: 'PDF' },
      { name: 'Technical Datasheet & Flow Rates.pdf', size: '1.8 MB', type: 'PDF' },
      { name: 'ISO Quality & Compliance Certificate.pdf', size: '0.9 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Supreme',
    slug: 'supreme',
    logoText: 'SU',
    gradient: 'from-[#D32F2F] to-[#EF5350]',
    desc: 'Supreme Industries is India\'s leading plastics manufacturer. Founded in 1942, Supreme has pioneered various path-breaking products in piping, packaging, industrial, and consumer franchise segments, delivering durable, lead-free PVC solutions.',
    categories: ['Plumbing', 'Water Storage'],
    origin: 'India',
    founded: '1942',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 14001:2015', 'BIS License', 'CE Standards'],
    documents: [
      { name: 'Supreme Piping Systems Guide.pdf', size: '6.1 MB', type: 'PDF' },
      { name: 'PVC Fitting Dimensions & Specs.pdf', size: '2.1 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Jaquar',
    slug: 'jaquar',
    logoText: 'JA',
    gradient: 'from-[#1A237E] to-[#3F51B5]',
    desc: 'Jaquar Group is a rapidly growing multi-diversified bathing solutions brand with a global footprint. Built on the platform of quality, premium design, and customer service, Jaquar offers high-quality taps, showers, and sanitary ware.',
    categories: ['Plumbing', 'Bathroom Fittings'],
    origin: 'India',
    founded: '1960',
    headquarters: 'Manesar, Haryana',
    certifications: ['ISO 9001:2015', 'WRAS Approved', 'KIWA Certified'],
    documents: [
      { name: 'Jaquar Luxury Fittings Catalogue.pdf', size: '8.4 MB', type: 'PDF' },
      { name: 'Architectural CAD Drawings & Specs.pdf', size: '4.3 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Finolex',
    slug: 'finolex',
    logoText: 'FI',
    gradient: 'from-[#2E7D32] to-[#4CAF50]',
    desc: 'Finolex Cables is India\'s largest and leading manufacturer of electrical and telecommunication cables. Established in 1958, Finolex cables are manufactured with premium electrolytic grade copper and flame-retardant PVC insulation.',
    categories: ['Electrical', 'Wires & Cables'],
    origin: 'India',
    founded: '1958',
    headquarters: 'Pune, Maharashtra',
    certifications: ['ISO 9001:2015', 'BASEC Certified', 'LPCB Approved'],
    documents: [
      { name: 'Finolex Wires Price List & Spec.pdf', size: '3.4 MB', type: 'PDF' },
      { name: 'Flame Retardant Test Reports.pdf', size: '1.5 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Havells',
    slug: 'havells',
    logoText: 'HA',
    gradient: 'from-[#006064] to-[#00838F]',
    desc: 'Havells India Limited is a leading Fast Moving Electrical Goods (FMEG) company and a major power distribution equipment manufacturer. Its products range from industrial circuit breakers (MCBs) to premium switches and home appliances.',
    categories: ['Electrical', 'Switchgear'],
    origin: 'India',
    founded: '1958',
    headquarters: 'Noida, Uttar Pradesh',
    certifications: ['ISO 45001:2018', 'CE Mark', 'KEMA Certified'],
    documents: [
      { name: 'Havells Switchgear & MCB Guide.pdf', size: '4.7 MB', type: 'PDF' },
      { name: 'Crabtree Switches Catalogue.pdf', size: '3.9 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Anchor',
    slug: 'anchor',
    logoText: 'AN',
    gradient: 'from-[#E65100] to-[#F57C00]',
    desc: 'Anchor Electricals, now a subsidiary of Panasonic, is a household name for switches and sockets in India. With a legacy spanning over five decades, Anchor provides modular wiring accessories designed for safety and aesthetics.',
    categories: ['Electrical', 'Switches & Sockets'],
    origin: 'India (Panasonic)',
    founded: '1963',
    headquarters: 'Thane, Maharashtra',
    certifications: ['ISO 9001:2015', 'ISI Mark', 'JIS Compliant'],
    documents: [
      { name: 'Anchor Panasonic Roma Switch Spec.pdf', size: '2.8 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Asian Paints',
    slug: 'asian-paints',
    logoText: 'AP',
    gradient: 'from-[#880E4F] to-[#AD1457]',
    desc: 'Asian Paints is India\'s leading paint company and ranked among the top ten decorative coatings manufacturers in the world. Since its foundation in 1942, it has offered a wide range of innovative wall coatings, finishes, and wood protectors.',
    categories: ['Paints & Chemicals', 'Coatings'],
    origin: 'India',
    founded: '1942',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001:2015', 'GreenPro Certified', 'LEED Compliant'],
    documents: [
      { name: 'Apex Ultima Exterior Guide.pdf', size: '7.2 MB', type: 'PDF' },
      { name: 'Asian Paints Shade Card 2026.pdf', size: '12.4 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Dr. Fixit',
    slug: 'dr-fixit',
    logoText: 'DF',
    gradient: 'from-[#3E2723] to-[#4E342E]',
    desc: 'Dr. Fixit, a Pidilite brand, is India\'s leading waterproofing and damp-proofing brand. Offering specialized liquid membranes, sealants, and elastomeric coatings, Dr. Fixit provides structural waterproofing from foundations to roofs.',
    categories: ['Paints & Chemicals', 'Waterproofing'],
    origin: 'India',
    founded: '1959 (Pidilite)',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001:2015', 'BBA Approved', 'ASTM Standards'],
    documents: [
      { name: 'Dr Fixit Waterproofing Solutions.pdf', size: '4.2 MB', type: 'PDF' },
      { name: 'Material Safety Datasheet (MSDS).pdf', size: '1.1 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Fevicol',
    slug: 'fevicol',
    logoText: 'FE',
    gradient: 'from-[#004D40] to-[#00695C]',
    desc: 'Fevicol is the flagship brand of Pidilite Industries and India\'s most trusted adhesive brand. Renowned for carpentry, woodworking, and laminate applications, Fevicol SH provides unmatched bonding strength for wooden fittings.',
    categories: ['Paints & Chemicals', 'Adhesives'],
    origin: 'India',
    founded: '1959',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001:2015', 'ISI Mark', 'EN 204 Standard'],
    documents: [
      { name: 'Fevicol SH Woodworking Adhesive TDS.pdf', size: '1.7 MB', type: 'PDF' }
    ]
  },
  {
    name: 'UltraTech Cement',
    slug: 'ultratech',
    logoText: 'UT',
    gradient: 'from-[#4A148C] to-[#6A1B9A]',
    desc: 'UltraTech Cement Limited is the flagship cement company of the Aditya Birla Group. It is the largest manufacturer of grey cement, Ready Mix Concrete (RMC), and white cement in India, offering premium 53-grade OPC and PPC cement.',
    categories: ['Cement & Concrete', 'Building Materials'],
    origin: 'India',
    founded: '1983',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001', 'ISO 14001', 'GreenPro Gold Certified'],
    documents: [
      { name: 'UltraTech OPC 53 Tech Specifications.pdf', size: '2.5 MB', type: 'PDF' },
      { name: 'Concrete Mix Design Handbook.pdf', size: '3.8 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Ambuja Cement',
    slug: 'ambuja',
    logoText: 'AM',
    gradient: 'from-[#1A237E] to-[#283593]',
    desc: 'Ambuja Cements Limited, a major cement manufacturer in India, is known for its high-strength Pozzolana PPC cement and water-repellent concrete mixtures. Its unique micro-filler technology provides maximum structural density.',
    categories: ['Cement & Concrete', 'Building Materials'],
    origin: 'India',
    founded: '1983',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001:2015', 'OHSAS 18001', 'ISO 50001'],
    documents: [
      { name: 'Ambuja Plus Water Repellent Guide.pdf', size: '3.1 MB', type: 'PDF' }
    ]
  },
  {
    name: 'ACC Cement',
    slug: 'acc',
    logoText: 'AC',
    gradient: 'from-[#263238] to-[#37474F]',
    desc: 'ACC Limited is one of the oldest and most established cement and concrete manufacturers in India. Founded in 1936, ACC provides high-durability Portland Pozzolana Cement (PPC) and Ordinary Portland Cement (OPC).',
    categories: ['Cement & Concrete', 'Building Materials'],
    origin: 'India',
    founded: '1936',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001:2015', 'Ecolabel Certified', 'CE Standard'],
    documents: [
      { name: 'ACC Gold OPC 43 Specs & Guidelines.pdf', size: '2.0 MB', type: 'PDF' }
    ]
  },
  {
    name: 'Tata Steel',
    slug: 'tata',
    logoText: 'TS',
    gradient: 'from-[#0D47A1] to-[#1565C0]',
    desc: 'Tata Steel Limited is an Indian multinational steel-making company. Tata Tiscon is its flagship brand of high-strength, super-ductile Fe 500D TMT steel rebars, engineered to withstand seismic forces and protect structures.',
    categories: ['Steel & Structural', 'Building Materials'],
    origin: 'India',
    founded: '1907',
    headquarters: 'Mumbai, Maharashtra',
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'IATF 16949'],
    documents: [
      { name: 'Tata Tiscon SD Rebar Technical Catalog.pdf', size: '4.8 MB', type: 'PDF' },
      { name: 'Structural Steel Section Properties.pdf', size: '3.5 MB', type: 'PDF' }
    ]
  }
]

// Mock product inventory aligned with brands
const initialProducts = [
  { id: 'astral-cpvc-pipe', name: 'Astral CPVC Pipe 1"', brand: 'Astral Pipes', price: '₹280', unit: '/ Piece', rating: '4.8', icon: 'plumbing', desc: 'High-temperature CPVC pipe for hot and cold water distribution.', image: '/pdp_cpvc_pipe_main.png', category: 'Plumbing' },
  { id: 'astral-elbow-90', name: 'Astral CPVC Elbow 90°', brand: 'Astral Pipes', price: '₹35', unit: '/ Piece', rating: '4.7', icon: 'plumbing', desc: 'SDR 11 CPVC 90 degree elbow fittings.', image: '/pdp_cpvc_elbow.png', category: 'Plumbing' },
  { id: 'astral-ball-valve', name: 'Astral CPVC Ball Valve', brand: 'Astral Pipes', price: '₹150', unit: '/ Piece', rating: '4.8', icon: 'plumbing', desc: 'High pressure solvent welded CPVC flow controller.', image: '/pdp_cpvc_pipe_warehouse.png', category: 'Plumbing' },
  { id: 'supreme-elbow-90', name: 'Supreme Elbow 90°', brand: 'Supreme', price: '₹24', unit: '/ Unit', rating: '4.7', icon: 'plumbing', desc: 'Standard lead-free PVC 90 degree elbow for water lines.', image: '/pdp_supreme_elbow.png', category: 'Plumbing' },
  { id: 'supreme-pvc-pipe-4', name: 'Supreme PVC Pipe 4"', brand: 'Supreme', price: '₹450', unit: '/ Piece', rating: '4.6', icon: 'plumbing', desc: 'Lead-free heavy pressure PVC piping for rain water harvest.', image: '/pdp_cpvc_pipe_install.png', category: 'Plumbing' },
  { id: 'jaquar-basin-mixer', name: 'Jaquar Basin Mixer', brand: 'Jaquar', price: '₹3,450', unit: '/ Unit', rating: '4.9', icon: 'plumbing', desc: 'Premium chrome plated brass single lever basin mixer.', image: '/pdp_jaquar_basin_mixer.png', category: 'Plumbing' },
  { id: 'jaquar-shower-head', name: 'Jaquar Overhead Shower', brand: 'Jaquar', price: '₹1,850', unit: '/ Unit', rating: '4.8', icon: 'plumbing', desc: 'Multi-flow overhead rain shower with self-cleaning nozzles.', image: '/services_bathroom_renovation.png', category: 'Plumbing' },
  { id: 'finolex-wire', name: 'Finolex Wire 1.5 sq mm', brand: 'Finolex', price: '₹1,250', unit: '/ Coil', rating: '4.8', icon: 'electrical_services', desc: 'Flame retardant 1.5 sq mm PVC insulated copper wire.', image: '/pdp_finolex_wire.png', category: 'Electrical' },
  { id: 'finolex-cable-3core', name: 'Finolex 3 Core Cable', brand: 'Finolex', price: '₹3,200', unit: '/ Coil', rating: '4.7', icon: 'electrical_services', desc: 'Heavy duty round flexible 3 core copper cabling.', image: '/services_washing_machine.png', category: 'Electrical' },
  { id: 'havells-mcb', name: 'Havells MCB 16A', brand: 'Havells', price: '₹850', unit: '/ Unit', rating: '4.9', icon: 'electrical_services', desc: 'Crabtree single pole 16A miniature circuit breaker.', image: '/pdp_havells_mcb.png', category: 'Electrical' },
  { id: 'anchor-switch', name: 'Anchor Switch 6A', brand: 'Anchor', price: '₹45', unit: '/ Unit', rating: '4.7', icon: 'electrical_services', desc: 'Modular Roma 6A single way electrical switch.', image: '/pdp_anchor_switch.png', category: 'Electrical' },
  { id: 'asian-paints-apex', name: 'Asian Paints Apex Ultima', brand: 'Asian Paints', price: '₹5,400', unit: '/ Bucket', rating: '4.8', icon: 'format_paint', desc: 'Premium exterior emulsion paint with dust guard technology.', image: '/pdp_paints_apex.png', category: 'Paints' },
  { id: 'dr-fixit-waterproof', name: 'Dr. Fixit Waterproofing', brand: 'Dr. Fixit', price: '₹1,200', unit: '/ Can', rating: '4.7', icon: 'format_paint', desc: 'Liquid waterproofing membrane for roofs and walls.', image: '/pdp_dr_fixit.png', category: 'Paints' },
  { id: 'fevicol-sh-adhesive', name: 'Fevicol SH Adhesive', brand: 'Fevicol', price: '₹280', unit: '/ Kg', rating: '4.9', icon: 'format_paint', desc: 'Synthetic resin adhesive for carpentry and woodwork.', image: '/pdp_fevicol.png', category: 'Paints' },
  { id: 'ultratech-cement', name: 'UltraTech OPC 53 Cement', brand: 'UltraTech Cement', price: '₹450', unit: '/ Bag', rating: '4.8', icon: 'inventory_2', desc: 'Premium 53 Grade OPC cement for high strength structures.', image: '/pdp_ultratech_cement.png', category: 'Cement' },
  { id: 'ambuja-cement', name: 'Ambuja Plus Cement', brand: 'Ambuja Cement', price: '₹460', unit: '/ Bag', rating: '4.7', icon: 'inventory_2', desc: 'Ambuja Plus water repellent Pozzolana PPC cement.', image: '/pdp_ambuja_cement.png', category: 'Cement' },
  { id: 'acc-cement', name: 'ACC Gold Cement', brand: 'ACC Cement', price: '₹450', unit: '/ Bag', rating: '4.6', icon: 'inventory_2', desc: 'ACC Gold Pozzolana PPC water shield cement.', image: '/pdp_acc_cement.png', category: 'Cement' },
  { id: 'tata-tiscon-tmt', name: 'Tata Tiscon SD TMT 12mm', brand: 'Tata Steel', price: '₹68,500', unit: '/ Ton', rating: '4.9', icon: 'construction', desc: 'Super ductile Fe 500D steel rebars for concrete reinforcement.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q', category: 'Steel' }
]

interface BrandsHubProps {
  brandSlug?: string
}

export default function BrandsHub({ brandSlug }: BrandsHubProps) {
  const { user } = useAuth()
  const customerType = user?.customerType || (user?.role && ['Business', 'Contractor', 'Supplier'].includes(user.role) ? 'BUSINESS' : 'INDIVIDUAL');

  const [searchQuery, setSearchQuery] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [productsList, setProductsList] = useState<any[]>(initialProducts)

  useEffect(() => {
    // Dynamic products synchronization with api if available
    apiFetch('/products')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        // Flatten list
        const flatProducts = data.reduce((acc: any[], cat: any) => {
          const productsWithCat = cat.products.map((p: any) => ({
            ...p,
            category: cat.title
          }))
          return [...acc, ...productsWithCat]
        }, [])
        // Merge fetched and initial products to prevent missing entries
        const merged = [...initialProducts]
        flatProducts.forEach((fp: any) => {
          if (!merged.some(m => m.id === fp.id)) {
            merged.push(fp)
          }
        })
        setProductsList(merged)
      })
      .catch((err) => console.warn('Backend server offline, using static brand product list.', err))
  }, [])

  const getProductDefaultQty = (product: any) => {
    const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
    return customerType === 'BUSINESS' ? moq : 1;
  };

  const incrementQty = (product: any) => {
    const id = product.id;
    const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
    const mult = product.orderMultiple !== undefined ? product.orderMultiple : 1;
    const current = quantities[id] !== undefined ? quantities[id] : (customerType === 'BUSINESS' ? moq : 1);
    
    setQuantities(prev => ({
      ...prev,
      [id]: current + mult
    }))
  }

  const decrementQty = (product: any) => {
    const id = product.id;
    const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
    const mult = product.orderMultiple !== undefined ? product.orderMultiple : 1;
    const current = quantities[id] !== undefined ? quantities[id] : (customerType === 'BUSINESS' ? moq : 1);
    const minLimit = customerType === 'BUSINESS' ? moq : 1;

    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(minLimit, current - mult)
    }))
  }

  const { addToCart } = useCart()
  const handleAddToCart = (product: any) => {
    const qty = quantities[product.id] !== undefined ? quantities[product.id] : getProductDefaultQty(product)
    const image = product.image || (product.images && product.images.length > 0 ? product.images[0] : '/pdp_cpvc_pipe_main.png')
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit || '/ Unit',
      images: [image],
      categoryTitle: product.category || 'Materials',
      minimumOrderQuantity: product.minimumOrderQuantity,
      orderMultiple: product.orderMultiple,
      minimumOrderUnit: product.unit
    }, qty)

    setToastMessage(`Added ${qty} x ${product.name} to cart!`)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const handleDownload = (docName: string) => {
    alert(`Downloading ${docName}...`)
  }

  // 1. Brand Landing Detail Page
  if (brandSlug) {
    const brand = brandsList.find(b => b.slug === brandSlug)

    if (!brand) {
      return (
        <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] py-5xl text-center">
          <div className="max-w-[1440px] mx-auto px-lg">
            <span className="material-symbols-outlined text-[64px] text-red-500 block mb-md">cancel_presentation</span>
            <h1 className="font-headline-h1 text-[36px] font-extrabold text-[#0A0A0A] mb-md">Brand Not Found</h1>
            <p className="text-[#6C757D] text-body-md max-w-md mx-auto mb-xl">The manufacturer profile you are looking for does not exist or has been deactivated.</p>
            <a href="#/brands" className="bg-[#0A0A0A] text-white font-bold px-xxl py-lg rounded shadow-md hover:bg-primary hover:text-[#0A0A0A] transition-all">
              Back to Brands Directory
            </a>
          </div>
        </div>
      )
    }

    // Filter products matching this brand name or slug
    const brandProducts = productsList.filter(p => {
      const matchName = p.brand && p.brand.toLowerCase().includes(brand.name.toLowerCase())
      const matchSlug = p.brand && p.brand.toLowerCase().includes(brand.slug.toLowerCase())
      return matchName || matchSlug
    })

    // Related Products: complementary items from same categories but other brands
    const relatedProducts = productsList.filter(p => {
      const isOtherBrand = p.brand && !p.brand.toLowerCase().includes(brand.name.toLowerCase()) && !p.brand.toLowerCase().includes(brand.slug.toLowerCase())
      const isSameCategory = brand.categories.some(cat => p.category && p.category.toLowerCase().includes(cat.toLowerCase().replace('&', '').split(' ')[0]))
      return isOtherBrand && isSameCategory
    }).slice(0, 3)

    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left select-none relative">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[999] bg-[#0A0A0A] text-white px-xl py-lg rounded shadow font-semibold flex items-center gap-md border border-white/10 animate-fade-in">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            {toastMessage}
          </div>
        )}

        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/" className="hover:text-primary transition-colors font-semibold">Home</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a href="#/brands" className="hover:text-primary transition-colors font-semibold">Brands</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A] font-extrabold">{brand.name}</span>
          </nav>

          {/* Profile Header Block */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-[32px] overflow-hidden mb-4xl shadow-sm">
            <div className="px-lg md:px-2xl py-xl md:py-2xl flex flex-col md:flex-row items-center md:items-start gap-xl relative">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[24px] bg-gradient-to-br ${brand.gradient} text-white font-extrabold text-[48px] md:text-[56px] flex items-center justify-center shrink-0 shadow-md`}>
                {brand.logoText}
              </div>
              <div className="flex-1 space-y-md text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                  <div>
                    <h1 className="font-headline-h1 text-[36px] font-extrabold text-[#0A0A0A] tracking-tight">{brand.name}</h1>
                    <p className="text-body-md text-[#6C757D] font-semibold mt-1">Founded in {brand.founded} • Headquarters: {brand.headquarters}</p>
                  </div>
                  <div className="flex justify-center md:justify-end gap-sm flex-wrap">
                    {brand.certifications.slice(0, 2).map((cert, cIdx) => (
                      <span key={cIdx} className="bg-primary/10 border border-primary/20 text-[#0A0A0A] text-[10px] font-bold px-md py-1 rounded-full uppercase tracking-wider">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[#495057] text-body-md leading-relaxed max-w-4xl">{brand.desc}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-md pt-xs">
                  {brand.categories.map((cat, idx) => (
                    <span key={idx} className="bg-[#FFFFFF] border border-[#E9ECEF] text-[#495057] font-bold px-lg py-md rounded text-xs uppercase tracking-wide shadow-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            {/* Left/Middle Column: Products Catalog */}
            <div className="lg:col-span-2 space-y-4xl">
              <div className="space-y-xl text-left">
                <h2 className="font-headline-h2 text-[26px] font-extrabold text-[#0A0A0A] tracking-tight">Available Materials ({brandProducts.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  {brandProducts.map(product => {
                    const qty = quantities[product.id] !== undefined ? quantities[product.id] : getProductDefaultQty(product)
                    return (
                      <div key={product.id} className="bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[480px]">
                        <div className="flex flex-col gap-sm p-lg">
                          <a href={product.id.includes('cpvc') ? `#/products/astral-cpvc-pipe` : `#/products/${product.id}`} className="no-underline text-inherit group flex flex-col gap-sm">
                            <div className="h-44 bg-[#F8F9FA] rounded-[16px] flex items-center justify-center overflow-hidden relative">
                              <span className="material-symbols-outlined text-[48px] text-[#CED4DA] opacity-30 group-hover:scale-110 transition-transform duration-300">
                                {product.icon}
                              </span>
                            </div>
                            <div className="space-y-xs">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-body-md text-[#0A0A0A] line-clamp-1">{product.name}</h4>
                                <div className="flex items-center gap-xs text-xs font-bold text-[#0A0A0A]">
                                  <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                  {product.rating || '4.8'}
                                </div>
                              </div>
                              <p className="text-[11px] text-[#6C757D] font-bold uppercase tracking-wider">{product.brand}</p>
                              <p className="text-xs text-[#495057] line-clamp-2 mt-xs">{product.desc}</p>
                            </div>
                          </a>
                        </div>

                        <div className="px-lg pb-lg pt-xs border-t border-[#E9ECEF] flex flex-col gap-sm shrink-0">
                          {/* Price & Quantity Selector */}
                          <div className="flex items-center justify-between">
                            <p className="font-headline-h3 text-[20px] font-extrabold text-[#0A0A0A]">
                              {product.price}{' '}
                              <span className="text-xs text-[#6C757D] font-normal">{product.unit}</span>
                            </p>
                            {/* Quantity selection */}
                            <div className="flex flex-col items-end gap-1">
                              <div className="inline-flex items-center border border-[#CED4DA] rounded h-9 bg-white overflow-hidden shadow-sm">
                                <button
                                  onClick={() => decrementQty(product)}
                                  className="w-8 h-full flex items-center justify-center text-[#495057] hover:bg-[#F8F9FA] font-bold"
                                >
                                  -
                                </button>
                                <span className="w-10 text-center text-xs font-bold text-[#0A0A0A]">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => incrementQty(product)}
                                  className="w-8 h-full flex items-center justify-center text-[#495057] hover:bg-[#F8F9FA] font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[8px] font-bold text-[#6C757D] uppercase mr-1">Quantity</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-md mt-xs">
                            <a
                              href={product.id.includes('cpvc') ? `#/products/astral-cpvc-pipe` : `#/products/${product.id}`}
                              className="border border-[#0A0A0A] text-[#0A0A0A] rounded-[12px] h-10 text-xs font-bold flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
                            >
                              View Details
                            </a>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-primary text-[#0A0A0A] rounded-[12px] h-10 text-xs font-bold hover:bg-[#fabd00] transition-colors"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Related/Complementary Products */}
              {relatedProducts.length > 0 && (
                <div className="space-y-xl pt-4xl border-t border-[#E9ECEF]">
                  <h2 className="font-headline-h2 text-[24px] font-extrabold text-[#0A0A0A] tracking-tight">Related Recommendations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    {relatedProducts.map(product => (
                      <div key={product.id} className="bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden shadow-sm p-lg space-y-md flex flex-col justify-between hover:shadow-md transition-all duration-300">
                        <div className="space-y-md">
                          <div className="h-32 bg-[#F8F9FA] rounded-[16px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[36px] text-[#CED4DA] opacity-35">
                              {product.icon}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-body-sm text-[#0A0A0A] truncate" title={product.name}>{product.name}</h4>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{product.brand}</p>
                            <p className="text-[10px] text-[#6C757D] font-bold mt-1 uppercase bg-[#F8F9FA] px-md py-0.5 rounded-full inline-block">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-md border-t border-[#E9ECEF]">
                          <span className="font-bold text-[#0A0A0A] text-body-sm">{product.price}</span>
                          <a
                            href={product.id.includes('cpvc') ? `#/products/astral-cpvc-pipe` : `#/products/${product.id}`}
                            className="text-xs text-[#0A0A0A] font-bold underline hover:text-primary transition-colors"
                          >
                            Explore
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Specification Downloads & Stats */}
            <div className="space-y-xl text-left">
              {/* Detailed specification table */}
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-[24px] p-xl space-y-lg shadow-sm">
                <h3 className="font-bold text-body-lg text-[#0A0A0A] border-b border-[#E9ECEF] pb-md">Brand Parameters</h3>
                <div className="space-y-md text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6C757D] font-medium">Headquarters:</span>
                    <span className="font-bold text-[#0A0A0A]">{brand.headquarters}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6C757D] font-medium">Founded:</span>
                    <span className="font-bold text-[#0A0A0A]">{brand.founded}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6C757D] font-medium">Origin:</span>
                    <span className="font-bold text-[#0A0A0A]">{brand.origin}</span>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <span className="text-[#6C757D] font-medium">Certifications:</span>
                    <div className="flex flex-wrap gap-xs pt-1">
                      {brand.certifications.map((cert, idx) => (
                        <span key={idx} className="bg-[#FFFFFF] border border-[#E9ECEF] text-[#495057] font-bold px-md py-1 rounded text-[10px]">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents & Certification Downloads */}
              <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm">
                <h3 className="font-bold text-body-lg text-[#0A0A0A] border-b border-[#E9ECEF] pb-md">Documents & Certifications</h3>
                <ul className="space-y-md">
                  {brand.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-md text-xs border-b border-[#F8F9FA] pb-sm last:border-0 last:pb-0">
                      <div className="flex items-start gap-md min-w-0">
                        <span className="material-symbols-outlined text-red-500 shrink-0">picture_as_pdf</span>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0A0A0A] truncate" title={doc.name}>{doc.name}</p>
                          <p className="text-[10px] text-[#6C757D] mt-0.5">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(doc.name)}
                        className="material-symbols-outlined text-[#0A0A0A] hover:text-primary shrink-0 p-sm hover:bg-[#F8F9FA] rounded-full transition-all duration-200"
                        title="Download Document"
                      >
                        download
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Default Brand Directory View
  const filteredBrands = brandsList.filter(brand => {
    const query = sanitizeText(searchQuery).toLowerCase()
    const matchName = brand.name.toLowerCase().includes(query)
    const matchCategories = brand.categories.some(cat => cat.toLowerCase().includes(query))
    const matchDesc = brand.desc.toLowerCase().includes(query)
    return matchName || matchCategories || matchDesc
  })

  // Group brands alphabetically for non-search state
  const groupedBrands: Record<string, Brand[]> = {}
  
  filteredBrands.forEach(brand => {
    const firstLetter = brand.name[0].toUpperCase()
    if (!groupedBrands[firstLetter]) {
      groupedBrands[firstLetter] = []
    }
    groupedBrands[firstLetter].push(brand)
  })

  const sortedLetters = Object.keys(groupedBrands).sort()

  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left select-none">
      <div className="max-w-[1440px] mx-auto px-lg">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-lg">
          <a href="#/" className="hover:text-primary transition-colors font-semibold">Home</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0A0A0A] font-extrabold">Brands</span>
        </nav>

        {/* Directory Header Banner */}
        <div className="bg-[#1a1c1c] text-white rounded-[32px] p-xl md:p-xxl flex flex-col md:flex-row items-center justify-between gap-xl mb-4xl border border-white/5 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
          <div className="space-y-md relative z-10 max-w-3xl">
            <span className="material-symbols-outlined text-primary text-[48px] block">
              domain
            </span>
            <h1 className="font-headline-h1 text-[36px] md:text-[44px] font-extrabold leading-none text-white tracking-tight">
              Brands Directory
            </h1>
            <p className="text-secondary-fixed-dim text-body-lg">
              Partnering with India's most trusted manufacturers to deliver certified materials directly to your site.
            </p>
          </div>
        </div>

        {/* Search Bar section */}
        <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-lg md:p-xl mb-4xl shadow-sm text-left flex flex-col gap-md">
          <div className="space-y-xs">
            <h3 className="font-bold text-body-lg text-[#0A0A0A]">Search Partner Manufacturers</h3>
            <p className="text-xs text-[#6C757D]">Find specific brands or filter by product category lines.</p>
          </div>
          <div className="relative w-full">
            <span className="material-symbols-outlined text-[#CED4DA] absolute left-4 top-1/2 -translate-y-1/2 select-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-md rounded border border-[#E9ECEF] bg-[#F8F9FA] focus:bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm outline-none transition-all"
              placeholder="e.g. Astral, Supreme, UltraTech, Finolex..."
            />
          </div>
        </div>

        {/* Directory Display */}
        {filteredBrands.length === 0 ? (
          <div className="py-xxl text-center border border-dashed border-[#E9ECEF] rounded-[32px] bg-[#F8F9FA]">
            <span className="material-symbols-outlined text-[64px] text-[#CED4DA] block mb-md">domain_disabled</span>
            <h3 className="font-bold text-body-lg text-[#0A0A0A]">No brands match your search</h3>
            <p className="text-[#6C757D] text-xs mt-xs">Try searching for other keywords like plumbing, cement, or steel.</p>
          </div>
        ) : searchQuery.trim() !== '' ? (
          // Search results view: Flat grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filteredBrands.map(brand => (
              <div
                key={brand.slug}
                onClick={() => { window.location.hash = `#/brands/${brand.slug}` }}
                className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl flex flex-col justify-between hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 cursor-pointer group"
              >
                <div className="space-y-md">
                  <div className="flex items-center gap-md">
                    <div className={`w-14 h-14 rounded bg-gradient-to-br ${brand.gradient} text-white font-extrabold text-xl flex items-center justify-center shrink-0`}>
                      {brand.logoText}
                    </div>
                    <div>
                      <h3 className="font-bold text-body-md text-[#0A0A0A] group-hover:text-primary transition-colors leading-tight">{brand.name}</h3>
                      <p className="text-[10px] text-[#6C757D] font-semibold mt-0.5">Founded {brand.founded} • {brand.origin}</p>
                    </div>
                  </div>
                  <p className="text-[#495057] text-xs leading-relaxed line-clamp-3">{brand.desc}</p>
                </div>
                <div className="pt-xl flex flex-wrap gap-xs shrink-0">
                  {brand.categories.map((cat, idx) => (
                    <span key={idx} className="bg-[#F8F9FA] text-[#6C757D] text-[9px] font-bold px-sm py-0.5 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Default view: Alphabetical Grouping
          <div className="space-y-4xl">
            {sortedLetters.map(letter => (
              <div key={letter} className="space-y-lg">
                <div className="flex items-center gap-md">
                  <h2 className="font-extrabold text-[36px] text-primary font-headline-h2 leading-none w-10 shrink-0 text-center">
                    {letter}
                  </h2>
                  <div className="h-px flex-1 bg-[#E9ECEF]"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg pl-0 md:pl-4">
                  {groupedBrands[letter].map(brand => (
                    <div
                      key={brand.slug}
                      onClick={() => { window.location.hash = `#/brands/${brand.slug}` }}
                      className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl flex flex-col justify-between hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 cursor-pointer group"
                    >
                      <div className="space-y-md">
                        <div className="flex items-center gap-md">
                          <div className={`w-14 h-14 rounded bg-gradient-to-br ${brand.gradient} text-white font-extrabold text-xl flex items-center justify-center shrink-0`}>
                            {brand.logoText}
                          </div>
                          <div>
                            <h3 className="font-bold text-body-md text-[#0A0A0A] group-hover:text-primary transition-colors leading-tight">{brand.name}</h3>
                            <p className="text-[10px] text-[#6C757D] font-semibold mt-0.5">Founded {brand.founded} • {brand.origin}</p>
                          </div>
                        </div>
                        <p className="text-[#495057] text-xs leading-relaxed line-clamp-3">{brand.desc}</p>
                      </div>
                      <div className="pt-xl flex flex-wrap gap-xs shrink-0">
                        {brand.categories.map((cat, idx) => (
                          <span key={idx} className="bg-[#F8F9FA] text-[#6C757D] text-[9px] font-bold px-sm py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
