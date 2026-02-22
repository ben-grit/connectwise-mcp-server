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
}
