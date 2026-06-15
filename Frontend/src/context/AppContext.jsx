import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('productr_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('productr_authenticated') === 'true';
  });

  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('productr_products');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    } else {
      const defaultProducts = [
        {
          id: 'prod_1',
          name: 'CakeZone Walnut Brownie',
          type: 'Food',
          stock: 200,
          mrp: 2000,
          sellingPrice: 1500,
          brandName: 'CakeZone',
          eligibility: 'Yes',
          status: 'published',
          createdAt: new Date().toISOString(),
          images: [
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=400'
          ]
        },
        {
          id: 'prod_2',
          name: 'CakeZone Choco Fudge Brownie',
          type: 'Food',
          stock: 200,
          mrp: 23,
          sellingPrice: 80,
          brandName: 'CakeZone',
          eligibility: 'YES',
          status: 'published',
          createdAt: new Date().toISOString(),
          images: [
            'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400'
          ]
        },
        {
          id: 'prod_3',
          name: 'Theobroma Christmas Cake',
          type: 'Food',
          stock: 200,
          mrp: 23,
          sellingPrice: 80,
          brandName: 'CakeZone',
          eligibility: 'YES',
          status: 'published',
          createdAt: new Date().toISOString(),
          images: [
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400'
          ]
        }
      ];
      localStorage.setItem('productr_products', JSON.stringify(defaultProducts));
      return defaultProducts;
    }
  });

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'products'
  const [activeHomeTab, setActiveHomeTab] = useState('published'); // 'published' | 'unpublished'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('productr_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('productr_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('productr_authenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('productr_products', JSON.stringify(products));
  }, [products]);

  // Auth Operations
  const requestOTP = async (emailOrPhone) => {
    // Simulated API Call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, emailOrPhone });
      }, 1000);
    });
  };

  const verifyOTP = async (otp, emailOrPhone) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '180529' || otp === '123456') { // Mock correct OTP
          setUser({ email: emailOrPhone, name: 'Demo Owner' });
          setIsAuthenticated(true);
          resolve({ success: true });
        } else {
          reject(new Error('Please enter a valid OTP'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('productr_user');
    localStorage.removeItem('productr_authenticated');
  };

  // Product Operations
  const addProduct = (productData) => {
    const imagesList = productData.images || [productData.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400'];
    const newProduct = {
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'unpublished', // default to unpublished
      images: imagesList,
      ...productData,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const toggleProductPublish = (productId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === 'published' ? 'unpublished' : 'published' }
          : p
      )
    );
  };

  const updateProduct = (productId, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updatedData } : p))
    );
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        products,
        activeTab,
        activeHomeTab,
        searchQuery,
        isAddProductModalOpen,
        editingProduct,
        deletingProduct,
        setUser,
        setIsAuthenticated,
        setActiveTab,
        setActiveHomeTab,
        setSearchQuery,
        setAddProductModalOpen,
        setEditingProduct,
        setDeletingProduct,
        requestOTP,
        verifyOTP,
        logout,
        addProduct,
        toggleProductPublish,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
