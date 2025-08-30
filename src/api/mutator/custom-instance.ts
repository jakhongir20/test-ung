import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
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
      const lang = ['ru', 'uz'].includes(seg) ? seg : (localStorage.getItem('lang') ?? 'ru');
      config.headers = config.headers ?? {};
      config.headers['Accept-Language'] = lang as string;
    } catch {
    }

    const token = Cookies.get('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}` as string;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const originalRequest = error?.config;
      if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({resolve, reject});
          }).then((token) => {
            if (token) originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return instance!(originalRequest);
          }).catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          processQueue(new Error('No refresh token'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          const refreshUrl = `${BASE_URL}/api/v1/auth/refresh`;
          const res = await axios.post(refreshUrl, {refreshToken});
          const {accessToken, refreshToken: newRefreshToken} = res.data?.data || {};

          if (accessToken) {
            Cookies.set('accessToken', accessToken, {secure: true, sameSite: 'strict'});
          }
          if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken, {secure: true, sameSite: 'strict'});
          }

          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          isRefreshing = false;
          return instance!(originalRequest);
        } catch (refreshErr) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          processQueue(refreshErr, null);
          isRefreshing = false;
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
  return response.data as T;
};
