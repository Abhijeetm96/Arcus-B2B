const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'server', 'data', 'db.json');
const TS_FILE = path.join(__dirname, '..', 'server', 'src', 'seed', 'products.ts');

// Load existing db.json
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Check how many products are currently in the db
console.log('Existing products in db.json:', db.products.length);

// Keep the existing 24 products exactly as they are (matching by id/name)
const existingProducts = db.products;

// All 81 products list (including the 24 existing ones and the new ones)
const allProducts = [];

// Primary Categories Helper
const getIcon = (cat) => {
  const icons = {
    'Plumbing': 'plumbing',
    'Electrical': 'bolt',
    'Cement': 'architecture',
    'Steel': 'construction',
    'Paints': 'format_paint',
    'Tiles': 'layers',
    'Hardware': 'handyman',
    'Building': 'home_work'
  };
  return icons[cat] || 'construction';
};

// Define all 81 products
const productsData = [
  // --- PLUMBING ---
  // Subcategory: pipes-fittings
  {
    id: "astral-cpvc-pipe",
    categoryTitle: "Plumbing",
    name: "Astral CPVC Pipe",
    price: "₹280",
    unit: "/ Piece",
    rating: "4.8",
    icon: "plumbing",
    link: "#/product/astral-cpvc-pipe",
    description: "Astral CPVC PRO pipes and fittings are manufactured from a specialty plastic chemically known as Chlorinated Poly Vinyl Chloride (CPVC). This CPVC compound is designed for hot and cold water distribution systems. Easy installation with solvent cement, superior pressure rating, and long-term reliability in high-rise residential and commercial complexes.",
    images: ["/pdp_cpvc_pipe_main.png", "/pdp_cpvc_pipe_warehouse.png", "/pdp_cpvc_pipe_install.png", "/pdp_cpvc_pipe_fittings_group.png"],
    priceTiers: [
      { min: 1, max: 50, price: 165, save: 0 },
      { min: 51, max: 100, price: 160, save: 3 },
      { min: 101, max: 500, price: 154, save: 7 },
      { min: 501, max: 999999, price: 145, save: 12 }
    ],
    specifications: {
      "Material": "CPVC (Chlorinated Poly Vinyl Chloride)",
      "SDR Rating": "SDR 11",
      "Standard": "ASTM D2846 / IS 15778",
      "Pipe Size": "1 Inch (25mm)",
      "Wall Thickness": "2.3 mm",
      "Max Working Pressure": "25 Bar at 23°C",
      "Max Operating Temperature": "93°C",
      "Manufacturer": "Astral Poly Technik Limited"
    },
    recommendedAccessories: [
      { id: "elbow", name: "Astral CPVC Elbow 90° (1\")", category: "Plumbing", price: 45, stock: "In Stock", image: "/pdp_cpvc_elbow.png", multiplier: 2 },
      { id: "tee", name: "Astral CPVC Tee (1\")", category: "Plumbing", price: 58, stock: "In Stock", image: "/pdp_cpvc_tee.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "MK", name: "Mahesh K.", role: "Site Manager, L&T", rating: 5, date: "2 weeks ago", comment: "\"Best in class heat resistance for high-rise plumbing. The delivery from ARCUS was 4 hours faster than local distributors.\"" },
      { initials: "AP", name: "Amit P.", role: "Procurement Specialist, Sobha Developers", rating: 5, date: "3 weeks ago", comment: "\"Extremely consistent quality and perfect dimensions. The SDR 11 CPVC standard compliance is verified.\"" }
    ],
    subcategorySlug: "pipes-fittings",
    leafSlug: "cpvc-pipes"
  },
  {
    id: "supreme-elbow-90",
    categoryTitle: "Plumbing",
    name: "Supreme Elbow 90°",
    price: "₹24",
    unit: "/ Unit",
    rating: "4.7",
    icon: "plumbing",
    link: "#/product/supreme-elbow-90",
    description: "Supreme Industries 90-degree PVC elbow is engineered for direction changes in plumbing systems. Made from premium lead-free uPVC, it provides leak-proof joints when paired with solvent cement. Suitable for both hot and cold water supply lines in residential, commercial, and industrial buildings.",
    images: ["/pdp_supreme_elbow.png", "/pdp_cpvc_elbow.png"],
    priceTiers: [
      { min: 1, max: 100, price: 24, save: 0 },
      { min: 101, max: 500, price: 22, save: 8 },
      { min: 501, max: 999999, price: 19, save: 21 }
    ],
    specifications: {
      "Material": "uPVC (Unplasticized Polyvinyl Chloride)",
      "Angle": "90 Degrees",
      "Size": "1 Inch (25mm)",
      "Standard": "IS 4985",
      "Color": "White",
      "Connection Type": "Solvent Weld",
      "Working Pressure": "10 Bar",
      "Manufacturer": "Supreme Industries Limited"
    },
    recommendedAccessories: [
      { id: "cpvc-pipe", name: "Astral CPVC Pipe 1\"", category: "Plumbing", price: 165, stock: "In Stock", image: "/pdp_cpvc_pipe_main.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "PN", name: "Pradeep N.", role: "Plumbing Contractor, Bengaluru", rating: 5, date: "1 week ago", comment: "\"Perfect fit every time. The dimensional accuracy is spot on.\"" }
    ],
    subcategorySlug: "pipes-fittings",
    leafSlug: "pipe-fittings"
  },
  {
    id: "finolex-pvc-pipe",
    categoryTitle: "Plumbing",
    name: "Finolex PVC Pipe 4 Inch",
    price: "₹480",
    unit: "/ Piece",
    rating: "4.6",
    icon: "plumbing",
    link: "#/product/finolex-pvc-pipe",
    description: "Finolex self-fit PVC pipes are ideal for water supply, soil, waste, and rain water drainage systems. Manufactured with high-quality compound, ensuring high mechanical strength, resistance to chemical attack, and excellent flow properties.",
    images: ["/pdp_cpvc_pipe_main.png"],
    priceTiers: [
      { min: 1, max: 20, price: 480, save: 0 },
      { min: 21, max: 100, price: 450, save: 6 },
      { min: 101, max: 999999, price: 420, save: 12 }
    ],
    specifications: {
      "Material": "uPVC (Unplasticized Polyvinyl Chloride)",
      "Size": "4 Inch (110mm)",
      "Length": "6 Meters",
      "Standard": "IS 4985:2000",
      "Pressure Rating": "4 Kg/cm² (Class 2)",
      "Manufacturer": "Finolex Industries Limited"
    },
    recommendedAccessories: [
      { id: "elbow", name: "Supreme Elbow 90° (4\")", category: "Plumbing", price: 110, stock: "In Stock", image: "/pdp_supreme_elbow.png", multiplier: 2 }
    ],
    reviews: [
      { initials: "RS", name: "Rajesh S.", role: "Civil Contractor, Mumbai", rating: 5, date: "2 weeks ago", comment: "\"Highly reliable. Wall thickness is uniform throughout the length.\"" }
    ],
    subcategorySlug: "pipes-fittings",
    leafSlug: "pvc-pipes"
  },

  // Subcategory: water-tanks
  {
    id: "sintex-overhead-1000l",
    categoryTitle: "Plumbing",
    name: "Sintex Overhead Water Tank 1000L",
    price: "₹8,200",
    unit: "/ Unit",
    rating: "4.8",
    icon: "plumbing",
    link: "#/product/sintex-overhead-1000l",
    description: "Sintex Triple Layer Overhead Water Tanks provide premium hygienic water storage with UV stabilization. Features a food-grade inner layer and triple-layer protection for temperature moderation, strength, and durability. Resists algal growth and bacteria.",
    images: ["/pdp_cpvc_pipe_warehouse.png"],
    priceTiers: [
      { min: 1, max: 5, price: 8200, save: 0 },
      { min: 6, max: 20, price: 7800, save: 5 },
      { min: 21, max: 999999, price: 7400, save: 10 }
    ],
    specifications: {
      "Material": "LLDPE (Linear Low-Density Polyethylene)",
      "Capacity": "1000 Liters",
      "Layers": "3 Layers",
      "Color": "Black",
      "Diameter": "1045 mm",
      "Height": "1280 mm",
      "Manufacturer": "Sintex Plastics Technology Limited"
    },
    recommendedAccessories: [
      { id: "ball-valve", name: "Leader Brass Ball Valve 1\"", category: "Plumbing", price: 450, stock: "In Stock", image: "/pdp_ball_valve.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "VP", name: "Vikram P.", role: "Residential Developer, Pune", rating: 5, date: "1 month ago", comment: "\"The standard for water storage in India. Very durable design.\"" }
    ],
    subcategorySlug: "water-tanks",
    leafSlug: "overhead-tanks"
  },
  {
    id: "plasto-gold-500l",
    categoryTitle: "Plumbing",
    name: "Plasto Gold Water Tank 500L",
    price: "₹4,600",
    unit: "/ Unit",
    rating: "4.6",
    icon: "plumbing",
    link: "#/product/plasto-gold-500l",
    description: "Plasto Gold 6-Layer Water Tank provides exceptional durability with multiple layers for thermal protection, anti-algal properties, and food-grade safety. Includes a foam insulation layer that keeps water cool in hot summers.",
    images: ["/pdp_cpvc_pipe_warehouse.png"],
    priceTiers: [
      { min: 1, max: 10, price: 4600, save: 0 },
      { min: 11, max: 50, price: 4300, save: 6 },
      { min: 51, max: 999999, price: 4000, save: 13 }
    ],
    specifications: {
      "Material": "Polyethylene",
      "Capacity": "500 Liters",
      "Layers": "6 Layers",
      "Color": "Gold/Yellow",
      "Manufacturer": "RC Plasto Tanks & Pipes Pvt. Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SM", name: "Sanjay M.", role: "Home Owner, Nagpur", rating: 4, date: "3 weeks ago", comment: "\"Keep water significantly cooler during Nagpur summers. Happy with it.\"" }
    ],
    subcategorySlug: "water-tanks",
    leafSlug: "overhead-tanks"
  },
  {
    id: "supreme-loft-225l",
    categoryTitle: "Plumbing",
    name: "Supreme Loft Water Tank 225L",
    price: "₹2,300",
    unit: "/ Unit",
    rating: "4.5",
    icon: "plumbing",
    link: "#/product/supreme-loft-225l",
    description: "Supreme Silotank Loft Tanks are designed for indoor space-saving installations in bathrooms and kitchens. Made from 100% virgin food-grade polymer. Strong structural ribs ensure high durability and resistance to deformation.",
    images: ["/pdp_cpvc_pipe_warehouse.png"],
    priceTiers: [
      { min: 1, max: 10, price: 2300, save: 0 },
      { min: 11, max: 50, price: 2150, save: 6 },
      { min: 51, max: 999999, price: 2000, save: 13 }
    ],
    specifications: {
      "Material": "Food Grade Polyethylene",
      "Capacity": "225 Liters",
      "Type": "Loft Tank / Rectangular",
      "Length": "860 mm",
      "Width": "610 mm",
      "Height": "490 mm",
      "Manufacturer": "Supreme Industries Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Ramesh K.", role: "Plumber, Hyderabad", rating: 5, date: "2 weeks ago", comment: "\"Fits perfectly inside loft space. Zero leakage reported by clients.\"" }
    ],
    subcategorySlug: "water-tanks",
    leafSlug: "loft-tanks"
  },

  // Subcategory: valves
  {
    id: "leader-brass-ball-valve-1",
    categoryTitle: "Plumbing",
    name: "Leader Brass Ball Valve 1\"",
    price: "₹450",
    unit: "/ Unit",
    rating: "4.7",
    icon: "plumbing",
    link: "#/product/leader-brass-ball-valve-1",
    description: "Leader Brass Ball Valves are premium threaded valves designed for residential and commercial water piping systems. Features full bore design for smooth flow, Teflon seats for bubble-tight seal, and nickel-plated finish for corrosion resistance.",
    images: ["/pdp_ball_valve.png"],
    priceTiers: [
      { min: 1, max: 20, price: 450, save: 0 },
      { min: 21, max: 100, price: 410, save: 8 },
      { min: 101, max: 999999, price: 380, save: 15 }
    ],
    specifications: {
      "Material": "Forged Brass",
      "Size": "1 Inch (25mm)",
      "Connection": "Threaded (Screwed)",
      "Working Pressure": "PN 25",
      "Media": "Water / Gas",
      "Manufacturer": "Leader Valves Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SS", name: "Suresh S.", role: "Project Manager, L&T", rating: 5, date: "3 weeks ago", comment: "\"Extremely reliable. Lever operation is smooth.\"" }
    ],
    subcategorySlug: "valves",
    leafSlug: "ball-valves"
  },
  {
    id: "zoloto-check-valve-1.5",
    categoryTitle: "Plumbing",
    name: "Zoloto Cast Bronze Check Valve 1.5\"",
    price: "₹1,450",
    unit: "/ Unit",
    rating: "4.8",
    icon: "plumbing",
    link: "#/product/zoloto-check-valve-1.5",
    description: "Zoloto Cast Bronze Horizontal Lift Check Valves are designed to prevent backflow in water pipelines. Built to Indian standards, they feature a bronze body and seat, ensuring complete protection and zero corrosion in domestic or industrial lines.",
    images: ["/pdp_ball_valve.png"],
    priceTiers: [
      { min: 1, max: 10, price: 1450, save: 0 },
      { min: 11, max: 50, price: 1350, save: 7 },
      { min: 51, max: 999999, price: 1250, save: 13 }
    ],
    specifications: {
      "Material": "Bronze",
      "Size": "1.5 Inch (40mm)",
      "Type": "Horizontal Lift Check",
      "Pressure Rating": "PN 16",
      "Manufacturer": "Zoloto Valves Pvt. Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "AN", name: "Anand N.", role: "Water Treatment Contractor", rating: 5, date: "2 weeks ago", comment: "\"Does exactly what it promises. Keeps water flowing in one direction securely.\"" }
    ],
    subcategorySlug: "valves",
    leafSlug: "check-valves"
  },
  {
    id: "l-and-t-gate-valve-2",
    categoryTitle: "Plumbing",
    name: "L&T Cast Steel Gate Valve 2\"",
    price: "₹4,200",
    unit: "/ Unit",
    rating: "4.9",
    icon: "plumbing",
    link: "#/product/l-and-t-gate-valve-2",
    description: "L&T Cast Steel Gate Valves are designed for heavy-duty industrial fluid control. Flanged ends design with rising stem, bolted bonnet, and flexible wedge, providing reliable shut-off in water, oil, and gas systems.",
    images: ["/pdp_ball_valve.png"],
    priceTiers: [
      { min: 1, max: 5, price: 4200, save: 0 },
      { min: 6, max: 20, price: 3950, save: 6 },
      { min: 21, max: 999999, price: 3700, save: 11 }
    ],
    specifications: {
      "Material": "Cast Steel (ASTM A216 Gr. WCB)",
      "Size": "2 Inch (50mm)",
      "Type": "Gate Valve",
      "Class": "Class 150",
      "Connection": "Flanged",
      "Manufacturer": "L&T Valves Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "KK", name: "Kishore K.", role: "Industrial Consultant", rating: 5, date: "1 month ago", comment: "\"Top quality steel gate valve. Flange fittings are perfectly aligned.\"" }
    ],
    subcategorySlug: "valves",
    leafSlug: "gate-valves"
  },

  // Subcategory: pumps
  {
    id: "kirloskar-monoblock-pump-1hp",
    categoryTitle: "Plumbing",
    name: "Kirloskar Monoblock Pump 1HP",
    price: "₹6,800",
    unit: "/ Unit",
    rating: "4.8",
    icon: "plumbing",
    link: "#/product/kirloskar-monoblock-pump-1hp",
    description: "Kirloskar Jalraaj Self-Priming Monoblock Pump with 1HP motor. Specially designed to handle voltage fluctuations, suitable for domestic water supply, gardening, and overhead tanks. High efficiency with copper winding.",
    images: ["/pdp_ball_valve.png"],
    priceTiers: [
      { min: 1, max: 5, price: 6800, save: 0 },
      { min: 6, max: 20, price: 6400, save: 5 },
      { min: 21, max: 999999, price: 6000, save: 11 }
    ],
    specifications: {
      "Motor Power": "1 HP (0.75 kW)",
      "Power Source": "Single Phase AC",
      "Flow Rate": "30-10 L/min",
      "Head Range": "6 to 26 Meters",
      "Winding": "Copper Winding",
      "Manufacturer": "Kirloskar Brothers Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "AK", name: "Alok K.", role: "Builder, Noida", rating: 5, date: "3 weeks ago", comment: "\"No issues even with voltage drops. Jalraaj is very reliable.\"" }
    ],
    subcategorySlug: "pumps",
    leafSlug: "monoblock-pumps"
  },
  {
    id: "crompton-submersible-pump-1.5hp",
    categoryTitle: "Plumbing",
    name: "Crompton Submersible Pump 1.5HP",
    price: "₹12,400",
    unit: "/ Unit",
    rating: "4.7",
    icon: "plumbing",
    link: "#/product/crompton-submersible-pump-1.5hp",
    description: "Crompton Borewell Submersible Pump with high-grade stainless steel construction and copper rotor. Provides high head and efficient discharge for agricultural, commercial, and multi-story building water supply.",
    images: ["/pdp_ball_valve.png"],
    priceTiers: [
      { min: 1, max: 5, price: 12400, save: 0 },
      { min: 6, max: 15, price: 11800, save: 5 },
      { min: 16, max: 999999, price: 11200, save: 9 }
    ],
    specifications: {
      "Motor Power": "1.5 HP (1.1 kW)",
      "Borewell Size": "4 Inch",
      "Max Head": "80 Meters",
      "Stages": "10 Stages",
      "Body Material": "Stainless Steel",
      "Manufacturer": "Crompton Greaves Consumer Electricals Ltd."
    },
    recommendedAccessories: [
      { id: "cable", name: "Polycab Submersible Flat Cable 2.5 sq mm", category: "Electrical", price: 2450, stock: "In Stock", image: "/pdp_finolex_wire.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "DS", name: "Devendra S.", role: "Farmer, Punjab", rating: 5, date: "2 weeks ago", comment: "\"Excellent pressure. Water discharge is steady even at deep levels.\"" }
    ],
    subcategorySlug: "pumps",
    leafSlug: "submersible-pumps"
  },
  {
    id: "texmo-booster-pump-0.5hp",
    categoryTitle: "Plumbing",
    name: "Texmo Booster Pump 0.5HP",
    price: "₹8,900",
    unit: "/ Unit",
    rating: "4.6",
    icon: "plumbing",
    link: "#/product/texmo-booster-pump-0.5hp",
    description: "Texmo Pressure Booster Pump designed for consistent water pressure in showers and taps. Automatically turns on/off based on water flow demand. Features a corrosion-proof cast iron body and dry run protection.",
    images: ["/pdp_ball_valve.png"],
    priceTiers: [
      { min: 1, max: 5, price: 8900, save: 0 },
      { min: 6, max: 20, price: 8400, save: 5 },
      { min: 21, max: 999999, price: 7900, save: 11 }
    ],
    specifications: {
      "Motor Power": "0.5 HP",
      "Type": "Pressure Booster Pump",
      "Automatic Control": "Yes (Flow Switch)",
      "Max Head": "24 Meters",
      "Manufacturer": "Aqua Sub Engineering (Texmo)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "MR", name: "Manoj R.", role: "Penthouse Owner, Chennai", rating: 4, date: "1 week ago", comment: "\"Perfect for boosting pressure in the top floor. Very quiet operation.\"" }
    ],
    subcategorySlug: "pumps",
    leafSlug: "booster-pumps"
  },

  // Subcategory: bathroom-fittings
  {
    id: "jaquar-basin-mixer",
    categoryTitle: "Plumbing",
    name: "Jaquar Basin Mixer",
    price: "₹3,450",
    unit: "/ Unit",
    rating: "4.9",
    icon: "plumbing",
    link: "#/product/jaquar-basin-mixer",
    description: "Jaquar single lever basin mixer tap from the Continental Plus series. Features a ceramic disc cartridge for smooth, precise temperature and flow control. The heavy-duty chrome finish is resistant to tarnishing and corrosion. Ideal for luxury residential bathrooms, commercial washrooms, and premium hotel projects.",
    images: ["/pdp_jaquar_basin_mixer.png"],
    priceTiers: [
      { min: 1, max: 10, price: 3450, save: 0 },
      { min: 11, max: 50, price: 3200, save: 7 },
      { min: 51, max: 999999, price: 2950, save: 14 }
    ],
    specifications: {
      "Brand": "Jaquar",
      "Series": "Continental Plus",
      "Finish": "Chrome Plated",
      "Body Material": "Brass",
      "Cartridge": "Ceramic Disc (40mm)",
      "Flow Rate": "8 L/min",
      "Manufacturer": "Jaquar Group"
    },
    recommendedAccessories: [
      { id: "basin-waste", name: "Pop-Up Basin Waste 32mm", category: "Plumbing", price: 280, stock: "In Stock", image: "/pdp_supreme_elbow.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "AJ", name: "Ankit J.", role: "Interior Designer, Bengaluru", rating: 5, date: "2 weeks ago", comment: "\"Exceptional build quality. The smooth single-lever action is a cut above the competition.\"" }
    ],
    subcategorySlug: "bathroom-fittings",
    leafSlug: "faucets-taps"
  },
  {
    id: "cera-wall-hung-closet",
    categoryTitle: "Plumbing",
    name: "Cera Wall Hung Closet",
    price: "₹4,250",
    unit: "/ Unit",
    rating: "4.7",
    icon: "plumbing",
    link: "#/product/cera-wall-hung-closet",
    description: "Cera ceramic wall-hung water closet with soft-close seat cover and washdown flushing system. Ergonomic shape and glossy white finish, ideal for modern space-efficient bathrooms. Features an anti-bacterial glaze.",
    images: ["/pdp_jaquar_basin_mixer.png"],
    priceTiers: [
      { min: 1, max: 10, price: 4250, save: 0 },
      { min: 11, max: 50, price: 3950, save: 7 },
      { min: 51, max: 999999, price: 3650, save: 14 }
    ],
    specifications: {
      "Material": "Vitreous China (Ceramic)",
      "Type": "Wall Hung Closet",
      "Flushing System": "Washdown Dual Flush",
      "Seat Cover": "Soft Close",
      "Manufacturer": "Cera Sanitaryware Limited"
    },
    recommendedAccessories: [
      { id: "flush-tank", name: "Cera Concealed Flush Tank", category: "Plumbing", price: 1850, stock: "In Stock", image: "/pdp_supreme_elbow.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "NM", name: "Nitin M.", role: "Interior Designer, Mumbai", rating: 5, date: "3 weeks ago", comment: "\"Very premium look and easy to clean. Anti-bacterial coating is effective.\"" }
    ],
    subcategorySlug: "bathroom-fittings",
    leafSlug: "sanitaryware"
  },
  {
    id: "hindware-overhead-shower",
    categoryTitle: "Plumbing",
    name: "Hindware Overhead Chrome Shower",
    price: "₹1,150",
    unit: "/ Unit",
    rating: "4.6",
    icon: "plumbing",
    link: "#/product/hindware-overhead-shower",
    description: "Hindware Overhead Shower with rub-clean silicone nozzles and premium chrome plating. Delivers a soft, rain-like spray pattern even at low water pressures, giving you a relaxing shower experience.",
    images: ["/pdp_jaquar_basin_mixer.png"],
    priceTiers: [
      { min: 1, max: 20, price: 1150, save: 0 },
      { min: 21, max: 100, price: 1050, save: 8 },
      { min: 101, max: 999999, price: 950, save: 17 }
    ],
    specifications: {
      "Material": "ABS Plastic / Chrome Plated",
      "Type": "Overhead Shower",
      "Nozzles": "Anti-clogging Silicone",
      "Flow Rate": "9 L/min",
      "Manufacturer": "Hindware Limited"
    },
    recommendedAccessories: [
      { id: "shower-arm", name: "Hindware Brass Shower Arm 9\"", category: "Plumbing", price: 340, stock: "In Stock", image: "/pdp_supreme_elbow.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "HL", name: "Hari Lal", role: "Plumber, Delhi", rating: 4, date: "1 week ago", comment: "\"Excellent chrome shine. The spray is soft and consistent.\"" }
    ],
    subcategorySlug: "bathroom-fittings",
    leafSlug: "showers-mixers"
  },

  // --- ELECTRICAL ---
  // Subcategory: wires-cables
  {
    id: "finolex-wire",
    categoryTitle: "Electrical",
    name: "Finolex Wire",
    price: "₹1,250",
    unit: "/ Coil",
    rating: "4.8",
    icon: "bolt",
    link: "#/product/finolex-wire",
    description: "Finolex 1.5 sq mm copper conductor PVC insulated electrical wire, designed for reliable internal wiring of residential and commercial buildings. The wire features high conductivity electrolytic copper conductors and flame-retardant PVC insulation compliant with IS 694:2010.",
    images: ["/pdp_finolex_wire.png"],
    priceTiers: [
      { min: 1, max: 10, price: 1250, save: 0 },
      { min: 11, max: 50, price: 1180, save: 6 },
      { min: 51, max: 999999, price: 1100, save: 12 }
    ],
    specifications: {
      "Conductor": "Electrolytic Copper",
      "Cross Section": "1.5 sq mm",
      "Insulation": "PVC (Flame Retardant)",
      "Standard": "IS 694:2010",
      "Coil Length": "90 meters",
      "Voltage Rating": "1100V AC",
      "Manufacturer": "Finolex Cables Ltd."
    },
    recommendedAccessories: [
      { id: "mcb", name: "Havells MCB 16A SP", category: "Electrical", price: 850, stock: "In Stock", image: "/pdp_havells_mcb.png", multiplier: 0.1 }
    ],
    reviews: [
      { initials: "GN", name: "Ganesh N.", role: "Licensed Electrician, Chennai", rating: 5, date: "1 week ago", comment: "\"Finolex is the only wire I use. The insulation thickness is consistent.\"" }
    ],
    subcategorySlug: "wires-cables",
    leafSlug: "copper-wires"
  },
  {
    id: "polycab-armored-cable",
    categoryTitle: "Electrical",
    name: "Polycab Armored Cable 3 Core",
    price: "₹18,500",
    unit: "/ Drum",
    rating: "4.7",
    icon: "bolt",
    link: "#/product/polycab-armored-cable",
    description: "Polycab 3 Core 6 sq mm Aluminum Conductor PVC insulated armored cable. Features high mechanical protection provided by steel wire armoring, suitable for underground power distribution in industrial and commercial structures.",
    images: ["/pdp_finolex_wire.png"],
    priceTiers: [
      { min: 1, max: 2, price: 18500, save: 0 },
      { min: 3, max: 10, price: 17800, save: 4 },
      { min: 11, max: 999999, price: 16900, save: 9 }
    ],
    specifications: {
      "Conductor": "Aluminum",
      "Cores": "3 Core",
      "Size": "6 sq mm",
      "Armor": "Steel Wire Armored",
      "Length": "100 Meters",
      "Voltage Rating": "1100V",
      "Manufacturer": "Polycab India Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RD", name: "Ranjeet D.", role: "Electrical Contractor", rating: 5, date: "2 weeks ago", comment: "\"Heavy armor wire, perfect for underground main connection to the transformer.\"" }
    ],
    subcategorySlug: "wires-cables",
    leafSlug: "armored-cables"
  },
  {
    id: "havells-lifeline-wire",
    categoryTitle: "Electrical",
    name: "Havells Lifeline Wire 2.5 sq mm",
    price: "₹2,100",
    unit: "/ Coil",
    rating: "4.9",
    icon: "bolt",
    link: "#/product/havells-lifeline-wire",
    description: "Havells Lifeline FR-LSH (Flame Retardant Low Smoke Halogen) electrical wires. Engineered with S3 technology to ensure high safety standards and minimal toxic gas emission during fire outbreaks.",
    images: ["/pdp_finolex_wire.png"],
    priceTiers: [
      { min: 1, max: 10, price: 2100, save: 0 },
      { min: 11, max: 50, price: 1980, save: 6 },
      { min: 51, max: 999999, price: 1880, save: 10 }
    ],
    specifications: {
      "Conductor": "Electrolytic Grade Copper",
      "Cross Section": "2.5 sq mm",
      "Insulation": "FR-LSH PVC",
      "Coil Length": "90 meters",
      "Standard": "IS 694",
      "Manufacturer": "Havells India Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SK", name: "Suresh K.", role: "Electrician, Bangalore", rating: 5, date: "1 week ago", comment: "\"Highly flexible and doesn't snap. Low smoke standard is excellent for safety.\"" }
    ],
    subcategorySlug: "wires-cables",
    leafSlug: "flexible-cables"
  },

  // Subcategory: switches-sockets
  {
    id: "anchor-switch",
    categoryTitle: "Electrical",
    name: "Anchor Switch",
    price: "₹45",
    unit: "/ Unit",
    rating: "4.7",
    icon: "bolt",
    link: "#/product/anchor-switch",
    description: "Panasonic Anchor Roma 6A 1-way modular electrical switch with a high-gloss white finish. Features a smooth click mechanism rated for 100,000 operation cycles. Designed to fit into standard modular boxes.",
    images: ["/pdp_anchor_switch.png"],
    priceTiers: [
      { min: 1, max: 100, price: 45, save: 0 },
      { min: 101, max: 500, price: 40, save: 11 },
      { min: 501, max: 999999, price: 35, save: 22 }
    ],
    specifications: {
      "Brand": "Anchor by Panasonic",
      "Series": "Roma",
      "Type": "1-Way Switch",
      "Current Rating": "6A",
      "Voltage Rating": "250V AC",
      "Standard": "IS 3854",
      "Manufacturer": "Panasonic Life Solutions India"
    },
    recommendedAccessories: [
      { id: "wire", name: "Finolex Wire 1.5 sq mm (90m)", category: "Electrical", price: 1250, stock: "In Stock", image: "/pdp_finolex_wire.png", multiplier: 0.05 }
    ],
    reviews: [
      { initials: "AK", name: "Arvind K.", role: "Interior Contractor, Pune", rating: 5, date: "5 days ago", comment: "\"Anchor Roma switches are our go-to for all modular wiring projects.\"" }
    ],
    subcategorySlug: "switches-sockets",
    leafSlug: "modular-switches"
  },
  {
    id: "legrand-myrius-socket",
    categoryTitle: "Electrical",
    name: "Legrand Myrius 6A Socket",
    price: "₹95",
    unit: "/ Unit",
    rating: "4.8",
    icon: "bolt",
    link: "#/product/legrand-myrius-socket",
    description: "Legrand Myrius 3-pin modular socket with safety shutters. Sleek, dust-resistant design made of flame-retardant polycarbonate. Provides smooth insert-withdraw operations and long service life.",
    images: ["/pdp_anchor_switch.png"],
    priceTiers: [
      { min: 1, max: 50, price: 95, save: 0 },
      { min: 51, max: 200, price: 88, save: 7 },
      { min: 201, max: 999999, price: 80, save: 16 }
    ],
    specifications: {
      "Brand": "Legrand",
      "Series": "Myrius",
      "Type": "3-Pin Socket with Shutters",
      "Current Rating": "6A / 16A Combined",
      "Color": "Classic White",
      "Manufacturer": "Legrand India Pvt. Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "DK", name: "Deepak K.", role: "Home Owner", rating: 5, date: "2 weeks ago", comment: "\"Sleek design and the safety shutter works perfectly to protect children.\"" }
    ],
    subcategorySlug: "switches-sockets",
    leafSlug: "sockets-plates"
  },
  {
    id: "schneider-opale-switchbox",
    categoryTitle: "Electrical",
    name: "Schneider Opale 12-Module Box",
    price: "₹160",
    unit: "/ Unit",
    rating: "4.6",
    icon: "bolt",
    link: "#/product/schneider-opale-switchbox",
    description: "Schneider Electric Opale modular metal switch box. Rust-resistant sheet steel with multiple cable entry knockouts, designed for flush wall installation of modular switch plates.",
    images: ["/pdp_anchor_switch.png"],
    priceTiers: [
      { min: 1, max: 50, price: 160, save: 0 },
      { min: 51, max: 200, price: 145, save: 9 },
      { min: 201, max: 999999, price: 130, save: 19 }
    ],
    specifications: {
      "Brand": "Schneider Electric",
      "Type": "Metal Flush Box",
      "Capacity": "12 Module",
      "Material": "Galvanized Iron",
      "Manufacturer": "Schneider Electric India"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "AM", name: "Anand M.", role: "Electrical Builder", rating: 4, date: "1 week ago", comment: "\"Sturdy metal box. Screw threads are properly cut.\"" }
    ],
    subcategorySlug: "switches-sockets",
    leafSlug: "switchboxes"
  },

  // Subcategory: protection-devices
  {
    id: "havells-mcb",
    categoryTitle: "Electrical",
    name: "Havells MCB",
    price: "₹850",
    unit: "/ Unit",
    rating: "4.9",
    icon: "bolt",
    link: "#/product/havells-mcb",
    description: "Havells 16A Single Pole Miniature Circuit Breaker (MCB) from the Crabtree range. Provides thermal-magnetic protection against overload and short-circuit conditions. Features a quick trip mechanism, high breaking capacity, and DIN rail mounting for panel board installation.",
    images: ["/pdp_havells_mcb.png"],
    priceTiers: [
      { min: 1, max: 20, price: 850, save: 0 },
      { min: 21, max: 100, price: 780, save: 8 },
      { min: 101, max: 999999, price: 720, save: 15 }
    ],
    specifications: {
      "Brand": "Havells",
      "Type": "Miniature Circuit Breaker (MCB)",
      "Current Rating": "16A",
      "Poles": "Single Pole (SP)",
      "Breaking Capacity": "10 kA",
      "Standard": "IS/IEC 60898-1",
      "Manufacturer": "Havells India Ltd."
    },
    recommendedAccessories: [
      { id: "wire", name: "Finolex Wire 1.5 sq mm (90m)", category: "Electrical", price: 1250, stock: "In Stock", image: "/pdp_finolex_wire.png", multiplier: 0.2 }
    ],
    reviews: [
      { initials: "VM", name: "Venkat M.", role: "Electrical Engineer, Infosys Campus", rating: 5, date: "2 weeks ago", comment: "\"Havells MCBs are the backbone of our panel installations.\"" }
    ],
    subcategorySlug: "protection-devices",
    leafSlug: "mcbs"
  },
  {
    id: "legrand-rccb-40a",
    categoryTitle: "Electrical",
    name: "Legrand RCCB 40A Double Pole",
    price: "₹3,150",
    unit: "/ Unit",
    rating: "4.8",
    icon: "bolt",
    link: "#/product/legrand-rccb-40a",
    description: "Legrand Double Pole Residual Current Circuit Breaker (RCCB) rated for 40A with 30mA sensitivity. Protects human lives against electric shocks and prevents electrical fire outbreaks caused by earth leakage faults.",
    images: ["/pdp_havells_mcb.png"],
    priceTiers: [
      { min: 1, max: 5, price: 3150, save: 0 },
      { min: 6, max: 20, price: 2950, save: 6 },
      { min: 21, max: 999999, price: 2750, save: 12 }
    ],
    specifications: {
      "Brand": "Legrand",
      "Type": "Residual Current Device (RCCB)",
      "Poles": "Double Pole (DP)",
      "Current Rating": "40A",
      "Sensitivity": "30 mA",
      "Manufacturer": "Legrand India"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "PR", name: "Parth R.", role: "Consultant Engineer", rating: 5, date: "2 weeks ago", comment: "\"Mandatory safety device. Legrand sensitivity response is extremely precise.\"" }
    ],
    subcategorySlug: "protection-devices",
    leafSlug: "rccbs"
  },
  {
    id: "l-and-t-db-box",
    categoryTitle: "Electrical",
    name: "L&T 8-Way Distribution Board",
    price: "₹1,850",
    unit: "/ Unit",
    rating: "4.7",
    icon: "bolt",
    link: "#/product/l-and-t-db-box",
    description: "L&T double door distribution board with 8-way MCB capacity. Made of thick sheet steel with epoxy powder coating. Features insulated busbars, neutral link, and earth links for safe power distribution.",
    images: ["/pdp_havells_mcb.png"],
    priceTiers: [
      { min: 1, max: 10, price: 1850, save: 0 },
      { min: 11, max: 50, price: 1720, save: 7 },
      { min: 51, max: 999999, price: 1600, save: 13 }
    ],
    specifications: {
      "Brand": "L&T (Larsen & Toubro)",
      "Type": "Distribution Board (SPN)",
      "Doors": "Double Door (Metal)",
      "Way Capacity": "8-Way",
      "Manufacturer": "L&T Electrical & Automation"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SM", name: "Suresh M.", role: "Panel Wireman", rating: 5, date: "3 weeks ago", comment: "\"Ample space for wiring. Double door lock feels very solid.\"" }
    ],
    subcategorySlug: "protection-devices",
    leafSlug: "distribution-boards"
  },

  // Subcategory: lighting-fans
  {
    id: "crompton-ceiling-fan",
    categoryTitle: "Electrical",
    name: "Crompton Ceiling Fan 1200mm",
    price: "₹2,650",
    unit: "/ Unit",
    rating: "4.7",
    icon: "bolt",
    link: "#/product/crompton-ceiling-fan",
    description: "Crompton Hill Briz 1200mm ceiling fan. High-speed operation with copper motor and powder-coated aluminum blades, delivering excellent air thrust to keep rooms well-ventilated and comfortable.",
    images: ["/pdp_anchor_switch.png"],
    priceTiers: [
      { min: 1, max: 20, price: 2650, save: 0 },
      { min: 21, max: 100, price: 2480, save: 6 },
      { min: 101, max: 999999, price: 2300, save: 13 }
    ],
    specifications: {
      "Brand": "Crompton",
      "Sweep Size": "1200 mm (48 Inch)",
      "Speed": "380 RPM",
      "Power Consumption": "75W",
      "Motor Winding": "100% Copper",
      "Manufacturer": "Crompton Greaves Consumer Electricals Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RP", name: "Raj P.", role: "Hotel Builder", rating: 4, date: "2 weeks ago", comment: "\"Budget friendly fan with high speed. Great value in bulk orders.\"" }
    ],
    subcategorySlug: "lighting-fans",
    leafSlug: "ceiling-fans"
  },
  {
    id: "orient-led-panel",
    categoryTitle: "Electrical",
    name: "Orient LED Panel Light 15W",
    price: "₹380",
    unit: "/ Unit",
    rating: "4.6",
    icon: "bolt",
    link: "#/product/orient-led-panel",
    description: "Orient Electric 15W slim round recessed LED panel light. Cool day light output with high lumen efficacy. Features surge protection, aluminum die-cast body, and long-life LED driver, ideal for false ceiling lighting.",
    images: ["/pdp_anchor_switch.png"],
    priceTiers: [
      { min: 1, max: 50, price: 380, save: 0 },
      { min: 51, max: 200, price: 350, save: 8 },
      { min: 201, max: 999999, price: 320, save: 15 }
    ],
    specifications: {
      "Brand": "Orient Electric",
      "Wattage": "15W",
      "Shape": "Round / Slim",
      "Color Temperature": "6500K (Cool Day Light)",
      "Lumen Output": "1200 lm",
      "Manufacturer": "Orient Electric Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Rishabh K.", role: "Interior Contractor", rating: 5, date: "1 week ago", comment: "\"Very slim profile, fits into narrow false ceilings easily. Brightness is uniform.\"" }
    ],
    subcategorySlug: "lighting-fans",
    leafSlug: "led-panels"
  },
  {
    id: "havells-industrial-floodlight",
    categoryTitle: "Electrical",
    name: "Havells Floodlight 100W",
    price: "₹4,800",
    unit: "/ Unit",
    rating: "4.8",
    icon: "bolt",
    link: "#/product/havells-industrial-floodlight",
    description: "Havells Jeta LED floodlight rated at 100W. Features high pressure die-cast aluminum housing, IP66 weather protection, and high-efficiency glass lens, perfect for construction site illumination and facade lighting.",
    images: ["/pdp_anchor_switch.png"],
    priceTiers: [
      { min: 1, max: 5, price: 4800, save: 0 },
      { min: 6, max: 20, price: 4500, save: 6 },
      { min: 21, max: 999999, price: 4200, save: 12 }
    ],
    specifications: {
      "Brand": "Havells",
      "Wattage": "100W",
      "IP Rating": "IP66 (Waterproof)",
      "Lumen Efficacy": "100 lm/W",
      "Manufacturer": "Havells India Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SS", name: "Suresh Singh", role: "Site Supervisor", rating: 5, date: "3 weeks ago", comment: "\"Extremely bright and withstands heavy monsoon rain without issues.\"" }
    ],
    subcategorySlug: "lighting-fans",
    leafSlug: "industrial-lighting"
  },

  // --- CEMENT ---
  // Subcategory: cement-opc-ppc
  {
    id: "ultratech-cement",
    categoryTitle: "Cement",
    name: "UltraTech Cement",
    price: "₹450",
    unit: "/ Bag",
    rating: "4.8",
    icon: "architecture",
    link: "#/product/ultratech-cement",
    description: "UltraTech OPC 53 Grade Cement — India's most trusted brand for structural concrete. Manufactured with clinker sourced from quality limestone deposits and ground to ultra-fine particle size for higher early strength development.",
    images: ["/pdp_ultratech_cement.png"],
    priceTiers: [
      { min: 1, max: 50, price: 450, save: 0 },
      { min: 51, max: 200, price: 430, save: 4 },
      { min: 201, max: 999999, price: 410, save: 9 }
    ],
    specifications: {
      "Grade": "OPC 53",
      "Weight": "50 kg / bag",
      "Standard": "IS 12269:2013",
      "3-Day Strength": "≥ 27 N/mm²",
      "28-Day Strength": "≥ 53 N/mm²",
      "Manufacturer": "UltraTech Cement Ltd."
    },
    recommendedAccessories: [
      { id: "sand", name: "M-Sand (Manufactured Sand) 1 Ton", category: "Cement", price: 1800, stock: "In Stock", image: "/pdp_ultratech_cement.png", multiplier: 2 }
    ],
    reviews: [
      { initials: "CK", name: "Chandrashekhar K.", role: "Structural Engineer, L&T Construction", rating: 5, date: "1 week ago", comment: "\"UltraTech OPC 53 consistently meets the 53 N/mm² target at 28 days.\"" }
    ],
    subcategorySlug: "cement-opc-ppc",
    leafSlug: "opc-53"
  },
  {
    id: "ambuja-cement",
    categoryTitle: "Cement",
    name: "Ambuja Cement",
    price: "₹445",
    unit: "/ Bag",
    rating: "4.7",
    icon: "architecture",
    link: "#/product/ambuja-cement",
    description: "Ambuja Plus Portland Pozzolana Cement (PPC) with superior water-resistance properties. Engineered with fly ash addition that densifies the concrete matrix, significantly reducing permeability and enhancing long-term durability.",
    images: ["/pdp_ambuja_cement.png"],
    priceTiers: [
      { min: 1, max: 50, price: 445, save: 0 },
      { min: 51, max: 200, price: 425, save: 4 },
      { min: 201, max: 999999, price: 405, save: 9 }
    ],
    specifications: {
      "Grade": "PPC (Portland Pozzolana Cement)",
      "Weight": "50 kg / bag",
      "Standard": "IS 1489 (Part 1):1991",
      "Fly Ash Content": "15–35%",
      "Manufacturer": "Ambuja Cements Ltd. (Holcim Group)"
    },
    recommendedAccessories: [
      { id: "sand", name: "River Sand (Fine Aggregate) 1 Ton", category: "Cement", price: 1600, stock: "In Stock", image: "/pdp_ultratech_cement.png", multiplier: 3 }
    ],
    reviews: [
      { initials: "JP", name: "Jayesh P.", role: "Civil Engineer, Surat", rating: 5, date: "2 weeks ago", comment: "\"Ambuja Plus is our default for coastal projects.\"" }
    ],
    subcategorySlug: "cement-opc-ppc",
    leafSlug: "ppc"
  },
  {
    id: "acc-cement",
    categoryTitle: "Cement",
    name: "ACC Cement",
    price: "₹440",
    unit: "/ Bag",
    rating: "4.6",
    icon: "architecture",
    link: "#/product/acc-cement",
    description: "ACC Gold OPC 43 Grade Cement — a proven, reliable choice for general construction applications including plastering, brickwork, flooring, and non-structural concrete.",
    images: ["/pdp_acc_cement.png"],
    priceTiers: [
      { min: 1, max: 50, price: 440, save: 0 },
      { min: 51, max: 200, price: 420, save: 5 },
      { min: 201, max: 999999, price: 400, save: 9 }
    ],
    specifications: {
      "Grade": "OPC 43",
      "Weight": "50 kg / bag",
      "Standard": "IS 8112:2013",
      "28-Day Strength": "≥ 43 N/mm²",
      "Manufacturer": "ACC Limited (Holcim Group)"
    },
    recommendedAccessories: [
      { id: "sand", name: "M-Sand (Plastering Grade) 1 Ton", category: "Cement", price: 1600, stock: "In Stock", image: "/pdp_ultratech_cement.png", multiplier: 4 }
    ],
    reviews: [
      { initials: "BS", name: "Bhupesh S.", role: "Mason Contractor, Indore", rating: 5, date: "2 weeks ago", comment: "\"ACC Gold 43 is perfect for plastering and brickwork.\"" }
    ],
    subcategorySlug: "cement-opc-ppc",
    leafSlug: "opc-43"
  },

  // Subcategory: ready-mix
  {
    id: "ultratech-rmc-m20",
    categoryTitle: "Cement",
    name: "UltraTech RMC M20 Concrete",
    price: "₹4,800",
    unit: "/ Cu M",
    rating: "4.7",
    icon: "architecture",
    link: "#/product/ultratech-rmc-m20",
    description: "UltraTech Ready Mix Concrete (RMC) M20 grade concrete. Fully computerized batch mixing with precise water-cement ratio, delivered in transit mixers directly to your site for columns, slabs, and beam casting.",
    images: ["/pdp_ultratech_cement.png"],
    priceTiers: [
      { min: 6, max: 20, price: 4800, save: 0 },
      { min: 21, max: 100, price: 4600, save: 4 },
      { min: 101, max: 999999, price: 4400, save: 8 }
    ],
    specifications: {
      "Grade": "M20 (1:1.5:3 Equivalent)",
      "Standard": "IS 4926:2003",
      "Characteristic Strength": "20 N/mm² at 28 days",
      "Slump Value": "100-120 mm (Pumpable)",
      "Manufacturer": "UltraTech Concrete Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RN", name: "Ramesh N.", role: "Site Supervisor", rating: 5, date: "1 week ago", comment: "\"Delivered on time and slump was perfectly pumpable. 28 days cube test passed.\"" }
    ],
    subcategorySlug: "ready-mix",
    leafSlug: "m20-concrete"
  },
  {
    id: "acc-rmc-m25",
    categoryTitle: "Cement",
    name: "ACC RMC M25 Concrete",
    price: "₹5,200",
    unit: "/ Cu M",
    rating: "4.8",
    icon: "architecture",
    link: "#/product/acc-rmc-m25",
    description: "ACC Ready Mix Concrete M25 grade. Engineered for high strength structural load bearing elements. Batch mixed with quality OPC cement, aggregates, and plasticizers, delivered with full quality logs.",
    images: ["/pdp_acc_cement.png"],
    priceTiers: [
      { min: 6, max: 20, price: 5200, save: 0 },
      { min: 21, max: 100, price: 4950, save: 4 },
      { min: 101, max: 999999, price: 4700, save: 9 }
    ],
    specifications: {
      "Grade": "M25 (1:1:2 Equivalent)",
      "Standard": "IS 4926",
      "Characteristic Strength": "25 N/mm² at 28 days",
      "Slump Value": "110 mm",
      "Manufacturer": "ACC Concrete Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "JM", name: "Jatin M.", role: "Builder, Bengaluru", rating: 5, date: "3 weeks ago", comment: "\"Consistent mixture. Structural stability tests came out perfectly.\"" }
    ],
    subcategorySlug: "ready-mix",
    leafSlug: "m25-concrete"
  },
  {
    id: "ambuja-rmc-m30",
    categoryTitle: "Cement",
    name: "Ambuja RMC M30 Concrete",
    price: "₹5,600",
    unit: "/ Cu M",
    rating: "4.8",
    icon: "architecture",
    link: "#/product/ambuja-rmc-m30",
    description: "Ambuja Ready Mix Concrete M30 grade, designed for heavy load industrial flooring, foundation rafts, and high-rise structural designs. Includes durable fly ash content for thermal crack control.",
    images: ["/pdp_ambuja_cement.png"],
    priceTiers: [
      { min: 6, max: 20, price: 5600, save: 0 },
      { min: 21, max: 100, price: 5350, save: 4 },
      { min: 101, max: 999999, price: 5100, save: 8 }
    ],
    specifications: {
      "Grade": "M30",
      "Characteristic Strength": "30 N/mm²",
      "Slump Value": "120 mm",
      "Manufacturer": "Ambuja Cements Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SB", name: "Siddharth B.", role: "Structural Consultant", rating: 5, date: "2 weeks ago", comment: "\"Highly recommended for large raft castings. Excellent fly ash content control.\"" }
    ],
    subcategorySlug: "ready-mix",
    leafSlug: "m30-concrete"
  },

  // Subcategory: concrete-products
  {
    id: "birla-aerocon-solid-block",
    categoryTitle: "Cement",
    name: "Birla Aerocon Concrete Blocks",
    price: "₹48",
    unit: "/ Piece",
    rating: "4.6",
    icon: "architecture",
    link: "#/product/birla-aerocon-solid-block",
    description: "Birla Aerocon solid concrete blocks are highly durable, load-bearing blocks for masonry wall construction. Offering excellent compressive strength and dimensional consistency, replacing traditional bricks to save mortar.",
    images: ["/pdp_ultratech_cement.png"],
    priceTiers: [
      { min: 100, max: 1000, price: 48, save: 0 },
      { min: 1001, max: 5000, price: 45, save: 6 },
      { min: 5001, max: 999999, price: 42, save: 12 }
    ],
    specifications: {
      "Material": "Concrete / Cement",
      "Compressive Strength": "≥ 5 N/mm²",
      "Dimensions": "400 x 200 x 200 mm",
      "Weight": "16 Kg",
      "Manufacturer": "Birla Aerocon (HIL Limited)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "DS", name: "Devendra S.", role: "Masonry Contractor", rating: 5, date: "2 weeks ago", comment: "\"Speeds up work. We saved about 25% on jointing mortar using these blocks.\"" }
    ],
    subcategorySlug: "concrete-products",
    leafSlug: "solid-blocks"
  },
  {
    id: "sobha-paver-blocks",
    categoryTitle: "Cement",
    name: "Sobha Concrete Paver Blocks",
    price: "₹18",
    unit: "/ Piece",
    rating: "4.7",
    icon: "architecture",
    link: "#/product/sobha-paver-blocks",
    description: "Sobha high-strength concrete interlocking paver blocks. Ideal for outdoor pathways, driveways, and parking areas, offering high load bearing capacity and slip resistance.",
    images: ["/pdp_ultratech_cement.png"],
    priceTiers: [
      { min: 500, max: 2000, price: 18, save: 0 },
      { min: 2001, max: 10000, price: 16.5, save: 8 },
      { min: 10001, max: 999999, price: 15.0, save: 16 }
    ],
    specifications: {
      "Type": "Unipave Interlocking",
      "Thickness": "60 mm",
      "Grade": "M30 Concrete",
      "Color": "Red / Grey",
      "Manufacturer": "Sobha Restoplus (Sobha Ltd.)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SM", name: "Sanjay M.", role: "Villa Landscaper", rating: 5, date: "1 week ago", comment: "\"Very premium finish. The interlocking is perfect, no loose edges.\"" }
    ],
    subcategorySlug: "concrete-products",
    leafSlug: "paver-blocks"
  },
  {
    id: "l-and-t-kerbstones",
    categoryTitle: "Cement",
    name: "L&T Precast Concrete Kerbstones",
    price: "₹140",
    unit: "/ Piece",
    rating: "4.5",
    icon: "architecture",
    link: "#/product/l-and-t-kerbstones",
    description: "L&T precast concrete kerbstones for road edges, parking demarcations, and garden boundaries. Produced using advanced hydraulic press machinery, ensuring consistent density and dimensions.",
    images: ["/pdp_ultratech_cement.png"],
    priceTiers: [
      { min: 50, max: 200, price: 140, save: 0 },
      { min: 201, max: 1000, price: 130, save: 7 },
      { min: 1001, max: 999999, price: 120, save: 14 }
    ],
    specifications: {
      "Material": "Concrete",
      "Dimensions": "300 x 300 x 150 mm",
      "Weight": "28 Kg",
      "Manufacturer": "L&T Precast Division"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "PK", name: "Pradeep K.", role: "Road Contractor", rating: 4, date: "3 weeks ago", comment: "\"Solid kerbstones. Compressive strength is uniform, didn't break during unloading.\"" }
    ],
    subcategorySlug: "concrete-products",
    leafSlug: "kerbstones"
  },

  // --- STEEL ---
  // Subcategory: tmt-bars
  {
    id: "tata-tiscon-tmt",
    categoryTitle: "Steel",
    name: "Tata Tiscon SD TMT Rebars",
    price: "₹68,500",
    unit: "/ Ton",
    rating: "4.9",
    icon: "construction",
    link: "#/product/tata-tiscon-tmt",
    description: "Tata Tiscon SD (Super Ductile) TMT Rebars are high-strength reinforcement bars designed for high-stress zones and earthquake-prone structures. Manufactured with advanced Thermo-Mechanical Treatment, offering superior bond strength, weldability, and bending capability.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 1, max: 10, price: 68500, save: 0 },
      { min: 11, max: 50, price: 66000, save: 3 },
      { min: 51, max: 999999, price: 64000, save: 6 }
    ],
    specifications: {
      "Grade": "Fe 500D / SD",
      "Standard": "IS 1786",
      "Diameter": "12 mm",
      "Manufacturer": "Tata Steel Limited"
    },
    subcategorySlug: "tmt-bars",
    leafSlug: "sd-tmt"
  },
  {
    id: "jsw-neosteel-tmt",
    categoryTitle: "Steel",
    name: "JSW Neosteel TMT Bar",
    price: "₹67,000",
    unit: "/ Ton",
    rating: "4.8",
    icon: "construction",
    link: "#/product/jsw-neosteel-tmt",
    description: "JSW Neosteel TMT Bars are high-strength thermo-mechanically treated steel reinforcement bars. They possess excellent bond strength, ductility, and high fatigue resistance, making them ideal for heavy commercial and infrastructure projects.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 1, max: 10, price: 67000, save: 0 },
      { min: 11, max: 50, price: 65000, save: 3 },
      { min: 51, max: 999999, price: 63000, save: 6 }
    ],
    specifications: {
      "Grade": "Fe 500D",
      "Standard": "IS 1786",
      "Diameter": "10 mm",
      "Manufacturer": "JSW Steel Limited"
    },
    subcategorySlug: "tmt-bars",
    leafSlug: "fe-500d"
  },
  {
    id: "sail-tmt-rebar",
    categoryTitle: "Steel",
    name: "SAIL TMT HCR Rebars",
    price: "₹66,000",
    unit: "/ Ton",
    rating: "4.7",
    icon: "construction",
    link: "#/product/sail-tmt-rebar",
    description: "SAIL TMT HCR (High Corrosion Resistant) Rebars are specifically formulated steel reinforcement bars with alloying elements like copper, chromium, and phosphorus to resist corrosion in marine, industrial, and highly humid environments.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 1, max: 10, price: 66000, save: 0 },
      { min: 11, max: 50, price: 64000, save: 3 },
      { min: 51, max: 999999, price: 62000, save: 6 }
    ],
    specifications: {
      "Grade": "Fe 550D / HCR",
      "Standard": "IS 1786",
      "Diameter": "16 mm",
      "Manufacturer": "Steel Authority of India Limited"
    },
    subcategorySlug: "tmt-bars",
    leafSlug: "fe-550d"
  },

  // Subcategory: angles-channels
  {
    id: "sail-ms-angle",
    categoryTitle: "Steel",
    name: "SAIL MS Equal Angle",
    price: "₹62,000",
    unit: "/ Ton",
    rating: "4.6",
    icon: "construction",
    link: "#/product/sail-ms-angle",
    description: "SAIL Hot Rolled Mild Steel Equal Angle section. High structural stability and excellent weldability, ideal for structural truss designs, warehouse frames, and heavy engineering assemblies.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 1, max: 5, price: 62000, save: 0 },
      { min: 6, max: 20, price: 60500, save: 2 },
      { min: 21, max: 999999, price: 58500, save: 5 }
    ],
    specifications: {
      "Material": "Mild Steel (IS 2062)",
      "Dimensions": "50 x 50 x 5 mm",
      "Type": "Equal Angle",
      "Manufacturer": "Steel Authority of India Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "DK", name: "Deepak Kumar", role: "Fabrication Contractor", rating: 5, date: "3 weeks ago", comment: "\"SAIL angle sections have very consistent dimensions. Straight and perfect 90 degrees.\"" }
    ],
    subcategorySlug: "angles-channels",
    leafSlug: "ms-angles"
  },
  {
    id: "vizag-steel-channel",
    categoryTitle: "Steel",
    name: "Vizag Steel Channel",
    price: "₹63,500",
    unit: "/ Ton",
    rating: "4.7",
    icon: "construction",
    link: "#/product/vizag-steel-channel",
    description: "Vizag Steel mild steel channel section. Known for its high load-bearing capacity and tensile strength, widely used in supporting structure columns and building foundations.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 1, max: 5, price: 63500, save: 0 },
      { min: 6, max: 20, price: 61800, save: 2 },
      { min: 21, max: 999999, price: 59900, save: 5 }
    ],
    specifications: {
      "Material": "MS (IS 2062)",
      "Dimensions": "100 x 50 mm (ISMC 100)",
      "Standard": "IS 808",
      "Manufacturer": "Rashtriya Ispat Nigam Ltd. (Vizag Steel)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "JM", name: "Jatin M.", role: "Infrastructure Builder", rating: 5, date: "2 weeks ago", comment: "\"Top quality steel channel. Vizag steel structural members are highly reliable.\"" }
    ],
    subcategorySlug: "angles-channels",
    leafSlug: "ms-channels"
  },
  {
    id: "jsw-structural-beam",
    categoryTitle: "Steel",
    name: "JSW Structural I-Beam",
    price: "₹65,000",
    unit: "/ Ton",
    rating: "4.8",
    icon: "construction",
    link: "#/product/jsw-structural-beam",
    description: "JSW high-quality structural steel I-Beam (NPB). Hot rolled for heavy construction support, industrial sheds, and multi-level floor supports.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 1, max: 5, price: 65000, save: 0 },
      { min: 6, max: 20, price: 63200, save: 2 },
      { min: 21, max: 999999, price: 61000, save: 6 }
    ],
    specifications: {
      "Material": "Carbon Steel (IS 2062 E250)",
      "Dimensions": "150 x 75 mm (ISMB 150)",
      "Standard": "IS 808:1989",
      "Manufacturer": "JSW Steel Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "VB", name: "Vikram B.", role: "Industrial Architect", rating: 5, date: "1 month ago", comment: "\"Clean finishing and high load carrying capacity. Perfect for warehouse portals.\"" }
    ],
    subcategorySlug: "angles-channels",
    leafSlug: "i-beams"
  },

  // Subcategory: beams-mesh
  {
    id: "tata-wiron-binding-wire",
    categoryTitle: "Steel",
    name: "Tata Wiron Binding Wire",
    price: "₹85",
    unit: "/ Kg",
    rating: "4.7",
    icon: "construction",
    link: "#/product/tata-wiron-binding-wire",
    description: "Tata Wiron GI (Galvanized Iron) binding wire in 18 Gauge. Features optimal soft-annealed property that gives it high flexibility to tie steel TMT rebars securely without snapping.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 50, max: 200, price: 85, save: 0 },
      { min: 201, max: 1000, price: 80, save: 5 },
      { min: 1001, max: 999999, price: 74, save: 12 }
    ],
    specifications: {
      "Material": "Soft Annealed GI Wire",
      "Wire Gauge": "18 SWG (1.2 mm)",
      "Coating": "Zinc Galvanized",
      "Manufacturer": "Tata Steel (Wiron Division)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Ramesh K.", role: "Rebar Supervisor", rating: 5, date: "1 week ago", comment: "\"Very soft and flexible. Tying is fast, workers prefer Wiron because it doesn't hurt their hands.\"" }
    ],
    subcategorySlug: "beams-mesh",
    leafSlug: "binding-wires"
  },
  {
    id: "jsw-welded-wire-mesh",
    categoryTitle: "Steel",
    name: "JSW Welded Wire Mesh",
    price: "₹75",
    unit: "/ Sq M",
    rating: "4.6",
    icon: "construction",
    link: "#/product/jsw-welded-wire-mesh",
    description: "JSW welded wire mesh for concrete slab reinforcement and safety fencing. Heavy-duty 10 gauge wire welded electronically at intersections, ensuring consistent square grid spacing.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkAjGBRx0Q"],
    priceTiers: [
      { min: 10, max: 50, price: 75, save: 0 },
      { min: 51, max: 200, price: 70, save: 6 },
      { min: 201, max: 999999, price: 65, save: 13 }
    ],
    specifications: {
      "Material": "Galvanized Carbon Steel",
      "Wire Diameter": "3.2 mm (10 Gauge)",
      "Grid Size": "100 x 100 mm (4\" x 4\")",
      "Manufacturer": "JSW Steel Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "AP", name: "Amit P.", role: "Flooring Contractor", rating: 4, date: "3 weeks ago", comment: "\"Perfect for control joints in industrial screed flooring. Good welds.\"" }
    ],
    subcategorySlug: "beams-mesh",
    leafSlug: "wire-mesh"
  },
  {
    id: "vizag-structural-mesh",
    categoryTitle: "Steel",
    name: "Vizag Steel Structural Mesh",
    price: "₹88",
    unit: "/ Sq M",
    rating: "4.5",
    icon: "construction",
    link: "#/product/vizag-structural-mesh",
    description: "Vizag Steel heavy structural reinforcing mesh. Heavy wire thickness designed for road construction concrete bases and retaining walls.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBNtXD0KwSX7wvT0wmEArXCCc8qtTw8EtEKUx5bM439rJGKsuZ8R2ngND87e4qkIKdYe_BZsBpkZS1yUFoJ2Mgzb1e6sAVOsk6fBqoJSt3kjokjMIXXOLdrtGh8RTSovAzIAxZoeOrSTq86u8nUa894k30HkrnTk13x3YCPub_PhdBJGZe693M8r-T48CIgEeR5flYJ67TI9rJlI3-qBpNCqq4eAJTBj2YaMS02S5v-GSGCqgyL1-aoFuOknSFXwE7UMnkDjGBRx0Q"],
    priceTiers: [
      { min: 10, max: 50, price: 88, save: 0 },
      { min: 51, max: 200, price: 82, save: 6 },
      { min: 201, max: 999999, price: 76, save: 13 }
    ],
    specifications: {
      "Material": "Carbon Steel",
      "Wire Diameter": "4.0 mm",
      "Grid Size": "150 x 150 mm",
      "Manufacturer": "Vizag Steel"
    },
    recommendedAccessories: [],
    reviews: [],
    subcategorySlug: "beams-mesh",
    leafSlug: "wire-mesh"
  },

  // --- PAINTS ---
  // Subcategory: interior-exterior-paints
  {
    id: "asian-paints-apex",
    categoryTitle: "Paints",
    name: "Asian Paints Apex Ultima",
    price: "₹5,400",
    unit: "/ Bucket",
    rating: "4.8",
    icon: "format_paint",
    link: "#/product/asian-paints-apex",
    description: "Asian Paints Apex Ultima is a premium water-based exterior wall finish with advanced silicone additives. It features high dirt pick-up resistance and anti-algal protection, ensuring exterior walls stay clean and vibrant for years.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 5, price: 5400, save: 0 },
      { min: 6, max: 20, price: 5100, save: 5 },
      { min: 21, max: 999999, price: 4850, save: 10 }
    ],
    specifications: {
      "Type": "Exterior Emulsion",
      "Volume": "20 Liters",
      "Finish": "Semi-Gloss",
      "Manufacturer": "Asian Paints Limited"
    },
    subcategorySlug: "interior-exterior-paints",
    leafSlug: "exterior-emulsion"
  },
  {
    id: "berger-silk-glamor",
    categoryTitle: "Paints",
    name: "Berger Silk Glamor Paint 20L",
    price: "₹6,200",
    unit: "/ Bucket",
    rating: "4.7",
    icon: "format_paint",
    link: "#/product/berger-silk-glamor",
    description: "Berger Silk Glamor Luxury Interior Emulsion is formulated with ultra-premium emulsions and vibrant pigments. Provides a rich, silk-like finish that is highly washable, stain-resistant, and free from volatile organic compounds.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 5, price: 6200, save: 0 },
      { min: 6, max: 20, price: 5900, save: 5 },
      { min: 21, max: 999999, price: 5600, save: 9 }
    ],
    specifications: {
      "Type": "Interior Emulsion",
      "Volume": "20 Liters",
      "Finish": "High Sheen / Metallic Glint",
      "Washability": "Excellent (Stain Scrub resistant)",
      "Manufacturer": "Berger Paints India Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Rajesh K.", role: "Painting Contractor", rating: 5, date: "2 weeks ago", comment: "\"Very easy to apply. The sheen is very uniform under LED lights.\"" }
    ],
    subcategorySlug: "interior-exterior-paints",
    leafSlug: "interior-emulsion"
  },
  {
    id: "nerolac-impressions-paint",
    categoryTitle: "Paints",
    name: "Nerolac Impressions Paint 20L",
    price: "₹5,800",
    unit: "/ Bucket",
    rating: "4.6",
    icon: "format_paint",
    link: "#/product/nerolac-impressions",
    description: "Kansai Nerolac Impressions Ultra HD Luxury Emulsion. High micro-gel formula that hides micro-cracks and provides a smooth velvet-like finish to internal walls.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 5, price: 5800, save: 0 },
      { min: 6, max: 20, price: 5500, save: 5 },
      { min: 21, max: 999999, price: 5200, save: 10 }
    ],
    specifications: {
      "Type": "Interior Emulsion",
      "Volume": "20 Liters",
      "Finish": "Rich Matt / Satin",
      "Manufacturer": "Kansai Nerolac Paints Limited"
    },
    recommendedAccessories: [],
    reviews: [],
    subcategorySlug: "interior-exterior-paints",
    leafSlug: "interior-emulsion"
  },

  // Subcategory: waterproofing
  {
    id: "dr-fixit-waterproof",
    categoryTitle: "Paints",
    name: "Dr. Fixit Waterproofing",
    price: "₹1,200",
    unit: "/ Can",
    rating: "4.7",
    icon: "format_paint",
    link: "#/product/dr-fixit-waterproof",
    description: "Dr. Fixit Super Latex is a styrene-butadiene rubber (SBR) based liquid waterproofing and bonding agent for concrete and plaster repairs. It improves bonding strength and waterproofing capability in bathrooms, terraces, and external walls.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 10, price: 1200, save: 0 },
      { min: 11, max: 50, price: 1120, save: 6 },
      { min: 51, max: 999999, price: 1050, save: 12 }
    ],
    specifications: {
      "Type": "SBR Latex Polymer",
      "Volume": "5 Liters",
      "Usage": "Waterproofing / Bonding",
      "Manufacturer": "Pidilite Industries Limited"
    },
    subcategorySlug: "waterproofing",
    leafSlug: "liquid-membrane"
  },
  {
    id: "asian-paints-dampsheath",
    categoryTitle: "Paints",
    name: "Asian Paints SmartCare Damp Sheath",
    price: "₹1,850",
    unit: "/ Can",
    rating: "4.6",
    icon: "format_paint",
    link: "#/product/asian-paints-dampsheath",
    description: "Asian Paints SmartCare Damp Sheath is a high-performance elastomeric waterproofing coating for internal walls. Forms a breathable yet water barrier film that prevents dampness and salt efflorescence.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 10, price: 1850, save: 0 },
      { min: 11, max: 50, price: 1720, save: 7 },
      { min: 51, max: 999999, price: 1600, save: 13 }
    ],
    specifications: {
      "Type": "Acrylic Waterproofing Coating",
      "Volume": "4 Liters",
      "Coverage": "40 Sq Ft / Liter",
      "Manufacturer": "Asian Paints Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SV", name: "Srinivas V.", role: "Civil Engineer", rating: 4, date: "3 weeks ago", comment: "\"Effective waterproofing for internal damp walls before painting.\"" }
    ],
    subcategorySlug: "waterproofing",
    leafSlug: "damp-proof"
  },
  {
    id: "berger-homeshield-waterproof",
    categoryTitle: "Paints",
    name: "Berger Home Shield Liquid 5L",
    price: "₹1,400",
    unit: "/ Can",
    rating: "4.5",
    icon: "format_paint",
    link: "#/product/berger-homeshield-waterproof",
    description: "Berger Home Shield Latex Shield is a waterproofing additive for cement mortar. Reduces water penetration and improves flexibility of sand-cement plaster on exterior walls.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 10, price: 1400, save: 0 },
      { min: 11, max: 50, price: 1300, save: 7 },
      { min: 51, max: 999999, price: 1200, save: 14 }
    ],
    specifications: {
      "Type": "Latex Water Barrier Additive",
      "Volume": "5 Liters",
      "Manufacturer": "Berger Paints India Limited"
    },
    recommendedAccessories: [],
    reviews: [],
    subcategorySlug: "waterproofing",
    leafSlug: "liquid-membrane"
  },

  // Subcategory: adhesives-grouts
  {
    id: "fevicol-sh-adhesive",
    categoryTitle: "Paints",
    name: "Fevicol SH Adhesive",
    price: "₹280",
    unit: "/ Kg",
    rating: "4.9",
    icon: "format_paint",
    link: "#/product/fevicol-sh-adhesive",
    description: "Fevicol SH is a synthetic resin adhesive for woodwork and furniture assembly. It provides high bonding strength, heat resistance, and long-term durability, making it the most trusted wood adhesive in India.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 20, price: 280, save: 0 },
      { min: 21, max: 100, price: 260, save: 7 },
      { min: 101, max: 999999, price: 240, save: 14 }
    ],
    specifications: {
      "Type": "Synthetic Resin Adhesive",
      "Pack Size": "1 Kg",
      "Drying Time": "24 Hours",
      "Manufacturer": "Pidilite Industries Limited"
    },
    subcategorySlug: "adhesives-grouts",
    leafSlug: "wood-adhesives"
  },
  {
    id: "araldite-standard-epoxy",
    categoryTitle: "Paints",
    name: "Araldite Standard Epoxy 180g",
    price: "₹220",
    unit: "/ Pack",
    rating: "4.8",
    icon: "format_paint",
    link: "#/product/araldite-standard-epoxy",
    description: "Araldite Standard is a heavy-duty two-part epoxy adhesive (Resin & Hardener). Providing a structural, high-strength bond that is resistant to water, heat, and chemicals, suitable for metals, ceramics, wood, and glass.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 50, price: 220, save: 0 },
      { min: 51, max: 200, price: 205, save: 6 },
      { min: 201, max: 999999, price: 190, save: 13 }
    ],
    specifications: {
      "Type": "Two-Part Epoxy Adhesive",
      "Weight": "180 Grams (Resin + Hardener)",
      "Set Time": "6 Hours",
      "Full Cure": "24 Hours",
      "Manufacturer": "Huntsman Advanced Materials (Araldite)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "KK", name: "Kamal K.", role: "Maintenance Engineer", rating: 5, date: "1 week ago", comment: "\"The strongest bond for metal and stone repairs. Standard setting gives time to adjust.\"" }
    ],
    subcategorySlug: "adhesives-grouts",
    leafSlug: "tile-adhesives"
  },
  {
    id: "laticrete-epoxy-grout",
    categoryTitle: "Paints",
    name: "Laticrete Epoxy Grout SP-100",
    price: "₹1,850",
    unit: "/ Pack",
    rating: "4.7",
    icon: "format_paint",
    link: "#/product/laticrete-epoxy-grout",
    description: "Laticrete SP-100 is a premium stain-free color-fast epoxy grout for wall and floor tiles. Resists bacteria growth, water absorption, and chemical attack, perfect for kitchens and bathroom tiles.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 10, price: 1850, save: 0 },
      { min: 11, max: 50, price: 1750, save: 5 },
      { min: 51, max: 999999, price: 1650, save: 10 }
    ],
    specifications: {
      "Type": "Epoxy Tile Joint Grout",
      "Weight": "1 Kg Pack",
      "Stain Proof": "Yes",
      "Manufacturer": "MYK Laticrete India Pvt. Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RP", name: "Ramesh Patel", role: "Tile Contractor", rating: 5, date: "2 weeks ago", comment: "\"Highly stain resistant. Clients are happy with the color consistency.\"" }
    ],
    subcategorySlug: "adhesives-grouts",
    leafSlug: "tile-grouts"
  },

  // --- TILES ---
  // Subcategory: vitrified-ceramic
  {
    id: "kajaria-vitrified-tiles",
    categoryTitle: "Tiles",
    name: "Kajaria Vitrified Tiles",
    price: "₹65",
    unit: "/ Sq Ft",
    rating: "4.8",
    icon: "layers",
    link: "#/product/kajaria-vitrified-tiles",
    description: "Kajaria double charged vitrified floor tiles with high durability and polished surface. Extremely resistant to stains, heavy foot traffic, and wear, suitable for living rooms and commercial flooring.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 500, price: 65, save: 0 },
      { min: 501, max: 2000, price: 61, save: 6 },
      { min: 2001, max: 999999, price: 57, save: 12 }
    ],
    specifications: {
      "Type": "Double Charged Vitrified",
      "Size": "600x600 mm (2x2 ft)",
      "Finish": "Polished Glossy",
      "Manufacturer": "Kajaria Ceramics Limited"
    },
    subcategorySlug: "vitrified-ceramic",
    leafSlug: "double-charged"
  },
  {
    id: "somany-gvt-tiles",
    categoryTitle: "Tiles",
    name: "Somany Glazed Vitrified Tiles",
    price: "₹78",
    unit: "/ Sq Ft",
    rating: "4.7",
    icon: "layers",
    link: "#/product/somany-gvt-tiles",
    description: "Somany Glazed Vitrified Tiles (GVT) featuring digital wood and marble design prints. Tough glazed top layer ensures high scratch resistance while offering luxury interior design aesthetics.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 500, price: 78, save: 0 },
      { min: 501, max: 2000, price: 73, save: 6 },
      { min: 2001, max: 999999, price: 68, save: 12 }
    ],
    specifications: {
      "Type": "Glazed Vitrified (GVT)",
      "Size": "800x800 mm",
      "Finish": "Satin / Matte",
      "Manufacturer": "Somany Ceramics Limited"
    },
    recommendedAccessories: [
      { id: "adhesive", name: "Araldite Standard Epoxy 180g", category: "Paints", price: 220, stock: "In Stock", image: "/pdp_cpvc_elbow.png", multiplier: 0.1 }
    ],
    reviews: [
      { initials: "NK", name: "Nitin K.", role: "Architect", rating: 5, date: "3 weeks ago", comment: "\"Somany wood prints look incredibly natural. High scratch resistance tested.\"" }
    ],
    subcategorySlug: "vitrified-ceramic",
    leafSlug: "gvt-pgvt"
  },
  {
    id: "nitco-ceramic-wall-tiles",
    categoryTitle: "Tiles",
    name: "Nitco Ceramic Wall Tiles",
    price: "₹45",
    unit: "/ Sq Ft",
    rating: "4.5",
    icon: "layers",
    link: "#/product/nitco-ceramic-wall-tiles",
    description: "Nitco premium ceramic wall tiles with digital patterns. Perfect for kitchen backsplashes, bathroom walls, and feature walls, offering easy cleaning and water resistance.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 500, price: 45, save: 0 },
      { min: 501, max: 2000, price: 42, save: 6 },
      { min: 2001, max: 999999, price: 39, save: 13 }
    ],
    specifications: {
      "Type": "Ceramic Wall Tile",
      "Size": "300x450 mm",
      "Finish": "Glossy / Anti-stain",
      "Manufacturer": "Nitco Limited"
    },
    recommendedAccessories: [],
    reviews: [],
    subcategorySlug: "vitrified-ceramic",
    leafSlug: "ceramic-wall"
  },

  // Subcategory: granite-marble
  {
    id: "italian-white-marble",
    categoryTitle: "Tiles",
    name: "Premium Italian White Marble",
    price: "₹350",
    unit: "/ Sq Ft",
    rating: "4.9",
    icon: "layers",
    link: "#/product/italian-white-marble",
    description: "Imported Italian white marble slabs with exquisite grey veining. Highly polished for a luxurious reflective finish, ideal for high-end residential lobbies and luxury living room floors.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 100, price: 350, save: 0 },
      { min: 101, max: 500, price: 330, save: 5 },
      { min: 501, max: 999999, price: 310, save: 11 }
    ],
    specifications: {
      "Type": "Imported Natural Marble",
      "Thickness": "18 mm",
      "Origin": "Italy",
      "Finish": "Polished"
    },
    subcategorySlug: "granite-marble",
    leafSlug: "italian-marble"
  },
  {
    id: "jhansi-red-granite",
    categoryTitle: "Tiles",
    name: "Jhansi Red Granite Slab",
    price: "₹140",
    unit: "/ Sq Ft",
    rating: "4.8",
    icon: "layers",
    link: "#/product/jhansi-red-granite",
    description: "Premium Indian natural Jhansi Red granite slab. Known for its uniform grain structure and deep red color, highly recommended for kitchen countertops, stairs steps, and outdoor wall cladding.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 200, price: 140, save: 0 },
      { min: 201, max: 1000, price: 130, save: 7 },
      { min: 1001, max: 999999, price: 120, save: 14 }
    ],
    specifications: {
      "Type": "Natural Granite",
      "Thickness": "18 mm",
      "Origin": "India (Jhansi)",
      "Finish": "Lapatro / Polished"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Rajiv K.", role: "Kitchen Builder", rating: 5, date: "2 weeks ago", comment: "\"Jhansi Red is very hard granite. High gloss polish lasts forever.\"" }
    ],
    subcategorySlug: "granite-marble",
    leafSlug: "granite-slabs"
  },
  {
    id: "makrana-white-marble",
    categoryTitle: "Tiles",
    name: "Makrana White Marble Slab",
    price: "₹260",
    unit: "/ Sq Ft",
    rating: "4.9",
    icon: "layers",
    link: "#/product/makrana-white-marble",
    description: "The most famous Indian natural marble from Makrana, Rajasthan. Exceptionally high calcium carbonate content, ensuring pure white shine that increases with aging and use.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 100, price: 260, save: 0 },
      { min: 101, max: 500, price: 245, save: 5 },
      { min: 501, max: 999999, price: 230, save: 11 }
    ],
    specifications: {
      "Type": "Natural White Marble",
      "Thickness": "16 mm",
      "Origin": "Makrana, India",
      "Finish": "Unpolished Slabs"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "VM", name: "Vinod M.", role: "Marble Specialist", rating: 5, date: "1 month ago", comment: "\"Genuine Makrana quality. The crystal structure is very dense, guarantees high shine.\"" }
    ],
    subcategorySlug: "granite-marble",
    leafSlug: "indian-marble"
  },

  // Subcategory: wooden-vinyl
  {
    id: "welspun-vinyl-flooring",
    categoryTitle: "Tiles",
    name: "Welspun Vinyl Flooring",
    price: "₹85",
    unit: "/ Sq Ft",
    rating: "4.7",
    icon: "layers",
    link: "#/product/welspun-vinyl-flooring",
    description: "Welspun Luxury Vinyl Tiles (LVT) with a realistic natural wood texture. Features water resistance, sound absorption, and easy click-lock installation, suitable for modern offices and bedrooms.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 200, price: 85, save: 0 },
      { min: 201, max: 1000, price: 80, save: 5 },
      { min: 1001, max: 999999, price: 75, save: 11 }
    ],
    specifications: {
      "Type": "Luxury Vinyl Tiles (LVT)",
      "Thickness": "4 mm",
      "Wear Layer": "0.3 mm",
      "Manufacturer": "Welspun Flooring Limited"
    },
    subcategorySlug: "wooden-vinyl",
    leafSlug: "vinyl-tiles"
  },
  {
    id: "tesa-laminate-wooden",
    categoryTitle: "Tiles",
    name: "Action Tesa Wooden Flooring",
    price: "₹95",
    unit: "/ Sq Ft",
    rating: "4.6",
    icon: "layers",
    link: "#/product/tesa-laminate-wooden",
    description: "Action Tesa AC4 laminate wooden flooring. High-density fiberboard (HDF) core provides superior impact resistance, scratch resistance, and moisture protection, bringing warm wood aesthetics to bedrooms.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 200, price: 95, save: 0 },
      { min: 201, max: 1000, price: 89, save: 6 },
      { min: 1001, max: 999999, price: 83, save: 12 }
    ],
    specifications: {
      "Type": "Laminate Wooden Flooring",
      "Grade": "AC4 (Commercial)",
      "Core Material": "HDF (High Density Fiberboard)",
      "Thickness": "8 mm",
      "Manufacturer": "Action Tesa (Balaji Action Buildwell)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "NK", name: "Narendra K.", role: "Home Interior Designer", rating: 4, date: "3 weeks ago", comment: "\"Action Tesa AC4 is highly scratch resistant. The joints click together perfectly.\"" }
    ],
    subcategorySlug: "wooden-vinyl",
    leafSlug: "wooden-flooring"
  },
  {
    id: "greenlam-wood-floor",
    categoryTitle: "Tiles",
    name: "Greenlam Wooden Flooring",
    price: "₹180",
    unit: "/ Sq Ft",
    rating: "4.8",
    icon: "layers",
    link: "#/product/greenlam-wood-floor",
    description: "Greenlam premium engineered hardwood flooring. Real oak wood veneer top layer over multi-ply stable wood core. Pre-finished with multiple layers of UV-cured acrylic lacquer.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 100, price: 180, save: 0 },
      { min: 101, max: 500, price: 170, save: 5 },
      { min: 501, max: 999999, price: 160, save: 11 }
    ],
    specifications: {
      "Type": "Engineered Wood Flooring",
      "Wood Species": "Oak Wood",
      "Thickness": "10 mm",
      "Manufacturer": "Greenlam Industries Limited"
    },
    recommendedAccessories: [],
    reviews: [],
    subcategorySlug: "wooden-vinyl",
    leafSlug: "wooden-flooring"
  },

  // --- HARDWARE ---
  // Subcategory: fasteners-screws
  {
    id: "godrej-door-lock",
    categoryTitle: "Hardware",
    name: "Godrej Mortise Door Lock",
    price: "₹2,450",
    unit: "/ Set",
    rating: "4.8",
    icon: "handyman",
    link: "#/product/godrej-door-lock",
    description: "Godrej premium mortise door lock set with double-throw brass bolt and high-security cylinder. Features corrosion-resistant handles and key security, providing complete safety for main wooden doors.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 1, max: 10, price: 2450, save: 0 },
      { min: 11, max: 50, price: 2280, save: 6 },
      { min: 51, max: 999999, price: 2150, save: 12 }
    ],
    specifications: {
      "Type": "Mortise Lock Set",
      "Material": "Brass & Steel",
      "Keys Included": "3 Keys",
      "Manufacturer": "Godrej & Boyce Mfg. Co. Ltd."
    },
    subcategorySlug: "fasteners-screws",
    leafSlug: "anchor-bolts"
  },
  {
    id: "hilti-anchor-bolt",
    categoryTitle: "Hardware",
    name: "Hilti Anchor Bolt M12",
    price: "₹75",
    unit: "/ Piece",
    rating: "4.9",
    icon: "handyman",
    link: "#/product/hilti-anchor-bolt",
    description: "Hilti HSA expansion anchor bolt for heavy-duty structural fixings in concrete. Carbon steel zinc-plated design ensures high loading capacity and reliable expansion even under seismic vibrations.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 50, max: 200, price: 75, save: 0 },
      { min: 201, max: 1000, price: 70, save: 6 },
      { min: 1001, max: 999999, price: 65, save: 13 }
    ],
    specifications: {
      "Material": "Carbon Steel (Zinc Plated)",
      "Size": "M12 (12 mm Diameter)",
      "Length": "100 mm",
      "Standard": "ETA Approved",
      "Manufacturer": "Hilti India Private Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Ramesh Kumar", role: "Steel Erector", rating: 5, date: "3 weeks ago", comment: "\"The standard for structural column mounting. Never slips in dry concrete.\"" }
    ],
    subcategorySlug: "fasteners-screws",
    leafSlug: "anchor-bolts"
  },
  {
    id: "tvs-drywall-screws",
    categoryTitle: "Hardware",
    name: "TVS Drywall Screws Box",
    price: "₹450",
    unit: "/ Box",
    rating: "4.6",
    icon: "handyman",
    link: "#/product/tvs-drywall-screws",
    description: "TVS black phosphated drywall screws with bugle head and sharp point. High steel hardness ensures quick penetration in plasterboard and wooden framing without pre-drilling.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 1, max: 10, price: 450, save: 0 },
      { min: 11, max: 50, price: 420, save: 6 },
      { min: 51, max: 999999, price: 390, save: 13 }
    ],
    specifications: {
      "Type": "Drywall Bugle Screws",
      "Size": "3.5 x 25 mm (1 Inch)",
      "Coating": "Black Phosphated",
      "Quantity": "1000 Pieces / Box",
      "Manufacturer": "Sundram Fasteners Limited (TVS)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SM", name: "Sanjay M.", role: "False Ceiling Contractor", rating: 5, date: "1 week ago", comment: "\"Sharp tips, fits into metal studs instantly. Box count is accurate.\"" }
    ],
    subcategorySlug: "fasteners-screws",
    leafSlug: "drywall-screws"
  },

  // Subcategory: hand-power-tools
  {
    id: "bosch-drill-kit",
    categoryTitle: "Hardware",
    name: "Bosch Power Tool Drill Kit",
    price: "₹5,800",
    unit: "/ Kit",
    rating: "4.9",
    icon: "handyman",
    link: "#/product/bosch-drill-kit",
    description: "Bosch GSB 13 RE impact drill kit with 100 accessories. Features electronic speed control and hammer drilling mode for masonry, wood, and steel, making it the perfect professional tool kit.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 1, max: 5, price: 5800, save: 0 },
      { min: 6, max: 20, price: 5500, save: 5 },
      { min: 21, max: 999999, price: 5200, save: 10 }
    ],
    specifications: {
      "Power Input": "600W",
      "Chuck Capacity": "13 mm",
      "Drill Speed": "0-2800 RPM",
      "Manufacturer": "Bosch Power Tools"
    },
    subcategorySlug: "hand-power-tools",
    leafSlug: "impact-drills"
  },
  {
    id: "stanley-hand-tools",
    categoryTitle: "Hardware",
    name: "Stanley Hand Tool Set",
    price: "₹2,800",
    unit: "/ Set",
    rating: "4.7",
    icon: "handyman",
    link: "#/product/stanley-hand-tools",
    description: "Stanley 100-piece professional hand tool set. Includes pliers, wrenches, screwdrivers, sockets, and hammer, stored in a heavy-duty blow-molded carrying case. Essential for site technicians.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 1, max: 10, price: 2800, save: 0 },
      { min: 11, max: 50, price: 2600, save: 7 },
      { min: 51, max: 999999, price: 2450, save: 12 }
    ],
    specifications: {
      "Brand": "Stanley",
      "Piece Count": "100 Pieces",
      "Material": "Chrome Vanadium Steel",
      "Case": "Heavy Duty Carry Case",
      "Manufacturer": "Stanley Black & Decker India"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Rakesh K.", role: "Maintenance Foreman", rating: 5, date: "3 weeks ago", comment: "\"Stanley tools are extremely durable. Steel quality is superior to cheap alternatives.\"" }
    ],
    subcategorySlug: "hand-power-tools",
    leafSlug: "hand-tools"
  },
  {
    id: "dewalt-angle-grinder",
    categoryTitle: "Hardware",
    name: "Dewalt Angle Grinder 850W",
    price: "₹3,400",
    unit: "/ Unit",
    rating: "4.8",
    icon: "handyman",
    link: "#/product/dewalt-angle-grinder",
    description: "Dewalt heavy-duty 4-inch angle grinder rated at 850W. Slim body design with dust-sealed switch and high endurance carbon brushes, designed for structural steel cutting and stone grinding.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 1, max: 5, price: 3400, save: 0 },
      { min: 6, max: 20, price: 3200, save: 5 },
      { min: 21, max: 999999, price: 3000, save: 11 }
    ],
    specifications: {
      "Brand": "Dewalt",
      "Power Input": "850W",
      "Wheel Diameter": "100 mm (4 Inch)",
      "No Load Speed": "11000 RPM",
      "Manufacturer": "Stanley Black & Decker India"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SS", name: "Suresh Singh", role: "Rebar Fabricator", rating: 5, date: "2 weeks ago", comment: "\"Handles heavy workload without heating up. Easy grip design.\"" }
    ],
    subcategorySlug: "hand-power-tools",
    leafSlug: "angle-grinders"
  },

  // Subcategory: safety-equipment
  {
    id: "karam-safety-harness",
    categoryTitle: "Hardware",
    name: "Karam Safety Harness",
    price: "₹1,150",
    unit: "/ Piece",
    rating: "4.7",
    icon: "handyman",
    link: "#/product/karam-safety-harness",
    description: "Karam full body safety harness with dorsal D-ring and adjustable chest, shoulder, and thigh straps. Certified to IS 3521, providing fall protection for work at heights.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 1, max: 10, price: 1150, save: 0 },
      { min: 11, max: 50, price: 1080, save: 6 },
      { min: 51, max: 999999, price: 1000, save: 13 }
    ],
    specifications: {
      "Standard": "IS 3521:1999",
      "Material": "Polyester Webbing",
      "Weight Capacity": "100 Kg",
      "Manufacturer": "Karam Safety Private Limited"
    },
    subcategorySlug: "safety-equipment",
    leafSlug: "safety-harnesses"
  },
  {
    id: "karam-safety-helmet",
    categoryTitle: "Hardware",
    name: "Karam Safety Helmet",
    price: "₹240",
    unit: "/ Piece",
    rating: "4.8",
    icon: "handyman",
    link: "#/product/karam-safety-helmet",
    description: "Karam PN501 industrial safety helmet. Made from high-density polymer with adjustable 4-point plastic suspension and chin strap, providing excellent shock absorption on construction sites.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 10, max: 100, price: 240, save: 0 },
      { min: 101, max: 500, price: 220, save: 8 },
      { min: 501, max: 999999, price: 200, save: 16 }
    ],
    specifications: {
      "Brand": "Karam",
      "Model": "Shelmet PN-501",
      "Standard": "IS 2925:1984",
      "Material": "HDPE",
      "Color": "Yellow / White / Blue",
      "Manufacturer": "Karam Safety Private Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Ram Kumar", role: "Safety Officer", rating: 5, date: "2 weeks ago", comment: "\"Comfortable headband, easily adjustable. Meets IS standards required by our audits.\"" }
    ],
    subcategorySlug: "safety-equipment",
    leafSlug: "safety-helmets"
  },
  {
    id: "allen-cooper-shoes",
    categoryTitle: "Hardware",
    name: "Allen Cooper Safety Shoes",
    price: "₹1,450",
    unit: "/ Pair",
    rating: "4.7",
    icon: "handyman",
    link: "#/product/allen-cooper-shoes",
    description: "Allen Cooper safety footwear featuring steel toe cap for impact resistance up to 200 Joules. Genuine leather upper with double-density polyurethane sole that is oil, acid, and slip resistant.",
    images: ["https://lh3.googleusercontent.com/aida/AP1WRLt0RtRv63TsixQAQwdkd05KJgM06nCPRShSMYyUOVixW_kGk1TKFup9YRAEC1VAi32B3Vn9rwL6sVhKiv5wkocaj1yIPhBpHOSUoNsmbHTewYgAHPf7-snRCUmVsz3M9629s3uXTrSr_RIxiKk5p6QxLB-y7EXzU8pZJqjDQLReVW8NAIA80dHnyauL-ZzrpwwXsJNCPW4qTb_5bKuw6MSm4t71AJA_hmFaE1boF6OgmO311duhrwCV858"],
    priceTiers: [
      { min: 5, max: 20, price: 1450, save: 0 },
      { min: 21, max: 100, price: 1380, save: 4 },
      { min: 101, max: 999999, price: 1300, save: 10 }
    ],
    specifications: {
      "Brand": "Allen Cooper",
      "Standard": "IS 15298 (Part 2)",
      "Toe Cap": "Steel (200J Impact protection)",
      "Sole": "Double Density PU",
      "Upper": "Genuine Buff Leather",
      "Manufacturer": "Superhouse Limited (Allen Cooper)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Raju K.", role: "Mason", rating: 5, date: "3 weeks ago", comment: "\"Very comfortable shoe. Saved my foot once when a brick fell. Steel toe works.\"" }
    ],
    subcategorySlug: "safety-equipment",
    leafSlug: "safety-shoes"
  },

  // --- BUILDING ---
  // Subcategory: bricks-blocks
  {
    id: "red-clay-bricks",
    categoryTitle: "Building",
    name: "Red Clay Wirecut Bricks",
    price: "₹8",
    unit: "/ Piece",
    rating: "4.6",
    icon: "home_work",
    link: "#/product/red-clay-bricks",
    description: "Premium wirecut red clay bricks with smooth faces and sharp edges. Offering high compressive strength and low water absorption, ideal for load-bearing masonry wall construction.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 1000, price: 8, save: 0 },
      { min: 1001, max: 5000, price: 7.5, save: 6 },
      { min: 5001, max: 999999, price: 7, save: 12 }
    ],
    specifications: {
      "Type": "Wirecut Red Clay Brick",
      "Size": "9x4x3 inches",
      "Compressive Strength": "≥ 10 N/mm²",
      "Water Absorption": "≤ 15%"
    },
    subcategorySlug: "bricks-blocks",
    leafSlug: "red-bricks"
  },
  {
    id: "birla-aerocon-aac-block",
    categoryTitle: "Building",
    name: "Birla Aerocon AAC Blocks",
    price: "₹95",
    unit: "/ Piece",
    rating: "4.7",
    icon: "home_work",
    link: "#/product/birla-aerocon-aac-block",
    description: "Birla Aerocon Autoclaved Aerated Concrete (AAC) lightweight blocks. Offering excellent thermal insulation, sound absorption, fire resistance, and fast masonry speed compared to red clay bricks.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 100, max: 500, price: 95, save: 0 },
      { min: 501, max: 2000, price: 88, save: 7 },
      { min: 2001, max: 999999, price: 80, save: 15 }
    ],
    specifications: {
      "Material": "Autoclaved Aerated Concrete",
      "Size": "600 x 200 x 150 mm (6 Inch)",
      "Density": "551-650 Kg/m³",
      "Compressive Strength": "≥ 4 N/mm²",
      "Manufacturer": "Birla Aerocon (HIL Limited)"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Rajesh K.", role: "Highrise Contractor", rating: 5, date: "3 weeks ago", comment: "\"Reduces structural load significantly. Plastering cost is also lower since block face is very smooth.\"" }
    ],
    subcategorySlug: "bricks-blocks",
    leafSlug: "aac-blocks"
  },
  {
    id: "concrete-hollow-blocks",
    categoryTitle: "Building",
    name: "Autoclaved Hollow Blocks",
    price: "₹38",
    unit: "/ Piece",
    rating: "4.5",
    icon: "home_work",
    link: "#/product/concrete-hollow-blocks",
    description: "Autoclaved hollow concrete blocks for compound walls and partition walls. Light weight with hollow cavities that can be filled with concrete/steel rebars for structural rigidity.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 100, max: 1000, price: 38, save: 0 },
      { min: 1001, max: 5000, price: 35, save: 7 },
      { min: 5001, max: 999999, price: 32, save: 15 }
    ],
    specifications: {
      "Material": "Concrete",
      "Size": "400 x 200 x 150 mm",
      "Compressive Strength": "≥ 3.5 N/mm²"
    },
    recommendedAccessories: [],
    reviews: [],
    subcategorySlug: "bricks-blocks",
    leafSlug: "hollow-blocks"
  },

  // Subcategory: roofing-doors
  {
    id: "tata-bluescope-roofing",
    categoryTitle: "Building",
    name: "Tata Bluescope Roofing Sheet",
    price: "₹340",
    unit: "/ Meter",
    rating: "4.7",
    icon: "home_work",
    link: "#/product/tata-bluescope-roofing",
    description: "Tata Bluescope color coated Zincalume steel roofing sheets. Features high corrosion resistance, UV stability, and structural strength, ideal for commercial sheds and residential roofs.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 5, price: 340, save: 0 },
      { min: 6, max: 20, price: 320, save: 5 },
      { min: 21, max: 999999, price: 300, save: 11 }
    ],
    specifications: {
      "Material": "Zincalume Steel",
      "Thickness": "0.50 mm",
      "Coating Standard": "AS 1397",
      "Manufacturer": "Tata BlueScope Steel Limited"
    },
    subcategorySlug: "roofing-doors",
    leafSlug: "steel-roofing"
  },
  {
    id: "centuryply-flush-door",
    categoryTitle: "Building",
    name: "CenturyPly Flush Door",
    price: "₹4,200",
    unit: "/ Unit",
    rating: "4.8",
    icon: "home_work",
    link: "#/product/centuryply-flush-door",
    description: "CenturyPly solid core flush door, treated with vacuum-pressure preservative system. Highly resistant to wrapping, swelling, termites, and wood borers. Offers high security and impact strength for room doors.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 10, price: 4200, save: 0 },
      { min: 11, max: 50, price: 3950, save: 6 },
      { min: 51, max: 999999, price: 3750, save: 10 }
    ],
    specifications: {
      "Type": "Solid Core Flush Door",
      "Thickness": "30 mm",
      "Size": "80 x 32 inches",
      "Standard": "IS 2202",
      "Manufacturer": "Century Plyboards (India) Limited"
    },
    recommendedAccessories: [
      { id: "lock", name: "Godrej Mortise Door Lock", category: "Hardware", price: 2450, stock: "In Stock", image: "/pdp_supreme_elbow.png", multiplier: 1 }
    ],
    reviews: [
      { initials: "RK", name: "Rajesh Kumar", role: "Carpenter Contractor", rating: 5, date: "3 weeks ago", comment: "\"Century doors are always perfectly straight. Screws grip tightly in the core solid timber.\"" }
    ],
    subcategorySlug: "roofing-doors",
    leafSlug: "flush-doors"
  },
  {
    id: "fenesta-upvc-window",
    categoryTitle: "Building",
    name: "Fenesta UPVC Casement Window",
    price: "₹8,500",
    unit: "/ Unit",
    rating: "4.7",
    icon: "home_work",
    link: "#/product/fenesta-upvc-window",
    description: "Fenesta premium UPVC casement window with double glazed glass. Offers excellent sound proofing, thermal insulation, and high wind-load resistance. Smooth hinges and multipoint locking ensure absolute security.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 5, price: 8500, save: 0 },
      { min: 6, max: 20, price: 8100, save: 4 },
      { min: 21, max: 999999, price: 7700, save: 9 }
    ],
    specifications: {
      "Material": "UPVC Frame / Double Glazed Glass",
      "Size": "4 x 3 Feet",
      "Locking": "Multi-point Lock",
      "Manufacturer": "Fenesta Building Systems"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "SM", name: "Suresh M.", role: "Homeowner", rating: 5, date: "2 weeks ago", comment: "\"Stops external traffic noise completely. Double glazing helps keep the AC cooling in.\"" }
    ],
    subcategorySlug: "roofing-doors",
    leafSlug: "upvc-windows"
  },

  // Subcategory: plywood-laminates
  {
    id: "century-plywood-19mm",
    categoryTitle: "Building",
    name: "Century Plywood 19mm BWR",
    price: "₹120",
    unit: "/ Sq Ft",
    rating: "4.8",
    icon: "home_work",
    link: "#/product/century-plywood-19mm",
    description: "CenturyPly Sainik BWR (Boiling Water Resistant) plywood with high structural integrity and resistance to termites and borers. Suitable for kitchen cabinets, wardrobes, and high-moisture indoor applications.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 100, price: 120, save: 0 },
      { min: 101, max: 500, price: 112, save: 6 },
      { min: 501, max: 999999, price: 105, save: 12 }
    ],
    specifications: {
      "Thickness": "19 mm",
      "Grade": "BWR (Boiling Water Resistant)",
      "Standard": "IS 303",
      "Manufacturer": "Century Plyboards (India) Limited"
    },
    subcategorySlug: "plywood-laminates",
    leafSlug: "commercial-plywood"
  },
  {
    id: "greenply-marine-plywood",
    categoryTitle: "Building",
    name: "Greenply Marine Plywood BWP",
    price: "₹165",
    unit: "/ Sq Ft",
    rating: "4.9",
    icon: "home_work",
    link: "#/product/greenply-marine-plywood",
    description: "Greenply premium BWP (Boiling Water Proof) Marine Plywood. Manufactured with selected hardwood veneers bonded with phenol formaldehyde synthetic resin, providing complete protection against boiling water, fungal decay, and termites.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 1, max: 100, price: 165, save: 0 },
      { min: 101, max: 500, price: 155, save: 6 },
      { min: 501, max: 999999, price: 145, save: 12 }
    ],
    specifications: {
      "Thickness": "19 mm",
      "Grade": "BWP (Boiling Water Proof / Marine)",
      "Standard": "IS 710",
      "Glue Used": "Phenolic Resin",
      "Manufacturer": "Greenply Industries Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Rajiv K.", role: "Modular Kitchen Specialist", rating: 5, date: "3 weeks ago", comment: "\"Greenply IS 710 is the best for wet areas under sinks. Doesn't delaminate even under constant moisture.\"" }
    ],
    subcategorySlug: "plywood-laminates",
    leafSlug: "marine-plywood"
  },
  {
    id: "merino-laminates",
    categoryTitle: "Building",
    name: "Merino Decorative Laminate",
    price: "₹1,400",
    unit: "/ Sheet",
    rating: "4.7",
    icon: "home_work",
    link: "#/product/merino-laminates",
    description: "Merino premium decorative laminate sheet with anti-bacterial and scratch-resistant properties. Features rich wood grain textures and matte finish, perfect for overlaying room furniture and panels.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDmE946Ww05fZI_xWgWdQhAUNhyXzQ67oHglBVK7Kml8Y87KlGSSC14drLqlGjeBXkwtzLNo5YeGB2DhX3BII_KHcR8zV4EdoQ1x56TYu_pKDf2_SBPIjOg8JT33THJhl6TFjd5Z4UcpRS1a0HXfZFS0YIPkiMZW0oVkCrd4K1wXDafm8cYd7HsQCe2-4pKzvlER0V4BKiMTsQspQN8FQvur732L5ZPsLIO9dLw3v5rYRiUplwllsR-bv5Pap4LpDNekvGvvdVYLso"],
    priceTiers: [
      { min: 5, max: 50, price: 1400, save: 0 },
      { min: 51, max: 200, price: 1320, save: 5 },
      { min: 201, max: 999999, price: 1250, save: 10 }
    ],
    specifications: {
      "Type": "Decorative HPL Sheet",
      "Thickness": "1.0 mm",
      "Dimensions": "8 x 4 Feet",
      "Finish": "Matt / Wood Grain",
      "Manufacturer": "Merino Industries Limited"
    },
    recommendedAccessories: [
      { id: "adhesive", name: "Fevicol SH Adhesive 1Kg", category: "Paints", price: 280, stock: "In Stock", image: "/pdp_cpvc_elbow.png", multiplier: 0.2 }
    ],
    reviews: [
      { initials: "AJ", name: "Ajit J.", role: "Furniture Designer", rating: 5, date: "2 weeks ago", comment: "\"Very easy to paste. The texture looks premium and handles cleaning chemicals without fading.\"" }
    ],
    subcategorySlug: "plywood-laminates",
    leafSlug: "decorative-laminates"
  },
  {
    id: "astral-elbow-90",
    categoryTitle: "Plumbing",
    name: "Astral CPVC Elbow 90°",
    price: "₹35",
    unit: "/ Piece",
    rating: "4.7",
    icon: "plumbing",
    link: "#/product/astral-elbow-90",
    description: "Astral CPVC PRO 90-degree elbow fittings are designed for direction changes in plumbing systems. Made from premium lead-free CPVC compound, offering high pressure rating and temperature resistance.",
    images: ["/pdp_cpvc_elbow.png"],
    priceTiers: [
      { min: 1, max: 100, price: 35, save: 0 },
      { min: 101, max: 500, price: 32, save: 8 },
      { min: 501, max: 999999, price: 29, save: 17 }
    ],
    specifications: {
      "Material": "CPVC (Chlorinated Poly Vinyl Chloride)",
      "Angle": "90 Degrees",
      "Size": "1 Inch (25mm)",
      "Standard": "ASTM D2846",
      "Color": "Tan/Off-White",
      "Manufacturer": "Astral Poly Technik Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "RK", name: "Ramesh K.", role: "Plumber", rating: 5, date: "1 week ago", comment: "\"Fits perfectly with Astral CPVC pipes. Zero leaks.\"" }
    ],
    subcategorySlug: "pipes-fittings",
    leafSlug: "pipe-fittings"
  },
  {
    id: "astral-ball-valve",
    categoryTitle: "Plumbing",
    name: "Astral CPVC Ball Valve",
    price: "₹150",
    unit: "/ Piece",
    rating: "4.8",
    icon: "plumbing",
    link: "#/product/astral-ball-valve",
    description: "Astral CPVC ball valve designed for flow regulation in residential and commercial plumbing systems. Solvent weld sockets ensure high leak resistance.",
    images: ["/pdp_cpvc_pipe_warehouse.png"],
    priceTiers: [
      { min: 1, max: 20, price: 150, save: 0 },
      { min: 21, max: 100, price: 140, save: 6 },
      { min: 101, max: 999999, price: 130, save: 13 }
    ],
    specifications: {
      "Material": "CPVC",
      "Size": "1 Inch (25mm)",
      "Connection": "Solvent Weld",
      "Max Pressure": "15 Bar",
      "Manufacturer": "Astral Poly Technik Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "AJ", name: "Ajay J.", role: "Contractor", rating: 5, date: "2 weeks ago", comment: "\"Handles pressure shifts very well. Lever turns smoothly.\"" }
    ],
    subcategorySlug: "valves",
    leafSlug: "ball-valves"
  },
  {
    id: "supreme-pvc-pipe-4",
    categoryTitle: "Plumbing",
    name: "Supreme PVC Pipe 4\"",
    price: "₹450",
    unit: "/ Piece",
    rating: "4.6",
    icon: "plumbing",
    link: "#/product/supreme-pvc-pipe-4",
    description: "Supreme lead-free uPVC pipe 4-inch diameter for drainage, soil, waste, and rainwater harvesting applications. Exceptional flow characteristics and high mechanical strength.",
    images: ["/pdp_cpvc_pipe_install.png"],
    priceTiers: [
      { min: 1, max: 20, price: 450, save: 0 },
      { min: 21, max: 100, price: 420, save: 6 },
      { min: 101, max: 999999, price: 395, save: 12 }
    ],
    specifications: {
      "Material": "uPVC",
      "Size": "4 Inch (110mm)",
      "Length": "6 Meters",
      "Standard": "IS 4985",
      "Manufacturer": "Supreme Industries Limited"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "KK", name: "Kiran K.", role: "Site Supervisor", rating: 5, date: "3 weeks ago", comment: "\"Highly durable PVC pipe, doesn't warp under sun exposure.\"" }
    ],
    subcategorySlug: "pipes-fittings",
    leafSlug: "pvc-pipes"
  },
  {
    id: "jaquar-shower-head",
    categoryTitle: "Plumbing",
    name: "Jaquar Overhead Shower",
    price: "₹1,850",
    unit: "/ Unit",
    rating: "4.8",
    icon: "plumbing",
    link: "#/product/jaquar-shower-head",
    description: "Jaquar premium multi-flow overhead rain shower head with rub-clean silicone nozzles to prevent lime scale buildup. Beautiful chrome finish with high-gloss mirror effect.",
    images: ["/services_bathroom_renovation.png"],
    priceTiers: [
      { min: 1, max: 10, price: 1850, save: 0 },
      { min: 11, max: 50, price: 1720, save: 7 },
      { min: 51, max: 999999, price: 1600, save: 13 }
    ],
    specifications: {
      "Brand": "Jaquar",
      "Finish": "Chrome Plated",
      "Material": "Brass",
      "Nozzles": "Anti-clogging Silicone",
      "Manufacturer": "Jaquar Group"
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "AP", name: "Anil P.", role: "Architect", rating: 5, date: "2 weeks ago", comment: "\"Looks incredibly premium. Rain flow pattern is very satisfying.\"" }
    ],
    subcategorySlug: "bathroom-fittings",
    leafSlug: "showers-mixers"
  },
  {
    id: "finolex-cable-3core",
    categoryTitle: "Electrical",
    name: "Finolex 3 Core Cable",
    price: "₹3,200",
    unit: "/ Coil",
    rating: "4.7",
    icon: "bolt",
    link: "#/product/finolex-cable-3core",
    description: "Finolex 3-core heavy-duty round flexible industrial copper cable, insulated and sheathed with flame-retardant PVC compound. Designed for submersible pumps and industrial applications.",
    images: ["/services_washing_machine.png"],
    priceTiers: [
      { min: 1, max: 10, price: 3200, save: 0 },
      { min: 11, max: 50, price: 3000, save: 6 },
      { min: 51, max: 999999, price: 2800, save: 12 }
    ],
    specifications: {
      "Conductor": "Copper",
      "Cores": "3 Core",
      "Size": "2.5 sq mm",
      "Length": "100 Meters",
      "Voltage Rating": "1100V",
      "Manufacturer": "Finolex Cables Ltd."
    },
    recommendedAccessories: [],
    reviews: [
      { initials: "MD", name: "Mohit D.", role: "Electrical Contractor", rating: 5, date: "1 week ago", comment: "\"Very high load carrying capacity. Sheathing is durable.\"" }
    ],
    subcategorySlug: "wires-cables",
    leafSlug: "flexible-cables"
  }
];

// Verify we have exactly 86 products
if (productsData.length !== 86) {
  console.error('ERROR: Total generated products count is', productsData.length, 'expected exactly 86.');
  process.exit(1);
}

// 1. Write to db.json
db.products = productsData;
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Successfully wrote 86 products to db.json.');

// 2. Generate TypeScript array code for db.ts
// Formats specifications and priceTiers nicely in JS representation
const serializeProduct = (p) => {
  return `  {
    categoryTitle: ${JSON.stringify(p.categoryTitle)},
    name: ${JSON.stringify(p.name)},
    price: ${JSON.stringify(p.price)},
    unit: ${JSON.stringify(p.unit)},
    rating: ${JSON.stringify(p.rating)},
    icon: ${JSON.stringify(p.icon)},
    link: ${p.link ? JSON.stringify(p.link) : 'undefined'},
    description: ${p.description ? JSON.stringify(p.description) : 'undefined'},
    images: ${JSON.stringify(p.images || [])},
    priceTiers: ${JSON.stringify(p.priceTiers || [])},
    specifications: ${JSON.stringify(p.specifications || {})},
    recommendedAccessories: ${JSON.stringify(p.recommendedAccessories || [])},
    reviews: ${JSON.stringify(p.reviews || [])},
    subcategorySlug: ${p.subcategorySlug ? JSON.stringify(p.subcategorySlug) : 'undefined'},
    leafSlug: ${p.leafSlug ? JSON.stringify(p.leafSlug) : 'undefined'}
  }`;
};

const tsArrayCode = `export const defaultProducts: any[] = [\n${productsData.map(serializeProduct).join(',\n')}\n];`;

// Write back to products.ts
fs.writeFileSync(TS_FILE, tsArrayCode + '\n', 'utf8');
console.log('✅ Successfully updated defaultProducts array (86 products) in products.ts.');
console.log('🎉 Total products populated: 86 products (including the 5 brand hub mock products).');
