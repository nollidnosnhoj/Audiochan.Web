import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LoginFormValues } from "~/components/Auth/LoginForm";
import fetcher from "../fetcher";
import { login, revokeRefreshToken } from "../services/auth";
import { CurrentUser } from "../types/user";
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
  const [loadingUser, setLoadingUser] = useState(false);

  async function authenticate(inputs: LoginFormValues) {
    await login(inputs);
    await fetchAuthenticatedUser();
  }

  const updateUser = (updatedUser: CurrentUser | undefined) => {
    setUser(updatedUser);
  };

  const fetchAuthenticatedUser = () => {
    return new Promise<CurrentUser>((resolve, reject) => {
      setLoadingUser(() => true);
      fetcher<CurrentUser>("me")
        .then((data) => {
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

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!user && accessToken) {
      fetchAuthenticatedUser();
    }
  }, [user]);

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
