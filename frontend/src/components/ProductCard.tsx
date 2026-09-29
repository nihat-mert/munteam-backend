import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  atomicNumber: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-lg p-6 hover:border-accent-500 transition-colors">
      <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
      <p className="text-sm text-slate-400 mb-2">Atomic Number: {product.atomicNumber}</p>
      <p className="text-slate-300 mb-4 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-accent-500">${Number(product.price).toFixed(2)}</span>
        <span className={`text-sm ${isOutOfStock ? 'text-red-400' : 'text-slate-400'}`}>
          {t('stock')}: {product.stock}
        </span>
      </div>
      <button
        onClick={() => addToCart({ productId: product.id, name: product.name, price: Number(product.price), stock: product.stock })}
        disabled={isOutOfStock}
        className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
          isOutOfStock
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-accent-600 hover:bg-accent-700 text-white'
        }`}
      >
        {isOutOfStock ? t('outOfStock') || 'Out of Stock' : t('addToCart')}
      </button>
    </div>
  );
};
