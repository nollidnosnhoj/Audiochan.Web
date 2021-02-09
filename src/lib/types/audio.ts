import { Creator } from "~/lib/types"
import { Genre } from "~/lib/types/genre"

export type AudioSearchType = 'audios' | 'favorites' | 'user' | 'feed'

export type Audio = {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  isLoop: boolean;
  tags: string;
  duration: number;
  fileSize: number;
  fileExt: string;
  url: string;
  pictureUrl: string;
  favoriteCount: number;
  isFavorited: boolean;
  created: string;
  updated?: string;
  genre?: Genre;
  user: Creator;
  uploadId: string;
}

export interface EditAudioRequest {
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  genre: string;
};

export interface UploadAudioRequest extends EditAudioRequest {
  acceptTerms: boolean
}