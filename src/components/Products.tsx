import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api';

interface Product {
  name: string
  price: string
  unit: string
  rating: string
  icon: string
  link?: string
}

interface ProductCategory {
  title: string
  products: Product[]
}

const productCategories: ProductCategory[] = [
  {
    title: 'Plumbing',
    products: [
      { name: 'Astral CPVC Pipe', price: '₹280', unit: '/ Piece', rating: '4.8', icon: 'plumbing', link: '#/product/astral-cpvc-pipe' },
      { name: 'Supreme Elbow 90°', price: '₹24', unit: '/ Unit', rating: '4.7', icon: 'plumbing', link: '#/product/supreme-elbow-90' },
      { name: 'Jaquar Basin Mixer', price: '₹3,450', unit: '/ Unit', rating: '4.9', icon: 'plumbing', link: '#/product/jaquar-basin-mixer' },
    ],
  },
  {
    title: 'Electrical',
    products: [
      { name: 'Finolex Wire', price: '₹1,250', unit: '/ Coil', rating: '4.8', icon: 'electrical_services', link: '#/product/finolex-wire' },
      { name: 'Havells MCB', price: '₹850', unit: '/ Unit', rating: '4.9', icon: 'electrical_services', link: '#/product/havells-mcb' },
      { name: 'Anchor Switch', price: '₹45', unit: '/ Unit', rating: '4.7', icon: 'electrical_services', link: '#/product/anchor-switch' },
    ],
  },
  {
    title: 'Paints',
    products: [
      { name: 'Asian Paints Apex Ultima', price: '₹5,400', unit: '/ Bucket', rating: '4.8', icon: 'format_paint', link: '#/product/asian-paints-apex' },
      { name: 'Dr. Fixit Waterproofing', price: '₹1,200', unit: '/ Can', rating: '4.7', icon: 'format_paint', link: '#/product/dr-fixit-waterproof' },
      { name: 'Fevicol SH Adhesive', price: '₹280', unit: '/ Kg', rating: '4.9', icon: 'format_paint', link: '#/product/fevicol-sh-adhesive' },
    ],
  },
]

export default function Products() {
  const { user } = useAuth()
  const customerType = user?.customerType || (user?.role && ['Business', 'Contractor', 'Supplier'].includes(user.role) ? 'BUSINESS' : 'INDIVIDUAL');

  const [categories, setCategories] = useState<ProductCategory[]>(productCategories)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const getProductDefaultQty = (product: any) => {
    const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
    return customerType === 'BUSINESS' ? moq : 1;
  };

  const incrementQty = (product: any) => {
    const name = product.name;
    const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
    const mult = product.orderMultiple !== undefined ? product.orderMultiple : 1;
    const current = quantities[name] !== undefined ? quantities[name] : (customerType === 'BUSINESS' ? moq : 1);
    
    setQuantities(prev => ({
      ...prev,
      [name]: current + mult
    }))
  }

  const decrementQty = (product: any) => {
    const name = product.name;
    const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
    const mult = product.orderMultiple !== undefined ? product.orderMultiple : 1;
    const current = quantities[name] !== undefined ? quantities[name] : (customerType === 'BUSINESS' ? moq : 1);
    const minLimit = customerType === 'BUSINESS' ? moq : 1;

    setQuantities(prev => ({
      ...prev,
      [name]: Math.max(minLimit, current - mult)
    }))
  }

  const { addToCart } = useCart()
  const handleAddToCart = (product: any, qty: number) => {
    const defaultImage = product.images && product.images.length > 0 
      ? product.images[0] 
      : (product.icon === 'plumbing' 
          ? '/pdp_cpvc_pipe_main.png' 
          : (product.icon === 'electrical_services' ? '/pdp_finolex_wire.png' : '/pdp_cpvc_elbow.png'));

    addToCart({
      id: product.id || product.name.toLowerCase().replace(/\s+/g, '-'),
      name: product.name,
      price: product.price,
      unit: product.unit || '/ Unit',
      images: [defaultImage],
      categoryTitle: product.categoryTitle || 'Materials',
      priceTiers: product.priceTiers,
      minimumOrderQuantity: product.minimumOrderQuantity,
      orderMultiple: product.orderMultiple,
      minimumOrderUnit: product.minimumOrderUnit,
      stock: product.stock
    }, qty)

    setToastMessage(`Added ${qty} x ${product.name} to cart!`)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  useEffect(() => {
    apiFetch('/products')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => {
        const allowed = ['Plumbing', 'Electrical', 'Paints']
        const filtered = data.filter((cat: any) => allowed.includes(cat.title))
        setCategories(filtered)
      })
      .catch((err) => console.warn('Backend server offline, using local static products data.', err))
  }, [])

  return (
    <section className="w-full py-4xl bg-surface border-t border-surface-variant">
      <div className="max-w-[1440px] mx-auto px-lg w-full flex flex-col gap-xl">
        <div className="flex flex-col items-center text-center gap-sm">
          <h2 className="font-headline-h2 text-headline-h2 text-on-surface">
            Top Selling Products
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            High-demand materials for professional builds
          </p>
        </div>
        <div className="flex flex-col gap-xxl">
          {categories.map((category) => (
            <div key={category.title} className="flex flex-col gap-lg">
              <div className="flex items-center gap-md">
                <div className="h-px flex-1 bg-surface-variant"></div>
                <h3 className="font-headline-h3 text-[24px] text-on-surface px-md">
                  {category.title}
                </h3>
                <div className="h-px flex-1 bg-surface-variant"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {category.products.map((product) => (
                  <div
                    key={product.name}
                    className="bg-white border border-surface-variant rounded-md p-md flex flex-col justify-between gap-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-300 text-left"
                  >
                    <div className="flex flex-col gap-sm">
                      <a
                        href={product.link ? product.link.replace('#/product/', '#/products/') : '#/materials'}
                        className="no-underline text-inherit group flex flex-col gap-sm"
                      >
                        <div className="h-48 bg-surface-container rounded-md flex items-center justify-center overflow-hidden">
                          <span className="material-symbols-outlined text-[48px] text-secondary opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300">
                            {product.icon}
                          </span>
                        </div>
                        <div className="flex flex-col gap-xs">
                          <div className="flex justify-between items-start">
                            <h4 className="font-body-md font-bold text-on-surface">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-xs">
                              <span
                                className="material-symbols-outlined text-primary-container text-[18px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                              <span className="font-label-caps text-sm font-bold">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                          <p className="font-headline-h3 text-[20px] text-primary mt-1">
                            {product.price}{' '}
                            <span className="text-body-sm text-secondary font-normal">
                              {product.unit}
                            </span>
                          </p>
                        </div>
                      </a>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between gap-sm border-t border-surface-variant/40 pt-sm mt-xs">
                        <span className="font-label-caps text-[14px] font-bold text-secondary">
                          Quantity
                        </span>
                        <div className="flex items-center border border-surface-variant rounded bg-surface-container overflow-hidden">
                          <button
                            onClick={() => decrementQty(product)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface select-none cursor-pointer font-bold border-none bg-transparent"
                          >
                            -
                          </button>
                          <span className="px-sm font-bold text-on-surface text-body-sm min-w-[24px] text-center">
                            {quantities[product.name] !== undefined ? quantities[product.name] : getProductDefaultQty(product)}
                          </span>
                          <button
                            onClick={() => incrementQty(product)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant transition-colors text-on-surface select-none cursor-pointer font-bold border-none bg-transparent"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-sm mt-md">
                      <button
                        onClick={() => handleAddToCart(product, quantities[product.name] !== undefined ? quantities[product.name] : getProductDefaultQty(product))}
                        className="py-sm bg-[#121212] text-white font-semibold rounded-md hover:bg-[#fabd00] hover:text-[#121212] transition-colors flex items-center justify-center gap-xs text-[13px] border border-transparent shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                        Add to Cart
                      </button>
                      <a
                        href={product.link ? product.link.replace('#/product/', '#/products/') : '#/materials'}
                        className="py-sm border border-[#121212] text-[#121212] font-semibold rounded-md hover:bg-surface-variant/20 transition-colors flex items-center justify-center gap-xs text-[13px] no-underline text-center cursor-pointer"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-xl">
          <a
            href="#/materials"
            className="h-14 px-xxl bg-primary-container text-[#121212] font-semibold rounded-md border-0 hover:bg-[#fabd00] hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-sm no-underline"
          >
            View All Products
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        {/* Live Bulk Price Index Table */}
        <div className="mt-4xl max-w-4xl mx-auto w-full">
          <h3 className="font-headline-h3 text-[24px] text-on-surface mb-lg text-center">
            Live Bulk Price Index
          </h3>
          <div className="overflow-hidden rounded-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1E1E1E] text-white">
                  <th className="px-lg py-md font-label-caps text-label-caps">Material</th>
                  <th className="px-lg py-md font-label-caps text-label-caps">Specification</th>
                  <th className="px-lg py-md font-label-caps text-label-caps text-right">Price Index</th>
                  <th className="px-lg py-md font-label-caps text-label-caps text-right">Change (24h)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-sm font-semibold text-on-surface">UltraTech Cement</td>
                  <td className="px-lg py-md font-body-sm text-secondary">OPC 53 Grade (per bag)</td>
                  <td className="px-lg py-md font-body-sm text-on-surface text-right">₹450</td>
                  <td className="px-lg py-md font-body-sm text-[#10B981] text-right font-bold">+1.2%</td>
                </tr>
                <tr className="bg-[#F5F5F5] hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-sm font-semibold text-on-surface">Tata Tiscon</td>
                  <td className="px-lg py-md font-body-sm text-secondary">TMT Steel Fe 550D (per ton)</td>
                  <td className="px-lg py-md font-body-sm text-on-surface text-right">₹68,000</td>
                  <td className="px-lg py-md font-body-sm text-[#ba1a1a] text-right font-bold">-0.5%</td>
                </tr>
                <tr className="bg-white hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-sm font-semibold text-on-surface">Finolex Wire</td>
                  <td className="px-lg py-md font-body-sm text-secondary">1.5 sq mm FR (per coil)</td>
                  <td className="px-lg py-md font-body-sm text-on-surface text-right">₹1,250</td>
                  <td className="px-lg py-md font-body-sm text-[#10B981] text-right font-bold">+0.8%</td>
                </tr>
                <tr className="bg-[#F5F5F5] hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md font-body-sm font-semibold text-on-surface">JSW NeoSteel</td>
                  <td className="px-lg py-md font-body-sm text-secondary">TMT Bar (per ton)</td>
                  <td className="px-lg py-md font-body-sm text-on-surface text-right">₹66,500</td>
                  <td className="px-lg py-md font-body-sm text-secondary text-right">0.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {toastMessage && (
        <div 
          className="fixed bottom-8 right-8 z-50 bg-[#121212] text-white px-md py-sm rounded-md shadow-sm flex items-center gap-sm border border-surface-variant font-semibold animate-fade-in"
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}
        >
          <span className="material-symbols-outlined text-[#10B981] text-[20px]">
            check_circle
          </span>
          <span className="text-body-sm">{toastMessage}</span>
        </div>
      )}
    </section>
  )
}
