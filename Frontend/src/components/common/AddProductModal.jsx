import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import productService from '../../services/productService';

const AddProductModal = () => {
  const { isAddProductModalOpen, setAddProductModalOpen, addProduct } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [apiError, setApiError] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
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

  const mrpVal = watch('mrp');
  const sellingPriceVal = watch('sellingPrice');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    // Validate selling price <= MRP
    const mrpNum = parseFloat(data.mrp);
    const sellingPriceNum = parseFloat(data.sellingPrice);
    if (sellingPriceNum > mrpNum) {
      setApiError('Selling Price cannot exceed MRP.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Create product request via simulated Axios API service
      await productService.createProduct({
        name: data.name,
        type: data.type,
        stock: parseInt(data.stock, 10),
        mrp: mrpNum,
        sellingPrice: sellingPriceNum,
        brandName: data.brandName,
        eligibility: data.eligibility,
        image: imagePreview || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400', // fall back to nice shoe image
      });

      // Update state in Context (which triggers local persistence automatically)
      addProduct({
        name: data.name,
        type: data.type,
        stock: parseInt(data.stock, 10),
        mrp: mrpNum,
        sellingPrice: sellingPriceNum,
        brandName: data.brandName,
        eligibility: data.eligibility,
        image: imagePreview || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
      });

      // Reset and close
      reset();
      setImagePreview(null);
      setAddProductModalOpen(false);
    } catch (err) {
      setApiError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const productTypes = ['Food', 'Apparel', 'Electronics', 'Footwear', 'Beauty & Personal Care', 'Home & Kitchen', 'Books', 'Toys', 'Services'];

  return (
    <Modal
      isOpen={isAddProductModalOpen}
      onClose={() => setAddProductModalOpen(false)}
      title="Add Product"
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

        {/* Pricing Layout Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* MRP */}
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

          {/* Selling Price */}
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

        {/* Upload Product Images */}
        <div>
          <label className="block text-xs font-semibold text-brand-dark mb-1">
            Upload Product Images
          </label>
          <div
            onClick={handleUploadBoxClick}
            className="border-dashed border-2 border-slate-200 rounded-lg p-5 text-center cursor-pointer hover:border-brand-primary/50 transition-colors flex flex-col items-center justify-center bg-slate-50/50 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block mt-1">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-auto rounded border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 select-none">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                <span className="text-xs text-slate-400 font-medium mt-1">Enter Description</span>
                <span className="text-xs text-brand-primary font-bold hover:underline">Browse</span>
              </div>
            )}
          </div>
        </div>

        {/* Exchange or return eligibility */}
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

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-32 bg-brand-primary text-white font-semibold rounded-lg text-sm shadow hover:bg-brand-buttonHover transition-colors"
          >
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
