import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn: (credentials: SignInCredentials) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [data, setData] = useState<User>({} as User);
  const userStorageKey = "@YourKey:user";

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("/sessions", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (token && user) {
        const userData = {
          ...user,
          token,
        } as User;

        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userData));

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setData(userData);
      }
    } catch (error) {
      throw new Error(String(error));
    }
  }

  async function loadStorageData() {
    const userData = await AsyncStorage.getItem(userStorageKey);

    if (userData) {
      const user = JSON.parse(userData) as User;

      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;

      setData(user);
    }
  }

  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ user: data, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
