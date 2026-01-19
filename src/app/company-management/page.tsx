'use client';

import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/admin.service';

// Types
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

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await adminService.getCompanies();

      if (fetchError) throw fetchError;

      if (data) {
        setCompanies(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err?.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = companies;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered?.filter(
        (c) => c?.subscriptionStatus?.toLowerCase() === statusFilter?.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm?.toLowerCase();
      filtered = filtered?.filter(
        (c) =>
          c?.companyName?.toLowerCase()?.includes(searchLower) ||
          c?.companyEmail?.toLowerCase()?.includes(searchLower)
      );
    }

    setFilteredCompanies(filtered);
  };

  const handleToggleAccess = async (companyId: string, currentStatus: boolean | null) => {
    try {
      const { error: updateError } = await adminService.toggleCompanyAccess(
        companyId,
        !currentStatus
      );

      if (updateError) throw updateError;

      // Reload companies
      await loadCompanies();
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err?.message : 'Failed to update company access');
    }
  };

  const handleUpdateStatus = async (companyId: string, newStatus: string) => {
    try {
      const { error: updateError } = await adminService.updateSubscriptionStatus(
        companyId,
        newStatus
      );

      if (updateError) throw updateError;

      // Reload companies
      await loadCompanies();
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err?.message : 'Failed to update subscription status');
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

  const getStatusBadge = (status: string | null, isActive: boolean | null) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
          <XCircleIcon className="h-4 w-4" />
          Blocked
        </span>
      );
    }

    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            <CheckCircleIcon className="h-4 w-4" />
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Trial
          </span>
        );
      case 'inactive': case'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            <ExclamationTriangleIcon className="h-4 w-4" />
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-red-50 p-6 max-w-md">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadCompanies}
            className="mt-4 w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              placeholder="Search by company name or email..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e?.target?.value)}
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Company Table */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  MRR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCompanies?.map((company) => (
                <tr key={company?.companyId} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{company?.companyName}</div>
                      <div className="text-sm text-gray-500">{company?.companyEmail}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {company?.subscriptionPlan || 'No Plan'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(company?.subscriptionAmount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(company?.subscriptionStatus, company?.isActive)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(company?.lastPaymentDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowModal(true);
                      }}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Management Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage {selectedCompany?.companyName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Access
                </label>
                <button
                  onClick={() =>
                    handleToggleAccess(selectedCompany?.companyId, selectedCompany?.isActive)
                  }
                  className={`w-full rounded-md px-4 py-2 text-white ${
                    selectedCompany?.isActive
                      ? 'bg-red-600 hover:bg-red-700' :'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selectedCompany?.isActive ? 'Block Company' : 'Unblock Company'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Status
                </label>
                <select
                  onChange={(e) =>
                    handleUpdateStatus(selectedCompany?.companyId, e?.target?.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none"
                  defaultValue={selectedCompany?.subscriptionStatus || ''}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}