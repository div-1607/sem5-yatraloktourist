const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/yatralok').then(async () => {
  const tourists = [
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      password: 'Tourist@123',
      role: 'tourist',
      isVerified: true,
      age: 28,
      gender: 'Male',
      mobile: '+91 98765 43210',
      city: 'Delhi NCR',
      address: 'Connaught Place, Central Delhi',
      digitalId: 'YL-IND-2026-RV01',
    },
    {
      name: 'Priya Sharma',
      email: 'tourist@yatralok.com',
      password: 'Tourist@123',
      role: 'tourist',
      isVerified: true,
      age: 26,
      gender: 'Female',
      mobile: '+91 98111 22334',
      city: 'Jaipur',
      address: 'MI Road, Jaipur, Rajasthan',
      digitalId: 'YL-IND-2026-PS02',
    }
  ];

  for (const t of tourists) {
    const existing = await User.findOne({ email: t.email });
    if (!existing) {
      await User.create(t);
      console.log('Created tourist user:', t.email);
    } else {
      existing.password = t.password;
      existing.isVerified = true;
      if (!existing.digitalId) existing.digitalId = t.digitalId;
      await existing.save();
      console.log('Updated tourist user:', t.email);
    }
  }

  console.log('Demo tourist accounts ready!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
