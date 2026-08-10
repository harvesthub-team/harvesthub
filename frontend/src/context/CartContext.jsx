import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'harvesthub_carts';

function getSavedCarts() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : {};
  } catch {
    return {};
  }
}

function normalizeProduct(product, quantity = 1) {
  const productId =
    product?._id ||
    product?.productId;

  const stock = Number(
    product?.quantity ??
      product?.maxQuantity ??
      0
  );

  const requestedQuantity = Math.max(
    1,
    Number(quantity) || 1
  );

  return {
    productId,

    name:
      product?.name ||
      product?.productName ||
      'Product',

    pricePerUnit: Number(
      product?.pricePerUnit ??
        product?.price ??
        0
    ),

    unit:
      product?.unit ||
      '',

    quantity:
      stock > 0
        ? Math.min(
            requestedQuantity,
            stock
          )
        : requestedQuantity,

    maxQuantity: stock,

    image: Array.isArray(product?.images)
      ? product.images[0] || ''
      : product?.image || '',

    farmerId:
      product?.farmerId?._id ||
      product?.farmerId ||
      '',

    farmerName:
      product?.farmerName ||
      product?.farmerId?.fullName ||
      product?.farmer?.fullName ||
      'HarvestHub Farmer',

    farmerDistrict:
      product?.farmerId?.district ||
      product?.farmer?.district ||
      product?.district ||
      '',
  };
}

export function CartProvider({
  children,
}) {
  const { user } = useAuth();

  const userId =
    user?._id ||
    user?.id ||
    'guest';

  const currentCartKey =
    `cart_${userId}`;

  const [carts, setCarts] =
    useState(getSavedCarts);

  const cartItems = useMemo(
    () =>
      carts[currentCartKey] || [],
    [carts, currentCartKey]
  );

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(carts)
    );
  }, [carts]);

  const updateCurrentCart = (
    updater
  ) => {
    setCarts((previousCarts) => {
      const currentItems =
        previousCarts[
          currentCartKey
        ] || [];

      const updatedItems =
        typeof updater === 'function'
          ? updater(currentItems)
          : updater;

      return {
        ...previousCarts,

        [currentCartKey]:
          updatedItems,
      };
    });
  };

  const addToCart = (
    product,
    quantity = 1
  ) => {
    if (
      !product?._id &&
      !product?.productId
    ) {
      return {
        success: false,
        message:
          'Invalid product',
      };
    }

    const itemToAdd =
      normalizeProduct(
        product,
        quantity
      );

    if (
      itemToAdd.maxQuantity <= 0
    ) {
      return {
        success: false,
        message:
          'This product is out of stock',
      };
    }

    updateCurrentCart(
      (currentItems) => {
        const existingItem =
          currentItems.find(
            (item) =>
              item.productId ===
              itemToAdd.productId
          );

        if (!existingItem) {
          return [
            ...currentItems,
            itemToAdd,
          ];
        }

        return currentItems.map(
          (item) => {
            if (
              item.productId !==
              itemToAdd.productId
            ) {
              return item;
            }

            const maxQuantity =
              item.maxQuantity ||
              itemToAdd.maxQuantity;

            return {
              ...item,

              quantity: Math.min(
                item.quantity +
                  itemToAdd.quantity,

                maxQuantity
              ),

              maxQuantity,
            };
          }
        );
      }
    );

    return {
      success: true,
      message:
        'Product added to cart',
    };
  };

  const updateQuantity = (
    productId,
    quantity
  ) => {
    updateCurrentCart(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              item.productId !==
              productId
            ) {
              return item;
            }

            const maxQuantity =
              item.maxQuantity ||
              Number.MAX_SAFE_INTEGER;

            const nextQuantity =
              Math.max(
                1,

                Math.min(
                  Number(quantity) ||
                    1,

                  maxQuantity
                )
              );

            return {
              ...item,
              quantity:
                nextQuantity,
            };
          }
        )
    );
  };

  const removeFromCart = (
    productId
  ) => {
    updateCurrentCart(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.productId !==
            productId
        )
    );
  };

  const clearCart = () => {
    updateCurrentCart([]);
  };

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          item.pricePerUnit *
            item.quantity,

        0
      ),
    [cartItems]
  );

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          item.quantity,

        0
      ),
    [cartItems]
  );

  const uniqueFarmerCount =
    useMemo(() => {
      const farmerIds =
        new Set(
          cartItems.map(
            (item) =>
              item.farmerId ||
              item.farmerName
          )
        );

      return farmerIds.size;
    }, [cartItems]);

  const value = {
    cartItems,

    cartTotal,

    cartCount,

    uniqueFarmerCount,

    addToCart,

    updateQuantity,

    removeFromCart,

    clearCart,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
}