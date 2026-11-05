import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerProfile from './CustomerProfile';

const { getCustomerProfile } = vi.hoisted(() => ({ getCustomerProfile: vi.fn() }));

vi.mock('../services/spendingService', () => ({
  spendingService: { getCustomerProfile },
}));

const profile = {
  id: '12345',
  name: 'Tshifhiwa Makherana',
  email: 'fifi@gmail.com',
  accountType: 'Savings account',
  joinDate: '2025-08-13',
  totalSpent: 15420.5,
  spentSince: '2026-05-09',
};

describe('CustomerProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows the customer details', async () => {
    getCustomerProfile.mockResolvedValue(profile);
    render(<CustomerProfile />);

    expect(await screen.findByText('Tshifhiwa Makherana')).toBeInTheDocument();
    expect(screen.getByText('TM')).toBeInTheDocument();
    expect(screen.getByText('fifi@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('Savings account')).toBeInTheDocument();
    expect(screen.getByText('13/08/2025')).toBeInTheDocument();
    expect(screen.getByText('since 09/05/2026')).toBeInTheDocument();
  });

  it('shows an error when the profile cannot be loaded', async () => {
    getCustomerProfile.mockRejectedValue(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<CustomerProfile />);

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
  });
});