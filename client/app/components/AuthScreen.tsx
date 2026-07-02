'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(input: { email: $email, password: $password, roles: ["ROLE_USER"] }) {
      id
      email
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user { id email roles }
    }
  }
`;

import { useAuth } from '../context/AuthContext';

export const AuthScreen = () => {
  // Cast through unknown to avoid TS strict null check on undefined context
  const authContext = useAuth() as unknown as {
    login: (token: string, user: { id: string; email: string; roles: string[] }) => void;
  };
  const { login } = authContext;
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isRegister) {
        await registerMutation({ variables: { email, password } });
        setSuccess('Đăng ký thành công. Đăng nhập ngay.');
        setIsRegister(false);
      } else {
        const res = await loginMutation({ variables: { email, password } });
        const auth = (res.data as { login?: { token: string; user: { id: string; email: string; roles: string[] } } } | null | undefined)?.login;
        if (auth) {
          login(auth.token, auth.user);
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Đăng nhập thất bại');
    }
  };

  const isLoading = registerLoading || loginLoading;

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <h1 className="font-display text-coral text-[64px] uppercase tracking-[-0.02em] leading-none text-center mb-2">
          TICKETRUSH
        </h1>
        <p className="font-mono text-label uppercase text-muted tracking-[0.2em] text-center mb-12">
          {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block font-mono text-label uppercase text-muted tracking-[0.15em] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-paper border-b border-hairline focus:border-coral py-3 font-body text-body outline-none"
              placeholder="email@cuaban.vn"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-mono text-label uppercase text-muted tracking-[0.15em] mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-paper border-b border-hairline focus:border-coral py-3 font-body text-body outline-none"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p className="font-mono text-small text-coral border-l-2 border-coral pl-3">
              {error}
            </p>
          )}
          {success && (
            <p className="font-mono text-small text-paper border-l-2 border-paper pl-3">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-label uppercase tracking-[0.2em] text-label bg-coral text-ink py-4 hover:bg-paper disabled:opacity-50"
          >
            {isLoading ? '...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            className="w-full font-mono text-small uppercase text-muted hover:text-coral tracking-wider"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </form>

        <p className="mt-12 font-mono text-[11px] uppercase text-muted tracking-[0.15em] text-center">
          © 2026 TicketRush · Hà Nội / Sài Gòn / Đà Nẵng
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
