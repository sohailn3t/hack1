import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAction, useConvex, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  accountType: 'demo' | 'user';
  subscriptionStatus: 'free' | 'premium';
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error: string | null;
  retry: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = 'heatshield-session-token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>(token ? 'loading' : 'unauthenticated');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const convex = useConvex();
  const loginAction = useAction(api.authActions.login);
  const signupAction = useAction(api.authActions.signup);
  const logoutMutation = useMutation(api.account.logout);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUser(null);
      setError(null);
      setStatus('unauthenticated');
      return () => { cancelled = true; };
    }

    setStatus('loading');
    setError(null);
    convex.query(api.account.profile, { token })
      .then((profile) => {
        if (cancelled) return;
        setUser(profile as AuthUser);
        setStatus('authenticated');
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        const message = reason instanceof Error ? reason.message : 'Unable to verify the secure session.';
        if (message.includes('session has expired') || message.includes('Account not found')) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
          setStatus('unauthenticated');
          setError('Your previous session expired. Please sign in again.');
          return;
        }
        setStatus('error');
        setError(`Secure session verification failed: ${message}`);
      });

    return () => { cancelled = true; };
  }, [convex, retryCount, token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    status,
    error,
    retry: () => setRetryCount((count) => count + 1),
    login: async (email, password) => {
      setError(null);
      try {
        const result = await loginAction({ email, password });
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
      } catch (reason) {
        setStatus('unauthenticated');
        setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
        throw reason;
      }
    },
    signup: async (fullName, email, password) => {
      setError(null);
      try {
        const result = await signupAction({ fullName, email, password });
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
      } catch (reason) {
        setStatus('unauthenticated');
        setError(reason instanceof Error ? reason.message : 'Unable to create the account.');
        throw reason;
      }
    },
    logout: async () => {
      try {
        if (token) await logoutMutation({ token });
      } finally {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setError(null);
        setStatus('unauthenticated');
      }
    },
  }), [error, loginAction, logoutMutation, signupAction, status, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
