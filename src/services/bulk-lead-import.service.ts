import { supabase } from '@/lib/supabase/client';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface LeadImportRow {
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  position?: string;
  lead_source?: string;
  sector?: string;
  estimated_value?: string;
  seller_email?: string;
  tags?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  percentage: number;
}

export interface ImportResult {
  importJobId: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    name: string;
    error: string;
  }>;
}

class BulkLeadImportService {
  // Parse CSV file
  async parseCSV(file: File): Promise<LeadImportRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: (results) => {
          resolve(results.data as LeadImportRow[]);
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  // Parse Excel file
  async parseExcel(file: File): Promise<LeadImportRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
            raw: false,
            defval: ''
          });
          
          // Transform headers to match expected format
          const transformedData = jsonData.map((row: any) => {
            const transformed: any = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
              transformed[normalizedKey] = row[key];
            });
            return transformed;
          });
          
          resolve(transformedData as LeadImportRow[]);
        } catch (error) {
          reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };
      
      reader.readAsBinaryString(file);
    });
  }

  // Validate Brazilian phone number format
  private isValidBrazilianPhone(phone: string): boolean {
    if (!phone) return true; // Optional field
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate single lead row
  validateLead(lead: LeadImportRow, rowIndex: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required field: name
    if (!lead.name?.trim()) {
      errors.push({
        row: rowIndex,
        field: 'name',
        message: 'Name is required'
      });
    }

    // Validate email format
    if (lead.email && !this.isValidEmail(lead.email)) {
      errors.push({
        row: rowIndex,
        field: 'email',
        message: 'Invalid email format'
      });
    }

    // Validate phone format (Brazilian)
    if (lead.phone && !this.isValidBrazilianPhone(lead.phone)) {
      errors.push({
        row: rowIndex,
        field: 'phone',
        message: 'Invalid phone format (use Brazilian format: 11 digits)'
      });
    }

    // Validate lead_source enum
    const validSources = ['website', 'referral', 'social_media', 'email_campaign', 'phone', 'other'];
    if (lead.lead_source && !validSources.includes(lead.lead_source.toLowerCase())) {
      errors.push({
        row: rowIndex,
        field: 'lead_source',
        message: `Invalid lead source. Must be one of: ${validSources.join(', ')}`
      });
    }

    // Validate sector enum
    const validSectors = ['retail', 'technology', 'healthcare', 'finance', 'manufacturing', 'services', 'other'];
    if (lead.sector && !validSectors.includes(lead.sector.toLowerCase())) {
      errors.push({
        row: rowIndex,
        field: 'sector',
        message: `Invalid sector. Must be one of: ${validSectors.join(', ')}`
      });
    }

    // Validate estimated_value is numeric
    if (lead.estimated_value && isNaN(Number(lead.estimated_value))) {
      errors.push({
        row: rowIndex,
        field: 'estimated_value',
        message: 'Estimated value must be a number'
      });
    }

    return errors;
  }

  // Validate all leads
  validateLeads(leads: LeadImportRow[]): ValidationError[] {
    const allErrors: ValidationError[] = [];
    
    leads.forEach((lead, index) => {
      const errors = this.validateLead(lead, index + 1);
      allErrors.push(...errors);
    });

    return allErrors;
  }

  // Check for duplicate emails in import data
  findDuplicates(leads: LeadImportRow[]): Array<{ row: number; email: string }> {
    const duplicates: Array<{ row: number; email: string }> = [];
    const emailMap = new Map<string, number>();

    leads.forEach((lead, index) => {
      if (lead.email) {
        const email = lead.email.toLowerCase();
        if (emailMap.has(email)) {
          duplicates.push({
            row: index + 1,
            email: lead.email
          });
        } else {
          emailMap.set(email, index + 1);
        }
      }
    });

    return duplicates;
  }

  // Check for existing leads in database
  async checkExistingLeads(
    companyId: string,
    emails: string[]
  ): Promise<Array<{ email: string; leadId: string }>> {
    const { data, error } = await supabase
      .from('leads')
      .select('id, email')
      .eq('company_id', companyId)
      .in('email', emails);

    if (error) throw error;

    return (data || []).map(lead => ({
      email: lead.email,
      leadId: lead.id
    }));
  }

  // Bulk import leads
  async importLeads(
    companyId: string,
    userId: string,
    leads: LeadImportRow[],
    automationId?: string
  ): Promise<ImportResult> {
    try {
      const { data, error } = await supabase.rpc('bulk_import_leads', {
        p_company_id: companyId,
        p_user_id: userId,
        p_leads: leads,
        p_automation_id: automationId || null
      });

      if (error) throw error;

      return {
        importJobId: data.import_job_id,
        totalRows: data.total_rows,
        successfulRows: data.successful_rows,
        failedRows: data.failed_rows,
        errors: data.errors || []
      };
    } catch (error) {
      throw new Error(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Get import job status
  async getImportJobStatus(importJobId: string) {
    const { data, error } = await supabase
      .from('lead_import_jobs')
      .select('*')
      .eq('id', importJobId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get import history for company
  async getImportHistory(companyId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('lead_import_jobs')
      .select(`
        id,
        filename,
        total_rows,
        successful_rows,
        failed_rows,
        status,
        created_at,
        completed_at,
        user:user_profiles(id, first_name, last_name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Download CSV template
  generateCSVTemplate(): string {
    const headers = [
      'name',
      'email',
      'phone',
      'company_name',
      'position',
      'lead_source',
      'sector',
      'estimated_value',
      'seller_email',
      'tags'
    ];

    const sampleRow = [
      'John Doe',
      'john@example.com',
      '11987654321',
      'Example Corp',
      'CEO',
      'website',
      'technology',
      '50000',
      'seller@company.com',
      'vip,hot-lead'
    ];

    return `${headers.join(',')}\n${sampleRow.join(',')}`;
  }

  // Download Excel template
  generateExcelTemplate(): Blob {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company Name',
      'Position',
      'Lead Source',
      'Sector',
      'Estimated Value',
      'Seller Email',
      'Tags'
    ];

    const sampleRow = [
      'John Doe',
      'john@example.com',
      '11987654321',
      'Example Corp',
      'CEO',
      'website',
      'technology',
      50000,
      'seller@company.com',
      'vip,hot-lead'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lead Template');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Export validation errors to CSV
  exportErrorsToCSV(errors: ValidationError[]): string {
    const headers = ['Row', 'Field', 'Error Message'];
    const rows = errors.map(error => [
      error.row.toString(),
      error.field,
      error.message
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const bulkLeadImportService = new BulkLeadImportService();