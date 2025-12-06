import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

const VALID_STATUSES = ['draft', 'published', 'archived'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(product[0], { status: 200 });
    }

    // List products with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const includeAvailableOnly = searchParams.get('availableOnly') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';

    let query = db.select().from(products);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(products.title, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (status) {
      conditions.push(eq(products.status, status));
    }

    // Filter out sold products for public views
    if (includeAvailableOnly) {
      conditions.push(eq(products.isSold, 0));
    }

    // Filter featured products
    if (featuredOnly) {
      conditions.push(eq(products.featured, 1));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add sorting and pagination
    const results = await query
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

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
    const { title, description, imageUrl, price, category, status, featured } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required and must be a non-empty string",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ 
        error: "Description is required and must be a non-empty string",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return NextResponse.json({ 
        error: "Image URL is required and must be a non-empty string",
        code: "MISSING_IMAGE_URL" 
      }, { status: 400 });
    }

    if (price === undefined || price === null || typeof price !== 'number') {
      return NextResponse.json({ 
        error: "Price is required and must be a number",
        code: "MISSING_PRICE" 
      }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ 
        error: "Price must be greater than 0",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json({ 
        error: "Category is required and must be a non-empty string",
        code: "MISSING_CATEGORY" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      price: parseFloat(price.toString()),
      category: category.trim(),
      status: status || 'draft',
      isSold: 0,
      featured: featured ? 1 : 0,
      soldTo: null,
      soldAt: null,
      orderId: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const newProduct = await db.insert(products)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
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
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, imageUrl, price, category, status, featured, isSold, soldTo, orderId } = body;

    // Build update object with validated fields
    const updates: any = {
      updatedAt: Date.now()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ 
          error: "Title must be a non-empty string",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return NextResponse.json({ 
          error: "Description must be a non-empty string",
          code: "INVALID_DESCRIPTION" 
        }, { status: 400 });
      }
      updates.description = description.trim();
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        return NextResponse.json({ 
          error: "Image URL must be a non-empty string",
          code: "INVALID_IMAGE_URL" 
        }, { status: 400 });
      }
      updates.imageUrl = imageUrl.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0) {
        return NextResponse.json({ 
          error: "Price must be a number greater than 0",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
      updates.price = parseFloat(price.toString());
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json({ 
          error: "Category must be a non-empty string",
          code: "INVALID_CATEGORY" 
        }, { status: 400 });
      }
      updates.category = category.trim();
    }

    if (status !== undefined) {
      if (typeof status !== 'string' || !VALID_STATUSES.includes(status as any)) {
        return NextResponse.json({ 
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status.trim();
    }

    if (featured !== undefined) {
      updates.featured = featured ? 1 : 0;
    }

    // Handle sold status
    if (isSold !== undefined) {
      updates.isSold = isSold ? 1 : 0;
      if (isSold) {
        updates.soldAt = Date.now();
      }
    }

    if (soldTo !== undefined) {
      updates.soldTo = soldTo ? soldTo.trim() : null;
    }

    if (orderId !== undefined) {
      updates.orderId = orderId;
    }

    const updatedProduct = await db.update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedProduct[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
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
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      product: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}