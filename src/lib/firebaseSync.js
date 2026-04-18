// This module syncs data from backend to Firebase
// All data is stored in backend first, then synced to Firebase

import { db, checkFirestoreAccess } from './firebase';
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
    // Check if Firestore is accessible
    const isAccessible = await checkFirestoreAccess();
    if (!isAccessible) {
      console.warn('Firestore not accessible. User not synced.');
      return false;
    }

    // Store user in 'userdata' collection with phone as document ID
    // Include password for authentication
    const userRef = doc(db, 'userdata', user.phone);
    await setDoc(userRef, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      syncedAt: serverTimestamp(),
    });
    console.log('User synced to Firebase userdata:', user.phone);
    return true;
  } catch (error) {
    console.error('Error syncing user to Firebase:', error);
    return false;
  }
};

// ===== SYNC INQUIRIES TO FIREBASE =====

export const syncInquiryToFirebase = async (inquiry) => {
  try {
    // Check if Firestore is accessible
    const isAccessible = await checkFirestoreAccess();
    if (!isAccessible) {
      console.warn('Firestore not accessible. Inquiry not synced.');
      return false;
    }

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
    // Check if Firestore is accessible
    const isAccessible = await checkFirestoreAccess();
    if (!isAccessible) {
      console.warn('Firestore not accessible. Inquiry not added to Firebase.');
      return null;
    }

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
    // Check if Firestore is accessible
    const isAccessible = await checkFirestoreAccess();
    if (!isAccessible) {
      console.warn('Firestore not accessible. Inquiry not updated in Firebase.');
      return false;
    }

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
    // Check if Firestore is accessible
    const isAccessible = await checkFirestoreAccess();
    if (!isAccessible) {
      console.warn('Firestore not accessible. Inquiry not deleted from Firebase.');
      return false;
    }

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
