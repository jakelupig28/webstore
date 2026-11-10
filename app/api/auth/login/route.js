import { NextResponse } from 'next/server';
import { findUserByEmail } from '../../../../lib/db';
import { verifyPassword, createSessionToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = createSessionToken(safeUser);
    const response = NextResponse.json({
      user: safeUser,
      token
    });

    response.cookies.set('laro_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Failed to sign in. Please verify your XAMPP MySQL server.' },
      { status: 500 }
    );
  }
}

