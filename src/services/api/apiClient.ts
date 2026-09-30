import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../../config';

// Uniform error shape so sagas and screens never deal with raw AxiosErrors.
export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let authToken: string | null = null;

// Call after login/logout; the request interceptor picks it up.
export function setAuthToken(token: string | null) {
  authToken = token;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject(
        new ApiError(
          `Request failed with status ${error.response.status}`,
          error.response.status,
          error.response.data,
        ),
      );
    }
    if (error.code === AxiosError.ECONNABORTED) {
      return Promise.reject(new ApiError('Request timed out'));
    }
    return Promise.reject(new ApiError('Network error, please try again'));
  },
);

export default apiClient;
