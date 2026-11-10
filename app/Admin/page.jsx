'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { VideoBackground } from '../../components/VideoBackground';
import { Loader } from '../../components/Loader';
import {
  exportSalesReportXLSX,
  exportSalesReportPDF,
  exportSalesReportDOCX
} from '../../lib/salesExporter';

const formatPhp = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export default function AdminDashboardPage() {
  const { authCalls, products, setProducts, refreshProducts } = useStore();
  const user = authCalls?.user;

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order Filters & Search with Date Filter Icon Popover
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showDateFilterMenu, setShowDateFilterMenu] = useState(false);
  const [dateFilterType, setDateFilterType] = useState('all'); // 'all' | 'days' | 'weeks' | 'month' | 'years' | 'specific'
  const [specificDate, setSpecificDate] = useState('');

  // Sales Report Export States
  const [exportingType, setExportingType] = useState(null); // 'xlsx' | 'pdf' | 'docx'
  const [exportScope, setExportScope] = useState('filtered'); // 'filtered' | 'all'

  // Store Inventory & Stock Management States
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [productSearch, setProductSearch] = useState('');
  const [editingPriceMap, setEditingPriceMap] = useState({});
  const [savingProductId, setSavingProductId] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('T-Shirts');
  const [newProdPrice, setNewProdPrice] = useState('400');
  const [newProdImage, setNewProdImage] = useState('/brand/shirt_nobg.png');
  const [newProdDesc, setNewProdDesc] = useState(
    'Product Details: Fabric: Premium Cotton 230-240 GSM. Oversized Boxy Fit. Pain Stain Collection 2025.'
  );
  const [newProdStock, setNewProdStock] = useState({ S: 15, M: 15, L: 15, XL: 15 });

  // User Filters & Create User State
  const [userSearch, setUserSearch] = useState('');
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
        fetch('/api/admin/users', { cache: 'no-store' }),
        refreshProducts()
      ]);
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      if (Array.isArray(ordersData.orders)) setOrders(ordersData.orders);
      if (Array.isArray(usersData.users)) setUsers(usersData.users);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Order Status Update
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

  // Stock & Inventory Management Handlers
  const handleUpdateVariantStock = async (prod, variantId, newStockValue) => {
    const clampedStock = Math.max(0, Number(newStockValue) || 0);
    setSavingProductId(prod.id);
    try {
      const updatedVariants = (prod.variants || []).map((v) => {
        if (v.id === variantId || v.title === variantId) {
          return {
            ...v,
            stock: clampedStock,
            availableForSale: clampedStock > 0
          };
        }
        return v;
      });

      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.id,
          variants: updatedVariants
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Stock update error:', err);
    } finally {
      setSavingProductId(null);
    }
  };

  const handleBulkRestockProduct = async (prod, deltaOrSet, isSetZero = false) => {
    setSavingProductId(prod.id);
    try {
      const updatedVariants = (prod.variants || []).map((v) => {
        const currentStock = typeof v.stock === 'number' ? v.stock : v.availableForSale ? 15 : 0;
        const nextStock = isSetZero ? 0 : Math.max(0, currentStock + deltaOrSet);
        return {
          ...v,
          stock: nextStock,
          availableForSale: nextStock > 0
        };
      });

      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.id,
          variants: updatedVariants
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Bulk restock error:', err);
    } finally {
      setSavingProductId(null);
    }
  };

  const handleSaveProductPrice = async (prod) => {
    const newPrice = editingPriceMap[prod.id];
    if (newPrice === undefined || isNaN(Number(newPrice))) return;
    setSavingProductId(prod.id);
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.id,
          price: Number(newPrice)
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Price update error:', err);
    } finally {
      setSavingProductId(null);
    }
  };

  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProdTitle,
          category: newProdCategory,
          price: Number(newProdPrice) || 400,
          imageUrl: newProdImage,
          description: newProdDesc,
          stockPerSize: newProdStock
        })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
        setShowAddProductModal(false);
        setNewProdTitle('');
      }
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleDeleteCustomProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Sales Report Export Handler (XLSX, PDF, DOCX)
  const handleExport = async (format) => {
    setExportingType(format);
    try {
      const ordersToExport = exportScope === 'filtered' ? filteredOrders : orders;
      if (!ordersToExport || ordersToExport.length === 0) {
        alert('No orders available to export for the selected filter.');
        return;
      }
      const metrics = {
        totalSales: totalRevenue,
        aov: avgOrderValue,
        completedCount: deliveredCount
      };
      if (format === 'xlsx') {
        exportSalesReportXLSX(ordersToExport, metrics);
      } else if (format === 'pdf') {
        exportSalesReportPDF(ordersToExport, metrics);
      } else if (format === 'docx') {
        await exportSalesReportDOCX(ordersToExport, metrics);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setExportingType(null);
    }
  };

  const handleBulkRestockAll = async (delta) => {
    if (!confirm(`Add +${delta} stock across all sizes for ALL ${products.length} products?`)) return;
    try {
      for (const prod of products) {
        await handleBulkRestockProduct(prod, delta, false);
      }
    } catch (err) {
      console.error('Bulk restock all error:', err);
    }
  };

  const handleResetAllStock = async (stockPerSize = 15) => {
    if (!confirm(`Reset all sizes to ${stockPerSize} units for all products in catalog?`)) return;
    try {
      for (const prod of products) {
        setSavingProductId(prod.id);
        const updatedVariants = (prod.variants || []).map((v) => ({
          ...v,
          stock: stockPerSize,
          availableForSale: stockPerSize > 0
        }));
        await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: prod.id,
            variants: updatedVariants
          })
        });
      }
      await refreshProducts();
    } catch (err) {
      console.error('Reset all stock error:', err);
    } finally {
      setSavingProductId(null);
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

  // Date filter helper for Orders (Days, Weeks, Month, Years, Specific Date)
  const matchesDateFilter = (createdAt) => {
    if (dateFilterType === 'all') return true;
    const orderDate = new Date(createdAt);
    if (isNaN(orderDate.getTime())) return true;
    const now = new Date();

    if (dateFilterType === 'days') {
      // Today (same calendar day or within 24h)
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate()
      );
    }
    if (dateFilterType === 'weeks') {
      // Last 7 days
      const diffMs = now.getTime() - orderDate.getTime();
      return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilterType === 'month') {
      // Current month & year
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      );
    }
    if (dateFilterType === 'years') {
      // Current year
      return orderDate.getFullYear() === now.getFullYear();
    }
    if (dateFilterType === 'specific') {
      if (!specificDate) return true;
      const yyyy = orderDate.getFullYear();
      const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
      const dd = String(orderDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}` === specificDate;
    }
    return true;
  };

  const dateFilterLabel = () => {
    switch (dateFilterType) {
      case 'days':
        return 'Days (Today)';
      case 'weeks':
        return 'Weeks (7D)';
      case 'month':
        return 'Month';
      case 'years':
        return 'Year';
      case 'specific':
        return specificDate ? specificDate : 'Specific Date';
      default:
        return 'All Dates';
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    if (!matchesStatus) return false;
    if (!matchesDateFilter(o.created_at)) return false;

    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(o.order_number || '').toLowerCase().includes(q) ||
      String(o.customer_name || '').toLowerCase().includes(q) ||
      String(o.customer_email || '').toLowerCase().includes(q) ||
      String(o.city || '').toLowerCase().includes(q)
    );
  });

  // Filtered Products & Stock Calculations
  const getProductTotalStock = (prod) => {
    return (prod.variants || []).reduce(
      (sum, v) => sum + (typeof v.stock === 'number' ? v.stock : v.availableForSale ? 15 : 0),
      0
    );
  };

  const totalCatalogStock = (products || []).reduce(
    (sum, p) => sum + getProductTotalStock(p),
    0
  );
  const totalCatalogValue = (products || []).reduce(
    (sum, p) => sum + (Number(p.price) || 0) * getProductTotalStock(p),
    0
  );
  const outOfStockProductsCount = (products || []).filter(
    (p) => getProductTotalStock(p) === 0
  ).length;
  const lowStockProductsCount = (products || []).filter((p) => {
    const st = getProductTotalStock(p);
    return st > 0 && st <= 10;
  }).length;
  const inStockProductsCount = (products || []).filter(
    (p) => getProductTotalStock(p) > 10
  ).length;

  const filteredProducts = (products || []).filter((p) => {
    if (productCategoryFilter !== 'All' && p.category !== productCategoryFilter) return false;
    const totalStock = getProductTotalStock(p);
    if (stockFilter === 'in_stock' && totalStock <= 0) return false;
    if (stockFilter === 'low_stock' && (totalStock === 0 || totalStock > 10)) return false;
    if (stockFilter === 'out_of_stock' && totalStock > 0) return false;

    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(p.title || '').toLowerCase().includes(q) ||
      String(p.category || '').toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const validOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const pendingCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing'
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q) ||
      String(u.role || '').toLowerCase().includes(q) ||
      String(u.address || '').toLowerCase().includes(q)
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
          maxWidth: '1320px',
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
                Sign in with an Administrator account to manage LARO SPORTS™ store inventory, stock, and customer orders.
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
                background: 'rgba(10, 10, 12, 0.84)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '12px',
                padding: '18px 24px',
                marginBottom: '18px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '2.2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  LARO SPORTS™ STORE MANAGEMENT
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '1.5px', margin: 0 }}>
                  STORE ADMIN PANEL
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    setShowAddProductModal(true);
                  }}
                  style={{
                    padding: '9px 15px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  + ADD NEW PRODUCT
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
                  REFRESH STORE
                </button>
              </div>
            </div>

            {/* 4 Executive Store KPI Cards */}
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
                  {deliveredCount} Delivered • {pendingCount} Pending
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
                  TOTAL SHOP STOCK
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 4px' }}>
                  {totalCatalogStock.toLocaleString()} units
                </div>
                <div style={{ fontSize: '11px', color: outOfStockProductsCount > 0 ? '#facc15' : '#4ade80' }}>
                  {products?.length || 0} Products ({outOfStockProductsCount} Out of Stock)
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
                  REGISTERED ACCOUNTS
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 4px' }}>
                  {users.length}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  Customer & Admin Directory
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
                { id: 'products', label: `SHOP INVENTORY & STOCK (${products?.length || 0})` },
                { id: 'users', label: `USERS & ROLES (${users.length})` }
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 20px',
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
                {/* EXPORT SALES REPORT TOOLBAR */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px' }}>📊</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '1.2px',
                          textTransform: 'uppercase',
                          color: '#ffffff'
                        }}
                      >
                        EXPORT SALES REPORT:
                      </span>
                    </div>

                    <select
                      value={exportScope}
                      onChange={(e) => setExportScope(e.target.value)}
                      style={{
                        padding: '6px 32px 6px 10px',
                        backgroundColor: '#121215',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="filtered">Filtered Results ({filteredOrders.length} Orders)</option>
                      <option value="all">All Lifetime Orders ({orders.length} Orders)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={
                        !!exportingType ||
                        (exportScope === 'filtered' ? filteredOrders.length === 0 : orders.length === 0)
                      }
                      onClick={() => handleExport('xlsx')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        background: 'rgba(34, 197, 94, 0.14)',
                        border: '1px solid rgba(34, 197, 94, 0.45)',
                        borderRadius: '6px',
                        color: '#86efac',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>📗</span>
                      <span>{exportingType === 'xlsx' ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={
                        !!exportingType ||
                        (exportScope === 'filtered' ? filteredOrders.length === 0 : orders.length === 0)
                      }
                      onClick={() => handleExport('pdf')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        background: 'rgba(239, 68, 68, 0.14)',
                        border: '1px solid rgba(239, 68, 68, 0.45)',
                        borderRadius: '6px',
                        color: '#fca5a5',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>📕</span>
                      <span>{exportingType === 'pdf' ? 'Generating...' : 'Export PDF (.pdf)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={
                        !!exportingType ||
                        (exportScope === 'filtered' ? filteredOrders.length === 0 : orders.length === 0)
                      }
                      onClick={() => handleExport('docx')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        background: 'rgba(59, 130, 246, 0.14)',
                        border: '1px solid rgba(59, 130, 246, 0.45)',
                        borderRadius: '6px',
                        color: '#93c5fd',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>📘</span>
                      <span>{exportingType === 'docx' ? 'Creating...' : 'Export Word (.docx)'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Pills & Search Bar with Built-in Date Filter Icon */}
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

                  {/* Search Input with Filter Icon Inside */}
                  <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search Order #, Customer, Email, or City..."
                      style={{
                        width: '100%',
                        padding: '9px 115px 9px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '7px',
                        color: '#ffffff',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />

                    {/* Filter Icon Button Inside the Right Side of the Search Bar */}
                    <button
                      type="button"
                      onClick={() => setShowDateFilterMenu((prev) => !prev)}
                      title="Filter by Days, Weeks, Month, Years, or Specific Date"
                      style={{
                        position: 'absolute',
                        right: '5px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 9px',
                        borderRadius: '5px',
                        border:
                          dateFilterType !== 'all'
                            ? '1px solid #ffffff'
                            : '1px solid rgba(255,255,255,0.18)',
                        background:
                          dateFilterType !== 'all' ? '#ffffff' : 'rgba(255,255,255,0.1)',
                        color: dateFilterType !== 'all' ? '#000000' : '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                      <span>{dateFilterLabel()}</span>
                    </button>

                    {/* Date Filter Popover Dropdown */}
                    {showDateFilterMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 'calc(100% + 8px)',
                          width: '270px',
                          background: 'rgba(14, 14, 18, 0.98)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.24)',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 18px 40px rgba(0,0,0,0.9)',
                          zIndex: 100
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '1.4px',
                            color: 'rgba(255,255,255,0.55)',
                            textTransform: 'uppercase',
                            marginBottom: '8px'
                          }}
                        >
                          FILTER BY TIMEFRAME
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {[
                            { id: 'all', label: 'All Time' },
                            { id: 'days', label: 'Days (Today)' },
                            { id: 'weeks', label: 'Weeks (Last 7 Days)' },
                            { id: 'month', label: 'Month (This Month)' },
                            { id: 'years', label: 'Years (This Year)' },
                            { id: 'specific', label: 'Specific Date' }
                          ].map((opt) => {
                            const active = dateFilterType === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setDateFilterType(opt.id);
                                  if (opt.id !== 'specific') {
                                    setShowDateFilterMenu(false);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '7px 10px',
                                  borderRadius: '5px',
                                  border: 'none',
                                  background: active ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                  color: active ? '#000000' : '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: active ? 800 : 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>

                        {dateFilterType === 'specific' && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                            <label
                              style={{
                                display: 'block',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.7)',
                                marginBottom: '5px'
                              }}
                            >
                              SELECT DATE:
                            </label>
                            <input
                              type="date"
                              value={specificDate}
                              onChange={(e) => {
                                setSpecificDate(e.target.value);
                                setShowDateFilterMenu(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '5px',
                                color: '#ffffff',
                                fontSize: '12px',
                                colorScheme: 'dark',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                      Orders placed via Checkout will appear here automatically.
                    </p>
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
                                  padding: '6px 30px 6px 10px',
                                  backgroundColor: '#111113',
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

            {/* TAB 2: SHOP INVENTORY & STOCK MANAGEMENT */}
            {activeTab === 'products' && (
              <div
                style={{
                  background: 'rgba(10, 10, 12, 0.84)',
                  backdropFilter: 'blur(22px)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: '12px',
                  padding: '22px 26px'
                }}
              >
                {/* Inventory Top Overview Banner */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    paddingBottom: '16px',
                    marginBottom: '18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '17px',
                          fontWeight: 800,
                          letterSpacing: '1.2px',
                          textTransform: 'uppercase',
                          color: '#ffffff'
                        }}
                      >
                        STORE INVENTORY & WAREHOUSE STOCK
                      </h3>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(74, 222, 128, 0.16)',
                          color: '#86efac',
                          border: '1px solid rgba(74, 222, 128, 0.35)'
                        }}
                      >
                        ● LIVE DB SYNC
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: 'rgba(255,255,255,0.55)' }}>
                      Manage sizes, individual stock levels, store pricing, and catalog items.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal((prev) => !prev)}
                      style={{
                        padding: '8px 16px',
                        background: '#ffffff',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>+</span>
                      <span>ADD NEW PRODUCT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkRestockAll(10)}
                      title="Add +10 units to each size across all catalog items"
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(74, 222, 128, 0.14)',
                        border: '1px solid rgba(74, 222, 128, 0.4)',
                        color: '#86efac',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      +10 To All Items
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetAllStock(15)}
                      title="Reset all sizes to 15 units across all products"
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.22)',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reset All (15/sz)
                    </button>
                  </div>
                </div>

                {/* 4 Inventory Metric Stat Tiles */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '18px'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                      TOTAL CATALOG SKUs
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px', color: '#ffffff' }}>
                      {products.length} Products
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      Pain Stain 2025 Series
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                      TOTAL UNITS IN STOCK
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px', color: '#4ade80' }}>
                      {totalCatalogStock} Units
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      Across all sizes & variants
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                      INVENTORY VALUATION
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px', color: '#ffffff' }}>
                      ₱{formatPhp(totalCatalogValue)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      Total retail asset worth
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                      STOCK LEVEL HEALTH
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, margin: '6px 0 3px', color: '#ffffff' }}>
                      <span style={{ color: '#4ade80' }}>{inStockProductsCount} In Stock</span> •{' '}
                      <span style={{ color: '#fbbf24' }}>{lowStockProductsCount} Low</span> •{' '}
                      <span style={{ color: '#f87171' }}>{outOfStockProductsCount} Sold Out</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      Threshold: Low stock ≤ 10 units
                    </div>
                  </div>
                </div>

                {/* Add New Product Drawer / Modal */}
                {showAddProductModal && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      borderRadius: '10px',
                      padding: '20px',
                      marginBottom: '20px'
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
                      <h4 style={{ margin: 0, fontSize: '14px', letterSpacing: '1.5px' }}>
                        ADD NEW PRODUCT TO SHOP
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        style={{
                          background: 'transparent',
                          color: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Close ✕
                      </button>
                    </div>

                    <form
                      onSubmit={handleAddNewProduct}
                      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 1.5fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
                            PRODUCT TITLE *
                          </label>
                          <input
                            type="text"
                            required
                            value={newProdTitle}
                            onChange={(e) => setNewProdTitle(e.target.value)}
                            placeholder="e.g. NIGHT OWL Heavy Tee"
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
                            CATEGORY
                          </label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '9px 34px 9px 12px',
                              backgroundColor: '#121215',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          >
                            {['T-Shirts', 'Jerseys', 'Bottoms', 'Headwear', 'Accessories'].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
                            PRICE (PHP) *
                          </label>
                          <input
                            type="number"
                            required
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
                            PRODUCT IMAGE URL
                          </label>
                          <input
                            type="text"
                            value={newProdImage}
                            onChange={(e) => setNewProdImage(e.target.value)}
                            placeholder="/brand/shirt_nobg.png"
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '12px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1.5fr', gap: '12px', alignItems: 'end' }}>
                        {['S', 'M', 'L', 'XL'].map((sz) => (
                          <div key={sz}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
                              SIZE {sz} STOCK
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newProdStock[sz]}
                              onChange={(e) =>
                                setNewProdStock((prev) => ({
                                  ...prev,
                                  [sz]: Math.max(0, Number(e.target.value) || 0)
                                }))
                              }
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '12px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        ))}

                        <button
                          type="submit"
                          style={{
                            padding: '10px 18px',
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
                          PUBLISH PRODUCT TO SHOP
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Inventory Category & Stock Filter Controls */}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      style={{
                        padding: '8px 34px 8px 12px',
                        backgroundColor: '#121215',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Stock Levels</option>
                      <option value="in_stock">In Stock Only</option>
                      <option value="low_stock">Low Stock (≤ 10)</option>
                      <option value="out_of_stock">Out of Stock (0)</option>
                    </select>

                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product name or category..."
                      style={{
                        width: '240px',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                </div>

                {/* Products Inventory Grid (Sleek, No-Overflow Design) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {filteredProducts.map((prod) => {
                    const totalStock = getProductTotalStock(prod);
                    const isSaving = savingProductId === prod.id;
                    const priceInputVal =
                      editingPriceMap[prod.id] !== undefined
                        ? editingPriceMap[prod.id]
                        : prod.price;

                    const isOutOfStock = totalStock === 0;
                    const isLowStock = totalStock > 0 && totalStock <= 10;

                    return (
                      <div
                        key={prod.id}
                        style={{
                          background: 'rgba(14, 14, 18, 0.88)',
                          border: isOutOfStock
                            ? '1px solid rgba(248, 113, 113, 0.35)'
                            : isLowStock
                            ? '1px solid rgba(251, 191, 36, 0.35)'
                            : '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '10px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Top Row: Thumbnail, Info & Inline Price Editor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={prod.images?.[0] || ''}
                            alt={prod.title}
                            style={{
                              width: '64px',
                              height: '64px',
                              objectFit: 'contain',
                              background: 'rgba(0,0,0,0.6)',
                              borderRadius: '8px',
                              padding: '4px',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '6px'
                              }}
                            >
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                                {prod.category}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  background: isOutOfStock
                                    ? 'rgba(248, 113, 113, 0.16)'
                                    : isLowStock
                                    ? 'rgba(251, 191, 36, 0.16)'
                                    : 'rgba(74, 222, 128, 0.16)',
                                  color: isOutOfStock ? '#f87171' : isLowStock ? '#fbbf24' : '#86efac',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {isOutOfStock ? '● SOLD OUT' : isLowStock ? `● ${totalStock} LOW STOCK` : `● ${totalStock} IN STOCK`}
                              </span>
                            </div>

                            <div
                              style={{
                                fontSize: '14.5px',
                                fontWeight: 800,
                                margin: '2px 0 4px',
                                color: '#ffffff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {prod.title}
                            </div>

                            {/* Inline Price Adjuster */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
                                  Price: ₱
                                </span>
                                <input
                                  type="number"
                                  value={priceInputVal}
                                  onChange={(e) =>
                                    setEditingPriceMap((prev) => ({
                                      ...prev,
                                      [prod.id]: e.target.value
                                    }))
                                  }
                                  style={{
                                    width: '68px',
                                    padding: '3px 6px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                />
                                {editingPriceMap[prod.id] !== undefined &&
                                  Number(editingPriceMap[prod.id]) !== Number(prod.price) && (
                                    <button
                                      type="button"
                                      onClick={() => handleSaveProductPrice(prod)}
                                      style={{
                                        padding: '3px 8px',
                                        background: '#ffffff',
                                        color: '#000000',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Save ₱
                                    </button>
                                  )}
                              </div>

                              <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)' }}>
                                Val: ₱{formatPhp((Number(prod.price) || 0) * totalStock)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Row: Per-Size Stock Controls (Contained, Never Overflowing) */}
                        <div
                          style={{
                            background: 'rgba(0,0,0,0.45)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            padding: '9px 10px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              letterSpacing: '1px',
                              color: 'rgba(255,255,255,0.5)',
                              marginBottom: '6px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span>STOCK BY SIZE / VARIANT</span>
                            {isSaving && <span style={{ color: '#86efac', fontWeight: 800 }}>Syncing...</span>}
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: `repeat(${Math.max(
                                1,
                                Math.min(4, prod.variants?.length || 1)
                              )}, minmax(0, 1fr))`,
                              gap: '6px',
                              boxSizing: 'border-box'
                            }}
                          >
                            {(prod.variants || []).map((v) => {
                              const st =
                                typeof v.stock === 'number'
                                  ? v.stock
                                  : v.availableForSale
                                  ? 15
                                  : 0;
                              return (
                                <div
                                  key={v.id}
                                  style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border:
                                      st > 0
                                        ? '1px solid rgba(255,255,255,0.12)'
                                        : '1px solid rgba(248,113,113,0.3)',
                                    borderRadius: '6px',
                                    padding: '5px 3px',
                                    textAlign: 'center',
                                    boxSizing: 'border-box',
                                    minWidth: 0
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      marginBottom: '3px',
                                      color: st > 0 ? '#ffffff' : '#f87171'
                                    }}
                                  >
                                    {v.title}
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '2px'
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateVariantStock(prod, v.id, st - 1)
                                      }
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '3px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'rgba(255,255,255,0.06)',
                                        color: '#ffffff',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        padding: 0
                                      }}
                                    >
                                      -
                                    </button>
                                    <span
                                      style={{
                                        minWidth: '22px',
                                        textAlign: 'center',
                                        color: st > 0 ? '#ffffff' : '#f87171',
                                        fontSize: '11.5px',
                                        fontWeight: 800
                                      }}
                                    >
                                      {st}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateVariantStock(prod, v.id, st + 1)
                                      }
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '3px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'rgba(255,255,255,0.06)',
                                        color: '#ffffff',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        padding: 0
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Quick Stock Actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleBulkRestockProduct(prod, 10, false)}
                              style={{
                                padding: '5px 10px',
                                background: 'rgba(74, 222, 128, 0.14)',
                                color: '#86efac',
                                border: '1px solid rgba(74, 222, 128, 0.35)',
                                borderRadius: '5px',
                                fontSize: '10px',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              +10 Stock All
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkRestockProduct(prod, 0, true)}
                              style={{
                                padding: '5px 10px',
                                background: 'rgba(248, 113, 113, 0.12)',
                                color: '#fca5a5',
                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                borderRadius: '5px',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Set Sold Out
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {prod.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomProduct(prod.id)}
                                style={{
                                  padding: '5px 8px',
                                  background: 'transparent',
                                  color: '#f87171',
                                  border: '1px solid rgba(248,113,113,0.3)',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            )}
                            <Link
                              href={`/Collections/${prod.handle}`}
                              style={{
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.8)',
                                textDecoration: 'underline'
                              }}
                            >
                              Store Page →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: USERS & ROLES */}
            {activeTab === 'users' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 330px',
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
                    padding: '20px 24px',
                    overflowX: 'auto'
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
                      placeholder="Filter by name, email, or address..."
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
                        <th style={{ padding: '12px 12px' }}>Full Name</th>
                        <th style={{ padding: '12px 12px' }}>Email</th>
                        <th style={{ padding: '12px 12px' }}>Birthdate / Age / Gender</th>
                        <th style={{ padding: '12px 12px' }}>Complete Address</th>
                        <th style={{ padding: '12px 12px' }}>Role</th>
                        <th style={{ padding: '12px 12px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '12px 12px', fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.75)' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                            {u.birthdate || '—'} {u.age ? `(${u.age} yrs)` : ''} {u.gender ? `• ${u.gender}` : ''}
                          </td>
                          <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                            {u.address || '—'}
                          </td>
                          <td style={{ padding: '12px 12px' }}>
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
                              {u.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px' }}>
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
          </>
        )}
      </div>
    </div>
  );
}
