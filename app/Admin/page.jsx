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

export default function AdminDashboardPage() {
  const { authCalls, products } = useStore();
  const user = authCalls?.user;

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Quick Add User state inside Admin
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');
  const [userActionMsg, setUserActionMsg] = useState('');

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

  const handleCreateDemoOrder = async () => {
    try {
      const sampleProduct = products?.[0] || {
        id: 'sample-1',
        title: 'White Tee',
        price: 750,
        images: ['/brand/whiteee_nobg.png']
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: 'Marco Santos',
          customerEmail: 'customer@larosports.com',
          customerPhone: '0917 882 9104',
          shippingAddress: '142 Katipunan Ave., Loyola Heights',
          city: 'Quezon City',
          province: 'Metro Manila',
          postalCode: '1108',
          paymentMethod: 'COD',
          notes: 'Gate 2 delivery',
          totalAmount: sampleProduct.price || 750,
          items: [
            {
              productId: sampleProduct.id,
              productTitle: sampleProduct.title,
              variantTitle: 'L',
              quantity: 1,
              price: sampleProduct.price || 750,
              imageUrl: sampleProduct.images?.[0] || ''
            }
          ]
        })
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Demo order error:', err);
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

  const handleCreateUserFromAdmin = async (e) => {
    e.preventDefault();
    setUserActionMsg('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setUserActionMsg(data.error || 'Failed to create user');
        return;
      }
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setUserActionMsg(`Created ${data.user.role.toUpperCase()} account: ${data.user.email}`);
      await loadAdminData();
    } catch {
      setUserActionMsg('Error creating user');
    }
  };

  const statusBadgeStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return {
          bg: 'rgba(74, 222, 128, 0.14)',
          border: 'rgba(74, 222, 128, 0.45)',
          color: '#4ade80'
        };
      case 'Shipped':
        return {
          bg: 'rgba(96, 165, 250, 0.14)',
          border: 'rgba(96, 165, 250, 0.45)',
          color: '#60a5fa'
        };
      case 'Processing':
        return {
          bg: 'rgba(250, 204, 21, 0.14)',
          border: 'rgba(250, 204, 21, 0.45)',
          color: '#facc15'
        };
      case 'Cancelled':
        return {
          bg: 'rgba(248, 113, 113, 0.14)',
          border: 'rgba(248, 113, 113, 0.45)',
          color: '#f87171'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.3)',
          color: '#ffffff'
        };
    }
  };

  // Calculations
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const pendingCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = orderSearch.trim().toLowerCase();
    if (!q) return matchesStatus;
    return (
      matchesStatus &&
      (String(o.order_number || '').toLowerCase().includes(q) ||
        String(o.customer_name || '').toLowerCase().includes(q) ||
        String(o.customer_email || '').toLowerCase().includes(q) ||
        String(o.city || '').toLowerCase().includes(q))
    );
  });

  const filteredProducts = (products || []).filter((p) => {
    if (productCategoryFilter === 'All') return true;
    return p.category === productCategoryFilter;
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q) ||
      String(u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff',
        padding: '76px 36px 96px',
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
          style={{ opacity: 0.42 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%)'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1260px',
          margin: '0 auto'
        }}
      >
        {!user || user.role !== 'admin' ? (
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
                maxWidth: '460px',
                width: '100%',
                background: 'rgba(10,10,12,0.86)',
                backdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '36px 28px',
                textAlign: 'center',
                color: '#ffffff',
                boxShadow: '0 24px 60px rgba(0,0,0,0.85)'
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '2.5px',
                  color: 'rgba(255,255,255,0.5)',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                RESTRICTED AREA
              </span>
              <h3 style={{ margin: '0 0 10px', fontSize: '22px', letterSpacing: '1.5px' }}>
                ADMIN ACCESS REQUIRED
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '22px' }}>
                Sign in with an Administrator account (`admin@larosports.com` / `admin123`) to access the LARO SPORTS™ Command Center.
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
                SIGN IN AS ADMIN
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Executive Command Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                background: 'rgba(10, 10, 12, 0.82)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '12px',
                padding: '18px 24px',
                marginBottom: '18px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      letterSpacing: '2.2px',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.55)',
                      fontWeight: 700
                    }}
                  >
                    LARO SPORTS™ COMMAND CENTER
                  </span>
                  {dbStatus && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '3px 9px',
                        borderRadius: '99px',
                        background: dbStatus.connected
                          ? 'rgba(74, 222, 128, 0.15)'
                          : 'rgba(250, 204, 21, 0.15)',
                        border: dbStatus.connected
                          ? '1px solid rgba(74, 222, 128, 0.45)'
                          : '1px solid rgba(250, 204, 21, 0.45)',
                        color: dbStatus.connected ? '#4ade80' : '#facc15',
                        fontWeight: 700
                      }}
                    >
                      ● {dbStatus.connected ? 'XAMPP MySQL Connected (laro_sports_db)' : 'Local DB Active (Port 3306 Ready)'}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '1.5px', margin: 0 }}>
                  ADMINISTRATION & OPERATIONS
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCreateDemoOrder}
                  style={{
                    padding: '9px 14px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.24)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  + SIMULATE ORDER
                </button>
                <button
                  type="button"
                  onClick={loadAdminData}
                  style={{
                    padding: '9px 16px',
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  ↻ SYNC DATABASE
                </button>
              </div>
            </div>

            {/* 4 Executive KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
                marginBottom: '18px'
              }}
            >
              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '10px',
                  padding: '18px 20px'
                }}
              >
                <div style={{ fontSize: '10px', letterSpacing: '1.6px', color: 'rgba(255,255,255,0.5)' }}>
                  GROSS REVENUE
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 4px' }}>
                  ₱{formatPhp(totalRevenue)}
                </div>
                <div style={{ fontSize: '11px', color: '#4ade80' }}>
                  Avg. Order: ₱{formatPhp(avgOrderValue)}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '10px',
                  padding: '18px 20px'
                }}
              >
                <div style={{ fontSize: '10px', letterSpacing: '1.6px', color: 'rgba(255,255,255,0.5)' }}>
                  TOTAL ORDERS
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 4px' }}>
                  {orders.length}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  {deliveredCount} Delivered • {orders.length - deliveredCount} Open
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '10px',
                  padding: '18px 20px'
                }}
              >
                <div style={{ fontSize: '10px', letterSpacing: '1.6px', color: 'rgba(255,255,255,0.5)' }}>
                  PENDING FULFILLMENT
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 4px', color: pendingCount > 0 ? '#facc15' : '#ffffff' }}>
                  {pendingCount}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  Pending & Processing Queue
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '10px',
                  padding: '18px 20px'
                }}
              >
                <div style={{ fontSize: '10px', letterSpacing: '1.6px', color: 'rgba(255,255,255,0.5)' }}>
                  ACCOUNTS & ROLES
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 4px' }}>
                  {users.length}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  {adminCount} Admin{adminCount === 1 ? '' : 's'} • {customerCount} Customer{customerCount === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '16px'
              }}
            >
              {[
                { id: 'orders', label: `ORDERS MANAGEMENT (${orders.length})` },
                { id: 'products', label: `PRODUCT CATALOG (${products?.length || 0})` },
                { id: 'users', label: `USERS & ROLES (${users.length})` },
                { id: 'database', label: 'XAMPP MYSQL STATUS' }
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '7px',
                      border: active
                        ? '1px solid #ffffff'
                        : '1px solid rgba(255,255,255,0.2)',
                      background: active ? '#ffffff' : 'rgba(10,10,12,0.8)',
                      color: active ? '#000000' : '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.84)',
                  backdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '12px',
                  padding: '20px 24px'
                }}
              >
                {/* Filter & Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                      (st) => {
                        const active = statusFilter === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStatusFilter(st)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '5px',
                              border: active
                                ? '1px solid #ffffff'
                                : '1px solid rgba(255,255,255,0.16)',
                              background: active ? '#ffffff' : 'rgba(255,255,255,0.05)',
                              color: active ? '#000000' : 'rgba(255,255,255,0.8)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {st}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search Order #, Customer, Email, or City..."
                    style={{
                      width: '280px',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                </div>

                {loading ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                    Loading orders...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div
                    style={{
                      padding: '44px 20px',
                      textAlign: 'center',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                      No matching orders found
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
                      Click &ldquo;+ Simulate Order&rdquo; above or place an order from the Checkout page.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateDemoOrder}
                      style={{
                        padding: '9px 18px',
                        background: '#ffffff',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        cursor: 'pointer'
                      }}
                    >
                      + GENERATE SAMPLE ORDER
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredOrders.map((order) => {
                      const badge = statusBadgeStyle(order.status);
                      return (
                        <div
                          key={order.id}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '8px',
                            padding: '16px 18px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              paddingBottom: '10px',
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                              marginBottom: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  background: 'rgba(255,255,255,0.1)',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  letterSpacing: '1px'
                                }}
                              >
                                {order.order_number}
                              </span>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700 }}>
                                  {order.customer_name}{' '}
                                  <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
                                    ({order.customer_email} • {order.customer_phone})
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                                  Placed {new Date(order.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  background: badge.bg,
                                  border: `1px solid ${badge.border}`,
                                  color: badge.color,
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase'
                                }}
                              >
                                {order.status}
                              </span>

                              <strong style={{ fontSize: '16px', margin: '0 6px' }}>
                                ₱{formatPhp(order.total_amount)}
                              </strong>

                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{
                                  padding: '6px 10px',
                                  background: '#111113',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255,255,255,0.28)',
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                                  (st) => (
                                    <option key={st} value={st}>
                                      Set: {st}
                                    </option>
                                  )
                                )}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id)}
                                style={{
                                  padding: '6px 10px',
                                  background: 'rgba(239, 68, 68, 0.14)',
                                  color: '#fca5a5',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
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

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              justifyContent: 'space-between',
                              gap: '10px',
                              fontSize: '12px',
                              color: 'rgba(255,255,255,0.72)',
                              marginBottom: '10px'
                            }}
                          >
                            <div>
                              <strong>Destination:</strong> {order.shipping_address}, {order.city}
                              {order.province ? `, ${order.province}` : ''} {order.postal_code}
                              {order.notes ? ` • Note: "${order.notes}"` : ''}
                            </div>
                            <div>
                              <strong>Payment:</strong> {order.payment_method}
                            </div>
                          </div>

                          {Array.isArray(order.items) && order.items.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '5px 10px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '5px',
                                    fontSize: '11px'
                                  }}
                                >
                                  {item.image_url && (
                                    <img
                                      src={item.image_url}
                                      alt={item.product_title}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'contain'
                                      }}
                                    />
                                  )}
                                  <span>
                                    <strong>{item.product_title}</strong> ({item.variant_title}) ×{' '}
                                    {item.quantity} — ₱{formatPhp(item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRODUCT CATALOG & INVENTORY */}
            {activeTab === 'products' && (
              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.84)',
                  backdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '12px',
                  padding: '20px 24px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['All', 'T-Shirts', 'Jerseys', 'Bottoms', 'Headwear', 'Accessories'].map(
                      (cat) => {
                        const active = productCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setProductCategoryFilter(cat)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '5px',
                              border: active
                                ? '1px solid #ffffff'
                                : '1px solid rgba(255,255,255,0.16)',
                              background: active ? '#ffffff' : 'rgba(255,255,255,0.05)',
                              color: active ? '#000000' : 'rgba(255,255,255,0.8)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {cat}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Showing {filteredProducts.length} products
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '14px'
                  }}
                >
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <img
                        src={prod.images?.[0] || ''}
                        alt={prod.title}
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'contain',
                          background: 'rgba(0,0,0,0.45)',
                          borderRadius: '6px',
                          padding: '4px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                          {prod.category}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{prod.title}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>
                          ₱{formatPhp(prod.price)}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '6px'
                          }}
                        >
                          <span style={{ fontSize: '10px', color: '#4ade80' }}>
                            ● {prod.variants?.length || 1} Variants Active
                          </span>
                          <Link
                            href={`/Collections/${prod.handle}`}
                            style={{
                              fontSize: '10px',
                              color: '#ffffff',
                              textDecoration: 'underline'
                            }}
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: USERS & ROLES */}
            {activeTab === 'users' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 340px',
                  gap: '18px',
                  alignItems: 'start'
                }}
              >
                {/* Users Table */}
                <div
                  style={{
                    background: 'rgba(10, 10, 12, 0.84)',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: '12px',
                    padding: '20px 24px'
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
                    <h4 style={{ margin: 0, fontSize: '13px', letterSpacing: '1.5px' }}>
                      REGISTERED ACCOUNTS ({filteredUsers.length})
                    </h4>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Filter by name, email, or role..."
                      style={{
                        width: '240px',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          textAlign: 'left',
                          fontSize: '10px',
                          letterSpacing: '1.2px',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.6)'
                        }}
                      >
                        <th style={{ padding: '12px 14px' }}>ID</th>
                        <th style={{ padding: '12px 14px' }}>Full Name</th>
                        <th style={{ padding: '12px 14px' }}>Email</th>
                        <th style={{ padding: '12px 14px' }}>Role</th>
                        <th style={{ padding: '12px 14px' }}>Role Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '12px 14px' }}>#{u.id}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.75)' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
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
                              {u.role === 'admin' ? '★ ADMIN' : 'CUSTOMER'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(u)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.06)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.22)',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Set as {u.role === 'admin' ? 'Customer' : 'Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quick Create User / Admin Card */}
                <div
                  style={{
                    background: 'rgba(10, 10, 12, 0.84)',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: '12px',
                    padding: '20px 22px'
                  }}
                >
                  <h4 style={{ margin: '0 0 14px', fontSize: '13px', letterSpacing: '1.5px' }}>
                    CREATE USER / ADMIN
                  </h4>

                  {userActionMsg && (
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        marginBottom: '12px'
                      }}
                    >
                      {userActionMsg}
                    </div>
                  )}

                  <form
                    onSubmit={handleCreateUserFromAdmin}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                  >
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Full Name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="Email Address"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Password (min. 6 chars)"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['customer', 'admin'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewUserRole(r)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '5px',
                            border:
                              newUserRole === r
                                ? '1px solid #ffffff'
                                : '1px solid rgba(255,255,255,0.2)',
                            background: newUserRole === r ? '#ffffff' : 'transparent',
                            color: newUserRole === r ? '#000000' : '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      style={{
                        marginTop: '4px',
                        padding: '11px',
                        background: '#ffffff',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                      }}
                    >
                      + ADD ACCOUNT
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: XAMPP MYSQL DATABASE STATUS */}
            {activeTab === 'database' && (
              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.84)',
                  backdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <h4 style={{ margin: '0 0 14px', fontSize: '14px', letterSpacing: '1.5px' }}>
                  XAMPP MYSQL CONFIGURATION & DIAGNOSTICS
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <div
                    style={{
                      padding: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>HOST & PORT</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>
                      {dbStatus?.host || '127.0.0.1'}:{dbStatus?.port || 3306}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      DATABASE SCHEMA
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>
                      {dbStatus?.database || 'laro_sports_db'}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      ACTIVE ENGINE
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        marginTop: '4px',
                        color: dbStatus?.connected ? '#4ade80' : '#facc15'
                      }}
                    >
                      {dbStatus?.engine || 'Checking...'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.75)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  <div>
                    <strong>1. XAMPP Control Panel:</strong> Start <strong>Apache</strong> and{' '}
                    <strong>MySQL</strong> (Port <code>3306</code>).
                  </div>
                  <div>
                    <strong>2. Auto-Migration:</strong> Once MySQL is running, click{' '}
                    <strong>↻ SYNC DATABASE</strong> above — the app automatically creates{' '}
                    <code>laro_sports_db</code> and the <code>users</code>, <code>orders</code>, and{' '}
                    <code>order_items</code> tables.
                  </div>
                  <div>
                    <strong>3. Manual SQL Import (Optional):</strong> Open{' '}
                    <code>http://localhost/phpmyadmin</code> and import <code>database.sql</code> from
                    the project root.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
