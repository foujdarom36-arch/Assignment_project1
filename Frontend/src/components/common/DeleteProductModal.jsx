import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

const DeleteProductModal = () => {
  const { deletingProduct, setDeletingProduct, deleteProduct } = useAppContext();

  if (!deletingProduct) return null;

  const handleDelete = () => {
    deleteProduct(deletingProduct.id);
    setDeletingProduct(null);
  };

  return (
    <Modal
      isOpen={!!deletingProduct}
      onClose={() => setDeletingProduct(null)}
      title="Delete Product"
    >
      <div className="space-y-6 text-center md:text-left">
        {/* Modal Description */}
        <div className="space-y-1 text-sm text-slate-600 select-none">
          <p>Are you sure you really want to delete this Product</p>
          <p className="font-extrabold text-brand-dark mt-1">
            " {deletingProduct.name} " ?
          </p>
        </div>

        {/* Buttons Action Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDeletingProduct(null)}
            className="px-5 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-lg border border-slate-200 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          
          <Button
            type="button"
            onClick={handleDelete}
            className="bg-brand-primary text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-brand-buttonHover shadow transition-colors"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProductModal;
