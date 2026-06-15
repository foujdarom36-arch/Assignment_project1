import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ProductCard = ({ product }) => {
  const { toggleProductPublish, setEditingProduct, setDeletingProduct } = useAppContext();
  
  // Slider active image state
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Fallback images if not set
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400'];

  const handleDotClick = (e, index) => {
    e.stopPropagation();
    if (index < images.length) {
      setActiveImgIndex(index);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditingProduct(product);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeletingProduct(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-border overflow-hidden flex flex-col p-4 w-full max-w-sm animate-fade-in hover:shadow-premium hover:border-slate-300 transition-all duration-300">
      
      {/* Product Image Frame */}
      <div className="border border-slate-100 rounded-xl aspect-[4/3] bg-slate-50 overflow-hidden relative flex items-center justify-center">
        <img
          src={images[activeImgIndex] || images[0]}
          alt={product.name}
          className="w-full h-full object-contain p-2 hover:scale-[1.03] transition-transform duration-500"
        />
      </div>

      {/* Slide Pagination Dots (5 dots) */}
      <div className="flex justify-center gap-1.5 mt-3 mb-4 select-none">
        {[0, 1, 2, 3, 4].map((dotIdx) => {
          const isActive = activeImgIndex === dotIdx;
          const hasImage = dotIdx < images.length;
          return (
            <button
              key={dotIdx}
              type="button"
              onClick={(e) => handleDotClick(e, dotIdx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'bg-orange-500 w-3'
                  : hasImage
                  ? 'bg-slate-300 hover:bg-slate-400'
                  : 'bg-slate-100'
              }`}
              title={`View slide ${dotIdx + 1}`}
            />
          );
        })}
      </div>

      {/* Product Title */}
      <h3 className="text-xs font-bold text-brand-dark mb-3 truncate font-sans text-left">
        {product.name}
      </h3>

      {/* Structural Details Table */}
      <div className="space-y-1.5 text-slate-500 text-[10px] flex-1 font-medium mb-4 select-none text-left">
        
        {/* Product Type */}
        <div className="flex justify-between border-b border-slate-50 pb-1.5">
          <span>Product type -</span>
          <span className="text-brand-dark font-semibold">{product.type}</span>
        </div>

        {/* Quantity Stock */}
        <div className="flex justify-between border-b border-slate-50 pb-1.5">
          <span>Quantity Stock -</span>
          <span className="text-brand-dark font-semibold">{product.stock}</span>
        </div>

        {/* MRP */}
        <div className="flex justify-between border-b border-slate-50 pb-1.5">
          <span>MRP -</span>
          <span className="text-brand-dark font-semibold">₹ {product.mrp}</span>
        </div>

        {/* Selling Price */}
        <div className="flex justify-between border-b border-slate-50 pb-1.5">
          <span>Selling Price -</span>
          <span className="text-brand-dark font-semibold">₹ {product.sellingPrice}</span>
        </div>

        {/* Brand Name */}
        <div className="flex justify-between border-b border-slate-50 pb-1.5">
          <span>Brand Name -</span>
          <span className="text-brand-dark font-semibold">{product.brandName}</span>
        </div>

        {/* Total Number of images */}
        <div className="flex justify-between border-b border-slate-50 pb-1.5">
          <span>Total Number of images -</span>
          <span className="text-brand-dark font-semibold">{images.length}</span>
        </div>

        {/* Exchange Eligibility */}
        <div className="flex justify-between pb-1">
          <span>Exchange Eligibility -</span>
          <span className="text-brand-dark font-semibold">
            {(product.eligibility || 'Yes').toUpperCase()}
          </span>
        </div>

      </div>

      {/* Card Buttons Layout */}
      <div className="flex gap-2.5 items-center justify-between mt-auto">
        {/* Toggle active button */}
        {product.status === 'published' ? (
          <button
            onClick={() => toggleProductPublish(product.id)}
            className="flex-1 bg-[#48c734] hover:bg-[#3fb02d] text-white text-xs font-bold py-2 rounded-lg text-center transition-colors shadow-sm focus:outline-none"
          >
            Unpublish
          </button>
        ) : (
          <button
            onClick={() => toggleProductPublish(product.id)}
            className="flex-1 bg-brand-primary hover:bg-brand-buttonHover text-white text-xs font-bold py-2 rounded-lg text-center transition-colors shadow-sm focus:outline-none"
          >
            Publish
          </button>
        )}

        {/* Edit Button */}
        <button
          onClick={handleEditClick}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors focus:outline-none"
        >
          Edit
        </button>

        {/* Trash Button */}
        <button
          onClick={handleDeleteClick}
          className="p-2 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors focus:outline-none"
          title="Delete product"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

export default ProductCard;
