import React from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/common/ProductCard';

const Products = () => {
  const {
    products,
    searchQuery,
    setAddProductModalOpen,
  } = useAppContext();

  // Filter products by search text query
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.brandName.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-brand-bodyBg">
      {/* Products catalog Header */}
      <div className="bg-white border-b border-brand-border px-8 py-4 shrink-0 flex items-center justify-between">
        <h2 className="text-base font-bold text-brand-dark select-none">
          Products
        </h2>
        
        <button
          onClick={() => setAddProductModalOpen(true)}
          className="text-xs font-bold text-slate-500 hover:text-brand-primary flex items-center gap-1 transition-colors focus:outline-none"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Products
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0">
        {products.length === 0 ? (
          /* EMPTY STATE - Feels a little empty over here... */
          <div className="m-auto flex flex-col items-center text-center max-w-sm animate-fade-in">
            {/* Custom SVG Icon ⊞+ */}
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-brand-primary mb-4 border border-blue-100 shadow-sm select-none">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <path d="M17.5 14v7M14 17.5h7" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-brand-dark mb-1 select-none">
              Feels a little empty over here...
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed select-none">
              You can create products without connecting store
              <br />
              you can add products to store anytime
            </p>

            <button
              onClick={() => setAddProductModalOpen(true)}
              className="mt-6 px-6 py-3 bg-brand-primary hover:bg-brand-buttonHover text-white text-xs font-bold rounded-lg shadow active:scale-[0.98] transition-all"
            >
              Add your Products
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* SEARCH RESULTS NOT FOUND */
          <div className="m-auto flex flex-col items-center text-center max-w-xs animate-fade-in">
            <p className="text-sm font-semibold text-slate-400">No matching items found</p>
            <p className="text-xs text-slate-400 mt-1">Try tweaking your search term</p>
          </div>
        ) : (
          /* PRODUCT CARDS LIST - catalog view matching Image 1 & 4 */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
