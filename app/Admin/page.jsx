'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';

export default function AdminDashboardPage() {
  const { authCalls } = useStore();
  const user = authCalls?.user;

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch('/api/orders?role=admin', { cache: 'no-store' }),
        fetch('/api/admin/users', { cache: 'no-store' })
      ]);
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      if (Array.isArray(ordersData.orders)) setOrders(ordersData.orders);
      if (Array.isArray(usersData.users)) setUsers(usersData.users);
      if (ordersData.dbStatus) setDbStatus(ordersData.dbStatus);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error('Failed to delete order', err);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, role: nextRole })
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  if (!user || user.role !== 'admin') {
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
            maxWidth: '460px',
            width: '100%',
            background: 'rgba(10,10,10,0.9)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '36px 28px',
            textAlign: 'center',
            color: '#ffffff'
          }}
        >
          <h3 style={{ margin: '0 0 10px', fontSize: '20px', letterSpacing: '1px' }}>
            ADMIN ACCESS REQUIRED
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '22px' }}>
            Please sign in with an Administrator account to manage LARO SPORTS™ orders and users.
          </p>
          <Link
            href="/Login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#ffffff',
              color: '#000000',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textDecoration: 'none'
            }}
          >
            GO TO LOGIN
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 150px)',
        padding: '20px 36px 90px',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1220px',
        margin: '0 auto',
        color: '#ffffff'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '22px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)'
              }}
            >
              LARO SPORTS™ MANAGEMENT
            </span>
            {dbStatus && (
              <span
                style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: dbStatus.connected
                    ? 'rgba(74, 222, 128, 0.16)'
                    : 'rgba(250, 204, 21, 0.16)',
                  border: dbStatus.connected
                    ? '1px solid rgba(74, 222, 128, 0.45)'
                    : '1px solid rgba(250, 204, 21, 0.45)',
                  color: dbStatus.connected ? '#4ade80' : '#facc15',
                  fontWeight: 700
                }}
              >
                {dbStatus.engine}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '1.5px', margin: '4px 0 0' }}>
            ADMIN DASHBOARD
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={loadAdminData}
            style={{
              padding: '9px 15px',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: 'pointer'
            }}
          >
            REFRESH DATA
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '22px'
        }}
      >
        {[
          { label: 'TOTAL REVENUE', value: `₱${totalRevenue.toLocaleString()}` },
          { label: 'TOTAL ORDERS', value: orders.length },
          { label: 'PENDING ORDERS', value: pendingCount },
          { label: 'REGISTERED USERS', value: users.length }
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'rgba(10, 10, 10, 0.88)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '18px 20px'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '1.5px',
                color: 'rgba(255,255,255,0.55)',
                marginBottom: '6px'
              }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.25)',
            background: activeTab === 'orders' ? '#ffffff' : 'rgba(10,10,10,0.8)',
            color: activeTab === 'orders' ? '#000000' : '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          ORDERS ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.25)',
            background: activeTab === 'users' ? '#ffffff' : 'rgba(10,10,10,0.8)',
            color: activeTab === 'users' ? '#000000' : '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          USERS & ROLES ({users.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          Loading database records...
        </div>
      ) : activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div
            style={{
              background: 'rgba(10,10,10,0.88)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '36px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.65)'
            }}
          >
            No customer orders recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'rgba(10, 10, 10, 0.88)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '9px',
                  padding: '18px 22px'
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
                    marginBottom: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '15px', letterSpacing: '1px' }}>
                      {order.order_number}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginLeft: '12px' }}>
                      {order.customer_name} ({order.customer_email} • {order.customer_phone})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '16px', marginRight: '6px' }}>
                      ₱{Number(order.total_amount).toLocaleString()}
                    </strong>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        background: '#141414',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(239, 68, 68, 0.16)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
                  <strong>Address:</strong> {order.shipping_address}, {order.city}{' '}
                  {order.province ? `${order.province}, ` : ''}
                  {order.postal_code} | <strong>Payment:</strong> {order.payment_method}
                  {order.notes ? ` | Notes: ${order.notes}` : ''}
                </div>

                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {order.items.map((item) => (
                      <span
                        key={item.id}
                        style={{
                          padding: '5px 10px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '5px',
                          fontSize: '11px'
                        }}
                      >
                        {item.product_title} ({item.variant_title}) × {item.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div
          style={{
            background: 'rgba(10, 10, 10, 0.88)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  textAlign: 'left',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.65)'
                }}
              >
                <th style={{ padding: '14px 18px' }}>ID</th>
                <th style={{ padding: '14px 18px' }}>Full Name</th>
                <th style={{ padding: '14px 18px' }}>Email</th>
                <th style={{ padding: '14px 18px' }}>Role</th>
                <th style={{ padding: '14px 18px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '13px 18px' }}>#{u.id}</td>
                  <td style={{ padding: '13px 18px', fontWeight: 700 }}>{u.name}</td>
                  <td style={{ padding: '13px 18px', color: 'rgba(255,255,255,0.75)' }}>{u.email}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background:
                          u.role === 'admin' ? '#ffffff' : 'rgba(255,255,255,0.08)',
                        color: u.role === 'admin' ? '#000000' : '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <button
                      type="button"
                      onClick={() => handleRoleToggle(u)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Switch to {u.role === 'admin' ? 'Customer' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

