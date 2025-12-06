import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  price: real('price').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull().default('draft'),
  isSold: integer('is_sold').notNull().default(0),
  featured: integer('featured').notNull().default(0),
  soldTo: text('sold_to'),
  soldAt: integer('sold_at'),
  orderId: integer('order_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'),
  paymentMethod: text('payment_method'),
  paymentId: text('payment_id'),
  totalAmount: real('total_amount').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
});

export const discountCodes = sqliteTable('discount_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent').notNull(),
  expiresAt: integer('expires_at'),
  isActive: integer('is_active').notNull().default(1),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  subscribedAt: integer('subscribed_at').notNull(),
});

export const contactMessages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: integer('created_at').notNull(),
});