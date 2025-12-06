# 🎨 Yasemin's Creations - Digital Art Marketplace

A cyberpunk-themed digital art gallery and storefront where each artwork is unique and available for purchase only once. Built with Next.js 15, featuring secure PayPal payments, automated pricing, and admin dashboard.

## 🚀 PRODUCTION READY - LIVE PAYMENTS ENABLED

This site is **ready to accept real payments** through PayPal. Upload your artworks and start selling immediately!

## ✨ Features

### 🛒 **E-Commerce Features**
- ✅ **PayPal Integration (LIVE MODE)** - Real payments processed instantly
- ✅ **One-Time Purchase Model** - Each artwork sold only once
- ✅ **Automated Pricing Algorithm** - Smart pricing based on category & complexity
- ✅ **Shopping Cart & Secure Checkout** - Smooth purchase experience
- ✅ **Order Management** - Track orders and customer details
- ✅ **Inventory Protection** - Prevents double-selling of artworks

### 🎨 **Admin Dashboard**
- ✅ **Single & Bulk Upload** - Upload one or multiple artworks at once
- ✅ **Cloudinary Integration** - Fast, reliable image hosting
- ✅ **Product Management** - Edit, publish, or archive artworks
- ✅ **Order Tracking** - View all customer orders and payment statuses
- ✅ **Auto-Pricing** - Automatic price calculation with manual override option

### 🌐 **Public Gallery**
- ✅ **Cyberpunk Design** - Neon colors, glitch effects, futuristic aesthetic
- ✅ **Responsive Layout** - Perfect on desktop, tablet, and mobile
- ✅ **Category Filtering** - Browse by Digital Art, Watercolor, Acrylic, etc.
- ✅ **Image Protection** - Watermarks and right-click prevention
- ✅ **Social Sharing** - Share artworks on social media

## 🔧 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Turso (SQLite in production)
- **ORM:** Drizzle ORM
- **Payments:** PayPal (Live Mode)
- **Image Hosting:** Cloudinary
- **Styling:** Tailwind CSS + Cyberpunk theme
- **UI Components:** shadcn/ui
- **Deployment:** Vercel-ready

## 📦 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PayPal Business account
- Cloudinary account (free tier works)
- Turso database (already configured)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd yasemins-creations

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Visit `http://localhost:3000` to see your site!

## 🔑 Environment Setup

Your `.env` file should already contain:

```env
# Database (Already configured)
TURSO_CONNECTION_URL=<your-turso-url>
TURSO_AUTH_TOKEN=<your-turso-token>

# PayPal (LIVE MODE - Ready for real payments)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<your-client-id>
PAYPAL_CLIENT_SECRET=<your-secret>
PAYPAL_MODE=live

# Cloudinary (For image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-preset>

# Admin (Change this!)
ADMIN_JWT_SECRET=<your-secret-key>
```

### Getting PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Sign in with your PayPal Business account
3. Navigate to "My Apps & Credentials"
4. Toggle to **LIVE** mode (top right)
5. Create a new app or select existing
6. Copy **Client ID** and **Secret**
7. Add them to your `.env` file

**Your PayPal is already configured in LIVE mode!** 🎉

## 🎨 Admin Access

**Login URL:** `http://localhost:3000/admin/login`

**Default Credentials:**
- Email: `yasemin@yasemin.com`
- Password: `YASNA@09122024`

**⚠️ Change these credentials after first login!**

## 📝 How to Sell Your Art

1. **Login to Admin Dashboard**
   - Go to `/admin/login`
   - Use your admin credentials

2. **Upload Artworks**
   - **Single Upload:** `/admin/upload` - Upload one artwork with details
   - **Bulk Upload:** `/admin/bulk-upload` - Upload multiple artworks at once

3. **Pricing is Automatic**
   - Base price: $50
   - Category multipliers:
     - Pencil Sketch: 1.0x
     - Watercolor: 1.5x
     - Digital Art: 2.0x
     - Acrylic Painting: 2.5x
   - Complexity bonus: +$5 per 10 characters in title

4. **Publish Your Artworks**
   - Set status to "Published" to make them visible
   - Draft artworks are hidden from customers

5. **Customers Can Buy**
   - Browse gallery at `/gallery`
   - Add to cart and checkout with PayPal
   - **Real payments processed immediately!**

6. **Manage Orders**
   - View all orders at `/admin/orders`
   - Track payment status and shipping details

## 💳 Payment Flow

1. Customer adds artwork to cart
2. Proceeds to checkout (`/checkout`)
3. Fills in shipping details
4. Clicks PayPal button
5. **Real PayPal payment processed**
6. Order created in database
7. Artwork marked as SOLD (no longer available)
8. Customer receives order confirmation

## 🎯 Pricing Algorithm

```
Final Price = Base Price × Category Multiplier + Complexity Bonus

Where:
- Base Price = $50
- Category Multiplier = 1.0x to 2.5x (based on medium)
- Complexity Bonus = $5 per 10 characters in title
```

**Example:**
- Title: "Cyberpunk Cityscape" (20 characters)
- Category: Digital Art (2.0x multiplier)
- Calculation: $50 × 2.0 + ($5 × 2) = $110

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with featured artworks
│   ├── gallery/           # Public gallery with filters
│   ├── product/[id]/      # Individual product pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # PayPal checkout
│   ├── admin/             # Admin dashboard
│   │   ├── login/         # Admin authentication
│   │   ├── upload/        # Single file upload
│   │   ├── bulk-upload/   # Multiple file upload
│   │   ├── products/      # Product management
│   │   └── orders/        # Order management
│   └── api/               # API routes
│       ├── products/      # Product CRUD
│       ├── orders/        # Order management
│       ├── paypal/        # PayPal integration
│       └── auth/          # Admin authentication
├── components/            # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Footer
│   ├── ProductCard.tsx    # Product display card
│   └── PayPalButton.tsx   # PayPal payment button
├── db/                    # Database
│   ├── schema.ts          # Database schema
│   └── index.ts           # Database connection
└── lib/                   # Utilities
    ├── paypal.ts          # PayPal API wrapper
    └── pricing.ts         # Pricing algorithm
```

## 🎨 Design System

**Cyberpunk Theme:**
- **Primary:** Cyan (#00ffff) - Neon blue highlights
- **Accent:** Magenta (#ff00ff) - Neon pink accents
- **Background:** Deep space black (#0a0a0f)
- **Typography:** Orbitron + Rajdhani fonts
- **Effects:** Glitch animations, scanlines, neon glows

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

**Don't forget to add all environment variables in Vercel:**
- Database credentials
- PayPal credentials (LIVE mode)
- Cloudinary credentials
- JWT secret

### Environment Variables Checklist

✅ `TURSO_CONNECTION_URL`
✅ `TURSO_AUTH_TOKEN`
✅ `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
✅ `PAYPAL_CLIENT_SECRET`
✅ `PAYPAL_MODE=live`
✅ `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
✅ `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
✅ `ADMIN_JWT_SECRET`
✅ `NEXT_PUBLIC_SITE_URL` (your production URL)

## 🔐 Security

- ✅ Admin authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ PayPal server-side API calls only
- ✅ Environment variables for secrets
- ✅ CORS protection on API routes
- ✅ Image watermarking and protection
- ✅ Prevents double-selling with database locks

## 📊 Database Schema

**Products Table:**
- id, title, description, imageUrl, price
- category, dimensions, medium
- status (draft/published/archived)
- isSold, soldTo, soldAt, orderId

**Orders Table:**
- id, orderNumber, customerEmail, customerName
- shippingAddress, total, items
- paymentMethod, paymentStatus, paymentId
- status (pending/paid/shipped/delivered)

**Admins Table:**
- id, email, passwordHash
- createdAt

## 🎯 Features Roadmap

- [x] PayPal payments (LIVE)
- [x] Admin dashboard
- [x] Bulk upload
- [x] Auto-pricing algorithm
- [x] Cyberpunk theme
- [ ] Email notifications
- [ ] Customer accounts
- [ ] Wishlist feature
- [ ] Advanced analytics
- [ ] Multi-currency support

## 🐛 Troubleshooting

**PayPal not working?**
- Verify `PAYPAL_MODE=live` in `.env`
- Check Client ID is from LIVE credentials
- Ensure both Client ID and Secret are set

**Images not uploading?**
- Verify Cloudinary credentials
- Check upload preset allows unsigned uploads
- Ensure cloud name is correct

**Can't login to admin?**
- Default email: `yasemin@yasemin.com`
- Default password: `YASNA@09122024`
- Clear browser localStorage and try again

## 📄 License

Proprietary - All rights reserved to Yasemin's Creations

## 💬 Support

For issues or questions, contact the admin at your support email.

---

**Made with ❤️ using Next.js 15 | Powered by PayPal | Secured by Cloudinary**