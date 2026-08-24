// src/store/cartStore.ts
import { create } from 'zustand';

interface CourseItem {
  id: string;
  title: string;
  instructor: string;
  image: string;
  price: number;
  originalPrice: number;
  rating?: number;
}

interface CartStore {
  cartItems: CourseItem[];
  wishlistItems: CourseItem[];
  
  // Cart Actions
  addToCart: (item: CourseItem) => void;
  removeFromCart: (id: string) => void;
  moveToWishlist: (id: string) => void;
  
  // Wishlist Actions
  addToWishlist: (item: CourseItem) => void;
  removeFromWishlist: (id: string) => void;
  moveToCart: (id: string) => void;
  
  clearAll: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  wishlistItems: [],

  addToCart: (item) => set((state) => {
    if (state.cartItems.some(i => i.id === item.id)) return state;
    return { cartItems: [...state.cartItems, item] };
  }),

  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter((item) => item.id !== id)
  })),

  moveToWishlist: (id) => set((state) => {
    const target = state.cartItems.find(item => item.id === id);
    if (!target) return state;
    const cleanCart = state.cartItems.filter(item => item.id !== id);
    const hasWish = state.wishlistItems.some(item => item.id === id);
    return {
      cartItems: cleanCart,
      wishlistItems: hasWish ? state.wishlistItems : [...state.wishlistItems, target]
    };
  }),

  addToWishlist: (item) => set((state) => {
    if (state.wishlistItems.some(i => i.id === item.id)) return state;
    return { wishlistItems: [...state.wishlistItems, item] };
  }),

  removeFromWishlist: (id) => set((state) => ({
    wishlistItems: state.wishlistItems.filter((item) => item.id !== id)
  })),

  moveToCart: (id) => set((state) => {
    const target = state.wishlistItems.find(item => item.id === id);
    if (!target) return state;
    const cleanWish = state.wishlistItems.filter(item => item.id !== id);
    const hasCart = state.cartItems.some(item => item.id === id);
    return {
      wishlistItems: cleanWish,
      cartItems: hasCart ? state.cartItems : [...state.cartItems, target]
    };
  }),

  clearAll: () => set({ cartItems: [], wishlistItems: [] }),
}));