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
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Services />
        <RfqForm />
        <Trust />
      </main>
      <Footer />
    </>
  )
}

export default App
