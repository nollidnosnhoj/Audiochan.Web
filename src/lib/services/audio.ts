import { useEffect, useState } from 'react';
import { useQuery, useMutation, UseQueryOptions, useQueryClient } from 'react-query'
import queryString from 'query-string'
import api, { fetch } from '~/utils/api';
import { apiErrorToast, successfulToast } from '~/utils/toast';
import { ErrorResponse, PagedList, PaginatedOptions } from '../types';
import { Audio, AudioSearchType, CreateAudioRequest } from '../types/audio'
import usePagination from '../hooks/usePagination';
import useInfinitePagination from '../hooks/useInfinitePagination';

interface FetchAudioByIdOptions {
  accessToken?: string;
}

export const fetchAudioById = async (id: string, options: FetchAudioByIdOptions = {}) => {
  const { data } = await api.get<Audio>(`audios/${id}`, { 
    accessToken: options.accessToken
  });
  return data;
}

export const useAudio = (id: string, options: UseQueryOptions<Audio, ErrorResponse> = {}) => {
  return useQuery<Audio, ErrorResponse>(['audios', id], () => fetchAudioById(id), options);
}

interface useAudiosPaginatedOptions extends PaginatedOptions {
  type: AudioSearchType
  username?: string
}

function generateUseAudiosKey(options: useAudiosPaginatedOptions) {
  let url = 'audios'

  if (options.type === 'feed') {
    url = `me/feed`
  } else if (options.type === 'favorites' && options.username) {
    url = `users/${options.username}/favorites`
  } else if (options.type === 'user' && options.username) {
    url = `users/${options.username}/audios`
  }

  return url;
}

export const useAudiosInfiniteQuery = (options: useAudiosPaginatedOptions = { type: 'audios' }) => {
  const key = generateUseAudiosKey(options);

  const params = {
    ...options.params,
    size: options.size ?? 30
  };

  const fetchAudios = async (page: number = 1) => {
    const qs = `?page=${page}&${queryString.stringify(params)}`
    return await fetch<PagedList<Audio>>(key + qs);
  }

  return useInfinitePagination<Audio>(key, fetchAudios, params);
}

export const useAudiosPaginatedQuery = (options: useAudiosPaginatedOptions = { type: 'audios' }) => {
  const key = generateUseAudiosKey(options);

  const params = {
    ...options.params,
    size: options.size = 30 
  };

  const fetchAudios = async (page: number) => {
    const qs = `?page=${page}&${queryString.stringify(params)}`
    return await fetch<PagedList<Audio>>(key + qs);
  }

  return usePagination(key, fetchAudios, params);
}

export const useAudioFavorite = (audioId: number, initialData?: boolean) => {
  const [isLoading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(initialData);

  useEffect(() => {
    if (isFavorite === undefined) {
      (async () => {
        try {
          setLoading(true);
          await api.head(`favorites/audios/${audioId}`)
          setIsFavorite(true);
        } catch (err) {
          setIsFavorite(false);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  const onFavorite = async () => {
    try {
      setLoading(true);
      const method = isFavorite ? "delete" : "put"
      await api.request(`favorites/audios/${audioId}`, method);
      successfulToast({
        message: isFavorite ? 'You have unfavorited this audio' : 'You have favorited this audio.'
      })
      setIsFavorite(!isFavorite);
    } catch (err) {
      apiErrorToast(err);
    } finally {
      setLoading(false);
    }
  }

  return { isFavorite, onFavorite, isLoading };
}

export const useCreateAudio = () => {
  const queryClient = useQueryClient();
  const uploadAudio = async (request: CreateAudioRequest) => {
    const { data } = await api.post<Audio>('audios', request);
    return data;
  }

  return useMutation(uploadAudio)
}

export const useEditAudio = (id: number) => {
  const queryClient = useQueryClient();
  const updateAudio = async (input: object) => {
    const { data } = await api.put<Audio>(`audios/${id}`, input);
    return data;
  }

  return useMutation(updateAudio, {
    onSuccess: (data) => {
      queryClient.setQueryData<Audio>([`audios`, id], data);
      queryClient.invalidateQueries(`audios`);
    }
  })
}

export const useRemoveAudio = (id: number) => {
  const queryClient = useQueryClient();
  const removeAudio = async () => await api.delete(`audios/${id}`);

  return useMutation(removeAudio, {
    onSuccess() {
      queryClient.invalidateQueries(`audios`);
      queryClient.invalidateQueries([`audios`, id], { exact: true })
    }
  })
}

export const addAudioPicture = async (id: number, data: string) =>
  await api.patch<{ image: string }>(`audios/${id}/picture`, { data });

export const useAddAudioPicture = (id: number) => {
  const queryClient = useQueryClient();
  const uploadArtwork = async (data: string) => {
    return await addAudioPicture(id, data);
  }

  return useMutation(uploadArtwork, {
    onSuccess(data) {
      queryClient.invalidateQueries(`audios`);
      queryClient.invalidateQueries([`audios`, id], { exact: true })
    }
  })
}