import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import Products from './components/Products'
import Services from './components/Services'
import RfqForm from './components/RfqForm'
import Trust from './components/Trust'
import Footer from './components/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Categories />
        <Products />
        <Services />
        <RfqForm />
        <Trust />
      </main>
      <Footer />
    </div>
  )
}

export default App
