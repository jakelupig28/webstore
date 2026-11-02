'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';

const StoreContext = createContext(null);

const LOCAL_CART_KEY = 'thrd_local_cart_v1';

export const StoreProvider = ({ children }) => {
  const [products] = useState(PRODUCTS);
  const [webLoader, setWebLoader] = useState(false);
  const [activePage, setActivePage] = useState('Home');
  const [viewMobileNav, setViewMobileNav] = useState(false);
  const [volume, setVolume] = useState(0); // Starts muted as per web standards
  const [loadingLine, setLoadingLine] = useState(null);
  const [cart, setCart] = useState({
    id: 'local-cart',
    totalQuantity: 0,
    cost: { totalAmount: { amount: '0.00', currencyCode: 'PHP' } },
    lines: { edges: [] }
  });

  // Handle loader 2s timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setWebLoader(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hydrate local cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.lines) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  }, []);

  // Save cart changes
  const saveCart = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(newCart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  };

  const calculateTotal = (edges) => {
    let sum = 0;
    let qty = 0;
    edges.forEach(({ node }) => {
      const price = parseFloat(node.merchandise.price.amount) || 0;
      sum += price * node.quantity;
      qty += node.quantity;
    });
    return {
      totalAmount: { amount: sum.toFixed(2), currencyCode: 'PHP' },
      totalQuantity: qty
    };
  };

  const addToCart = async (variantId, quantity = 1, customProduct) => {
    setLoadingLine(variantId);
    try {
      let targetProduct = customProduct;
      let targetVariant = targetProduct?.variants?.find(v => v.id === variantId);

      if (!targetProduct || !targetVariant) {
        for (const p of products) {
          const v = p.variants?.find(variant => variant.id === variantId || variant.title === variantId);
          if (v) {
            targetProduct = p;
            targetVariant = v;
            break;
          }
        }
      }

      if (!targetProduct) {
        targetProduct = products[0];
        targetVariant = targetProduct?.variants?.[0] || { id: 'default', title: 'Default', price: 999, availableForSale: true };
      }

      const currentEdges = [...cart.lines.edges];
      const existingIndex = currentEdges.findIndex(
        e => e.node.merchandise.id === (targetVariant ? targetVariant.id : variantId)
      );

      if (existingIndex > -1) {
        currentEdges[existingIndex].node.quantity += quantity;
      } else {
        const newLine = {
          id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          quantity: quantity,
          merchandise: {
            id: targetVariant ? targetVariant.id : variantId,
            title: targetVariant ? targetVariant.title : 'Default Size',
            price: {
              amount: (targetVariant ? targetVariant.price : targetProduct.price).toFixed(2),
              currencyCode: 'PHP'
            },
            product: {
              id: targetProduct.id,
              title: targetProduct.title,
              handle: targetProduct.handle,
              featuredImage: {
                url: targetProduct.images[0] || ''
              }
            },
            image: {
              url: targetProduct.images[0] || '',
              altText: targetProduct.title
            }
          }
        };
        currentEdges.push({ node: newLine });
      }

      const { totalAmount, totalQuantity } = calculateTotal(currentEdges);
      const newCart = {
        ...cart,
        totalQuantity,
        cost: { totalAmount },
        lines: { edges: currentEdges }
      };

      saveCart(newCart);
    } finally {
      setLoadingLine(null);
    }
  };

  const updateCartLine = async (lineId, quantity) => {
    setLoadingLine(lineId);
    try {
      let currentEdges = [...cart.lines.edges];
      if (quantity <= 0) {
        currentEdges = currentEdges.filter(e => e.node.id !== lineId);
      } else {
        currentEdges = currentEdges.map(e => {
          if (e.node.id === lineId) {
            return {
              ...e,
              node: { ...e.node, quantity }
            };
          }
          return e;
        });
      }

      const { totalAmount, totalQuantity } = calculateTotal(currentEdges);
      saveCart({
        ...cart,
        totalQuantity,
        cost: { totalAmount },
        lines: { edges: currentEdges }
      });
    } finally {
      setLoadingLine(null);
    }
  };

  const removeCartLine = async (lineId) => {
    return updateCartLine(lineId, 0);
  };

  const updateCartLineVariant = async (lineId, newVariantId) => {
    setLoadingLine(lineId);
    try {
      let currentEdges = [...cart.lines.edges];
      const lineIndex = currentEdges.findIndex(e => e.node.id === lineId);
      if (lineIndex === -1) return;

      const currentLine = currentEdges[lineIndex].node;
      const productHandle = currentLine.merchandise.product?.handle;
      const targetProduct = products.find(
        p => p.handle === productHandle || p.id === currentLine.merchandise.product?.id
      );
      const newVariant = targetProduct?.variants?.find(
        v => v.id === newVariantId || v.title === newVariantId
      );

      if (!newVariant) return;

      const existingSameVariantIndex = currentEdges.findIndex(
        (e, idx) => idx !== lineIndex && e.node.merchandise.id === newVariant.id
      );

      if (existingSameVariantIndex > -1) {
        currentEdges[existingSameVariantIndex].node.quantity += currentLine.quantity;
        currentEdges.splice(lineIndex, 1);
      } else {
        currentEdges[lineIndex] = {
          ...currentEdges[lineIndex],
          node: {
            ...currentLine,
            merchandise: {
              ...currentLine.merchandise,
              id: newVariant.id,
              title: newVariant.title,
              price: {
                amount: newVariant.price.toFixed(2),
                currencyCode: 'PHP'
              }
            }
          }
        };
      }

      const { totalAmount, totalQuantity } = calculateTotal(currentEdges);
      saveCart({
        ...cart,
        totalQuantity,
        cost: { totalAmount },
        lines: { edges: currentEdges }
      });
    } finally {
      setLoadingLine(null);
    }
  };

  const checkout = () => {
    if (cart.checkoutUrl) {
      window.open(cart.checkoutUrl, '_blank');
    } else {
      alert(`Proceeding to checkout for ₱${cart.cost.totalAmount.amount}. Orders ship nationwide via standard courier.`);
    }
  };

  const handlePageClick = (page) => {
    setActivePage(page);
    setViewMobileNav(false);
  };

  const isActive = (page) => {
    return activePage.toLowerCase() === page.toLowerCase() ? `active ${page.toLowerCase()}` : '';
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        webLoader,
        setWebLoader,
        navCalls: {
          activePage,
          isActive,
          handlePageClick,
          viewMobileNav,
          setViewMobileNav
        },
        cartCalls: {
          cart,
          loadingLine,
          setLoadingLine,
          addToCart,
          updateCartLine,
          updateCartLineVariant,
          removeCartLine,
          checkout
        },
        videoBG: {
          volume,
          setVolume
        }
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
