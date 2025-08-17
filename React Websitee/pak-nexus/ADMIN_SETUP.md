# Admin Panel Setup Guide

## Overview
This document explains how to set up and use the admin approval system for the Pak Nexus platform.

## Features Implemented

### 1. Admin Approval System
- **Entities require admin approval**: Institutes, Shops, Hospitals, and Marketplace listings are created with 'pending' status
- **Admin review process**: Admins can approve or reject entities with notes
- **Payment verification**: Admins can verify payment requests from users

### 2. Admin Panel Components
- **Dashboard**: Overview of system statistics and quick actions
- **Pending Entities**: Review and approve/reject submitted entities
- **Payment Requests**: Verify and manage payment requests
- **User Management**: Manage user roles and verification status

## Setup Instructions

### Step 1: Make a User an Admin
Use the provided script to make an existing user an admin:

```bash
cd backend
node make-admin.js <user-email>
```

Example:
```bash
node make-admin.js admin@example.com
```

### Step 2: Access Admin Panel
1. Login with the admin user account
2. Click on your profile menu (top right)
3. Click "Admin Panel" (only visible to admin users)
4. Navigate to `/admin` route

### Step 3: Review and Approve Entities
1. Go to "Pending Entities" tab
2. Review submitted entities (Institutes, Shops, Products)
3. Click "Review" on any entity
4. Choose to Approve or Reject
5. Add optional notes
6. Submit decision

### Step 4: Manage Payment Requests
1. Go to "Payment Requests" tab
2. Review payment submissions
3. Verify payment details
4. Update status (Verified, Rejected, Completed)
5. Add verification notes

## API Endpoints

### Admin Routes
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/pending-entities` - Get all pending entities
- `PUT /api/admin/institute/:id/approval` - Approve/reject institute
- `PUT /api/admin/shop/:id/approval` - Approve/reject shop
- `PUT /api/admin/product/:id/approval` - Approve/reject product
- `GET /api/admin/payment-requests` - Get payment requests
- `PUT /api/admin/payment-request/:id/status` - Update payment status

### Entity Creation Flow
1. User submits entity creation form
2. Payment section is completed
3. Entity is created with 'pending' status
4. Admin reviews entity in admin panel
5. Admin approves or rejects with notes
6. If approved, entity becomes visible to public
7. If rejected, user can see rejection reason

## Database Schema Updates

### User Model
- Added `isAdmin` field (boolean)

### Entity Models (Institute, Shop, Product)
- Added `approvalStatus` (enum: 'pending', 'approved', 'rejected')
- Added `approvalNotes` (string)
- Added `approvedBy` (ObjectId reference to User)
- Added `approvedAt` (Date)

### PaymentRequest Model
- Added `verifiedBy` (ObjectId reference to User)
- Added `verifiedAt` (Date)
- Added `verificationNotes` (string)

## Security Features

### Admin Route Protection
- All admin routes require authentication
- All admin routes require admin role
- Non-admin users are redirected to dashboard
- Unauthenticated users are redirected to login

### Entity Visibility
- Only approved entities are visible to public users
- Entity owners can see their pending entities
- Admins can see all entities regardless of status

## Frontend Components

### Admin Dashboard (`/admin`)
- Main dashboard with statistics
- Tabbed navigation between sections
- Quick action buttons

### Pending Entities
- Tabbed view (Institutes, Shops, Products)
- Entity cards with review buttons
- Approval/rejection dialog with notes

### Payment Requests
- Filterable list of payment requests
- Status management
- Verification notes

### User Management
- User list with role management
- Verification status management
- Search and filtering

## Usage Examples

### Approving an Institute
1. Navigate to Admin Panel → Pending Entities
2. Select "Institutes" tab
3. Click "Review" on a pending institute
4. Review details and add notes if needed
5. Click "Approve"
6. Institute becomes visible to public

### Rejecting a Shop
1. Navigate to Admin Panel → Pending Entities
2. Select "Shops" tab
3. Click "Review" on a pending shop
4. Add rejection reason in notes
5. Click "Reject"
6. Shop owner can see rejection reason

### Verifying Payment
1. Navigate to Admin Panel → Payment Requests
2. Click "Review" on a payment request
3. Verify transaction details
4. Update status to "Verified"
5. Add verification notes
6. Submit

## Troubleshooting

### Common Issues

1. **Admin link not visible**
   - Ensure user has `isAdmin: true` in database
   - Check if user is properly authenticated

2. **Entities not showing as pending**
   - Check if entities were created after admin system implementation
   - Verify database schema has approval fields

3. **Permission denied errors**
   - Ensure user is logged in
   - Verify user has admin role
   - Check backend middleware configuration

### Database Queries

Check if a user is admin:
```javascript
db.users.findOne({ email: "admin@example.com" })
```

Check pending entities:
```javascript
db.institutes.find({ approvalStatus: "pending" })
db.shops.find({ approvalStatus: "pending" })
db.products.find({ approvalStatus: "pending" })
```

## Future Enhancements

1. **Email Notifications**
   - Notify users when entities are approved/rejected
   - Notify admins of new pending entities

2. **Bulk Operations**
   - Bulk approve/reject multiple entities
   - Bulk status updates for payments

3. **Advanced Filtering**
   - Date range filters
   - Owner-based filtering
   - Status-based sorting

4. **Audit Logs**
   - Track all admin actions
   - Maintain approval history

5. **Automated Approval**
   - Rules-based auto-approval for certain criteria
   - Escalation for high-value entities

## Support

For technical support or questions about the admin system, please refer to the development team or create an issue in the project repository.
