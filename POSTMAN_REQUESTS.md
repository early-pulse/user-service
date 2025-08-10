# Medical Shop API - Postman Requests Guide

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication Setup

### 1. Register Medical Owner
**Method**: `POST`  
**URL**: `{{baseUrl}}/users/register`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "Medical Shop Owner",
  "email": "medicalowner@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Medical Lane, Healthcare City",
  "emergencyContactNumber": "9876543211",
  "password": "medicalOwner123!",
  "role": "medicalOwner"
}
```

### 2. Register Regular User
**Method**: `POST`  
**URL**: `{{baseUrl}}/users/register`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "8765432109",
  "address": "456 User Street, Customer City",
  "emergencyContactNumber": "8765432110",
  "password": "user123!",
  "role": "user"
}
```

### 3. Login Medical Owner
**Method**: `POST`  
**URL**: `{{baseUrl}}/users/login`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "email": "medicalowner@example.com",
  "password": "medicalOwner123!"
}
```

**Response**: Copy the `accessToken` from the response and save it as a Postman environment variable `medicalOwnerToken`.

### 4. Login Regular User
**Method**: `POST`  
**URL**: `{{baseUrl}}/users/login`  
**Headers**: 
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "user123!"
}
```

**Response**: Copy the `accessToken` from the response and save it as a Postman environment variable `userToken`.

---

## Public Medicine Endpoints

### 5. Get All Medicines (Public)
**Method**: `GET`  
**URL**: `{{baseUrl}}/medicines/all`  
**Headers**: None required

**Query Parameters** (optional):
- `category`: `painkiller`
- `search`: `paracetamol`
- `minPrice`: `10`
- `maxPrice`: `100`

**Example URL with filters**:
```
{{baseUrl}}/medicines/all?category=painkiller&minPrice=50&maxPrice=150
```

### 6. Get Medicine by ID (Public)
**Method**: `GET`  
**URL**: `{{baseUrl}}/medicines/{{medicineId}}`  
**Headers**: None required

**Note**: Replace `{{medicineId}}` with an actual medicine ID from the previous response.

---

## Medical Owner Only Endpoints

### 7. Create Medicine (with Image Upload)
**Method**: `POST`  
**URL**: `{{baseUrl}}/medicines/create`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```
**Body** (form-data):
```
name: Paracetamol 500mg
description: Effective pain reliever and fever reducer. Suitable for headaches, muscle aches, and fever.
category: painkiller
manufacturer: ABC Pharmaceuticals Ltd
price: 45.00
stockQuantity: 200
dosageForm: tablet
strength: 500mg
expiryDate: 2025-12-31T00:00:00.000Z
image: [Select File] (Choose a local image file)
```

**Note**: 
- Use `form-data` instead of `raw JSON` in Postman
- Add the `image` field as a file type and select a local image file
- Supported image formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- The image will be automatically uploaded and the URL will be saved in the database

### 8. Create Antibiotic Medicine (with Image Upload)
**Method**: `POST`  
**URL**: `{{baseUrl}}/medicines/create`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```
**Body** (form-data):
```
name: Amoxicillin 250mg
description: Broad-spectrum antibiotic used to treat bacterial infections
category: antibiotic
manufacturer: XYZ Pharmaceuticals
price: 120.00
stockQuantity: 50
dosageForm: capsule
strength: 250mg
expiryDate: 2024-12-31T00:00:00.000Z
image: [Select File] (Choose a local image file)
```

### 9. Create Vitamin Supplement (with Image Upload)
**Method**: `POST`  
**URL**: `{{baseUrl}}/medicines/create`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```
**Body** (form-data):
```
name: Vitamin C 1000mg
description: High potency vitamin C supplement for immune support
category: vitamin
manufacturer: Health Plus Supplements
price: 85.00
stockQuantity: 150
dosageForm: tablet
strength: 1000mg
expiryDate: 2026-06-30T00:00:00.000Z
image: [Select File] (Choose a local image file)
```

### 10. Update Medicine (with Optional Image Upload)
**Method**: `PATCH`  
**URL**: `{{baseUrl}}/medicines/{{medicineId}}`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```
**Body** (form-data):
```
price: 50.00
stockQuantity: 180
description: Updated description: Premium pain reliever and fever reducer with enhanced effectiveness.
image: [Select File] (Optional - Choose a new image file)
```

**Note**: 
- Use `form-data` instead of `raw JSON` in Postman
- The `image` field is optional - only include it if you want to update the medicine image
- If you include an image, it will replace the existing image
- If you don't include an image, the existing image will be preserved

### 11. Delete Medicine
**Method**: `DELETE`  
**URL**: `{{baseUrl}}/medicines/{{medicineId}}`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```

### 12. Get All Orders (Medical Owner)
**Method**: `GET`  
**URL**: `{{baseUrl}}/medicines/orders/all`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```

**Query Parameters** (optional):
- `status`: `pending`
- `paymentStatus`: `completed`

**Example URL with filters**:
```
{{baseUrl}}/medicines/orders/all?status=pending&paymentStatus=pending
```

### 13. Update Order Status
**Method**: `PATCH`  
**URL**: `{{baseUrl}}/medicines/order/{{orderId}}/status`  
**Headers**: 
```
Content-Type: application/json
Authorization: Bearer {{medicalOwnerToken}}
```
**Body** (raw JSON):
```json
{
  "status": "confirmed"
}
```

**Valid Status Values**:
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### 14. Get Medicine Statistics
**Method**: `GET`  
**URL**: `{{baseUrl}}/medicines/stats`  
**Headers**: 
```
Authorization: Bearer {{medicalOwnerToken}}
```

---

## User Order Endpoints

### 15. Create Order (User)
**Method**: `POST`  
**URL**: `{{baseUrl}}/medicines/order`  
**Headers**: 
```
Content-Type: application/json
Authorization: Bearer {{userToken}}
```
**Body** (raw JSON):
```json
{
  "medicines": [
    {
      "medicine": "{{medicineId1}}",
      "quantity": 2
    },
    {
      "medicine": "{{medicineId2}}",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "789 Customer Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "notes": "Please deliver between 6 PM to 8 PM"
}
```

**Note**: Replace `{{medicineId1}}` and `{{medicineId2}}` with actual medicine IDs. Payment method is automatically set to "cod" (Cash on Delivery).

### 16. Create Simple Order
**Method**: `POST`  
**URL**: `{{baseUrl}}/medicines/order`  
**Headers**: 
```
Content-Type: application/json
Authorization: Bearer {{userToken}}
```
**Body** (raw JSON):
```json
{
  "medicines": [
    {
      "medicine": "{{medicineId1}}",
      "quantity": 3
    }
  ],
  "shippingAddress": {
    "street": "456 User Street",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  },
  "notes": "Standard delivery is fine"
}
```

### 17. Get User Orders
**Method**: `GET`  
**URL**: `{{baseUrl}}/medicines/orders`  
**Headers**: 
```
Authorization: Bearer {{userToken}}
```

### 18. Get Order by ID (User)
**Method**: `GET`  
**URL**: `{{baseUrl}}/medicines/order/{{orderId}}`  
**Headers**: 
```
Authorization: Bearer {{userToken}}
```

---

## Postman Environment Variables

Set up these variables in your Postman environment:

```
baseUrl: http://localhost:3000/api/v1
medicalOwnerToken: [token from medical owner login]
userToken: [token from user login]
medicineId1: [ID from first created medicine]
medicineId2: [ID from second created medicine]
orderId: [ID from created order]
```

---

## Testing Flow

1. **Setup**: Register medical owner and user accounts
2. **Login**: Get tokens for both accounts
3. **Create Medicines**: Use medical owner token to create 2-3 medicines
4. **View Medicines**: Test public endpoints to view medicines
5. **Create Orders**: Use user token to create orders
6. **Manage Orders**: Use medical owner token to view and update order statuses
7. **View Statistics**: Check medicine statistics as medical owner

---

## Expected Responses

### Successful Medicine Creation
```json
{
  "statusCode": 201,
  "data": {
    "_id": "65e8a2b0c1d2e3f4a5b6c7d8",
    "name": "Paracetamol 500mg",
    "price": 45,
    "stockQuantity": 200,
    "createdBy": "65e8a1b0c1d2e3f4a5b6c7d7"
  },
  "message": "Medicine created successfully"
}
```

### Successful Order Creation
```json
{
  "statusCode": 201,
  "data": {
    "_id": "65e8a3b0c1d2e3f4a5b6c7d9",
    "totalAmount": 210,
    "status": "pending",
    "paymentStatus": "pending"
  },
  "message": "Order created successfully"
}
```

### Error Response (Unauthorized)
```json
{
  "statusCode": 403,
  "message": "Access denied. Only medical owners can perform this action"
}
```

---

## Common Error Scenarios to Test

1. **Unauthorized Access**: Try accessing medical owner endpoints with user token
2. **Invalid Medicine ID**: Use non-existent medicine ID in orders
3. **Insufficient Stock**: Order more quantity than available stock
4. **Invalid Status**: Try updating order with invalid status
5. **Expired Token**: Use expired or invalid token

---

## Image Upload Features

### Supported Image Formats
- **JPG/JPEG**: Most common format, good compression
- **PNG**: Good for images with transparency
- **GIF**: Animated images supported
- **WebP**: Modern format with excellent compression

### File Size Limits
- **Maximum file size**: 5MB per image
- **Recommended size**: 1-2MB for optimal performance

### Image Storage
- Images are stored in `uploads/medicines/` directory
- Files are automatically renamed with unique timestamps
- Images are served via `/uploads/medicines/filename` URL
- Example: `http://localhost:3000/uploads/medicines/medicine-1703123456789-123456789.jpg`

### Postman Setup for Image Upload
1. **Select Body Type**: Choose `form-data` instead of `raw JSON`
2. **Add Image Field**: Create a field named `image` with type `File`
3. **Select File**: Click "Select Files" and choose your local image
4. **Other Fields**: Add all other medicine data as text fields

### Image URL in Responses
When you create or update a medicine with an image, the response will include:
```json
{
  "imageUrl": "/uploads/medicines/medicine-1703123456789-123456789.jpg"
}
```

## Notes

- All timestamps are in ISO format
- Prices are in the smallest currency unit (e.g., paise for INR)
- Medicine IDs and Order IDs are MongoDB ObjectIds
- Stock quantities are automatically decremented when orders are created
- Payment method is automatically set to "cod" (Cash on Delivery)
- Order status can only be updated by medical owners
- Uploaded images are automatically served by the Express static middleware
