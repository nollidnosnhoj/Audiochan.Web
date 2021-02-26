import api from '~/utils/api';
import { Audio } from '~/features/audio/types';

interface FetchAudioByIdOptions {
  accessToken?: string;
}

export const fetchAudioById = async (id: string, options: FetchAudioByIdOptions = {}) => {
  const { data } = await api.get<Audio>(`audios/${id}`, { 
    accessToken: options.accessToken
  });
  return data;
}