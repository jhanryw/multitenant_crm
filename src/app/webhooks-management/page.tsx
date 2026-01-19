'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cog6ToothIcon, 
  BoltIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { webhooksService, WebhookConfig, WebhookEvent, WhatsAppTemplate, WebhookEventType } from '@/services/webhooks.service';

export default function WebhooksManagementPage() {
  const [activeTab, setActiveTab] = useState<'configs' | 'events' | 'templates' | 'analytics'>('configs');
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock company ID - replace with actual from auth context
  const companyId = 'company-id-placeholder';

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'configs') {
        const data = await webhooksService.getWebhookConfigs(companyId);
        setConfigs(data);
      } else if (activeTab === 'events') {
        const data = await webhooksService.getWebhookEvents(companyId);
        setEvents(data);
      } else if (activeTab === 'templates') {
        const data = await webhooksService.getWhatsAppTemplates(companyId);
        setTemplates(data);
      } else if (activeTab === 'analytics') {
        const data = await webhooksService.getWebhookStats(companyId, 30);
        setStats(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryEvent = async (eventId: string) => {
    try {
      await webhooksService.retryWebhookEvent(eventId);
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to retry event');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'sent': case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending': case 'queued':
        return 'text-yellow-600 bg-yellow-50';
      case 'processing': case 'retrying':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventTypeIcon = (eventType: WebhookEventType) => {
    switch (eventType) {
      case 'cart_abandoned':
        return '🛒';
      case 'payment_failed':
        return '❌';
      case 'sale_completed':
        return '✅';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E-commerce Webhooks</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage webhook endpoints, events, and WhatsApp automation
              </p>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('configs')}
                className={`${
                  activeTab === 'configs' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Configurations
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`${
                  activeTab === 'events' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <BoltIcon className="h-5 w-5 mr-2" />
                Events
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`${
                  activeTab === 'templates' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                WhatsApp Templates
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Webhook Configurations Tab */}
            {activeTab === 'configs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Webhook Endpoints</h2>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Endpoint
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  {configs?.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No webhook configurations found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {configs?.map((config) => (
                        <div key={config.id} className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {config.endpointUrl}
                                </h3>
                                <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                                  config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {config.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {config.eventsEnabled?.map((event) => (
                                  <span key={event} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                    {getEventTypeIcon(event)} {event.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                Retry: {config.retryCount}x | Timeout: {config.timeoutSeconds}s
                              </div>
                            </div>
                            <div className="ml-4 flex space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Webhook Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Webhook Events</h2>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {events?.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No webhook events found</p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events?.map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{getEventTypeIcon(event.eventType)}</span>
                                <span className="text-sm text-gray-900">{event.eventType.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{event.customerName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{event.customerEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${event.cartValue?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {event.leadId ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircleIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(event.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              {event.status === 'failed' && (
                                <button
                                  onClick={() => handleRetryEvent(event.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Retry
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">WhatsApp Message Templates</h2>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Template
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {templates?.map((template) => (
                    <div key={template.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getEventTypeIcon(template.eventType)}</span>
                            <h3 className="text-sm font-medium text-gray-900">{template.templateName}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{template.eventType.replace('_', ' ')}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-md p-3 mb-4">
                        <p className="text-sm text-gray-700">{template.templateContent}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.variables?.map((variable) => (
                          <span key={variable} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                          Edit
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Webhook Analytics (Last 30 Days)</h2>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BoltIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Events</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Leads Created</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.leadsCreated}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Messages Sent</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.messagesSent}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Avg Processing</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.averageProcessingTime?.toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events by Type */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Events by Type</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.eventsByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getEventTypeIcon(type as WebhookEventType)}</span>
                          <span className="text-sm text-gray-700">{type.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Events by Status</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.eventsByStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}