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
      const lang = ['ru', 'uz'].includes(seg) ? seg : (localStorage.getItem('lang') ?? 'ru');
      config.headers = config.headers ?? {};
      config.headers['Accept-Language'] = lang as string;
    } catch {
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}` as string;
    }

    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error?.config;
      if (error?.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
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
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          processQueue(new Error('No refresh token'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          const refreshUrl = `${BASE_URL}/api/auth/token/refresh/`;
          const res = await axios.post(refreshUrl, { refresh: refreshToken });
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
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
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
  // response is an AxiosResponse because response interceptor returns the raw response
  return (response as AxiosResponse).data as T;
};
