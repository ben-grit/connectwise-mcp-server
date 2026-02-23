import axios, { AxiosInstance } from 'axios';

export interface ConnectWiseConfig {
  companyId: string;
  publicKey: string;
  privateKey: string;
  clientId: string;
  apiUrl: string;
}

export class ConnectWiseClient {
  private client: AxiosInstance;
  private config: ConnectWiseConfig;

  constructor(config: ConnectWiseConfig) {
    this.config = config;

    // Create base64 encoded credentials
    const credentials = Buffer.from(
      `${config.companyId}+${config.publicKey}:${config.privateKey}`
    ).toString('base64');

    this.client = axios.create({
      baseURL: `${config.apiUrl}/v4_6_release/apis/3.0`,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'clientId': config.clientId,
        'Content-Type': 'application/json',
      },
    });
  }

  // Service Desk / Tickets
  async getTickets(conditions?: string, pageSize: number = 25, orderBy?: string, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    if (orderBy) {
      params.orderBy = orderBy;
    }
    const response = await this.client.get('/service/tickets', { params });
    return response.data;
  }

  async getTicketById(ticketId: number): Promise<any> {
    const response = await this.client.get(`/service/tickets/${ticketId}`);
    return response.data;
  }

  async createTicket(ticketData: any): Promise<any> {
    const response = await this.client.post('/service/tickets', ticketData);
    return response.data;
  }

  async updateTicket(ticketId: number, operations: any[]): Promise<any> {
    const response = await this.client.patch(`/service/tickets/${ticketId}`, operations);
    return response.data;
  }

  async addTicketNote(ticketId: number, noteData: any): Promise<any> {
    const response = await this.client.post(`/service/tickets/${ticketId}/notes`, noteData);
    return response.data;
  }

  async getTicketNotes(ticketId: number, pageSize: number = 25, page: number = 1): Promise<any> {
    const response = await this.client.get(`/service/tickets/${ticketId}/notes`, {
      params: { pageSize, page },
    });
    return response.data;
  }

  // Companies
  async getCompanies(conditions?: string, pageSize: number = 25, orderBy?: string, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    if (orderBy) {
      params.orderBy = orderBy;
    }
    const response = await this.client.get('/company/companies', { params });
    return response.data;
  }

  async getCompanyById(companyId: number): Promise<any> {
    const response = await this.client.get(`/company/companies/${companyId}`);
    return response.data;
  }

  // Contacts
  async getContacts(conditions?: string, pageSize: number = 25, orderBy?: string, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    if (orderBy) {
      params.orderBy = orderBy;
    }
    const response = await this.client.get('/company/contacts', { params });
    return response.data;
  }

  async getContactById(contactId: number): Promise<any> {
    const response = await this.client.get(`/company/contacts/${contactId}`);
    return response.data;
  }

  // Time Entries
  async getTimeEntries(conditions?: string, pageSize: number = 25, orderBy?: string, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    if (orderBy) {
      params.orderBy = orderBy;
    }
    const response = await this.client.get('/time/entries', { params });
    return response.data;
  }

  async createTimeEntry(timeEntryData: any): Promise<any> {
    const response = await this.client.post('/time/entries', timeEntryData);
    return response.data;
  }

  // Configuration Items
  async getConfigurations(conditions?: string, pageSize: number = 25, orderBy?: string, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    if (orderBy) {
      params.orderBy = orderBy;
    }
    const response = await this.client.get('/company/configurations', { params });
    return response.data;
  }

  async getConfigurationById(configId: number): Promise<any> {
    const response = await this.client.get(`/company/configurations/${configId}`);
    return response.data;
  }

  async updateConfiguration(configId: number, operations: any[]): Promise<any> {
    const response = await this.client.patch(`/company/configurations/${configId}`, operations);
    return response.data;
  }

  async getConfigurationStatuses(conditions?: string, pageSize: number = 25, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) params.conditions = conditions;
    const response = await this.client.get('/company/configurations/statuses', { params });
    return response.data;
  }

  private async getAllConfigurationPages(conditions?: string): Promise<any[]> {
    const all: any[] = [];
    let page = 1;
    while (true) {
      const batch = await this.getConfigurations(conditions, 1000, undefined, page);
      all.push(...batch);
      if (batch.length < 1000) break;
      page++;
    }
    return all;
  }

  async getConfigurationSummary(typeFilter?: string, companyId?: number, statusFilter?: string): Promise<any> {
    const parts: string[] = [];
    if (typeFilter) parts.push(`type/name = "${typeFilter}"`);
    if (companyId !== undefined) parts.push(`company/id = ${companyId}`);
    if (statusFilter) parts.push(`status/name = "${statusFilter}"`);
    const conditions = parts.length > 0 ? parts.join(' AND ') : undefined;

    const configs = await this.getAllConfigurationPages(conditions);

    const byStatus: Record<string, number> = {};
    const byOS: Record<string, number> = {};
    const byCompany: Record<string, number> = {};
    let missingSerial = 0;
    let missingIP = 0;
    let missingModel = 0;

    for (const c of configs) {
      const status = c.status?.name ?? 'No Status';
      byStatus[status] = (byStatus[status] ?? 0) + 1;

      const os = c.osType?.trim() || 'Unknown';
      byOS[os] = (byOS[os] ?? 0) + 1;

      const company = c.company?.name ?? 'No Company';
      byCompany[company] = (byCompany[company] ?? 0) + 1;

      if (!c.serialNumber?.trim()) missingSerial++;
      if (!c.ipAddress?.trim()) missingIP++;
      if (!c.modelNumber?.trim()) missingModel++;
    }

    return {
      totalCount: configs.length,
      byStatus,
      byOS,
      byCompany,
      missingSerial,
      missingIP,
      missingModel,
    };
  }

  // Members
  async getMembers(conditions?: string, pageSize: number = 25, page: number = 1, orderBy?: string): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    if (orderBy) {
      params.orderBy = orderBy;
    }
    const response = await this.client.get('/system/members', { params });
    return response.data;
  }

  // Service Boards
  async getBoards(conditions?: string, pageSize: number = 25, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    const response = await this.client.get('/service/boards', { params });
    return response.data;
  }

  // Board Statuses
  async getStatuses(boardId: number, conditions?: string, pageSize: number = 25, page: number = 1): Promise<any> {
    const params: any = { pageSize, page };
    if (conditions) {
      params.conditions = conditions;
    }
    const response = await this.client.get(`/service/boards/${boardId}/statuses`, { params });
    return response.data;
  }
}
