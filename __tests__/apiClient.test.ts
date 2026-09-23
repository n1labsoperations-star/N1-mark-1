import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import apiClient, { ApiError, setAuthToken } from '../src/services/apiClient';

function useAdapter(adapter: AxiosAdapter) {
  apiClient.defaults.adapter = adapter;
}

function respond(config: InternalAxiosRequestConfig, status: number) {
  return {
    data: { ok: status < 400 },
    status,
    statusText: '',
    headers: {},
    config,
  };
}

afterEach(() => setAuthToken(null));

test('attaches the auth token when set', async () => {
  let sentAuth: unknown;
  useAdapter(async config => {
    sentAuth = config.headers.Authorization;
    return respond(config, 200);
  });

  setAuthToken('abc');
  await apiClient.get('/me');

  expect(sentAuth).toBe('Bearer abc');
});

test('omits the auth header when no token is set', async () => {
  let sentAuth: unknown = 'unset';
  useAdapter(async config => {
    sentAuth = config.headers.Authorization;
    return respond(config, 200);
  });

  await apiClient.get('/me');

  expect(sentAuth).toBeUndefined();
});

test('turns HTTP errors into ApiError with status', async () => {
  useAdapter(async config => {
    const { AxiosError } = jest.requireActual('axios');
    throw new AxiosError(
      'fail',
      'ERR_BAD_RESPONSE',
      config,
      null,
      respond(config, 404),
    );
  });

  await expect(apiClient.get('/missing')).rejects.toMatchObject({
    name: 'ApiError',
    status: 404,
  });
});

test('turns network failures into ApiError', async () => {
  useAdapter(async config => {
    const { AxiosError } = jest.requireActual('axios');
    throw new AxiosError('down', 'ERR_NETWORK', config);
  });

  await expect(apiClient.get('/x')).rejects.toBeInstanceOf(ApiError);
});
