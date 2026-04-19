'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QuotationForm  from '@/components/QuotationForm';
import QuotationForm2 from '@/components/QuotationForm2';

function QuotationNewInner() {
  const params        = useSearchParams();
  const enquiryId     = params.get('enquiryId') || null;
  const quotationType = params.get('type') || null;

  if (quotationType === 'detailed') {
    return <QuotationForm2 enquiryId={enquiryId} quotationType={quotationType} />;
  }
  return <QuotationForm enquiryId={enquiryId} quotationType={quotationType} />;
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={null}>
      <QuotationNewInner />
    </Suspense>
  );
}
