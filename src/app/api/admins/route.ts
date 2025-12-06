import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admins } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Helper function to exclude passwordHash from admin objects
function excludePasswordHash(admin: any) {
  const { passwordHash, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate password strength
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const admin = await db.select()
        .from(admins)
        .where(eq(admins.id, parseInt(id)))
        .limit(1);

      if (admin.length === 0) {
        return NextResponse.json({ 
          error: 'Admin not found',
          code: 'ADMIN_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(excludePasswordHash(admin[0]), { status: 200 });
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(admins);

    if (search) {
      query = query.where(
        or(
          like(admins.username, `%${search}%`),
          like(admins.email, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);
    const sanitizedResults = results.map(admin => excludePasswordHash(admin));

    return NextResponse.json(sanitizedResults, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    // Validate required fields
    if (!username || !password || !email) {
      return NextResponse.json({ 
        error: "Username, password, and email are required",
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate username not empty after trim
    if (!trimmedUsername) {
      return NextResponse.json({ 
        error: "Username cannot be empty",
        code: "INVALID_USERNAME" 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    // Validate password strength
    if (!isValidPassword(trimmedPassword)) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD" 
      }, { status: 400 });
    }

    // Check for existing username
    const existingUsername = await db.select()
      .from(admins)
      .where(eq(admins.username, trimmedUsername))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json({ 
        error: "Username already exists",
        code: "USERNAME_EXISTS" 
      }, { status: 400 });
    }

    // Check for existing email
    const existingEmail = await db.select()
      .from(admins)
      .where(eq(admins.email, trimmedEmail))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS" 
      }, { status: 400 });
    }

    // Hash password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(trimmedPassword, 10);

    // Create new admin
    const now = Date.now();
    const newAdmin = await db.insert(admins)
      .values({
        username: trimmedUsername,
        passwordHash: passwordHash,
        email: trimmedEmail,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(excludePasswordHash(newAdmin[0]), { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.id, parseInt(id)))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { username, password, email } = body;

    const updates: any = {
      updatedAt: Date.now()
    };

    // Update username if provided
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        return NextResponse.json({ 
          error: "Username cannot be empty",
          code: "INVALID_USERNAME" 
        }, { status: 400 });
      }

      // Check for existing username (excluding current admin)
      const existingUsername = await db.select()
        .from(admins)
        .where(eq(admins.username, trimmedUsername))
        .limit(1);

      if (existingUsername.length > 0 && existingUsername[0].id !== parseInt(id)) {
        return NextResponse.json({ 
          error: "Username already exists",
          code: "USERNAME_EXISTS" 
        }, { status: 400 });
      }

      updates.username = trimmedUsername;
    }

    // Update email if provided
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      
      // Validate email format
      if (!isValidEmail(trimmedEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }

      // Check for existing email (excluding current admin)
      const existingEmail = await db.select()
        .from(admins)
        .where(eq(admins.email, trimmedEmail))
        .limit(1);

      if (existingEmail.length > 0 && existingEmail[0].id !== parseInt(id)) {
        return NextResponse.json({ 
          error: "Email already exists",
          code: "EMAIL_EXISTS" 
        }, { status: 400 });
      }

      updates.email = trimmedEmail;
    }

    // Update password if provided
    if (password !== undefined) {
      const trimmedPassword = password.trim();
      
      // Validate password strength
      if (!isValidPassword(trimmedPassword)) {
        return NextResponse.json({ 
          error: "Password must be at least 8 characters long",
          code: "WEAK_PASSWORD" 
        }, { status: 400 });
      }

      // Hash password with bcrypt (10 salt rounds)
      updates.passwordHash = await bcrypt.hash(trimmedPassword, 10);
    }

    // Perform update
    const updated = await db.update(admins)
      .set(updates)
      .where(eq(admins.id, parseInt(id)))
      .returning();

    return NextResponse.json(excludePasswordHash(updated[0]), { status: 200 });

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await db.select()
      .from(admins)
      .where(eq(admins.id, parseInt(id)))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json({ 
        error: 'Admin not found',
        code: 'ADMIN_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete admin
    const deleted = await db.delete(admins)
      .where(eq(admins.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Admin deleted successfully',
      admin: excludePasswordHash(deleted[0])
    }, { status: 200 });

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}