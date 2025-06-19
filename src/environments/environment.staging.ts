import { API_URL } from "../app/core/constants/contants";

export const environment = {
  production: false,
  staging: true,
  development: false,
  

  apiUrl: API_URL,
  apiTimeout: 20000,
  

  enableLogging: true,
  enableServiceWorker: true,
  enableMockData: false,
  
 
  
  cacheConfig: {
    duration: 10 * 60 * 1000,
    maxSize: 500, 
    enableCache: true
  },
  

  enableSourceMaps: true,
  minifyAssets: true,
  
 
  debugMode: true,
  logLevel: 'info', 
  
};