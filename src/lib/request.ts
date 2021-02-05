import { AxiosAuthRefreshRequestConfig } from 'axios-auth-refresh';
import apiAxios, { getBearer } from './axios';

interface RequestOptions<TRequest = any> extends Omit<AxiosAuthRefreshRequestConfig, 'url'> {
  data?: TRequest,
  accessToken?: string;
}

export default function request<TResponse = any, TRequest = any>(url: string, options: RequestOptions<TRequest> = {}) {
  const { accessToken, ...axiosRequestConfig } = options;
  const requestConfig: AxiosAuthRefreshRequestConfig = {
    ...axiosRequestConfig,
    url
  }

  if (accessToken) {
    Object.assign(requestConfig, { 
      headers: { 
        Authorization: getBearer(accessToken) 
      }
    })
  }

  return apiAxios.request<TResponse>(requestConfig);
}