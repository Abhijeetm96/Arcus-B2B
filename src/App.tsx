import { useState, useEffect, lazy, Suspense } from 'react'
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
import { Agentation } from 'agentation'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AuthPage } from './components/AuthPage'
import { IndividualDashboard } from './modules/individual/IndividualDashboard'
import { PortalResolver } from './core/auth/PortalResolver'
import { Checkout, CheckoutSuccess } from './components/Checkout'
import SearchPage from './components/SearchPage'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy loaded routes
const BrandsHub = lazy(() => import('./components/BrandsHub'))
const BulkOrders = lazy(() => import('./components/BulkOrders'))
const Projects = lazy(() => import('./components/Projects'))
const Resources = lazy(() => import('./components/Resources'))
const BusinessDashboard = lazy(() => import('./modules/business/BusinessDashboard').then(m => ({ default: m.BusinessDashboard })))
const ProfessionalDashboard = lazy(() => import('./modules/professional/ProfessionalDashboard').then(m => ({ default: m.ProfessionalDashboard })))
const AdminDashboard = lazy(() => import('./modules/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))


function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash)

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      // Legacy routes redirection maps
      if (hash === '#/account') {
        window.location.hash = '#/dashboard/individual';
        return;
      }
      if (hash === '#/business-dashboard') {
        window.location.hash = '#/dashboard/business';
        return;
      }
      if (hash === '#/professional-dashboard') {
        window.location.hash = '#/dashboard/professional';
        return;
      }
      if (hash === '#/admin') {
        window.location.hash = '#/portal/admin';
        return;
      }

      setCurrentHash(window.location.hash)
      // Scroll to top on navigation change
      window.scrollTo(0, 0)
    }

    // Run on initial mount
    handleHashChange();

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
  const isIndividualDb = segments[0] === 'dashboard' && segments[1] === 'individual'
  const isBusinessDb = segments[0] === 'dashboard' && segments[1] === 'business'
  const isProfessionalDb = segments[0] === 'dashboard' && segments[1] === 'professional'
  const isAdminDb = segments[0] === 'portal' && segments[1] === 'admin'
  const isResolver = (segments[0] === 'dashboard' && !segments[1]) || (segments[0] === 'portal' && !segments[1]) || segments[0] === 'resolver'
  const isCheckoutSuccess = segments[0] === 'checkout' && segments[1] === 'success'
  const isCheckout = segments[0] === 'checkout'
  const isBulkOrders = segments[0] === 'bulk-orders'
  const isProjects = segments[0] === 'projects'
  const isResources = segments[0] === 'resources'
  const isSearch = segments[0] === 'search'

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminDb && (
          <ErrorBoundary fallback={<div className="p-md text-red-600 bg-red-50 border-b border-red-200">Navigation bar failed to load. Please refresh the page.</div>}>
            <Navbar />
          </ErrorBoundary>
        )}
        <main>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
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
            ) : isResolver ? (
              <PortalResolver />
            ) : isSearch ? (
              <ErrorBoundary>
                <SearchPage />
              </ErrorBoundary>
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
          </Suspense>
        </main>
        {!isAdminDb && <Footer />}
        <Agentation />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
