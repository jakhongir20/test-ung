import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { BASE_URL } from '../config';

let instance: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: string | null) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({resolve, reject}) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

function getInstance(): AxiosInstance {
  if (instance) return instance;

  instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
  });

  instance.interceptors.request.use((config) => {
    try {
      const seg = (typeof window !== 'undefined' ? window.location.pathname : '/').split('/')[1];
      const stored = localStorage.getItem('lang');
      const normalized = (v: string | null | undefined) => (v === 'ru' || v === 'uz' || v === 'uz-cyrl') ? v : null;
      const lang = normalized(seg) || normalized(stored) || 'uz';
      config.headers = config.headers ?? {};
      config.headers['Accept-Language'] = lang as string;
    } catch {
    }

    const token = localStorage.getItem('accessToken');
    console.log('🔑 Token check:', { 
      hasToken: !!token, 
      tokenLength: token?.length, 
      url: config.url,
      method: config.method,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    });
    
    if (token) {
      // Don't add authorization header for auth endpoints
      const authEndpoints = [
        '/api/auth/password-login/',
        '/api/auth/register/',
        '/api/auth/send-otp/',
        '/api/auth/verify-otp/',
        '/api/auth/login/',
        '/api/auth/token/refresh/'
      ];
      
      const isAuthEndpoint = authEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );
      
      console.log('🔒 Auth endpoint check:', { 
        isAuthEndpoint, 
        url: config.url 
      });
      
      if (!isAuthEndpoint) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Authorization header added:', {
          headerValue: `Bearer ${token.substring(0, 20)}...`,
          fullHeaders: config.headers
        });
      } else {
        console.log('🚫 Skipping auth header for auth endpoint');
      }
    } else {
      console.log('❌ No token found in localStorage');
    }

    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error?.config;
      if ((error?.response?.status === 401 || 
           error?.response?.data?.non_field_errors?.includes('Invalid or inactive session')) && 
          originalRequest && !(originalRequest as any)._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({resolve, reject});
          }).then((token) => {
            if (token) (originalRequest.headers = originalRequest.headers ?? {}, originalRequest.headers['Authorization'] = `Bearer ${token}`);
            return instance!(originalRequest);
          }).catch((err) => Promise.reject(err));
        }

        (originalRequest as any)._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('❌ No refresh token found, clearing all tokens');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          processQueue(new Error('No refresh token'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          const refreshUrl = `${BASE_URL}/api/auth/token/refresh/`;
          const seg = (typeof window !== 'undefined' ? window.location.pathname : '/').split('/')[1];
          const stored = localStorage.getItem('lang');
          const normalized = (v: string | null | undefined) => (v === 'ru' || v === 'uz' || v === 'uz-cyrl') ? v : null;
          const lang = normalized(seg) || normalized(stored) || 'uz';
          const res = await axios.post(refreshUrl, { refresh: refreshToken }, { headers: { 'Accept-Language': lang } });
          const access = res.data?.access as string | undefined;
          const newRefresh = (res.data?.refresh as string | undefined) ?? refreshToken;

          if (access) localStorage.setItem('accessToken', access);
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          processQueue(null, access ?? null);
          isRefreshing = false;
          return instance!(originalRequest);
        } catch (refreshErr) {
          console.log('❌ Token refresh failed, clearing all tokens');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          processQueue(refreshErr, null);
          isRefreshing = false;
          
          // If refresh fails, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshErr);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const axiosInstance = getInstance();
  const response = await axiosInstance({...config, ...options});
  // response is an AxiosResponse because response interceptor returns the raw response
  return (response as AxiosResponse).data as T;
};

// Function to refresh the instance after login
export const refreshInstance = () => {
  instance = null;
  console.log('🔄 Axios instance refreshed');
};
