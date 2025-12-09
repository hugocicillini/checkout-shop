export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartWithDetails extends CartItem {
  name: string;
  price: number;
  description: string;
}

const CART_KEY = "checkout-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(productId: string, quantity: number = 1): void {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  // Disparar evento customizado para atualizar UI
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter((item) => item.productId !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function updateQuantity(productId: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find((item) => item.productId === productId);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}
