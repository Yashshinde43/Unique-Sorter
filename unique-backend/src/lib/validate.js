export function isValidPhone(phone) {
  return typeof phone === 'string' && /^[6-9]\d{9}$/.test(phone);
}

export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

const ENQUIRY_FIELDS = [
  'name', 'customerName', 'millName', 'phone', 'mobile', 'email',
  'company', 'companyName', 'gst', 'address', 'location', 'city',
  'state', 'pincode', 'productInterest', 'model', 'size', 'capacity',
  'commodity', 'quantity', 'source', 'message', 'notes', 'status',
  'requirement', 'budget', 'hasRequirement', 'items', 'remarks',
  'futureNote', 'followUpDate', 'probableMonth', 'orderChances',
];

const QUOTATION_FIELDS = [
  'enquiryId', 'quotationType', 'customerName', 'companyName', 'phone',
  'email', 'address', 'city', 'state', 'gst', 'items', 'terms', 'notes',
  'total', 'discount', 'tax', 'grandTotal', 'validUntil', 'status',
  'quotNo', 'savedAt', 'contact', 'salutation', 'company', 'mobile',
  'addr1', 'addr2', 'model', 'shortName', 'descLine1', 'descLine2',
  'hsn', 'qty', 'basePrice', 'gstRate', 'gstAmt', 'noteExcl', 'refNo',
  'refDate', 'quotDate', 'commodity', 'payTerms', 'delivery',
  'dispatchTime', 'electricity', 'validity', 'freight', 'warranty',
  'cancellation', 'productId', 'companyPrefix', 'gstin',
  'deliveryFrom', 'deliveryTo', 'quotationValidity',
];

function cleanBody(body, allowedFields) {
  const cleaned = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      cleaned[key] = typeof body[key] === 'string' ? sanitize(body[key]) : body[key];
    }
  }
  return cleaned;
}

export function validateEnquiryBody(body) {
  return cleanBody(body, ENQUIRY_FIELDS);
}

export function validateQuotationBody(body) {
  return cleanBody(body, QUOTATION_FIELDS);
}
