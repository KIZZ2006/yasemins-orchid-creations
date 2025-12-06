import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, like, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    // Single category by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // Single category by slug
    if (slug) {
      const category = await db.select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(category[0], { status: 200 });
    }

    // List with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(categories);

    if (search) {
      query = query.where(like(categories.name, `%${search}%`));
    }

    const results = await query
      .orderBy(asc(categories.name))
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
    const { name, slug, description } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json({ 
        error: "Slug is required and must be a non-empty string",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Validate slug format (lowercase, letters, numbers, hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const trimmedSlug = slug.trim();
    
    if (!slugRegex.test(trimmedSlug)) {
      return NextResponse.json({ 
        error: "Slug must be lowercase and contain only letters, numbers, and hyphens",
        code: "INVALID_SLUG_FORMAT" 
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.slug, trimmedSlug))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({ 
        error: "A category with this slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      name: name.trim(),
      slug: trimmedSlug,
      description: description ? (typeof description === 'string' ? description.trim() : null) : null,
      createdAt: new Date(Date.now())
    };

    const newCategory = await db.insert(categories)
      .values(insertData)
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
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

    // Check if category exists
    const existing = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug, description } = body;

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== 'string' || !slug.trim()) {
        return NextResponse.json({ 
          error: "Slug must be a non-empty string",
          code: "INVALID_SLUG" 
        }, { status: 400 });
      }

      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      const trimmedSlug = slug.trim();
      
      if (!slugRegex.test(trimmedSlug)) {
        return NextResponse.json({ 
          error: "Slug must be lowercase and contain only letters, numbers, and hyphens",
          code: "INVALID_SLUG_FORMAT" 
        }, { status: 400 });
      }

      // Check if slug is taken by another category
      const duplicateSlug = await db.select()
        .from(categories)
        .where(eq(categories.slug, trimmedSlug))
        .limit(1);

      if (duplicateSlug.length > 0 && duplicateSlug[0].id !== parseInt(id)) {
        return NextResponse.json({ 
          error: "A category with this slug already exists",
          code: "DUPLICATE_SLUG" 
        }, { status: 400 });
      }

      updateData.slug = trimmedSlug;
    }

    if (description !== undefined) {
      updateData.description = description ? (typeof description === 'string' ? description.trim() : null) : null;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    const updated = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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

    // Check if category exists
    const existing = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      category: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}