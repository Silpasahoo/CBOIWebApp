import axios from 'axios';
import { OTHER_KEYS } from '../auth/authConfig';

export const API_URLS = {
  // Language Update APIs
  FETCH_LANGUAGES: 'https://api-preprod.txninfra.com/encrV4/CBOI/isu_soundbox/lang/fetch_language',
  CURRENT_LANGUAGE: 'https://api-preprod.txninfra.com/encrV4/CBOI/isu_soundbox/user_api/current_language/',
  UPDATE_LANGUAGE: 'https://api-preprod.txninfra.com/encrV4/CBOI/isu_soundbox/lang/update_language',
  STATUS_CHECK: 'https://services-cboi-uat.isupay.in/CBOI/bank/lang/status_check/',

  // Merchant Fetch API
  FETCH_BY_ID: 'https://api-preprod.txninfra.com/encrV4/CBOI/fetch/fetchById',

  // Transaction Report
  TRANSACTION_REPORT: 'https://services-cboi-uat.isupay.in/CBOI/reports/querysubmit_username',

  // QR Code Generation
  DYNAMIC_QR_STRING: 'https://services-cboi-uat.isupay.in/CBOI/merchant/get-qr-string',
  QR_TO_BASE64: 'https://api-preprod.txninfra.com/encrV4/CBOI/merchant/qr_convert_to_base64',

  // Help & Support
  CREATE_TICKET: 'https://api-preprod.txninfra.com/encrV4/CBOI/zendesk/v2/createTicket',
  VIEW_TICKET: 'https://api-preprod.txninfra.com/encrV4/CBOI/zendesk/v2/viewTicket',
  VIEW_ALL_TICKETS: 'https://api-preprod.txninfra.com/encrV4/CBOI/zendesk/v2/viewAllTickets',
  FILTER_TICKETS: 'https://api-preprod.txninfra.com/encrV4/CBOI/zendesk/v2/filterTickets',
  DOWNLOAD_TICKET: 'https://services-cboi-uat.isupay.in/CBOI/zendesk/v2/downloadByID',
  DOWNLOAD_ALL_TICKETS: 'https://services-cboi-uat.isupay.in/CBOI/zendesk/v2/download',
};

export const getHeaders = (token) => {
  const passKey = OTHER_KEYS?.PASS_KEY;
  const headers = {
    'Content-Type': 'application/json'
  };

  // Only add Pass_key if it exists
  if (passKey) {
    headers['Pass_key'] = passKey;
  }

  // Only add Authorization if token exists
  if (token) {
    headers['Authorization'] = token;
  }

  console.log('Generated headers:', {
    'Content-Type': headers['Content-Type'],
    'Pass_key': headers['Pass_key'] ? 'SET (length: ' + headers['Pass_key'].length + ')' : 'MISSING',
    'Authorization': headers['Authorization'] ? 'SET (length: ' + headers['Authorization'].length + ')' : 'MISSING'
  });

  return headers;
};
