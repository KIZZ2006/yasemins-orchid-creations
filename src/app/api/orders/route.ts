import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPaymentStatus(paymentStatus: string): boolean {
  const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
  return validPaymentStatuses.includes(paymentStatus);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(order[0], { status: 200 });
    }

    // List with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const paymentStatusFilter = searchParams.get('paymentStatus');

    let query = db.select().from(orders);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(orders.customerEmail, searchTerm),
          like(orders.customerName, searchTerm)
        )
      );
    }

    if (paymentStatusFilter) {
      conditions.push(eq(orders.paymentStatus, paymentStatusFilter));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting and pagination
    const results = await query
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      productId,
      items,
      customerEmail,
      customerName,
      totalAmount,
      total,
      paymentMethod,
      paymentId,
      paymentStatus,
    } = body;

    // Handle both single product and cart orders
    const finalTotal = totalAmount || total;
    
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required', code: 'MISSING_CUSTOMER_EMAIL' },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: 'Customer name is required', code: 'MISSING_CUSTOMER_NAME' },
        { status: 400 }
      );
    }

    if (finalTotal === undefined || finalTotal === null) {
      return NextResponse.json(
        { error: 'Total amount is required', code: 'MISSING_TOTAL_AMOUNT' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required', code: 'MISSING_PAYMENT_METHOD' },
        { status: 400 }
      );
    }

    // Validate email format
    const trimmedEmail = customerEmail.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate total amount
    if (typeof finalTotal !== 'number' || finalTotal <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0', code: 'INVALID_TOTAL_AMOUNT' },
        { status: 400 }
      );
    }

    // Parse items if it's a cart order
    let orderItems = [];
    if (items) {
      try {
        orderItems = typeof items === 'string' ? JSON.parse(items) : items;
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid items format', code: 'INVALID_ITEMS' },
          { status: 400 }
        );
      }
    } else if (productId) {
      // Single product order
      orderItems = [{ id: productId, quantity: 1 }];
    } else {
      return NextResponse.json(
        { error: 'Either productId or items is required', code: 'MISSING_PRODUCTS' },
        { status: 400 }
      );
    }

    // Check if all products exist and are available
    for (const item of orderItems) {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.id))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json(
          { error: `Product with ID ${item.id} not found`, code: 'PRODUCT_NOT_FOUND' },
          { status: 404 }
        );
      }

      if (product[0].isSold === 1) {
        return NextResponse.json(
          { error: `Product "${product[0].title}" has already been sold`, code: 'PRODUCT_ALREADY_SOLD' },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs
    const trimmedName = customerName.trim();
    const trimmedPaymentMethod = paymentMethod.trim();
    const trimmedPaymentId = paymentId ? paymentId.trim() : null;
    const finalPaymentStatus = paymentStatus || 'pending';

    // Get current timestamp
    const now = Date.now();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Insert new order - use first product ID for reference
    const newOrder = await db
      .insert(orders)
      .values({
        productId: orderItems[0].id,
        customerEmail: trimmedEmail,
        customerName: trimmedName,
        totalAmount: finalTotal,
        paymentStatus: finalPaymentStatus,
        paymentMethod: trimmedPaymentMethod,
        paymentId: trimmedPaymentId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Mark all products as sold
    for (const item of orderItems) {
      await db
        .update(products)
        .set({
          isSold: 1,
          soldTo: trimmedEmail,
          soldAt: now,
          orderId: newOrder[0].id,
          updatedAt: now,
        })
        .where(eq(products.id, item.id));
    }

    return NextResponse.json({ ...newOrder[0], orderNumber }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and sanitize fields if provided
    if (body.customerEmail !== undefined) {
      const trimmedEmail = body.customerEmail.trim().toLowerCase();
      if (!isValidEmail(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      updates.customerEmail = trimmedEmail;
    }

    if (body.customerName !== undefined) {
      updates.customerName = body.customerName.trim();
    }

    if (body.totalAmount !== undefined) {
      if (typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
        return NextResponse.json(
          { error: 'Total amount must be greater than 0', code: 'INVALID_TOTAL_AMOUNT' },
          { status: 400 }
        );
      }
      updates.totalAmount = body.totalAmount;
    }

    if (body.paymentStatus !== undefined) {
      if (!isValidPaymentStatus(body.paymentStatus)) {
        return NextResponse.json(
          { 
            error: 'Invalid payment status. Must be one of: pending, completed, failed, refunded', 
            code: 'INVALID_PAYMENT_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.paymentStatus = body.paymentStatus;
    }

    if (body.paymentMethod !== undefined) {
      updates.paymentMethod = body.paymentMethod.trim();
    }

    if (body.paymentId !== undefined) {
      updates.paymentId = body.paymentId ? body.paymentId.trim() : null;
    }

    // Always update updatedAt
    updates.updatedAt = Date.now();

    const updated = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Order deleted successfully',
        order: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}