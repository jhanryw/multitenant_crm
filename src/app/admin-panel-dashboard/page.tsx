'use client';

import React, { useEffect, useState } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/admin.service';

// Types
interface DashboardMetrics {
  stats: {
    totalCompanies: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    inactiveSubscriptions: number;
    totalMrr: number;
  } | null;
  companies: CompanyData[];
  recentTransactions: TransactionData[];
}

interface CompanyData {
  companyId: string;
  companyName: string;
  companyEmail: string | null;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  subscriptionAmount: number | null;
  isActive: boolean | null;
  createdAt: string;
  lastPaymentDate: string | null;
}

interface TransactionData {
  id: string;
  companyId: string;
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
  companyName?: string;
}

export default function AdminPanelDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    stats: null,
    companies: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await adminService.getDashboardMetrics();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setMetrics(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err?.message : 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null, currency: string = 'BRL') => {
    if (amount === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'inactive': case'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | null) => {
    if (!status) return 'Unknown';
    return status?.charAt(0)?.toUpperCase() + status?.slice(1);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-red-50 p-6 max-w-md">
          <div className="flex items-center gap-3">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={loadDashboardMetrics}
            className="mt-4 w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = metrics?.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel Dashboard</h1>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e?.target?.value)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <button className="rounded-md bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Companies */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalCompanies || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">12% from last month</span>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.activeSubscriptions || 0}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CreditCardIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">8% from last month</span>
            </div>
          </div>

          {/* MRR */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats?.totalMrr || 0)}
                </p>
              </div>
              <div className="rounded-full bg-teal-100 p-3">
                <ChartBarIcon className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">15% from last month</span>
            </div>
          </div>

          {/* Inactive/Churned */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.inactiveSubscriptions || 0}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">3% from last month</span>
            </div>
          </div>
        </div>

        {/* Recent Activity & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Companies</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics?.companies?.slice(0, 5)?.map((company) => (
                  <div key={company?.companyId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{company?.companyName}</p>
                      <p className="text-sm text-gray-500">{company?.companyEmail}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(company?.subscriptionStatus)}`}>
                      {getStatusText(company?.subscriptionStatus)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics?.recentTransactions?.slice(0, 5)?.map((transaction) => (
                  <div key={transaction?.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{transaction?.companyName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction?.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(transaction?.amount, transaction?.currency)}
                      </p>
                      <span className={`text-xs ${getStatusColor(transaction?.status)}`}>
                        {getStatusText(transaction?.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}