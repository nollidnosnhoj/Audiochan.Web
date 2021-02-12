
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "react-query";
import useUser from "../contexts/user_context";
import { ErrorResponse } from "../types";
import { Profile } from "../types/user";
import api from '~/utils/api';
import { apiErrorToast } from "~/utils/toast";

export const useFollow = (username: string, initialData?: boolean) => {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(initialData);

  useEffect(() => {
    if (user && isFollowing === undefined) {
      api.head(`me/following/${username}`)
        .then(() => {
          setIsFollowing(true);
        })
        .catch(() => {
          setIsFollowing(false);
        });
    }
  }, []);

  const followHandler = () => {
    const method = isFollowing ? 'DELETE' : 'PUT';
    api.request(`me/followings/${username}`, method)
      .then(() => setIsFollowing(!isFollowing))
      .catch(err => apiErrorToast(err));
  }

  return { isFollowing, follow: followHandler };
}

interface FetchUserProfileOptions {
  accessToken?: string;
}

export const fetchUserProfile = async (username: string, options: FetchUserProfileOptions = {}) => {
  const { data } = await api.get<Profile>(`users/${username}`, {
    accessToken: options.accessToken
  });

  return data;
}

export const useProfile = (username: string, options: UseQueryOptions<Profile, ErrorResponse> = {}) => {
  return useQuery<Profile, ErrorResponse>(["users", username], () => fetchUserProfile(username), options);
}

export const useAddUserPicture = (username: string) => {
  const queryClient = useQueryClient();
  const uploadArtwork = async (data: string) => 
    await api.patch<{ image: string}>(`me/picture`, { data });

  return useMutation(uploadArtwork, {
    onSuccess() {
      queryClient.invalidateQueries(`me`);
      queryClient.invalidateQueries(`users`);
      queryClient.invalidateQueries([`users`, username], { exact: true })
    }
  })
}