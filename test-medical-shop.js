// Test script for medical shop functionality
// This script can be used to test the medical shop API endpoints

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/v1';
let accessToken = '';
let medicineId = '';
let orderId = '';

// Test data
const testMedicine = {
  name: "Test Medicine 500mg",
  description: "A test medicine for testing purposes",
  category: "painkiller",
  manufacturer: "Test Pharma",
  price: 100.00,
  stockQuantity: 50,
  prescriptionRequired: false,
  dosageForm: "tablet",
  strength: "500mg",
  expiryDate: "2025-12-31"
};

const testOrder = {
  medicines: [
    {
      medicine: "", // Will be set after creating medicine
      quantity: 2
    }
  ],
  shippingAddress: {
    street: "123 Test Street",
    city: "Test City",
    state: "Test State",
    zipCode: "123456"
  },
  paymentMethod: "cod"
};

// Helper function to make API calls
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`${options.method || 'GET'} ${endpoint} - Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.message);
    throw error;
  }
}

// Test functions
async function testMedicalShop() {
  console.log('=== Medical Shop API Test ===\n');

  try {
    // 1. Test getting all medicines (public endpoint)
    console.log('1. Testing GET /medicines/all (public)');
    await makeRequest('/medicines/all');
    console.log('');

    // 2. Test creating medicine (requires medicalOwner token)
    console.log('2. Testing POST /medicines/create (requires medicalOwner)');
    console.log('Note: This requires a valid medicalOwner token');
    console.log('You can test this manually with a valid token\n');

    // 3. Test getting medicine by ID (public endpoint)
    console.log('3. Testing GET /medicines/:medicineId (public)');
    console.log('Note: This requires a valid medicine ID');
    console.log('You can test this manually with a valid medicine ID\n');

    // 4. Test creating order (requires user token)
    console.log('4. Testing POST /medicines/order (requires user token)');
    console.log('Note: This requires a valid user token');
    console.log('You can test this manually with a valid token\n');

    // 5. Test getting user orders (requires user token)
    console.log('5. Testing GET /medicines/orders (requires user token)');
    console.log('Note: This requires a valid user token');
    console.log('You can test this manually with a valid token\n');

    console.log('=== Test completed ===');
    console.log('\nTo run actual tests, you need to:');
    console.log('1. Start the server: npm start');
    console.log('2. Get a valid JWT token by logging in');
    console.log('3. Update the accessToken variable in this script');
    console.log('4. Run the script again');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Example usage with token (uncomment and update with actual token)
/*
async function testWithToken() {
  // Update this with your actual token
  accessToken = 'YOUR_JWT_TOKEN_HERE';
  
  console.log('=== Testing with token ===\n');

  try {
    // Test creating medicine
    const { data: medicineData } = await makeRequest('/medicines/create', {
      method: 'POST',
      body: JSON.stringify(testMedicine)
    });

    if (medicineData.success) {
      medicineId = medicineData.data._id;
      console.log(`Medicine created with ID: ${medicineId}\n`);

      // Test creating order
      testOrder.medicines[0].medicine = medicineId;
      const { data: orderData } = await makeRequest('/medicines/order', {
        method: 'POST',
        body: JSON.stringify(testOrder)
      });

      if (orderData.success) {
        orderId = orderData.data._id;
        console.log(`Order created with ID: ${orderId}\n`);

        // Test getting user orders
        await makeRequest('/medicines/orders');
      }
    }
  } catch (error) {
    console.error('Test with token failed:', error.message);
  }
}
*/

// Run the test
testMedicalShop(); 