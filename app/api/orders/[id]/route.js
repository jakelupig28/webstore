import { NextResponse } from 'next/server';
import { updateOrderStatus, deleteOrder } from '../../../../lib/db';

export async function PATCH(request, { params }) {
  try {
    const orderId = params?.id;
    const body = await request.json();
    const { status } = body || {};

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required.' }, { status: 400 });
    }

    await updateOrderStatus(orderId, status);
    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('Update order error:', err);
    return NextResponse.json({ error: 'Failed to update order status.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }
    await deleteOrder(orderId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete order error:', err);
    return NextResponse.json({ error: 'Failed to delete order.' }, { status: 500 });
  }
}

