# Medicine Image Upload Feature

This document describes the image upload functionality implemented for the medical shop API.

## 🖼️ Overview

The medical shop now supports uploading local images when creating or updating medicines. Images are stored on the server and served via HTTP endpoints.

## 📁 File Structure

```
user-service/
├── uploads/
│   └── medicines/          # Medicine images stored here
├── middlewares/
│   └── upload.middleware.js # File upload handling
├── app.js                  # Static file serving
└── .gitignore             # Excludes uploads/ directory
```

## 🛠️ Implementation Details

### 1. Dependencies Added
- **multer**: File upload middleware for Express.js
- **form-data**: For testing file uploads

### 2. File Upload Middleware (`middlewares/upload.middleware.js`)

**Features:**
- **Storage**: Files saved to `uploads/medicines/` directory
- **Naming**: Unique filenames with timestamps (e.g., `medicine-1703123456789-123456789.jpg`)
- **Validation**: Only image files allowed (JPG, PNG, GIF, WebP)
- **Size Limit**: Maximum 5MB per file
- **Error Handling**: Comprehensive error responses for various upload issues

**Key Functions:**
```javascript
// Single image upload
export const uploadMedicineImage = upload.single("image");

// Multiple images (for future use)
export const uploadMultipleImages = upload.array("images", 5);

// Error handling
export const handleUploadError = (error, req, res, next) => { ... };
```

### 3. Static File Serving (`app.js`)

```javascript
app.use("/uploads", express.static("uploads"));
```

This allows images to be accessed via URLs like:
`http://localhost:3000/uploads/medicines/medicine-1703123456789-123456789.jpg`

### 4. Controller Updates

**Medicine Creation:**
- Accepts both form-data (with image) and JSON (without image)
- Automatically sets `imageUrl` when file is uploaded
- Preserves existing `imageUrl` if no file is uploaded

**Medicine Update:**
- Optional image upload during updates
- Replaces existing image if new one is provided
- Preserves existing image if no new file is uploaded

## 📋 API Endpoints

### Create Medicine with Image
```http
POST /api/v1/medicines/create
Content-Type: multipart/form-data
Authorization: Bearer <medicalOwnerToken>

Form Data:
- name: "Medicine Name"
- description: "Medicine description"
- category: "painkiller"
- manufacturer: "Pharma Co"
- price: "25.50"
- stockQuantity: "100"
- dosageForm: "tablet"
- strength: "500mg"
- expiryDate: "2025-12-31T00:00:00.000Z"
- image: [File Upload]
```

### Update Medicine with Image
```http
PATCH /api/v1/medicines/:medicineId
Content-Type: multipart/form-data
Authorization: Bearer <medicalOwnerToken>

Form Data:
- price: "30.00" (optional)
- stockQuantity: "150" (optional)
- description: "Updated description" (optional)
- image: [File Upload] (optional)
```

## 🧪 Testing

### 1. Using Postman
1. **Select Body Type**: Choose `form-data`
2. **Add Fields**: Add all medicine data as text fields
3. **Add Image**: Create field named `image` with type `File`
4. **Select File**: Choose a local image file
5. **Send Request**: Submit the request

### 2. Using Test Script
Run the provided test script:
```bash
node test-image-upload.js
```

This script:
- Registers a medical owner
- Logs in to get authentication token
- Creates a test image file
- Uploads medicine with image
- Verifies image accessibility
- Fetches medicines to confirm image URL

## 🔒 Security Features

### File Validation
- **Type Check**: Only image MIME types allowed
- **Size Limit**: 5MB maximum file size
- **Extension Validation**: Automatic file extension preservation

### Error Handling
- **File Size Exceeded**: Clear error message with size limit
- **Invalid File Type**: Specific error for non-image files
- **Upload Failures**: Graceful error handling with meaningful messages

### Access Control
- **Authentication Required**: Only authenticated medical owners can upload
- **Role Verification**: Only users with `medicalOwner` role can upload images

## 📊 File Management

### Storage Location
- **Directory**: `uploads/medicines/`
- **Naming Convention**: `medicine-{timestamp}-{random}.{extension}`
- **Example**: `medicine-1703123456789-123456789.jpg`

### URL Structure
- **Base URL**: `http://localhost:3000/uploads/medicines/`
- **Full URL**: `http://localhost:3000/uploads/medicines/medicine-1703123456789-123456789.jpg`

### Database Storage
- **Field**: `imageUrl` in Medicine model
- **Format**: `/uploads/medicines/filename.jpg`
- **Example Response**:
```json
{
  "imageUrl": "/uploads/medicines/medicine-1703123456789-123456789.jpg"
}
```

## 🚀 Usage Examples

### 1. Create Medicine with Image (Postman)
```
Method: POST
URL: http://localhost:3000/api/v1/medicines/create
Headers: 
  Authorization: Bearer <token>
Body: form-data
  name: "Paracetamol 500mg"
  description: "Pain reliever"
  category: "painkiller"
  manufacturer: "ABC Pharma"
  price: "25.50"
  stockQuantity: "100"
  dosageForm: "tablet"
  strength: "500mg"
  expiryDate: "2025-12-31T00:00:00.000Z"
  image: [Select File]
```

### 2. Update Medicine Image (Postman)
```
Method: PATCH
URL: http://localhost:3000/api/v1/medicines/:medicineId
Headers:
  Authorization: Bearer <token>
Body: form-data
  price: "30.00"
  image: [Select New File]
```

### 3. Access Uploaded Image
```
GET http://localhost:3000/uploads/medicines/medicine-1703123456789-123456789.jpg
```

## ⚠️ Important Notes

### File Cleanup
- Uploaded files are not automatically deleted
- Consider implementing cleanup for deleted medicines
- Monitor disk space usage

### Production Considerations
- **Cloud Storage**: Consider using AWS S3, Google Cloud Storage, etc.
- **CDN**: Use CDN for better image delivery performance
- **Image Optimization**: Implement image compression and resizing
- **Backup**: Regular backups of uploaded files

### Security Best Practices
- **Virus Scanning**: Implement virus scanning for uploaded files
- **File Type Validation**: Additional server-side validation
- **Rate Limiting**: Limit upload frequency per user
- **Access Logging**: Log all file access for security monitoring

## 🔧 Troubleshooting

### Common Issues

1. **"Only image files are allowed"**
   - Ensure file is actually an image (JPG, PNG, GIF, WebP)
   - Check file extension and MIME type

2. **"File size too large"**
   - Reduce image file size (max 5MB)
   - Compress image before uploading

3. **"Unexpected file field"**
   - Ensure field name is exactly `image`
   - Check form-data structure in Postman

4. **Image not accessible**
   - Verify server is running
   - Check file permissions on uploads directory
   - Confirm static file serving is configured

### Debug Steps
1. Check server logs for upload errors
2. Verify file exists in `uploads/medicines/` directory
3. Test image URL directly in browser
4. Confirm authentication and authorization

## 📈 Future Enhancements

### Planned Features
- **Image Resizing**: Automatic thumbnail generation
- **Multiple Images**: Support for multiple images per medicine
- **Image Cropping**: Client-side image editing
- **Watermarking**: Automatic watermark addition
- **Cloud Storage**: Integration with cloud storage services

### Performance Optimizations
- **Image Compression**: Automatic compression for better performance
- **Caching**: Implement image caching strategies
- **Lazy Loading**: Optimize image loading for large catalogs
