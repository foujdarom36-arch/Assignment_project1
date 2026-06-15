import React from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/common/ProductCard';

const Home = () => {
  const {
    products,
    activeHomeTab,
    setActiveHomeTab,
    searchQuery,
    setAddProductModalOpen,
  } = useAppContext();

  // Filter products by active tab ('published' / 'unpublished') and search text query
  const filteredProducts = products.filter((p) => {
    const matchesStatus = p.status === activeHomeTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-brand-bodyBg">
      {/* Home Tabs Bar */}
      <div className="bg-white border-b border-brand-border px-8 shrink-0 flex items-center justify-between">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveHomeTab('published')}
            className={`py-4 text-sm font-semibold relative transition-all duration-200 focus:outline-none ${
              activeHomeTab === 'published' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Published
            {activeHomeTab === 'published' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveHomeTab('unpublished')}
            className={`py-4 text-sm font-semibold relative transition-all duration-200 focus:outline-none ${
              activeHomeTab === 'unpublished' ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Unpublished
            {activeHomeTab === 'unpublished' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col min-h-0">
        {filteredProducts.length === 0 ? (
          /* EMPTY STATE - Custom SVG Icon ⊞+ */
          <div className="m-auto flex flex-col items-center text-center max-w-sm animate-fade-in">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-brand-primary mb-4 border border-blue-100 shadow-sm select-none">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <path d="M17.5 14v7M14 17.5h7" strokeLinecap="round" strokeWidth="2.5" />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-brand-dark mb-1 select-none">
              {activeHomeTab === 'published' ? 'No Published Products' : 'No Unpublished Products'}
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line select-none">
              {activeHomeTab === 'published'
                ? 'Your Published Products will appear here\nCreate your first product to publish'
                : 'Your Unpublished Products will appear here\nCreate your first product to publish'}
            </p>

            {activeHomeTab === 'unpublished' && (
              <button
                onClick={() => setAddProductModalOpen(true)}
                className="mt-5 px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-buttonHover shadow-sm active:scale-[0.98] transition-all"
              >
                Add Product
              </button>
            )}
          </div>
        ) : (
          /* PRODUCT CARDS LIST - matching Figma Image 5 */
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

export default Home;
