import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Resources() {
  const { addToCart } = useCart();
  
  // Concrete Calculator States
  const [concreteLength, setConcreteLength] = useState('10');
  const [concreteWidth, setConcreteWidth] = useState('5');
  const [concreteThickness, setConcreteThickness] = useState('15'); // in cm
  const [cementAddedToast, setCementAddedToast] = useState<string | null>(null);

  // Piping Sizer States
  const [flowRate, setFlowRate] = useState('50'); // LPM
  const [velocity, setVelocity] = useState('1.5'); // m/s

  // Brick Calculator States
  const [wallLength, setWallLength] = useState('15');
  const [wallHeight, setWallHeight] = useState('3');
  const [wallThickness, setWallThickness] = useState('9'); // in inches

  // Calculations for Concrete
  const lengthNum = parseFloat(concreteLength) || 0;
  const widthNum = parseFloat(concreteWidth) || 0;
  const thicknessNum = parseFloat(concreteThickness) || 0;
  const concreteVolume = Math.round(lengthNum * widthNum * (thicknessNum / 100) * 100) / 100;
  const cementBagsRequired = Math.ceil(concreteVolume * 7.2); // ~7.2 bags of cement per m3 of M20 concrete
  const sandWeight = Math.round(concreteVolume * 0.6 * 10) / 10; // ~0.6 tons of sand per m3
  const gravelWeight = Math.round(concreteVolume * 1.2 * 10) / 10; // ~1.2 tons of gravel per m3

  // Calculations for Piping
  const lpm = parseFloat(flowRate) || 0;
  const vel = parseFloat(velocity) || 0;
  // Flow in m3/s = (LPM / 1000) / 60
  const flowM3S = (lpm / 1000) / 60;
  // Area = Flow / Velocity
  const area = vel > 0 ? flowM3S / vel : 0;
  // Diameter = Math.sqrt(Area * 4 / Math.PI)
  const diameterMm = Math.round(Math.sqrt(area * 4 / Math.PI) * 1000 * 10) / 10;
  const diameterInches = Math.round((diameterMm / 25.4) * 100) / 100;

  // Recommended standard Pipe size mapping
  let recommendedPipeSize = '0.5 Inch (15mm)';
  if (diameterInches > 0.5 && diameterInches <= 0.75) recommendedPipeSize = '0.75 Inch (20mm)';
  else if (diameterInches > 0.75 && diameterInches <= 1.0) recommendedPipeSize = '1.0 Inch (25mm)';
  else if (diameterInches > 1.0 && diameterInches <= 1.25) recommendedPipeSize = '1.25 Inch (32mm)';
  else if (diameterInches > 1.25 && diameterInches <= 1.5) recommendedPipeSize = '1.5 Inch (40mm)';
  else if (diameterInches > 1.5 && diameterInches <= 2.0) recommendedPipeSize = '2.0 Inch (50mm)';
  else if (diameterInches > 2.0) recommendedPipeSize = '2.5 Inch+ (65mm+)';

  // Calculations for Bricks
  const wL = parseFloat(wallLength) || 0;
  const wH = parseFloat(wallHeight) || 0;
  const wT = parseFloat(wallThickness) || 0;
  const wallVol = wL * wH * (wT * 0.0254); // convert inches to meters
  const bricksRequired = Math.ceil(wallVol * 500); // ~500 standard bricks per m3 of brickwork
  const brickCementBags = Math.ceil(wallVol * 1.2); // ~1.2 bags of cement per m3 for mortar

  const handleAddCementToCart = () => {
    if (cementBagsRequired <= 0) return;

    const cementProduct = {
      id: 'ultratech-cement',
      name: 'Ultratech Cement (50kg Bag)',
      price: 430,
      unit: '/ Bag',
      images: ['/pdp_ultratech_cement.png'],
      categoryTitle: 'Cement',
      priceTiers: [
        { min: 1, max: 50, price: 430, save: 0 },
        { min: 51, max: 200, price: 420, save: 2 },
        { min: 201, max: 999999, price: 410, save: 4 }
      ]
    };

    addToCart(cementProduct, cementBagsRequired);
    setCementAddedToast(`Added ${cementBagsRequired} Bags of Ultratech Cement to cart!`);
    setTimeout(() => setCementAddedToast(null), 3500);

    // Open the cart drawer
    setTimeout(() => {
      const cartBtn = document.querySelector('button[onClick*="setIsCartOpen(true)"]') as HTMLButtonElement;
      if (cartBtn) cartBtn.click();
      window.dispatchEvent(new Event('arcus-cart-updated'));
    }, 100);
  };

  const triggerDownload = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSpecs = (type: 'cpvc' | 'tmt' | 'gst' | 'rera') => {
    let fileName = '';
    let title = '';
    let content = '';

    if (type === 'cpvc') {
      fileName = 'ARCUS_CPVC_Piping_Pressure_Ratings.txt';
      title = 'ARCUS TECHNICAL SPECIFICATION SHEET: CPVC PIPES & FITTINGS';
      content = `${title}\n=======================================================\n` +
        `Standard: ASTM D2846 / SDR 11 & SDR 13.5\n` +
        `Application: Potable hot and cold water distribution loops\n\n` +
        `Pressure & Temperature Ratings:\n` +
        `- SDR 11: 400 PSI at 23°C (73°F) | 100 PSI at 82°C (180°F)\n` +
        `- SDR 13.5: 320 PSI at 23°C (73°F) | 80 PSI at 82°C (180°F)\n\n` +
        `Recommended Expansion Loops spacing:\n` +
        `- 1/2" Pipe: Loop length 22" for 50°F temp change\n` +
        `- 3/4" Pipe: Loop length 25" for 50°F temp change\n` +
        `- 1" Pipe: Loop length 28" for 50°F temp change\n\n` +
        `Issued by ARCUS QA & Technical Services Division. Certified Copy.`;
    } else if (type === 'tmt') {
      fileName = 'ARCUS_IS1786_TMT_Steel_Test_Standards.txt';
      title = 'ARCUS STEEL TESTING STANDARDS: IS 1786 COMPLIANCE';
      content = `${title}\n=======================================================\n` +
        `Grade: Fe 500D / Fe 550D High-Ductility Reinforcement Bar\n` +
        `Compliance: Bureau of Indian Standards (BIS) IS 1786:2008\n\n` +
        `Mechanical Properties Table:\n` +
        `- Fe 500D: Min Yield Stress 500 MPa | Tensile Strength 565 MPa | Elongation 16%\n` +
        `- Fe 550D: Min Yield Stress 550 MPa | Tensile Strength 600 MPa | Elongation 14.5%\n\n` +
        `Chemical Composition Limits:\n` +
        `- Carbon max: 0.25%\n` +
        `- Sulfur max: 0.040%\n` +
        `- Phosphorus max: 0.040%\n` +
        `- S + P max: 0.075%\n\n` +
        `Verified by NABL accredited lab partner for ARCUS Procurement.`;
    } else if (type === 'gst') {
      fileName = 'ARCUS_B2B_GST_Input_Tax_Credit_Guide.txt';
      title = 'ARCUS B2B GUIDE: INPUT TAX CREDIT (ITC) ON CONSTRUCTION MATERIALS';
      content = `${title}\n=======================================================\n` +
        `Subject: Availing GST input tax credit for builders & commercial developers\n` +
        `Tax Rate: Standard 18% GST on Steel, Cement, and Plumbing Accessories\n\n` +
        `Key Guidelines for ITC Eligibility:\n` +
        `1. Ensure GSTIN is prefilled and verified on the invoice at checkout.\n` +
        `2. Procurement must be used for business construction (commercial IT parks, rented villas, etc.).\n` +
        `3. Invoices are automatically uploaded to GSTR-2B by the 11th of every month.\n` +
        `4. Note: ITC is NOT available for residential building constructed for self-occupancy under Section 17(5)(d) of CGST Act.\n\n` +
        `Issued by ARCUS Corporate Accounts & Taxation Desk.`;
    } else {
      fileName = 'ARCUS_Karnataka_RERA_Structural_Safety.txt';
      title = 'RERA STRUCTURAL SAFETY CHECKLIST: KARNATAKA';
      content = `${title}\n=======================================================\n` +
        `Subject: Structural warranty and compliance requirements under RERA Section 14(3)\n` +
        `Coverage: Developer liability for structural defect for 5 years post-handover\n\n` +
        `Key Structural Checkpoints:\n` +
        `1. Foundation settlement report and soil testing logs.\n` +
        `2. Reinforcement bend test logs (MTC verified for TMT rebars).\n` +
        `3. Concrete cube crushing test reports (7-day and 28-day strengths).\n` +
        `4. Waterproofing slab testing logs and pipeline pressure checks.\n\n` +
        `Compliance Checklist provided by ARCUS Civil Estimating Desk.`;
    }

    triggerDownload(fileName, content);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface select-none">
      {/* Toast Alert */}
      {cementAddedToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-green-600 text-white px-xl py-lg rounded-2xl shadow-xl flex items-center gap-md border border-green-500 animate-slide-in-right">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span className="font-bold text-body-sm">{cementAddedToast}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full bg-[#1a1c1c] text-white py-[80px] md:py-[112px] border-b border-surface-variant relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 skew-x-12 translate-x-1/3 pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-lg text-left flex flex-col gap-md relative z-10">
          <span className="bg-[#FFC107] text-[#0A0A0A] font-bold px-md py-1 rounded w-fit text-[11px] font-label-caps tracking-wider">
            TECHNICAL CENTER
          </span>
          <h1 className="font-sans font-extrabold text-[40px] md:text-[56px] leading-[1.1] max-w-2xl text-white">
            Professional Resources
          </h1>
          <p className="font-sans font-medium text-[18px] md:text-[20px] text-gray-400 max-w-3xl leading-relaxed">
            Estimate materials, loop pipe sizes, and download certified structural brochures and compliance checklists.
          </p>
        </div>
      </section>

      {/* Calculators Section */}
      <section className="max-w-[1440px] mx-auto px-lg py-3xl md:py-5xl text-left space-y-xxl">
        <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-bold border-b border-surface-variant pb-sm">
          Interactive Estimators & Calculators
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          
          {/* Cement & Concrete Calculator */}
          <div className="bg-white border border-surface-variant rounded-3xl p-lg shadow-sm flex flex-col justify-between space-y-lg">
            <div className="space-y-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[#FFC107] text-[28px]">architecture</span>
                <h3 className="font-bold text-body-lg text-[#0A0A0A]">Concrete & Cement</h3>
              </div>
              <p className="text-secondary text-xs leading-relaxed">
                Enter slab dimensions to calculate volume and estimate 50kg bags needed (M20 grade concrete mix).
              </p>

              <div className="space-y-sm pt-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Length (Meters)</label>
                  <input
                    type="number"
                    value={concreteLength}
                    onChange={(e) => setConcreteLength(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Width (Meters)</label>
                  <input
                    type="number"
                    value={concreteWidth}
                    onChange={(e) => setConcreteWidth(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Thickness (Centimeters)</label>
                  <input
                    type="number"
                    value={concreteThickness}
                    onChange={(e) => setConcreteThickness(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
              </div>

              {/* Outputs Box */}
              <div className="bg-[#FFFDF5] border border-[#FFE082]/70 p-md rounded-2xl space-y-sm text-xs mt-md">
                <div className="flex justify-between">
                  <span className="text-secondary">Concrete Volume:</span>
                  <span className="font-bold text-[#0A0A0A]">{concreteVolume} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Cement Bags Required:</span>
                  <span className="font-extrabold text-[#C62828]">{cementBagsRequired} Bags</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-[#FFE082] pt-sm text-[11px]">
                  <span className="text-secondary">Est. Sand: {sandWeight} Tons</span>
                  <span className="text-secondary">Est. Gravel: {gravelWeight} Tons</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddCementToCart}
              disabled={cementBagsRequired <= 0}
              className="w-full h-12 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#fabd00] transition-colors flex items-center justify-center gap-xs font-label-caps text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Add Cement to Cart
            </button>
          </div>

          {/* Piping Loop size estimator */}
          <div className="bg-white border border-surface-variant rounded-3xl p-lg shadow-sm flex flex-col justify-between space-y-lg">
            <div className="space-y-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[#FFC107] text-[28px]">water_damage</span>
                <h3 className="font-bold text-body-lg text-[#0A0A0A]">Piping Loop Sizer</h3>
              </div>
              <p className="text-secondary text-xs leading-relaxed">
                Estimate the CPVC internal piping loop diameter required based on desired water flow rate.
              </p>

              <div className="space-y-sm pt-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Flow Rate (Liters/Min)</label>
                  <input
                    type="number"
                    value={flowRate}
                    onChange={(e) => setFlowRate(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Max Fluid Velocity (m/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={velocity}
                    onChange={(e) => setVelocity(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
              </div>

              {/* Outputs Box */}
              <div className="bg-[#F8F9FA] border border-surface-variant p-md rounded-2xl space-y-sm text-xs mt-md">
                <div className="flex justify-between">
                  <span className="text-secondary">Req. Internal Area:</span>
                  <span className="font-bold text-[#0A0A0A]">{(area * 1000000).toFixed(1)} mm²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Calculated Diameter:</span>
                  <span className="font-bold text-[#0A0A0A]">{diameterMm} mm ({diameterInches}")</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-surface-variant pt-sm text-[11px] text-primary font-bold">
                  <span>Standard Recommendation:</span>
                  <span>{recommendedPipeSize}</span>
                </div>
              </div>
            </div>

            <a
              href="#/materials/plumbing"
              className="w-full h-12 border border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-xl hover:bg-surface-container transition-colors flex items-center justify-center gap-xs font-label-caps text-xs text-center"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Shop Piping Catalog
            </a>
          </div>

          {/* Brick / Masonry wall estimator */}
          <div className="bg-white border border-surface-variant rounded-3xl p-lg shadow-sm flex flex-col justify-between space-y-lg">
            <div className="space-y-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[#FFC107] text-[28px]">foundation</span>
                <h3 className="font-bold text-body-lg text-[#0A0A0A]">Masonry & Brickwork</h3>
              </div>
              <p className="text-secondary text-xs leading-relaxed">
                Estimate the standard modular brick count and mortar cement bags needed for partition walls.
              </p>

              <div className="space-y-sm pt-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Wall Length (Meters)</label>
                  <input
                    type="number"
                    value={wallLength}
                    onChange={(e) => setWallLength(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Wall Height (Meters)</label>
                  <input
                    type="number"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps">Thickness (Inches)</label>
                  <select
                    value={wallThickness}
                    onChange={(e) => setWallThickness(e.target.value)}
                    className="w-full h-10 px-md border border-surface-variant rounded-xl focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                  >
                    <option value="4.5">4.5 Inches (Single layer partition)</option>
                    <option value="9">9 Inches (Standard double layer)</option>
                  </select>
                </div>
              </div>

              {/* Outputs Box */}
              <div className="bg-[#F8F9FA] border border-surface-variant p-md rounded-2xl space-y-sm text-xs mt-md">
                <div className="flex justify-between">
                  <span className="text-secondary">Wall Volume:</span>
                  <span className="font-bold text-[#0A0A0A]">{wallVol.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Bricks Needed (approx):</span>
                  <span className="font-extrabold text-[#0A0A0A]">{bricksRequired.toLocaleString()} Units</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-surface-variant pt-sm text-[11px] text-green-600 font-bold">
                  <span>Est. Mortar Cement:</span>
                  <span>{brickCementBags} Bags</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (brickCementBags > 0) {
                  addToCart({
                    id: 'ultratech-cement',
                    name: 'Ultratech Cement (50kg Bag)',
                    price: 430,
                    unit: '/ Bag',
                    images: ['/pdp_ultratech_cement.png'],
                    categoryTitle: 'Cement'
                  }, brickCementBags);
                  setCementAddedToast(`Added ${brickCementBags} Bags of Cement to cart!`);
                  setTimeout(() => setCementAddedToast(null), 3500);
                  
                  // Open the cart drawer
                  setTimeout(() => {
                    const cartBtn = document.querySelector('button[onClick*="setIsCartOpen(true)"]') as HTMLButtonElement;
                    if (cartBtn) cartBtn.click();
                    window.dispatchEvent(new Event('arcus-cart-updated'));
                  }, 100);
                }
              }}
              disabled={brickCementBags <= 0}
              className="w-full h-12 bg-primary-container text-on-primary-container font-bold rounded-xl hover:bg-[#fabd00] transition-colors flex items-center justify-center gap-xs font-label-caps text-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Add Mortar Cement
            </button>
          </div>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="max-w-[1440px] mx-auto px-lg pb-5xl text-left space-y-lg">
        <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-bold border-b border-surface-variant pb-sm">
          Technical Specifications & Downloads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            {
              type: 'cpvc',
              title: 'CPVC Pressure Ratings',
              meta: 'SDR 11 & 13.5 ASTM D2846',
              desc: 'Official thermal pressure ratings and structural loop guidelines for potables.',
              file: 'CPVC_Piping_Pressure_Ratings.txt'
            },
            {
              type: 'tmt',
              title: 'IS 1786 Steel standards',
              meta: 'Fe 500D & 550D Rebars',
              desc: 'High-ductility yield tensile limits and bend test chemical compliance reports.',
              file: 'IS1786_TMT_Steel_Test_Standards.txt'
            },
            {
              type: 'rera',
              title: 'RERA Structural checklist',
              meta: 'Section 14(3) Safety Guide',
              desc: '5-year builder structural defect liability checkpoints and slab test forms.',
              file: 'Karnataka_RERA_Structural_Safety.txt'
            },
            {
              type: 'gst',
              title: 'B2B GST Input Credit Guide',
              meta: 'Section 17(5) ITC Availing',
              desc: 'How to register corporate accounts and claim credit on construction items.',
              file: 'B2B_GST_Input_Tax_Credit_Guide.txt'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-surface-variant rounded-2xl p-lg shadow-sm flex flex-col justify-between hover:border-[#FFC107] transition-all">
              <div className="space-y-sm">
                <div className="w-10 h-10 bg-error-container/20 text-[#C62828] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-body-sm text-[#0A0A0A]">{item.title}</h4>
                  <p className="text-[10px] text-secondary font-bold uppercase font-label-caps tracking-wider">{item.meta}</p>
                </div>
                <p className="text-secondary text-xs leading-relaxed">{item.desc}</p>
              </div>

              <button
                onClick={() => handleDownloadSpecs(item.type as any)}
                className="w-full h-10 border border-surface-variant hover:border-[#0A0A0A] hover:bg-surface-container text-secondary hover:text-[#0A0A0A] font-bold rounded-xl mt-lg flex items-center justify-center gap-xs font-label-caps text-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download Specs
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
