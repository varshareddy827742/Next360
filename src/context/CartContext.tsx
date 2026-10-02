import React, {
  createContext,
  useContext,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  type: string;
  seller: string;
  sellerId?: string | null;
  verified: boolean;
  description?: string;
  certificate?: string;
  stock: number;
  images?: string[];
  quantity: number;
};

type AddToCartProduct = Omit<CartItem, "quantity">;

type CartContextType = {
  cart: CartItem[];

  addToCart: (product: AddToCartProduct) => boolean;

  increaseQuantity: (id: string) => boolean;

  decreaseQuantity: (id: string) => void;

  removeFromCart: (id: string) => void;

  clearCart: () => void;

  getCartTotal: () => number;

  getCartItemCount: () => number;
};

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ADD PRODUCT
  const addToCart = (
    product: AddToCartProduct
  ): boolean => {
    if (product.stock <= 0) {
      console.log(
        "Cannot add product. Product is out of stock."
      );

      return false;
    }

    let added = false;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        if (
          existingItem.quantity >=
          existingItem.stock
        ) {
          console.log(
            "Cannot increase quantity. Maximum stock reached."
          );

          return currentCart;
        }

        added = true;

        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                stock: product.stock,
              }
            : item
        );
      }

      added = true;

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    return added;
  };

  // INCREASE QUANTITY
  const increaseQuantity = (
    id: string
  ): boolean => {
    let increased = false;

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.quantity >= item.stock) {
          console.log(
            "Cannot increase quantity. Maximum stock reached."
          );

          return item;
        }

        increased = true;

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );

    return increased;
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (id: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity - 1
              ),
            }
          : item
      )
    );
  };

  // REMOVE PRODUCT
  const removeFromCart = (id: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  // CLEAR ENTIRE CART
  const clearCart = () => {
    setCart([]);
  };

  // CALCULATE TOTAL
  const getCartTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  };

  // TOTAL NUMBER OF PRODUCTS IN CART
  const getCartItemCount = () => {
    return cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}