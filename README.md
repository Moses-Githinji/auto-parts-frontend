# Auto Parts E-Commerce Platform

A comprehensive auto parts e-commerce platform built with React, TypeScript, and Vite. This application provides a complete solution for buying and selling auto parts online, featuring vendor management, commission tracking, and a full administrative dashboard.

## Features

### Customer Features

- **Product Catalog** - Browse and search for auto parts by category, make, model, and year
- **Shopping Cart** - Add items to cart and manage quantities
- **Checkout Process** - Complete purchase flow with shipping and payment integration
- **User Accounts** - Manage profile, addresses, and order history
- **Vehicle Garage** - Save and manage vehicles for easy part matching
- **Order Tracking** - View order status and delivery updates

### Vendor Features

- **Vendor Dashboard** - Manage products, orders, and earnings
- **Product Management** - Add, edit, and organize catalog items
- **Order Processing** - Handle and fulfill customer orders
- **Earnings Dashboard** - Track sales and commission earnings
- **Commission Tracking** - Real-time view of fees and net earnings

### Admin Features

- **Admin Dashboard** - Overview of platform metrics and activity
- **Vendor Management** - Approve and manage vendor accounts
- **Commission Configuration** - Set and adjust commission rates
- **Content Management** - Blog posts and categories
- **Reports & Analytics** - Sales, delivery, and earnings reports
- **Dispute Resolution** - Handle customer/vendor disputes
- **Webhooks** - Manage API integrations

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Zustand stores
- **Routing**: React Router
- **API Client**: Axios with custom client
- **PDF Generation**: Custom PDF components
- **Image Handling**: Cloudinary integration

## Project Structure

```
src/
├── components/
│   ├── commission/     # Commission-related UI components
│   ├── layout/         # Layout components (Sidebar, AppShell)
│   ├── pdf/            # PDF document generation
│   ├── providers/      # Context providers (Notifications)
│   └── ui/             # Reusable UI components
├── config/
│   └── api.ts          # API configuration
├── layout/
│   ├── AdminSidebar.tsx
│   └── adminMenuConfig.tsx
├── lib/
│   ├── apiClient.ts    # API client utilities
│   └── cn.ts           # Class name utilities
├── pages/
│   ├── account/        # User account pages
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   ├── parts/          # Product detail pages
│   └── vendor/         # Vendor management pages
├── stores/
│   ├── authStore.ts    # Authentication state
│   ├── blogStore.ts    # Blog management state
│   ├── cartStore.ts    # Shopping cart state
│   ├── commissionStore.ts  # Commission tracking state
│   ├── notificationStore.ts # Notification system
│   ├── orderStore.ts   # Order management state
│   └── productStore.ts # Product catalog state
├── types/
│   ├── api.ts          # API response types
│   ├── blog.ts         # Blog post types
│   ├── cart.ts         # Cart types
│   ├── commission.ts   # Commission types
│   ├── order.ts        # Order types
│   ├── product.ts      # Product types
│   ├── user.ts         # User types
│   ├── vehicle.ts      # Vehicle types
│   └── vendor.ts       # Vendor types
└── utils/
    └── cloudinaryService.ts  # Cloudinary image handling
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Commission System

The platform features a configurable commission system where:

- Admins set global commission rates
- Commission fees are deducted from vendor sales
- Vendors can view detailed breakdowns of their earnings
- Real-time tracking of pending and paid commissions

## API Integration

The application connects to a backend API for:

- User authentication and authorization
- Product catalog management
- Order processing and tracking
- Vendor management
- Commission calculations
- Blog content management

## License

MIT
