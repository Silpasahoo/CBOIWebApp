import React from 'react';
import ReactDOM from 'react-dom';

const ViewProfileDetailsModal = ({ isOpen, onClose, profileData }) => {
  if (!isOpen || !profileData) return null;

  // Helper: get value or N/A
  const val = (v) => (v !== undefined && v !== null && v !== '') ? v : 'N/A';

  // Extract fields
  const name            = val(profileData.name || profileData.merchant_name || profileData.userName);
  const phone           = val(profileData.merchant_mobile || profileData.mobile_number);
  const serialNumber    = val(profileData.serial_number || profileData.device_serial_number);
  const accountNumber   = val(profileData.merchant_account_no || profileData.account_number);
  const upiId           = val(profileData.vpa_id || profileData.upiId || profileData.upi_id);
  const ifscCode        = val(profileData.ifsc || profileData.ifscCode || profileData.ifsc_code);
  const deviceModelName = val(profileData.device_model_name || profileData.deviceModelName || profileData.modelName);
  const deviceMobile    = val(profileData.merchant_mobile || profileData.deviceMobileNumber || profileData.device_mobile_number);
  const networkType     = val(profileData.network_type || profileData.networkType);
  const deviceStatus    = val(profileData.status || profileData.deviceStatus || profileData.device_status);
  const batteryPct      = (profileData.battery_percentage || profileData.batteryPercentage)
    ? `${profileData.battery_percentage || profileData.batteryPercentage}%`
    : 'N/A';
  const networkStrength = val(profileData.network_strength || profileData.networkStrength);

  const Row = ({ label, value }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.4fr',
      gap: '8px',
      padding: '10px 0',
    }}>
      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{value}</span>
    </div>
  );

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Modal card — stop click propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Title ── */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            View Profile Details
          </h2>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px' }}>

          {/* Basic Information */}
          <div style={{ padding: '16px 0 4px' }}>
            <p style={{
              margin: '0 0 4px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#111827',
            }}>
              Basic Information
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0 4px' }} />
            <Row label="Name"  value={name} />
            <Row label="Phone" value={phone} />
          </div>

          {/* Device Information */}
          <div style={{ padding: '16px 0 8px' }}>
            <p style={{
              margin: '0 0 4px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#111827',
            }}>
              Device Information
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0 4px' }} />
            <Row label="Device Serial Number"  value={serialNumber} />
            <Row label="Linked Account Number" value={accountNumber} />
            <Row label="UPI ID"                value={upiId} />
            <Row label="IFSC Code"             value={ifscCode} />
            <Row label="Device Model Name"     value={deviceModelName} />
            <Row label="Device Mobile Number"  value={deviceMobile} />
            <Row label="Network Type"          value={networkType} />
            <Row label="Device Status"         value={deviceStatus} />
            <Row label="Battery Percentage"    value={batteryPct} />
            <Row label="Network Strength"      value={networkStrength} />
          </div>
        </div>

        {/* ── Footer with Close button ── */}
        <div style={{
          padding: '12px 24px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 28px',
              backgroundColor: '#1b5fcc',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#154db0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1b5fcc'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Use a portal so the modal renders at document.body level,
  // completely outside any fixed/positioned ancestor.
  return ReactDOM.createPortal(modal, document.body);
};

export default ViewProfileDetailsModal;
