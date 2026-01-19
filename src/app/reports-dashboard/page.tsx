'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import MobileSidebar from '../../components/common/MobileSidebar';
import { reportsService, SLAAverages, RevenueBySeller, RevenueByTags, LeadActivity } from '../../services/reports.service';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1fc2a9', '#107c65', '#0d5f4d', '#6ee7d7', '#ff6b6b'];

export default function ReportsDashboard() {
  const { user, userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // State for report data
  const [slaData, setSlaData] = useState<SLAAverages | null>(null);
  const [revenueBySeller, setRevenueBySeller] = useState<RevenueBySeller[]>([]);
  const [revenueByTags, setRevenueByTags] = useState<RevenueByTags[]>([]);
  const [openNegotiationsValue, setOpenNegotiationsValue] = useState<number>(0);
  const [leadActivity, setLeadActivity] = useState<LeadActivity | null>(null);

  // Filter state
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user?.id && userProfile?.company_id) {
      loadReportsData();
    }
  }, [user?.id, userProfile?.company_id, startDate, endDate]);

  const loadReportsData = async () => {
    if (!user?.id || !userProfile?.company_id) return;

    try {
      setLoading(true);
      setError('');

      const companyId = userProfile.company_id;

      const [slaResult, sellerResult, tagsResult, negotiationsResult, activityResult] = await Promise.all([
        reportsService.getSLAAverages(companyId, startDate, endDate),
        reportsService.getRevenueBySeller(companyId, startDate, endDate),
        reportsService.getRevenueByTags(companyId, startDate, endDate),
        reportsService.getOpenNegotiationsValue(companyId),
        reportsService.getLeadActivity(companyId, startDate, endDate),
      ]);

      if (slaResult?.error) throw slaResult.error;
      if (sellerResult?.error) throw sellerResult.error;
      if (tagsResult?.error) throw tagsResult.error;
      if (negotiationsResult?.error) throw negotiationsResult.error;
      if (activityResult?.error) throw activityResult.error;

      setSlaData(slaResult?.data ?? null);
      setRevenueBySeller(sellerResult?.data ?? []);
      setRevenueByTags(tagsResult?.data ?? []);
      setOpenNegotiationsValue(negotiationsResult?.data ?? 0);
      setLeadActivity(activityResult?.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!userProfile?.company_id) {
      setError('Company information not available');
      return;
    }
    
    const companyId = userProfile.company_id;
    const { error } = await reportsService.exportToExcel(companyId, { startDate, endDate });
    if (error) {
      setError(error.message);
    }
  };

  const handleExportPDF = async () => {
    if (!userProfile?.company_id) {
      setError('Company information not available');
      return;
    }
    
    const companyId = userProfile.company_id;
    const { error } = await reportsService.exportToPDF(companyId, { startDate, endDate });
    if (error) {
      setError(error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports Dashboard</h1>
            <p className="text-gray-600">Comprehensive analytics and business intelligence</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadReportsData}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">SLA Performance</h3>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {slaData ? Math.round((slaData.onTimeLeads / slaData.totalLeads) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {slaData?.onTimeLeads ?? 0} of {slaData?.totalLeads ?? 0} on time
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(revenueBySeller?.reduce((sum, seller) => sum + (seller?.totalRevenue ?? 0), 0) ?? 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Period total</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Open Negotiations</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(openNegotiationsValue)}</p>
              <p className="text-sm text-gray-500 mt-1">In pipeline</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {leadActivity?.conversionRate?.toFixed(1) ?? 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {leadActivity?.convertedLeads ?? 0} of {leadActivity?.newLeads ?? 0} leads
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue by Seller Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Seller</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueBySeller}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sellerName" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#1fc2a9" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Tags Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Tags</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByTags}
                    dataKey="totalRevenue"
                    nameKey="tagName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry?.tagName}: ${formatCurrency(entry?.totalRevenue ?? 0)}`}
                  >
                    {revenueByTags?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SLA Performance Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Performance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{slaData?.onTimeLeads ?? 0}</p>
                <p className="text-sm text-gray-600 mt-1">On Time</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{slaData?.warningLeads ?? 0}</p>
                <p className="text-sm text-gray-600 mt-1">Warning</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{slaData?.overdueLeads ?? 0}</p>
                <p className="text-sm text-gray-600 mt-1">Overdue</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {slaData?.averageResponseTime?.toFixed(1) ?? 0}h
                </p>
                <p className="text-sm text-gray-600 mt-1">Avg Response Time</p>
              </div>
            </div>
          </div>

          {/* Lead Activity Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Lead Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">New Leads</span>
                  <span className="text-2xl font-bold text-teal-600">{leadActivity?.newLeads ?? 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Converted</span>
                  <span className="text-2xl font-bold text-green-600">{leadActivity?.convertedLeads ?? 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        leadActivity?.newLeads
                          ? ((leadActivity?.convertedLeads ?? 0) / leadActivity.newLeads) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Lost</span>
                  <span className="text-2xl font-bold text-red-600">{leadActivity?.lostLeads ?? 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${
                        leadActivity?.newLeads ? ((leadActivity?.lostLeads ?? 0) / leadActivity.newLeads) * 100 : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}