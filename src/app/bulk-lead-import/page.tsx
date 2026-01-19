'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { bulkLeadImportService, LeadImportRow, ValidationError, ImportResult } from '@/services/bulk-lead-import.service';
import { supabase } from '@/lib/supabase/client';

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
}

type ImportStep = 'upload' | 'validate' | 'map' | 'configure' | 'import' | 'complete';

export default function BulkLeadImport() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<LeadImportRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicates, setDuplicates] = useState<Array<{ row: number; email: string }>>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<string>('');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Load automations on mount
  React.useEffect(() => {
    if (userProfile?.company_id) {
      loadAutomations();
    }
  }, [userProfile?.company_id]);

  const loadAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_automations')
        .select('id, name, description')
        .eq('company_id', userProfile?.company_id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAutomations(data || []);
    } catch (err) {
      console.error('Failed to load automations:', err);
    }
  };

  // Handle file selection
  const handleFileSelect = async (selectedFile: File) => {
    setError('');
    setFile(selectedFile);

    try {
      const fileExtension = selectedFile?.name?.split('.')?.pop()?.toLowerCase();
      let data: LeadImportRow[] = [];

      if (fileExtension === 'csv') {
        data = await bulkLeadImportService.parseCSV(selectedFile);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        data = await bulkLeadImportService.parseExcel(selectedFile);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel files.');
      }

      setParsedData(data);
      setCurrentStep('validate');
      performValidation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  // Perform validation
  const performValidation = (data: LeadImportRow[]) => {
    const errors = bulkLeadImportService.validateLeads(data);
    setValidationErrors(errors);

    const dupes = bulkLeadImportService.findDuplicates(data);
    setDuplicates(dupes);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  // Download templates
  const handleDownloadCSVTemplate = () => {
    const csvContent = bulkLeadImportService.generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadExcelTemplate = () => {
    const blob = bulkLeadImportService.generateExcelTemplate();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Download error report
  const handleDownloadErrorReport = () => {
    const csvContent = bulkLeadImportService.exportErrorsToCSV(validationErrors);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_errors.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Proceed to configuration
  const handleProceedToConfiguration = () => {
    if (validationErrors.length === 0) {
      setCurrentStep('configure');
    }
  };

  // Start import
  const handleStartImport = async () => {
    if (!userProfile?.company_id || !userProfile?.id) {
      setError('User profile not loaded');
      return;
    }

    try {
      setImporting(true);
      setError('');
      setCurrentStep('import');
      setImportProgress({ current: 0, total: parsedData.length });

      const result = await bulkLeadImportService.importLeads(
        userProfile.company_id,
        userProfile.id,
        parsedData,
        selectedAutomation || undefined
      );

      setImportResult(result);
      setCurrentStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setCurrentStep('configure');
    } finally {
      setImporting(false);
    }
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Template Download Section */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Import Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Start with our standardized template to ensure your data is formatted correctly. 
              The template includes all required fields and example data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadCSVTemplate}
                className="inline-flex items-center px-4 py-2 bg-white border border-teal-300 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download CSV Template
              </button>
              <button
                onClick={handleDownloadExcelTemplate}
                className="inline-flex items-center px-4 py-2 bg-white border border-teal-300 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download Excel Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Fields</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Mandatory:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Name</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Optional:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Email</li>
              <li>• Phone (Brazilian format)</li>
              <li>• Company Name</li>
              <li>• Position</li>
              <li>• Lead Source</li>
              <li>• Sector</li>
              <li>• Estimated Value</li>
              <li>• Seller Email</li>
              <li>• Tags (comma-separated)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-teal-500 bg-teal-50' :'border-gray-300 bg-white hover:border-teal-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const selectedFile = e.target?.files?.[0];
            if (selectedFile) {
              handleFileSelect(selectedFile);
            }
          }}
          className="hidden"
        />
        <DocumentArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Drop your file here or click to browse
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Supports CSV and Excel formats (up to 10MB)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
        >
          Select File
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );

  // Render validation step
  const renderValidationStep = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Rows</div>
          <div className="text-3xl font-bold text-gray-900">{parsedData.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Valid Rows</div>
          <div className="text-3xl font-bold text-green-600">
            {parsedData.length - validationErrors.length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Errors Found</div>
          <div className="text-3xl font-bold text-red-600">{validationErrors.length}</div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Validation Errors ({validationErrors.length})
              </h3>
            </div>
            <button
              onClick={handleDownloadErrorReport}
              className="inline-flex items-center px-4 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Download Error Report
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-red-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-red-900">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-red-900">Field</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-red-900">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-100">
                {validationErrors?.slice(0, 10)?.map((error, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{error.row}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{error.field}</td>
                    <td className="px-4 py-2 text-sm text-red-600">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validationErrors.length > 10 && (
              <div className="text-center py-2 text-sm text-gray-600">
                ... and {validationErrors.length - 10} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duplicate Detection */}
      {duplicates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Duplicate Emails Detected ({duplicates.length})
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                The following email addresses appear multiple times in your import file:
              </p>
              <div className="max-h-40 overflow-y-auto">
                <ul className="text-sm text-gray-700 space-y-1">
                  {duplicates?.slice(0, 5)?.map((dup, index) => (
                    <li key={index}>
                      Row {dup.row}: {dup.email}
                    </li>
                  ))}
                </ul>
                {duplicates.length > 5 && (
                  <div className="text-sm text-gray-600 mt-2">
                    ... and {duplicates.length - 5} more duplicates
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview (First 5 rows)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parsedData?.slice(0, 5)?.map((lead, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm text-gray-900">{lead.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{lead.email || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{lead.phone || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{lead.company_name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{lead.lead_source || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            setCurrentStep('upload');
            setFile(null);
            setParsedData([]);
            setValidationErrors([]);
            setDuplicates([]);
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Upload Different File
        </button>
        <button
          onClick={handleProceedToConfiguration}
          disabled={validationErrors.length > 0}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validationErrors.length > 0
            ? 'Fix Errors to Continue' :'Proceed to Configuration'}
        </button>
      </div>
    </div>
  );

  // Render configuration step
  const renderConfigurationStep = () => (
    <div className="space-y-6">
      {/* Import Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">File:</span>
            <span className="ml-2 font-medium text-gray-900">{file?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Leads:</span>
            <span className="ml-2 font-medium text-gray-900">{parsedData.length}</span>
          </div>
        </div>
      </div>

      {/* Automation Assignment */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          WhatsApp Trigger Assignment (Optional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Automatically assign a WhatsApp automation trigger to all imported leads
        </p>
        <select
          value={selectedAutomation}
          onChange={(e) => setSelectedAutomation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">No automation (manual assignment later)</option>
          {automations?.map((automation) => (
            <option key={automation.id} value={automation.id}>
              {automation.name}
              {automation.description ? ` - ${automation.description}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('validate')}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Validation
        </button>
        <button
          onClick={handleStartImport}
          disabled={importing}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Start Import'}
        </button>
      </div>
    </div>
  );

  // Render import progress step
  const renderImportStep = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <DocumentArrowUpIcon className="w-8 h-8 text-teal-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Importing Leads...</h3>
          <p className="text-sm text-gray-600">
            Please wait while we process your import. This may take a few moments.
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-teal-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: importProgress.total > 0
                ? `${(importProgress.current / importProgress.total) * 100}%`
                : '0%'
            }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          Processing {importProgress.current} of {importProgress.total} leads...
        </p>
      </div>
    </div>
  );

  // Render completion step
  const renderCompleteStep = () => (
    <div className="space-y-6">
      {/* Success/Failure Summary */}
      <div
        className={`border rounded-lg p-8 text-center ${
          importResult?.failedRows === 0
            ? 'bg-green-50 border-green-200' :'bg-yellow-50 border-yellow-200'
        }`}
      >
        {importResult?.failedRows === 0 ? (
          <>
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Completed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              All {importResult?.successfulRows} leads have been imported successfully.
            </p>
          </>
        ) : (
          <>
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Partially Completed</h2>
            <p className="text-gray-600 mb-6">
              {importResult?.successfulRows} leads imported successfully, {importResult?.failedRows} failed.
            </p>
          </>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{importResult?.totalRows}</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Successful</div>
            <div className="text-3xl font-bold text-green-600">
              {importResult?.successfulRows}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-600">{importResult?.failedRows}</div>
          </div>
        </div>
      </div>

      {/* Error Details */}
      {importResult?.errors && importResult.errors.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Failed Imports ({importResult.errors.length})
          </h3>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importResult.errors?.map((error, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{error.row}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{error.name}</td>
                    <td className="px-4 py-2 text-sm text-red-600">{error.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/lead-management')}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
        >
          View Imported Leads
        </button>
        <button
          onClick={() => {
            setCurrentStep('upload');
            setFile(null);
            setParsedData([]);
            setValidationErrors([]);
            setDuplicates([]);
            setImportResult(null);
            setSelectedAutomation('');
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Import More Leads
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Lead Import</h1>
              <p className="mt-1 text-sm text-gray-600">
                Import multiple leads at once using CSV or Excel files
              </p>
            </div>
            <button
              onClick={() => router.push('/lead-management')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[
              { key: 'upload', label: 'Upload File' },
              { key: 'validate', label: 'Validate Data' },
              { key: 'configure', label: 'Configure' },
              { key: 'import', label: 'Import' },
              { key: 'complete', label: 'Complete' },
            ].map((step, index) => (
              <React.Fragment key={step.key}>
                <div
                  className={`flex items-center ${
                    currentStep === step.key
                      ? 'text-teal-600'
                      : ['complete'].includes(currentStep) || index < ['upload', 'validate', 'configure', 'import', 'complete'].indexOf(currentStep)
                      ? 'text-green-600' :'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      currentStep === step.key
                        ? 'border-teal-600 bg-teal-50'
                        : ['complete'].includes(currentStep) || index < ['upload', 'validate', 'configure', 'import', 'complete'].indexOf(currentStep)
                        ? 'border-green-600 bg-green-50' :'border-gray-300 bg-white'
                    }`}
                  >
                    {['complete'].includes(currentStep) || index < ['upload', 'validate', 'configure', 'import', 'complete'].indexOf(currentStep) ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.label}</span>
                </div>
                {index < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      ['complete'].includes(currentStep) || index < ['upload', 'validate', 'configure', 'import', 'complete'].indexOf(currentStep)
                        ? 'bg-green-600' :'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'validate' && renderValidationStep()}
        {currentStep === 'configure' && renderConfigurationStep()}
        {currentStep === 'import' && renderImportStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
}