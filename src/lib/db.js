// In-memory database (backend storage)
// Data is stored here first, then synced to Firebase

const db = {
  users: [],
  inquiries: [],
  otps: new Map(), // Store OTPs temporarily
};

// ===== USER OPERATIONS =====

export const findUserByPhone = (phone) => {
  return db.users.find(user => user.phone === phone);
};

export const createUser = (userData) => {
  const user = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.users.push(user);
  return user;
};

export const validateUserCredentials = (phone, password) => {
  const user = findUserByPhone(phone);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
};

// ===== OTP OPERATIONS =====

export const storeOtp = (phone, otp) => {
  const data = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  db.otps.set(phone, data);
  return data;
};

export const verifyOtp = (phone, otp) => {
  const data = db.otps.get(phone);
  if (!data) return false;
  if (data.expiresAt < Date.now()) {
    db.otps.delete(phone);
    return false;
  }
  if (data.otp !== otp) return false;
  db.otps.delete(phone); // Clear OTP after verification
  return true;
};

// ===== INQUIRY OPERATIONS =====

export const createInquiry = (inquiryData) => {
  const inquiry = {
    id: Date.now().toString(),
    ...inquiryData,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.inquiries.push(inquiry);
  return inquiry;
};

export const getAllInquiries = () => {
  return db.inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getInquiryById = (id) => {
  return db.inquiries.find(inquiry => inquiry.id === id);
};

export const updateInquiry = (id, updates) => {
  const index = db.inquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return null;
  db.inquiries[index] = {
    ...db.inquiries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return db.inquiries[index];
};

export const deleteInquiry = (id) => {
  const index = db.inquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return false;
  db.inquiries.splice(index, 1);
  return true;
};

// Debug function to see current state
export const getDbState = () => ({
  users: db.users.length,
  inquiries: db.inquiries.length,
  otps: db.otps.size,
});

export default db;
