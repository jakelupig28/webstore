'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { VideoBackground } from '../../components/VideoBackground';
import { Loader } from '../../components/Loader';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export default function CheckoutPage() {
  const { cartCalls, authCalls, products } = useStore();
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
        customerPhone,
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff',
        padding: '78px 36px 96px',
        boxSizing: 'border-box'
      }}
    >
      <Loader />

      {/* Full-Screen Ambient Video Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <VideoBackground
          src="/brand/video brand2.mp4"
          poster="/brand/background stash.jpg"
          style={{ opacity: 0.45 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.88) 100%)'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1180px',
          margin: '0 auto'
        }}
      >
        {completedOrder ? (
          <div
            style={{
              minHeight: 'calc(100vh - 180px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '580px',
                background: 'rgba(10, 10, 12, 0.86)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                padding: '34px 32px',
                color: '#ffffff',
                textAlign: 'center',
                boxShadow: '0 24px 60px rgba(0,0,0,0.85)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 900,
                  margin: '0 auto 14px'
                }}
              >
                ✓
              </div>

              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.55)',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                ORDER CONFIRMED • SAVED TO DATABASE
              </span>

              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  margin: '0 0 8px'
                }}
              >
                THANK YOU, {completedOrder.customerName.toUpperCase()}
              </h2>

              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  marginBottom: '18px'
                }}
              >
                Order Reference: <strong style={{ letterSpacing: '1px' }}>{completedOrder.orderNumber}</strong>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  textAlign: 'left',
                  marginBottom: '20px',
                  fontSize: '12px',
                  lineHeight: 1.75
                }}
              >
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>SHIPPING TO: </span>
                  {completedOrder.shippingAddress}
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>CONTACT: </span>
                  {completedOrder.customerEmail} • {completedOrder.customerPhone}
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>PAYMENT METHOD: </span>
                  {completedOrder.paymentMethod}
                </div>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>TOTAL AMOUNT: </span>
                  <strong style={{ color: '#fff' }}>₱{formatPhp(completedOrder.totalAmount)}</strong>
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
                  VIEW MY ORDERS
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
        ) : (
          <>
            {/* Top Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '2.2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)'
                  }}
                >
                  PAIN STAIN 2025 • NATIONWIDE DISPATCH
                </span>
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    margin: '2px 0 0'
                  }}
                >
                  SECURE CHECKOUT
                </h2>
              </div>

              <Link
                href="/Cart"
                style={{
                  color: '#ffffff',
                  background: 'rgba(10,10,12,0.75)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.24)',
                  padding: '8px 16px',
                  borderRadius: '6px'
                }}
              >
                ← BACK TO CART
              </Link>
            </div>

            {cartEdges.length === 0 ? (
              <div
                style={{
                  background: 'rgba(10,10,12,0.84)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '12px',
                  padding: '52px 24px',
                  textAlign: 'center',
                  maxWidth: '500px',
                  margin: '40px auto'
                }}
              >
                <h3 style={{ margin: '0 0 10px', fontSize: '20px', letterSpacing: '1.5px' }}>
                  YOUR CART IS EMPTY
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px' }}>
                  Add streetwear pieces from the PAIN STAIN 2025 drop before checking out.
                </p>
                <Link
                  href="/Collections"
                  style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    textDecoration: 'none'
                  }}
                >
                  EXPLORE COLLECTIONS
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handlePlaceOrder}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.35fr 1fr',
                  gap: '22px',
                  alignItems: 'start'
                }}
              >
                {/* Left Column: Customer & Shipping Form */}
                <div
                  style={{
                    background: 'rgba(10, 10, 12, 0.82)',
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '12px',
                    padding: '22px 24px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.75)'
                  }}
                >
                  {error && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.16)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#fca5a5',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        marginBottom: '14px'
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Section 1: Contact Information */}
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '1.6px',
                          textTransform: 'uppercase'
                        }}
                      >
                        1. CONTACT INFORMATION
                      </span>
                      {!user && (
                        <Link
                          href="/Login"
                          style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.7)',
                            textDecoration: 'underline'
                          }}
                        >
                          Have an account? Sign in
                        </Link>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '10px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: 'rgba(255,255,255,0.68)',
                            marginBottom: '4px'
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
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: 'rgba(255,255,255,0.68)',
                            marginBottom: '4px'
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
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: 'rgba(255,255,255,0.68)',
                            marginBottom: '4px'
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
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Shipping Address */}
                  <div
                    style={{
                      marginBottom: '16px',
                      paddingTop: '14px',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1.6px',
                        textTransform: 'uppercase',
                        marginBottom: '10px'
                      }}
                    >
                      2. SHIPPING ADDRESS
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: 'rgba(255,255,255,0.68)',
                            marginBottom: '4px'
                          }}
                        >
                          STREET ADDRESS / HOUSE NO. / BARANGAY *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Unit / House No., Street Name, Barangay"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '12px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: '10px' }}>
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '1px',
                              color: 'rgba(255,255,255,0.68)',
                              marginBottom: '4px'
                            }}
                          >
                            CITY / MUNICIPALITY *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Manila"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.18)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '1px',
                              color: 'rgba(255,255,255,0.68)',
                              marginBottom: '4px'
                            }}
                          >
                            PROVINCE / REGION
                          </label>
                          <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            placeholder="Metro Manila"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.18)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '1px',
                              color: 'rgba(255,255,255,0.68)',
                              marginBottom: '4px'
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
                              padding: '10px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.18)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Payment Method */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1.6px',
                        textTransform: 'uppercase',
                        marginBottom: '10px'
                      }}
                    >
                      3. PAYMENT METHOD & NOTES
                    </span>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      {[
                        { id: 'COD', title: 'Cash on Delivery', sub: 'Pay upon courier arrival' },
                        { id: 'GCash', title: 'GCash E-Wallet', sub: 'Instant mobile transfer' },
                        { id: 'Bank Transfer', title: 'Bank Transfer', sub: 'BPI / BDO / UnionBank' }
                      ].map((pm) => {
                        const active = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '7px',
                              border: active
                                ? '1px solid #ffffff'
                                : '1px solid rgba(255,255,255,0.18)',
                              background: active ? '#ffffff' : 'rgba(255,255,255,0.05)',
                              color: active ? '#000000' : '#ffffff',
                              textAlign: 'left',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontSize: '11px', fontWeight: 800 }}>{pm.title}</div>
                            <div
                              style={{
                                fontSize: '10px',
                                opacity: active ? 0.7 : 0.55,
                                marginTop: '2px'
                              }}
                            >
                              {pm.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional delivery notes or landmarks for rider..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Right Column: Interactive Order Summary */}
                <div
                  style={{
                    background: 'rgba(10, 10, 12, 0.82)',
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '12px',
                    padding: '22px 24px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.75)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1.6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      ORDER SUMMARY
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '3px 9px',
                        borderRadius: '99px'
                      }}
                    >
                      {cartCalls.cart.totalQuantity} item{cartCalls.cart.totalQuantity === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Cart Lines List */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      maxHeight: '240px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                      marginBottom: '16px'
                    }}
                  >
                    {cartEdges.map(({ node }) => {
                      const lineTotal =
                        (parseFloat(node.merchandise.price.amount) || 0) * node.quantity;
                      const targetProduct = products?.find(
                        (p) =>
                          p.handle === node.merchandise.product?.handle ||
                          p.id === node.merchandise.product?.id
                      );
                      const variants = targetProduct?.variants || [];

                      return (
                        <div
                          key={node.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={node.merchandise.image?.url || ''}
                              alt={node.merchandise.product?.title || ''}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'contain',
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '6px',
                                padding: '3px'
                              }}
                            />
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700 }}>
                                {node.merchandise.product?.title}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginTop: '4px'
                                }}
                              >
                                {variants.length > 1 ? (
                                  variants.map((v) => {
                                    const isCurrent =
                                      node.merchandise.id === v.id ||
                                      node.merchandise.title === v.title;
                                    return (
                                      <button
                                        key={v.id}
                                        type="button"
                                        disabled={!v.availableForSale}
                                        onClick={() =>
                                          cartCalls.updateCartLineVariant(node.id, v.id)
                                        }
                                        style={{
                                          padding: '2px 6px',
                                          fontSize: '10px',
                                          fontWeight: 700,
                                          borderRadius: '3px',
                                          border: 'none',
                                          background: isCurrent
                                            ? '#ffffff'
                                            : 'rgba(255,255,255,0.1)',
                                          color: isCurrent ? '#000000' : '#cccccc',
                                          cursor: v.availableForSale ? 'pointer' : 'not-allowed',
                                          opacity: v.availableForSale ? 1 : 0.35
                                        }}
                                      >
                                        {v.title}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>
                                    {node.merchandise.title}
                                  </span>
                                )}
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: 'rgba(255,255,255,0.65)',
                                    marginLeft: '4px'
                                  }}
                                >
                                  × {node.quantity}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700 }}>
                              ₱{formatPhp(lineTotal)}
                            </div>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  cartCalls.updateCartLine(node.id, node.quantity - 1)
                                }
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  background: 'transparent',
                                  color: '#fff',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  cartCalls.updateCartLine(node.id, node.quantity + 1)
                                }
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  background: 'transparent',
                                  color: '#fff',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals Breakdown */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px',
                      fontSize: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.14)',
                      paddingTop: '12px',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      <span>Subtotal</span>
                      <span>₱{formatPhp(totalAmount)}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      <span>Nationwide Courier Shipping</span>
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>FREE</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '18px',
                        fontWeight: 800,
                        marginTop: '4px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.12)'
                      }}
                    >
                      <span>TOTAL</span>
                      <span>₱{formatPhp(totalAmount)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '14px',
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
                    {submitting
                      ? 'SAVING ORDER...'
                      : `COMPLETE ORDER — ₱${formatPhp(totalAmount)}`}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
