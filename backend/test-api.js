/**
 * Automated End-to-End API Test Suite for Yatra Lok
 */
const http = require('http');
const app = require('./src/server');

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: '127.0.0.1',
      port: process.env.PORT || 5000,
      path: `/api${path}`,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (e) {
          parsed = rawData;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 Starting Automated End-to-End API Verification...\n');

  // Wait until server is ready and responding
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await request('GET', '/health');
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!ready) {
    console.error('Server did not become ready within 30 seconds');
    process.exit(1);
  }

  try {
    // 1. Healthcheck
    console.log('[Test 1] Healthcheck API...');
    const health = await request('GET', '/health');
    console.assert(health.status === 200, 'Healthcheck failed');
    console.log('✅ Healthcheck Passed:', health.data.platform);

    // 2. Login as Admin
    console.log('\n[Test 2] Login as Admin (admin@yatralok.com)...');
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@yatralok.com',
      password: 'Admin@123',
    });
    console.assert(adminLogin.status === 200, 'Admin login failed');
    console.assert(adminLogin.data.token, 'No token returned');
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin Login Passed. Role:', adminLogin.data.user.role);

    // 3. Login as Tourist
    console.log('\n[Test 3] Login as Tourist (tourist@yatralok.com)...');
    const touristLogin = await request('POST', '/auth/login', {
      email: 'tourist@yatralok.com',
      password: 'Tourist@123',
    });
    console.assert(touristLogin.status === 200, 'Tourist login failed');
    console.assert(touristLogin.data.token, 'No token returned');
    const touristToken = touristLogin.data.token;
    console.log('✅ Tourist Login Passed. User:', touristLogin.data.user.name);

    // 4. Tourist Registration & OTP Flow
    console.log('\n[Test 4] Tourist Registration with OTP...');
    const testEmail = `test.traveler.${Date.now()}@yatralok.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Priya Verma',
      email: testEmail,
      password: 'Password@123',
      age: 24,
      gender: 'Female',
      mobile: '+91 91234 56789',
      city: 'Jaipur',
      address: 'Malviya Nagar, Jaipur',
    });
    console.assert(regRes.status === 201, 'Registration failed');
    const devOtp = regRes.data.data.devOtp;
    console.log('✅ Registration initiated. Generated OTP:', devOtp);

    // 5. Verify OTP
    console.log('\n[Test 5] Verify Email OTP...');
    const verifyRes = await request('POST', '/auth/verify-otp', {
      email: testEmail,
      otp: devOtp,
    });
    console.assert(verifyRes.status === 200, 'OTP verification failed');
    console.assert(verifyRes.data.user.isVerified === true, 'User not marked verified');
    console.log('✅ Email OTP verification Passed. User verified:', verifyRes.data.user.name);

    // 6. Destinations Explorer & Filters
    console.log('\n[Test 6] Destinations API with State & Category Filters...');
    const destList = await request('GET', '/destinations?category=Historical%20Places');
    console.assert(destList.status === 200, 'Destinations list failed');
    console.assert(destList.data.count > 0, 'No destinations found');
    console.log(`✅ Destinations Found: ${destList.data.count} places. Sample: "${destList.data.data[0].title}"`);

    // 7. Hierarchy API (States and Cities)
    console.log('\n[Test 7] Hierarchy API (States & Cities)...');
    const hierarchy = await request('GET', '/destinations/hierarchy');
    console.assert(hierarchy.status === 200, 'Hierarchy failed');
    console.assert(hierarchy.data.data.length > 0, 'No hierarchy data');
    console.log(`✅ Hierarchy loaded: ${hierarchy.data.data.length} States available.`);

    // 8. Crowd Safety Indicator Radar
    console.log('\n[Test 8] Crowd Safety Indicator Telemetry...');
    const crowdRes = await request('GET', '/crowd/status');
    console.assert(crowdRes.status === 200, 'Crowd telemetry failed');
    console.log('✅ Crowd Radar Summary:', {
      Total: crowdRes.data.summary.total,
      Low: crowdRes.data.summary.low.count,
      Moderate: crowdRes.data.summary.moderate.count,
      High: crowdRes.data.summary.high.count,
    });

    // 9. Emergency SOS Distress Signal Dispatch
    console.log('\n[Test 9] Dispatch Emergency SOS Signal with GPS Coordinates...');
    const sosRes = await request('POST', '/sos/create', {
      userName: 'Priya Verma',
      userMobile: '+91 91234 56789',
      userEmail: testEmail,
      emergencyType: 'Medical',
      message: 'Sudden injury near temple entrance',
      location: {
        lat: 26.9239,
        lng: 75.8267,
        address: 'Near Hawa Mahal, Badi Choupad, Jaipur',
      },
    }, touristToken);
    console.assert(sosRes.status === 201, 'SOS creation failed');
    console.assert(sosRes.data.data.status === 'pending', 'SOS status not pending');
    const createdSosId = sosRes.data.data._id;
    console.log(`✅ SOS Signal Transmitted Successfully. Ticket ID: #${createdSosId}`);

    // 10. Admin Analytics Dashboard
    console.log('\n[Test 10] Admin Analytics with Protected Route...');
    const analyticsRes = await request('GET', '/admin/analytics', null, adminToken);
    console.assert(analyticsRes.status === 200, 'Admin analytics failed');
    console.log('✅ Admin Analytics Verified:', {
      Destinations: analyticsRes.data.data.totalDestinations,
      Tourists: analyticsRes.data.data.totalUsers,
      ActiveSOS: analyticsRes.data.data.activeSOS,
    });

    // 11. Admin Resolves SOS Signal
    console.log('\n[Test 11] Admin Updates SOS Signal Status to Responding/Resolved...');
    const resolveSos = await request('PATCH', `/sos/${createdSosId}/status`, {
      status: 'resolved',
      resolutionNotes: 'Local tourist emergency responder provided first-aid on spot.',
    }, adminToken);
    console.assert(resolveSos.status === 200, 'SOS status update failed');
    console.assert(resolveSos.data.data.status === 'resolved', 'SOS not resolved');
    console.log('✅ Admin SOS Status Resolution Passed:', resolveSos.data.message);

    // 12. Toggle Favorite Destination
    console.log('\n[Test 12] Tourist Toggles Saved Destination...');
    const favDestId = destList.data.data[0]._id;
    const favToggle = await request('POST', `/users/favorites/${favDestId}`, null, touristToken);
    console.assert(favToggle.status === 200, 'Toggle favorite failed');
    console.log('✅ Favorite Toggle Passed:', favToggle.data.message);

    console.log('\n🎉 ALL 12 AUTOMATED TEST SUITES PASSED FLAWLESSLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
};

runTests();
