import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api';

// Hierarchical types
interface LeafCategory {
  name: string
  slug: string
}

interface Subcategory {
  name: string
  slug: string
  leaves: LeafCategory[]
}

interface PrimaryCategory {
  name: string
  slug: string
  icon: string
  desc: string
  subcategories: Subcategory[]
  featuredBrands: string[]
  buyingGuides: { title: string; link: string }[]
  topSearches: string[]
}

// 8 Categories Hierarchy
const materialsHierarchy: PrimaryCategory[] = [
  {
    name: 'Plumbing',
    slug: 'plumbing',
    icon: 'plumbing',
    desc: 'Industrial and residential water supply, sewage, and gas piping systems.',
    subcategories: [
      {
        name: 'Pipes & Fittings',
        slug: 'pipes-fittings',
        leaves: [
          { name: 'PVC Pipes', slug: 'pvc-pipes' },
          { name: 'CPVC Pipes', slug: 'cpvc-pipes' },
          { name: 'UPVC Pipes', slug: 'upvc-pipes' },
          { name: 'HDPE Pipes', slug: 'hdpe-pipes' },
          { name: 'Pipe Fittings', slug: 'pipe-fittings' }
        ]
      },
      {
        name: 'Water Tanks',
        slug: 'water-tanks',
        leaves: [
          { name: 'Overhead Tanks', slug: 'overhead-tanks' },
          { name: 'Underground Tanks', slug: 'underground-tanks' },
          { name: 'Loft Tanks', slug: 'loft-tanks' }
        ]
      },
      {
        name: 'Valves',
        slug: 'valves',
        leaves: [
          { name: 'Ball Valves', slug: 'ball-valves' },
          { name: 'Gate Valves', slug: 'gate-valves' },
          { name: 'Check Valves', slug: 'check-valves' }
        ]
      },
      {
        name: 'Pumps',
        slug: 'pumps',
        leaves: [
          { name: 'Booster Pumps', slug: 'booster-pumps' },
          { name: 'Submersible Pumps', slug: 'submersible-pumps' },
          { name: 'Monoblock Pumps', slug: 'monoblock-pumps' }
        ]
      },
      {
        name: 'Bathroom Fittings',
        slug: 'bathroom-fittings',
        leaves: [
          { name: 'Faucets & Taps', slug: 'faucets-taps' },
          { name: 'Showers & Mixers', slug: 'showers-mixers' },
          { name: 'Sanitaryware', slug: 'sanitaryware' }
        ]
      }
    ],
    featuredBrands: ['Astral Pipes', 'Supreme', 'Jaquar', 'Cera', 'Finolex'],
    buyingGuides: [
      { title: 'CPVC vs UPVC: Selecting the Right Plumbing System', link: '#' },
      { title: 'SDR 11 vs SDR 13.5: Pressure Rating Guide', link: '#' }
    ],
    topSearches: ['Astral CPVC Pipe 1 Inch', 'Supreme PVC Elbow', 'Jaquar Basin Mixer', 'Water Tank 1000L']
  },
  {
    name: 'Electrical',
    slug: 'electrical',
    icon: 'bolt',
    desc: 'High-safety wiring, protection gear, switches, and lighting fixtures.',
    subcategories: [
      {
        name: 'Wires & Cables',
        slug: 'wires-cables',
        leaves: [
          { name: 'Copper Wires', slug: 'copper-wires' },
          { name: 'Armored Cables', slug: 'armored-cables' },
          { name: 'Flexible Cables', slug: 'flexible-cables' }
        ]
      },
      {
        name: 'Switches & Sockets',
        slug: 'switches-sockets',
        leaves: [
          { name: 'Modular Switches', slug: 'modular-switches' },
          { name: 'Sockets & Plates', slug: 'sockets-plates' },
          { name: 'Switchboxes', slug: 'switchboxes' }
        ]
      },
      {
        name: 'Protection Devices',
        slug: 'protection-devices',
        leaves: [
          { name: 'MCBs', slug: 'mcbs' },
          { name: 'RCCBs', slug: 'rccbs' },
          { name: 'Distribution Boards', slug: 'distribution-boards' }
        ]
      },
      {
        name: 'Lighting & Fans',
        slug: 'lighting-fans',
        leaves: [
          { name: 'LED Panel Lights', slug: 'led-panels' },
          { name: 'Ceiling Fans', slug: 'ceiling-fans' },
          { name: 'Industrial Lighting', slug: 'industrial-lighting' }
        ]
      }
    ],
    featuredBrands: ['Havells', 'Finolex', 'Anchor', 'Polycab', 'Legrand'],
    buyingGuides: [
      { title: 'Guide to FR and FRLS House Wires', link: '#' },
      { title: 'Understanding MCB Tripping Classes (B, C, D)', link: '#' }
    ],
    topSearches: ['Finolex 1.5 sq mm wire', 'Havells 16A MCB', 'Anchor Roma Switch', 'Polycab 4 core cable']
  },
  {
    name: 'Cement & Concrete',
    slug: 'cement-concrete',
    icon: 'architecture',
    desc: 'Structural binding agents, ready-mix configurations, and precast products.',
    subcategories: [
      {
        name: 'OPC & PPC Cement',
        slug: 'cement-opc-ppc',
        leaves: [
          { name: 'OPC 53 Grade', slug: 'opc-53' },
          { name: 'OPC 43 Grade', slug: 'opc-43' },
          { name: 'PPC Cement', slug: 'ppc' }
        ]
      },
      {
        name: 'Ready Mix Concrete',
        slug: 'ready-mix',
        leaves: [
          { name: 'M20 Concrete', slug: 'm20-concrete' },
          { name: 'M25 Concrete', slug: 'm25-concrete' },
          { name: 'M30 Concrete', slug: 'm30-concrete' }
        ]
      },
      {
        name: 'Concrete Products',
        slug: 'concrete-products',
        leaves: [
          { name: 'Solid Blocks', slug: 'solid-blocks' },
          { name: 'Paver Blocks', slug: 'paver-blocks' },
          { name: 'Kerbstones', slug: 'kerbstones' }
        ]
      }
    ],
    featuredBrands: ['UltraTech', 'Ambuja', 'ACC', 'Dalmia', 'JK Lakshmi'],
    buyingGuides: [
      { title: 'When to use OPC 53 vs PPC Cement', link: '#' },
      { title: 'Curing Time Guidelines for Concrete Slabs', link: '#' }
    ],
    topSearches: ['UltraTech Cement Bag', 'Ambuja Kawach PPC', 'ACC Gold 43', 'Ready Mix Concrete M25']
  },
  {
    name: 'Steel & Structural',
    slug: 'steel-structural',
    icon: 'construction',
    desc: 'High-yield reinforcing steel, structural angles, beams, and wire meshes.',
    subcategories: [
      {
        name: 'TMT Bars (Fe500+)',
        slug: 'tmt-bars',
        leaves: [
          { name: 'Fe 500D TMT', slug: 'fe-500d' },
          { name: 'Fe 550D TMT', slug: 'fe-550d' },
          { name: 'Super Ductile TMT', slug: 'sd-tmt' }
        ]
      },
      {
        name: 'Angles & Channels',
        slug: 'angles-channels',
        leaves: [
          { name: 'MS Angles', slug: 'ms-angles' },
          { name: 'MS Channels', slug: 'ms-channels' },
          { name: 'I-Beams', slug: 'i-beams' }
        ]
      },
      {
        name: 'Beams & Mesh',
        slug: 'beams-mesh',
        leaves: [
          { name: 'Welded Wire Mesh', slug: 'wire-mesh' },
          { name: 'Binding Wires', slug: 'binding-wires' }
        ]
      }
    ],
    featuredBrands: ['Tata Tiscon', 'JSW Neosteel', 'SAIL', 'Vizag Steel', 'Jindal Panther'],
    buyingGuides: [
      { title: 'Decoding Steel Grades: Fe 500D vs Fe 550D', link: '#' },
      { title: 'Corrosion Prevention in Structural Steel Work', link: '#' }
    ],
    topSearches: ['Tata Tiscon 12mm price', 'JSW Neosteel TMT', 'SAIL MS Angle', 'Binding Wire 1kg price']
  },
  {
    name: 'Paints & Chemicals',
    slug: 'paints-chemicals',
    icon: 'format_paint',
    desc: 'Protective and aesthetic surface coatings, waterproofing agents, and tiling adhesives.',
    subcategories: [
      {
        name: 'Interior & Exterior',
        slug: 'interior-exterior-paints',
        leaves: [
          { name: 'Interior Emulsion', slug: 'interior-emulsion' },
          { name: 'Exterior Emulsion', slug: 'exterior-emulsion' },
          { name: 'Metal & Wood Enamels', slug: 'wood-metal-enamels' }
        ]
      },
      {
        name: 'Waterproofing',
        slug: 'waterproofing',
        leaves: [
          { name: 'Roof Waterproofing', slug: 'roof-waterproofing' },
          { name: 'Damp-Proof Coatings', slug: 'damp-proof' },
          { name: 'Liquid Waterproofing Membrane', slug: 'liquid-membrane' }
        ]
      },
      {
        name: 'Adhesives & Grouts',
        slug: 'adhesives-grouts',
        leaves: [
          { name: 'Tile Adhesives', slug: 'tile-adhesives' },
          { name: 'Tile Grouts', slug: 'tile-grouts' },
          { name: 'Wood Adhesives', slug: 'wood-adhesives' }
        ]
      }
    ],
    featuredBrands: ['Asian Paints', 'Berger', 'Dr. Fixit', 'Fevicol', 'Nerolac'],
    buyingGuides: [
      { title: 'Waterproofing Guide for Terraces and Wet Areas', link: '#' },
      { title: 'Choosing Tile Adhesives: Type 1 vs Type 2', link: '#' }
    ],
    topSearches: ['Asian Paints Apex Ultima 20L', 'Dr. Fixit 301 LW+', 'Fevicol SH', 'Tile Adhesive Type 2']
  },
  {
    name: 'Tiles & Flooring',
    slug: 'tiles-flooring',
    icon: 'layers',
    desc: 'Vitrified ceramics, premium marbles, natural granite, and engineered vinyl tiles.',
    subcategories: [
      {
        name: 'Vitrified & Ceramic',
        slug: 'vitrified-ceramic',
        leaves: [
          { name: 'Double Charged Vitrified', slug: 'double-charged' },
          { name: 'Glazed Vitrified Tiles', slug: 'gvt-pgvt' },
          { name: 'Ceramic Wall Tiles', slug: 'ceramic-wall' }
        ]
      },
      {
        name: 'Granite & Marble',
        slug: 'granite-marble',
        leaves: [
          { name: 'Italian Marble', slug: 'italian-marble' },
          { name: 'Indian Marble', slug: 'indian-marble' },
          { name: 'Granite Slabs', slug: 'granite-slabs' }
        ]
      },
      {
        name: 'Wooden & Vinyl',
        slug: 'wooden-vinyl',
        leaves: [
          { name: 'Laminate Wooden Flooring', slug: 'wooden-flooring' },
          { name: 'Luxury Vinyl Tiles', slug: 'vinyl-tiles' }
        ]
      }
    ],
    featuredBrands: ['Kajaria', 'Somany', 'Nitco', 'Simpolo', 'Johnson Tiles'],
    buyingGuides: [
      { title: 'Vitrified vs Ceramic Tiles: Flooring Comparison', link: '#' },
      { title: 'Selecting and Laying Italian Marble Flooring', link: '#' }
    ],
    topSearches: ['Kajaria 2x2 Floor Tiles', 'Italian White Marble price', 'Black Granite Slab', 'Vinyl Flooring Sheets']
  },
  {
    name: 'Hardware & Tools',
    slug: 'hardware-tools',
    icon: 'handyman',
    desc: 'Security locks, screws, fasteners, power drills, and personal protective gear.',
    subcategories: [
      {
        name: 'Fasteners & Screws',
        slug: 'fasteners-screws',
        leaves: [
          { name: 'Anchor Bolts', slug: 'anchor-bolts' },
          { name: 'Drywall Screws', slug: 'drywall-screws' },
          { name: 'Self-Tapping Screws', slug: 'self-tapping' }
        ]
      },
      {
        name: 'Hand & Power Tools',
        slug: 'hand-power-tools',
        leaves: [
          { name: 'Impact Drills', slug: 'impact-drills' },
          { name: 'Angle Grinders', slug: 'angle-grinders' },
          { name: 'Hand Tool Sets', slug: 'hand-tools' }
        ]
      },
      {
        name: 'Safety Equipment',
        slug: 'safety-equipment',
        leaves: [
          { name: 'Safety Helmets', slug: 'safety-helmets' },
          { name: 'Safety Harnesses', slug: 'safety-harnesses' },
          { name: 'Protective Shoes', slug: 'safety-shoes' }
        ]
      }
    ],
    featuredBrands: ['Godrej', 'Bosch', 'Stanley', 'Karam', 'Tata Agrico'],
    buyingGuides: [
      { title: 'Essential Power Tools for Construction Sites', link: '#' },
      { title: 'Personal Protective Equipment (PPE) Guidelines', link: '#' }
    ],
    topSearches: ['Godrej Door Lock Set', 'Bosch Drill Machine 13mm', 'Karam Safety Harness', 'Drywall Screws Box']
  },
  {
    name: 'Building Materials',
    slug: 'building-materials',
    icon: 'home_work',
    desc: 'Masonry bricks, lightweight block configurations, boards, doors, and sheet roofing.',
    subcategories: [
      {
        name: 'Bricks & Blocks',
        slug: 'bricks-blocks',
        leaves: [
          { name: 'Red Clay Bricks', slug: 'red-bricks' },
          { name: 'AAC Blocks', slug: 'aac-blocks' },
          { name: 'Concrete Hollow Blocks', slug: 'hollow-blocks' }
        ]
      },
      {
        name: 'Roofing & Doors',
        slug: 'roofing-doors',
        leaves: [
          { name: 'Steel Roofing Sheets', slug: 'steel-roofing' },
          { name: 'Flush Doors', slug: 'flush-doors' },
          { name: 'UPVC Windows', slug: 'upvc-windows' }
        ]
      },
      {
        name: 'Plywood & Laminates',
        slug: 'plywood-laminates',
        leaves: [
          { name: 'Marine Plywood', slug: 'marine-plywood' },
          { name: 'Commercial Plywood', slug: 'commercial-plywood' },
          { name: 'Decorative Laminates', slug: 'decorative-laminates' }
        ]
      }
    ],
    featuredBrands: ['CenturyPly', 'Greenply', 'Tata Bluescope', 'Birla Aerocon', 'Supreme Doors'],
    buyingGuides: [
      { title: 'AAC Blocks vs Red Bricks: Cost and Weight Comparison', link: '#' },
      { title: 'Understanding Plywood Grades: BWR vs BWP (Marine)', link: '#' }
    ],
    topSearches: ['Century Plywood 19mm BWR', 'Tata Bluescope Roofing Sheet', 'AAC Blocks 4 inch', 'Red Clay Bricks price']
  }
]

// Fallback products data for offline mode
const staticProducts: Record<string, any[]> = {
  Plumbing: [
    { id: 'astral-cpvc-pipe', name: 'Astral CPVC Pipe', brand: 'Astral Pipes', price: '₹280', unit: '/ Piece', rating: '4.8', icon: 'plumbing', link: '#/product/astral-cpvc-pipe', desc: 'High-temperature CPVC pipe for hot and cold water distribution.', image: '/pdp_cpvc_pipe_main.png', subcategorySlug: 'pipes-fittings', leafSlug: 'cpvc-pipes' },
    { id: 'supreme-elbow-90', name: 'Supreme Elbow 90°', brand: 'Supreme', price: '₹24', unit: '/ Unit', rating: '4.7', icon: 'plumbing', link: '#/product/supreme-elbow-90', desc: 'Standard lead-free PVC 90 degree elbow for water lines.', image: '/pdp_supreme_elbow.png', subcategorySlug: 'pipes-fittings', leafSlug: 'pipe-fittings' },
    { id: 'jaquar-basin-mixer', name: 'Jaquar Basin Mixer', brand: 'Jaquar', price: '₹3,450', unit: '/ Unit', rating: '4.9', icon: 'plumbing', link: '#/product/jaquar-basin-mixer', desc: 'Premium chrome plated brass single lever basin mixer.', image: '/pdp_jaquar_basin_mixer.png', subcategorySlug: 'bathroom-fittings', leafSlug: 'faucets-taps' }
  ],
  Electrical: [
    { id: 'finolex-wire', name: 'Finolex Wire', brand: 'Finolex', price: '₹1,250', unit: '/ Coil', rating: '4.8', icon: 'electrical_services', link: '#/product/finolex-wire', desc: 'Flame retardant 1.5 sq mm PVC insulated copper wire.', image: '/pdp_finolex_wire.png', subcategorySlug: 'wires-cables', leafSlug: 'copper-wires' },
    { id: 'havells-mcb', name: 'Havells MCB', brand: 'Havells', price: '₹850', unit: '/ Unit', rating: '4.9', icon: 'electrical_services', link: '#/product/havells-mcb', desc: 'Crabtree single pole 16A miniature circuit breaker.', image: '/pdp_havells_mcb.png', subcategorySlug: 'protection-devices', leafSlug: 'mcbs' },
    { id: 'anchor-switch', name: 'Anchor Switch', brand: 'Anchor', price: '₹45', unit: '/ Unit', rating: '4.7', icon: 'electrical_services', link: '#/product/anchor-switch', desc: 'Modular Roma 6A single way electrical switch.', image: '/pdp_anchor_switch.png', subcategorySlug: 'switches-sockets', leafSlug: 'modular-switches' }
  ],
  Cement: [
    { id: 'ultratech-cement', name: 'UltraTech Cement', brand: 'UltraTech Cement', price: '₹450', unit: '/ Bag', rating: '4.8', icon: 'inventory_2', link: '#/product/ultratech-cement', desc: 'Premium 53 Grade OPC cement for high strength structures.', image: '/pdp_ultratech_cement.png', subcategorySlug: 'cement-opc-ppc', leafSlug: 'opc-53' },
    { id: 'ambuja-cement', name: 'Ambuja Cement', brand: 'Ambuja Cement', price: '₹445', unit: '/ Bag', rating: '4.7', icon: 'inventory_2', link: '#/product/ambuja-cement', desc: 'Ambuja Plus water repellent Pozzolana PPC cement.', image: '/pdp_ambuja_cement.png', subcategorySlug: 'cement-opc-ppc', leafSlug: 'ppc' },
    { id: 'acc-cement', name: 'ACC Cement', brand: 'ACC Cement', price: '₹440', unit: '/ Bag', rating: '4.6', icon: 'inventory_2', link: '#/product/acc-cement', desc: 'ACC Gold OPC 43 Grade cement for general construction.', image: '/pdp_acc_cement.png', subcategorySlug: 'cement-opc-ppc', leafSlug: 'opc-43' }
  ],
  Steel: [
    { id: 'tata-tiscon-tmt', name: 'Tata Tiscon SD TMT Rebars', brand: 'Tata Steel', price: '₹68,500', unit: '/ Ton', rating: '4.9', icon: 'construction', link: '#/product/tata-tiscon-tmt', desc: 'Super ductile Fe 500D steel rebars for concrete reinforce.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q', subcategorySlug: 'tmt-bars', leafSlug: 'sd-tmt' }
  ]
}

interface MaterialsHubProps {
  categorySlug?: string
  subcategorySlug?: string
  leafSlug?: string
}

const getNumericPrice = (price: any): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
  }
  return 0;
};

export default function MaterialsHub({ categorySlug, subcategorySlug, leafSlug }: MaterialsHubProps) {
  const [activeTab, setActiveTab] = useState<'Cement' | 'Steel' | 'Plumbing' | 'Electrical' | 'Paints' | 'Tiles' | 'Hardware' | 'Building'>('Cement')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Listing page filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number>(100000)
  const [sortOption, setSortOption] = useState<string>('Popularity')
  const [minRating, setMinRating] = useState<number>(0)
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>({})

  useEffect(() => {
    setLoading(true)
    apiFetch('/products')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        // data is in formattedCategories structure: { title, products }[]
        // Flatten all products and inject categoryTitle
        const flatProducts = data.reduce((acc: any[], cat: any) => {
          const productsWithCat = cat.products.map((p: any) => ({
            ...p,
            categoryTitle: cat.title
          }))
          return [...acc, ...productsWithCat]
        }, [])
        setProducts(flatProducts)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Backend server offline, using static product fallback.', err)
        // Flatten static fallback products and inject categoryTitle
        const flatStatic = Object.entries(staticProducts).reduce((acc: any[], [catName, arr]: [string, any[]]) => {
          const productsWithCat = arr.map((p: any) => ({
            ...p,
            categoryTitle: catName
          }))
          return [...acc, ...productsWithCat]
        }, [])
        setProducts(flatStatic)
        setLoading(false)
      })
  }, [])

  // Reset filters when navigation changes
  useEffect(() => {
    setSelectedBrands([]);
    setMinRating(0);
    setSelectedSpecs({});
    
    if (products.length > 0 && leafSlug) {
      const activeLeafName = materialsHierarchy
        .flatMap(c => c.subcategories || [])
        .flatMap(s => s.leaves || [])
        .find(l => l.slug === leafSlug)?.name;

      const matching = products.filter(p => {
        return p.leafSlug === leafSlug || p.leafSlug === activeLeafName || p.leafSlug?.toLowerCase() === leafSlug.toLowerCase();
      });
      
      if (matching.length > 0) {
        const prices = matching.map(p => getNumericPrice(p.price));
        const maxP = Math.max(...prices);
        setPriceRange(maxP || 100000);
      } else {
        setPriceRange(100000);
      }
    }
  }, [categorySlug, subcategorySlug, leafSlug, products])

  // Auto-scrolling and tab syncing on index tab parameter
  useEffect(() => {
    if (!categorySlug) {
      const hash = window.location.hash
      const queryIndex = hash.indexOf('?')
      if (queryIndex !== -1) {
        const searchParams = new URLSearchParams(hash.substring(queryIndex))
        let cat = searchParams.get('cat')
        if (cat) {
          cat = cat.toLowerCase()
          let targetTab: 'Cement' | 'Steel' | 'Plumbing' | 'Electrical' | 'Paints' | 'Tiles' | 'Hardware' | 'Building' | null = null
          
          if (cat.includes('cement') || cat.includes('concrete')) targetTab = 'Cement'
          else if (cat.includes('steel') || cat.includes('structural')) targetTab = 'Steel'
          else if (cat.includes('plumb')) targetTab = 'Plumbing'
          else if (cat.includes('elect')) targetTab = 'Electrical'
          else if (cat.includes('paint')) targetTab = 'Paints'
          else if (cat.includes('tile') || cat.includes('floor')) targetTab = 'Tiles'
          else if (cat.includes('hardw') || cat.includes('tool')) targetTab = 'Hardware'
          else if (cat.includes('build') || cat.includes('brick')) targetTab = 'Building'

          if (targetTab) {
            setActiveTab(targetTab)
            setTimeout(() => {
              document.getElementById('top-products-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 200)
          }
        }
      }
    }
  }, [categorySlug])

  // Resolve matching hierarchy
  const activeCategory = materialsHierarchy.find(c => c.slug === categorySlug)
  const activeSubcategory = activeCategory?.subcategories.find(s => s.slug === subcategorySlug)
  const activeLeaf = activeSubcategory?.leaves.find(l => l.slug === leafSlug)

  // RENDER 1: Leaf Product Listing Page
  if (categorySlug && subcategorySlug && leafSlug && activeCategory && activeSubcategory && activeLeaf) {
    const matchingProducts = products.filter(p => {
      return p.leafSlug === leafSlug || p.leafSlug === activeLeaf.name || p.leafSlug?.toLowerCase() === leafSlug.toLowerCase()
    })

    // Filter implementation
    const availableBrands = Array.from(new Set(matchingProducts.map(p => p.brand || 'Generic')))
    
    // Compute dynamic specification filters
    const specFilters: { key: string; values: string[] }[] = [];
    {
      const specsMap: Record<string, Set<string>> = {};
      matchingProducts.forEach(p => {
        if (p.specifications && typeof p.specifications === 'object') {
          Object.entries(p.specifications).forEach(([key, val]) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'brand' || lowerKey === 'manufacturer') return;
            if (val && typeof val === 'string') {
              if (!specsMap[key]) specsMap[key] = new Set();
              specsMap[key].add(val);
            }
          });
        }
      });
      Object.entries(specsMap).forEach(([key, valSet]) => {
        if (valSet.size > 1) {
          specFilters.push({ key, values: Array.from(valSet) });
        }
      });
    }

    const filteredProducts = matchingProducts.filter(p => {
      const numericPrice = getNumericPrice(p.price)
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand || 'Generic')
      const matchesPrice = numericPrice <= priceRange

      const ratingVal = parseFloat(p.rating || '0')
      const matchesRating = minRating === 0 || ratingVal >= minRating

      // Check dynamic specifications match
      let matchesSpecs = true;
      for (const [key, values] of Object.entries(selectedSpecs)) {
        if (values && values.length > 0) {
          const specValue = p.specifications?.[key];
          if (!specValue || !values.includes(specValue)) {
            matchesSpecs = false;
            break;
          }
        }
      }

      return matchesBrand && matchesPrice && matchesRating && matchesSpecs
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const priceA = getNumericPrice(a.price)
      const priceB = getNumericPrice(b.price)
      if (sortOption === 'Price: Low to High') return priceA - priceB
      if (sortOption === 'Price: High to Low') return priceB - priceA
      return 0 // Popularity (default)
    })

    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/materials" className="hover:text-primary transition-colors">Materials</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a href={`#/materials/${activeCategory.slug}`} className="hover:text-primary transition-colors">{activeCategory.name}</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a href={`#/materials/${activeCategory.slug}/${activeSubcategory.slug}`} className="hover:text-primary transition-colors">{activeSubcategory.name}</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A]">{activeLeaf.name}</span>
          </nav>

          <h1 className="font-headline-h1 text-[36px] font-extrabold text-[#0A0A0A] mb-xl tracking-tight">
            {activeLeaf.name}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 bg-[#F8F9FA] rounded-[24px] border border-[#E9ECEF] p-xl h-fit space-y-xl shadow-sm">
              <div className="flex justify-between items-center pb-md border-b border-[#E9ECEF]">
                <h3 className="font-bold text-body-md text-[#0A0A0A] flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span> Filters
                </h3>
                <button 
                  onClick={() => {
                    setSelectedBrands([]);
                    setMinRating(0);
                    setSelectedSpecs({});
                    if (matchingProducts.length > 0) {
                      const maxP = Math.max(...matchingProducts.map(p => getNumericPrice(p.price)));
                      setPriceRange(maxP || 100000);
                    } else {
                      setPriceRange(100000);
                    }
                  }} 
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Brand Filter */}
              <div className="space-y-md">
                <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Brands</p>
                <div className="space-y-sm">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-sm cursor-pointer select-none text-body-sm font-medium">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedBrands([...selectedBrands, brand])
                          else setSelectedBrands(selectedBrands.filter(b => b !== brand))
                        }}
                        className="rounded border-[#CED4DA] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-md">
                <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Max Price</p>
                <input 
                  type="range" 
                  min="0" 
                  max={matchingProducts.length > 0 ? Math.max(...matchingProducts.map(p => getNumericPrice(p.price))) : 100000} 
                  step="50" 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#E9ECEF] rounded appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-[#6C757D] font-bold">
                  <span>₹0</span>
                  <span className="text-primary font-extrabold text-body-sm">₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-md border-t border-[#E9ECEF] pt-md">
                <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">Customer Ratings</p>
                <div className="space-y-sm">
                  {[4.5, 4.0, 3.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={`flex items-center gap-xs text-body-sm w-full text-left py-xs px-sm rounded transition-all ${
                        minRating === rating 
                          ? 'bg-primary/10 text-[#0A0A0A] font-bold border border-primary/30' 
                          : 'hover:bg-[#E9ECEF]/50 text-[#495057] font-medium border border-transparent'
                      }`}
                    >
                      <div className="flex items-center text-primary">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const isFilled = i < Math.floor(rating);
                          const isHalf = !isFilled && i < rating;
                          return (
                            <span
                              key={i}
                              className="material-symbols-outlined text-[16px] text-primary"
                              style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {isHalf ? 'star_half' : 'star'}
                            </span>
                          );
                        })}
                      </div>
                      <span>{rating}+ Stars</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specifications Filter */}
              {specFilters.map((filter) => (
                <div key={filter.key} className="space-y-md border-t border-[#E9ECEF] pt-md">
                  <p className="font-bold text-xs uppercase tracking-wider text-[#6C757D]">{filter.key}</p>
                  <div className="space-y-sm">
                    {filter.values.map(val => {
                      const isChecked = selectedSpecs[filter.key]?.includes(val) || false;
                      return (
                        <label key={val} className="flex items-center gap-sm cursor-pointer select-none text-body-sm font-medium">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedSpecs(prev => {
                                const currentVals = prev[filter.key] || [];
                                const newVals = checked 
                                  ? [...currentVals, val]
                                  : currentVals.filter(v => v !== val);
                                return {
                                  ...prev,
                                  [filter.key]: newVals
                                };
                              });
                            }}
                            className="rounded border-[#CED4DA] text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          {val}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Product Grid & Sorting */}
            <div className="lg:col-span-3 space-y-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md pb-md border-b border-[#E9ECEF]">
                <p className="text-body-sm text-[#6C757D]">
                  Showing <span className="font-bold text-[#0A0A0A]">{sortedProducts.length}</span> products
                </p>
                <div className="flex items-center gap-sm">
                  <span className="text-xs text-[#6C757D] font-bold uppercase tracking-wider">Sort By:</span>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-[#CED4DA] bg-white rounded px-md h-9 text-body-sm font-bold text-[#0A0A0A] focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-white border border-[#E9ECEF] rounded-[24px] h-[360px] p-lg flex flex-col justify-between">
                      <div className="w-full aspect-square bg-[#E9ECEF] rounded"></div>
                      <div className="h-4 bg-[#E9ECEF] rounded w-2/3 mt-md"></div>
                      <div className="h-6 bg-[#E9ECEF] rounded w-1/3 mt-sm"></div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-5xl space-y-md bg-[#F8F9FA] rounded-[32px] border border-[#E9ECEF]">
                  <span className="material-symbols-outlined text-[64px] text-[#CED4DA]">search_off</span>
                  <h3 className="font-bold text-headline-h3 text-[#0A0A0A]">No Products Found</h3>
                  <p className="text-[#6C757D] text-body-md max-w-md mx-auto">No products currently match your active filters or category criteria. Try broadening your range or clearing selected brands.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  {sortedProducts.map(product => (
                    <a
                      key={product.name}
                      href={product.link ? product.link.replace('#/product/', '#/products/') : `#/products/${product.id}`}
                      className="bg-white rounded-[24px] border border-[#E9ECEF] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary transition-all duration-300 flex flex-col justify-between group no-underline"
                    >
                      <div>
                        <div className="aspect-square bg-[#F8F9FA] rounded-[16px] overflow-hidden flex items-center justify-center border border-[#E9ECEF] relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider">
                            {product.brand}
                          </span>
                        </div>
                        <h4 className="font-bold text-body-md leading-tight text-[#0A0A0A] group-hover:text-primary transition-colors mt-lg">
                          {product.name}
                        </h4>
                        <p className="text-xs text-[#6C757D] leading-relaxed mt-xs line-clamp-2">
                          {product.desc}
                        </p>
                      </div>
                      <div className="pt-md flex flex-col gap-xs mt-md border-t border-[#E9ECEF]">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-extrabold text-[#0A0A0A]">
                            {product.price}{' '}
                            <span className="text-xs font-normal text-[#6C757D]">
                              {product.unit}
                            </span>
                          </span>
                          <div className="bg-[#0A0A0A] text-white p-2 rounded group-hover:bg-primary transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-xs mt-xs">
                          <span 
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: (product.stock || 0) > 10 ? '#10B981' : (product.stock || 0) > 0 ? '#F59E0B' : '#EF4444' }}
                          ></span>
                          <span className="text-[11px] text-[#6C757D] font-medium">
                            {(product.stock || 0) > 10 ? `${product.stock} Units In Stock` : (product.stock || 0) > 0 ? `Low Stock: Only ${product.stock} left` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RENDER 2: Subcategory Page
  if (categorySlug && subcategorySlug && activeCategory && activeSubcategory) {
    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/materials" className="hover:text-primary transition-colors">Materials</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a href={`#/materials/${activeCategory.slug}`} className="hover:text-primary transition-colors">{activeCategory.name}</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A]">{activeSubcategory.name}</span>
          </nav>

          {/* Subcategory Hero */}
          <div className="bg-[#F8F9FA] rounded-[32px] p-xl md:p-xxl border border-[#E9ECEF] flex flex-col md:flex-row items-center justify-between gap-xl mb-4xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,#827660_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none"></div>
            <div className="space-y-sm max-w-2xl relative z-10">
              <span className="material-symbols-outlined text-primary text-[48px] block">
                {activeCategory.icon}
              </span>
              <h1 className="font-headline-h1 text-[36px] md:text-[48px] font-extrabold text-[#0A0A0A] leading-tight tracking-tight">
                {activeSubcategory.name}
              </h1>
              <p className="text-body-lg text-[#6C757D]">
                Drill down into standard, specialized structural and finishing types under {activeSubcategory.name} to view prices and request quotes.
              </p>
            </div>
          </div>

          <h2 className="font-headline-h2 text-[26px] font-extrabold text-[#0A0A0A] mb-xl tracking-tight">
            Select Product Type
          </h2>

          {/* Leaf Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {activeSubcategory.leaves.map((leaf) => (
              <a
                key={leaf.name}
                href={`#/materials/${activeCategory.slug}/${activeSubcategory.slug}/${leaf.slug}`}
                className="bg-[#FFFFFF] rounded-[24px] border border-[#E9ECEF] p-xl hover:border-primary hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-[180px] no-underline"
              >
                <div>
                  <h3 className="font-bold text-headline-h3 text-[20px] text-[#0A0A0A] group-hover:text-primary transition-colors">
                    {leaf.name}
                  </h3>
                  <p className="text-xs text-[#6C757D] leading-relaxed mt-sm">
                    Browse all verified {leaf.name} products, compare supplier price points and order logs.
                  </p>
                </div>
                <div className="flex items-center gap-xs font-bold text-xs text-primary font-label-caps uppercase tracking-wider mt-md">
                  View Listings
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // RENDER 3: Category Landing Page
  if (categorySlug && activeCategory) {
    const categoryProducts = products.filter(p => {
      return p.categoryTitle.toLowerCase() === activeCategory.name.toLowerCase() || (activeCategory.name === 'Cement & Concrete' && p.categoryTitle === 'Cement')
    }).slice(0, 3)

    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/materials" className="hover:text-primary transition-colors">Materials</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A]">{activeCategory.name}</span>
          </nav>

          {/* Hero Banner */}
          <div className="bg-[#1a1c1c] text-white rounded-[32px] p-xl md:p-xxl flex flex-col md:flex-row items-center justify-between gap-xl mb-4xl border border-white/5 relative overflow-hidden shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
            <div className="space-y-md relative z-10 max-w-3xl">
              <span className="material-symbols-outlined text-primary text-[48px] block">
                {activeCategory.icon}
              </span>
              <h1 className="font-headline-h1 text-[36px] md:text-[48px] font-extrabold leading-none text-white tracking-tight">
                {activeCategory.name}
              </h1>
              <p className="text-secondary-fixed-dim text-body-lg">
                {activeCategory.desc} Source direct from verified manufacturers across India. Save up to 15% on bulk procurement logs.
              </p>
            </div>
            <a
              href="#/"
              onClick={() => {
                window.location.hash = '#/'
                setTimeout(() => {
                  document.getElementById('rfq-form-section')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="bg-primary text-[#0A0A0A] font-bold px-xxl py-lg rounded hover:bg-[#fabd00] hover:scale-105 transition-all shrink-0 relative z-10 flex items-center justify-center"
            >
              Get Custom RFQ
            </a>
          </div>

          {/* Subcategories Grid */}
          <div className="space-y-xl mb-5xl">
            <h2 className="font-headline-h2 text-[26px] font-extrabold text-[#0A0A0A] tracking-tight">
              Product Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
              {activeCategory.subcategories.map((sub) => (
                <div
                  key={sub.name}
                  className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:border-primary hover:-translate-y-1 transition-all duration-300 h-[260px]"
                >
                  <div>
                    <h3 className="font-bold text-headline-h3 text-[20px] text-[#0A0A0A]">
                      {sub.name}
                    </h3>
                    <div className="flex flex-wrap gap-xs mt-md">
                      {sub.leaves.map(leaf => (
                        <a 
                          key={leaf.name}
                          href={`#/materials/${activeCategory.slug}/${sub.slug}/${leaf.slug}`}
                          className="bg-[#F8F9FA] hover:bg-primary-container/10 border border-[#E9ECEF] hover:border-primary text-xs font-semibold px-md py-sm rounded-full text-[#6C757D] hover:text-primary transition-all duration-200"
                        >
                          {leaf.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <a
                    href={`#/materials/${activeCategory.slug}/${sub.slug}`}
                    className="flex items-center gap-xs font-bold text-xs text-primary font-label-caps uppercase tracking-wider"
                  >
                    View All Subcategories
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Brands */}
          <div className="space-y-xl mb-5xl bg-[#F8F9FA] rounded-[32px] p-xl md:p-xxl border border-[#E9ECEF]">
            <h2 className="font-headline-h2 text-[24px] font-extrabold text-[#0A0A0A] tracking-tight text-center">
              Featured Brands
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2xl pt-md">
              {activeCategory.featuredBrands.map(brand => (
                <div key={brand} className="bg-white px-xl py-lg rounded border border-[#E9ECEF] font-bold text-[#6C757D] shadow-sm select-none">
                  {brand}
                </div>
              ))}
            </div>
          </div>

          {/* Popular Products & Guides Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3xl">
            {/* Popular Products Column */}
            <div className="lg:col-span-2 space-y-xl">
              <h2 className="font-headline-h2 text-[26px] font-extrabold text-[#0A0A0A] tracking-tight">
                Popular Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {categoryProducts.map(product => (
                  <a
                    key={product.name}
                    href={product.link ? product.link.replace('#/product/', '#/products/') : `#/products/${product.id}`}
                    className="bg-white rounded-[24px] border border-[#E9ECEF] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary transition-all duration-300 flex flex-col justify-between group no-underline"
                  >
                    <div>
                      <div className="aspect-square bg-[#F8F9FA] rounded-[16px] overflow-hidden flex items-center justify-center border border-[#E9ECEF] relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-[#0A0A0A] text-white font-label-caps text-[9px] px-sm py-1 rounded-full uppercase tracking-wider">
                          {product.brand}
                        </span>
                      </div>
                      <h4 className="font-bold text-body-md leading-tight text-[#0A0A0A] group-hover:text-primary transition-colors mt-lg">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#6C757D] leading-relaxed mt-xs line-clamp-2">
                        {product.desc}
                      </p>
                    </div>
                    <div className="pt-md flex items-center justify-between mt-md border-t border-[#E9ECEF]">
                      <span className="text-lg font-extrabold text-[#0A0A0A]">
                        {product.price}{' '}
                        <span className="text-xs font-normal text-[#6C757D]">
                          {product.unit}
                        </span>
                      </span>
                      <div className="bg-[#0A0A0A] text-white p-2 rounded group-hover:bg-primary transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Guides & Searches Column */}
            <div className="space-y-2xl">
              {/* Buying Guides */}
              <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm">
                <h3 className="font-bold text-body-lg text-[#0A0A0A] border-b border-[#E9ECEF] pb-xs">
                  Buying Guides
                </h3>
                <ul className="space-y-sm text-left">
                  {activeCategory.buyingGuides.map((guide, i) => (
                    <li key={i}>
                      <a href={guide.link} className="hover:text-primary transition-colors font-semibold text-body-sm text-[#212529] block">
                        • {guide.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Searches */}
              <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm">
                <h3 className="font-bold text-body-lg text-[#0A0A0A] border-b border-[#E9ECEF] pb-xs">
                  Top Searches
                </h3>
                <div className="flex flex-wrap gap-xs pt-xs">
                  {activeCategory.topSearches.map(term => (
                    <span key={term} className="bg-[#F8F9FA] border border-[#E9ECEF] text-xs font-semibold px-md py-sm rounded-full text-[#6C757D] select-none">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RENDER 4: Default Materials Hub Index Page (All Categories)
  return (
    <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pb-5xl select-none">
      {/* Hero Section */}
      <header className="relative pt-lg pb-5xl bg-[#F8F9FA] overflow-hidden border-b border-[#E9ECEF]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#827660_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-lg relative z-10 flex flex-col lg:flex-row items-center gap-4xl">
          <div className="flex-1 space-y-xl text-left">
            <h1 className="font-headline-h1 text-[40px] md:text-[56px] lg:text-[60px] font-extrabold text-[#0A0A0A] leading-[1.1] tracking-tight">
              Construction Materials For Every Project
            </h1>
            <p className="font-body-lg text-[#6C757D] max-w-2xl text-body-lg">
              Source construction materials from verified suppliers across India. Compare products, discover brands, and procure smarter with ARCUS.
            </p>
            <div className="flex flex-wrap gap-lg pt-md">
              <a
                href="#categories-section"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-[#0A0A0A] text-white font-bold px-xxl py-lg rounded shadow-md hover:bg-primary hover:text-[#0A0A0A] transition-all duration-200 flex items-center justify-center"
              >
                Explore Categories
              </a>
              <a
                href="#/"
                onClick={() => {
                  window.location.hash = '#/'
                  setTimeout(() => {
                    document.getElementById('rfq-form-section')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="border-2 border-[#0A0A0A] text-[#0A0A0A] font-bold px-xxl py-lg rounded hover:bg-[#0A0A0A] hover:text-white transition-all duration-200 flex items-center justify-center"
              >
                Raise RFQ
              </a>
            </div>
            <div className="grid grid-cols-3 gap-xl pt-3xl border-t border-[#E9ECEF]">
              <div>
                <div className="text-[32px] font-extrabold text-primary">10,000+</div>
                <div className="font-bold text-[10px] uppercase text-[#6C757D] tracking-wider mt-xs">Products</div>
              </div>
              <div>
                <div className="text-[32px] font-extrabold text-primary">5,000+</div>
                <div className="font-bold text-[10px] uppercase text-[#6C757D] tracking-wider mt-xs">Suppliers</div>
              </div>
              <div>
                <div className="text-[32px] font-extrabold text-primary">500+</div>
                <div className="font-bold text-[10px] uppercase text-[#6C757D] tracking-wider mt-xs">Cities</div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full h-[360px] md:h-[480px] relative">
            <div className="w-full h-full bg-white rounded-[24px] shadow-sm overflow-hidden border border-[#E9ECEF]">
              <img
                alt="Industrial Construction Materials"
                className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJgWxtoJFKHXgSoz2uW-UBKzL1M3tzfKl2nlRtOrzyFokvM6cd3l_EDLJlXpNYZBlqcVP5VGr3Gxl7fzbJW3cOH_swhAgx4OEYL8CTcQFKVjR3QSXYoquVTJLg-W0SpXi-olrEaFVTaAXKaWKjjuemKBeLubWH3PSWRLds3KZImw25MsOcByKLowaYe4q__Kl76d9GSV3kNS9GetPuWB1HoMBHTorRQPtoT-N6QIP1gXpV8Yba7AfciNKw66MFmiUMaMS1UnrzwPo"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#1a1c1c] text-white p-lg rounded shadow flex items-center gap-md border border-white/5">
              <span className="material-symbols-outlined text-primary text-3xl font-bold">verified</span>
              <div className="text-left">
                <p className="font-extrabold text-body-sm text-white">Verified Suppliers Only</p>
                <p className="text-[10px] text-white/60">Strict compliance &amp; quality checks</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Material Categories Grid */}
      <section id="categories-section" className="py-5xl max-w-[1440px] mx-auto px-lg text-left">
        <div className="mb-4xl space-y-sm">
          <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">Browse Categories</h2>
          <p className="text-[#6C757D] text-body-lg max-w-xl">
            Deep inventory across every major vertical in industrial and commercial construction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
          {materialsHierarchy.map((category) => (
            <div
              key={category.name}
              role="button"
              tabIndex={0}
              onClick={() => {
                window.location.hash = `#/materials/${category.slug}`
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
              className="group h-[320px] bg-white rounded-[24px] border border-[#E9ECEF] p-xl flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-2 hover:border-primary transition-all duration-300 overflow-hidden relative text-left cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div>
                <span className="material-symbols-outlined text-primary text-[36px] mb-lg block">
                  {category.icon}
                </span>
                <h3 className="font-headline-h3 text-[22px] font-extrabold text-[#0A0A0A] mb-md">
                  {category.name}
                </h3>
                <ul className="text-[#6C757D] text-body-sm space-y-xs relative z-20">
                  {category.subcategories.slice(0, 4).map((sub) => (
                    <li key={sub.name}>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.hash = `#/materials/${category.slug}/${sub.slug}`
                        }}
                        onKeyDown={(ev) => ev.key === 'Enter' && ev.currentTarget.click()}
                        className="hover:text-primary transition-colors cursor-pointer"
                      >
                        • {sub.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="flex items-center gap-sm text-primary font-bold group-hover:gap-md transition-all font-body-sm">
                View Category <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bulk procurement desk section */}
      <section className="bg-[#1a1c1c] py-4xl overflow-hidden relative border-t border-b border-white/5 shadow-md">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-lg flex flex-col md:flex-row items-center justify-between gap-xl relative z-10 text-left">
          <div className="space-y-sm">
            <h2 className="font-headline-h2 text-white">Need Materials In Bulk?</h2>
            <p className="text-secondary-fixed-dim text-body-lg max-w-2xl">
              Get competitive quotes from verified suppliers across India. Our bulk procurement desk handles negotiation and logistics for you.
            </p>
          </div>
          <a
            href="#/"
            onClick={() => {
              window.location.hash = '#/'
              setTimeout(() => {
                document.getElementById('rfq-form-section')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
            className="bg-primary text-[#0A0A0A] font-bold px-4xl py-lg rounded shadow-sm hover:bg-[#fabd00] hover:scale-105 transition-all duration-200 shrink-0 flex items-center justify-center"
          >
            Raise RFQ
          </a>
        </div>
      </section>

      {/* Top Selling Products */}
      <section id="top-products-section" className="py-5xl max-w-[1440px] mx-auto px-lg text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-3xl gap-xl">
          <div className="space-y-sm">
            <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">Top Selling Products</h2>
            <p className="text-[#6C757D] text-body-md">
              The most procured items this month across Indian construction sites.
            </p>
          </div>
          {/* Tabs System */}
          <div className="flex gap-md overflow-x-auto pb-sm border-b border-[#E9ECEF] w-full md:w-auto">
            {(['Cement', 'Steel', 'Plumbing', 'Electrical', 'Paints', 'Tiles', 'Hardware', 'Building'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-lg py-md rounded font-bold text-body-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary-container text-[#121212] shadow-sm border border-primary/20'
                    : 'bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#6C757D]'
                }`}
              >
                {tab === 'Building' ? 'Building Materials' : tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white border border-[#E9ECEF] rounded-[24px] h-[360px] p-lg flex flex-col justify-between">
                <div className="w-full aspect-square bg-[#E9ECEF] rounded animate-pulse"></div>
                <div className="h-4 bg-[#E9ECEF] rounded w-2/3 mt-md"></div>
                <div className="h-6 bg-[#E9ECEF] rounded w-1/3 mt-sm"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {products
              .filter(p => p.categoryTitle.toLowerCase() === activeTab.toLowerCase() || (activeTab === 'Cement' && p.categoryTitle === 'Cement & Concrete'))
              .slice(0, 3)
              .map((product) => (
                <a
                  key={product.name}
                  href={product.link ? product.link.replace('#/product/', '#/products/') : `#/products/${product.id}`}
                  className="bg-white rounded-[24px] border border-[#E9ECEF] p-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary transition-all duration-300 group flex flex-col justify-between text-left no-underline block"
                >
                  <div>
                    <div className="aspect-square bg-[#F8F9FA] rounded-[16px] overflow-hidden flex items-center justify-center border border-[#E9ECEF]">
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image}
                      />
                    </div>
                    <div className="space-y-xs">
                      <span className="text-xs font-bold text-primary uppercase tracking-tighter block mt-lg">
                        {product.brand}
                      </span>
                      <h4 className="font-bold text-body-md leading-tight text-[#0A0A0A] group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#6C757D] line-clamp-2 mt-xs leading-relaxed">
                        {product.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-md flex items-center justify-between mt-md border-t border-[#E9ECEF]">
                    <span className="text-lg font-extrabold text-[#0A0A0A]">
                      {product.price}{' '}
                      <span className="text-xs font-normal text-[#6C757D]">
                        {product.unit}
                      </span>
                    </span>
                    <div className="bg-[#0A0A0A] text-white px-md py-sm rounded group-hover:bg-primary transition-colors flex items-center gap-xs text-xs font-bold font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      View Details
                    </div>
                  </div>
                </a>
              ))}
          </div>
        )}
      </section>

      {/* Calculators section */}
      <section className="py-5xl bg-[#F8F9FA] border-t border-b border-[#E9ECEF]">
        <div className="max-w-[1440px] mx-auto px-lg">
          <div className="mb-3xl text-center space-y-xs">
            <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">Construction Calculators</h2>
            <p className="text-[#6C757D] text-body-lg">
              Estimate material requirements with architectural precision.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-lg">
            {[
              { name: 'Cement', icon: 'architecture' },
              { name: 'Concrete', icon: 'layers' },
              { name: 'Brick', icon: 'grid_view' },
              { name: 'Paint', icon: 'format_paint' },
              { name: 'Tile', icon: 'dine_lamp' },
              { name: 'Steel', icon: 'reorder' },
            ].map((calc) => (
              <div
                key={calc.name}
                className="bg-white p-xl rounded-[20px] border border-[#E9ECEF] text-center hover:bg-primary-container hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <span className="material-symbols-outlined text-[40px] text-[#6C757D] group-hover:text-[#121212] transition-colors mb-md block">
                  {calc.icon}
                </span>
                <p className="font-bold text-body-md text-[#0A0A0A] group-hover:text-[#121212] transition-colors">
                  {calc.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Center */}
      <section className="py-5xl max-w-[1440px] mx-auto px-lg text-left">
        <div className="flex justify-between items-end mb-3xl">
          <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">Knowledge Center</h2>
          <button className="text-primary hover:text-[#fabd00] font-bold flex items-center gap-xs transition-colors text-body-sm">
            View All Guides <span className="material-symbols-outlined text-[20px]">trending_flat</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
          {[
            {
              category: 'Market Analysis',
              title: '2024 Steel Procurement Trends in Indian Construction',
              desc: 'Understand the shifting dynamics of steel prices and the impact of domestic logistics on tier-2 city developments.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqnIM85OKjAu1RHwN2yCgsIJLAkprWkhYwxdxSDGMorsiHoapyDtxH8JiKyVbg16EyPLjtwQfN6kXKnmf_Ytgia1zPnqj8ZwVj_uDq-1hNIA2TKdSIWugL_Rf-5CyVgGy63YX7FNry7lOq3NAgoqqMUtNObWu1y22kIIJPQzRx0v7KUgDiAcPZzzVxT09BjUlhnLSksnPqhasL1A2Ztbzm2d7p_GVouO6hU0p-k5wYWN17HNcyaRTNjCAnFR6kRaUFdkzB8ZQ1CLg',
            },
            {
              category: 'Buying Guide',
              title: 'Choosing the Right Grade of Cement for Commercial Buildings',
              desc: 'A comprehensive breakdown of OPC 43 vs 53 and when to utilize specialized PPC variants for long-term durability.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkL1ETT1f7N4o2eaXxWTGQje0qRJj7dJlfxcyDN0uHEnLn6qOW65ENH5yjpf-Uvyy8AybUNvHBZQluS5HA1QRx8MFZNCaYV2t-UVxeoq9tNOHkYXarde8e8AWWcshDHV6WECxTws1aw1pCYCaDB4F7qIpT23al2fMgaVLDzc7IkiASxKWRLg6yd23JU3EUKJqAZK7bcAAIZMvDGBcpBIqkbEnJfCJMPs5YlZ3XTEzsMCpUR2sO_KhlALpwdC1ZVkMaYFwutaQCRtc',
            },
            {
              category: 'Industry Report',
              title: 'Logistics Optimization for Multi-Site Projects',
              desc: 'How centralized procurement hubs are reducing delivery timelines by 25% for urban infrastructure contractors.',
              image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo9VYGm6Nntv-3dn68atB8q7XPpb0Q-m-98Zy3p4WXhuffGadqLJDTlujNxQhKgpuB6y_h7wUAgCct6pW_wxpeNgAimT3GUNOv_4mMbTDIYqSbFiFaf6om3nhLZ2gPBms772q2aztPp-PfOJecbK8371orMco067_op2EEZneVeWLj7s2GDn8JmRpljdJiQc6h56JV2QgZGRkidk6KBnHBdRcboZqhVjefY69ysFJWGL4YR0IUPF0XcVscrA3KvYIupBzbUhjVBHQ',
            }
          ].map((article) => (
            <article key={article.title} className="space-y-lg group">
              <div className="aspect-video bg-[#F8F9FA] rounded-[20px] overflow-hidden border border-[#E9ECEF] shadow-sm">
                <img
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={article.image}
                />
              </div>
              <div className="space-y-sm">
                <span className="text-xs font-bold text-primary uppercase block">
                  {article.category}
                </span>
                <h3 className="font-bold text-xl text-[#0A0A0A] group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-[#6C757D] line-clamp-3 leading-relaxed">
                  {article.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-5xl bg-gradient-to-br from-[#1a1c1c] to-[#0a0a0a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.02] pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-lg text-center relative z-10 space-y-xl">
          <h2 className="font-headline-h2 text-white text-[32px] md:text-[44px] font-extrabold tracking-tight">
            Ready To Procure Smarter?
          </h2>
          <p className="text-white/70 text-body-lg max-w-2xl mx-auto leading-relaxed">
            Join 10,000+ construction companies optimizing their material procurement with ARCUS.
          </p>
          <div className="flex flex-wrap justify-center gap-lg pt-md">
            <a
              href="#/"
              onClick={() => {
                window.location.hash = '#/'
                setTimeout(() => {
                  document.getElementById('rfq-form-section')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="bg-primary text-[#0A0A0A] font-bold px-4xl py-lg rounded hover:bg-[#fabd00] hover:scale-105 transition-all duration-200"
            >
              Get Started Today
            </a>
            <button className="border border-white/20 text-white px-4xl py-lg rounded font-bold hover:bg-white hover:text-[#0A0A0A] transition-all duration-200">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
