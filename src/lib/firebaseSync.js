// This module syncs data from backend to Firebase
// All data is stored in backend first, then synced to Firebase

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// ===== SYNC USERS TO FIREBASE =====

export const syncUserToFirebase = async (user) => {
  try {
    // Store user in Firebase (without password for security)
    const { password, ...userWithoutPassword } = user;
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...userWithoutPassword,
      syncedAt: serverTimestamp(),
    });
    console.log('User synced to Firebase:', user.id);
    return true;
  } catch (error) {
    console.error('Error syncing user to Firebase:', error);
    return false;
  }
};

// ===== SYNC INQUIRIES TO FIREBASE =====

export const syncInquiryToFirebase = async (inquiry) => {
  try {
    const inquiryRef = doc(db, 'inquiries', inquiry.id);
    await setDoc(inquiryRef, {
      ...inquiry,
      syncedAt: serverTimestamp(),
    });
    console.log('Inquiry synced to Firebase:', inquiry.id);
    return true;
  } catch (error) {
    console.error('Error syncing inquiry to Firebase:', error);
    return false;
  }
};

export const addInquiryToFirebase = async (inquiryData) => {
  try {
    // Add to Firebase with auto-generated ID
    const inquiriesRef = collection(db, 'inquiries');
    const docRef = await addDoc(inquiriesRef, {
      ...inquiryData,
      createdAt: serverTimestamp(),
      syncedAt: serverTimestamp(),
    });
    console.log('Inquiry added to Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding inquiry to Firebase:', error);
    return null;
  }
};

export const updateInquiryInFirebase = async (id, updates) => {
  try {
    const inquiryRef = doc(db, 'inquiries', id);
    await updateDoc(inquiryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      syncedAt: serverTimestamp(),
    });
    console.log('Inquiry updated in Firebase:', id);
    return true;
  } catch (error) {
    console.error('Error updating inquiry in Firebase:', error);
    return false;
  }
};

export const deleteInquiryFromFirebase = async (id) => {
  try {
    const inquiryRef = doc(db, 'inquiries', id);
    await deleteDoc(inquiryRef);
    console.log('Inquiry deleted from Firebase:', id);
    return true;
  } catch (error) {
    console.error('Error deleting inquiry from Firebase:', error);
    return false;
  }
};

// ===== BATCH SYNC (for initial sync or recovery) =====

export const syncAllDataToFirebase = async (backendData) => {
  const results = {
    users: { success: 0, failed: 0 },
    inquiries: { success: 0, failed: 0 },
  };

  // Sync users
  for (const user of backendData.users) {
    const success = await syncUserToFirebase(user);
    if (success) {
      results.users.success++;
    } else {
      results.users.failed++;
    }
  }

  // Sync inquiries
  for (const inquiry of backendData.inquiries) {
    const success = await syncInquiryToFirebase(inquiry);
    if (success) {
      results.inquiries.success++;
    } else {
      results.inquiries.failed++;
    }
  }

  console.log('Batch sync complete:', results);
  return results;
};

export default {
  syncUserToFirebase,
  syncInquiryToFirebase,
  addInquiryToFirebase,
  updateInquiryInFirebase,
  deleteInquiryFromFirebase,
  syncAllDataToFirebase,
};
