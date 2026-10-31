import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/home.jsx';
import Shop from './components/shop.jsx';
import Navbar from './components/navbar.jsx';
import Login from './components/login.jsx'; // <-- lowercase import
import './components/App.css';
import Franchise from './components/franchise.jsx';
import './components/franchise.css';
import About from './components/about.jsx';
import Contact from './components/contact.jsx';
import Footer from './components/footer.jsx';
import './components/contact.css';
import { StoreProvider } from './context/StoreContext.jsx';
import CartDrawer, { AnnouncementBar, Toaster } from './components/CartDrawer.jsx';


function App() {
  return (
    <StoreProvider>
    <Router>
      <AnnouncementBar />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
      <Route path="/franchise" element={<Franchise />} />
      <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} /> {/* <-- login route */}
      </Routes>
      <Footer />
      <CartDrawer />
      <Toaster />
    </Router>
    </StoreProvider>
  );
}

export default App;