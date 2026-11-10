'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';

export default function OrdersPage() {
  const { authCalls } = useStore();
  const user = authCalls?.user;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (user?.id) params.set('userId', user.id);
        if (user?.email) params.set('email', user.email);
        if (user?.role === 'admin') params.set('role', 'admin');

        const res = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const statusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#4ade80';
      case 'Shipped':
        return '#60a5fa';
      case 'Processing':
        return '#facc15';
      case 'Cancelled':
        return '#f87171';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 150px)',
        padding: '24px 36px 90px',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1040px',
        margin: '0 auto',
        color: '#ffffff'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px'
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
            CUSTOMER PORTAL
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '1.5px', margin: '4px 0 0' }}>
            MY ORDERS
          </h2>
        </div>

        <Link
          href="/Collections"
          style={{
            padding: '9px 16px',
            background: '#ffffff',
            color: '#000000',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            textDecoration: 'none'
          }}
        >
          SHOP DROPS
        </Link>
      </div>

      {!user ? (
        <div
          style={{
            background: 'rgba(10,10,10,0.88)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '10px',
            padding: '42px 24px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 10px' }}>Sign in to view your orders</h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginBottom: '20px' }}>
            Track your LARO SPORTS™ orders and delivery status in real time.
          </p>
          <Link
            href="/Login"
            style={{
              display: 'inline-block',
              padding: '12px 26px',
              background: '#ffffff',
              color: '#000000',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textDecoration: 'none'
            }}
          >
            LOGIN TO ACCOUNT
          </Link>
        </div>
      ) : loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            background: 'rgba(10,10,10,0.88)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '10px',
            padding: '42px 24px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 8px' }}>No orders placed yet</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '20px' }}>
            Explore our PAIN STAIN 2025 collection and place your first order.
          </p>
          <Link
            href="/Collections"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#ffffff',
              color: '#000000',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textDecoration: 'none'
            }}
          >
            BROWSE COLLECTIONS
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'rgba(10, 10, 10, 0.88)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '10px',
                padding: '20px 24px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ORDER REF: </span>
                  <strong style={{ fontSize: '14px', letterSpacing: '1px' }}>{order.order_number}</strong>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '12px' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: `1px solid ${statusColor(order.status)}`,
                      color: statusColor(order.status),
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {order.status}
                  </span>
                  <strong style={{ fontSize: '16px' }}>
                    ₱{Number(order.total_amount).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                <strong>Shipping To:</strong> {order.shipping_address}, {order.city}{' '}
                {order.province ? `${order.province}, ` : ''}
                {order.postal_code} • <strong>Payment:</strong> {order.payment_method}
              </div>

              {Array.isArray(order.items) && order.items.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px'
                      }}
                    >
                      <strong>{item.product_title}</strong> ({item.variant_title}) × {item.quantity} — ₱
                      {Number(item.price * item.quantity).toLocaleString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

