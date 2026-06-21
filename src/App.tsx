import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import Products from './components/Products'
import Services from './components/Services'
import RfqForm from './components/RfqForm'
import Trust from './components/Trust'
import Footer from './components/Footer'
import MaterialsHub from './components/MaterialsHub'
import ServicesHub from './components/ServicesHub'
import ProductDetail from './components/ProductDetail'
import BrandsHub from './components/BrandsHub'
import BulkOrders from './components/BulkOrders'
import Projects from './components/Projects'
import Resources from './components/Resources'
import { Agentation } from 'agentation'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AuthPage } from './components/AuthPage'
import { IndividualDashboard, BusinessDashboard, ProfessionalDashboard, AdminDashboard } from './components/Dashboards'
import { Checkout, CheckoutSuccess } from './components/Checkout'

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash)
      // Scroll to top on navigation change
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Basic segment router
  // e.g. #/services/plumbing-services/pipe-installation/cpvc-pipe-installation
  const cleanHash = currentHash.replace(/^#\/?/, '').split('?')[0]
  const segments = cleanHash.split('/')

  const isMaterialsHub = segments[0] === 'materials' || segments[0] === 'materials-hub'
  const isServicesHub = segments[0] === 'services'
  const isBrandsHub = segments[0] === 'brands'
  const isProductDetail = segments[0] === 'product' || segments[0] === 'products'
  const isAuth = segments[0] === 'auth'
  const isIndividualDb = segments[0] === 'account'
  const isBusinessDb = segments[0] === 'business-dashboard'
  const isProfessionalDb = segments[0] === 'professional-dashboard'
  const isAdminDb = segments[0] === 'admin'
  const isCheckoutSuccess = segments[0] === 'checkout' && segments[1] === 'success'
  const isCheckout = segments[0] === 'checkout'
  const isBulkOrders = segments[0] === 'bulk-orders'
  const isProjects = segments[0] === 'projects'
  const isResources = segments[0] === 'resources'

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main>
          {isCheckoutSuccess ? (
            <CheckoutSuccess />
          ) : isCheckout ? (
            <Checkout />
          ) : isAuth ? (
            <AuthPage />
          ) : isBulkOrders ? (
            <BulkOrders />
          ) : isProjects ? (
            <Projects />
          ) : isResources ? (
            <Resources />
          ) : isIndividualDb ? (
            <IndividualDashboard />
          ) : isBusinessDb ? (
            <BusinessDashboard />
          ) : isProfessionalDb ? (
            <ProfessionalDashboard />
          ) : isAdminDb ? (
            <AdminDashboard />
          ) : isMaterialsHub ? (
            <MaterialsHub
              categorySlug={segments[1]}
              subcategorySlug={segments[2]}
              leafSlug={segments[3]}
            />
          ) : isServicesHub ? (
            <ServicesHub
              categorySlug={segments[1]}
              typeSlug={segments[2]}
              specSlug={segments[3]}
            />
          ) : isBrandsHub ? (
            <BrandsHub brandSlug={segments[1]} />
          ) : isProductDetail ? (
            <ProductDetail />
          ) : (
            <>
              <Hero />
              <Categories />
              <Products />
              <Services />
              <RfqForm />
              <Trust />
            </>
          )}
        </main>
        <Footer />
        <Agentation />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
