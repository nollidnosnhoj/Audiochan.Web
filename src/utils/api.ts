import axios, { Method } from 'axios'
import createAuthRefreshInterceptor, { AxiosAuthRefreshRequestConfig } from 'axios-auth-refresh';
import config from '~/lib/config';
import { refreshAccessToken, revokeRefreshToken } from '~/lib/services/auth';
import { isAxiosError } from './axios';
import { getAccessToken } from './cookies';

const backendApiClient = axios.create({
  baseURL: config.BACKEND_API,
  withCredentials: true
});

export function getBearer(token: string) {
  return token ? `Bearer ${token}` : ''
}

createAuthRefreshInterceptor(backendApiClient, async (failedRequest) => {
  return refreshAccessToken().then((data) => {
    if (failedRequest && isAxiosError(failedRequest) && failedRequest.response) {
      failedRequest.response.config.headers['Authorization'] = getBearer(data.accessToken);
    }
    backendApiClient.defaults.headers['Authorization'] = getBearer(data.accessToken);
    return Promise.resolve();
  }).catch(err => Promise.reject(err));
});

backendApiClient.interceptors.request.use(request => {
  if (!request.headers.Authorization) {
    const accessToken = getAccessToken();
    request.headers.Authorization = getBearer(accessToken);
  }
  return request;
});

interface RequestConfiguration {
  accessToken?: string;
  skipAuthRefresh?: boolean;
}

function constructRequestConfiguration(config?: RequestConfiguration): AxiosAuthRefreshRequestConfig {
  function constructAuthorizationHeader(accessToken?: string) {
    if (!accessToken) return {};
    return { 'Authorization': getBearer(accessToken) };
  }

  if (!config) return {};

  const {
    accessToken,
    skipAuthRefresh = false
  } = config;

  return {
    headers: { ...constructAuthorizationHeader(accessToken) },
    skipAuthRefresh: skipAuthRefresh
  }
}

function getRequest<TResponse = any>(route: string, config?: RequestConfiguration) {
  return backendApiClient.get<TResponse>(route, constructRequestConfiguration(config));
}

function headRequest(route: string, config?: RequestConfiguration) {
  return backendApiClient.head(route, constructRequestConfiguration(config));
}

function postRequest<TResponse = any, TRequest = unknown>(route: string, body?: TRequest, config?: RequestConfiguration) {
  return backendApiClient.post<TResponse>(route, body, constructRequestConfiguration(config));
}

function putRequest<TResponse = any, TRequest = unknown>(route: string, body?: TRequest, config?: RequestConfiguration) {
  return backendApiClient.put<TResponse>(route, body, constructRequestConfiguration(config));
}

function patchRequest<TResponse = any, TRequest = unknown>(route: string, body?: TRequest, config?: RequestConfiguration) {
  return backendApiClient.patch<TResponse>(route, body, constructRequestConfiguration(config));
}

function deleteRequest<TResponse = any>(route: string, config?: RequestConfiguration) {
  return backendApiClient.delete<TResponse>(route, constructRequestConfiguration(config));
}

function request<TResponse = any, TRequest = unknown>(route: string, method: Method, body?: TRequest, config?: RequestConfiguration) {
  return backendApiClient.request<TResponse>({
    method: method,
    url: route,
    data: body,
    ...constructRequestConfiguration(config)
  });
}

export function fetch<TResponse>(route: string) {
  const accessToken = getAccessToken();
  return new Promise<TResponse>((resolve, reject) => {
    getRequest(route, {accessToken}).then(({ data }) => {
      resolve(data)
    }).catch(err => reject(err));
  })
}

export default {
  get: getRequest,
  post: postRequest,
  put: putRequest,
  patch: patchRequest,
  delete: deleteRequest,
  head: headRequest,
  request: request
}