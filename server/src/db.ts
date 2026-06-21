import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export interface RFQ {
  id?: string;
  timestamp?: string;
  category: string;
  quantity?: string;
  location?: string;
  timeline?: string;
  details?: string;
  name: string;
  phone: string;
}

export interface Booking {
  id?: string;
  timestamp?: string;
  serviceName: string;
  name: string;
  phone: string;
  date: string;
  notes?: string;
}

export interface DirectQuote {
  id?: string;
  timestamp?: string;
  contractorId: string;
  contractorCompany: string;
  name: string;
  phone: string;
  budget: string;
  timeline: string;
  desc?: string;
}

export interface Product {
  id?: string;
  categoryTitle: string;
  name: string;
  price: string;
  unit: string;
  rating: string;
  icon: string;
  link?: string;
  description?: string;
  images?: string[];
  priceTiers?: { min: number; max: number; price: number; save: number }[];
  specifications?: Record<string, string>;
  recommendedAccessories?: any[];
  reviews?: any[];
  subcategorySlug?: string;
  leafSlug?: string;
  stock?: number;
}

export interface User {
  id?: string;
  name: string;
  full_name?: string;
  fullName?: string;
  email: string;
  phone: string;
  phone_number?: string;
  phoneNumber?: string;
  passwordHash: string;
  password_hash?: string;
  passwordSalt: string;
  companyName?: string;
  role: 'Buyer' | 'Contractor' | 'Supplier' | 'Individual' | 'Business' | 'Professional' | 'Admin';
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  email_verified?: boolean;
  gstNumber?: string;
  serviceCategory?: string;
  experience?: string;
  city?: string;
  state?: string;
  website?: string;
  portfolioUrl?: string;
}

export interface OtpRecord {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  timestamp?: string;
  date?: string;
  products: string;
  status: 'Pending' | 'Awaiting Delivery' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  amount: string;
  items: { name: string; qty: number; price: number; image?: string }[];
  shippingAddress: string;
  billingAddress: string;
  gstNumber?: string;
  paymentMethod: string;
}

interface DbSchema {
  rfqs: RFQ[];
  bookings: Booking[];
  quotes: DirectQuote[];
  products: Product[];
  users: User[];
  orders?: Order[];
  otps?: OtpRecord[];
}

const defaultProducts: Product[] = [
  {
    categoryTitle: 'Plumbing',
    name: 'Astral CPVC Pipe',
    price: '₹280',
    unit: '/ Piece',
    rating: '4.8',
    icon: 'plumbing',
    link: '#/product/astral-cpvc-pipe',
    description: 'Astral CPVC PRO pipes and fittings are manufactured from a specialty plastic chemically known as Chlorinated Poly Vinyl Chloride (CPVC). This CPVC compound is designed for hot and cold water distribution systems. Easy installation with solvent cement, superior pressure rating, and long-term reliability in high-rise residential and commercial complexes.',
    images: [
      '/pdp_cpvc_pipe_main.png',
      '/pdp_cpvc_pipe_warehouse.png',
      '/pdp_cpvc_pipe_install.png',
      '/pdp_cpvc_pipe_fittings_group.png'
    ],
    priceTiers: [
      { min: 1, max: 50, price: 165, save: 0 },
      { min: 51, max: 100, price: 160, save: 3 },
      { min: 101, max: 500, price: 154, save: 7 },
      { min: 501, max: 999999, price: 145, save: 12 }
    ],
    specifications: {
      'Material': 'CPVC (Chlorinated Poly Vinyl Chloride)',
      'SDR Rating': 'SDR 11',
      'Standard': 'ASTM D2846 / IS 15778',
      'Pipe Size': '1 Inch (25mm)',
      'Wall Thickness': '2.3 mm',
      'Max Working Pressure': '25 Bar at 23°C',
      'Max Operating Temperature': '93°C',
      'Manufacturer': 'Astral Poly Technik Limited'
    },
    recommendedAccessories: [
      { id: 'elbow', name: 'Astral CPVC Elbow 90° (1")', category: 'Plumbing', price: 45, stock: 'In Stock', image: '/pdp_cpvc_elbow.png', multiplier: 2.0 },
      { id: 'tee', name: 'Astral CPVC Tee (1")', category: 'Plumbing', price: 58, stock: 'In Stock', image: '/pdp_cpvc_tee.png', multiplier: 1.0 }
    ],
    reviews: [
      { initials: 'MK', name: 'Mahesh K.', role: 'Site Manager, L&T', rating: 5, date: '2 weeks ago', comment: '"Best in class heat resistance for high-rise plumbing. The delivery from ARCUS was 4 hours faster than local distributors."' },
      { initials: 'AP', name: 'Amit P.', role: 'Procurement Specialist, Sobha Developers', rating: 5, date: '3 weeks ago', comment: '"Extremely consistent quality and perfect dimensions. The SDR 11 CPVC standard compliance is verified."' }
    ],
    subcategorySlug: 'pipes-fittings',
    leafSlug: 'cpvc-pipes'
  },
  {
    categoryTitle: 'Plumbing',
    name: 'Supreme Elbow 90°',
    price: '₹24',
    unit: '/ Unit',
    rating: '4.7',
    icon: 'plumbing',
    link: '#/product/supreme-elbow-90',
    description: 'Supreme Industries 90-degree PVC elbow is engineered for direction changes in plumbing systems. Made from premium lead-free uPVC, it provides leak-proof joints when paired with solvent cement. Suitable for both hot and cold water supply lines in residential, commercial, and industrial buildings.',
    images: [
      '/pdp_supreme_elbow.png',
      '/pdp_cpvc_elbow.png'
    ],
    priceTiers: [
      { min: 1, max: 100, price: 24, save: 0 },
      { min: 101, max: 500, price: 22, save: 8 },
      { min: 501, max: 999999, price: 19, save: 21 }
    ],
    specifications: {
      'Material': 'uPVC (Unplasticized Polyvinyl Chloride)',
      'Angle': '90 Degrees',
      'Size': '1 Inch (25mm)',
      'Standard': 'IS 4985',
      'Color': 'White',
      'Connection Type': 'Solvent Weld',
      'Working Pressure': '10 Bar',
      'Manufacturer': 'Supreme Industries Limited'
    },
    recommendedAccessories: [
      { id: 'cpvc-pipe', name: 'Astral CPVC Pipe 1"', category: 'Plumbing', price: 165, stock: 'In Stock', image: '/pdp_cpvc_pipe_main.png', multiplier: 1.0 }
    ],
    reviews: [
      { initials: 'PN', name: 'Pradeep N.', role: 'Plumbing Contractor, Bengaluru', rating: 5, date: '1 week ago', comment: '"Perfect fit every time. The dimensional accuracy is spot on."' }
    ],
    subcategorySlug: 'pipes-fittings',
    leafSlug: 'pipe-fittings'
  },
  {
    categoryTitle: 'Plumbing',
    name: 'Jaquar Basin Mixer',
    price: '₹3,450',
    unit: '/ Unit',
    rating: '4.9',
    icon: 'plumbing',
    link: '#/product/jaquar-basin-mixer',
    description: 'Jaquar single lever basin mixer tap from the Continental Plus series. Features a ceramic disc cartridge for smooth, precise temperature and flow control. The heavy-duty chrome finish is resistant to tarnishing and corrosion. Ideal for luxury residential bathrooms, commercial washrooms, and premium hotel projects.',
    images: [
      '/pdp_jaquar_basin_mixer.png'
    ],
    priceTiers: [
      { min: 1, max: 10, price: 3450, save: 0 },
      { min: 11, max: 50, price: 3200, save: 7 },
      { min: 51, max: 999999, price: 2950, save: 14 }
    ],
    specifications: {
      'Brand': 'Jaquar',
      'Series': 'Continental Plus',
      'Finish': 'Chrome Plated',
      'Body Material': 'Brass',
      'Cartridge': 'Ceramic Disc (40mm)',
      'Flow Rate': '8 L/min',
      'Manufacturer': 'Jaquar Group'
    },
    recommendedAccessories: [
      { id: 'basin-waste', name: 'Pop-Up Basin Waste 32mm', category: 'Plumbing', price: 280, stock: 'In Stock', image: '/pdp_supreme_elbow.png', multiplier: 1.0 }
    ],
    reviews: [
      { initials: 'AJ', name: 'Ankit J.', role: 'Interior Designer, Bengaluru', rating: 5, date: '2 weeks ago', comment: '"Exceptional build quality. The smooth single-lever action is a cut above the competition."' }
    ],
    subcategorySlug: 'bathroom-fittings',
    leafSlug: 'faucets-taps'
  },
  {
    categoryTitle: 'Electrical',
    name: 'Finolex Wire',
    price: '₹1,250',
    unit: '/ Coil',
    rating: '4.8',
    icon: 'electrical_services',
    link: '#/product/finolex-wire',
    description: 'Finolex 1.5 sq mm copper conductor PVC insulated electrical wire, designed for reliable internal wiring of residential and commercial buildings. The wire features high conductivity electrolytic copper conductors and flame-retardant PVC insulation compliant with IS 694:2010.',
    images: [
      '/pdp_finolex_wire.png'
    ],
    priceTiers: [
      { min: 1, max: 10, price: 1250, save: 0 },
      { min: 11, max: 50, price: 1180, save: 6 },
      { min: 51, max: 999999, price: 1100, save: 12 }
    ],
    specifications: {
      'Conductor': 'Electrolytic Copper',
      'Cross Section': '1.5 sq mm',
      'Insulation': 'PVC (Flame Retardant)',
      'Standard': 'IS 694:2010',
      'Coil Length': '90 meters',
      'Voltage Rating': '1100V AC',
      'Manufacturer': 'Finolex Cables Ltd.'
    },
    recommendedAccessories: [
      { id: 'mcb', name: 'Havells MCB 16A SP', category: 'Electrical', price: 850, stock: 'In Stock', image: '/pdp_havells_mcb.png', multiplier: 0.1 }
    ],
    reviews: [
      { initials: 'GN', name: 'Ganesh N.', role: 'Licensed Electrician, Chennai', rating: 5, date: '1 week ago', comment: '"Finolex is the only wire I use. The insulation thickness is consistent."' }
    ],
    subcategorySlug: 'wires-cables',
    leafSlug: 'copper-wires'
  },
  {
    categoryTitle: 'Electrical',
    name: 'Havells MCB',
    price: '₹850',
    unit: '/ Unit',
    rating: '4.9',
    icon: 'electrical_services',
    link: '#/product/havells-mcb',
    description: 'Havells 16A Single Pole Miniature Circuit Breaker (MCB) from the Crabtree range. Provides thermal-magnetic protection against overload and short-circuit conditions. Features a quick trip mechanism, high breaking capacity, and DIN rail mounting for panel board installation.',
    images: [
      '/pdp_havells_mcb.png'
    ],
    priceTiers: [
      { min: 1, max: 20, price: 850, save: 0 },
      { min: 21, max: 100, price: 780, save: 8 },
      { min: 101, max: 999999, price: 720, save: 15 }
    ],
    specifications: {
      'Brand': 'Havells',
      'Type': 'Miniature Circuit Breaker (MCB)',
      'Current Rating': '16A',
      'Poles': 'Single Pole (SP)',
      'Breaking Capacity': '10 kA',
      'Standard': 'IS/IEC 60898-1',
      'Manufacturer': 'Havells India Ltd.'
    },
    recommendedAccessories: [
      { id: 'wire', name: 'Finolex Wire 1.5 sq mm (90m)', category: 'Electrical', price: 1250, stock: 'In Stock', image: '/pdp_finolex_wire.png', multiplier: 0.2 }
    ],
    reviews: [
      { initials: 'VM', name: 'Venkat M.', role: 'Electrical Engineer, Infosys Campus', rating: 5, date: '2 weeks ago', comment: '"Havells MCBs are the backbone of our panel installations."' }
    ],
    subcategorySlug: 'protection-devices',
    leafSlug: 'mcbs'
  },
  {
    categoryTitle: 'Electrical',
    name: 'Anchor Switch',
    price: '₹45',
    unit: '/ Unit',
    rating: '4.7',
    icon: 'electrical_services',
    link: '#/product/anchor-switch',
    description: 'Panasonic Anchor Roma 6A 1-way modular electrical switch with a high-gloss white finish. Features a smooth click mechanism rated for 100,000 operation cycles. Designed to fit into standard modular boxes.',
    images: [
      '/pdp_anchor_switch.png'
    ],
    priceTiers: [
      { min: 1, max: 100, price: 45, save: 0 },
      { min: 101, max: 500, price: 40, save: 11 },
      { min: 501, max: 999999, price: 35, save: 22 }
    ],
    specifications: {
      'Brand': 'Anchor by Panasonic',
      'Series': 'Roma',
      'Type': '1-Way Switch',
      'Current Rating': '6A',
      'Voltage Rating': '250V AC',
      'Standard': 'IS 3854',
      'Manufacturer': 'Panasonic Life Solutions India'
    },
    recommendedAccessories: [
      { id: 'wire', name: 'Finolex Wire 1.5 sq mm (90m)', category: 'Electrical', price: 1250, stock: 'In Stock', image: '/pdp_finolex_wire.png', multiplier: 0.05 }
    ],
    reviews: [
      { initials: 'AK', name: 'Arvind K.', role: 'Interior Contractor, Pune', rating: 5, date: '5 days ago', comment: '"Anchor Roma switches are our go-to for all modular wiring projects."' }
    ],
    subcategorySlug: 'switches-sockets',
    leafSlug: 'modular-switches'
  },
  {
    categoryTitle: 'Cement',
    name: 'UltraTech Cement',
    price: '₹450',
    unit: '/ Bag',
    rating: '4.8',
    icon: 'inventory_2',
    link: '#/product/ultratech-cement',
    description: "UltraTech OPC 53 Grade Cement — India's most trusted brand for structural concrete. Manufactured with clinker sourced from quality limestone deposits and ground to ultra-fine particle size for higher early strength development.",
    images: [
      '/pdp_ultratech_cement.png'
    ],
    priceTiers: [
      { min: 1, max: 50, price: 450, save: 0 },
      { min: 51, max: 200, price: 430, save: 4 },
      { min: 201, max: 999999, price: 410, save: 9 }
    ],
    specifications: {
      'Grade': 'OPC 53',
      'Weight': '50 kg / bag',
      'Standard': 'IS 12269:2013',
      '3-Day Strength': '≥ 27 N/mm²',
      '28-Day Strength': '≥ 53 N/mm²',
      'Manufacturer': 'UltraTech Cement Ltd.'
    },
    recommendedAccessories: [
      { id: 'sand', name: 'M-Sand (Manufactured Sand) 1 Ton', category: 'Cement', price: 1800, stock: 'In Stock', image: '/pdp_ultratech_cement.png', multiplier: 2.0 }
    ],
    reviews: [
      { initials: 'CK', name: 'Chandrashekhar K.', role: 'Structural Engineer, L&T Construction', rating: 5, date: '1 week ago', comment: '"UltraTech OPC 53 consistently meets the 53 N/mm² target at 28 days."' }
    ],
    subcategorySlug: 'cement-opc-ppc',
    leafSlug: 'opc-53'
  },
  {
    categoryTitle: 'Cement',
    name: 'Ambuja Cement',
    price: '₹445',
    unit: '/ Bag',
    rating: '4.7',
    icon: 'inventory_2',
    link: '#/product/ambuja-cement',
    description: 'Ambuja Plus Portland Pozzolana Cement (PPC) with superior water-resistance properties. Engineered with fly ash addition that densifies the concrete matrix, significantly reducing permeability and enhancing long-term durability.',
    images: [
      '/pdp_ambuja_cement.png'
    ],
    priceTiers: [
      { min: 1, max: 50, price: 445, save: 0 },
      { min: 51, max: 200, price: 425, save: 4 },
      { min: 201, max: 999999, price: 405, save: 9 }
    ],
    specifications: {
      'Grade': 'PPC (Portland Pozzolana Cement)',
      'Weight': '50 kg / bag',
      'Standard': 'IS 1489 (Part 1):1991',
      'Fly Ash Content': '15–35%',
      'Manufacturer': 'Ambuja Cements Ltd. (Holcim Group)'
    },
    recommendedAccessories: [
      { id: 'sand', name: 'River Sand (Fine Aggregate) 1 Ton', category: 'Cement', price: 1600, stock: 'In Stock', image: '/pdp_ultratech_cement.png', multiplier: 3.0 }
    ],
    reviews: [
      { initials: 'JP', name: 'Jayesh P.', role: 'Civil Engineer, Surat', rating: 5, date: '2 weeks ago', comment: '"Ambuja Plus is our default for coastal projects."' }
    ],
    subcategorySlug: 'cement-opc-ppc',
    leafSlug: 'ppc'
  },
  {
    categoryTitle: 'Cement',
    name: 'ACC Cement',
    price: '₹440',
    unit: '/ Bag',
    rating: '4.6',
    icon: 'inventory_2',
    link: '#/product/acc-cement',
    description: 'ACC Gold OPC 43 Grade Cement — a proven, reliable choice for general construction applications including plastering, brickwork, flooring, and non-structural concrete.',
    images: [
      '/pdp_acc_cement.png'
    ],
    priceTiers: [
      { min: 1, max: 50, price: 440, save: 0 },
      { min: 51, max: 200, price: 420, save: 5 },
      { min: 201, max: 999999, price: 400, save: 9 }
    ],
    specifications: {
      'Grade': 'OPC 43',
      'Weight': '50 kg / bag',
      'Standard': 'IS 8112:2013',
      '28-Day Strength': '≥ 43 N/mm²',
      'Manufacturer': 'ACC Limited (Holcim Group)'
    },
    recommendedAccessories: [
      { id: 'sand', name: 'M-Sand (Plastering Grade) 1 Ton', category: 'Cement', price: 1600, stock: 'In Stock', image: '/pdp_ultratech_cement.png', multiplier: 4.0 }
    ],
    reviews: [
      { initials: 'BS', name: 'Bhupesh S.', role: 'Mason Contractor, Indore', rating: 5, date: '2 weeks ago', comment: '"ACC Gold 43 is perfect for plastering and brickwork."' }
    ],
    subcategorySlug: 'cement-opc-ppc',
    leafSlug: 'opc-43'
  },
  {
    categoryTitle: 'Steel',
    name: 'Tata Tiscon SD TMT Rebars',
    price: '₹68,500',
    unit: '/ Ton',
    rating: '4.9',
    icon: 'construction',
    link: '#/product/tata-tiscon-tmt',
    description: 'Tata Tiscon SD (Super Ductile) TMT Rebars are high-strength reinforcement bars designed for high-stress zones and earthquake-prone structures. Manufactured with advanced Thermo-Mechanical Treatment, offering superior bond strength, weldability, and bending capability.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q'],
    priceTiers: [
      { min: 1, max: 10, price: 68500, save: 0 },
      { min: 11, max: 50, price: 66000, save: 3 },
      { min: 51, max: 999999, price: 64000, save: 6 }
    ],
    specifications: {
      'Grade': 'Fe 500D / SD',
      'Standard': 'IS 1786',
      'Diameter': '12 mm',
      'Manufacturer': 'Tata Steel Limited'
    },
    subcategorySlug: 'tmt-bars',
    leafSlug: 'sd-tmt'
  },
  {
    categoryTitle: 'Steel',
    name: 'JSW Neosteel TMT Bar',
    price: '₹67,000',
    unit: '/ Ton',
    rating: '4.8',
    icon: 'construction',
    link: '#/product/jsw-neosteel-tmt',
    description: 'JSW Neosteel TMT Bars are high-strength thermo-mechanically treated steel reinforcement bars. They possess excellent bond strength, ductility, and high fatigue resistance, making them ideal for heavy commercial and infrastructure projects.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q'],
    priceTiers: [
      { min: 1, max: 10, price: 67000, save: 0 },
      { min: 11, max: 50, price: 65000, save: 3 },
      { min: 51, max: 999999, price: 63000, save: 6 }
    ],
    specifications: {
      'Grade': 'Fe 500D',
      'Standard': 'IS 1786',
      'Diameter': '10 mm',
      'Manufacturer': 'JSW Steel Limited'
    },
    subcategorySlug: 'tmt-bars',
    leafSlug: 'fe-500d'
  },
  {
    categoryTitle: 'Steel',
    name: 'SAIL TMT HCR Rebars',
    price: '₹66,000',
    unit: '/ Ton',
    rating: '4.7',
    icon: 'construction',
    link: '#/product/sail-tmt-rebar',
    description: 'SAIL TMT HCR (High Corrosion Resistant) Rebars are specifically formulated steel reinforcement bars with alloying elements like copper, chromium, and phosphorus to resist corrosion in marine, industrial, and highly humid environments.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q'],
    priceTiers: [
      { min: 1, max: 10, price: 66000, save: 0 },
      { min: 11, max: 50, price: 64000, save: 3 },
      { min: 51, max: 999999, price: 62000, save: 6 }
    ],
    specifications: {
      'Grade': 'Fe 550D / HCR',
      'Standard': 'IS 1786',
      'Diameter': '16 mm',
      'Manufacturer': 'Steel Authority of India Limited'
    },
    subcategorySlug: 'tmt-bars',
    leafSlug: 'fe-550d'
  },
  {
    categoryTitle: 'Paints',
    name: 'Asian Paints Apex Ultima',
    price: '₹5,400',
    unit: '/ Bucket',
    rating: '4.8',
    icon: 'format_paint',
    link: '#/product/asian-paints-apex',
    description: 'Asian Paints Apex Ultima is a premium water-based exterior wall finish with advanced silicone additives. It features high dirt pick-up resistance and anti-algal protection, ensuring exterior walls stay clean and vibrant for years.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 5, price: 5400, save: 0 },
      { min: 6, max: 20, price: 5100, save: 5 },
      { min: 21, max: 999999, price: 4850, save: 10 }
    ],
    specifications: {
      'Type': 'Exterior Emulsion',
      'Volume': '20 Liters',
      'Finish': 'Semi-Gloss',
      'Manufacturer': 'Asian Paints Limited'
    },
    subcategorySlug: 'interior-exterior-paints',
    leafSlug: 'exterior-emulsion'
  },
  {
    categoryTitle: 'Paints',
    name: 'Dr. Fixit Waterproofing',
    price: '₹1,200',
    unit: '/ Can',
    rating: '4.7',
    icon: 'format_paint',
    link: '#/product/dr-fixit-waterproof',
    description: 'Dr. Fixit Super Latex is a styrene-butadiene rubber (SBR) based liquid waterproofing and bonding agent for concrete and plaster repairs. It improves bonding strength and waterproofing capability in bathrooms, terraces, and external walls.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 10, price: 1200, save: 0 },
      { min: 11, max: 50, price: 1120, save: 6 },
      { min: 51, max: 999999, price: 1050, save: 12 }
    ],
    specifications: {
      'Type': 'SBR Latex Polymer',
      'Volume': '5 Liters',
      'Usage': 'Waterproofing / Bonding',
      'Manufacturer': 'Pidilite Industries Limited'
    },
    subcategorySlug: 'waterproofing',
    leafSlug: 'liquid-membrane'
  },
  {
    categoryTitle: 'Paints',
    name: 'Fevicol SH Adhesive',
    price: '₹280',
    unit: '/ Kg',
    rating: '4.9',
    icon: 'format_paint',
    link: '#/product/fevicol-sh-adhesive',
    description: 'Fevicol SH is a synthetic resin adhesive for woodwork and furniture assembly. It provides high bonding strength, heat resistance, and long-term durability, making it the most trusted wood adhesive in India.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 20, price: 280, save: 0 },
      { min: 21, max: 100, price: 260, save: 7 },
      { min: 101, max: 999999, price: 240, save: 14 }
    ],
    specifications: {
      'Type': 'Synthetic Resin Adhesive',
      'Pack Size': '1 Kg',
      'Drying Time': '24 Hours',
      'Manufacturer': 'Pidilite Industries Limited'
    },
    subcategorySlug: 'adhesives-grouts',
    leafSlug: 'wood-adhesives'
  },
  {
    categoryTitle: 'Tiles',
    name: 'Kajaria Vitrified Tiles',
    price: '₹65',
    unit: '/ Sq Ft',
    rating: '4.8',
    icon: 'layers',
    link: '#/product/kajaria-vitrified-tiles',
    description: 'Kajaria double charged vitrified floor tiles with high durability and polished surface. Extremely resistant to stains, heavy foot traffic, and wear, suitable for living rooms and commercial flooring.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 500, price: 65, save: 0 },
      { min: 501, max: 2000, price: 61, save: 6 },
      { min: 2001, max: 999999, price: 57, save: 12 }
    ],
    specifications: {
      'Type': 'Double Charged Vitrified',
      'Size': '600x600 mm (2x2 ft)',
      'Finish': 'Polished Glossy',
      'Manufacturer': 'Kajaria Ceramics Limited'
    },
    subcategorySlug: 'vitrified-ceramic',
    leafSlug: 'double-charged'
  },
  {
    categoryTitle: 'Tiles',
    name: 'Premium Italian White Marble',
    price: '₹350',
    unit: '/ Sq Ft',
    rating: '4.9',
    icon: 'layers',
    link: '#/product/italian-white-marble',
    description: 'Imported Italian white marble slabs with exquisite grey veining. Highly polished for a luxurious reflective finish, ideal for high-end residential lobbies and luxury living room floors.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 100, price: 350, save: 0 },
      { min: 101, max: 500, price: 330, save: 5 },
      { min: 501, max: 999999, price: 310, save: 11 }
    ],
    specifications: {
      'Type': 'Imported Natural Marble',
      'Thickness': '18 mm',
      'Origin': 'Italy',
      'Finish': 'Polished'
    },
    subcategorySlug: 'granite-marble',
    leafSlug: 'italian-marble'
  },
  {
    categoryTitle: 'Tiles',
    name: 'Welspun Vinyl Flooring',
    price: '₹85',
    unit: '/ Sq Ft',
    rating: '4.7',
    icon: 'layers',
    link: '#/product/welspun-vinyl-flooring',
    description: 'Welspun Luxury Vinyl Tiles (LVT) with a realistic natural wood texture. Features water resistance, sound absorption, and easy click-lock installation, suitable for modern offices and bedrooms.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 200, price: 85, save: 0 },
      { min: 201, max: 1000, price: 80, save: 5 },
      { min: 1001, max: 999999, price: 75, save: 11 }
    ],
    specifications: {
      'Type': 'Luxury Vinyl Tiles (LVT)',
      'Thickness': '4 mm',
      'Wear Layer': '0.3 mm',
      'Manufacturer': 'Welspun Flooring Limited'
    },
    subcategorySlug: 'wooden-vinyl',
    leafSlug: 'vinyl-tiles'
  },
  {
    categoryTitle: 'Hardware',
    name: 'Godrej Mortise Door Lock',
    price: '₹2,450',
    unit: '/ Set',
    rating: '4.8',
    icon: 'handyman',
    link: '#/product/godrej-door-lock',
    description: 'Godrej premium mortise door lock set with double-throw brass bolt and high-security cylinder. Features corrosion-resistant handles and key security, providing complete safety for main wooden doors.',
    images: ['https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858'],
    priceTiers: [
      { min: 1, max: 10, price: 2450, save: 0 },
      { min: 11, max: 50, price: 2280, save: 6 },
      { min: 51, max: 999999, price: 2150, save: 12 }
    ],
    specifications: {
      'Type': 'Mortise Lock Set',
      'Material': 'Brass & Steel',
      'Keys Included': '3 Keys',
      'Manufacturer': 'Godrej & Boyce Mfg. Co. Ltd.'
    },
    subcategorySlug: 'fasteners-screws',
    leafSlug: 'anchor-bolts'
  },
  {
    categoryTitle: 'Hardware',
    name: 'Bosch Power Tool Drill Kit',
    price: '₹5,800',
    unit: '/ Kit',
    rating: '4.9',
    icon: 'handyman',
    link: '#/product/bosch-drill-kit',
    description: 'Bosch GSB 13 RE impact drill kit with 100 accessories. Features electronic speed control and hammer drilling mode for masonry, wood, and steel, making it the perfect professional tool kit.',
    images: ['https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858'],
    priceTiers: [
      { min: 1, max: 5, price: 5800, save: 0 },
      { min: 6, max: 20, price: 5500, save: 5 },
      { min: 21, max: 999999, price: 5200, save: 10 }
    ],
    specifications: {
      'Power Input': '600W',
      'Chuck Capacity': '13 mm',
      'Drill Speed': '0-2800 RPM',
      'Manufacturer': 'Bosch Power Tools'
    },
    subcategorySlug: 'hand-power-tools',
    leafSlug: 'impact-drills'
  },
  {
    categoryTitle: 'Hardware',
    name: 'Karam Safety Harness',
    price: '₹1,150',
    unit: '/ Piece',
    rating: '4.7',
    icon: 'handyman',
    link: '#/product/karam-safety-harness',
    description: 'Karam full body safety harness with dorsal D-ring and adjustable chest, shoulder, and thigh straps. Certified to IS 3521, providing fall protection for work at heights.',
    images: ['https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858'],
    priceTiers: [
      { min: 1, max: 10, price: 1150, save: 0 },
      { min: 11, max: 50, price: 1080, save: 6 },
      { min: 51, max: 999999, price: 1000, save: 13 }
    ],
    specifications: {
      'Standard': 'IS 3521:1999',
      'Material': 'Polyester Webbing',
      'Weight Capacity': '100 Kg',
      'Manufacturer': 'Karam Safety Private Limited'
    },
    subcategorySlug: 'safety-equipment',
    leafSlug: 'safety-harnesses'
  },
  {
    categoryTitle: 'Building',
    name: 'Red Clay Wirecut Bricks',
    price: '₹8',
    unit: '/ Piece',
    rating: '4.6',
    icon: 'home_work',
    link: '#/product/red-clay-bricks',
    description: 'Premium wirecut red clay bricks with smooth faces and sharp edges. Offering high compressive strength and low water absorption, ideal for load-bearing masonry wall construction.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 1000, price: 8, save: 0 },
      { min: 1001, max: 5000, price: 7.5, save: 6 },
      { min: 5001, max: 999999, price: 7.0, save: 12 }
    ],
    specifications: {
      'Type': 'Wirecut Red Clay Brick',
      'Size': '9x4x3 inches',
      'Compressive Strength': '≥ 10 N/mm²',
      'Water Absorption': '≤ 15%'
    },
    subcategorySlug: 'bricks-blocks',
    leafSlug: 'red-bricks'
  },
  {
    categoryTitle: 'Building',
    name: 'Century Plywood 19mm BWR',
    price: '₹120',
    unit: '/ Sq Ft',
    rating: '4.8',
    icon: 'home_work',
    link: '#/product/century-plywood-19mm',
    description: 'CenturyPly Sainik BWR (Boiling Water Resistant) plywood with high structural integrity and resistance to termites and borers. Suitable for kitchen cabinets, wardrobes, and high-moisture indoor applications.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 100, price: 120, save: 0 },
      { min: 101, max: 500, price: 112, save: 6 },
      { min: 501, max: 999999, price: 105, save: 12 }
    ],
    specifications: {
      'Thickness': '19 mm',
      'Grade': 'BWR (Boiling Water Resistant)',
      'Standard': 'IS 303',
      'Manufacturer': 'Century Plyboards (India) Limited'
    },
    subcategorySlug: 'plywood-laminates',
    leafSlug: 'commercial-plywood'
  },
  {
    categoryTitle: 'Building',
    name: 'Tata Bluescope Roofing Sheet',
    price: '₹340',
    unit: '/ Meter',
    rating: '4.7',
    icon: 'home_work',
    link: '#/product/tata-bluescope-roofing',
    description: 'Tata Bluescope color coated Zincalume steel roofing sheets. Features high corrosion resistance, UV stability, and structural strength, ideal for commercial sheds and residential roofs.',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso'],
    priceTiers: [
      { min: 1, max: 50, price: 340, save: 0 },
      { min: 51, max: 200, price: 320, save: 5 },
      { min: 201, max: 999999, price: 300, save: 11 }
    ],
    specifications: {
      'Material': 'Zincalume Steel',
      'Thickness': '0.50 mm',
      'Coating Standard': 'AS 1397',
      'Manufacturer': 'Tata BlueScope Steel Limited'
    },
    subcategorySlug: 'roofing-doors',
    leafSlug: 'steel-roofing'
  }
];

let pgPool: Pool | null = null;
let usePostgres = false;

// Initialize JSON database as fallback
function initJsonDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DbSchema = {
      rfqs: [],
      bookings: [],
      quotes: [],
      products: [],
      users: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.products) {
        parsed.products = [];
        updated = true;
      }
      if (!parsed.users) {
        parsed.users = [];
        updated = true;
      }
      if (!parsed.orders) {
        parsed.orders = [];
        updated = true;
      }
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    } catch {
      // Ignore error when parsing json db fallback
    }
  }
}

async function initDb() {
  initJsonDb();

  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    console.log('PostgreSQL connection string detected. Connecting to database...');
    try {
      pgPool = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') 
          ? { rejectUnauthorized: false } 
          : undefined,
      });

      // Verify connection by creating tables
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS rfqs (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          category VARCHAR(100),
          quantity VARCHAR(100),
          location VARCHAR(100),
          timeline VARCHAR(100),
          details TEXT
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          service_name VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          date VARCHAR(50) NOT NULL,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS quotes (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          contractor_id VARCHAR(100) NOT NULL,
          contractor_company VARCHAR(150) NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          budget VARCHAR(50) NOT NULL,
          timeline VARCHAR(50) NOT NULL,
          description TEXT
        );

        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(50) PRIMARY KEY,
          category_title VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          price VARCHAR(50) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          rating VARCHAR(10) NOT NULL,
          icon VARCHAR(50) NOT NULL,
          link VARCHAR(150),
          description TEXT,
          images JSONB,
          price_tiers JSONB,
          specifications JSONB,
          recommended_accessories JSONB,
          reviews JSONB,
          subcategory_slug VARCHAR(100),
          leaf_slug VARCHAR(100),
          stock INTEGER DEFAULT 100
        );

        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(100) NOT NULL,
          full_name VARCHAR(100),
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          phone_number VARCHAR(50),
          password_hash VARCHAR(256) NOT NULL,
          password_salt VARCHAR(256) NOT NULL,
          company_name VARCHAR(150),
          role VARCHAR(50) NOT NULL,
          email_verified BOOLEAN DEFAULT FALSE,
          gst_number VARCHAR(50),
          service_category VARCHAR(100),
          experience VARCHAR(50),
          city VARCHAR(100),
          state VARCHAR(100),
          website VARCHAR(150),
          portfolio_url VARCHAR(150)
        );

        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          date VARCHAR(50),
          products TEXT NOT NULL,
          status VARCHAR(50) NOT NULL,
          amount VARCHAR(50) NOT NULL,
          items JSONB NOT NULL,
          shipping_address TEXT NOT NULL,
          billing_address TEXT NOT NULL,
          gst_number VARCHAR(50),
          payment_method VARCHAR(50) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS otps (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          otp_hash VARCHAR(256) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Ensure new verification and profile columns exist on users
      await pgPool.query(`
        ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
          ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
          ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `);

      // Run queries to check/add columns to the users table for B2B/B2C/Professional fields
      const checkUserCols = await pgPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='gst_number'
      `);
      if (checkUserCols.rows.length === 0) {
        console.log('🔄 Altering users table to add new B2B/B2C/Professional columns...');
        await pgPool.query(`
          ALTER TABLE users 
            ADD COLUMN gst_number VARCHAR(50),
            ADD COLUMN service_category VARCHAR(100),
            ADD COLUMN experience VARCHAR(50),
            ADD COLUMN city VARCHAR(100),
            ADD COLUMN state VARCHAR(100),
            ADD COLUMN website VARCHAR(150),
            ADD COLUMN portfolio_url VARCHAR(150);
        `);
      }

      // Run queries to check/add columns to the products table for backward compatibility
      const checkColsRes = await pgPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='products' AND column_name='description'
      `);
      if (checkColsRes.rows.length === 0) {
        console.log('🔄 Altering products table to add detailed B2B columns...');
        await pgPool.query(`
          ALTER TABLE products 
            ADD COLUMN description TEXT,
            ADD COLUMN images JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN price_tiers JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb,
            ADD COLUMN recommended_accessories JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN reviews JSONB DEFAULT '[]'::jsonb;
        `);
      }

      // Check subcategory columns
      const checkSubColsRes = await pgPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='products' AND column_name='subcategory_slug'
      `);
      if (checkSubColsRes.rows.length === 0) {
        console.log('🔄 Altering products table to add subcategory columns...');
        await pgPool.query(`
          ALTER TABLE products 
            ADD COLUMN subcategory_slug VARCHAR(100),
            ADD COLUMN leaf_slug VARCHAR(100);
        `);
      }

      // Check stock column
      const checkStockColRes = await pgPool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='products' AND column_name='stock'
      `);
      if (checkStockColRes.rows.length === 0) {
        console.log('🔄 Altering products table to add stock column...');
        await pgPool.query(`
          ALTER TABLE products 
            ADD COLUMN stock INTEGER DEFAULT 100;
        `);
      }

      // Validation & data integrity constraints
      console.log('🔄 Applying validation constraints...');
      // Drop wrong link index on users if it was mistakenly created there
      await pgPool.query(`
        DROP INDEX IF EXISTS products_link_unique;
      `);
      await pgPool.query(`
        -- Unique phone number for users
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_unique') THEN
            ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
          END IF;
        END $$;

        -- Unique GST number for users (partial index: only non-null, non-empty)
        CREATE UNIQUE INDEX IF NOT EXISTS users_gst_unique
          ON users (UPPER(gst_number))
          WHERE gst_number IS NOT NULL AND gst_number != '';

        -- Unique slug for products (on products table!)
        CREATE UNIQUE INDEX IF NOT EXISTS products_link_unique
          ON products (link)
          WHERE link IS NOT NULL AND link != '';

        -- Stock check constraint (non-negative)
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_check') THEN
            ALTER TABLE products ADD CONSTRAINT products_stock_check CHECK (stock >= 0);
          END IF;
        END $$;

        -- Rating check constraint (between 0 and 5)
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rating_check') THEN
            ALTER TABLE products ADD CONSTRAINT products_rating_check CHECK (rating::numeric >= 0.0 AND rating::numeric <= 5.0);
          END IF;
        END $$;

        -- Price check constraint (starts with ₹)
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_check') THEN
            ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price LIKE '₹%');
          END IF;
        END $$;
      `);

      usePostgres = true;
      console.log('✅ PostgreSQL database connected & tables initialized successfully.');

      // Seed products if table is empty or outdated
      const prodCountRes = await pgPool.query('SELECT COUNT(*) FROM products');
      const prodCount = parseInt(prodCountRes.rows[0].count, 10);
      if (prodCount < defaultProducts.length) {
        console.log('🌱 Seeding initial products into PostgreSQL (cleaning old ones)...');
        await pgPool.query('DELETE FROM products');
        for (const p of defaultProducts) {
          const id = p.link ? p.link.split('/').pop()! : `prod_${Math.random().toString(36).substring(2, 11)}`;
          await pgPool.query(`
            INSERT INTO products (id, category_title, name, price, unit, rating, icon, link, description, images, price_tiers, specifications, recommended_accessories, reviews, subcategory_slug, leaf_slug, stock)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          `, [
            id,
            p.categoryTitle,
            p.name,
            p.price,
            p.unit,
            p.rating,
            p.icon,
            p.link || null,
            p.description || null,
            JSON.stringify(p.images || []),
            JSON.stringify(p.priceTiers || []),
            JSON.stringify(p.specifications || {}),
            JSON.stringify(p.recommendedAccessories || []),
            JSON.stringify(p.reviews || []),
            p.subcategorySlug || null,
            p.leafSlug || null,
            p.stock !== undefined ? p.stock : 100
          ]);
        }
        console.log(`✅ Seeded ${defaultProducts.length} products successfully.`);
      }
    } catch (err: any) {
      console.warn('❌ Failed to connect to PostgreSQL. Falling back to local JSON database.', err.message);
      usePostgres = false;
    }
  } else {
    console.log('ℹ️ No DATABASE_URL environment variable found. Operating in local JSON fallback mode.');
    usePostgres = false;
  }

  // Seed JSON file if empty or outdated
  if (!usePostgres) {
    try {
      const db = await readJsonDb();
      const needsReseed = !db.products || db.products.length < defaultProducts.length || db.products.some(p => !p.description);
      if (needsReseed) {
        console.log('🌱 Seeding initial detailed products into local JSON database...');
        db.products = defaultProducts.map((p, i) => {
          const id = p.link ? p.link.split('/').pop()! : `prod_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
          return {
            ...p,
            id
          };
        });
        await writeJsonDb(db);
        console.log(`✅ Seeded ${defaultProducts.length} products with details into local JSON database successfully.`);
      }
    } catch (e: any) {
      console.warn('❌ Error seeding local JSON database:', e.message);
    }
  }
}

// Call initDb on load
initDb();

async function readJsonDb(): Promise<DbSchema> {
  const data = await fs.promises.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeJsonDb(data: DbSchema): Promise<void> {
  await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function addRfq(rfq: RFQ): Promise<RFQ> {
  const generatedId = `rfq_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO rfqs (id, timestamp, name, phone, category, quantity, location, timeline, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      generatedId,
      timestamp,
      rfq.name,
      rfq.phone,
      rfq.category,
      rfq.quantity || null,
      rfq.location || null,
      rfq.timeline || null,
      rfq.details || null,
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      name: row.name,
      phone: row.phone,
      category: row.category,
      quantity: row.quantity,
      location: row.location,
      timeline: row.timeline,
      details: row.details,
    };
  } else {
    const db = await readJsonDb();
    const newRfq = {
      ...rfq,
      id: generatedId,
      timestamp
    };
    db.rfqs.push(newRfq);
    await writeJsonDb(db);
    return newRfq;
  }
}

export async function addBooking(booking: Booking): Promise<Booking> {
  const generatedId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO bookings (id, timestamp, service_name, name, phone, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      generatedId,
      timestamp,
      booking.serviceName,
      booking.name,
      booking.phone,
      booking.date,
      booking.notes || null,
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      serviceName: row.service_name,
      name: row.name,
      phone: row.phone,
      date: row.date,
      notes: row.notes,
    };
  } else {
    const db = await readJsonDb();
    const newBooking = {
      ...booking,
      id: generatedId,
      timestamp
    };
    db.bookings.push(newBooking);
    await writeJsonDb(db);
    return newBooking;
  }
}

export async function addQuote(quote: DirectQuote): Promise<DirectQuote> {
  const generatedId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const timestamp = new Date().toISOString();

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO quotes (id, timestamp, contractor_id, contractor_company, name, phone, budget, timeline, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      generatedId,
      timestamp,
      quote.contractorId,
      quote.contractorCompany,
      quote.name,
      quote.phone,
      quote.budget,
      quote.timeline,
      quote.desc || null,
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      contractorId: row.contractor_id,
      contractorCompany: row.contractor_company,
      name: row.name,
      phone: row.phone,
      budget: row.budget,
      timeline: row.timeline,
      desc: row.description,
    };
  } else {
    const db = await readJsonDb();
    const newQuote = {
      ...quote,
      id: generatedId,
      timestamp
    };
    db.quotes.push(newQuote);
    await writeJsonDb(db);
    return newQuote;
  }
}

export async function getAllRfqs(): Promise<RFQ[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM rfqs ORDER BY timestamp DESC');
    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      name: row.name,
      phone: row.phone,
      category: row.category,
      quantity: row.quantity,
      location: row.location,
      timeline: row.timeline,
      details: row.details,
    }));
  } else {
    const db = await readJsonDb();
    return db.rfqs;
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM bookings ORDER BY timestamp DESC');
    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      serviceName: row.service_name,
      name: row.name,
      phone: row.phone,
      date: row.date,
      notes: row.notes,
    }));
  } else {
    const db = await readJsonDb();
    return db.bookings;
  }
}

export async function getAllQuotes(): Promise<DirectQuote[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM quotes ORDER BY timestamp DESC');
    return res.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      contractorId: row.contractor_id,
      contractorCompany: row.contractor_company,
      name: row.name,
      phone: row.phone,
      budget: row.budget,
      timeline: row.timeline,
      desc: row.description,
    }));
  } else {
    const db = await readJsonDb();
    return db.quotes;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM products');
    return res.rows.map((row) => ({
      id: row.id,
      categoryTitle: row.category_title,
      name: row.name,
      price: row.price,
      unit: row.unit,
      rating: row.rating,
      icon: row.icon,
      link: row.link || undefined,
      description: row.description || undefined,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      priceTiers: typeof row.price_tiers === 'string' ? JSON.parse(row.price_tiers) : row.price_tiers,
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications,
      recommendedAccessories: typeof row.recommended_accessories === 'string' ? JSON.parse(row.recommended_accessories) : row.recommended_accessories,
      reviews: typeof row.reviews === 'string' ? JSON.parse(row.reviews) : row.reviews,
      subcategorySlug: row.subcategory_slug || undefined,
      leafSlug: row.leaf_slug || undefined,
      stock: row.stock !== undefined ? row.stock : 100,
    }));
  } else {
    const db = await readJsonDb();
    return db.products || [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      categoryTitle: row.category_title,
      name: row.name,
      price: row.price,
      unit: row.unit,
      rating: row.rating,
      icon: row.icon,
      link: row.link || undefined,
      description: row.description || undefined,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      priceTiers: typeof row.price_tiers === 'string' ? JSON.parse(row.price_tiers) : row.price_tiers,
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications,
      recommendedAccessories: typeof row.recommended_accessories === 'string' ? JSON.parse(row.recommended_accessories) : row.recommended_accessories,
      reviews: typeof row.reviews === 'string' ? JSON.parse(row.reviews) : row.reviews,
      subcategorySlug: row.subcategory_slug || undefined,
      leafSlug: row.leaf_slug || undefined,
      stock: row.stock !== undefined ? row.stock : 100,
    };
  } else {
    const db = await readJsonDb();
    const product = db.products?.find((p) => p.id === id);
    return product || null;
  }
}

export async function addUser(user: User): Promise<User> {
  const generatedId = user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const createdAt = user.createdAt || new Date().toISOString();

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO users (
        id, created_at, updated_at, name, full_name, email, phone, phone_number, password_hash, password_salt, company_name, role,
        email_verified, gst_number, service_category, experience, city, state, website, portfolio_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;
    const values = [
      generatedId,
      createdAt,
      createdAt,
      user.name,
      user.fullName || user.full_name || user.name,
      user.email.toLowerCase(),
      user.phone,
      user.phoneNumber || user.phone_number || user.phone,
      user.passwordHash || user.password_hash,
      user.passwordSalt,
      user.companyName || null,
      user.role,
      user.email_verified || false,
      user.gstNumber || null,
      user.serviceCategory || null,
      user.experience || null,
      user.city || null,
      user.state || null,
      user.website || null,
      user.portfolioUrl || null,
    ];
    const res = await pgPool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      name: row.name,
      full_name: row.full_name || undefined,
      fullName: row.full_name || undefined,
      email: row.email,
      phone: row.phone,
      phone_number: row.phone_number || undefined,
      phoneNumber: row.phone_number || undefined,
      passwordHash: row.password_hash,
      password_hash: row.password_hash,
      passwordSalt: row.password_salt,
      companyName: row.company_name || undefined,
      role: row.role as any,
      email_verified: row.email_verified,
      gstNumber: row.gst_number || undefined,
      serviceCategory: row.service_category || undefined,
      experience: row.experience || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      website: row.website || undefined,
      portfolioUrl: row.portfolio_url || undefined,
    };
  } else {
    const db = await readJsonDb();
    if (!db.users) {
      db.users = [];
    }
    // Enforce uniqueness constraints on JSON fallback DB
    const cleanEmail = user.email.toLowerCase();
    const cleanPhone = user.phone;
    const cleanGst = user.gstNumber?.trim().toUpperCase();

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('A user with this email already exists.');
    }
    if (db.users.some((u) => u.phone === cleanPhone)) {
      throw new Error('A user with this phone number already exists.');
    }
    if (cleanGst && db.users.some((u) => u.gstNumber?.toUpperCase() === cleanGst)) {
      throw new Error('An account with this GST number already exists. One GSTIN can only be linked to one ARCUS account.');
    }

    const newUser: User = {
      ...user,
      id: generatedId,
      email: cleanEmail,
      fullName: user.fullName || user.full_name || user.name,
      full_name: user.fullName || user.full_name || user.name,
      phoneNumber: user.phoneNumber || user.phone_number || user.phone,
      phone_number: user.phoneNumber || user.phone_number || user.phone,
      email_verified: user.email_verified || false,
      createdAt,
      created_at: createdAt,
      updated_at: createdAt
    };
    db.users.push(newUser);
    await writeJsonDb(db);
    return newUser;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      name: row.name,
      full_name: row.full_name || undefined,
      fullName: row.full_name || undefined,
      email: row.email,
      phone: row.phone,
      phone_number: row.phone_number || undefined,
      phoneNumber: row.phone_number || undefined,
      email_verified: row.email_verified,
      passwordHash: row.password_hash,
      password_hash: row.password_hash,
      passwordSalt: row.password_salt,
      companyName: row.company_name || undefined,
      role: row.role as any,
      gstNumber: row.gst_number || undefined,
      serviceCategory: row.service_category || undefined,
      experience: row.experience || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      website: row.website || undefined,
      portfolioUrl: row.portfolio_url || undefined,
    };
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return {
      ...user,
      full_name: user.full_name || user.fullName || user.name,
      fullName: user.fullName || user.full_name || user.name,
      phone_number: user.phone_number || user.phoneNumber || user.phone,
      phoneNumber: user.phoneNumber || user.phone_number || user.phone,
      email_verified: user.email_verified || false,
      created_at: user.created_at || user.createdAt,
      updated_at: user.updated_at || user.createdAt
    };
  }
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      name: row.name,
      full_name: row.full_name || undefined,
      fullName: row.full_name || undefined,
      email: row.email,
      phone: row.phone,
      phone_number: row.phone_number || undefined,
      phoneNumber: row.phone_number || undefined,
      email_verified: row.email_verified,
      passwordHash: row.password_hash,
      password_hash: row.password_hash,
      passwordSalt: row.password_salt,
      companyName: row.company_name || undefined,
      role: row.role as any,
      gstNumber: row.gst_number || undefined,
      serviceCategory: row.service_category || undefined,
      experience: row.experience || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      website: row.website || undefined,
      portfolioUrl: row.portfolio_url || undefined,
    };
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u) => u.phone === phone);
    if (!user) return null;
    return {
      ...user,
      full_name: user.full_name || user.fullName || user.name,
      fullName: user.fullName || user.full_name || user.name,
      phone_number: user.phone_number || user.phoneNumber || user.phone,
      phoneNumber: user.phoneNumber || user.phone_number || user.phone,
      email_verified: user.email_verified || false,
      created_at: user.created_at || user.createdAt,
      updated_at: user.updated_at || user.createdAt
    };
  }
}

export async function getUserByGst(gstNumber: string): Promise<User | null> {
  const cleanGst = gstNumber.trim().toUpperCase();
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM users WHERE UPPER(gst_number) = $1', [cleanGst]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      name: row.name,
      email: row.email,
      phone: row.phone,
      email_verified: row.email_verified,
      passwordHash: row.password_hash,
      password_hash: row.password_hash,
      passwordSalt: row.password_salt,
      companyName: row.company_name || undefined,
      role: row.role as any,
      gstNumber: row.gst_number || undefined,
      serviceCategory: row.service_category || undefined,
      experience: row.experience || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      website: row.website || undefined,
      portfolioUrl: row.portfolio_url || undefined,
    };
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u) => u.gstNumber?.toUpperCase() === cleanGst);
    if (!user) return null;
    return {
      ...user,
      email_verified: user.email_verified || false,
      created_at: user.created_at || user.createdAt,
      updated_at: user.updated_at || user.createdAt
    };
  }
}

export async function getUserById(id: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      name: row.name,
      full_name: row.full_name || undefined,
      fullName: row.full_name || undefined,
      email: row.email,
      phone: row.phone,
      phone_number: row.phone_number || undefined,
      phoneNumber: row.phone_number || undefined,
      email_verified: row.email_verified,
      passwordHash: row.password_hash,
      password_hash: row.password_hash,
      passwordSalt: row.password_salt,
      companyName: row.company_name || undefined,
      role: row.role as any,
      gstNumber: row.gst_number || undefined,
      serviceCategory: row.service_category || undefined,
      experience: row.experience || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      website: row.website || undefined,
      portfolioUrl: row.portfolio_url || undefined,
    };
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    return {
      ...user,
      full_name: user.full_name || user.fullName || user.name,
      fullName: user.fullName || user.full_name || user.name,
      phone_number: user.phone_number || user.phoneNumber || user.phone,
      phoneNumber: user.phoneNumber || user.phone_number || user.phone,
      email_verified: user.email_verified || false,
      created_at: user.created_at || user.createdAt,
      updated_at: user.updated_at || user.createdAt
    };
  }
}

export async function addOrder(order: Order): Promise<Order> {
  const generatedId = order.id || `ARC-${Math.floor(10000 + Math.random() * 90000)}`;
  const timestamp = order.timestamp || new Date().toISOString();
  const formattedDate = order.date || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const finalOrder: Order = {
    ...order,
    id: generatedId,
    timestamp,
    date: formattedDate
  };

  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO orders (
        id, user_id, timestamp, date, products, status, amount, items,
        shipping_address, billing_address, gst_number, payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      finalOrder.id,
      finalOrder.userId,
      finalOrder.timestamp,
      finalOrder.date,
      finalOrder.products,
      finalOrder.status,
      finalOrder.amount,
      JSON.stringify(finalOrder.items),
      finalOrder.shippingAddress,
      finalOrder.billingAddress,
      finalOrder.gstNumber || null,
      finalOrder.paymentMethod,
    ];
    await pgPool.query(query, values);
    return finalOrder;
  } else {
    const db = await readJsonDb();
    if (!db.orders) {
      db.orders = [];
    }
    db.orders.push(finalOrder);
    await writeJsonDb(db);
    return finalOrder;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
    return res.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      date: row.date || new Date(row.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      products: row.products,
      status: row.status as any,
      amount: row.amount,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      shippingAddress: row.shipping_address,
      billingAddress: row.billing_address,
      gstNumber: row.gst_number || undefined,
      paymentMethod: row.payment_method
    }));
  } else {
    const db = await readJsonDb();
    if (!db.orders) return [];
    return db.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      date: row.date || new Date(row.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      products: row.products,
      status: row.status as any,
      amount: row.amount,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      shippingAddress: row.shipping_address,
      billingAddress: row.billing_address,
      gstNumber: row.gst_number || undefined,
      paymentMethod: row.payment_method
    };
  } else {
    const db = await readJsonDb();
    if (!db.orders) return null;
    const order = db.orders.find((o) => o.id === id);
    return order || null;
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString(),
      date: row.date || new Date(row.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      products: row.products,
      status: row.status as any,
      amount: row.amount,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      shippingAddress: row.shipping_address,
      billingAddress: row.billing_address,
      gstNumber: row.gst_number || undefined,
      paymentMethod: row.payment_method
    };
  } else {
    const db = await readJsonDb();
    if (!db.orders) return null;
    const orderIdx = db.orders.findIndex((o) => o.id === id);
    if (orderIdx === -1) return null;
    db.orders[orderIdx].status = status;
    await writeJsonDb(db);
    return db.orders[orderIdx];
  }
}



export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const finalUpdates = { ...updates };
  if (finalUpdates.name && !finalUpdates.full_name && !finalUpdates.fullName) {
    finalUpdates.full_name = finalUpdates.name;
    finalUpdates.fullName = finalUpdates.name;
  }
  if (finalUpdates.fullName && !finalUpdates.full_name) {
    finalUpdates.full_name = finalUpdates.fullName;
  }
  if (finalUpdates.full_name && !finalUpdates.fullName) {
    finalUpdates.fullName = finalUpdates.full_name;
  }
  if (finalUpdates.phone && !finalUpdates.phone_number && !finalUpdates.phoneNumber) {
    finalUpdates.phone_number = finalUpdates.phone;
    finalUpdates.phoneNumber = finalUpdates.phone;
  }
  if (finalUpdates.phoneNumber && !finalUpdates.phone_number) {
    finalUpdates.phone_number = finalUpdates.phoneNumber;
  }
  if (finalUpdates.phone_number && !finalUpdates.phoneNumber) {
    finalUpdates.phoneNumber = finalUpdates.phone_number;
  }
  finalUpdates.updated_at = new Date().toISOString();

  if (usePostgres && pgPool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(finalUpdates)) {
      let colName = key;
      if (key === 'companyName') colName = 'company_name';
      else if (key === 'gstNumber') colName = 'gst_number';
      else if (key === 'serviceCategory') colName = 'service_category';
      else if (key === 'portfolioUrl') colName = 'portfolio_url';
      else if (key === 'passwordHash') colName = 'password_hash';
      else if (key === 'passwordSalt') colName = 'password_salt';
      else if (key === 'fullName') colName = 'full_name';
      else if (key === 'phoneNumber') colName = 'phone_number';
      else if (key === 'emailVerified') colName = 'email_verified';
      else if (key === 'createdAt') colName = 'created_at';
      else if (key === 'updatedAt') colName = 'updated_at';

      fields.push(`${colName} = $${idx}`);
      values.push(val === undefined ? null : val);
      idx++;
    }
    if (fields.length === 0) return await getUserById(id);
    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const res = await pgPool.query(query, values);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      name: row.name,
      full_name: row.full_name || undefined,
      fullName: row.full_name || undefined,
      email: row.email,
      phone: row.phone,
      phone_number: row.phone_number || undefined,
      phoneNumber: row.phone_number || undefined,
      email_verified: row.email_verified,
      passwordHash: row.password_hash,
      password_hash: row.password_hash,
      passwordSalt: row.password_salt,
      companyName: row.company_name || undefined,
      role: row.role as any,
      gstNumber: row.gst_number || undefined,
      serviceCategory: row.service_category || undefined,
      experience: row.experience || undefined,
      city: row.city || undefined,
      state: row.state || undefined,
      website: row.website || undefined,
      portfolioUrl: row.portfolio_url || undefined,
    };
  } else {
    const db = await readJsonDb();
    const userIdx = db.users.findIndex((u) => u.id === id);
    if (userIdx === -1) return null;
    const existing = db.users[userIdx];
    const updatedUser = {
      ...existing,
      ...finalUpdates
    };
    const mappedUser: User = {
      ...updatedUser,
      full_name: updatedUser.full_name || updatedUser.fullName || updatedUser.name,
      fullName: updatedUser.fullName || updatedUser.full_name || updatedUser.name,
      phone_number: updatedUser.phone_number || updatedUser.phoneNumber || updatedUser.phone,
      phoneNumber: updatedUser.phoneNumber || updatedUser.phone_number || updatedUser.phone,
      email_verified: updatedUser.email_verified || false,
      created_at: updatedUser.created_at || updatedUser.createdAt,
      updated_at: updatedUser.updated_at
    };
    db.users[userIdx] = mappedUser;
    await writeJsonDb(db);
    return mappedUser;
  }
}

export async function addOtp(otp: OtpRecord): Promise<OtpRecord> {
  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO otps (id, user_id, otp_hash, expires_at, attempts, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      otp.id,
      otp.userId,
      otp.otpHash,
      new Date(otp.expiresAt),
      otp.attempts,
      new Date(otp.createdAt)
    ];
    await pgPool.query(query, values);
    return otp;
  } else {
    const db = await readJsonDb();
    if (!db.otps) {
      db.otps = [];
    }
    db.otps.push(otp);
    await writeJsonDb(db);
    return otp;
  }
}

export async function getOtpByUserId(userId: string): Promise<OtpRecord | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      otpHash: row.otp_hash,
      expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : new Date(row.expires_at).toISOString(),
      attempts: row.attempts,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()
    };
  } else {
    const db = await readJsonDb();
    if (!db.otps) return null;
    const userOtps = db.otps.filter(o => o.userId === userId);
    if (userOtps.length === 0) return null;
    userOtps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userOtps[0];
  }
}

export async function incrementOtpAttempts(id: string): Promise<number> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts', [id]);
    if (res.rows.length === 0) return 0;
    return res.rows[0].attempts;
  } else {
    const db = await readJsonDb();
    if (!db.otps) return 0;
    const idx = db.otps.findIndex(o => o.id === id);
    if (idx === -1) return 0;
    db.otps[idx].attempts += 1;
    await writeJsonDb(db);
    return db.otps[idx].attempts;
  }
}

export async function deleteOtp(id: string): Promise<void> {
  if (usePostgres && pgPool) {
    await pgPool.query('DELETE FROM otps WHERE id = $1', [id]);
  } else {
    const db = await readJsonDb();
    if (!db.otps) return;
    db.otps = db.otps.filter(o => o.id !== id);
    await writeJsonDb(db);
  }
}

export async function deleteOtpsByUserId(userId: string): Promise<void> {
  if (usePostgres && pgPool) {
    await pgPool.query('DELETE FROM otps WHERE user_id = $1', [userId]);
  } else {
    const db = await readJsonDb();
    if (!db.otps) return;
    db.otps = db.otps.filter(o => o.userId !== userId);
    await writeJsonDb(db);
  }
}

export async function deleteUserByEmail(email: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    if (!db.users) return false;
    const initialLen = db.users.length;
    db.users = db.users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    if (db.users.length !== initialLen) {
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}

export async function deleteUserByGst(gstNumber: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('DELETE FROM users WHERE gst_number = $1', [gstNumber]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    if (!db.users) return false;
    const initialLen = db.users.length;
    db.users = db.users.filter(u => u.gstNumber?.toUpperCase() !== gstNumber.toUpperCase());
    if (db.users.length !== initialLen) {
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}


