import CryptoJS from 'crypto-js'
import { OTHER_KEYS } from '../auth/authConfig'

// ECB functions left for backward compatibility
export const encryptData=(data)=>{
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Base64.parse(OTHER_KEYS.AES_KEY),
    {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7}
  ).toString()
}

export const decryptData=(cipher)=>{
  const bytes=CryptoJS.AES.decrypt(
    cipher,
    CryptoJS.enc.Base64.parse(OTHER_KEYS.AES_KEY),
    {mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7}
  )
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

const getDecodedKey = () => CryptoJS.enc.Base64.parse(OTHER_KEYS.AES_KEY);

// New CBC Encryption flow
export function encryptRequestData(requestBody) {
  const serializedBody = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody ?? {});
  const iv = CryptoJS.lib.WordArray.random(16);
  const decodedKey = getDecodedKey();
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(serializedBody), decodedKey, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });
  const combined = iv.concat(encrypted.ciphertext);

  return CryptoJS.enc.Base64.stringify(combined);
}

// New CBC Decryption flow
export function decryptResponseData(encryptedBase64) {
  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedBase64);
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(
      combined.words.slice(4),
      combined.sigBytes - 16
    );
    const decodedKey = getDecodedKey();
    
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      decodedKey,
      {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }
    );
    
    const decryptedString = CryptoJS.enc.Utf8.stringify(decrypted);
    return JSON.parse(decryptedString);
  } catch (err) {
    console.error("Decryption parsing error", err);
    return null;
  }
}

