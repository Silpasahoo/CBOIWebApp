import { WebStorageStateStore } from 'oidc-client-ts';

export const authConfig = {
  authority: 'https://cboi-auth-stage.isupay.in/application/o/merchant-web-application/',
  client_id: '02WnEFxSElzxzrv3Qht29IacaiO6qKa3pclXleoo',
  redirect_uri: window.location.origin + '/callback',
  post_logout_redirect_uri: window.location.origin + '/sso/logout',
  response_type: 'code',
  scope: 'openid profile email offline_access authorities privileges user_name created adminName bankCode goauthentik.io/api',
  automaticSilentRenew: true,
  loadUserInfo: true,
  monitorSession: true,
  filterProtocolClaims: true,
  userStore: new WebStorageStateStore({
    store: window.sessionStorage,
    sync: true
  }),
};

export const OTHER_KEYS = {
  PASS_KEY: 'c0CKRG7yNFY3OIxY92izqj0YeMk6JPqdOlGgqsv3mhicXmAv',
  AES_KEY: '82gbZpEWVzTcL5qXB+kSKCes7XbqdNxqKjQeDgdnJX0='
};
