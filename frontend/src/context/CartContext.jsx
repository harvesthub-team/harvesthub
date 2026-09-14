/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "harvesthub_cart";

/* =========================================
   LOAD SAVED REAL CART
========================================= */

const getInitialCart = () => {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);

    return [];
  }
};

/* =========================================
   CART PROVIDER
========================================= */

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getInitialCart);

  /* =========================================
     SAVE CART
  ========================================= */

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  /* =========================================
     ADD TO CART
  ========================================= */

  const addToCart = (product, quantity = 1) => {
    if (!product?._id) {
      return;
    }

    const farmer = product.farmerId || product.farmer || {};

    const stockQuantity = Number(
      product.quantity ?? product.stockQuantity ?? product.stock ?? 0,
    );

    const requestedQuantity = Math.max(1, Number(quantity) || 1);

    const newItem = {
      productId: product._id,

      productName: product.productName || product.name || "Product",

      pricePerUnit: Number(product.pricePerUnit ?? product.price ?? 0),

      unit: product.unit || "kg",

      quantity: requestedQuantity,

      stockQuantity,

      image: product.image || product.images?.[0] || "",

      farmerId: typeof farmer === "object" ? farmer._id : farmer,

      farmerName:
        typeof farmer === "object"
          ? farmer.fullName || farmer.name || farmer.farmName || "Farmer"
          : product.farmerName || "Farmer",

      farmerDistrict:
        typeof farmer === "object"
          ? farmer.district || farmer.farmLocation || ""
          : product.farmerDistrict || "",
    };

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === newItem.productId,
      );

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.productId !== newItem.productId) {
            return item;
          }

          const nextQuantity = item.quantity + requestedQuantity;

          const limitedQuantity =
            stockQuantity > 0
              ? Math.min(nextQuantity, stockQuantity)
              : nextQuantity;

          return {
            ...item,
            quantity: limitedQuantity,
          };
        });
      }

      return [...currentItems, newItem];
    });
  };

  /* =========================================
     INCREASE QUANTITY
  ========================================= */

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const nextQuantity = item.quantity + 1;

        if (item.stockQuantity > 0 && nextQuantity > item.stockQuantity) {
          return item;
        }

        return {
          ...item,
          quantity: nextQuantity,
        };
      }),
    );
  };

  /* =========================================
     DECREASE QUANTITY
  ========================================= */

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  /* =========================================
     REMOVE PRODUCT
  ========================================= */

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  };

  /* =========================================
     CLEAR CART
  ========================================= */

  const clearCart = () => {
    setCartItems([]);
  };

  /* =========================================
     TOTAL QUANTITY
  ========================================= */

  const itemCount = useMemo(
    () =>
      cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems],
  );

  /* =========================================
     UNIQUE PRODUCTS
  ========================================= */

  const uniqueProductCount = cartItems.length;

  /* =========================================
     SUBTOTAL
  ========================================= */

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.pricePerUnit || 0) * Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  /* =========================================
     GROUP PRODUCTS BY FARMER
  ========================================= */

  const groupedByFarmer = useMemo(() => {
    const groups = {};

    cartItems.forEach((item) => {
      const farmerKey = item.farmerId || item.farmerName || "unknown-farmer";

      if (!groups[farmerKey]) {
        groups[farmerKey] = {
          farmerId: item.farmerId || farmerKey,

          farmerName: item.farmerName || "Farmer",

          farmerDistrict: item.farmerDistrict || "",

          items: [],
        };
      }

      groups[farmerKey].items.push(item);
    });

    return Object.values(groups);
  }, [cartItems]);

  /* =========================================
     FARMER COUNT
  ========================================= */

  const farmerCount = groupedByFarmer.length;

  const isCartEmpty = cartItems.length === 0;

  /* =========================================
     CONTEXT VALUE
  ========================================= */

  const value = {
    cartItems,

    addToCart,

    increaseQuantity,
    decreaseQuantity,

    removeFromCart,
    clearCart,

    itemCount,
    uniqueProductCount,

    subtotal,

    groupedByFarmer,
    farmerCount,

    isCartEmpty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* =========================================
   CART HOOK
========================================= */

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
