// import { useState } from 'react';
// import { Smartphone, ChevronDown, ArrowRight, AlertCircle } from 'lucide-react';
// import { fetchMerchantById } from '../../services/merchantService';
// import { useAuth } from '../../context/AuthContext';
// import Loader from './Loader';
// import CBOILogo from './CBOILogo';

// const MerchantSelectModal = () => {
//   const { setMerchantData } = useAuth();

//   const [step, setStep] = useState('mobile'); // 'mobile' | 'vpa'
//   const [mobile, setMobile] = useState('');
//   const [mobileLoading, setMobileLoading] = useState(false);
//   const [mobileError, setMobileError] = useState('');

//   /** Array of merchant records returned by mobile_number lookup */
//   const [records, setRecords] = useState([]);
//   const [selectedVpa, setSelectedVpa] = useState('');
//   const [vpaLoading, setVpaLoading] = useState(false);
//   const [vpaError, setVpaError] = useState('');

//   const handleMobileSubmit = async (e) => {
//     e.preventDefault();
//     const trimmed = mobile.trim();
//     if (!trimmed || trimmed.length < 10) {
//       setMobileError('Please enter a valid 10-digit mobile number.');
//       return;
//     }
//     setMobileError('');
//     setMobileLoading(true);
//     try {
//       const res = await fetchMerchantById({ mobile_number: trimmed });
//       const data = res?.data;
//       if (!data || data.length === 0) {
//         setMobileError('No merchant account found for this mobile number.');
//         return;
//       }
//       setRecords(data);
//       setSelectedVpa(data[0]?.vpa_id || '');
//       setStep('vpa');
//     } catch (err) {
//       setMobileError(err?.response?.data?.message || 'Failed to fetch merchant details. Please try again.');
//     } finally {
//       setMobileLoading(false);
//     }
//   };

//   const handleVpaConfirm = async () => {
//     if (!selectedVpa) return;
//     setVpaError('');
//     setVpaLoading(true);
//     try {
//       const res = await fetchMerchantById({ vpa_id: selectedVpa });
//       const data = res?.data;
//       if (!data || data.length === 0) {
//         setVpaError('Could not fetch details for selected VPA. Please try again.');
//         return;
//       }
//       setMerchantData(data[0]);
//     } catch (err) {
//       setVpaError(err?.response?.data?.message || 'Failed to load merchant data. Please try again.');
//     } finally {
//       setVpaLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         inset: 0,
//         background: 'linear-gradient(145deg, #003D20 0%, #004D2C 40%, #006B40 100%)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 9999,
//         padding: 24,
//       }}
//     >
//       {/* Background decorations */}
//       <div style={{ position: 'absolute', top: -100, right: -100, width: 360, height: 360, borderRadius: '50%', background: 'rgba(247,148,29,0.07)' }} />
//       <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

//       <div
//         style={{
//           background: '#FFFFFF',
//           borderRadius: 20,
//           padding: '40px 36px',
//           width: '100%',
//           maxWidth: 420,
//           boxShadow: '0 32px 80px rgba(0,0,0,0.40)',
//           position: 'relative',
//         }}
//       >
//         {/* Logo */}
//         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
//           <CBOILogo size="md" showBanner />
//         </div>

//         {step === 'mobile' ? (
//           <>
//             <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#1A2E24', textAlign: 'center' }}>
//               Verify Your Account
//             </h2>
//             <p style={{ margin: '0 0 24px', fontSize: 13, color: '#7A9489', textAlign: 'center' }}>
//               Enter your registered mobile number to continue
//             </p>

//             <form onSubmit={handleMobileSubmit}>
//               <div style={{ marginBottom: 16 }}>
//                 <label style={{ fontSize: 12, fontWeight: 600, color: '#4A6358', display: 'block', marginBottom: 6 }}>
//                   Mobile Number
//                 </label>
//                 <div style={{ position: 'relative' }}>
//                   <Smartphone
//                     size={15}
//                     color="#7A9489"
//                     style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
//                   />
//                   <input
//                     type="tel"
//                     value={mobile}
//                     onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                     placeholder="Enter 10-digit mobile number"
//                     maxLength={10}
//                     style={{
//                       width: '100%',
//                       padding: '12px 12px 12px 36px',
//                       border: `1.5px solid ${mobileError ? '#FECACA' : '#C8DDD5'}`,
//                       borderRadius: 8,
//                       fontSize: 14,
//                       color: '#1A2E24',
//                       outline: 'none',
//                       boxSizing: 'border-box',
//                       background: mobileError ? '#FFF7F7' : '#F7FBF9',
//                     }}
//                     autoFocus
//                   />
//                 </div>
//                 {mobileError && (
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
//                     <AlertCircle size={12} color="#DC2626" />
//                     <span style={{ fontSize: 12, color: '#DC2626' }}>{mobileError}</span>
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={mobileLoading || mobile.length < 10}
//                 style={{
//                   width: '100%',
//                   padding: '13px',
//                   background: mobile.length < 10 ? '#C8DDD5' : 'linear-gradient(135deg, #004D2C, #006B40)',
//                   color: '#FFFFFF',
//                   border: 'none',
//                   borderRadius: 10,
//                   fontSize: 14,
//                   fontWeight: 700,
//                   cursor: mobile.length < 10 ? 'not-allowed' : 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: 8,
//                   boxShadow: mobile.length < 10 ? 'none' : '0 4px 14px rgba(0,107,64,0.35)',
//                 }}
//               >
//                 {mobileLoading ? <Loader size={18} color="#FFFFFF" /> : (<>Continue <ArrowRight size={15} /></>)}
//               </button>
//             </form>
//           </>
//         ) : (
//           <>
//             <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#1A2E24', textAlign: 'center' }}>
//               Select VPA ID
//             </h2>
//             <p style={{ margin: '0 0 6px', fontSize: 13, color: '#7A9489', textAlign: 'center' }}>
//               Mobile: <strong style={{ color: '#1A2E24' }}>+91 {mobile}</strong>
//             </p>
//             <p style={{ margin: '0 0 24px', fontSize: 12, color: '#7A9489', textAlign: 'center' }}>
//               {records.length} VPA ID{records.length !== 1 ? 's' : ''} found — select one to continue
//             </p>

//             <div style={{ marginBottom: 16 }}>
//               <label style={{ fontSize: 12, fontWeight: 600, color: '#4A6358', display: 'block', marginBottom: 6 }}>
//                 VPA ID (UPI Address)
//               </label>
//               <div style={{ position: 'relative' }}>
//                 <select
//                   value={selectedVpa}
//                   onChange={(e) => setSelectedVpa(e.target.value)}
//                   style={{
//                     width: '100%',
//                     padding: '12px 36px 12px 12px',
//                     border: '1.5px solid #C8DDD5',
//                     borderRadius: 8,
//                     fontSize: 13,
//                     color: '#1A2E24',
//                     background: '#F7FBF9',
//                     outline: 'none',
//                     appearance: 'none',
//                     cursor: 'pointer',
//                     fontFamily: 'monospace',
//                     boxSizing: 'border-box',
//                   }}
//                 >
//                   {records.map((r) => (
//                     <option key={r.vpa_id} value={r.vpa_id}>
//                       {r.vpa_id}{r.merchant_name ? ` — ${r.merchant_name}` : ''}
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown
//                   size={14}
//                   color="#7A9489"
//                   style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
//                 />
//               </div>
//               {vpaError && (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
//                   <AlertCircle size={12} color="#DC2626" />
//                   <span style={{ fontSize: 12, color: '#DC2626' }}>{vpaError}</span>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={handleVpaConfirm}
//               disabled={vpaLoading || !selectedVpa}
//               style={{
//                 width: '100%',
//                 padding: '13px',
//                 background: 'linear-gradient(135deg, #004D2C, #006B40)',
//                 color: '#FFFFFF',
//                 border: 'none',
//                 borderRadius: 10,
//                 fontSize: 14,
//                 fontWeight: 700,
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: 8,
//                 boxShadow: '0 4px 14px rgba(0,107,64,0.35)',
//                 marginBottom: 12,
//               }}
//             >
//               {vpaLoading ? <Loader size={18} color="#FFFFFF" /> : (<>Load Dashboard <ArrowRight size={15} /></>)}
//             </button>

//             <button
//               onClick={() => { setStep('mobile'); setMobileError(''); }}
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 background: 'none',
//                 border: '1.5px solid #C8DDD5',
//                 borderRadius: 10,
//                 fontSize: 13,
//                 color: '#4A6358',
//                 cursor: 'pointer',
//                 fontWeight: 600,
//               }}
//             >
//               Change Mobile Number
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MerchantSelectModal;
