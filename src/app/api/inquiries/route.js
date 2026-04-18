import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// GET all inquiries from Firebase
export async function GET() {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const inquiries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new inquiry to Firebase
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { customerName, phone, productInterest } = body;
    if (!customerName || !phone || !productInterest) {
      return NextResponse.json(
        { message: 'Customer name, phone, and product interest are required' },
        { status: 400 }
      );
    }

    // Step 1: Store inquiry in Firebase
    const inquiryData = {
      ...body,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);

    console.log('Inquiry stored in Firebase:', docRef.id);

    return NextResponse.json({
      success: true,
      message: 'Inquiry created successfully',
      inquiry: {
        id: docRef.id,
        ...body,
        status: 'new',
      },
    });

  } catch (error) {
    console.error('Create inquiry error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update inquiry in Firebase
export async function PUT(request) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    const inquiryRef = doc(db, 'inquiries', id);
    await updateDoc(inquiryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry updated successfully',
    });

  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE inquiry from Firebase
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Inquiry ID is required' },
        { status: 400 }
      );
    }

    const inquiryRef = doc(db, 'inquiries', id);
    await deleteDoc(inquiryRef);

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });

  } catch (error) {
    console.error('Delete inquiry error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
