import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.131.45.191:5001";

export type User = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  address?: string;
  city?: string;
  pincode?: string;
  isActive?: boolean;
};

type RegisterData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  city?: string;
  pincode?: string;
};

type AuthResult = {
  success: boolean;
  message?: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  register: (
    userData: RegisterData
  ) => Promise<AuthResult>;

  logout: () => Promise<void>;

  refreshProfile: () => Promise<AuthResult>;
};

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

const TOKEN_KEY = "next360_token";
const USER_KEY = "next360_user";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    null
  );

  const [user, setUser] = useState<User | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD SAVED LOGIN
  // =====================================================

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken =
        await AsyncStorage.getItem(TOKEN_KEY);

      const storedUser =
        await AsyncStorage.getItem(USER_KEY);

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error(
            "INVALID STORED USER:",
            error
          );

          await AsyncStorage.removeItem(USER_KEY);
        }
      }
    } catch (error) {
      console.error(
        "LOAD STORED AUTH ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const response = await fetch(
        `${API_URL}/api/users/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message ||
            "Invalid email or password.",
        };
      }

      if (!data.token) {
        return {
          success: false,
          message:
            "Authentication token was not received.",
        };
      }

      if (data.user?.role !== "buyer") {
        return {
          success: false,
          message:
            "Please login using a buyer account.",
        };
      }

      // Save token
      await AsyncStorage.setItem(
        TOKEN_KEY,
        data.token
      );

      // Save user
      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
      );

      // Update application state
      setToken(data.token);
      setUser(data.user);

      return {
        success: true,
        message:
          data.message || "Login successful.",
      };
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      return {
        success: false,
        message:
          "Could not connect to the Next360 backend.",
      };
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (
    userData: RegisterData
  ): Promise<AuthResult> => {
    try {
      const response = await fetch(
        `${API_URL}/api/users`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,

            // Mobile registration creates buyer
            role: "buyer",

            address: userData.address || "",
            city: userData.city || "",
            pincode: userData.pincode || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message ||
            "Registration failed.",
        };
      }

      return {
        success: true,
        message:
          data.message ||
          "Registration successful.",
      };
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      return {
        success: false,
        message:
          "Could not connect to the Next360 backend.",
      };
    }
  };

  // =====================================================
  // GET CURRENT USER PROFILE
  // =====================================================

  const refreshProfile =
    async (): Promise<AuthResult> => {
      try {
        if (!token) {
          return {
            success: false,
            message: "User is not logged in.",
          };
        }

        const response = await fetch(
          `${API_URL}/api/users/profile`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            message:
              data.message ||
              "Unable to load profile.",
          };
        }

        if (data.user) {
          await AsyncStorage.setItem(
            USER_KEY,
            JSON.stringify(data.user)
          );

          setUser(data.user);
        }

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "PROFILE ERROR:",
          error
        );

        return {
          success: false,
          message:
            "Could not connect to the backend.",
        };
      }
    };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(
        TOKEN_KEY
      );

      await AsyncStorage.removeItem(
        USER_KEY
      );
    } catch (error) {
      console.error(
        "LOGOUT STORAGE ERROR:",
        error
      );
    }

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =======================================================
// USE AUTH HOOK
// =======================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}