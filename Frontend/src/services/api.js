import axios from 'axios';

// Create standard Axios client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.productr.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Backend Interceptor
api.interceptors.request.use(
  async (config) => {
    // Add artificial delay (e.g., 800ms) to show skeleton loaders and shimmer states
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Intercept requests and mock them
    const url = config.url;
    const method = config.method;
    const data = config.data;

    // Retrieve local state
    const getStoredProducts = () => {
      const p = localStorage.getItem('productr_products');
      return p ? JSON.parse(p) : [];
    };

    const setStoredProducts = (products) => {
      localStorage.setItem('productr_products', JSON.stringify(products));
    };

    // 1. Authentication request OTP
    if (url === '/auth/login' && method === 'post') {
      config.adapter = () => {
        return Promise.resolve({
          data: { success: true, message: 'OTP sent successfully' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };
    }

    // 2. Authentication verify OTP
    if (url === '/auth/verify' && method === 'post') {
      config.adapter = () => {
        const { otp, emailOrPhone } = data;
        // Mock valid OTPs
        if (otp === '180529' || otp === '123456') {
          return Promise.resolve({
            data: {
              success: true,
              user: { email: emailOrPhone, name: 'Demo Owner' },
              token: 'mock-jwt-token-xyz',
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          });
        } else {
          return Promise.reject({
            response: {
              data: { success: false, message: 'Please enter a valid OTP' },
              status: 400,
              statusText: 'Bad Request',
              headers: {},
              config,
            },
          });
        }
      };
    }

    // 3. Products list GET
    if (url === '/products' && method === 'get') {
      config.adapter = () => {
        return Promise.resolve({
          data: { success: true, products: getStoredProducts() },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };
    }

    // 4. Product create POST
    if (url === '/products' && method === 'post') {
      config.adapter = () => {
        const currentProducts = getStoredProducts();
        const newProduct = {
          id: `prod_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'unpublished',
          images: [],
          ...data,
        };
        const updatedProducts = [newProduct, ...currentProducts];
        setStoredProducts(updatedProducts);

        return Promise.resolve({
          data: { success: true, product: newProduct },
          status: 201,
          statusText: 'Created',
          headers: {},
          config,
        });
      };
    }

    // 5. Product update publish status PUT
    if (url.startsWith('/products/') && url.endsWith('/toggle-status') && method === 'put') {
      config.adapter = () => {
        const id = url.split('/')[2];
        const currentProducts = getStoredProducts();
        let updatedProduct = null;

        const updatedProducts = currentProducts.map((p) => {
          if (p.id === id) {
            updatedProduct = {
              ...p,
              status: p.status === 'published' ? 'unpublished' : 'published',
            };
            return updatedProduct;
          }
          return p;
        });

        setStoredProducts(updatedProducts);

        if (updatedProduct) {
          return Promise.resolve({
            data: { success: true, product: updatedProduct },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          });
        } else {
          return Promise.reject({
            response: {
              data: { success: false, message: 'Product not found' },
              status: 404,
              statusText: 'Not Found',
              headers: {},
              config,
            },
          });
        }
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
