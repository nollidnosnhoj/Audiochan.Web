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
  logout: (message?: string) => Promise<void>;
  updateUser: (updatedUser: CurrentUser) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({} as UserContextType);

interface UserProviderProps {
  initialUser?: CurrentUser;
}

export function UserProvider(props: PropsWithChildren<UserProviderProps>) {
  const [user, setUser] = useState<CurrentUser | undefined>(props.initialUser);
  const [loading, setLoading] = useState(false);

  async function authenticate(inputs: LoginFormValues) {
    await login(inputs);
    await fetchAuthenticatedUser();
  }

  const updateUser = (updatedUser: CurrentUser | undefined) => {
    setUser(updatedUser);
  };

  const fetchAuthenticatedUser = async () => {
    try {
      setLoading(true);
      const fetchedUser = await fetcher<CurrentUser>("me");
      setUser(fetchedUser);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  async function deauthenticate(logoutMessage?: string) {
    try {
      await revokeRefreshToken();
      updateUser(undefined);
      successfulToast({
        message: logoutMessage ?? "You have successfully logged out.",
      });
    } catch (err) {
      console.error(err);
    }
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
      isLoading: loading,
    }),
    [user, loading]
  );

  return (
    <UserContext.Provider value={values}>{props.children}</UserContext.Provider>
  );
}

export default function useUser() {
  return useContext(UserContext);
}
