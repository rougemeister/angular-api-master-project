import { API_URL } from "../app/core/constants/contants";

export const environment = {
  production: true,
  staging: false,
  development: false,
  
  apiUrl: API_URL,
  apiTimeout: 15000, 
  

  enableLogging: false,
  enableAnalytics: true,
  enableServiceWorker: true,
  enableMockData: false,
  

  
  

  cacheConfig: {
    duration: 30 * 60 * 1000, 
    maxSize: 1000, 
    enableCache: true
  },
  
 
 
  enableSourceMaps: false,
  minifyAssets: true,
  
 
  debugMode: false,
  logLevel: 'error', 
  
 
  appName: 'Angular Api Master Project',
  version: '1.0.0',
  buildTimestamp: new Date().toISOString(),
  

  googleAnalytics: {
    trackingId: 'GA-PRODUCTION-ID',
    enabled: true
  },
  

  errorReporting: {
    enabled: true,
    apiKey: 'production-error-reporting-key'
  },
  

  performanceMonitoring: {
    enabled: true,
    sampleRate: 0.1 
  }
};