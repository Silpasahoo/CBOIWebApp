import axios from 'axios'

const api = axios.create({
  baseURL:'https://api-preprod.txninfra.com',
  timeout:15000
})

api.interceptors.request.use(config=>{
  config.headers['pass_key']='c0CKRG7yNFY3OIxY92izqj0YeMk6JPqdOlGgqsv3mhicXmAv'
  config.headers['Authorization']=sessionStorage.getItem('token')
  return config
})

api.interceptors.response.use(
  res=>res,
  err=>{
    console.error('API ERROR:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export default api
