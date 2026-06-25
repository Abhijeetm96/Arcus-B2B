export default function Footer() {
  return (
    <footer className="w-full bg-[#1a1c1c] text-gray-300">
      <div className="max-w-[1440px] mx-auto px-lg w-full py-4xl text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-xl lg:gap-lg">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-lg pr-lg">
            <img
              alt="ARCUS"
              className="h-[60px] w-auto object-contain self-start"
              src="/logo.png"
            />
            <p className="font-body-md text-[14px] leading-relaxed max-w-sm">
              The premium B2B construction commerce platform. Procure materials, hire contractors, and build faster with uncompromising reliability designed for scale.
            </p>
            <div className="flex items-center gap-md mt-sm">
              <a
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-fixed transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">link</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-fixed transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-fixed transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-md">
            <h4 className="font-body-sm font-bold text-white mb-sm tracking-wide">
              Company
            </h4>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              About ARCUS
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              Careers
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              Press & Media
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              Contact Us
            </a>
          </div>

          <div className="flex flex-col gap-md">
            <h4 className="font-body-sm font-bold text-white mb-sm tracking-wide">
              Products
            </h4>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/materials"
            >
              All Materials
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/brands"
            >
              Partner Brands
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/materials/building-materials"
            >
              Building Materials
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/materials/hardware-tools"
            >
              Tools & Equipment
            </a>
          </div>

          <div className="flex flex-col gap-md">
            <h4 className="font-body-sm font-bold text-white mb-sm tracking-wide">
              Services
            </h4>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/services"
            >
              Hire Contractors
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/services/equipment-rental"
            >
              Equipment Rental
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/services/architecture-design"
            >
              Architecture & Design
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/"
              onClick={() => {
                setTimeout(() => {
                  document.getElementById('rfq-form-section')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
            >
              Request Custom RFQ
            </a>
          </div>

          <div className="flex flex-col gap-md">
            <h4 className="font-body-sm font-bold text-white mb-sm tracking-wide">
              Support
            </h4>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              Help Center
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#/account"
            >
              Track Order
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              Return Policy
            </a>
            <a
              className="font-body-sm text-[14px] hover:text-primary transition-colors duration-200 w-fit"
              href="#"
            >
              Supplier Guidelines
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="w-full border-t border-surface-variant/20 py-lg bg-[#121212]">
        <div className="max-w-[1440px] mx-auto px-lg w-full flex flex-col md:flex-row items-center justify-between gap-md">
          <p className="font-label-caps text-[10px] text-gray-500 text-left">
            © 2024 ARCUS Construction Commerce Pvt. Ltd. All rights reserved. | GSTIN: 29AABCU9876R1Z5
          </p>
          <div className="flex items-center gap-lg">
            <a
              className="font-label-caps text-[10px] text-gray-500 hover:text-white transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="font-label-caps text-[10px] text-gray-500 hover:text-white transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-label-caps text-[10px] text-gray-500 hover:text-white transition-colors"
              href="#"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
