import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import { AuthScreen } from '../app/components/AuthScreen';
import { gql } from '@apollo/client';
import { describe, it, expect, vi } from 'vitest';

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

// Mock AuthContext
vi.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

describe('AuthScreen', () => {
  it('renders login form by default', () => {
    render(
      <MockedProvider mocks={[]}>
        <AuthScreen />
      </MockedProvider>
    );

    expect(screen.getByRole('heading', { name: /TICKETRUSH/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
  });

  it('validates email input', async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={[]}>
        <AuthScreen />
      </MockedProvider>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');

    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('validates password minimum length', () => {
    render(
      <MockedProvider mocks={[]}>
        <AuthScreen />
      </MockedProvider>
    );

    const passwordInput = screen.getByLabelText(/Mật khẩu/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('minLength', '8');
  });

  it('switches to register mode', async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={[]}>
        <AuthScreen />
      </MockedProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /Chưa có tài khoản\? Đăng ký/i });
    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: /Tạo tài khoản/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đã có tài khoản\? Đăng nhập/i })).toBeInTheDocument();
  });

  it('handles successful registration', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: REGISTER,
          variables: { email: 'newuser@example.com', password: 'password123' },
        },
        result: {
          data: {
            register: {
              id: '123',
              email: 'newuser@example.com',
            },
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthScreen />
      </MockedProvider>
    );

    // Switch to register mode
    await user.click(screen.getByRole('button', { name: /Chưa có tài khoản\? Đăng ký/i }));

    // Fill form
    await user.type(screen.getByLabelText(/Email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/Mật khẩu/i), 'password123');

    // Submit
    await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }));

    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/Đăng ký thành công/i)).toBeInTheDocument();
    });
  });

  it('handles login error', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: LOGIN,
          variables: { email: 'test@example.com', password: 'wrongpass' },
        },
        error: new Error('Invalid credentials'),
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthScreen />
      </MockedProvider>
    );

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Mật khẩu/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /Đăng nhập/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
