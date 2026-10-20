import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Favoritos from './components/Favoritos.jsx';

export default function App() {
  return (
    <div className="flex min-h-full flex-col bg-[#F8FAFC]">
      <Header />
      {/* pb-20 reserva espacio para el footer fijo */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/administracion" element={<AdminPanel />} />
          <Route path="*" element={<p className="py-20 text-center text-slate-500">Esta página no existe.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
