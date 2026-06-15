interface Product {
  name: string
  price: string
  unit: string
  rating: string
  icon: string
}

interface ProductCategory {
  title: string
  products: Product[]
}

const productCategories: ProductCategory[] = [
  {
    title: 'Cement',
    products: [
      { name: 'UltraTech Cement', price: '₹450', unit: '/ Bag', rating: '4.8', icon: 'inventory_2' },
      { name: 'Ambuja Cement', price: '₹445', unit: '/ Bag', rating: '4.7', icon: 'inventory_2' },
      { name: 'ACC Cement', price: '₹440', unit: '/ Bag', rating: '4.6', icon: 'inventory_2' },
    ],
  },
  {
    title: 'Steel',
    products: [
      { name: 'Tata Tiscon', price: '₹68,000', unit: '/ Ton', rating: '4.9', icon: 'architecture' },
      { name: 'JSW Steel', price: '₹66,500', unit: '/ Ton', rating: '4.8', icon: 'architecture' },
      { name: 'SAIL Steel', price: '₹65,200', unit: '/ Ton', rating: '4.7', icon: 'architecture' },
    ],
  },
  {
    title: 'Electrical',
    products: [
      { name: 'Finolex Wire', price: '₹1,250', unit: '/ Coil', rating: '4.8', icon: 'electrical_services' },
      { name: 'Havells MCB', price: '₹850', unit: '/ Unit', rating: '4.9', icon: 'electrical_services' },
      { name: 'Anchor Switch', price: '₹45', unit: '/ Unit', rating: '4.7', icon: 'electrical_services' },
    ],
  },
]

export default function Products() {
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
          {productCategories.map((category) => (
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
                    className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md flex flex-col gap-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group text-left"
                  >
                    <div className="h-48 bg-surface-container rounded-lg flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-[48px] text-secondary opacity-20">
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
                            className="material-symbols-outlined text-primary-container text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="font-label-caps text-[12px] font-bold">
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
                      <div className="inline-flex items-center gap-xs bg-primary-container/10 text-on-primary-fixed-variant px-sm py-xs rounded w-fit mt-xs">
                        <span className="material-symbols-outlined text-[14px]">
                          receipt_long
                        </span>
                        <span className="font-label-caps text-[10px]">
                          GST Invoice Available
                        </span>
                      </div>
                    </div>
                    <button className="w-full mt-md py-md bg-inverse-surface text-inverse-on-surface font-label-caps rounded-lg hover:bg-on-surface transition-colors flex items-center justify-center gap-sm">
                      <span className="material-symbols-outlined text-[20px]">
                        shopping_cart
                      </span>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-xl">
          <button className="h-14 px-xxl bg-primary-container text-on-primary-fixed font-label-caps text-label-caps rounded-lg hover:bg-inverse-primary hover:-translate-y-1 transition-all duration-200 shadow-md flex items-center justify-center gap-sm">
            View All Products
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}
