import { render, screen } from '@testing-library/react';
import Rewards from './page';
import { useAuthStore } from '@/store/authStore';
import { expect, it, describe, vi } from 'vitest';

// Mock the auth store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Rewards Page', () => {
  it('renders user badge and coin balance correctly', () => {
    // Mock user state
    (useAuthStore as any).mockReturnValue({
      user: {
        badge_count: 150,
        coin_count: 500,
        name: 'Test User',
        email: 'test@example.com',
        user_level: 'BRONZE'
      },
      session: { access_token: 'fake-token' },
      loading: false,
      initializeAuth: vi.fn(),
    });

    (useAuthStore as any).getState = () => ({
        loading: false,
        user: { badge_count: 150 }
    });

    render(<Rewards />);

    // Check if the balance and title are displayed
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Reward Shop')).toBeInTheDocument();
  });
});
