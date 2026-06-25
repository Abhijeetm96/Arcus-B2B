import { useState, useEffect } from 'react'
import { sanitizeText } from '../../shared/validation'

interface PopularService {
  name: string
  slug: string
  price: string
  proCount: number
  rating: number
  image: string
  desc: string
}

const popularServicesList: PopularService[] = [
  {
    name: 'Geyser Installation',
    slug: 'geyser-installation',
    price: '₹499',
    proCount: 142,
    rating: 4.9,
    image: '/services_geyser_install.png',
    desc: 'Worry-free geyser installation by certified plumbers.'
  },
  {
    name: 'Washing Machine Setup',
    slug: 'washing-machine-setup',
    price: '₹349',
    proCount: 98,
    rating: 4.8,
    image: '/services_washing_machine.png',
    desc: 'Inlet/outlet hose connections & level balancing.'
  },
  {
    name: 'Interior Painting',
    slug: 'interior-painting',
    price: '₹12,999',
    proCount: 75,
    rating: 5.0,
    image: '/services_interior_painting.png',
    desc: 'Bespoke interior accent wall textures & coatings.'
  },
  {
    name: 'Bathroom Renovation',
    slug: 'bathroom-renovation',
    price: '₹45,000',
    proCount: 52,
    rating: 4.9,
    image: '/services_bathroom_renovation.png',
    desc: 'Complete tile fitments and sanitary line updates.'
  },
  {
    name: 'Solar Installation',
    slug: 'solar-installation',
    price: '₹95,000',
    proCount: 28,
    rating: 4.8,
    image: '/services_solar_install.png',
    desc: 'On-grid rooftop solar setup with net-metering support.'
  },
  {
    name: 'Modular Kitchen',
    slug: 'modular-kitchen',
    price: '₹1,20,000',
    proCount: 64,
    rating: 4.9,
    image: '/services_modular_kitchen.png',
    desc: 'Modern modular cabinetry with soft-close hinges.'
  },
  {
    name: 'House Construction',
    slug: 'house-construction',
    price: '₹18,00,000',
    proCount: 38,
    rating: 4.9,
    image: '/services_house_construction.png',
    desc: 'Turnkey independent house building from layout to handover.'
  },
  {
    name: 'Waterproofing',
    slug: 'waterproofing',
    price: '₹5,000',
    proCount: 41,
    rating: 4.7,
    image: '/services_deep_cleaning.png',
    desc: 'Multi-layer terrace elastomeric waterproofing.'
  }
]

interface Professional {
  id: string
  name: string
  company: string
  location: string
  rating: number
  reviewCount: number
  experience: number
  completedProjects: number
  specializations: string[]
  startingPrice: string
  responseTime: string
  avatar: string
  coverImage: string
  isVerified: boolean
  isTopRated: boolean
  isPremium: boolean
  languages: string[]
  budget: string
  tag: 'Arcus Verified' | 'Premium Partner' | 'Preferred Partner'
}

const professionalsList: Professional[] = [
  {
    id: 'rajesh-varma',
    name: 'Rajesh Varma',
    company: 'Supreme Electricals Ltd.',
    location: 'Bangalore',
    rating: 4.9,
    reviewCount: 248,
    experience: 12,
    completedProjects: 150,
    specializations: ['Electrical', 'Maintenance'],
    startingPrice: '₹499',
    responseTime: 'Within 1 Hour',
    avatar: '/services_geyser_install.png',
    coverImage: '/services_washing_machine.png',
    isVerified: true,
    isTopRated: true,
    isPremium: true,
    languages: ['English', 'Kannada', 'Hindi'],
    budget: 'Low',
    tag: 'Premium Partner'
  },
  {
    id: 'ananya-shrivastava',
    name: 'Ananya Shrivastava',
    company: 'Elite Studio Works',
    location: 'Mumbai',
    rating: 5.0,
    reviewCount: 312,
    experience: 8,
    completedProjects: 120,
    specializations: ['Interior Design', 'Renovation'],
    startingPrice: '₹1,499',
    responseTime: 'Within 2 Hours',
    avatar: '/services_interior_painting.png',
    coverImage: '/services_modular_kitchen.png',
    isVerified: true,
    isTopRated: true,
    isPremium: true,
    languages: ['English', 'Marathi', 'Hindi'],
    budget: 'High',
    tag: 'Preferred Partner'
  },
  {
    id: 'karan-mehra',
    name: 'Karan Mehra',
    company: 'Rapid Flow Plumbing',
    location: 'Delhi NCR',
    rating: 4.8,
    reviewCount: 190,
    experience: 15,
    completedProjects: 210,
    specializations: ['Plumbing', 'Maintenance'],
    startingPrice: '₹399',
    responseTime: 'Within 1 Hour',
    avatar: '/pdp_cpvc_elbow.png',
    coverImage: '/pdp_cpvc_pipe_install.png',
    isVerified: true,
    isTopRated: false,
    isPremium: false,
    languages: ['English', 'Hindi', 'Punjabi'],
    budget: 'Medium',
    tag: 'Arcus Verified'
  }
]

interface FeaturedProject {
  image: string
  name: string
  location: string
  cost: string
  date: string
  contractor: string
  type: string
}

const featuredProjectsList: FeaturedProject[] = [
  {
    image: '/services_bathroom_renovation.png',
    name: 'Contemporary Penthouse Remodel',
    location: 'GK-II, New Delhi',
    cost: '₹12.5 Lakhs',
    date: 'Dec 2023',
    contractor: 'Ananya S. (Elite Studio)',
    type: 'Renovation'
  },
  {
    image: '/services_house_construction.png',
    name: 'Tech Hub Office Fit-Out',
    location: 'ORR, Bangalore',
    cost: '₹45 Lakhs',
    date: 'Nov 2023',
    contractor: 'Supreme Electricals & Design',
    type: 'Commercial'
  },
  {
    image: '/services_modular_kitchen.png',
    name: 'Modern Minimalist Kitchen',
    location: 'Powai, Mumbai',
    cost: '₹4.2 Lakhs',
    date: 'Jan 2024',
    contractor: 'Karan M. (Rapid Flow)',
    type: 'Modular'
  }
]

interface Testimonial {
  name: string
  location: string
  projectType: string
  rating: number
  review: string
  cost: string
}

const testimonialsList: Testimonial[] = [
  {
    name: 'Vikram Malhotra',
    location: 'Bangalore',
    projectType: 'Villa Renovation',
    rating: 5,
    review: '"Exceptional coordination! The BOQ audit saved us almost 12% on plumbing and electrical fixtures. The service partner finished the work 4 days ahead of schedule. Highly recommended."',
    cost: '₹8.5 Lakhs'
  },
  {
    name: 'Siddharth Roy',
    location: 'Mumbai',
    projectType: 'Commercial Fit-Out',
    rating: 5,
    review: '"Elite Studio Works executed our coworking layout flawlessly. Standardized invoicing, milestone-based escrow payments, and constant supervisor updates made the experience stress-free."',
    cost: '₹45 Lakhs'
  }
]

interface FAQItem {
  q: string
  a: string
}

const faqsList: FAQItem[] = [
  { q: 'How are professionals verified?', a: 'Every service partner on ARCUS goes through a 4-step compliance check. We verify corporate registry licenses (GST & PAN), perform site audits of past portfolios, run background checks on field engineers, and check for standard third-party liability insurance.' },
  { q: 'Can I hire directly?', a: 'Yes! You can review portfolios, ratings, and experience lists of individual professionals in your city and click "View Profile" to contact them directly or request an itemized quotation.' },
  { q: 'How do quote requests work?', a: 'Once you submit your project requirements, the ARCUS engineering desk reviews your description and floor plans. We then select the top 3 matching professionals in your region who send competitive bids within 24 hours.' },
  { q: 'Can I upload project drawings?', a: 'Yes. Our Request Quotes form accepts floor plan layouts, detailed Bill of Quantities (BOQ) sheets, elevation drawings, and site images up to 10MB in PDF, PNG, or JPG formats.' },
  { q: 'How are payments handled?', a: 'Payments are managed in structured phases tied directly to verifiable project milestones. Funds are deposited into an ARCUS escrow account and released to the professional only after you sign off on milestone quality.' },
  { q: 'What if I am not satisfied?', a: 'All home maintenance and repair services include a comprehensive 30-day labor warranty. For larger civil or interior projects, ARCUS offers dedicated dispute resolution and will dispatch engineers to audit and resolve issues.' }
]


interface SpecializedService {
  name: string
  slug: string
  desc: string
}

interface ServiceType {
  name: string
  slug: string
  items: SpecializedService[]
}

interface ServiceCategory {
  name: string
  slug: string
  icon: string
  types: ServiceType[]
}

const categoryProjects: Record<string, { title: string; client: string; desc: string; image: string; metric: string }[]> = {
  'plumbing-services': [
    { title: 'Commercial Hydropneumatic Pump Station', client: 'Brigade Meadows, Bangalore', desc: 'Installed centralized booster pumps and 3-ring loop CPVC supply lines for a 350-apartment township.', image: '/pdp_cpvc_pipe_warehouse.png', metric: '350 Units' },
    { title: 'Sewer Rehabilitation Project', client: 'Municipal Corp, Bangalore', desc: 'Trenchless lining and replacement of 1.2km main sewage lines with high-density HDPE pipelines.', image: '/pdp_cpvc_pipe_install.png', metric: '1.2 km Length' }
  ],
  'electrical-services': [
    { title: 'Industrial Substation Installation', client: 'Volvo India Factory, Hosur', desc: 'Setup of 3x 2000kVA transformers, vacuum circuit breakers, and main HT/LT distribution panels.', image: '/services_geyser_install.png', metric: '6000 kVA' },
    { title: 'Corporate HQ Intelligent Lighting Fitout', client: 'Infosys Campus, Bangalore', desc: 'Busbar conduits and DALI-addressable smart LED panels integrated with daylight harvesting sensors.', image: '/services_washing_machine.png', metric: '8,000 Nodes' }
  ],
  'carpentry-services': [
    { title: 'Premium Apartment Wooden Rafter Ceilings', client: 'Assetz Luminary, Bangalore', desc: 'Engineered oak ceiling rafter arrays, fire-retardant wall paneling, and custom teak wood entrances.', image: '/services_modular_kitchen.png', metric: '25 Apartments' },
    { title: 'Co-Working Space Modular Furniture Fit-out', client: 'WeWork Galaxy, Bangalore', desc: 'Custom soundproof partition cabins, ergonomic modular workstations, and hot-desk laminate desks.', image: '/services_house_construction.png', metric: '450 Desks' }
  ],
  'painting-finishing': [
    { title: 'Luxury Villa Texture & Limewash Highlight', client: 'Adarsh Palm Meadows, Bangalore', desc: 'Premium Venetian plastering on accent walls and exterior silicone dirt-resistant weatherproofing coating.', image: '/services_interior_painting.png', metric: '15,000 sq ft' }
  ],
  'civil-construction': [
    { title: 'Turnkey Luxury Villa Construction', client: 'Mr. Nagesh, Bangalore', desc: 'Complete architecture design, excavation, structural RCC framing, masonry, and finishing works.', image: '/services_house_construction.png', metric: '4,500 sq ft' }
  ],
  'architecture-design': [
    { title: 'Biophilic Design Office Complex Layout', client: 'NatureWorks Tech Park, Bangalore', desc: 'Architectural blueprint, HVAC zoning plans, and photorealistic 3D interior design mockups.', image: '/services_modular_kitchen.png', metric: '5 Floors' }
  ],
  'equipment-rental': [
    { title: 'Site Prep Earthmoving Fleet Rental', client: 'L&T Construction Site, Bangalore', desc: 'Supplied 5x heavy-duty excavators and JCB backhoe loaders on a weekly hire basis with operators.', image: '/services_deep_cleaning.png', metric: '5 Excavators' }
  ],
  'maintenance-specialized': [
    { title: 'High-Rise Negative-Side Waterproofing Grout', client: 'Sobha Lavender, Bangalore', desc: 'Acoustic leakage tracing and pressure polyurethane injection grouting to stop basement retaining wall seepage.', image: '/services_solar_install.png', metric: '3 Basements' }
  ]
}

const categoryReviews: Record<string, { author: string; role: string; text: string; rating: number }[]> = {
  'plumbing-services': [
    { author: 'Vikram Seth', role: 'Builder, V&S Foundations', text: 'Hired Arcus plumbing partners for our multi-villa project. The CPVC pipe installation and pressure checks were done with zero leakages. Highly recommended!', rating: 5 },
    { author: 'Meera Deshmukh', role: 'Home Owner', text: 'Fast response! The plumber cleaned our overhead water tank and fixed the booster pump issues in under 3 hours.', rating: 5 }
  ],
  'electrical-services': [
    { author: 'Rohit K.', role: 'Operations Manager, Cloud Nine Tech', text: 'Hired them for our server room rewiring. The team was highly professional, used FRLS wires, and set up the online UPS panels overnight without downtime.', rating: 5 },
    { author: 'Sunita Sharma', role: 'Villa Owner', text: 'Excellent concealed wiring and decorative lighting installation in our living room. An absolute class apart.', rating: 5 }
  ],
  'carpentry-services': [
    { author: 'Aditya Sen', role: 'Architect, Urban Space', text: 'The modular kitchen and sliding wardrobes were delivered exactly on time with premium soft-close hinges and acrylic finish. Very impressed.', rating: 5 }
  ]
}

const servicesData: ServiceCategory[] = [
  {
    name: 'Plumbing Services',
    slug: 'plumbing-services',
    icon: 'plumbing',
    types: [
      {
        name: 'Pipe Installation',
        slug: 'pipe-installation',
        items: [
          { name: 'PVC Pipe Installation', slug: 'pvc-pipe-installation', desc: 'Standard PVC piping for cold water systems and drainage lines.' },
          { name: 'CPVC Pipe Installation', slug: 'cpvc-pipe-installation', desc: 'High-temperature CPVC pipe installation for hot & cold water supply.' },
          { name: 'UPVC Pipe Installation', slug: 'upvc-pipe-installation', desc: 'Lead-free UPVC piping for potable water distribution systems.' },
          { name: 'HDPE Pipe Installation', slug: 'hdpe-pipe-installation', desc: 'Heavy-duty HDPE piping for high-pressure municipal and industrial mains.' },
        ],
      },
      {
        name: 'Water Tank Services',
        slug: 'water-tank-services',
        items: [
          { name: 'Water Tank Installation', slug: 'water-tank-installation', desc: 'Installation of overhead, loft, and underground water storage tanks.' },
          { name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', desc: 'High-pressure chemical-free water tank cleaning and sanitization.' },
          { name: 'Water Tank Repair', slug: 'water-tank-repair', desc: 'Leakage patching, lid replacement, and structural repairs for water tanks.' },
        ],
      },
      {
        name: 'Pump Services',
        slug: 'pump-services',
        items: [
          { name: 'Pump Installation', slug: 'pump-installation', desc: 'Installation of booster pumps, monoblock pumps, and borewell submersibles.' },
          { name: 'Pump Repair', slug: 'pump-repair', desc: 'Motor rewinding, impeller replacement, and mechanical seal repairs.' },
          { name: 'Pump Maintenance', slug: 'pump-maintenance', desc: 'Scheduled greasing, electrical checkups, and efficiency optimization audits.' },
        ],
      },
      {
        name: 'Bathroom Fittings',
        slug: 'bathroom-fittings',
        items: [
          { name: 'Faucet Installation', slug: 'faucet-installation', desc: 'Installing wall mixers, pillar cocks, and sensor taps.' },
          { name: 'Shower Installation', slug: 'shower-installation', desc: 'Setting up overhead showers, hand showers, and multi-flow thermostatic panels.' },
          { name: 'Sanitary Fittings Installation', slug: 'sanitary-fittings-installation', desc: 'Installing wall-hung commodes, washbasins, and vanity setups.' },
        ],
      },
      {
        name: 'Drainage Solutions',
        slug: 'drainage-solutions',
        items: [
          { name: 'Drain Cleaning', slug: 'drain-cleaning', desc: 'Unclogging kitchen drains, sewer lines, and gully traps using mechanical snakes.' },
          { name: 'Drain Installation', slug: 'drain-installation', desc: 'Laying down floor traps, chamber systems, and sewage connection lines.' },
          { name: 'Sewage Line Services', slug: 'sewage-line-services', desc: 'Heavy-duty commercial sewer pipe replacement and septic tank connections.' },
        ],
      },
    ],
  },
  {
    name: 'Electrical Services',
    slug: 'electrical-services',
    icon: 'bolt',
    types: [
      {
        name: 'Wiring Services',
        slug: 'wiring-services',
        items: [
          { name: 'New Wiring', slug: 'new-wiring', desc: 'Conduiting and wire pulling for under-construction houses and complexes.' },
          { name: 'Rewiring', slug: 'rewiring', desc: 'Replacing old degraded aluminum or copper wires with high-grade FR wires.' },
          { name: 'Concealed Wiring', slug: 'concealed-wiring', desc: 'Wall cutting and pipe laying for concealed residential electrical setups.' },
        ],
      },
      {
        name: 'Switches & Sockets',
        slug: 'switches-sockets',
        items: [
          { name: 'Switch Installation', slug: 'switch-installation', desc: 'Mounting and connection of modular and non-modular electrical switches.' },
          { name: 'Socket Installation', slug: 'socket-installation', desc: 'Installing 6A, 16A, and smart sockets for home appliance feeds.' },
          { name: 'Modular Upgrades', slug: 'modular-upgrades', desc: 'Upgrading old electrical switchboards to modern modular metallic/glass panels.' },
        ],
      },
      {
        name: 'Lighting Solutions',
        slug: 'lighting-solutions',
        items: [
          { name: 'Indoor Lighting', slug: 'indoor-lighting', desc: 'Installing LED panel lights, downlights, and concealed ceiling strips.' },
          { name: 'Outdoor Lighting', slug: 'outdoor-lighting', desc: 'Setting up garden bollards, compound wall lights, and gate lamps.' },
          { name: 'Decorative Lighting', slug: 'decorative-lighting', desc: 'Hanging chandeliers, wall sconces, and customized profile lights.' },
        ],
      },
      {
        name: 'Power Backup',
        slug: 'power-backup',
        items: [
          { name: 'Generator Installation', slug: 'generator-installation', desc: 'Setting up diesel and silent gas generators with changeover panels.' },
          { name: 'Inverter Installation', slug: 'inverter-installation', desc: 'Installing home inverters and high-capacity tubuler battery banks.' },
          { name: 'UPS Setup', slug: 'ups-setup', desc: 'Configuring online and offline UPS units for commercial workstation racks.' },
        ],
      },
      {
        name: 'Electrical Maintenance',
        slug: 'electrical-maintenance',
        items: [
          { name: 'Fault Detection', slug: 'fault-detection', desc: 'Tracing short circuits, phase drops, and grounding faults using megger tests.' },
          { name: 'Repair Services', slug: 'repair-services', desc: 'Fixing damaged MCBs, distribution boards, and melted contactors.' },
          { name: 'Annual Maintenance', slug: 'annual-maintenance', desc: 'Periodic load auditing, panel vacuuming, and terminal tightening contracts.' },
        ],
      },
    ],
  },
  {
    name: 'Carpentry Services',
    slug: 'carpentry-services',
    icon: 'handyman',
    types: [
      {
        name: 'Furniture Works',
        slug: 'furniture-works',
        items: [
          { name: 'Custom Furniture', slug: 'custom-furniture', desc: 'Crafting customized solid wood and ply sofas, dining tables, and beds.' },
          { name: 'Office Furniture', slug: 'office-furniture', desc: 'Installing ergonomic computer desks, conference tables, and workstation panels.' },
          { name: 'Commercial Furniture', slug: 'commercial-furniture', desc: 'Fitting out restaurant booths, display racks, and cash counter tables.' },
        ],
      },
      {
        name: 'Modular Solutions',
        slug: 'modular-solutions',
        items: [
          { name: 'Modular Kitchen', slug: 'modular-kitchen', desc: 'Setting up L-shaped, U-shaped, and parallel kitchens with acrylic shutters.' },
          { name: 'Wardrobes', slug: 'wardrobes', desc: 'Building floor-to-ceiling wardrobes with sliding doors and soft-close hardware.' },
          { name: 'Storage Units', slug: 'storage-units', desc: 'Designing vanity cabinets, shoe racks, and custom living area TV units.' },
        ],
      },
      {
        name: 'Doors & Windows',
        slug: 'doors-windows',
        items: [
          { name: 'Wooden Doors', slug: 'wooden-doors', desc: 'Hanging teak wood, flush doors, and skin doors with mortise lock fitting.' },
          { name: 'Wooden Windows', slug: 'wooden-windows', desc: 'Making traditional and modern wooden window panes with mosquito mesh.' },
          { name: 'Frame Installation', slug: 'frame-installation', desc: 'Installing heavy-duty door frames (chaukhats) in granite or wood.' },
        ],
      },
      {
        name: 'Interior Woodwork',
        slug: 'interior-woodwork',
        items: [
          { name: 'Wall Paneling', slug: 'wall-paneling', desc: 'Installing MDF, charcoal, and veneer panelling on feature walls.' },
          { name: 'Ceiling Woodwork', slug: 'ceiling-woodwork', desc: 'Creating ceiling rafters, false wooden panels, and peripheral borders.' },
          { name: 'Decorative Elements', slug: 'decorative-elements', desc: 'Crafting mandir units, partition screens, and wooden arches.' },
        ],
      },
      {
        name: 'Repair Services',
        slug: 'repair-services',
        items: [
          { name: 'Furniture Repair', slug: 'furniture-repair', desc: 'Fixing loose joints, squeaky drawers, and broken cabinet hinges.' },
          { name: 'Door Repair', slug: 'door-repair', desc: 'Re-aligning sagging doors, fixing latch operations, and window lock repairs.' },
          { name: 'Wood Restoration', slug: 'wood-restoration', desc: 'Sanding, polishing, and restoring color to faded wooden tables.' },
        ],
      },
    ],
  },
  {
    name: 'Painting & Finishing',
    slug: 'painting-finishing',
    icon: 'format_paint',
    types: [
      {
        name: 'Interior Painting',
        slug: 'interior-painting',
        items: [
          { name: 'Apartment Painting', slug: 'apartment-painting', desc: 'Fresh coating or repainting for 2BHK/3BHK apartments using low-VOC emulsions.' },
          { name: 'Villa Painting', slug: 'villa-painting', desc: 'High-end interior painting featuring customized colors and ceiling paint.' },
          { name: 'Office Painting', slug: 'office-painting', desc: 'Overnight commercial office painting to ensure zero disruption to operations.' },
        ],
      },
      {
        name: 'Exterior Painting',
        slug: 'exterior-painting',
        items: [
          { name: 'Residential Exterior', slug: 'residential-exterior', desc: 'Weatherproof outer wall painting with dirt-resistant silicone paints.' },
          { name: 'Commercial Exterior', slug: 'commercial-exterior', desc: 'Scaffolding-enabled painting for commercial complexes and malls.' },
          { name: 'Industrial Exterior', slug: 'industrial-exterior', desc: 'Protective coatings for factory sheds, chimneys, and outer warehouses.' },
        ],
      },
      {
        name: 'Decorative Finishes',
        slug: 'decorative-finishes',
        items: [
          { name: 'Texture Painting', slug: 'texture-painting', desc: 'Applying metallic, stucco, and sand textures on focal wall surfaces.' },
          { name: 'Designer Finishes', slug: 'designer-finishes', desc: 'Limewash, Venetian plaster, and premium metallic designer highlights.' },
          { name: 'Accent Walls', slug: 'accent-walls', desc: 'Painting high-contrast highlight walls with customized geometric stencils.' },
        ],
      },
      {
        name: 'Protective Coatings',
        slug: 'protective-coatings',
        items: [
          { name: 'Waterproof Coating', slug: 'waterproof-coating', desc: 'Laying down multi-layer elastomeric elastomeric paint films.' },
          { name: 'Metal Coating', slug: 'metal-coating', desc: 'Anti-rust primer and PU metallic paint coatings for steel trusses.' },
          { name: 'Wood Coating', slug: 'wood-coating', desc: 'Applying melamine, PU, and clear varnish coat finishes to doors.' },
        ],
      },
      {
        name: 'Surface Preparation',
        slug: 'surface-preparation',
        items: [
          { name: 'Putty Work', slug: 'putty-work', desc: 'Applying double-coat acrylic wall putty for mirror-smooth surfaces.' },
          { name: 'Primer Application', slug: 'primer-application', desc: 'Laying down alkaline resistant primer coat to bind top emulsion coats.' },
          { name: 'Crack Filling', slug: 'crack-filling', desc: 'Chiseling out plaster cracks and filling with weather-proof sealants.' },
        ],
      },
    ],
  },
  {
    name: 'Civil & Construction',
    slug: 'civil-construction',
    icon: 'foundation',
    types: [
      {
        name: 'Residential Construction',
        slug: 'residential-construction',
        items: [
          { name: 'House Construction', slug: 'house-construction', desc: 'Turnkey independent house construction from design to final handover.' },
          { name: 'Villa Construction', slug: 'villa-construction', desc: 'Premium luxury villa construction conforming to international specifications.' },
          { name: 'Extension Projects', slug: 'extension-projects', desc: 'Adding a floor, expanding balconies, or constructing servant quarters.' },
        ],
      },
      {
        name: 'Commercial Construction',
        slug: 'commercial-construction',
        items: [
          { name: 'Office Buildings', slug: 'office-buildings', desc: 'Civil works for medium to high-rise commercial structures.' },
          { name: 'Retail Spaces', slug: 'retail-spaces', desc: 'Showroom partitions, glass facades, and structural retail modifications.' },
          { name: 'Warehouses', slug: 'warehouses', desc: 'PEB shed assembly and heavy industrial vacuum dewatered floor trimix castings.' },
        ],
      },
      {
        name: 'Structural Works',
        slug: 'structural-works',
        items: [
          { name: 'RCC Works', slug: 'rcc-works', desc: 'Pouring columns, beams, slabs, and shear walls using high-grade concrete.' },
          { name: 'Foundation Works', slug: 'foundation-works', desc: 'Excavation, pile driving, and casting raft or isolated foundations.' },
          { name: 'Structural Strengthening', slug: 'structural-strengthening', desc: 'Fiber-reinforced wrapping, steel jacketing, and concrete repairing works.' },
        ],
      },
      {
        name: 'Masonry Works',
        slug: 'masonry-works',
        items: [
          { name: 'Brickwork', slug: 'brickwork', desc: 'Laying red clay or fly ash brick walls using precise mortar mixes.' },
          { name: 'Blockwork', slug: 'blockwork', desc: 'Building partition walls with light-weight AAC blocks for thermal insulation.' },
          { name: 'Compound Walls', slug: 'compound-walls', desc: 'Erecting compound boundaries using stone, brick, or precast concrete boards.' },
        ],
      },
      {
        name: 'Renovation Projects',
        slug: 'renovation-projects',
        items: [
          { name: 'Home Renovation', slug: 'home-renovation', desc: 'Demolition and total redesign of old kitchens, halls, and bathrooms.' },
          { name: 'Office Renovation', slug: 'office-renovation', desc: 'Layout restructuring, cabin partition fits, and ceiling upgrades.' },
          { name: 'Building Refurbishment', slug: 'building-refurbishment', desc: 'Repairing old concrete, repointing bricks, and facade plastering upgrades.' },
        ],
      },
    ],
  },
  {
    name: 'Architecture & Design',
    slug: 'architecture-design',
    icon: 'architecture',
    types: [
      {
        name: 'Architectural Design',
        slug: 'architectural-design',
        items: [
          { name: 'House Plans', slug: 'house-plans', desc: 'Generating detailed floor plans, elevations, and layout drawings.' },
          { name: 'Commercial Plans', slug: 'commercial-plans', desc: 'Filing blueprints, building code compliance checks, and mall layouts.' },
          { name: 'Industrial Plans', slug: 'industrial-plans', desc: 'Designing factory layouts, structural sheds, and hazardous zone mapping.' },
        ],
      },
      {
        name: 'Interior Design',
        slug: 'interior-design',
        items: [
          { name: 'Residential Interiors', slug: 'residential-interiors', desc: 'Full home luxury interior curation from furniture to lighting fixtures.' },
          { name: 'Commercial Interiors', slug: 'commercial-interiors', desc: 'Designing modern workspaces, open desk halls, and reception setups.' },
          { name: 'Retail Interiors', slug: 'retail-interiors', desc: 'Maximizing product placement aesthetics for high-end boutique showrooms.' },
        ],
      },
      {
        name: 'Structural Design',
        slug: 'structural-design',
        items: [
          { name: 'Structural Drawings', slug: 'structural-drawings', desc: 'Detailed RCC column spacing, slab thickness, and reinforcement schedules.' },
          { name: 'Structural Analysis', slug: 'structural-analysis', desc: 'Computerized stress, wind, and seismic simulation reports (STAAD Pro).' },
          { name: 'Design Review', slug: 'design-review', desc: 'Safety audit and optimization checks on pre-drafted structural specs.' },
        ],
      },
      {
        name: 'Visualization',
        slug: 'visualization',
        items: [
          { name: '2D Drawings', slug: '2d-drawings', desc: 'Precision line drawings, zoning contours, and submission plans.' },
          { name: '3D Designs', slug: '3d-designs', desc: 'Photorealistic architectural renders showing shadows and textures.' },
          { name: 'Walkthroughs', slug: 'walkthroughs', desc: '3D CGI animated video walkthrough tours of your upcoming property.' },
        ],
      },
      {
        name: 'Consultancy',
        slug: 'consultancy',
        items: [
          { name: 'Project Planning', slug: 'project-planning', desc: 'Drafting Gantt charts, procurement schedules, and milestone targets.' },
          { name: 'Design Consultation', slug: 'design-consultation', desc: 'Brainstorming with clients to match design concepts with budget realities.' },
          { name: 'Quantity Surveying', slug: 'quantity-surveying', desc: 'Developing precise Bills of Quantities (BOQs) to estimate raw materials.' },
        ],
      },
    ],
  },
  {
    name: 'Equipment Rental',
    slug: 'equipment-rental',
    icon: 'construction',
    types: [
      {
        name: 'Earthmoving Equipment',
        slug: 'earthmoving-equipment',
        items: [
          { name: 'Excavators', slug: 'excavators', desc: 'Renting 20-ton tracked excavators with rock-breaker attachments.' },
          { name: 'JCBs', slug: 'jcbs', desc: 'Renting versatile backhoe loaders with experienced operations staff.' },
          { name: 'Backhoe Loaders', slug: 'backhoe-loaders', desc: 'Lighter trenching and earth loader operations for narrow urban roads.' },
        ],
      },
      {
        name: 'Lifting Equipment',
        slug: 'lifting-equipment',
        items: [
          { name: 'Cranes', slug: 'cranes', desc: 'Hydraulic mobile cranes and tower cranes for multi-story lifting operations.' },
          { name: 'Boom Lifts', slug: 'boom-lifts', desc: 'Renting articulated boom lifts to lift workers for electrical and painting lines.' },
          { name: 'Forklifts', slug: 'forklifts', desc: 'Renting diesel and battery-operated forklifts for warehouse loading bays.' },
        ],
      },
      {
        name: 'Concrete Equipment',
        slug: 'concrete-equipment',
        items: [
          { name: 'Concrete Mixers', slug: 'concrete-mixers', desc: 'Diesel drum mixers and mobile batching plants for onsite mixing.' },
          { name: 'Vibrators', slug: 'vibrators', desc: 'Needle and surface concrete vibrators to eliminate air pockets during casts.' },
          { name: 'Pumps', slug: 'pumps', desc: 'Boom pumps and stationary concrete pumps to deliver RMC to upper floors.' },
        ],
      },
      {
        name: 'Site Infrastructure',
        slug: 'site-infrastructure',
        items: [
          { name: 'Scaffolding', slug: 'scaffolding', desc: 'Renting heavy-duty H-frame cup-lock scaffolding and wooden walking boards.' },
          { name: 'Site Cabins', slug: 'site-cabins', desc: 'Portacabins for onsite project managers, storage rooms, and safety desks.' },
          { name: 'Temporary Fencing', slug: 'temporary-fencing', desc: 'Corrugated steel sheets and warning boards to secure project perimeters.' },
        ],
      },
      {
        name: 'Power Equipment',
        slug: 'power-equipment',
        items: [
          { name: 'Generators', slug: 'generators', desc: 'Renting 50kVA to 500kVA soundproof diesel generator sets.' },
          { name: 'Compressors', slug: 'compressors', desc: 'High-pressure air compressors to feed pneumatic breakers and spray guns.' },
          { name: 'Lighting Towers', slug: 'lighting-towers', desc: 'Trailer-mounted mast lighting towers with metal halide floodlights.' },
        ],
      },
    ],
  },
  {
    name: 'Maintenance & Specialized',
    slug: 'maintenance-specialized',
    icon: 'build',
    types: [
      {
        name: 'Building Maintenance',
        slug: 'building-maintenance',
        items: [
          { name: 'Facility Maintenance', slug: 'facility-maintenance', desc: 'Full corporate facility management covering fire, lift, and water lines.' },
          { name: 'Preventive Maintenance', slug: 'preventive-maintenance', desc: 'Regular thermal imaging and leakage scans to identify hidden problems.' },
          { name: 'AMC Contracts', slug: 'amc-contracts', desc: 'Annual maintenance contracts for industrial plumbing, electrical, and HVAC.' },
        ],
      },
      {
        name: 'Waterproofing',
        slug: 'waterproofing',
        items: [
          { name: 'Terrace Waterproofing', slug: 'terrace-waterproofing', desc: 'Brickbat coba, elastomeric membranes, and polyurethane coatings.' },
          { name: 'Basement Waterproofing', slug: 'basement-waterproofing', desc: 'Injection grouting and crystalline coatings for negative side seepage.' },
          { name: 'Wall Waterproofing', slug: 'wall-waterproofing', desc: 'Removing damp plaster and applying chemical barrier coats before repainting.' },
        ],
      },
      {
        name: 'Repair Services',
        slug: 'repair-services',
        items: [
          { name: 'Structural Repairs', slug: 'structural-repairs', desc: 'Polymer modified mortar plastering and micro-concrete repairs.' },
          { name: 'Crack Repairs', slug: 'crack-repairs', desc: 'Chiseling and injecting epoxy grouting for structural wall cracks.' },
          { name: 'Leakage Repairs', slug: 'leakage-repairs', desc: 'Fixing concealed pipe leakages using acoustic leak detector tracing.' },
        ],
      },
      {
        name: 'Inspection & Audits',
        slug: 'inspection-audits',
        items: [
          { name: 'Building Inspection', slug: 'building-inspection', desc: 'Non-destructive testing (NDT) to evaluate concrete strength in old complexes.' },
          { name: 'Safety Audit', slug: 'safety-audit', desc: 'Onsite safety compliance, fire safety, and electrical hazard audits.' },
          { name: 'Quality Audit', slug: 'quality-audit', desc: 'Compressive cube tests and steel tensile strength checks for ongoing casts.' },
        ],
      },
      {
        name: 'Specialized Works',
        slug: 'specialized-works',
        items: [
          { name: 'Demolition', slug: 'demolition', desc: 'Controlled RCC wall demolition using hydraulic concrete crushers.' },
          { name: 'Core Cutting', slug: 'core-cutting', desc: 'Diamond core cutting up to 8" diameter for HVAC and plumbing pipe passes.' },
          { name: 'Diamond Drilling', slug: 'diamond-drilling', desc: 'Heavy-duty vibration-free anchor drilling into reinforced concrete pillars.' },
        ],
      },
    ],
  },
]

interface ServicesHubProps {
  categorySlug?: string
  typeSlug?: string
  specSlug?: string
}

export default function ServicesHub({ categorySlug, typeSlug, specSlug }: ServicesHubProps) {
  // Professionals API state
  const [pros, setPros] = useState<Professional[]>(professionalsList)

  useEffect(() => {
    fetch('/api/professionals')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setPros(data))
      .catch((err) => console.warn('Backend server offline, using local static professionals data.', err))
  }, [])

  useEffect(() => {
    if (categorySlug && typeSlug && !specSlug) {
      setTimeout(() => {
        document.getElementById(typeSlug)?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
  }, [categorySlug, typeSlug, specSlug])

  // Calculator States
  const [estQty, setEstQty] = useState<number>(50)
  const [pipeSize, setPipeSize] = useState<string>('1 inch')
  const [estimatedCost, setEstimatedCost] = useState<{ min: number; max: number } | null>(null)

  // RFQ Form States
  const [rfqSubmitted, setRfqSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    details: '',
  })

  // Marketplace Hub States
  const [hubSearchQuery, setHubSearchQuery] = useState('')
  const [hubCityFilter, setHubCityFilter] = useState('All')
  const [hubCategoryFilter, setHubCategoryFilter] = useState('All')
  const [hubExpFilter, setHubExpFilter] = useState('All')
  const [hubRatingFilter, setHubRatingFilter] = useState('All')
  const [hubVerifiedOnly, setHubVerifiedOnly] = useState(false)
  const [hubBudgetFilter, setHubBudgetFilter] = useState('All')
  const [hubSortOption, setHubSortOption] = useState('Recommended')

  // Booking Service Modal
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [bookSubmitted, setBookSubmitted] = useState(false)
  const [bookForm, setBookForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    address: '',
    notes: ''
  })

  // Direct Quote Modal
  const [showDirectQuoteModal, setShowDirectQuoteModal] = useState(false)
  const [selectedPro, setSelectedPro] = useState<any>(null)
  const [directQuoteSubmitted, setDirectQuoteSubmitted] = useState(false)
  const [directQuoteForm, setDirectQuoteForm] = useState({
    name: '',
    phone: '',
    budget: '',
    timeline: '',
    address: '',
    desc: ''
  })

  // Lead Form Quotes States (Section 7)
  const [hubRfqSubmitted, setHubRfqSubmitted] = useState(false)
  const [hubRfqForm, setHubRfqForm] = useState({
    name: '',
    phone: '',
    category: 'Full Home Renovation',
    budget: '',
    timeline: '',
    desc: ''
  })

  // FAQ Accordion State
  const [hubActiveFaq, setHubActiveFaq] = useState<number | null>(null)

  // Mobile Filters Drawer State
  const [hubShowMobileFilters, setHubShowMobileFilters] = useState(false)

  // Find routing targets with normalized category slugs
  const normalizedCategorySlug = categorySlug === 'plumbing' ? 'plumbing-services'
                               : categorySlug === 'electrical' ? 'electrical-services'
                               : categorySlug === 'carpentry' ? 'carpentry-services'
                               : categorySlug === 'painting' ? 'painting-finishing'
                               : categorySlug === 'maintenance' ? 'maintenance-specialized'
                               : categorySlug === 'architecture' || categorySlug === 'design' ? 'architecture-design'
                               : categorySlug === 'civil' ? 'civil-construction'
                               : categorySlug === 'equipment' ? 'equipment-rental'
                               : categorySlug;

  const currentCategory = servicesData.find((c) => c.slug === normalizedCategorySlug)
  const currentType = currentCategory?.types.find((t) => t.slug === typeSlug)
  const currentSpec = currentType?.items.find((s) => s.slug === specSlug)

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault()
    let ratePerUnit = 250 // default rate per meter/unit
    if (specSlug?.includes('cpvc')) ratePerUnit = 320
    else if (specSlug?.includes('hdpe')) ratePerUnit = 450
    else if (specSlug?.includes('wiring')) ratePerUnit = 180
    else if (specSlug?.includes('painting')) ratePerUnit = 220
    else if (specSlug?.includes('construction')) ratePerUnit = 1800 // square feet
    else if (specSlug?.includes('excavator')) ratePerUnit = 2800 // hourly

    const baseCost = estQty * ratePerUnit
    let multiplier = 1.0
    if (pipeSize === '2 inch') multiplier = 1.4
    else if (pipeSize === '4 inch') multiplier = 2.0

    const minCost = Math.round(baseCost * multiplier)
    const maxCost = Math.round(baseCost * multiplier * 1.25)
    setEstimatedCost({ min: minCost, max: maxCost })
  }

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.contactPerson || !formData.phone) {
      alert('Please fill out all required fields.')
      return
    }

    try {
      const payload = {
        name: formData.contactPerson,
        phone: formData.phone,
        category: currentSpec?.name || currentCategory?.name || 'Services',
        quantity: estQty.toString(),
        location: 'N/A',
        timeline: 'N/A',
        details: `Company: ${formData.companyName || 'None'}. Requirement Details: ${formData.details || 'None'}`
      }
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      console.warn('Backend server offline, falling back to local state:', err)
    }

    setRfqSubmitted(true)
  }

  // 1. Specialized Detail Page
  if (currentCategory && currentType && currentSpec) {
    return (
      <div className="w-full bg-background min-h-screen text-on-surface pt-lg pb-5xl">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-secondary font-label-caps text-[11px] mb-lg text-left">
            <a href="#/services" className="hover:text-primary transition-colors">Services</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a href={`#/services/${currentCategory.slug}`} className="hover:text-primary transition-colors">{currentCategory.name}</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">{currentSpec.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3xl">
            {/* Left Section: Details */}
            <div className="lg:col-span-2 space-y-xxl text-left">
              <div className="space-y-md border-b border-surface-variant pb-xl">
                <span className="inline-flex items-center gap-xs bg-primary-container/10 text-on-primary-fixed-variant px-sm py-xs rounded text-xs font-bold font-label-caps">
                  <span className="material-symbols-outlined text-[14px]">construction</span>
                  Specialized Service Detail
                </span>
                <h1 className="font-headline-h1 text-[40px] leading-tight text-on-surface">
                  {currentSpec.name}
                </h1>
                <p className="font-body-lg text-secondary text-[18px] leading-relaxed">
                  {currentSpec.desc}
                </p>
              </div>

              <div className="space-y-lg">
                <h3 className="font-headline-h3 text-[22px]">What's Included in this Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="bg-white p-md border border-surface-variant rounded-md flex gap-md">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <div>
                      <h4 className="font-bold text-body-sm text-on-surface">Verified Professionals</h4>
                      <p className="text-secondary text-[12px] mt-xs">All contractors hold necessary licenses and have undergone strict back-ground verifications.</p>
                    </div>
                  </div>
                  <div className="bg-white p-md border border-surface-variant rounded-md flex gap-md">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <div>
                      <h4 className="font-bold text-body-sm text-on-surface">Standardized Material Grades</h4>
                      <p className="text-secondary text-[12px] mt-xs">We strictly follow specifications and supply top branded piping or cabling material.</p>
                    </div>
                  </div>
                  <div className="bg-white p-md border border-surface-variant rounded-md flex gap-md">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <div>
                      <h4 className="font-bold text-body-sm text-on-surface">Safety Compliance</h4>
                      <p className="text-secondary text-[12px] mt-xs">Plumbers and electricians equipped with safety helmets, boots, and industrial grade tools.</p>
                    </div>
                  </div>
                  <div className="bg-white p-md border border-surface-variant rounded-md flex gap-md">
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                    <div>
                      <h4 className="font-bold text-body-sm text-on-surface">Post-service Warranty</h4>
                      <p className="text-secondary text-[12px] mt-xs">Enjoy a comprehensive 30-day labor warranty on any fitment done by our team.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Estimate calculator */}
              <div className="bg-surface-container-low border border-surface-variant rounded-md p-xl space-y-lg">
                <div className="space-y-xs">
                  <h3 className="font-headline-h3 text-[20px]">B2B Service Quote Estimator</h3>
                  <p className="text-secondary text-body-sm">Compute estimated project budgeting instantly based on sizing inputs.</p>
                </div>
                <form onSubmit={handleEstimate} className="grid grid-cols-1 md:grid-cols-3 gap-md items-end">
                  <div className="space-y-xs">
                    <label className="font-label-caps text-[11px] text-secondary">Estimated Quantity (Meters/Sqft/Hrs)</label>
                    <input
                      type="number"
                      value={estQty}
                      onChange={(e) => setEstQty(Number(e.target.value))}
                      className="w-full h-11 px-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm"
                      placeholder="e.g. 50"
                      required
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-caps text-[11px] text-secondary">Specification/Size</label>
                    <select
                      value={pipeSize}
                      onChange={(e) => setPipeSize(e.target.value)}
                      className="w-full h-11 px-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm"
                    >
                      <option value="1/2 inch">Standard (1/2 to 1 inch)</option>
                      <option value="2 inch">Medium (2 inch)</option>
                      <option value="4 inch">Large-Scale (4 inch+)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="h-11 bg-[#121212] text-white font-semibold rounded-md hover:bg-on-surface transition-colors flex items-center justify-center font-label-caps"
                  >
                    Calculate Estimate
                  </button>
                </form>

                {estimatedCost && (
                  <div className="bg-primary-container/10 border border-primary-container/30 rounded-md p-md text-left flex flex-col md:flex-row items-center justify-between gap-md animate-fade-in">
                    <div>
                      <h4 className="font-bold text-body-md text-on-surface">Estimated Project Budget</h4>
                      <p className="text-secondary text-[12px] mt-xs">Includes standard materials and estimated contractor labor charges.</p>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-h3 text-primary text-[24px] font-extrabold">
                        {estimatedCost.min.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                        {' - '}
                        {estimatedCost.max.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </span>
                      <p className="text-secondary text-[10px] uppercase font-bold tracking-wider mt-1">*Excluding GST & Local Permits</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: RFP lead generation form */}
            <div className="space-y-lg">
              <div className="bg-white border border-surface-variant rounded-md p-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-left space-y-md">
                <div className="space-y-xs">
                  <h3 className="font-headline-h3 text-[20px] text-on-surface">Get a Custom Quote</h3>
                  <p className="text-secondary text-[13px]">Submit details to request a detailed site inspection & BOQ estimate.</p>
                </div>
                {rfqSubmitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-lg rounded-md text-center space-y-md py-xl">
                    <span className="material-symbols-outlined text-[48px] text-green-600 block">check_circle</span>
                    <div>
                      <h4 className="font-bold text-body-md">RFP Filed Successfully</h4>
                      <p className="text-xs text-green-700 mt-xs">ARCUS procurement desk will contact you within 2 business hours.</p>
                    </div>
                    <button
                      onClick={() => setRfqSubmitted(false)}
                      className="text-xs font-bold underline hover:text-green-950 block mx-auto"
                    >
                      File another query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRfqSubmit} className="space-y-md">
                    <div className="space-y-xs">
                      <label className="font-label-caps text-[10px] text-secondary">Company Name (Optional)</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full h-11 px-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm"
                        placeholder="e.g. Buildcon Infrastructures"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-caps text-[10px] text-secondary">Contact Person *</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full h-11 px-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm"
                        placeholder="Your Full Name"
                        required
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-caps text-[10px] text-secondary">Mobile Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 px-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm"
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="font-label-caps text-[10px] text-secondary">Requirement Details</label>
                      <textarea
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="w-full h-24 p-md rounded-md border border-surface-variant bg-white focus:border-2 focus:border-primary-container focus:ring-0 text-body-sm resize-none"
                        placeholder="Detail quantities, specific material grades, or project layout specifications..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 bg-primary-container text-[#121212] font-bold rounded-md hover:bg-[#fabd00] transition-colors font-label-caps shadow-sm"
                    >
                      Book Free Callback
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 1.5. Contractor Profile Page
  if (categorySlug === 'contractors' && typeSlug) {
    const pro = pros.find(p => p.id === typeSlug)
    
    if (!pro) {
      return (
        <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] py-5xl text-center">
          <div className="max-w-[1440px] mx-auto px-lg">
            <span className="material-symbols-outlined text-[64px] text-red-500 block mb-md">person_off</span>
            <h1 className="font-headline-h1 text-[36px] font-extrabold text-[#0A0A0A] mb-md">Professional Not Found</h1>
            <p className="text-[#6C757D] text-body-md max-w-md mx-auto mb-xl">The contractor profile you are looking for does not exist or has been deactivated.</p>
            <a href="#/services" className="bg-[#0A0A0A] text-white font-bold px-xxl py-lg rounded-xl shadow-md hover:bg-primary hover:text-[#0A0A0A] transition-all">
              Back to Services Hub
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/services" className="hover:text-primary transition-colors font-semibold">Services</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#6C757D] font-semibold">Contractors</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A] font-extrabold">{pro.name}</span>
          </nav>

          {/* Profile Header Block */}
          <div className="bg-white border border-[#E9ECEF] rounded-[32px] overflow-hidden mb-4xl shadow-sm">
            {/* Cover photo */}
            <div className="h-64 md:h-80 w-full relative">
              <img src={pro.coverImage} className="w-full h-full object-cover" alt="Cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            {/* Owner/Company main info row */}
            <div className="px-lg md:px-2xl pb-xl pt-4 relative flex flex-col md:flex-row md:items-end justify-between gap-xl">
              {/* Profile image container overlapping the cover */}
              <div className="absolute top-0 left-6 md:left-12 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                <img src={pro.avatar} className="w-full h-full object-cover" alt="Avatar" />
              </div>

              {/* Bio Details */}
              <div className="pt-16 md:pt-0 md:pl-40 flex-1 space-y-xs">
                <div className="flex flex-wrap items-center gap-sm">
                  <h1 className="font-headline-h1 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">{pro.company}</h1>
                  {pro.tag === 'Arcus Verified' && (
                    <span className="bg-[#2E7D32] text-white text-[10px] font-bold px-md py-1 rounded-full uppercase tracking-wider shadow">
                      ARCUS Verified
                    </span>
                  )}
                  {pro.tag === 'Premium Partner' && (
                    <span className="bg-[#0A0A0A] text-white text-[10px] font-bold px-md py-1 rounded-full uppercase tracking-wider shadow border border-white/10">
                      Premium Partner
                    </span>
                  )}
                  {pro.tag === 'Preferred Partner' && (
                    <span className="bg-[#1E3A8A] text-white text-[10px] font-bold px-md py-1 rounded-full uppercase tracking-wider shadow border border-white/10">
                      Preferred Partner
                    </span>
                  )}
                </div>
                <p className="text-body-md text-[#6C757D] font-semibold">Lead Partner: {pro.name} • Based in {pro.location}</p>
                <div className="flex items-center gap-md pt-xs">
                  <div className="flex items-center gap-xs text-body-sm font-bold text-[#0A0A0A]">
                    <span className="material-symbols-outlined text-[#FFC107] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {pro.rating} <span className="text-[#6C757D] font-normal">({pro.reviewCount} Reviews)</span>
                  </div>
                  <div className="h-4 w-px bg-[#CED4DA]"></div>
                  <p className="text-xs text-green-600 font-bold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span> 100% Verified Profile
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-md shrink-0">
                <button
                  onClick={() => {
                    setSelectedService({ name: `${pro.company} Consultation`, price: pro.startingPrice })
                    setShowBookModal(true)
                  }}
                  className="border border-[#0A0A0A] text-[#0A0A0A] px-xl py-md rounded-xl font-bold hover:bg-[#F8F9FA] transition-all flex items-center gap-xs text-body-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  Book a Visit
                </button>
                <button
                  onClick={() => {
                    setSelectedPro(pro)
                    setShowDirectQuoteModal(true)
                  }}
                  className="bg-[#FFC107] text-[#0A0A0A] px-xl py-md rounded-xl font-bold hover:bg-[#fabd00] hover:scale-105 active:scale-95 transition-all shadow-md text-body-sm"
                >
                  Request Quote
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            {/* Left Column: Bio & Projects */}
            <div className="lg:col-span-2 space-y-3xl">
              {/* About section */}
              <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm">
                <h2 className="font-headline-h2 text-[22px] font-extrabold text-[#0A0A0A]">About {pro.company}</h2>
                <p className="text-body-md text-[#495057] leading-relaxed">
                  {pro.company} is a leading partner in the Arcus network, offering top-tier services in Bangalore and surrounding areas. With over {pro.experience} years of hands-on industry experience, they have completed more than {pro.completedProjects} high-value commercial and residential builds.
                </p>
                <p className="text-body-md text-[#495057] leading-relaxed">
                  They specialize in {pro.specializations.join(', ')} services with a strong focus on compliance, durability, and customer satisfaction. All works are backed by Arcus 30-day labor warranty and safe escrow terms.
                </p>
              </div>

              {/* Specializations section */}
              <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm">
                <h2 className="font-headline-h2 text-[22px] font-extrabold text-[#0A0A0A]">Specialization Area</h2>
                <div className="flex flex-wrap gap-md">
                  {pro.specializations.map((spec, i) => (
                    <span key={i} className="bg-[#F8F9FA] border border-[#E9ECEF] text-[#495057] font-bold px-lg py-md rounded-xl text-body-sm uppercase tracking-wide">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Project Showcase */}
              <div className="space-y-xl">
                <h2 className="font-headline-h2 text-[24px] font-extrabold text-[#0A0A0A]">Featured Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  {featuredProjectsList.map((project, idx) => (
                    <div key={idx} className="bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-44 bg-[#F8F9FA] relative">
                        <img src={project.image} className="w-full h-full object-cover" alt="Project" />
                        <span className="absolute bottom-3 left-3 bg-[#0A0A0A]/80 text-white text-[10px] font-bold px-md py-1 rounded-full uppercase">
                          {project.type}
                        </span>
                      </div>
                      <div className="p-lg text-left space-y-xs">
                        <h4 className="font-bold text-body-md text-[#0A0A0A]">{project.name}</h4>
                        <p className="text-xs text-[#6C757D]">{project.location}</p>
                        <div className="pt-sm flex justify-between items-center text-xs font-bold border-t border-[#E9ECEF]">
                          <span className="text-[#6C757D]">Estimated Cost</span>
                          <span className="text-[#0A0A0A]">{project.cost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Key Details & Contact Info */}
            <div className="space-y-xl">
              {/* Quick statistics card */}
              <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-[24px] p-xl space-y-lg shadow-sm">
                <h3 className="font-bold text-body-lg text-[#0A0A0A] border-b border-[#E9ECEF] pb-md">Service Parameters</h3>
                
                <div className="space-y-md">
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-[#6C757D] font-medium">Starting Price:</span>
                    <span className="font-extrabold text-[#0A0A0A]">{pro.startingPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-[#6C757D] font-medium">Response Rate:</span>
                    <span className="font-extrabold text-green-600">{pro.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-[#6C757D] font-medium">Experience:</span>
                    <span className="font-extrabold text-[#0A0A0A]">{pro.experience} Years</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-[#6C757D] font-medium">Completed Projects:</span>
                    <span className="font-extrabold text-[#0A0A0A]">{pro.completedProjects}+ Projects</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-[#6C757D] font-medium">Languages:</span>
                    <span className="font-bold text-[#0A0A0A]">{pro.languages.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-[#6C757D] font-medium">Pricing Bracket:</span>
                    <span className="font-bold text-[#0A0A0A] bg-primary-container/20 text-on-primary-fixed px-md py-0.5 rounded-full text-xs">
                      {pro.budget} Budget
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust assurances block */}
              <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm">
                <h3 className="font-bold text-body-lg text-[#0A0A0A] pb-xs border-b border-[#E9ECEF]">Arcus Protection</h3>
                
                <ul className="space-y-sm">
                  <li className="flex gap-md items-start text-xs text-[#6C757D] leading-relaxed">
                    <span className="material-symbols-outlined text-green-600 shrink-0">shield</span>
                    <div>
                      <p className="font-bold text-[#0A0A0A]">Escrow Protection</p>
                      <p>Milestone payments held securely in escrow. Released only upon quality signoff.</p>
                    </div>
                  </li>
                  <li className="flex gap-md items-start text-xs text-[#6C757D] leading-relaxed">
                    <span className="material-symbols-outlined text-green-600 shrink-0">verified</span>
                    <div>
                      <p className="font-bold text-[#0A0A0A]">License Verified</p>
                      <p>GSTIN registration, business credentials, and site audits fully verified.</p>
                    </div>
                  </li>
                  <li className="flex gap-md items-start text-xs text-[#6C757D] leading-relaxed">
                    <span className="material-symbols-outlined text-green-600 shrink-0">workspace_premium</span>
                    <div>
                      <p className="font-bold text-[#0A0A0A]">30-Day Warranty</p>
                      <p>Covers all labor defects and quality anomalies for a full calendar month.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* POPULAR SERVICE BOOKING MODAL */}
        {showBookModal && selectedService && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-lg">
            <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-md p-lg md:p-xl space-y-lg text-left shadow-2xl relative">
              <button
                onClick={() => setShowBookModal(false)}
                className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="space-y-xs">
                <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Book Service Request</h3>
                <p className="text-secondary text-xs">Service: <span className="font-bold text-[#0A0A0A]">{selectedService.name}</span> (Starting from {selectedService.price})</p>
              </div>

              {bookSubmitted ? (
                <div className="py-xl text-center space-y-md">
                  <span className="material-symbols-outlined text-[54px] text-green-600 block">check_circle</span>
                  <h4 className="font-bold text-body-md text-[#0A0A0A]">Booking Confirmed</h4>
                  <p className="text-[#6C757D] text-xs leading-relaxed max-w-xs mx-auto">
                    We have registered your slot for {selectedService.name}. A verified partner will contact you shortly to coordinate.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Your Name</label>
                    <input
                      type="text"
                      value={bookForm.name}
                      onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                    <input
                      type="tel"
                      value={bookForm.phone}
                      onChange={(e) => setBookForm({ ...bookForm, phone: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. +91 99999 88888"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Preferred Date</label>
                      <input
                        type="date"
                        value={bookForm.date}
                        onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                        className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Preferred Time</label>
                      <input
                        type="time"
                        value={bookForm.time}
                        onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                        className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Site Address</label>
                    <input
                      type="text"
                      value={bookForm.address}
                      onChange={(e) => setBookForm({ ...bookForm, address: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Building, Street, Area, City"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Specific Notes (Optional)</label>
                    <textarea
                      value={bookForm.notes}
                      onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0 h-16 resize-none"
                      placeholder="Provide any location instructions or layout details..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors shadow"
                  >
                    Confirm Slot Booking
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* DIRECT PRO QUOTE REQUEST MODAL */}
        {showDirectQuoteModal && selectedPro && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-lg">
            <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-md p-lg md:p-xl space-y-lg text-left shadow-2xl relative">
              <button
                onClick={() => setShowDirectQuoteModal(false)}
                className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="space-y-xs">
                <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Request Direct Quote</h3>
                <p className="text-secondary text-xs">Sending request to: <span className="font-bold text-[#0A0A0A]">{pros.find((p: any) => p.company === selectedPro.company)?.company || selectedPro.company}</span></p>
              </div>

              {directQuoteSubmitted ? (
                <div className="py-xl text-center space-y-md">
                  <span className="material-symbols-outlined text-[54px] text-green-600 block">check_circle</span>
                  <h4 className="font-bold text-body-md text-[#0A0A0A]">Request Dispatched</h4>
                  <p className="text-[#6C757D] text-xs leading-relaxed max-w-xs mx-auto">
                    Your project parameters have been forwarded to {selectedPro.company}. They will review your timeline and contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDirectQuoteSubmit} className="space-y-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Your Name</label>
                    <input
                      type="text"
                      value={directQuoteForm.name}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, name: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                    <input
                      type="tel"
                      value={directQuoteForm.phone}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, phone: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Budget (₹)</label>
                      <input
                        type="text"
                        value={directQuoteForm.budget}
                        onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, budget: e.target.value })}
                        className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                        placeholder="e.g. ₹50,000"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Timeline</label>
                      <input
                        type="text"
                        value={directQuoteForm.timeline}
                        onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, timeline: e.target.value })}
                        className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                        placeholder="e.g. 2 Weeks"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Site Address</label>
                    <input
                      type="text"
                      value={directQuoteForm.address}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, address: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Building, Street, Area, City"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Project Description</label>
                    <textarea
                      value={directQuoteForm.desc}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, desc: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0 h-20 resize-none"
                      placeholder="Describe specific work items, dimensions or material requirements..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors shadow"
                  >
                    Send Quote Request
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 1.8. Professionals Listing Page (Filtered by category & type)
  if (currentCategory && currentType && !specSlug) {
    const categoryKeyword = currentCategory.name.replace(/Services/gi, '').trim().toLowerCase();
    const matchingPros = pros.filter(pro => 
      pro.specializations.some(spec => spec.toLowerCase().includes(categoryKeyword))
    );

    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-xl">
            <a href="#/services" className="hover:text-primary transition-colors font-semibold">Services</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a href={`#/services/${categorySlug}`} className="hover:text-primary transition-colors font-semibold">{currentCategory.name}</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A] font-extrabold">{currentType.name}</span>
          </nav>

          {/* Listing Hero Banner */}
          <div className="bg-[#1a1c1c] text-white rounded-[32px] p-xl md:p-xxl flex flex-col md:flex-row items-center justify-between gap-xl mb-4xl border border-white/5 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
            <div className="space-y-md relative z-10 max-w-3xl">
              <span className="material-symbols-outlined text-primary text-[48px] block">
                {currentCategory.icon}
              </span>
              <h1 className="font-headline-h1 text-[36px] md:text-[44px] font-extrabold leading-none text-white tracking-tight">
                {currentType.name} Specialists
              </h1>
              <p className="text-secondary-fixed-dim text-body-lg">
                Compare verified local service partners specializing in {currentType.name} under {currentCategory.name}. Get guaranteed quality and verified pricing.
              </p>
            </div>
            <button
              onClick={() => {
                setHubRfqForm(prev => ({ ...prev, category: currentType.name }))
                setTimeout(() => {
                  document.getElementById('request-quotes')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="bg-primary text-[#0A0A0A] font-bold px-xxl py-lg rounded-xl hover:bg-[#fabd00] hover:scale-105 transition-all shrink-0 relative z-10 flex items-center justify-center font-label-caps"
            >
              Get Custom Estimates
            </button>
          </div>

          <h2 className="font-headline-h2 text-[26px] font-extrabold text-[#0A0A0A] mb-xl tracking-tight">
            Verified Partners ({matchingPros.length})
          </h2>

          {/* Professionals List Grid */}
          {matchingPros.length === 0 ? (
            <div className="py-xxl text-center border border-dashed border-[#E9ECEF] rounded-[24px] bg-[#F8F9FA]">
              <span className="material-symbols-outlined text-[64px] text-[#6C757D] block mb-md">person_search</span>
              <h3 className="font-bold text-body-lg text-[#0A0A0A]">No professionals found for this specific vertical</h3>
              <p className="text-[#6C757D] text-xs mt-xs">Check out general partners in the Services Hub index.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {matchingPros.map((pro) => (
                <div key={pro.id} className="w-full h-[460px] bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
                  <div className="h-44 w-full relative shrink-0">
                    <img src={pro.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute top-4 left-4 flex flex-col gap-xs items-start">
                      {pro.tag === 'Arcus Verified' && (
                        <span className="bg-[#2E7D32] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow">
                          ARCUS Verified
                        </span>
                      )}
                      {pro.tag === 'Premium Partner' && (
                        <span className="bg-[#0A0A0A] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow border border-white/10">
                          Premium Partner
                        </span>
                      )}
                      {pro.tag === 'Preferred Partner' && (
                        <span className="bg-[#1E3A8A] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow border border-white/10">
                          Preferred Partner
                        </span>
                      )}
                    </div>
                    {/* Avatar */}
                    <div className="absolute bottom-0 left-6 translate-y-1/2 w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                      <img src={pro.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                  </div>

                  <div className="px-lg pt-10 flex-1 flex flex-col justify-between">
                    <div className="space-y-xs">
                      <h3 className="font-bold text-body-md text-[#0A0A0A] truncate leading-tight" title={pro.company}>
                        {pro.company}
                      </h3>
                      <p className="text-[#6C757D] text-xs">Partner: {pro.name} • {pro.location}</p>
                      <div className="flex items-center gap-xs text-[13px] text-[#0A0A0A] font-bold">
                        <span className="material-symbols-outlined text-[#FFC107] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {pro.rating} <span className="text-[#6C757D] font-normal">({pro.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-xs py-xs border-y border-[#E9ECEF] text-center my-xs text-[11px]">
                      <div>
                        <p className="text-[9px] text-[#6C757D] font-bold uppercase">Experience</p>
                        <p className="font-extrabold text-[#0A0A0A]">{pro.experience} Yrs</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#6C757D] font-bold uppercase">Projects</p>
                        <p className="font-extrabold text-[#0A0A0A]">{pro.completedProjects}+ Done</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-xs mb-xs">
                      {pro.specializations.map((spec, sIdx) => (
                        <span key={sIdx} className="bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D] text-[9px] px-sm py-0.5 rounded font-bold uppercase">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-lg pb-lg pt-xs border-t border-[#E9ECEF] flex flex-col gap-sm shrink-0">
                    <div className="flex justify-between items-center text-xs text-[#6C757D]">
                      <div>
                        Starting: <span className="font-bold text-[#0A0A0A]">{pro.startingPrice}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-green-600 text-[14px]">schedule</span>
                        <span className="font-bold text-[#0A0A0A]">{pro.responseTime}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-md mt-xs">
                      <button
                        onClick={() => {
                          window.location.hash = `#/services/contractors/${pro.id}`
                        }}
                        className="border border-[#0A0A0A] text-[#0A0A0A] rounded-[12px] h-9 text-xs font-bold hover:bg-[#F8F9FA] transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPro(pro)
                          setShowDirectQuoteModal(true)
                        }}
                        className="bg-[#FFC107] text-[#0A0A0A] rounded-[12px] h-9 text-xs font-bold hover:bg-[#fabd00] transition-colors"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* POPULAR SERVICE BOOKING MODAL */}
        {showBookModal && selectedService && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-lg">
            <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-md p-lg md:p-xl space-y-lg text-left shadow-2xl relative">
              <button
                onClick={() => setShowBookModal(false)}
                className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="space-y-xs">
                <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Book Service Request</h3>
                <p className="text-secondary text-xs">Service: <span className="font-bold text-[#0A0A0A]">{selectedService.name}</span> (Starting from {selectedService.price})</p>
              </div>

              {bookSubmitted ? (
                <div className="py-xl text-center space-y-md">
                  <span className="material-symbols-outlined text-[54px] text-green-600 block">check_circle</span>
                  <h4 className="font-bold text-body-md text-[#0A0A0A]">Booking Confirmed</h4>
                  <p className="text-[#6C757D] text-xs leading-relaxed max-w-xs mx-auto">
                    We have registered your slot for {selectedService.name}. A verified partner will contact you shortly to coordinate.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="space-y-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Your Name</label>
                    <input
                      type="text"
                      value={bookForm.name}
                      onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                    <input
                      type="tel"
                      value={bookForm.phone}
                      onChange={(e) => setBookForm({ ...bookForm, phone: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. +91 99999 88888"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Preferred Date</label>
                    <input
                      type="date"
                      value={bookForm.date}
                      onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Specific Notes (Optional)</label>
                    <textarea
                      value={bookForm.notes}
                      onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0 h-16 resize-none"
                      placeholder="Provide any location instructions or layout details..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors shadow"
                  >
                    Confirm Slot Booking
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* DIRECT PRO QUOTE REQUEST MODAL */}
        {showDirectQuoteModal && selectedPro && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-lg">
            <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-md p-lg md:p-xl space-y-lg text-left shadow-2xl relative">
              <button
                onClick={() => setShowDirectQuoteModal(false)}
                className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="space-y-xs">
                <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Request Direct Quote</h3>
                <p className="text-secondary text-xs">Sending request to: <span className="font-bold text-[#0A0A0A]">{pros.find((p: any) => p.company === selectedPro.company)?.company || selectedPro.company}</span></p>
              </div>

              {directQuoteSubmitted ? (
                <div className="py-xl text-center space-y-md">
                  <span className="material-symbols-outlined text-[54px] text-green-600 block">check_circle</span>
                  <h4 className="font-bold text-body-md text-[#0A0A0A]">Request Dispatched</h4>
                  <p className="text-[#6C757D] text-xs leading-relaxed max-w-xs mx-auto">
                    Your project parameters have been forwarded to {selectedPro.company}. They will review your timeline and contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDirectQuoteSubmit} className="space-y-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Your Name</label>
                    <input
                      type="text"
                      value={directQuoteForm.name}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, name: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                    <input
                      type="tel"
                      value={directQuoteForm.phone}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, phone: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Budget (₹)</label>
                      <input
                        type="text"
                        value={directQuoteForm.budget}
                        onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, budget: e.target.value })}
                        className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                        placeholder="e.g. ₹50,000"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Timeline</label>
                      <input
                        type="text"
                        value={directQuoteForm.timeline}
                        onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, timeline: e.target.value })}
                        className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                        placeholder="e.g. 2 Weeks"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Project Description</label>
                    <textarea
                      value={directQuoteForm.desc}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, desc: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0 h-20 resize-none"
                      placeholder="Describe specific work items, dimensions or material requirements..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors shadow"
                  >
                    Send Quote Request
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 2. Category Detail Page
  if (currentCategory && !typeSlug) {
    const categoryKeyword = currentCategory.name.replace(/Services|&/gi, '').trim().toLowerCase()
    let matchingPros = pros.filter(pro => 
      pro.specializations.some(spec => spec.toLowerCase().includes(categoryKeyword))
    ).slice(0, 3)
    if (matchingPros.length === 0) {
      matchingPros = pros.slice(0, 3)
    }

    const activeProjects = categoryProjects[currentCategory.slug] || []
    const activeReviews = categoryReviews[currentCategory.slug] || [
      { author: 'Amit Sharma', role: 'Project Manager, Buildcon Group', text: 'Hired Arcus partners for our site work. Extremely prompt response and great coordination.', rating: 5 },
      { author: 'Pooja Patel', role: 'Developer, Prime Spaces', text: 'Outstanding compliance checks and milestone-based payments. Made the construction process worry-free.', rating: 5 }
    ]

    return (
      <div className="w-full bg-[#FFFFFF] min-h-screen text-[#212529] pt-lg pb-5xl text-left">
        <div className="max-w-[1440px] mx-auto px-lg">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-[#6C757D] font-label-caps text-[11px] mb-lg">
            <a href="#/services" className="hover:text-primary transition-colors font-semibold">Services</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0A0A0A] font-extrabold">{currentCategory.name}</span>
          </nav>

          {/* Hero Banner */}
          <div className="bg-[#1a1c1c] text-white rounded-[32px] p-xl md:p-xxl flex flex-col md:flex-row items-center justify-between gap-xl mb-4xl border border-white/5 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
            <div className="space-y-md relative z-10">
              <span className="material-symbols-outlined text-primary text-[48px] block">
                {currentCategory.icon}
              </span>
              <h1 className="font-headline-h1 text-[36px] md:text-[44px] font-extrabold leading-none text-white tracking-tight">
                {currentCategory.name}
              </h1>
              <p className="text-secondary-fixed-dim text-body-lg max-w-2xl">
                Laying heavy duty infrastructure. Tap below to inspect service types and drill down to specialized items.
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
              className="bg-primary text-[#0A0A0A] font-bold px-xxl py-lg rounded-xl hover:bg-[#fabd00] hover:scale-105 transition-all duration-200 shrink-0 relative z-10 flex items-center justify-center font-label-caps"
            >
              Get Custom RFQ
            </a>
          </div>

          {/* Service Types Sections */}
          <div className="space-y-4xl">
            {currentCategory.types.map((type) => (
              <div key={type.name} id={type.slug} className="space-y-lg text-left scroll-mt-24">
                <h3 className="font-headline-h3 text-[24px] font-extrabold text-[#0A0A0A] border-b border-[#E9ECEF] pb-xs flex items-center justify-between gap-sm tracking-tight">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-[24px]">construction</span>
                    {type.name}
                  </div>
                  <a
                    href={`#/services/${categorySlug}/${type.slug}`}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-xs"
                  >
                    View Specialists
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  {type.items.map((spec) => (
                    <div
                      key={spec.name}
                      className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl flex flex-col justify-between hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 group"
                    >
                      <div>
                        <h4 className="font-bold text-body-md text-[#0A0A0A] group-hover:text-primary transition-colors">
                          {spec.name}
                        </h4>
                        <p className="text-[#6C757D] text-xs mt-xs leading-relaxed line-clamp-3">
                          {spec.desc}
                        </p>
                      </div>
                      <a
                        href={`#/services/${currentCategory.slug}/${type.slug}/${spec.slug}`}
                        className="mt-md font-label-caps text-[10px] text-primary font-bold hover:underline flex items-center gap-xs"
                      >
                        Explore & Estimate
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Popular Professionals Section */}
          <div className="mt-5xl border-t border-[#E9ECEF] pt-4xl space-y-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-md text-left">
              <div className="space-y-xs">
                <h2 className="font-headline-h2 text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">Popular Professionals</h2>
                <p className="text-[#6C757D] text-xs">Top-rated contractors specializing in {currentCategory.name} near you.</p>
              </div>
              <a href="#/services" className="text-primary font-bold text-xs hover:underline flex items-center gap-xs">
                Browse All Contractors
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {matchingPros.map((pro) => (
                <div key={pro.id} className="w-full h-[460px] bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
                  <div className="h-44 w-full relative shrink-0">
                    <img src={pro.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute top-4 left-4 flex flex-col gap-xs items-start">
                      {pro.tag === 'Arcus Verified' && (
                        <span className="bg-[#2E7D32] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow">
                          ARCUS Verified
                        </span>
                      )}
                      {pro.tag === 'Premium Partner' && (
                        <span className="bg-[#0A0A0A] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow border border-white/10">
                          Premium Partner
                        </span>
                      )}
                      {pro.tag === 'Preferred Partner' && (
                        <span className="bg-[#1E3A8A] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow border border-white/10">
                          Preferred Partner
                        </span>
                      )}
                    </div>
                    {/* Avatar */}
                    <div className="absolute bottom-0 left-6 translate-y-1/2 w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                      <img src={pro.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                  </div>

                  <div className="px-lg pt-10 flex-1 flex flex-col justify-between">
                    <div className="space-y-xs">
                      <h3 className="font-bold text-body-md text-[#0A0A0A] truncate leading-tight" title={pro.company}>
                        {pro.company}
                      </h3>
                      <p className="text-[#6C757D] text-xs">Partner: {pro.name} • {pro.location}</p>
                      <div className="flex items-center gap-xs text-[13px] text-[#0A0A0A] font-bold">
                        <span className="material-symbols-outlined text-[#FFC107] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {pro.rating} <span className="text-[#6C757D] font-normal">({pro.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-xs py-xs border-y border-[#E9ECEF] text-center my-xs text-[11px]">
                      <div>
                        <p className="text-[9px] text-[#6C757D] font-bold uppercase">Experience</p>
                        <p className="font-extrabold text-[#0A0A0A]">{pro.experience} Yrs</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#6C757D] font-bold uppercase">Projects</p>
                        <p className="font-extrabold text-[#0A0A0A]">{pro.completedProjects}+ Done</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-xs mb-xs">
                      {pro.specializations.map((spec, sIdx) => (
                        <span key={sIdx} className="bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D] text-[9px] px-sm py-0.5 rounded font-bold uppercase">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-lg pb-lg pt-xs border-t border-[#E9ECEF] flex flex-col gap-sm shrink-0">
                    <div className="flex justify-between items-center text-xs text-[#6C757D]">
                      <div>
                        Starting: <span className="font-bold text-[#0A0A0A]">{pro.startingPrice}</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-green-600 text-[14px]">schedule</span>
                        <span className="font-bold text-[#0A0A0A]">{pro.responseTime}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-md mt-xs">
                      <button
                        onClick={() => {
                          window.location.hash = `#/services/contractors/${pro.id}`
                        }}
                        className="border border-[#0A0A0A] text-[#0A0A0A] rounded-[12px] h-9 text-xs font-bold hover:bg-[#F8F9FA] transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPro(pro)
                          setShowDirectQuoteModal(true)
                        }}
                        className="bg-[#FFC107] text-[#0A0A0A] rounded-[12px] h-9 text-xs font-bold hover:bg-[#fabd00] transition-colors"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Projects Section */}
          <div className="mt-5xl border-t border-[#E9ECEF] pt-4xl space-y-xl">
            <div className="space-y-xs text-left">
              <h2 className="font-headline-h2 text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">Featured Projects</h2>
              <p className="text-[#6C757D] text-xs">Real-world case studies and project handovers executed by Arcus partners.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg text-left">
              {activeProjects.map((project, idx) => (
                <div key={idx} className="bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div className="h-48 bg-[#F8F9FA] relative overflow-hidden">
                    <img src={project.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Project" />
                    <span className="absolute bottom-3 left-3 bg-[#0A0A0A]/80 text-white text-[10px] font-bold px-md py-1 rounded-full uppercase">
                      {project.metric}
                    </span>
                  </div>
                  <div className="p-lg flex-1 flex flex-col justify-between space-y-md">
                    <div className="space-y-xs">
                      <h4 className="font-bold text-body-md text-[#0A0A0A] line-clamp-1">{project.title}</h4>
                      <p className="text-[11px] text-[#6C757D] font-medium">{project.client}</p>
                      <p className="text-xs text-[#495057] leading-relaxed line-clamp-3">{project.desc}</p>
                    </div>
                    <div className="pt-sm border-t border-[#E9ECEF] flex justify-between items-center text-xs">
                      <span className="text-[#6C757D]">Quality Standards</span>
                      <span className="text-[#2E7D32] font-bold flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Passed Audit
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Client Reviews Section */}
          <div className="mt-5xl border-t border-[#E9ECEF] pt-4xl space-y-xl">
            <div className="space-y-xs text-left">
              <h2 className="font-headline-h2 text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">Verified Client Reviews</h2>
              <p className="text-[#6C757D] text-xs">Feedback from builders, developers, and homeowners on our {currentCategory.name}.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg text-left">
              {activeReviews.map((review, idx) => (
                <div key={idx} className="bg-white border border-[#E9ECEF] rounded-[24px] p-xl space-y-md shadow-sm relative flex flex-col justify-between">
                  <span className="material-symbols-outlined text-[#E9ECEF] text-[64px] absolute right-6 top-4 select-none pointer-events-none">
                    format_quote
                  </span>
                  <div className="space-y-sm">
                    <div className="flex gap-xs">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-[#FFC107] text-[18px]"
                          style={{ fontVariationSettings: `'FILL' ${i < review.rating ? 1 : 0}` }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-body-md text-[#495057] italic leading-relaxed relative z-10">
                      "{review.text}"
                    </p>
                  </div>
                  <div className="pt-md border-t border-[#E9ECEF] flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-[#FFC107]/10 flex items-center justify-center font-bold text-primary">
                      {review.author[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-body-sm text-[#0A0A0A]">{review.author}</h4>
                      <p className="text-[11px] text-[#6C757D]">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }

  // 3. Top-level Services Hub Page
  const filteredProfessionals = pros.filter((pro) => {
    const cleanSearch = sanitizeText(hubSearchQuery)
    const matchesSearch = pro.name.toLowerCase().includes(cleanSearch.toLowerCase()) ||
                          pro.company.toLowerCase().includes(cleanSearch.toLowerCase()) ||
                          pro.specializations.some(s => s.toLowerCase().includes(cleanSearch.toLowerCase()))

    const matchesCity = hubCityFilter === 'All' || pro.location.toLowerCase() === hubCityFilter.toLowerCase()
    const matchesCategory = hubCategoryFilter === 'All' || pro.specializations.includes(hubCategoryFilter)

    let matchesExp = true
    if (hubExpFilter === 'Under 10 Yrs') matchesExp = pro.experience < 10
    else if (hubExpFilter === '10+ Yrs') matchesExp = pro.experience >= 10

    let matchesRating = true
    if (hubRatingFilter === '4.9★+') matchesRating = pro.rating >= 4.9

    const matchesVerified = !hubVerifiedOnly || pro.isVerified
    const matchesBudget = hubBudgetFilter === 'All' || pro.budget === hubBudgetFilter

    return matchesSearch && matchesCity && matchesCategory && matchesExp && matchesRating && matchesVerified && matchesBudget
  })

  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    if (hubSortOption === 'Top Rated') return b.rating - a.rating
    if (hubSortOption === 'Most Experienced') return b.experience - a.experience
    return 0
  })

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const payload = {
        serviceName: selectedService?.name || 'Unknown Service',
        name: bookForm.name,
        phone: bookForm.phone,
        date: bookForm.date,
        notes: bookForm.notes
      }
      const res = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      console.warn('Backend server offline, falling back to local state:', err)
    }

    setBookSubmitted(true)
    setTimeout(() => {
      setBookSubmitted(false)
      setShowBookModal(false)
      setBookForm({ name: '', phone: '', date: '', time: '', address: '', notes: '' })
    }, 3000)
  }

  async function handleDirectQuoteSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const payload = {
        contractorId: selectedPro?.id || 'unknown',
        contractorCompany: selectedPro?.company || 'Unknown Contractor',
        name: directQuoteForm.name,
        phone: directQuoteForm.phone,
        budget: directQuoteForm.budget,
        timeline: directQuoteForm.timeline,
        desc: directQuoteForm.desc
      }
      const res = await fetch('/api/contractor-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      console.warn('Backend server offline, falling back to local state:', err)
    }

    setDirectQuoteSubmitted(true)
    setTimeout(() => {
      setDirectQuoteSubmitted(false)
      setShowDirectQuoteModal(false)
      setDirectQuoteForm({ name: '', phone: '', budget: '', timeline: '', address: '', desc: '' })
    }, 3000)
  }

  const handleHubRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        name: hubRfqForm.name,
        phone: hubRfqForm.phone,
        category: hubRfqForm.category,
        quantity: 'N/A',
        location: 'N/A',
        timeline: hubRfqForm.timeline,
        details: `Budget: ${hubRfqForm.budget}. Description: ${hubRfqForm.desc}`
      }
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
    } catch (err) {
      console.warn('Backend server offline, falling back to local state:', err)
    }

    setHubRfqSubmitted(true)
    setTimeout(() => {
      setHubRfqSubmitted(false)
      setHubRfqForm({
        name: '',
        phone: '',
        category: 'Full Home Renovation',
        budget: '',
        timeline: '',
        desc: ''
      })
    }, 3000)
  }

  return (
    <div className="w-full bg-[#FFFFFF] text-[#212529] font-sans pb-5xl select-none">
      {/* SECTION 1: HERO CONTAINER */}
      <section className="pt-lg px-lg max-w-[1440px] mx-auto">
        <div className="w-full min-h-[520px] bg-[#F8F9FA] rounded-[32px] p-lg md:p-xxl relative overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle,#FFC107_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-xxl items-center relative z-10 w-full">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-md text-left">
              <h1 className="font-headline-h1 text-[40px] md:text-[56px] lg:text-[60px] font-extrabold text-[#0A0A0A] leading-[1.1] tracking-tight">
                Find Trusted Professionals For Any Construction Or Maintenance Project
              </h1>
              <p className="font-body-lg text-body-lg text-[#6C757D] max-w-xl">
                From plumbing repairs and appliance installations to complete home construction and industrial projects, ARCUS connects you with verified professionals across India.
              </p>

              {/* Hero Search Module */}
              <div className="w-full bg-white p-md rounded-[20px] shadow-lg border border-[#E9ECEF] flex flex-col lg:flex-row items-center gap-md mt-lg">
                <div className="flex-1 w-full flex items-center gap-sm bg-[#F8F9FA] px-md py-sm rounded-lg border border-transparent focus-within:border-[#FFC107] focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-[#6C757D]">search</span>
                  <input
                    type="text"
                    value={hubSearchQuery}
                    onChange={(e) => setHubSearchQuery(e.target.value)}
                    className="bg-transparent w-full text-body-sm outline-none border-none focus:ring-0"
                    placeholder="What service do you need? (e.g. Plumber, Interior Designer...)"
                  />
                </div>

                <div className="w-full lg:w-48 flex items-center gap-sm bg-[#F8F9FA] px-md py-sm rounded-lg border border-transparent focus-within:border-[#FFC107] focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-[#6C757D]">location_on</span>
                  <select
                    value={hubCityFilter}
                    onChange={(e) => setHubCityFilter(e.target.value)}
                    className="bg-transparent w-full text-[#212529] font-bold text-body-sm outline-none border-none focus:ring-0 cursor-pointer"
                  >
                    <option value="All">All Cities</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    document.getElementById('professionals-grid-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full lg:w-auto bg-[#FFC107] text-[#0A0A0A] px-xl h-12 rounded-[12px] font-bold text-[14px] hover:bg-[#fabd00] transition-colors shrink-0 flex items-center justify-center"
                >
                  Find Professionals
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-lg pt-lg mt-lg border-t border-[#E9ECEF]/60">
                <div>
                  <p className="text-[24px] md:text-[28px] font-extrabold text-[#0A0A0A] leading-tight">10,000+</p>
                  <p className="text-xs text-[#6C757D] font-bold">Verified Professionals</p>
                </div>
                <div>
                  <p className="text-[24px] md:text-[28px] font-extrabold text-[#0A0A0A] leading-tight">25,000+</p>
                  <p className="text-xs text-[#6C757D] font-bold">Projects Completed</p>
                </div>
                <div>
                  <p className="text-[24px] md:text-[28px] font-extrabold text-[#0A0A0A] leading-tight">500+</p>
                  <p className="text-xs text-[#6C757D] font-bold">Cities Covered</p>
                </div>
                <div>
                  <p className="text-[24px] md:text-[28px] font-extrabold text-[#0A0A0A] leading-tight">4.8★</p>
                  <p className="text-xs text-[#6C757D] font-bold">Average Partner Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="lg:col-span-5 hidden lg:block relative h-[480px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FFC107]/20 to-transparent rounded-[24px] blur-md -z-10"></div>
              {/* Image Frame */}
              <div className="w-full h-full rounded-[24px] overflow-hidden border border-[#E9ECEF] shadow-lg relative bg-white group hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="/services_house_construction.png"
                  alt="ARCUS Construction and Maintenance Services"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Badge 1: Verified Badge */}
                <div className="absolute top-6 left-6 bg-white border border-[#E9ECEF] rounded-[16px] p-md shadow-lg flex items-center gap-sm">
                  <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                    <span className="material-symbols-outlined text-[20px] font-bold">verified</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-[#0A0A0A] leading-none mb-0.5">100% Verified</p>
                    <p className="text-[10px] text-[#6C757D] font-bold">GST & Background Checked</p>
                  </div>
                </div>

                {/* Floating Badge 2: Ongoing Project Badge */}
                <div className="absolute bottom-6 right-6 bg-[#0A0A0A] rounded-[16px] p-md shadow-lg flex items-center gap-sm border border-white/10 text-white">
                  <div className="w-8 h-8 rounded-full bg-[#FFC107] flex items-center justify-center text-[#0A0A0A]">
                    <span className="material-symbols-outlined text-[20px]">engineering</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-extrabold leading-none mb-0.5">Project Supervision</p>
                    <p className="text-[10px] text-white/70 font-bold">ARCUS Certified Audits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SERVICE CATEGORIES */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <div className="flex justify-between items-end mb-xl">
          <div>
            <span className="font-label-caps text-[#FFC107] mb-xs block uppercase tracking-wider text-[10px] font-bold">Service Taxonomy</span>
            <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">
              Browse Service Categories
            </h2>
          </div>
          <a
            href="#services-hub-grid"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('services-categories-grid')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-[#FFC107] font-bold hover:underline flex items-center gap-xs text-body-sm"
          >
            View All Categories
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        <div id="services-categories-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { name: 'Plumbing', slug: 'plumbing-services', icon: 'plumbing', subs: 'Pipe Installation, Water Tank Services, Bathroom Fittings, Pump Installation' },
            { name: 'Electrical', slug: 'electrical-services', icon: 'bolt', subs: 'Wiring, Lighting, Inverter Installation, Solar Connection' },
            { name: 'Carpentry', slug: 'carpentry-services', icon: 'handyman', subs: 'Furniture, Modular Kitchen, Wardrobes, Doors & Windows' },
            { name: 'Painting', slug: 'painting-finishing', icon: 'format_paint', subs: 'Interior Painting, Exterior Painting, Texture Finishes, Waterproof Coatings' },
            { name: 'Home Maintenance', slug: 'maintenance-specialized', icon: 'home_repair_service', subs: 'Geyser Installation, Washing Machine Installation, Water Purifier, General Repairs' },
            { name: 'Interior Design', slug: 'architecture-design', icon: 'architecture', subs: 'Residential Interiors, Office Interiors, Retail Interiors, Modular Solutions' },
            { name: 'Construction & Renovation', slug: 'civil-construction', icon: 'foundation', subs: 'House Construction, Renovation, Civil Works, Masonry' },
            { name: 'Professional Services', slug: 'architecture-design', icon: 'engineering', subs: 'Architects, Structural Engineers, Quantity Surveyors, Project Consultants' }
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
                window.location.hash = `#/services/${cat.slug}`
              }}
              className="w-full h-[180px] bg-[#FFFFFF] rounded-[24px] border border-[#E9ECEF] p-lg flex flex-col justify-between hover:border-[#FFC107] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-full flex items-center justify-center border border-[#E9ECEF] group-hover:bg-[#FFC107]/10 transition-colors">
                  <span className="material-symbols-outlined text-[#0A0A0A] group-hover:text-[#FFC107] transition-colors">{cat.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-[#FFC107] font-label-caps uppercase tracking-wider flex items-center gap-xs">
                  Explore Services
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
              <div className="space-y-xs">
                <h3 className="font-bold text-body-md text-[#0A0A0A] group-hover:text-[#FFC107] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#6C757D] leading-relaxed line-clamp-3">
                  {cat.subs}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: POPULAR SERVICES */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight mb-xl">
          Popular Services In Your City
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {popularServicesList.map((service, idx) => (
            <div key={idx} className="bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden p-md flex flex-col justify-between h-[320px] hover:shadow-md transition-all">
              <div className="space-y-md">
                <div className="h-40 w-full rounded-[16px] overflow-hidden">
                  <img src={service.image} className="w-full h-full object-cover" alt={service.name} />
                </div>
                <div className="space-y-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-body-md text-[#0A0A0A] leading-snug">{service.name}</h4>
                    <span className="flex items-center gap-xs text-[#FFC107] font-bold text-xs shrink-0">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {service.rating}
                    </span>
                  </div>
                  <p className="text-[#6C757D] text-xs leading-relaxed">{service.desc}</p>
                </div>
              </div>
              <div className="pt-sm border-t border-[#E9ECEF] flex justify-between items-center mt-sm">
                <div>
                  <p className="text-[9px] text-[#6C757D] font-bold uppercase tracking-wider">Starting Price</p>
                  <p className="font-extrabold text-body-md text-[#0A0A0A]">{service.price}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedService(service)
                    setShowBookModal(true)
                  }}
                  className="bg-white border border-[#0A0A0A] text-[#0A0A0A] px-lg h-9 rounded-[8px] font-bold text-xs hover:bg-[#0A0A0A] hover:text-white transition-all"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FIND PROFESSIONALS NEAR YOU */}
      <section id="professionals-grid-section" className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight mb-xl">
          Verified Professionals Near You
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl items-start">
          {/* Left Side: Filter Matrix Panel */}
          <div className="hidden lg:block lg:col-span-3 space-y-lg bg-[#F8F9FA] p-xl rounded-[24px] border border-[#E9ECEF]">
            <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-sm">
              <span className="flex items-center gap-xs font-bold text-body-sm text-[#0A0A0A]">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Filters
              </span>
              {(hubCityFilter !== 'All' || hubCategoryFilter !== 'All' || hubExpFilter !== 'All' || hubRatingFilter !== 'All' || hubVerifiedOnly || hubBudgetFilter !== 'All' || hubSearchQuery !== '') && (
                <button
                  onClick={() => {
                    setHubSearchQuery('')
                    setHubCityFilter('All')
                    setHubCategoryFilter('All')
                    setHubExpFilter('All')
                    setHubRatingFilter('All')
                    setHubVerifiedOnly(false)
                    setHubBudgetFilter('All')
                  }}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-md">
              {/* Location Select */}
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Location</label>
                <select
                  value={hubCityFilter}
                  onChange={(e) => setHubCityFilter(e.target.value)}
                  className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                >
                  <option value="All">All Cities</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                </select>
              </div>

              {/* Service Category Select */}
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Category</label>
                <select
                  value={hubCategoryFilter}
                  onChange={(e) => setHubCategoryFilter(e.target.value)}
                  className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                >
                  <option value="All">All Categories</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                  <option value="Maintenance">Home Maintenance</option>
                  <option value="Interior Design">Interior Design</option>
                  <option value="Renovation">Construction &amp; Renovation</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Experience</label>
                <select
                  value={hubExpFilter}
                  onChange={(e) => setHubExpFilter(e.target.value)}
                  className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                >
                  <option value="All">All Experience levels</option>
                  <option value="Under 10 Yrs">Under 10 Years</option>
                  <option value="10+ Yrs">10+ Years</option>
                </select>
              </div>

              {/* Ratings Filter */}
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Rating</label>
                <select
                  value={hubRatingFilter}
                  onChange={(e) => setHubRatingFilter(e.target.value)}
                  className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                >
                  <option value="All">All Ratings</option>
                  <option value="4.9★+">4.9★ &amp; Above</option>
                </select>
              </div>

              {/* Budget Filter */}
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Starting Price Budget</label>
                <select
                  value={hubBudgetFilter}
                  onChange={(e) => setHubBudgetFilter(e.target.value)}
                  className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                >
                  <option value="All">All budgets</option>
                  <option value="Low">Low (under ₹500)</option>
                  <option value="Medium">Medium (₹500 - ₹1000)</option>
                  <option value="High">High (over ₹1000)</option>
                </select>
              </div>

              {/* Verified Toggle */}
              <div className="flex items-center justify-between pt-sm border-t border-[#E9ECEF] mt-sm">
                <span className="text-xs text-[#0A0A0A] font-bold">ARCUS Verified Only</span>
                <input
                  type="checkbox"
                  checked={hubVerifiedOnly}
                  onChange={(e) => setHubVerifiedOnly(e.target.checked)}
                  className="rounded text-[#FFC107] focus:ring-[#FFC107] h-4 w-4 border-[#E9ECEF]"
                />
              </div>
            </div>
          </div>

          {/* Right Side: Listings Grid & Sort */}
          <div className="lg:col-span-9 space-y-lg">
            {/* Mobile Filter Button */}
            <div className="flex justify-between items-center lg:hidden bg-[#F8F9FA] p-md rounded-[16px] border border-[#E9ECEF] mb-md">
              <button
                onClick={() => setHubShowMobileFilters(true)}
                className="flex items-center gap-xs font-bold text-xs text-[#0A0A0A] bg-white px-lg py-sm rounded-lg border border-[#E9ECEF]"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Filter &amp; Sort
              </button>
              <span className="text-xs text-[#6C757D] font-bold">{sortedProfessionals.length} Pros found</span>
            </div>

            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-baseline gap-md border-b border-[#E9ECEF] pb-sm">
              <span className="text-xs text-[#6C757D] font-bold">
                Showing {sortedProfessionals.length} professional{sortedProfessionals.length !== 1 ? 's' : ''} near you
              </span>
              <div className="flex items-center gap-md min-w-max">
                <span className="text-xs text-[#6C757D] font-bold">Sort By:</span>
                <select
                  value={hubSortOption}
                  onChange={(e) => setHubSortOption(e.target.value)}
                  className="bg-[#F8F9FA] text-xs font-bold border border-transparent hover:border-[#E9ECEF] rounded-lg h-9 px-md outline-none cursor-pointer"
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Top Rated">Top Rated</option>
                  <option value="Most Experienced">Most Experienced</option>
                </select>
              </div>
            </div>

            {/* Professionals List Grid */}
            {sortedProfessionals.length === 0 ? (
              <div className="py-xxl text-center border border-dashed border-[#E9ECEF] rounded-[24px] bg-[#F8F9FA]">
                <span className="material-symbols-outlined text-[64px] text-[#6C757D] block mb-md">person_search</span>
                <h3 className="font-bold text-body-lg text-[#0A0A0A]">No professionals match search/filters</h3>
                <p className="text-[#6C757D] text-xs mt-xs">Try resetting or broadening your filter constraints.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {sortedProfessionals.map((pro) => (
                  <div key={pro.id} className="w-full h-[460px] bg-white border border-[#E9ECEF] rounded-[24px] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
                    <div className="h-44 w-full relative shrink-0">
                      <img src={pro.coverImage} className="w-full h-full object-cover" alt="Cover" />
                      <div className="absolute top-4 left-4 flex flex-col gap-xs items-start">
                        {pro.tag === 'Arcus Verified' && (
                          <span className="bg-[#2E7D32] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow">
                            ARCUS Verified
                          </span>
                        )}
                        {pro.tag === 'Premium Partner' && (
                          <span className="bg-[#0A0A0A] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow border border-white/10">
                            Premium Partner
                          </span>
                        )}
                        {pro.tag === 'Preferred Partner' && (
                          <span className="bg-[#1E3A8A] text-white text-[9px] font-bold px-md py-0.5 rounded-full uppercase tracking-wider shadow border border-white/10">
                            Preferred Partner
                          </span>
                        )}
                      </div>
                      {/* Avatar */}
                      <div className="absolute bottom-0 left-6 translate-y-1/2 w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                        <img src={pro.avatar} className="w-full h-full object-cover" alt="Avatar" />
                      </div>
                    </div>

                    <div className="px-lg pt-10 flex-1 flex flex-col justify-between">
                      <div className="space-y-xs">
                        <h3 className="font-bold text-body-md text-[#0A0A0A] truncate leading-tight" title={pro.company}>
                          {pro.company}
                        </h3>
                        <p className="text-[#6C757D] text-xs">Partner: {pro.name} • {pro.location}</p>
                        <div className="flex items-center gap-xs text-[13px] text-[#0A0A0A] font-bold">
                          <span className="material-symbols-outlined text-[#FFC107] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          {pro.rating} <span className="text-[#6C757D] font-normal">({pro.reviewCount} reviews)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-xs py-xs border-y border-[#E9ECEF] text-center my-xs text-[11px]">
                        <div>
                          <p className="text-[9px] text-[#6C757D] font-bold uppercase">Experience</p>
                          <p className="font-extrabold text-[#0A0A0A]">{pro.experience} Yrs</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#6C757D] font-bold uppercase">Projects</p>
                          <p className="font-extrabold text-[#0A0A0A]">{pro.completedProjects}+ Done</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-xs mb-xs">
                        {pro.specializations.map((spec, sIdx) => (
                          <span key={sIdx} className="bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D] text-[9px] px-sm py-0.5 rounded font-bold uppercase">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="px-lg pb-lg pt-xs border-t border-[#E9ECEF] flex flex-col gap-sm shrink-0">
                      <div className="flex justify-between items-center text-xs text-[#6C757D]">
                        <div>
                          Starting: <span className="font-bold text-[#0A0A0A]">{pro.startingPrice}</span>
                        </div>
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-green-600 text-[14px]">schedule</span>
                          <span className="font-bold text-[#0A0A0A]">{pro.responseTime}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-md mt-xs">
                        <button
                          onClick={() => {
                            // Open profile subpage
                            window.location.hash = `#/services/contractors/${pro.id}`
                          }}
                          className="border border-[#0A0A0A] text-[#0A0A0A] rounded-[12px] h-9 text-xs font-bold hover:bg-[#F8F9FA] transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPro(pro)
                            setShowDirectQuoteModal(true)
                          }}
                          className="bg-[#FFC107] text-[#0A0A0A] rounded-[12px] h-9 text-xs font-bold hover:bg-[#fabd00] transition-colors"
                        >
                          Request Quote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: PROJECT TYPES */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <div className="bg-[#F8F9FA] rounded-[32px] p-8 md:p-12 border border-[#E9ECEF]">
          <div className="text-center mb-xl max-w-xl mx-auto space-y-xs">
            <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A]">
              Services For Every Project Size
            </h2>
            <p className="text-[#6C757D] text-body-sm leading-relaxed">
              From minor appliance installations to ground-up B2B turnkey developments, we scale procurement to fit your parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {[
              { title: 'Small Maintenance Tasks', desc: 'Same-day repairs and installations for geysers, washing machines, filter leaks, or short circuits.', timeline: '1 hour response time' },
              { title: 'Home Improvement', desc: 'Room repainting, cabinet woodwork, balcony extensions, and floor tiles replacement managed by local teams.', timeline: '2 - 7 days completion' },
              { title: 'Renovation Projects', desc: 'Complete structural renovations, villa waterproofing, commercial structural repairs, and layout design.', timeline: 'Escrow payment safety' },
              { title: 'New Construction', desc: 'Ground-up residential buildings, warehouse PEB shed casting, and factory RCC structures casting.', timeline: 'Institutional Grade BOQ' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-lg rounded-[20px] border border-[#E9ECEF] flex flex-col justify-between h-[200px]">
                <div className="space-y-xs">
                  <h3 className="font-bold text-body-md text-[#0A0A0A]">{item.title}</h3>
                  <p className="text-xs text-[#6C757D] leading-relaxed">{item.desc}</p>
                </div>
                <span className="text-xs text-[#FFC107] font-bold font-label-caps uppercase">{item.timeline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY ARCUS PROFESSIONALS */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <div className="max-w-xl mb-xl space-y-xs">
          <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight">
            Why Choose ARCUS Professionals
          </h2>
          <p className="text-[#6C757D] text-body-sm leading-relaxed">
            We eliminate typical marketplace trust deviations through rigorous auditing and standard structural milestone monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[
            { icon: 'verified_user', title: 'ARCUS Verified', desc: '4-step licensing verification, PAN audits, and business credential background checks.' },
            { icon: 'manage_accounts', title: 'Background Checked', desc: 'Onsite technicians and contractor workforce audited for high B2B security.' },
            { icon: 'receipt_long', title: 'GST Verified Billing', desc: 'Itemized standard billing with 100% clean tax invoices for corporate claims.' },
            { icon: 'verified', title: 'Portfolio Audits', desc: 'Physical inspection and developer invoice auditing to verify past completion proof.' },
            { icon: 'security', title: 'Insurance Covered', desc: 'Every civil structural team backed by comprehensive third-party liability insurance.' },
            { icon: 'support_agent', title: 'Dedicated Support Desk', desc: 'Site inspection scheduling, dispute mapping, and escalation support via ARCUS engineers.' }
          ].map((item, idx) => (
            <div key={idx} className="p-lg bg-white border border-[#E9ECEF] rounded-[20px] flex gap-md items-start">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px] shrink-0">{item.icon}</span>
              <div className="space-y-xs">
                <h3 className="font-bold text-body-md text-[#0A0A0A]">{item.title}</h3>
                <p className="text-xs text-[#6C757D] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: REQUEST MULTIPLE QUOTES */}
      <section id="request-quotes" className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <div className="w-full bg-[#FFF8E1] rounded-[32px] p-8 md:p-12 border border-[#FFE082]/60 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
            <div className="lg:col-span-5 space-y-md">
              <span className="bg-[#FFC107] text-[#0A0A0A] font-bold px-md py-1 rounded w-fit text-[10px] font-label-caps tracking-wider uppercase">
                Bids &amp; Procurement
              </span>
              <h2 className="font-headline-h2 text-[36px] font-extrabold text-[#0A0A0A] leading-tight">
                Need Quotes For A Project?
              </h2>
              <p className="text-body-sm text-[#6C757D] leading-relaxed">
                Describe your requirements and receive competitive quotations from up to 5 verified professionals. Upload your architectural layouts or BOQs to request precise bids.
              </p>
              <div className="space-y-sm pt-sm text-body-sm font-semibold text-[#0A0A0A]">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[#2E7D32]">check_circle</span>
                  <span>Quotes delivered in 24 Hours</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[#2E7D32]">check_circle</span>
                  <span>Escrow milestone payment safety</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-lg rounded-[24px] border border-[#FFE082]/30 shadow-md">
              {hubRfqSubmitted ? (
                <div className="py-[60px] text-center space-y-md">
                  <span className="material-symbols-outlined text-[64px] text-green-600 block">verified</span>
                  <h3 className="font-bold text-headline-h3 text-[22px] text-[#0A0A0A]">Quotes Request Filed</h3>
                  <p className="text-secondary text-body-sm max-w-sm mx-auto leading-relaxed">
                    Our lead engineers are evaluating your specifications and BOQ. Up to 3 matching partners will contact you within 2 hours.
                  </p>
                  <button onClick={() => setHubRfqSubmitted(false)} className="text-[#FFC107] font-bold hover:underline text-xs block mx-auto">
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHubRfqSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Service Category</label>
                    <select
                      value={hubRfqForm.category}
                      onChange={(e) => setHubRfqForm({ ...hubRfqForm, category: e.target.value })}
                      className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm focus:border-2 focus:border-[#FFC107] focus:ring-0 outline-none"
                    >
                      <option value="Full Home Renovation">Full Home Renovation</option>
                      <option value="New Construction">New House Construction</option>
                      <option value="Commercial Fit-out">Commercial Office Fit-Out</option>
                      <option value="Industrial Shed">Industrial Warehouse Shed</option>
                      <option value="Maintenance AMC">Corporate AMC Services</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Project City</label>
                    <input
                      type="text"
                      value={hubRfqForm.name}
                      onChange={(e) => setHubRfqForm({ ...hubRfqForm, name: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm focus:border-2 focus:border-[#FFC107] focus:ring-0 outline-none"
                      placeholder="e.g. Indiranagar, Bangalore"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Budget Estimate</label>
                    <input
                      type="text"
                      value={hubRfqForm.budget}
                      onChange={(e) => setHubRfqForm({ ...hubRfqForm, budget: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm focus:border-2 focus:border-[#FFC107] focus:ring-0 outline-none"
                      placeholder="e.g. ₹25 Lakhs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Target Timeline</label>
                    <input
                      type="text"
                      value={hubRfqForm.timeline}
                      onChange={(e) => setHubRfqForm({ ...hubRfqForm, timeline: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm focus:border-2 focus:border-[#FFC107] focus:ring-0 outline-none"
                      placeholder="e.g. 6 Months"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                    <input
                      type="tel"
                      value={hubRfqForm.phone}
                      onChange={(e) => setHubRfqForm({ ...hubRfqForm, phone: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm focus:border-2 focus:border-[#FFC107] focus:ring-0 outline-none"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Project Description</label>
                    <textarea
                      value={hubRfqForm.desc}
                      onChange={(e) => setHubRfqForm({ ...hubRfqForm, desc: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm focus:border-2 focus:border-[#FFC107] focus:ring-0 outline-none h-20 resize-none"
                      placeholder="Enter specifications (e.g. total square footage, layout drawings details)..."
                    />
                  </div>

                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Upload layouts / BOQ (Optional)</label>
                    <div className="border border-dashed border-[#E9ECEF] bg-[#F8F9FA] rounded-lg p-md text-center hover:bg-white transition-colors cursor-pointer flex flex-col items-center justify-center gap-xs h-20">
                      <span className="material-symbols-outlined text-[#6C757D] text-[20px]">upload_file</span>
                      <span className="text-xs text-[#6C757D] font-medium">Click to select PDF BOQ or Floor plans</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 bg-[#FFC107] text-[#0A0A0A] font-bold h-12 rounded-[12px] hover:bg-[#fabd00] transition-colors mt-xs shadow"
                  >
                    Get Quotes
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FEATURED PROJECTS */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight mb-xl">
          Recently Completed Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {featuredProjectsList.map((proj, idx) => (
            <div key={idx} className="border border-[#E9ECEF] rounded-[24px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group">
              <div className="h-56 w-full overflow-hidden">
                <img src={proj.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={proj.name} />
              </div>
              <div className="p-lg space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="bg-[#FFC107]/10 text-[#5b4300] font-label-caps text-[9px] px-sm py-0.5 rounded font-bold uppercase tracking-wider">
                    {proj.type}
                  </span>
                  <span className="text-[11px] text-[#6C757D] font-bold">{proj.date}</span>
                </div>
                <h3 className="font-bold text-body-md text-[#0A0A0A] leading-tight">{proj.name}</h3>
                <div className="flex justify-between items-center text-xs text-[#6C757D] pt-sm border-t border-[#E9ECEF]">
                  <span>Pro: <span className="font-bold text-[#0A0A0A]">{proj.contractor}</span></span>
                  <span className="font-extrabold text-[#2E7D32]">{proj.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: CUSTOMER TESTIMONIALS */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight mb-xl">
          What Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {testimonialsList.map((test, idx) => (
            <div key={idx} className="p-xl bg-white border border-[#E9ECEF] rounded-[24px] shadow-sm text-left flex flex-col justify-between">
              <div className="space-y-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#0A0A0A] text-body-md">{test.name}</h4>
                    <p className="text-xs text-[#6C757D]">{test.location} • Client</p>
                  </div>
                  <div className="flex text-[#FFC107]">
                    {Array.from({ length: test.rating }).map((_, rIdx) => (
                      <span key={rIdx} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                </div>
                <p className="text-[#6C757D] text-body-sm italic leading-relaxed">
                  {test.review}
                </p>
              </div>
              <div className="pt-md border-t border-[#E9ECEF] mt-lg flex justify-between items-center text-xs text-[#6C757D]">
                <span>Project Scope: <span className="font-bold text-[#0A0A0A]">{test.projectType}</span></span>
                <span>Project Cost: <span className="font-bold text-[#2E7D32]">{test.cost}</span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: BECOME A SERVICE PARTNER */}
      <section className="mt-5xl px-lg max-w-[1320px] mx-auto text-left">
        <div className="w-full bg-[#0A0A0A] text-white rounded-[32px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#FFC107]/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 max-w-xl space-y-md">
            <span className="bg-[#FFC107] text-[#0A0A0A] font-bold px-md py-1 rounded w-fit text-[9px] font-label-caps tracking-wider uppercase">
              GROW YOUR WORKFLOW
            </span>
            <h2 className="font-headline-h2 text-[32px] md:text-[40px] font-extrabold text-white leading-tight">
              Are You A Professional?
            </h2>
            <p className="text-body-sm text-[#6C757D] leading-relaxed">
              Join ARCUS and start receiving verified, pre-qualified B2B and residential project leads in your service locations. Keep operations running at maximum scale.
            </p>
            <div className="flex flex-wrap gap-md pt-sm">
              <button
                onClick={() => alert('Simulator: Service partner registration form will release shortly.')}
                className="bg-[#FFC107] text-[#0A0A0A] px-xl h-12 rounded-[12px] font-bold text-body-sm hover:bg-[#fabd00] transition-colors"
              >
                Become A Service Partner
              </button>
              <button
                onClick={() => alert('Download ARCUS Partner App: Simulated link.')}
                className="border border-white/20 text-white hover:bg-white/10 px-xl h-12 rounded-[12px] font-bold text-body-sm transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: FAQS ACCORDION */}
      <section className="mt-5xl px-lg max-w-[800px] mx-auto text-left">
        <h2 className="font-headline-h2 text-[32px] font-extrabold text-[#0A0A0A] tracking-tight mb-xl text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-md">
          {faqsList.map((faq, idx) => {
            const isOpen = hubActiveFaq === idx
            return (
              <div key={idx} className="border border-[#E9ECEF] rounded-[20px] overflow-hidden bg-white transition-all shadow-sm">
                <button
                  onClick={() => setHubActiveFaq(isOpen ? null : idx)}
                  className="w-full p-lg flex justify-between items-center hover:bg-[#F8F9FA] transition-colors text-left outline-none"
                >
                  <span className="font-bold text-body-sm text-[#0A0A0A]">{faq.q}</span>
                  <span className="material-symbols-outlined text-[#6C757D] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="p-lg pt-0 border-t border-[#E9ECEF] text-xs text-[#6C757D] leading-relaxed bg-[#F8F9FA]/30">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* POPULAR SERVICE BOOKING MODAL */}
      {showBookModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-lg">
          <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-md p-lg md:p-xl space-y-lg text-left shadow-2xl relative">
            <button
              onClick={() => setShowBookModal(false)}
              className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-xs">
              <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Book Service Request</h3>
              <p className="text-secondary text-xs">Service: <span className="font-bold text-[#0A0A0A]">{selectedService.name}</span> (Starting from {selectedService.price})</p>
            </div>

            {bookSubmitted ? (
              <div className="py-xl text-center space-y-md">
                <span className="material-symbols-outlined text-[54px] text-green-600 block">check_circle</span>
                <h4 className="font-bold text-body-md text-[#0A0A0A]">Booking Confirmed</h4>
                <p className="text-[#6C757D] text-xs leading-relaxed max-w-xs mx-auto">
                  We have registered your slot for {selectedService.name}. A verified partner will contact you shortly to coordinate.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Your Name</label>
                  <input
                    type="text"
                    value={bookForm.name}
                    onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                  <input
                    type="tel"
                    value={bookForm.phone}
                    onChange={(e) => setBookForm({ ...bookForm, phone: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    placeholder="e.g. +91 99999 88888"
                    required
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Preferred Date</label>
                  <input
                    type="date"
                    value={bookForm.date}
                    onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    required
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Specific Notes (Optional)</label>
                  <textarea
                    value={bookForm.notes}
                    onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0 h-16 resize-none"
                    placeholder="Provide any location instructions or layout details..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors shadow"
                >
                  Confirm Slot Booking
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DIRECT PRO QUOTE REQUEST MODAL */}
      {showDirectQuoteModal && selectedPro && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-lg">
          <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-md p-lg md:p-xl space-y-lg text-left shadow-2xl relative">
            <button
              onClick={() => setShowDirectQuoteModal(false)}
              className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-xs">
              <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Request Direct Quote</h3>
              <p className="text-secondary text-xs">Sending request to: <span className="font-bold text-[#0A0A0A]">{pros.find((p: any) => p.company === selectedPro.company)?.company || selectedPro.company}</span></p>
            </div>

            {directQuoteSubmitted ? (
              <div className="py-xl text-center space-y-md">
                <span className="material-symbols-outlined text-[54px] text-green-600 block">check_circle</span>
                <h4 className="font-bold text-body-md text-[#0A0A0A]">Request Dispatched</h4>
                <p className="text-[#6C757D] text-xs leading-relaxed max-w-xs mx-auto">
                  Your project parameters have been forwarded to {selectedPro.company}. They will review your timeline and contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDirectQuoteSubmit} className="space-y-md">
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Your Name</label>
                  <input
                    type="text"
                    value={directQuoteForm.name}
                    onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, name: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                  <input
                    type="tel"
                    value={directQuoteForm.phone}
                    onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, phone: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Budget (₹)</label>
                    <input
                      type="text"
                      value={directQuoteForm.budget}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, budget: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. ₹50,000"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Timeline</label>
                    <input
                      type="text"
                      value={directQuoteForm.timeline}
                      onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, timeline: e.target.value })}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. 2 Weeks"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Project Description</label>
                  <textarea
                    value={directQuoteForm.desc}
                    onChange={(e) => setDirectQuoteForm({ ...directQuoteForm, desc: e.target.value })}
                    className="bg-white border border-[#E9ECEF] rounded-lg p-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0 h-20 resize-none"
                    placeholder="Describe specific work items, dimensions or material requirements..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors shadow"
                >
                  Send Quote Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MOBILE FILTER DRAWER OVERLAY */}
      {hubShowMobileFilters && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="bg-white w-80 h-full p-xl overflow-y-auto flex flex-col justify-between shadow-2xl relative animate-slide-left">
            <button
              onClick={() => setHubShowMobileFilters(false)}
              className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="space-y-lg mt-md">
              <h3 className="font-bold text-body-md text-[#0A0A0A] flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                Filter Matrix
              </h3>
              <div className="space-y-md">
                {/* Location Select */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Location</label>
                  <select
                    value={hubCityFilter}
                    onChange={(e) => setHubCityFilter(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                  >
                    <option value="All">All Cities</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>

                {/* Service Category Select */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Category</label>
                  <select
                    value={hubCategoryFilter}
                    onChange={(e) => setHubCategoryFilter(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                  >
                    <option value="All">All Categories</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Maintenance">Home Maintenance</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Renovation">Construction &amp; Renovation</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Experience</label>
                  <select
                    value={hubExpFilter}
                    onChange={(e) => setHubExpFilter(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                  >
                    <option value="All">All Experience levels</option>
                    <option value="Under 10 Yrs">Under 10 Years</option>
                    <option value="10+ Yrs">10+ Years</option>
                  </select>
                </div>

                {/* Ratings Filter */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Rating</label>
                  <select
                    value={hubRatingFilter}
                    onChange={(e) => setHubRatingFilter(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                  >
                    <option value="All">All Ratings</option>
                    <option value="4.9★+">4.9★ &amp; Above</option>
                  </select>
                </div>

                {/* Budget Filter */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Starting Price Budget</label>
                  <select
                    value={hubBudgetFilter}
                    onChange={(e) => setHubBudgetFilter(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-9 px-md text-xs outline-none focus:border-[#FFC107] focus:ring-0 cursor-pointer w-full font-bold"
                  >
                    <option value="All">All budgets</option>
                    <option value="Low">Low (under ₹500)</option>
                    <option value="Medium">Medium (₹500 - ₹1000)</option>
                    <option value="High">High (over ₹1000)</option>
                  </select>
                </div>

                {/* Verified Toggle */}
                <div className="flex items-center justify-between pt-sm border-t border-[#E9ECEF] mt-sm">
                  <span className="text-xs text-[#0A0A0A] font-bold">ARCUS Verified Only</span>
                  <input
                    type="checkbox"
                    checked={hubVerifiedOnly}
                    onChange={(e) => setHubVerifiedOnly(e.target.checked)}
                    className="rounded text-[#FFC107] focus:ring-[#FFC107] h-4 w-4 border-[#E9ECEF]"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setHubShowMobileFilters(false)}
              className="w-full bg-[#FFC107] text-[#0A0A0A] font-bold h-11 rounded-[12px] hover:bg-[#fabd00] transition-colors mt-lg shadow"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E9ECEF] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 px-lg py-sm flex items-center justify-between lg:hidden h-[72px]">
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-[#6C757D] font-label-caps uppercase font-bold">ARCUS Marketplace</span>
          <span className="text-[14px] font-bold text-[#0A0A0A]">{sortedProfessionals.length} Pros Available</span>
        </div>
        <a
          href="#request-quotes"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('request-quotes')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="bg-[#FFC107] text-[#0A0A0A] px-xl h-11 rounded-[12px] font-bold text-xs hover:bg-[#fabd00] transition-colors flex items-center gap-xs shadow"
        >
          <span className="material-symbols-outlined text-[18px]">request_quote</span>
          Get Quotes
        </a>
      </div>
    </div>
  )
}

