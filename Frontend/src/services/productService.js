import api from './api';

export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  toggleProductStatus: async (productId) => {
    const response = await api.put(`/products/${productId}/toggle-status`);
    return response.data;
  },
};

export default productService;
