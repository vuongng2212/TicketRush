'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

const LOGIN_ADMIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user { id email roles }
    }
  }
`;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMutation, { loading }] = useMutation(LOGIN_ADMIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await loginMutation({ variables: { email, password } });
      const auth = (res.data as { login?: { token: string; user: { id: string; email: string; roles: string[] } } } | null | undefined)?.login;
      
      if (!auth) {
        setError('Đăng nhập thất bại');
        return;
      }

      // Check for ROLE_ADMIN
      if (!auth.user.roles.includes('ROLE_ADMIN')) {
        setError('Tài khoản không có quyền admin');
        return;
      }

      // Save admin token separately
      localStorage.setItem('ticketrush_admin_token', auth.token);
      
      // Redirect to scanner
      router.push('/admin/scanner');
    } catch (err) {
      setError((err as Error).message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-coral text-[64px] uppercase tracking-[-0.02em] leading-none text-center mb-2">
          ADMIN
        </h1>
        <p className="font-mono text-label uppercase text-muted tracking-[0.2em] text-center mb-12">
          Scanner Login
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
              placeholder="admin@ticketrush.vn"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-paper border-b border-hairline focus:border-coral py-3 font-body text-body outline-none"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="font-mono text-small text-coral border-l-2 border-coral pl-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-label uppercase tracking-[0.2em] text-label bg-coral text-ink py-4 hover:bg-paper disabled:opacity-50"
          >
            {loading ? '...' : 'Đăng nhập Admin'}
          </button>
        </form>

        <p className="mt-12 font-mono text-[11px] uppercase text-muted tracking-[0.15em] text-center">
          © 2026 TicketRush · Admin Portal
        </p>
      </div>
    </div>
  );
}
