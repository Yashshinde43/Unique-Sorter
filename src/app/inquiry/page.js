'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function InquiryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    company: '',
    productInterest: '',
    quantity: '',
    message: '',
    source: '',
  });



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Flow: Frontend → Backend → Firebase (store inquiry)
      const response = await axios.post('/api/inquiries', formData);

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          customerName: '',
          phone: '',
          email: '',
          company: '',
          productInterest: '',
          quantity: '',
          message: '',
          source: '',
        });
      } else {
        alert('Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Submit inquiry error:', error);
      alert(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 style={styles.successTitle}>Inquiry Submitted!</h2>
          <p style={styles.successText}>
            Thank you for your inquiry. Our team will get back to you shortly.
          </p>
          <div style={styles.buttonGroup}>
            <button onClick={() => setSuccess(false)} style={styles.button}>
              Submit Another Inquiry
            </button>
            <button onClick={() => router.push('/dashboard')} style={styles.secondaryButton}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.headerTitle}>New Inquiry</h1>
          <p style={styles.headerSubtitle}>Create a new customer inquiry</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          {/* Customer Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Customer Information</h3>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <div style={styles.phoneInputWrapper}>
                  <span style={styles.countryCode}>+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    style={{...styles.input, ...styles.phoneInput}}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Inquiry Details Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Inquiry Details</h3>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Product Interest *</label>
                <select
                  name="productInterest"
                  value={formData.productInterest}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select a product</option>
                  <option value="color-sorter">Color Sorter</option>
                  <option value="grain-cleaner">Grain Cleaner</option>
                  <option value="destoner">Destoner</option>
                  <option value="grader">Grader</option>
                  <option value="packing-machine">Packing Machine</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  style={styles.input}
                  min="1"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select source</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social-media">Social Media</option>
                  <option value="trade-show">Trade Show</option>
                  <option value="cold-call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{...styles.inputGroup, marginTop: '20px'}}>
              <label style={styles.label}>Message / Requirements</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter detailed requirements or message..."
                style={styles.textarea}
                rows="4"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={styles.secondaryButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Submitting...
                </>
              ) : (
                'Submit Inquiry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f4f6fb',
    padding: '28px',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  headerLeft: {},
  headerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '26px',
    fontWeight: 700,
    color: '#0f1923',
    margin: '0 0 6px 0',
    letterSpacing: '-0.4px',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#8898aa',
    margin: 0,
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: '#ffffff',
    border: '1px solid #e8ecf4',
    borderRadius: '10px',
    color: '#5a6a7e',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "inherit",
    transition: 'all 0.2s ease',
  },
  card: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8ecf4',
    boxShadow: '0 4px 16px rgba(15,25,35,0.08)',
    padding: '32px',
  },
  successCard: {
    maxWidth: '500px',
    margin: '100px auto',
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e8ecf4',
    boxShadow: '0 4px 16px rgba(15,25,35,0.08)',
    padding: '48px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid #e8ecf4',
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f1923',
    margin: '0 0 20px 0',
    letterSpacing: '-0.2px',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#0f1923',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "inherit",
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  phoneInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  countryCode: {
    position: 'absolute',
    left: '14px',
    fontWeight: 600,
    color: '#1A37AA',
    fontSize: '14px',
    zIndex: 1,
  },
  phoneInput: {
    paddingLeft: '52px',
  },
  select: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#0f1923',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "inherit",
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%238898aa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: '40px',
  },
  textarea: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#0f1923',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "inherit",
    resize: 'vertical',
    minHeight: '100px',
    width: '100%',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  button: {
    padding: '12px 28px',
    background: '#1A37AA',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(26,55,170,0.25)',
    fontFamily: "inherit",
    transition: 'all 0.2s ease',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  secondaryButton: {
    padding: '12px 28px',
    background: '#ffffff',
    color: '#5a6a7e',
    border: '2px solid #e8ecf4',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "inherit",
    transition: 'all 0.2s ease',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  // Success State
  successIcon: {
    width: '80px',
    height: '80px',
    background: '#f0fdf4',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  successTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f1923',
    textAlign: 'center',
    margin: '0 0 12px 0',
  },
  successText: {
    fontSize: '15px',
    color: '#5a6a7e',
    textAlign: 'center',
    margin: '0 0 28px 0',
    lineHeight: '1.6',
  },
};
