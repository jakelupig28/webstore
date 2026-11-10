import { NextResponse } from 'next/server';
import {
  getCatalogProducts,
  updateProductInventory,
  addCustomProduct,
  deleteCustomProduct
} from '../../../lib/db';

export async function GET() {
  try {
    const products = await getCatalogProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error('Get products error:', err);
    return NextResponse.json({ error: 'Failed to load products.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { productId, title, category, price, variants } = body || {};

    if (!productId) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }

    await updateProductInventory({
      productId,
      title,
      category,
      price,
      variants
    });

    const products = await getCatalogProducts();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error('Update product error:', err);
    return NextResponse.json({ error: 'Failed to update product inventory.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, category, price, imageUrl, description, stockPerSize } = body || {};

    if (!title) {
      return NextResponse.json({ error: 'Product title is required.' }, { status: 400 });
    }

    const created = await addCustomProduct({
      title,
      category,
      price,
      imageUrl,
      description,
      stockPerSize
    });

    const products = await getCatalogProducts();
    return NextResponse.json({ success: true, created, products });
  } catch (err) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Failed to add product.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
    }
    await deleteCustomProduct(productId);
    const products = await getCatalogProducts();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error('Delete product error:', err);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}

