import { API_URL } from "../app/core/constants/contants";

export const environment = {
  production: false,
  staging: false,
  development: true,
  
 
  apiUrl: API_URL,
  apiTimeout: 30000, 

  enableLogging: true,
  enableAnalytics: false,
  enableServiceWorker: false,
  enableMockData: true,

  googleAnalytics: {
    trackingId: '',
    enabled: false
  },
}