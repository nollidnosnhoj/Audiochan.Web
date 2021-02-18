import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LoginFormValues } from "~/components/Auth/LoginForm";
import {
  login,
  refreshAccessToken,
  revokeRefreshToken,
} from "../services/auth";
import { CurrentUser } from "../types/user";
import api from "~/utils/api";
import { getAccessToken } from "~/utils/cookies";
import { successfulToast } from "~/utils/toast";

type UserContextType = {
  user?: CurrentUser;
  login: (inputs: LoginFormValues) => Promise<void>;
  logout: (message?: string) => Promise<boolean>;
  updateUser: (updatedUser: CurrentUser) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({} as UserContextType);

interface UserProviderProps {
  initialUser?: CurrentUser;
}

export function UserProvider(props: PropsWithChildren<UserProviderProps>) {
  const [user, setUser] = useState<CurrentUser | undefined>(props.initialUser);
  const [expires, setExpires] = useState(0);
  const [loadingUser, setLoadingUser] = useState(false);

  async function authenticate(inputs: LoginFormValues) {
    const result = await login(inputs);
    setExpirationToLocalStorage(result.accessTokenExpires);
    await fetchAuthenticatedUser();
  }

  const updateUser = (updatedUser: CurrentUser | undefined) => {
    setUser(updatedUser);
  };

  const fetchAuthenticatedUser = () => {
    return new Promise<CurrentUser>((resolve, reject) => {
      setLoadingUser(() => true);
      api
        .get<CurrentUser>("me")
        .then(({ data }) => {
          setUser(data);
          resolve(data);
        })
        .catch((err) => {
          deauthenticate().then(() => reject(err));
        })
        .finally(() => setLoadingUser(() => false));
    });
  };

  function deauthenticate(logoutMessage?: string) {
    return new Promise<boolean>((resolve, reject) => {
      revokeRefreshToken()
        .then(() => {
          updateUser(undefined);
          successfulToast({
            title: "You have logged out.",
            message: logoutMessage,
          });
          resolve(true);
        })
        .catch((err) => reject(err));
    });
  }

  function setExpirationToLocalStorage(exp: number) {
    setExpires(exp);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("expires", JSON.stringify(exp));
    }
  }

  useEffect(() => {
    const localExpires = window.localStorage.getItem("expires");
    if (localExpires) {
      const parsedInt = parseInt(localExpires);
      setExpires(isNaN(parsedInt) ? 0 : parsedInt);
    }
  }, []);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!user && accessToken) {
      fetchAuthenticatedUser();
    }
  }, [user]);

  useEffect(() => {
    const handle = setInterval(async () => {
      if (expires <= Date.now() / 1000) {
        refreshAccessToken().then((result) => {
          console.log(result);
          setExpirationToLocalStorage(result.accessTokenExpires);
        });
      }
    }, 1000 * 60);

    return () => clearInterval(handle);
  }, []);

  const values = useMemo<UserContextType>(
    () => ({
      user,
      updateUser,
      login: authenticate,
      logout: deauthenticate,
      isLoading: loadingUser,
    }),
    [user, loadingUser]
  );

  return (
    <UserContext.Provider value={values}>{props.children}</UserContext.Provider>
  );
}

export default function useUser() {
  return useContext(UserContext);
}
