import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import AddProductModal from './components/common/AddProductModal';
import EditProductModal from './components/common/EditProductModal';
import DeleteProductModal from './components/common/DeleteProductModal';

// Protected Route Wrapper Layout
const ProtectedLayout = () => {
  const { isAuthenticated } = useAppContext();

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bodyBg">
      {/* Left Navigation Sidebar */}
      <Sidebar />
      
      {/* Right Content View Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Modal Dialog Form Overlays */}
      <AddProductModal />
      <EditProductModal />
      <DeleteProductModal />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Dashboard Nested Routes */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="products" element={<Products />} />
          </Route>

          {/* 404 Not Found Fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-bodyBg font-sans">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-brand-error mb-4 border border-red-100 shadow-sm animate-bounce">
                  <span className="text-xl font-bold">⚠️</span>
                </div>
                <h1 className="text-3xl font-extrabold text-brand-dark mb-1 select-none">404</h1>
                <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed select-none">
                  The page you are looking for doesn't exist. Please check the URL or return to login.
                </p>
                <a
                  href="/login"
                  className="px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-lg shadow hover:bg-brand-buttonHover transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  Go to Login
                </a>
              </div>
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
