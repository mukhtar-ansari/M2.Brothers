import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string, size: string, color: string) => void;
  updateQuantity: (product_id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: '',
      couponDiscount: 0,
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === item.product_id && i.size === item.size && i.color === item.color
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      removeItem: (product_id, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === product_id && i.size === size && i.color === color)
          ),
        })),
      updateQuantity: (product_id, size, color, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        })),
      clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),
      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: '', couponDiscount: 0 }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'm2-cart' }
  )
);
