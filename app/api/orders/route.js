import { NextResponse } from 'next/server';
import { createOrder, getOrders, getDatabaseStatus } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email');
    const queryUserId = searchParams.get('userId');

    const isAdmin = user?.role === 'admin' || searchParams.get('role') === 'admin';
    const userId = user?.id || queryUserId || null;
    const email = user?.email || queryEmail || null;

    const orders = await getOrders({ userId, email, isAdmin });
    const dbStatus = await getDatabaseStatus();

    return NextResponse.json({ orders, dbStatus });
  } catch (err) {
    console.error('Get orders error:', err);
    return NextResponse.json({ error: 'Failed to load orders.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionUser = getUserFromRequest(request);
    const body = await request.json();

    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      province,
      postalCode,
      paymentMethod,
      notes,
      totalAmount,
      items
    } = body || {};

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Please fill in all required shipping and contact fields.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cannot place an order with an empty cart.' },
        { status: 400 }
      );
    }

    const orderNumber = `LS-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    const created = await createOrder({
      orderNumber,
      userId: sessionUser?.id || userId || null,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      province: province || '',
      postalCode,
      paymentMethod: paymentMethod || 'COD',
      notes: notes || '',
      totalAmount: Number(totalAmount) || 0,
      items
    });

    return NextResponse.json({
      success: true,
      orderId: created.id,
      orderNumber: created.orderNumber,
      engine: created.engine
    });
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}

