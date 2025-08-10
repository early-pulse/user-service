import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000/api/v1";

// Test image upload functionality
async function testImageUpload() {
  try {
    console.log("🧪 Testing Medicine Image Upload...\n");

    // Step 1: Register a medical owner
    console.log("1. Registering medical owner...");
    const registerResponse = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Medical Owner",
        email: "testmedical@example.com",
        phoneNumber: "9876543210",
        address: "123 Test Street",
        emergencyContactNumber: "9876543211",
        password: "test123!",
        role: "medicalOwner",
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.log("Registration failed:", error.message);
      return;
    }

    console.log("✅ Medical owner registered successfully\n");

    // Step 2: Login to get token
    console.log("2. Logging in...");
    const loginResponse = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "testmedical@example.com",
        password: "test123!",
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log("Login failed:", error.message);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log("✅ Login successful\n");

    // Step 3: Create a test image file (if it doesn't exist)
    const testImagePath = "./test-image.jpg";
    if (!fs.existsSync(testImagePath)) {
      console.log("3. Creating test image file...");
      // Create a simple 1x1 pixel JPEG file for testing
      const jpegHeader = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
        0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
        0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
        0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
        0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xff, 0xc4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x0c,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, 0x8a, 0x00,
        0xff, 0xd9,
      ]);
      fs.writeFileSync(testImagePath, jpegHeader);
      console.log("✅ Test image created\n");
    } else {
      console.log("3. Test image already exists\n");
    }

    // Step 4: Create medicine with image upload
    console.log("4. Creating medicine with image upload...");
    const formData = new FormData();
    formData.append("name", "Test Medicine with Image");
    formData.append("description", "A test medicine with uploaded image");
    formData.append("category", "painkiller");
    formData.append("manufacturer", "Test Pharmaceuticals");
    formData.append("price", "25.50");
    formData.append("stockQuantity", "100");
    formData.append("dosageForm", "tablet");
    formData.append("strength", "500mg");
    formData.append("expiryDate", "2025-12-31T00:00:00.000Z");
    formData.append("image", fs.createReadStream(testImagePath));

    const createResponse = await fetch(`${BASE_URL}/medicines/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.log("❌ Medicine creation failed:", error.message);
      return;
    }

    const medicineData = await createResponse.json();
    console.log("✅ Medicine created successfully!");
    console.log("Medicine ID:", medicineData.data._id);
    console.log("Image URL:", medicineData.data.imageUrl);
    console.log("");

    // Step 5: Verify the image is accessible
    console.log("5. Verifying image accessibility...");
    const imageUrl = `http://localhost:3000${medicineData.data.imageUrl}`;
    const imageResponse = await fetch(imageUrl);
    
    if (imageResponse.ok) {
      console.log("✅ Image is accessible at:", imageUrl);
    } else {
      console.log("❌ Image is not accessible");
    }

    // Step 6: Get all medicines to see the uploaded image
    console.log("\n6. Fetching all medicines...");
    const medicinesResponse = await fetch(`${BASE_URL}/medicines/all`);
    
    if (medicinesResponse.ok) {
      const medicinesData = await medicinesResponse.json();
      console.log("✅ Found", medicinesData.data.length, "medicines");
      const medicineWithImage = medicinesData.data.find(m => m._id === medicineData.data._id);
      if (medicineWithImage) {
        console.log("Medicine with image:", {
          name: medicineWithImage.name,
          imageUrl: medicineWithImage.imageUrl,
        });
      }
    }

    console.log("\n🎉 Image upload test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testImageUpload();
