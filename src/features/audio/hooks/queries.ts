import { useQuery } from 'react-query';
import queryString from 'query-string';
import { UseQueryOptions } from 'react-query';
import useInfinitePagination from "~/hooks/useInfinitePagination";
import usePagination from "~/hooks/usePagination";
import { ErrorResponse, PagedList } from "~/lib/types";
import { Audio } from '~/features/audio/types';
import { fetch } from '~/utils/api'
import { fetchAudioById } from '../services/fetch';

const _fetchAudios = async (page: number = 1, key: string, params: Record<string, any>) => {
  const qs = `?page=${page}&${queryString.stringify(params)}`
  return await fetch<PagedList<Audio>>(key + qs);
}

const _useAudiosInfiniteQuery = (key: string, params: Record<string, any>) => {
  return useInfinitePagination<Audio>(key, (page) => _fetchAudios(page, key, params), params);
}

const _useAudiosPaginatedQuery = (key: string, params: Record<string, any>) => {
  return usePagination<Audio>(key, (page) => _fetchAudios(page, key, params), params);
}

export const useAudio = (id: string, options: UseQueryOptions<Audio, ErrorResponse> = {}) => {
  return useQuery<Audio, ErrorResponse>(['audios', id], () => fetchAudioById(id), options);
}

export const useUserAudiosInfiniteQuery = (username: string, params: Record<string, any> = {}, size: number = 15) => {
  Object.assign(params, { size });
  const key = `users/${username}/audios?`;
  return _useAudiosInfiniteQuery(key, params);
}

export const useUserFavoriteAudiosInfiniteQuery = (username: string, params: Record<string, any> = {}, size: number = 15) => {
  Object.assign(params, { size });
  const key = `users/${username}/favorites/audios`
  return _useAudiosInfiniteQuery(key, params);
}