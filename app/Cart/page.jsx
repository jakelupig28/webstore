'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { Loader } from '../../components/Loader';
import { CloseIcon } from '../../components/Icons';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export default function CartPage() {
  const { cartCalls, products } = useStore();
  const cart = cartCalls.cart;
  const edges = cart?.lines?.edges || [];
  const totalQuantity = cart?.totalQuantity || 0;
  const totalAmount = cart?.cost?.totalAmount?.amount || '0.00';

  return (
    <div className="mainContainer cart">
      <Loader />
      <div className="mainContainerCart">
        <section className="cartPage landingPage">
          <div className="crtpglndpgContainer">
            {/* Background Texture View */}
            <div className="crtpglndpgVidBG">
              <img src="/brand/background stash.jpg" alt="Cart Background" />
            </div>

            <div
              className="crtpglndpgContents"
              style={edges.length === 0 ? {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '80px 20px',
                minHeight: 'calc(100vh - 100px)'
              } : undefined}
            >
              {edges.length > 0 ? (
                <>
                  {/* Cart Items Column */}
                  <div className="crtpglndpgcItems">
                    {edges.map(({ node }) => {
                      const imgUrl =
                        node.merchandise.image?.url ||
                        node.merchandise.product?.featuredImage?.url ||
                        '/brand/basiclogo.jpg';
                      const isUpdating = cartCalls.loadingLine === node.id;

                      return (
                        <div key={node.id} className="cartItem">
                          {/* Remove item button */}
                          <button
                            type="button"
                            className="removeBtn"
                            disabled={isUpdating}
                            onClick={() => cartCalls.removeCartLine(node.id)}
                            aria-label="Remove item"
                          >
                            <CloseIcon className="icons" />
                          </button>

                          {/* Product Image */}
                          <div className="cartImage">
                            {imgUrl && (
                              <img
                                src={imgUrl}
                                alt={node.merchandise.product?.title || 'Product'}
                              />
                            )}
                          </div>

                          {/* Product Information */}
                          <div className="cartInfo">
                            <h6 className="title">
                              {node.merchandise.product?.title}
                              {node.merchandise.title && node.merchandise.title !== 'Default Title'
                                ? ` (${node.merchandise.title})`
                                : ''}
                            </h6>
                            <p className="price">
                              ₱{formatPhp(node.merchandise.price?.amount)}
                            </p>

                            {/* Size Adjuster in Cart */}
                            {(() => {
                              const targetProduct = products?.find(
                                p => p.handle === node.merchandise.product?.handle || p.id === node.merchandise.product?.id
                              );
                              const availableVariants = targetProduct?.variants || [];
                              if (availableVariants.length <= 1) return null;

                              return (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    margin: '6px 0'
                                  }}
                                >
                                  <span style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    Size:
                                  </span>
                                  <div style={{ display: 'inline-flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '2px', borderRadius: '4px' }}>
                                    {availableVariants.map(v => {
                                      const isCurrent = node.merchandise.id === v.id || node.merchandise.title === v.title;
                                      return (
                                        <button
                                          key={v.id}
                                          type="button"
                                          disabled={isUpdating || !v.availableForSale}
                                          onClick={() => cartCalls.updateCartLineVariant(node.id, v.id)}
                                          title={!v.availableForSale ? 'Out of stock' : `Select size ${v.title}`}
                                          style={{
                                            padding: '2px 7px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            borderRadius: '3px',
                                            border: 'none',
                                            cursor: v.availableForSale ? 'pointer' : 'not-allowed',
                                            background: isCurrent ? '#fff' : 'transparent',
                                            color: isCurrent ? '#000' : '#aaa',
                                            transition: 'all 0.15s ease',
                                            opacity: !v.availableForSale ? 0.35 : 1
                                          }}
                                        >
                                          {v.title}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Quantity +/- Adjuster */}
                            <div className="cartQty">
                              <button
                                type="button"
                                disabled={isUpdating || node.quantity <= 1}
                                onClick={() =>
                                  cartCalls.updateCartLine(node.id, node.quantity - 1)
                                }
                              >
                                -
                              </button>
                              <p>{node.quantity}</p>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  cartCalls.updateCartLine(node.id, node.quantity + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Summary Column */}
                  <div className="crtpglndpgcSummary">
                    <h6>ITEMS SUMMARY</h6>
                    <p>
                      You have {totalQuantity || '0'} item{totalQuantity === 1 ? '' : 's'} in your Cart
                    </p>

                    <div className="crtpglndpgcsTotal">
                      <h5>TOTAL: ₱{formatPhp(totalAmount)}</h5>
                      <p>Free shipping nationwide. Taxes included.</p>
                      <button
                        type="button"
                        disabled={edges.length === 0}
                        onClick={cartCalls.checkout}
                      >
                        CHECKOUT
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '48px 56px',
                    maxWidth: '480px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  <h4 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                    YOUR CART IS EMPTY
                  </h4>
                  <p style={{ color: '#aaa', fontSize: '13px', letterSpacing: '1px', lineHeight: 1.6, marginBottom: '28px' }}>
                    Explore the PAIN STAIN 2025 collection drops.
                  </p>
                  <Link
                    href="/Collections"
                    style={{
                      display: 'inline-block',
                      background: '#fff',
                      color: '#000',
                      padding: '12px 36px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      fontSize: '12px',
                      boxShadow: '0 4px 14px rgba(255,255,255,0.2)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    SHOP DROPS
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
