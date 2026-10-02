import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const API_URL = "http://10.131.45.191:5001";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
};

type BackendTransaction = {
  _id?: string;
  type?: string;
  amount?: number;
  description?: string;
  reference?: string;
  createdAt?: string;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  refreshing: boolean;

  addMoney: (
    amount: number,
    method: string
  ) => Promise<{
    success: boolean;
    message: string;
  }>;

  refreshWallet: () => Promise<void>;

  deductMoney: (
    amount: number,
    orderId: string
  ) => boolean;
};

const WalletContext = createContext<
  WalletContextType | undefined
>(undefined);

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();

  const [balance, setBalance] = useState(0);

  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN");
  };

  const convertTransactions = (
    backendTransactions: BackendTransaction[]
  ): Transaction[] => {
    return backendTransactions.map(
      (transaction, index) => {
        const transactionType =
          String(transaction.type || "").toUpperCase() ===
          "DEBIT"
            ? "debit"
            : "credit";

        return {
          id:
            transaction._id ||
            transaction.reference ||
            `${Date.now()}-${index}`,

          title:
            transaction.description ||
            (transactionType === "credit"
              ? "Money Added"
              : "Wallet Payment"),

          amount: Number(
            transaction.amount || 0
          ),

          type: transactionType,

          date: formatDate(
            transaction.createdAt
          ),
        };
      }
    );
  };

  /*
   * GET WALLET
   *
   * Loads the wallet balance and transaction
   * history from the Next360 backend.
   */
  const refreshWallet = useCallback(
    async () => {
      if (!token) {
        setBalance(0);
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setRefreshing(true);

        const response = await fetch(
          `${API_URL}/api/wallet`,
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
          throw new Error(
            data.message ||
              "Unable to load wallet"
          );
        }

        const wallet = data.wallet;

        setBalance(
          Number(wallet?.balance || 0)
        );

        const backendTransactions =
          Array.isArray(wallet?.transactions)
            ? wallet.transactions
            : [];

        const sortedTransactions = [
          ...backendTransactions,
        ].sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
        );

        setTransactions(
          convertTransactions(
            sortedTransactions
          )
        );
      } catch (error) {
        console.error(
          "GET WALLET ERROR:",
          error
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  /*
   * Automatically load wallet when the
   * authenticated user becomes available.
   */
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  /*
   * ADD MONEY
   *
   * Wallet recharge is processed by the
   * Next360 backend.
   *
   * Backend currently supports UPI only.
   */
  const addMoney = async (
    amount: number,
    method: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    if (!token) {
      return {
        success: false,
        message: "Please login first.",
      };
    }

    try {
      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return {
          success: false,
          message: "Enter a valid amount.",
        };
      }

      const response = await fetch(
        `${API_URL}/api/wallet/add-money`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount: numericAmount,

            // Backend currently accepts UPI.
            paymentMethod: "UPI",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message:
            data.message ||
            "Unable to add money to wallet.",
        };
      }

      /*
       * Backend returns the updated wallet,
       * so immediately update the mobile UI.
       */
      if (data.wallet) {
        setBalance(
          Number(data.wallet.balance || 0)
        );

        const backendTransactions =
          Array.isArray(
            data.wallet.transactions
          )
            ? data.wallet.transactions
            : [];

        const sortedTransactions = [
          ...backendTransactions,
        ].sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
        );

        setTransactions(
          convertTransactions(
            sortedTransactions
          )
        );
      } else {
        await refreshWallet();
      }

      return {
        success: true,

        message:
          data.message ||
          `₹${numericAmount} added successfully.`,
      };
    } catch (error) {
      console.error(
        "ADD MONEY ERROR:",
        error
      );

      return {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Network error while adding money.",
      };
    }
  };

  /*
   * Compatibility function.
   *
   * Actual wallet payment during checkout
   * must be processed by the backend payment API.
   *
   * We do NOT locally subtract money here,
   * because doing so could cause the mobile
   * balance and MongoDB balance to become
   * different.
   */
  const deductMoney = (
    amount: number,
    orderId: string
  ) => {
    if (balance < amount) {
      return false;
    }

    return true;
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        refreshing,
        addMoney,
        refreshWallet,
        deductMoney,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(
    WalletContext
  );

  if (!context) {
    throw new Error(
      "useWallet must be used inside WalletProvider"
    );
  }

  return context;
}