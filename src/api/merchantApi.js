import api from './axiosInstance'
import {encryptData} from '../utils/encrypt'

export const fetchMerchant=(payload)=>{
  const enc = encryptData(payload)
  return api.post('/encrV4/CBOI/fetch/fetchById',{RequestData:enc})
}
