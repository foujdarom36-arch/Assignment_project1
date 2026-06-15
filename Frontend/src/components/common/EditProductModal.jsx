import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const EditProductModal = () => {
  const { editingProduct, setEditingProduct, updateProduct } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [apiError, setApiError] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      type: '',
      stock: '',
      mrp: '',
      sellingPrice: '',
      brandName: '',
      eligibility: 'Yes',
    },
  });

  // Prefill form values when modal opens
  useEffect(() => {
    if (editingProduct) {
      setValue('name', editingProduct.name);
      setValue('type', editingProduct.type);
      setValue('stock', editingProduct.stock);
      setValue('mrp', editingProduct.mrp);
      setValue('sellingPrice', editingProduct.sellingPrice);
      setValue('brandName', editingProduct.brandName);
      setValue('eligibility', editingProduct.eligibility || 'Yes');
      
      const productImages = editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : [editingProduct.image];
      setImages(productImages);
      setApiError(null);
    }
  }, [editingProduct, setValue]);

  if (!editingProduct) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data) => {
    const mrpNum = parseFloat(data.mrp);
    const sellingPriceNum = parseFloat(data.sellingPrice);

    if (sellingPriceNum > mrpNum) {
      setApiError('Selling Price cannot exceed MRP.');
      return;
    }

    if (images.length === 0) {
      setApiError('At least one product image is required.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    // Simulate API save
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      updateProduct(editingProduct.id, {
        name: data.name,
        type: data.type,
        stock: parseInt(data.stock, 10),
        mrp: mrpNum,
        sellingPrice: sellingPriceNum,
        brandName: data.brandName,
        eligibility: data.eligibility,
        images: images,
        image: images[0], // primary image
      });

      setEditingProduct(null);
    } catch (err) {
      setApiError('Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productTypes = ['Food', 'Apparel', 'Electronics', 'Footwear', 'Beauty & Personal Care', 'Home & Kitchen', 'Books', 'Toys', 'Services'];

  return (
    <Modal
      isOpen={!!editingProduct}
      onClose={() => setEditingProduct(null)}
      title="Edit Product"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 text-brand-error text-xs rounded-lg flex items-start gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p>{apiError}</p>
            </div>
            <button type="button" onClick={() => setApiError(null)} className="text-brand-error hover:text-red-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1">
            Product Name <span className="text-brand-error">*</span>
          </label>
          <input
            type="text"
            placeholder="CakeZone Walnut Brownie"
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-colors ${
              errors.name ? 'border-brand-error focus:border-brand-error focus:ring-1 focus:ring-brand-error' : 'border-brand-border focus:border-brand-primary'
            }`}
            {...register('name', { required: 'Product name is required' })}
          />
          {errors.name && <span className="text-xs text-brand-error mt-1 block">{errors.name.message}</span>}
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1">
            Product Type <span className="text-brand-error">*</span>
          </label>
          <select
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-colors ${
              errors.type ? 'border-brand-error focus:border-brand-error focus:ring-1 focus:ring-brand-error' : 'border-brand-border focus:border-brand-primary'
            }`}
            {...register('type', { required: 'Please select a product type' })}
          >
            <option value="">Select product type</option>
            {productTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <span className="text-xs text-brand-error mt-1 block">{errors.type.message}</span>}
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1">
            Quantity Stock <span className="text-brand-error">*</span>
          </label>
          <input
            type="number"
            placeholder="Total numbers of Stock available"
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-colors ${
              errors.stock ? 'border-brand-error focus:border-brand-error focus:ring-1 focus:ring-brand-error' : 'border-brand-border focus:border-brand-primary'
            }`}
            {...register('stock', {
              required: 'Quantity stock is required',
              min: { value: 0, message: 'Stock cannot be negative' },
            })}
          />
          {errors.stock && <span className="text-xs text-brand-error mt-1 block">{errors.stock.message}</span>}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">
              MRP <span className="text-brand-error">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Total numbers of Stock available"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-colors ${
                errors.mrp ? 'border-brand-error focus:border-brand-error' : 'border-brand-border focus:border-brand-primary'
              }`}
              {...register('mrp', {
                required: 'MRP is required',
                min: { value: 0.01, message: 'Must be greater than 0' },
              })}
            />
            {errors.mrp && <span className="text-xs text-brand-error mt-1 block">{errors.mrp.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">
              Selling Price <span className="text-brand-error">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Total numbers of Stock available"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-colors ${
                errors.sellingPrice ? 'border-brand-error focus:border-brand-error' : 'border-brand-border focus:border-brand-primary'
              }`}
              {...register('sellingPrice', {
                required: 'Selling price is required',
                min: { value: 0.01, message: 'Must be greater than 0' },
              })}
            />
            {errors.sellingPrice && <span className="text-xs text-brand-error mt-1 block">{errors.sellingPrice.message}</span>}
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1">
            Brand Name <span className="text-brand-error">*</span>
          </label>
          <input
            type="text"
            placeholder="Total numbers of Stock available"
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-colors ${
              errors.brandName ? 'border-brand-error focus:border-brand-error' : 'border-brand-border focus:border-brand-primary'
            }`}
            {...register('brandName', { required: 'Brand name is required' })}
          />
          {errors.brandName && <span className="text-xs text-brand-error mt-1 block">{errors.brandName.message}</span>}
        </div>

        {/* Upload Product Images and List (Image 2 representation) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-brand-dark">
              Upload Product Images
            </label>
            <button
              type="button"
              onClick={handleAddPhotosClick}
              className="text-xxs font-bold text-slate-500 hover:text-brand-primary transition-colors focus:outline-none"
            >
              Add More Photos
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          {/* Dotted border box containing list of current photos */}
          <div className="border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/30 flex flex-wrap gap-2.5 min-h-[96px] items-center">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="relative w-14 h-14 border border-slate-100 rounded-lg bg-white overflow-hidden shadow-xs shrink-0 group">
                <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-1 -right-1 bg-slate-400 hover:bg-red-500 text-white rounded-full p-0.5 shadow transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            
            {images.length === 0 && (
              <p className="text-slate-400 text-xxs text-center w-full select-none">
                No photos selected. Click "Add More Photos" above.
              </p>
            )}
          </div>
        </div>

        {/* Exchange eligibility */}
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1">
            Exchange or return eligibility
          </label>
          <select
            className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-primary transition-colors"
            {...register('eligibility')}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-32 bg-brand-primary hover:bg-brand-buttonHover text-white font-semibold rounded-lg text-sm shadow transition-colors"
          >
            Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
