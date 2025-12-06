import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq, or, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Accept either username or email
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required', code: 'MISSING_CREDENTIALS' },
        { status: 400 }
      );
    }

    // Find admin by username OR email (case-insensitive for email)
    const admin = await db
      .select()
      .from(admins)
      .where(
        or(
          eq(admins.username, loginIdentifier.trim()),
          sql`LOWER(${admins.email}) = LOWER(${loginIdentifier.trim()})`
        )
      )
      .limit(1);

    if (admin.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin[0].passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({ 
      id: admin[0].id, 
      username: admin[0].username,
      email: admin[0].email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Return token in response body for localStorage storage (iframe-compatible)
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin[0].id,
        username: admin[0].username,
        email: admin[0].email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}