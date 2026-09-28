const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'POST',
        headers,
      },
      (res) => {
        let respData = '';
        res.on('data', (c) => (respData += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'GET',
        headers,
      },
      (res) => {
        let respData = '';
        res.on('data', (c) => (respData += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- TEST 1: Admin Login ---');
  const adminLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'admin@yatralok.com',
    password: 'Admin@123',
  });
  console.log('Admin login status:', adminLogin.status, 'Success:', adminLogin.data?.success);
  const adminToken = adminLogin.data?.token;

  console.log('\n--- TEST 2: Check Active SOS (Must be 0) ---');
  const activeSOS = await get('http://localhost:5000/api/sos/active', adminToken);
  console.log('Active SOS list length:', activeSOS.data?.data?.length, '(Expected: 0)');

  console.log('\n--- TEST 3: Check Signed-in Users (Should NOT contain fake tourists) ---');
  const usersList = await get('http://localhost:5000/api/admin/signed-in-users', adminToken);
  console.log('Total users in DB:', usersList.data?.count);
  usersList.data?.data?.forEach((u) => {
    console.log(` - User: ${u.name} | Role: ${u.role} | Email: ${u.email}`);
  });

  console.log('\n--- TEST 4: Register a Real Tourist with Chosen Destination ---');
  const regRes = await post('http://localhost:5000/api/auth/register', {
    name: 'Devika Sharma',
    email: 'devika.pilgrim@gmail.com',
    password: 'Password@123',
    age: 28,
    gender: 'Female',
    mobile: '+91 98765 11223',
    city: 'Jaipur',
    address: '15 Gandhi Path, Vaishali Nagar',
    chosenDestination: 'Amer Fort, Jaipur',
  });
  console.log('Registration status:', regRes.status, 'Digital ID generated:', regRes.data?.data?.digitalId);
  const digitalId = regRes.data?.data?.digitalId;

  console.log('\n--- TEST 5: Verify Admin Sees Devika in Signed-In / Registered Users ---');
  const updatedUsers = await get('http://localhost:5000/api/admin/signed-in-users', adminToken);
  console.log('Updated user count in DB:', updatedUsers.data?.count);
  const devikaRecord = updatedUsers.data?.data?.find((u) => u.email === 'devika.pilgrim@gmail.com');
  console.log('Found Devika in Admin List:');
  console.log(' - Name:', devikaRecord?.name);
  console.log(' - Mobile:', devikaRecord?.mobile);
  console.log(' - Email:', devikaRecord?.email);
  console.log(' - Digital ID:', devikaRecord?.digitalId);
  console.log(' - Chosen Destination:', devikaRecord?.chosenDestination);

  console.log('\n--- TEST 6: Track Tourist by Digital ID ---');
  const trackRes = await get(`http://localhost:5000/api/admin/tourist/${digitalId}`, adminToken);
  console.log('Track result status:', trackRes.status);
  console.log('Tracked tourist name:', trackRes.data?.data?.tourist?.name);
  console.log('Tracked tourist chosen destination:', trackRes.data?.data?.tourist?.chosenDestination);

  console.log('\n--- TEST 7: Tourist Clicks SOS Button ---');
  const sosRes = await post(
    'http://localhost:5000/api/sos/create',
    {
      userName: devikaRecord.name,
      userMobile: devikaRecord.mobile,
      userEmail: devikaRecord.email,
      digitalId: devikaRecord.digitalId,
      location: {
        lat: 26.9855,
        lng: 75.8513,
        address: 'Amer Fort Courtyard, Jaipur',
      },
      emergencyType: 'Emergency SOS',
      message: 'Live GPS location distress signal transmitted to Admin Command Center.',
    }
  );
  console.log('SOS Created status:', sosRes.status, 'Success:', sosRes.data?.success);

  console.log('\n--- TEST 8: Check Active SOS in Admin (Now should be 1, triggering Siren) ---');
  const activeSOSAfter = await get('http://localhost:5000/api/sos/active', adminToken);
  console.log('Active SOS count:', activeSOSAfter.data?.data?.length);
  console.log('Distress Caller:', activeSOSAfter.data?.data?.[0]?.userName);
  console.log('Location:', activeSOSAfter.data?.data?.[0]?.location?.address);

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
