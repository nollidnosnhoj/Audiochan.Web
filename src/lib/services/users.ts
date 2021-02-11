
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "react-query";
import { apiErrorToast } from "~/utils/toast";
import useUser from "../contexts/user_context";
import request from "../request";
import { ErrorResponse } from "../types";
import { Profile } from "../types/user";

export const useFollow = (username: string, initialData?: boolean) => {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(initialData);

  useEffect(() => {
    if (user && isFollowing === undefined) {
      request(`me/followings/${username}`, { method: "head" })
        .then(() => {
          setIsFollowing(true);
        })
        .catch(() => {
          setIsFollowing(false);
        });
    }
  }, []);

  const followHandler = async () => {
    try {
      await request(`me/followings/${username}`, {
        method: isFollowing ? "delete" : "put",
      });
      setIsFollowing(!isFollowing);
    } catch (err) {
      apiErrorToast(err);
    }
  }

  return { isFollowing, follow: followHandler };
}

interface FetchUserProfileOptions {
  accessToken?: string;
}

export const fetchUserProfile = async (username: string, options: FetchUserProfileOptions = {}) => {
  const { data } = await request<Profile>(`users/${username}`, {
    method: 'get',
    accessToken: options.accessToken
  });

  return data;
}

export const useProfile = (username: string, options: UseQueryOptions<Profile, ErrorResponse> = {}) => {
  return useQuery<Profile, ErrorResponse>(["users", username], () => fetchUserProfile(username), options);
}

export const useAddUserPicture = (username: string) => {
  const queryClient = useQueryClient();
  const uploadArtwork = async (data: string) => {
    return await request<{ image: string }>(`me/picture`, {
      method: 'patch',
      data: { data }
    });
  }

  return useMutation(uploadArtwork, {
    onSuccess() {
      queryClient.invalidateQueries(`me`);
      queryClient.invalidateQueries(`users`);
      queryClient.invalidateQueries([`users`, username], { exact: true })
    }
  })
}