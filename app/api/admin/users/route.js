import { NextResponse } from 'next/server';
import { getAllUsers, updateUserRole, getDatabaseStatus } from '../../../../lib/db';

export async function GET() {
  try {
    const users = await getAllUsers();
    const dbStatus = await getDatabaseStatus();
    return NextResponse.json({ users, dbStatus });
  } catch (err) {
    console.error('Get users error:', err);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, role } = body || {};
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required.' }, { status: 400 });
    }
    await updateUserRole(userId, role);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update user role error:', err);
    return NextResponse.json({ error: 'Failed to update user role.' }, { status: 500 });
  }
}

