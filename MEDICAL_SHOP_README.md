# Medical Shop API Documentation

This document describes the medical shop functionality implemented in the Early-Pulse user service.

## Overview

The medical shop allows users to browse and purchase medicines online. Only users with the `medicalOwner` role can create, update, and delete medicines, while all authenticated users can view medicines and place orders.

## Features

- **Medicine Management**: CRUD operations for medicines (medicalOwner only)
- **Medicine Browsing**: Public access to view medicines with filtering and search
- **Order Management**: Users can place orders, view their orders, and track order status
- **Stock Management**: Automatic stock updates when orders are placed
- **Prescription Support**: Support for prescription-required medicines
- **Role-based Access**: Different permissions for medicalOwner and regular users

## Models

### Medicine Model
```javascript
{
  name: String (required),
  description: String (required),
  category: String (enum: painkiller, antibiotic, vitamin, supplement, prescription, otc, other),
  manufacturer: String (required),
  price: Number (required, min: 0),
  stockQuantity: Number (required, min: 0),
  prescriptionRequired: Boolean (default: false),
  imageUrl: String,
  activeIngredients: [String],
  dosageForm: String (enum: tablet, capsule, liquid, injection, cream, ointment, drops, other),
  strength: String,
  expiryDate: Date (required),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User, required)
}
```

### MedicineOrder Model
```javascript
{
  user: ObjectId (ref: User, required),
  medicines: [{
    medicine: ObjectId (ref: Medicine, required),
    quantity: Number (required, min: 1),
    price: Number (required, min: 0)
  }],
  totalAmount: Number (required, min: 0),
  status: String (enum: pending, confirmed, processing, shipped, delivered, cancelled),
  shippingAddress: {
    street: String (required),
    city: String (required),
    state: String (required),
    zipCode: String (required),
    country: String (default: "India")
  },
  paymentMethod: String (enum: cod, online, card, default: cod),
  paymentStatus: String (enum: pending, completed, failed, refunded),
  prescriptionUrl: String,
  notes: String,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Medicines
```
GET /api/v1/medicines/all
```
Query Parameters:
- `category`: Filter by medicine category
- `search`: Search in medicine name and description
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `prescriptionRequired`: Filter by prescription requirement (true/false)

#### Get Medicine by ID
```
GET /api/v1/medicines/:medicineId
```

### Protected Endpoints (Authentication Required)

#### User Endpoints (All Authenticated Users)

##### Create Order
```
POST /api/v1/medicines/order
```
Body:
```json
{
  "medicines": [
    {
      "medicine": "medicineId",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "paymentMethod": "cod",
  "prescriptionUrl": "https://example.com/prescription.pdf",
  "notes": "Please deliver in the morning"
}
```

##### Get User Orders
```
GET /api/v1/medicines/orders
```

##### Get Order by ID
```
GET /api/v1/medicines/order/:orderId
```

#### MedicalOwner Endpoints (medicalOwner Role Only)

##### Create Medicine
```
POST /api/v1/medicines/create
```
Body:
```json
{
  "name": "Paracetamol 500mg",
  "description": "Pain reliever and fever reducer",
  "category": "painkiller",
  "manufacturer": "ABC Pharmaceuticals",
  "price": 50.00,
  "stockQuantity": 100,
  "prescriptionRequired": false,
  "imageUrl": "https://example.com/paracetamol.jpg",
  "activeIngredients": ["Paracetamol"],
  "dosageForm": "tablet",
  "strength": "500mg",
  "expiryDate": "2025-12-31"
}
```

##### Update Medicine
```
PATCH /api/v1/medicines/:medicineId
```

##### Delete Medicine
```
DELETE /api/v1/medicines/:medicineId
```

##### Update Order Status
```
PATCH /api/v1/medicines/order/:orderId/status
```
Body:
```json
{
  "status": "confirmed"
}
```

##### Get All Orders
```
GET /api/v1/medicines/orders/all
```
Query Parameters:
- `status`: Filter by order status
- `paymentStatus`: Filter by payment status

##### Get Medicine Statistics
```
GET /api/v1/medicines/stats
```

## Role-based Access Control

### medicalOwner Role
- Can create, update, and delete medicines
- Can view all orders and update order status
- Can view medicine statistics
- Has full access to medical shop management

### Regular Users
- Can view medicines (public access)
- Can place orders
- Can view their own orders
- Cannot modify medicines or view other users' orders

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

Common error scenarios:
- `400`: Bad Request (invalid data, insufficient stock, prescription required)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (medicine or order not found)
- `500`: Internal Server Error

## Usage Examples

### 1. MedicalOwner Creating a Medicine
```bash
curl -X POST http://localhost:3000/api/v1/medicines/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aspirin 100mg",
    "description": "Pain reliever and blood thinner",
    "category": "painkiller",
    "manufacturer": "XYZ Pharma",
    "price": 25.00,
    "stockQuantity": 200,
    "dosageForm": "tablet",
    "strength": "100mg",
    "expiryDate": "2025-06-30"
  }'
```

### 2. User Browsing Medicines
```bash
curl "http://localhost:3000/api/v1/medicines/all?category=painkiller&maxPrice=100"
```

### 3. User Placing an Order
```bash
curl -X POST http://localhost:3000/api/v1/medicines/order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicines": [
      {
        "medicine": "MEDICINE_ID",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "456 Oak Ave",
      "city": "Delhi",
      "state": "Delhi",
      "zipCode": "110001"
    }
  }'
```

## Database Indexes

The following indexes are created for optimal performance:
- Text index on medicine name, description, and category for search functionality
- Index on medicine name for faster lookups
- Index on order status and payment status for filtering

## Security Considerations

1. **Authentication**: All protected endpoints require valid JWT tokens
2. **Authorization**: Role-based access control for medicalOwner operations
3. **Input Validation**: Comprehensive validation for all input data
4. **Stock Management**: Automatic stock updates to prevent overselling
5. **Prescription Validation**: Required prescriptions for prescription-only medicines

## Future Enhancements

1. **Payment Integration**: Support for online payment gateways
2. **Inventory Alerts**: Low stock notifications for medicalOwner
3. **Order Tracking**: Real-time order tracking with delivery updates
4. **Medicine Reviews**: User reviews and ratings for medicines
5. **Bulk Operations**: Bulk medicine import/export functionality
6. **Analytics Dashboard**: Detailed sales and inventory analytics 