import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { discountCodes } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const code = searchParams.get('code');
    const validate = searchParams.get('validate');

    // Special validation endpoint
    if (validate === 'true' && code) {
      const discountCode = await db.select()
        .from(discountCodes)
        .where(eq(discountCodes.code, code.toUpperCase()))
        .limit(1);

      if (discountCode.length === 0) {
        return NextResponse.json({
          valid: false,
          reason: 'Discount code not found'
        });
      }

      const discount = discountCode[0];

      if (discount.isActive !== 1) {
        return NextResponse.json({
          valid: false,
          reason: 'Discount code is inactive'
        });
      }

      if (discount.expiresAt && discount.expiresAt < Date.now()) {
        return NextResponse.json({
          valid: false,
          reason: 'Discount code has expired'
        });
      }

      return NextResponse.json({
        valid: true,
        discountPercent: discount.discountPercent
      });
    }

    // Get by code
    if (code) {
      const discountCode = await db.select()
        .from(discountCodes)
        .where(eq(discountCodes.code, code.toUpperCase()))
        .limit(1);

      if (discountCode.length === 0) {
        return NextResponse.json({ 
          error: 'Discount code not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(discountCode[0]);
    }

    // Get by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const discountCode = await db.select()
        .from(discountCodes)
        .where(eq(discountCodes.id, parseInt(id)))
        .limit(1);

      if (discountCode.length === 0) {
        return NextResponse.json({ 
          error: 'Discount code not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(discountCode[0]);
    }

    // List with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const isActiveParam = searchParams.get('isActive');

    let query = db.select().from(discountCodes);

    const conditions = [];

    if (search) {
      conditions.push(like(discountCodes.code, `%${search.toUpperCase()}%`));
    }

    if (isActiveParam !== null) {
      const isActiveValue = isActiveParam === '1' ? 1 : 0;
      conditions.push(eq(discountCodes.isActive, isActiveValue));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(discountCodes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountPercent, expiresAt } = body;

    // Validate required fields
    if (!code) {
      return NextResponse.json({ 
        error: 'Code is required',
        code: 'MISSING_CODE' 
      }, { status: 400 });
    }

    if (discountPercent === undefined || discountPercent === null) {
      return NextResponse.json({ 
        error: 'Discount percent is required',
        code: 'MISSING_DISCOUNT_PERCENT' 
      }, { status: 400 });
    }

    // Validate code format (uppercase alphanumeric)
    const trimmedCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      return NextResponse.json({ 
        error: 'Code must be uppercase alphanumeric characters only',
        code: 'INVALID_CODE_FORMAT' 
      }, { status: 400 });
    }

    // Validate discount percent range
    const discountPercentNum = parseInt(discountPercent);
    if (isNaN(discountPercentNum) || discountPercentNum < 1 || discountPercentNum > 100) {
      return NextResponse.json({ 
        error: 'Discount percent must be between 1 and 100',
        code: 'INVALID_DISCOUNT_PERCENT' 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: any = {
      code: trimmedCode,
      discountPercent: discountPercentNum,
      isActive: 1,
      usageCount: 0,
      createdAt: Date.now()
    };

    if (expiresAt !== undefined && expiresAt !== null) {
      insertData.expiresAt = expiresAt;
    }

    const newDiscountCode = await db.insert(discountCodes)
      .values(insertData)
      .returning();

    return NextResponse.json(newDiscountCode[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Discount code already exists',
        code: 'DUPLICATE_CODE' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(discountCodes)
      .where(eq(discountCodes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Discount code not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and update code if provided
    if (body.code !== undefined) {
      const trimmedCode = body.code.trim().toUpperCase();
      if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
        return NextResponse.json({ 
          error: 'Code must be uppercase alphanumeric characters only',
          code: 'INVALID_CODE_FORMAT' 
        }, { status: 400 });
      }
      updates.code = trimmedCode;
    }

    // Validate and update discountPercent if provided
    if (body.discountPercent !== undefined) {
      const discountPercentNum = parseInt(body.discountPercent);
      if (isNaN(discountPercentNum) || discountPercentNum < 1 || discountPercentNum > 100) {
        return NextResponse.json({ 
          error: 'Discount percent must be between 1 and 100',
          code: 'INVALID_DISCOUNT_PERCENT' 
        }, { status: 400 });
      }
      updates.discountPercent = discountPercentNum;
    }

    // Update other fields if provided
    if (body.expiresAt !== undefined) {
      updates.expiresAt = body.expiresAt;
    }

    if (body.isActive !== undefined) {
      updates.isActive = body.isActive ? 1 : 0;
    }

    if (body.usageCount !== undefined) {
      updates.usageCount = parseInt(body.usageCount) || 0;
    }

    const updated = await db.update(discountCodes)
      .set(updates)
      .where(eq(discountCodes.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);

    // Handle unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Discount code already exists',
        code: 'DUPLICATE_CODE' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if record exists
    const existing = await db.select()
      .from(discountCodes)
      .where(eq(discountCodes.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Discount code not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(discountCodes)
      .where(eq(discountCodes.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Discount code deleted successfully',
      deleted: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}