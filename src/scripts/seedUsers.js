// Seed script to create initial users
// Run this to create default users for testing

const { createUser, findUserByPhone } = require('../lib/db');

const seedUsers = () => {
  // Check if admin exists
  let admin = findUserByPhone('9876543210');
  if (!admin) {
    admin = createUser({
      name: 'Admin User',
      phone: '9876543210',
      email: 'admin@uniquesorter.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Created admin user:', admin.phone);
  }

  // Check if test user exists
  let user = findUserByPhone('9123456789');
  if (!user) {
    user = createUser({
      name: 'Test User',
      phone: '9123456789',
      email: 'user@uniquesorter.com',
      password: 'user123',
      role: 'user',
    });
    console.log('Created test user:', user.phone);
  }

  console.log('Seed complete!');
  console.log('');
  console.log('Login Credentials:');
  console.log('Admin - Phone: 9876543210, Password: admin123');
  console.log('User  - Phone: 9123456789, Password: user123');
};

// If running directly
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers };
