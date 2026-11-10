'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';

export default function CheckoutPage() {
  const { cartCalls, authCalls } = useStore();
  const user = authCalls?.user;
  const cartEdges = cartCalls.cart?.lines?.edges || [];
  const totalAmount = cartCalls.cart?.cost?.totalAmount?.amount || '0.00';

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartEdges.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const items = cartEdges.map(({ node }) => ({
        productId: node.merchandise.product?.id || node.merchandise.id,
        productTitle: node.merchandise.product?.title || 'LARO SPORTS Item',
        variantTitle: node.merchandise.title || 'Default',
        quantity: node.quantity,
        price: parseFloat(node.merchandise.price?.amount || 0),
        imageUrl: node.merchandise.image?.url || node.merchandise.product?.featuredImage?.url || ''
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          city,
          province,
          postalCode,
          paymentMethod,
          notes,
          totalAmount: parseFloat(totalAmount),
          items
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setCompletedOrder({
        orderNumber: data.orderNumber,
        customerName,
        customerEmail,
        shippingAddress: `${shippingAddress}, ${city}${province ? `, ${province}` : ''} ${postalCode}`,
        paymentMethod,
        totalAmount,
        items
      });

      cartCalls.clearCart();
    } catch (err) {
      setError(err.message || 'Could not process order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 150px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '580px',
            background: 'rgba(10, 10, 10, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '36px 32px',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 900,
              margin: '0 auto 18px'
            }}
          >
            ✓
          </div>

          <span
            style={{
              fontSize: '11px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              display: 'block',
              marginBottom: '6px'
            }}
          >
            ORDER CONFIRMED
          </span>

          <h2
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              margin: '0 0 10px'
            }}
          >
            THANK YOU, {completedOrder.customerName.toUpperCase()}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 22px'
            }}
          >
            Order Reference:{' '}
            <strong style={{ color: '#ffffff', letterSpacing: '1px' }}>
              {completedOrder.orderNumber}
            </strong>
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '12px',
              lineHeight: 1.7
            }}
          >
            <div>
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>SHIPPING TO:</strong>{' '}
              {completedOrder.shippingAddress}
            </div>
            <div>
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>PAYMENT METHOD:</strong>{' '}
              {completedOrder.paymentMethod}
            </div>
            <div>
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>TOTAL PAID / DUE:</strong>{' '}
              ₱{Number(completedOrder.totalAmount).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              href="/Orders"
              style={{
                padding: '12px 22px',
                background: '#ffffff',
                color: '#000000',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                textDecoration: 'none'
              }}
            >
              TRACK MY ORDERS
            </Link>
            <Link
              href="/Collections"
              style={{
                padding: '12px 22px',
                background: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                textDecoration: 'none'
              }}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 150px)',
        padding: '20px 36px 90px',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1160px',
        margin: '0 auto',
        color: '#ffffff'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)'
            }}
          >
            LARO SPORTS™ SECURE CHECKOUT
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '1.5px', margin: '4px 0 0' }}>
            CHECKOUT
          </h2>
        </div>
        <Link
          href="/Cart"
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '12px',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 14px',
            borderRadius: '5px'
          }}
        >
          ← BACK TO CART
        </Link>
      </div>

      {cartEdges.length === 0 ? (
        <div
          style={{
            background: 'rgba(10,10,10,0.85)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '10px',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '20px' }}>Your cart is empty</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '20px' }}>
            Add items from the PAIN STAIN 2025 collection before checking out.
          </p>
          <Link
            href="/Collections"
            style={{
              display: 'inline-block',
              padding: '12px 26px',
              background: '#ffffff',
              color: '#000000',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textDecoration: 'none'
            }}
          >
            BROWSE COLLECTIONS
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handlePlaceOrder}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Customer & Shipping Form */}
          <div
            style={{
              background: 'rgba(10, 10, 10, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: '26px'
            }}
          >
            <h4
              style={{
                margin: '0 0 18px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.8px',
                textTransform: 'uppercase'
              }}
            >
              1. CONTACT & SHIPPING DETAILS
            </h4>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '16px'
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '5px'
                  }}
                >
                  FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '5px'
                    }}
                  >
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '5px'
                    }}
                  >
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0917 123 4567"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '5px'
                  }}
                >
                  STREET ADDRESS / BARANGAY *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="House/Unit No., Street, Barangay"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: '10px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '5px'
                    }}
                  >
                    CITY *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Manila"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '5px'
                    }}
                  >
                    PROVINCE
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Metro Manila"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '5px'
                    }}
                  >
                    POSTAL *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="1000"
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginTop: '6px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '8px'
                  }}
                >
                  2. PAYMENT METHOD
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'COD', label: 'Cash on Delivery' },
                    { id: 'GCash', label: 'GCash E-Wallet' },
                    { id: 'Bank Transfer', label: 'Bank Transfer' }
                  ].map((pm) => {
                    const active = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        style={{
                          padding: '11px 8px',
                          borderRadius: '6px',
                          border: active ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                          background: active ? '#ffffff' : 'rgba(255,255,255,0.05)',
                          color: active ? '#000000' : '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.75)',
                    marginBottom: '5px'
                  }}
                >
                  ORDER NOTES (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Landmarks or delivery instructions"
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div
            style={{
              background: 'rgba(10, 10, 10, 0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: '26px'
            }}
          >
            <h4
              style={{
                margin: '0 0 18px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1.8px',
                textTransform: 'uppercase'
              }}
            >
              ORDER SUMMARY ({cartCalls.cart.totalQuantity} ITEMS)
            </h4>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '290px',
                overflowY: 'auto',
                paddingRight: '4px',
                marginBottom: '18px'
              }}
            >
              {cartEdges.map(({ node }) => {
                const lineTotal = (parseFloat(node.merchandise.price.amount) * node.quantity).toFixed(2);
                return (
                  <div
                    key={node.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={node.merchandise.image?.url || ''}
                        alt={node.merchandise.product?.title || ''}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'contain',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          padding: '4px'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>
                          {node.merchandise.product?.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                          Size: {node.merchandise.title} × {node.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>
                      ₱{Number(lineTotal).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: '14px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}>
                <span>Subtotal</span>
                <span>₱{Number(totalAmount).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}>
                <span>Nationwide Shipping</span>
                <span>FREE</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 800,
                  marginTop: '6px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <span>TOTAL</span>
                <span>₱{Number(totalAmount).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'PROCESSING ORDER...' : `PLACE ORDER — ₱${Number(totalAmount).toLocaleString()}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

