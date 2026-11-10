import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { findUserById, getDatabaseStatus } from '../../../../lib/db';

export async function GET(request) {
  try {
    const dbStatus = await getDatabaseStatus();
    const sessionUser = getUserFromRequest(request);
    if (!sessionUser) {
      return NextResponse.json({ user: null, dbStatus });
    }

    const dbUser = await findUserById(sessionUser.id);
    return NextResponse.json({
      user: dbUser || {
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role
      },
      dbStatus
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}

