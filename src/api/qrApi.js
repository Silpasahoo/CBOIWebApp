import api from './axiosInstance'
import {encryptData} from '../utils/encrypt'

export const generateQR=(qrString)=>{
  const enc=encryptData({qrString})
  return api.post('/encrV4/CBOI/merchant/qr_convert_to_base64',{RequestData:enc})
}
