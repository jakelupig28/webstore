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
  const { cartCalls } = useStore();
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

            <div className="crtpglndpgContents">
              {/* Cart Items Column */}
              {edges.length > 0 ? (
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
              ) : (
                <div className="crtpglndpgcItems" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="crtpglndpgciEmpty" style={{ textAlign: 'center', padding: '40px' }}>
                    <h5 style={{ color: '#fff', marginBottom: '10px' }}>Your cart is empty</h5>
                    <p style={{ color: '#888', marginBottom: '20px' }}>Explore PAIN STAIN 2025 collection drops</p>
                    <Link
                      href="/Collections"
                      style={{
                        display: 'inline-block',
                        background: '#fff',
                        color: '#000',
                        padding: '10px 24px',
                        borderRadius: '2px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '12px'
                      }}
                    >
                      Shop Drops
                    </Link>
                  </div>
                </div>
              )}

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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
