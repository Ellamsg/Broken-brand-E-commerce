import { create } from 'zustand';

// ─── Helper to call our server-side cart API ─────────────────────────────────

async function apiAddOrUpdate(item) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

async function apiRemove(sanityId) {
  await fetch(`/api/cart?id=${sanityId}`, { method: 'DELETE' });
}

async function apiClear() {
  await fetch('/api/cart?clear=true', { method: 'DELETE' });
}

export async function loadCartFromSanity() {
  const res = await fetch('/api/cart');
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.success) return null;

  // Normalise the Sanity cart docs into the shape the store uses
  // Sanity stores _id on each item so we can delete by it later
  return data.cart.map((item) => ({
    _id: item.productId,       // used for product matching
    _sanityCartId: item._id,   // used for deleting from Sanity
    name: item.name,
    price: item.price,
    image2: item.image2,
    slug: item.slug,
    size: item.size,
    quantity: item.quantity,
  }));
}

// ─── Cart Store ───────────────────────────────────────────────────────────────

const useCartStore = create((set, get) => ({
  cart: [],
  cartTotal: 0,
  totalItems: 0,
  isLoaded: false,   // true after we've fetched from Sanity on mount

  // Call this once from a component after the session is authenticated
  loadCart: async () => {
    const items = await loadCartFromSanity();
    if (items) {
      set({
        cart: items,
        cartTotal: calculateCartTotal(items),
        totalItems: calculateTotalItems(items),
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },

  addToCart: ({ product, quantity, size }) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (item) => item._id === product._id && item.size === size
      );

      const newQty = parseInt(quantity, 10);
      let updatedCart;

      if (newQty <= 0) {
        updatedCart = state.cart.filter(
          (item) => !(item._id === product._id && item.size === size)
        );
        // Find sanityCartId to delete from Sanity
        const toRemove = state.cart.find(
          (item) => item._id === product._id && item.size === size
        );
        if (toRemove?._sanityCartId) {
          apiRemove(toRemove._sanityCartId);
        }
      } else if (existingIndex !== -1) {
        updatedCart = [...state.cart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + newQty,
        };
        // Sync update to Sanity (POST will upsert)
        apiAddOrUpdate({
          productId: product._id,
          name: product.name,
          price: product.price,
          image2: product.image2,
          slug: product.slug,
          size,
          quantity: newQty, // send the delta; server adds to existing qty
        });
      } else {
        const newItem = { ...product, quantity: newQty, size };
        updatedCart = [...state.cart, newItem];
        // Sync new item to Sanity
        apiAddOrUpdate({
          productId: product._id,
          name: product.name,
          price: product.price,
          image2: product.image2,
          slug: product.slug,
          size,
          quantity: newQty,
        });
      }

      return {
        cart: updatedCart,
        cartTotal: calculateCartTotal(updatedCart),
        totalItems: calculateTotalItems(updatedCart),
      };
    }),

  removeFromCart: (productId) =>
    set((state) => {
      const toRemove = state.cart.find((item) => item._id === productId);
      if (toRemove?._sanityCartId) {
        apiRemove(toRemove._sanityCartId);
      }
      const updatedCart = state.cart.filter((item) => item._id !== productId);
      return {
        cart: updatedCart,
        cartTotal: calculateCartTotal(updatedCart),
        totalItems: calculateTotalItems(updatedCart),
      };
    }),

  clearCart: () => {
    apiClear(); // clear all items in Sanity for this user
    set({ cart: [], cartTotal: 0, totalItems: 0 });
  },
}));

function calculateCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function calculateTotalItems(cart) {
  return cart.reduce((total) => total + 1, 0);
}

export default useCartStore;