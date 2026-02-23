#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ConnectWiseClient, ConnectWiseConfig } from './connectwise-client.js';

// Load configuration from environment variables
const config: ConnectWiseConfig = {
  companyId: process.env.CONNECTWISE_COMPANY_ID || '',
  publicKey: process.env.CONNECTWISE_PUBLIC_KEY || '',
  privateKey: process.env.CONNECTWISE_PRIVATE_KEY || '',
  clientId: process.env.CONNECTWISE_CLIENT_ID || '',
  apiUrl: process.env.CONNECTWISE_API_URL || 'https://api-na.myconnectwise.net',
};

// Validate configuration
if (!config.companyId || !config.publicKey || !config.privateKey || !config.clientId) {
  console.error('ERROR: Missing required ConnectWise credentials in environment variables');
  console.error('Required: CONNECTWISE_COMPANY_ID, CONNECTWISE_PUBLIC_KEY, CONNECTWISE_PRIVATE_KEY, CONNECTWISE_CLIENT_ID');
  process.exit(1);
}

const cwClient = new ConnectWiseClient(config);
const server = new Server(
  {
    name: 'connectwise-psa-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Ticket tools
      {
        name: 'get_tickets',
        description: 'Search for service tickets in ConnectWise PSA. Use conditions parameter for filtering (e.g., "status/name=\'New\'").',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25, max: 1000)',
              default: 25,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g., "dateEntered desc", "id asc", "lastUpdated desc")',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_ticket',
        description: 'Get a specific service ticket by ID',
        inputSchema: {
          type: 'object',
          properties: {
            ticketId: {
              type: 'number',
              description: 'The ticket ID',
            },
          },
          required: ['ticketId'],
        },
      },
      {
        name: 'create_ticket',
        description: 'Create a new service ticket',
        inputSchema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Ticket summary/title',
            },
            company: {
              type: 'object',
              description: 'Company object with id',
              properties: {
                id: { type: 'number' },
              },
              required: ['id'],
            },
            board: {
              type: 'object',
              description: 'Board object with id',
              properties: {
                id: { type: 'number' },
              },
              required: ['id'],
            },
            initialDescription: {
              type: 'string',
              description: 'Initial description/notes for the ticket',
            },
          },
          required: ['summary', 'company', 'board'],
        },
      },
      {
        name: 'update_ticket',
        description: 'Update an existing service ticket (status, priority, summary, assigned member)',
        inputSchema: {
          type: 'object',
          properties: {
            ticketId: {
              type: 'number',
              description: 'The ticket ID to update',
            },
            statusId: {
              type: 'number',
              description: 'New status ID (use get_statuses to find valid IDs)',
            },
            priorityId: {
              type: 'number',
              description: 'New priority ID',
            },
            summary: {
              type: 'string',
              description: 'New summary/title for the ticket',
            },
            assignedMemberId: {
              type: 'number',
              description: 'Member ID to assign the ticket to (use get_members to find valid IDs)',
            },
          },
          required: ['ticketId'],
        },
      },
      {
        name: 'get_ticket_notes',
        description: 'Get notes/comments on a service ticket',
        inputSchema: {
          type: 'object',
          properties: {
            ticketId: {
              type: 'number',
              description: 'The ticket ID',
            },
            pageSize: {
              type: 'number',
              description: 'Number of notes to return (default: 25)',
              default: 25,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
          required: ['ticketId'],
        },
      },
      {
        name: 'add_ticket_note',
        description: 'Add a note to a service ticket (internal analysis or customer-visible detail)',
        inputSchema: {
          type: 'object',
          properties: {
            ticketId: {
              type: 'number',
              description: 'The ticket ID to add the note to',
            },
            text: {
              type: 'string',
              description: 'The note text',
            },
            internalAnalysis: {
              type: 'boolean',
              description: 'If true, note is internal only. If false (default), note is customer-visible detail.',
              default: false,
            },
          },
          required: ['ticketId', 'text'],
        },
      },
      // Company tools
      {
        name: 'get_companies',
        description: 'Search for companies in ConnectWise PSA',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g., "name asc", "dateAcquired desc")',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_company',
        description: 'Get a specific company by ID',
        inputSchema: {
          type: 'object',
          properties: {
            companyId: {
              type: 'number',
              description: 'The company ID',
            },
          },
          required: ['companyId'],
        },
      },
      // Contact tools
      {
        name: 'get_contacts',
        description: 'Search for contacts in ConnectWise PSA',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g., "lastName asc", "id desc")',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_contact',
        description: 'Get a specific contact by ID',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'number',
              description: 'The contact ID',
            },
          },
          required: ['contactId'],
        },
      },
      // Time Entry tools
      {
        name: 'get_time_entries',
        description: 'Search for time entries in ConnectWise PSA',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g., "timeStart desc", "id desc")',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
        },
      },
      {
        name: 'create_time_entry',
        description: 'Create a new time entry',
        inputSchema: {
          type: 'object',
          properties: {
            chargeToId: {
              type: 'number',
              description: 'The ticket or project ID to charge time to',
            },
            chargeToType: {
              type: 'string',
              description: 'Type: ServiceTicket, ProjectTicket, ChargeCode, Activity',
              enum: ['ServiceTicket', 'ProjectTicket', 'ChargeCode', 'Activity'],
            },
            member: {
              type: 'object',
              description: 'Member object with identifier',
              properties: {
                identifier: { type: 'string' },
              },
              required: ['identifier'],
            },
            timeStart: {
              type: 'string',
              description: 'Start time (ISO 8601 format)',
            },
            timeEnd: {
              type: 'string',
              description: 'End time (ISO 8601 format)',
            },
            notes: {
              type: 'string',
              description: 'Time entry notes',
            },
          },
          required: ['chargeToId', 'chargeToType', 'member', 'timeStart', 'timeEnd'],
        },
      },
      // Configuration tools
      {
        name: 'get_configurations',
        description: 'Search for configuration items in ConnectWise PSA',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g., "name asc", "id desc")',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_configuration',
        description: 'Get a specific configuration item by ID',
        inputSchema: {
          type: 'object',
          properties: {
            configId: {
              type: 'number',
              description: 'The configuration ID',
            },
          },
          required: ['configId'],
        },
      },
      // Member tools
      {
        name: 'get_members',
        description: 'Search for members (technicians/staff) in ConnectWise PSA',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g., "lastName asc")',
            },
          },
        },
      },
      // Board tools
      {
        name: 'get_boards',
        description: 'Search for service boards in ConnectWise PSA',
        inputSchema: {
          type: 'object',
          properties: {
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
        },
      },
      {
        name: 'get_statuses',
        description: 'Get available statuses for a specific service board',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'number',
              description: 'The board ID to retrieve statuses for (use get_boards to find board IDs)',
            },
            conditions: {
              type: 'string',
              description: 'ConnectWise API conditions string for filtering (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
          },
          required: ['boardId'],
        },
      },
      // Configuration analytics tools
      {
        name: 'get_configuration_summary',
        description: 'Get an aggregated summary of configuration items (counts by status, OS, company) without returning raw records. Avoids token overflow on large datasets.',
        inputSchema: {
          type: 'object',
          properties: {
            typeFilter: {
              type: 'string',
              description: 'Limit to a specific configuration type name (e.g. "Managed Workstation")',
            },
            companyId: {
              type: 'number',
              description: 'Limit to a specific company ID (optional)',
            },
            statusFilter: {
              type: 'string',
              description: 'Limit to a specific status name (e.g. "Active"). Omit to include all statuses (Active, Inactive, Automate Inactive, etc.)',
            },
          },
        },
      },
      {
        name: 'get_stale_configurations',
        description: 'Find inactive configuration items that have not been updated in a given number of days',
        inputSchema: {
          type: 'object',
          properties: {
            daysOld: {
              type: 'number',
              description: 'Flag configs not updated in this many days (default: 365)',
              default: 365,
            },
            typeFilter: {
              type: 'string',
              description: 'Limit to a specific configuration type name (e.g. "Managed Workstation")',
            },
            companyId: {
              type: 'number',
              description: 'Limit to a specific company ID (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 100)',
              default: 100,
            },
          },
        },
      },
      {
        name: 'find_duplicate_configurations',
        description: 'Find configuration items that share the same name within the same company',
        inputSchema: {
          type: 'object',
          properties: {
            typeFilter: {
              type: 'string',
              description: 'Limit to a specific configuration type name (e.g. "Managed Workstation")',
            },
            companyId: {
              type: 'number',
              description: 'Limit to a specific company ID (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'How many configs to scan (default: 1000)',
              default: 1000,
            },
          },
        },
      },
      {
        name: 'get_configurations_by_type',
        description: 'Search configuration items by type name (convenience wrapper — no need to write raw conditions syntax)',
        inputSchema: {
          type: 'object',
          properties: {
            typeName: {
              type: 'string',
              description: 'Configuration type name, e.g. "Managed Workstation" or "Managed Server"',
            },
            conditions: {
              type: 'string',
              description: 'Additional ConnectWise conditions to AND with the type filter (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 25)',
              default: 25,
            },
            page: {
              type: 'number',
              description: 'Page number for pagination (default: 1)',
              default: 1,
            },
            orderBy: {
              type: 'string',
              description: 'Field to sort by with optional direction (e.g. "name asc", "company/name asc")',
            },
          },
          required: ['typeName'],
        },
      },
      // Analytics tools
      {
        name: 'get_stale_tickets',
        description: 'Find open tickets that may need attention based on age or hours logged',
        inputSchema: {
          type: 'object',
          properties: {
            daysOld: {
              type: 'number',
              description: 'Flag tickets not updated in this many days (default: 14)',
              default: 14,
            },
            maxHours: {
              type: 'number',
              description: 'Flag tickets with actualHours exceeding this value (optional)',
            },
            boardId: {
              type: 'number',
              description: 'Limit results to a specific board ID (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 50)',
              default: 50,
            },
          },
        },
      },
      {
        name: 'get_ticket_trends',
        description: 'Retrieve tickets created within a lookback period for trend analysis',
        inputSchema: {
          type: 'object',
          properties: {
            days: {
              type: 'number',
              description: 'Lookback period in days (default: 30)',
              default: 30,
            },
            companyId: {
              type: 'number',
              description: 'Limit results to a specific company ID (optional)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results to return (default: 100)',
              default: 100,
            },
          },
        },
      },
    ],
  };
});

function withActualHours(ticket: any): any {
  return { ...ticket, actualHours: ticket.actualHours ?? 0 };
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    const params = (args || {}) as any;

    switch (name) {
      // Ticket operations
      case 'get_tickets': {
        const result = await cwClient.getTickets(params.conditions, params.pageSize, params.orderBy, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.map(withActualHours), null, 2),
            },
          ],
        };
      }

      case 'get_ticket': {
        const result = await cwClient.getTicketById(params.ticketId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(withActualHours(result), null, 2),
            },
          ],
        };
      }

      case 'create_ticket': {
        const { initialDescription, ...ticketBody } = params;
        const result = await cwClient.createTicket(ticketBody);
        if (initialDescription) {
          await cwClient.addTicketNote(result.id, {
            text: initialDescription,
            detailDescriptionFlag: true,
            internalAnalysisFlag: false,
            resolutionFlag: false,
          });
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_ticket': {
        const { ticketId, statusId, priorityId, summary, assignedMemberId } = params;
        const operations: any[] = [];
        if (statusId !== undefined) {
          operations.push({ op: 'replace', path: '/status/id', value: statusId });
        }
        if (priorityId !== undefined) {
          operations.push({ op: 'replace', path: '/priority/id', value: priorityId });
        }
        if (summary !== undefined) {
          operations.push({ op: 'replace', path: '/summary', value: summary });
        }
        if (assignedMemberId !== undefined) {
          operations.push({ op: 'replace', path: '/owner/id', value: assignedMemberId });
        }
        if (operations.length === 0) {
          throw new Error('update_ticket requires at least one field to update (statusId, priorityId, summary, or assignedMemberId)');
        }
        const result = await cwClient.updateTicket(ticketId, operations);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_ticket_notes': {
        const result = await cwClient.getTicketNotes(params.ticketId, params.pageSize, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'add_ticket_note': {
        const internalAnalysis = params.internalAnalysis ?? false;
        const result = await cwClient.addTicketNote(params.ticketId, {
          text: params.text,
          detailDescriptionFlag: !internalAnalysis,
          internalAnalysisFlag: internalAnalysis,
          resolutionFlag: false,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Company operations
      case 'get_companies': {
        const result = await cwClient.getCompanies(params.conditions, params.pageSize, params.orderBy, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_company': {
        const result = await cwClient.getCompanyById(params.companyId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Contact operations
      case 'get_contacts': {
        const result = await cwClient.getContacts(params.conditions, params.pageSize, params.orderBy, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_contact': {
        const result = await cwClient.getContactById(params.contactId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Time Entry operations
      case 'get_time_entries': {
        const result = await cwClient.getTimeEntries(params.conditions, params.pageSize, params.orderBy, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_time_entry': {
        const result = await cwClient.createTimeEntry(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Configuration operations
      case 'get_configurations': {
        const result = await cwClient.getConfigurations(params.conditions, params.pageSize, params.orderBy, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_configuration': {
        const result = await cwClient.getConfigurationById(params.configId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Member operations
      case 'get_members': {
        const result = await cwClient.getMembers(params.conditions, params.pageSize, params.page, params.orderBy);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Board operations
      case 'get_boards': {
        const result = await cwClient.getBoards(params.conditions, params.pageSize, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_statuses': {
        const result = await cwClient.getStatuses(params.boardId, params.conditions, params.pageSize, params.page);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // Configuration analytics operations
      case 'get_configuration_summary': {
        const result = await cwClient.getConfigurationSummary(params.typeFilter, params.companyId, params.statusFilter);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_stale_configurations': {
        const daysOld = params.daysOld ?? 365;
        const pageSize = params.pageSize ?? 100;
        const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const parts: string[] = [`activeFlag = false`, `lastUpdated < [${cutoffDate}]`];
        if (params.typeFilter) parts.push(`type/name = "${params.typeFilter}"`);
        if (params.companyId !== undefined) parts.push(`company/id = ${params.companyId}`);
        const conditions = parts.join(' AND ');

        const configs = await cwClient.getConfigurations(conditions, pageSize, 'lastUpdated asc');
        const enriched = configs.map((c: any) => {
          const staleReasons: string[] = [`Not updated in over ${daysOld} days`];
          return { ...c, staleReasons };
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(enriched, null, 2) }],
        };
      }

      case 'find_duplicate_configurations': {
        const pageSize = params.pageSize ?? 1000;
        const parts: string[] = [];
        if (params.typeFilter) parts.push(`type/name = "${params.typeFilter}"`);
        if (params.companyId !== undefined) parts.push(`company/id = ${params.companyId}`);
        const conditions = parts.length > 0 ? parts.join(' AND ') : undefined;

        const configs = await cwClient.getConfigurations(conditions, pageSize);
        const groups: Record<string, any[]> = {};
        for (const c of configs) {
          const key = `${c.company?.id ?? 'none'}||${c.name}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(c);
        }
        const duplicates = Object.values(groups)
          .filter(g => g.length > 1)
          .map(g => ({
            name: g[0].name,
            company: g[0].company?.name ?? 'Unknown',
            count: g.length,
            ids: g.map((c: any) => c.id),
            items: g,
          }))
          .sort((a, b) => b.count - a.count);
        return {
          content: [{ type: 'text', text: JSON.stringify(duplicates, null, 2) }],
        };
      }

      case 'get_configurations_by_type': {
        let cond = `type/name = "${params.typeName}"`;
        if (params.conditions) cond += ` AND ${params.conditions}`;
        const result = await cwClient.getConfigurations(cond, params.pageSize, params.orderBy, params.page);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      // Analytics operations
      case 'get_stale_tickets': {
        const daysOld = params.daysOld ?? 14;
        const maxHours = params.maxHours;
        const boardId = params.boardId;
        const pageSize = params.pageSize ?? 50;

        const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let conditions = `status/closedFlag=false AND lastUpdated < [${cutoffDate}]`;
        if (maxHours !== undefined) {
          conditions = `status/closedFlag=false AND (lastUpdated < [${cutoffDate}] OR actualHours > ${maxHours})`;
        }
        if (boardId !== undefined) {
          conditions += ` AND board/id=${boardId}`;
        }

        const tickets = await cwClient.getTickets(conditions, pageSize, 'lastUpdated asc');
        const enriched = tickets.map((ticket: any) => {
          const t = withActualHours(ticket);
          const staleReasons: string[] = [];
          if (t.lastUpdated && new Date(t.lastUpdated) < new Date(cutoffDate)) {
            staleReasons.push(`No updates in over ${daysOld} days`);
          }
          if (maxHours !== undefined && t.actualHours > maxHours) {
            staleReasons.push(`Hours logged (${t.actualHours}) exceeds threshold (${maxHours})`);
          }
          return { ...t, staleReasons };
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(enriched, null, 2),
            },
          ],
        };
      }

      case 'get_ticket_trends': {
        const days = params.days ?? 30;
        const companyId = params.companyId;
        const pageSize = params.pageSize ?? 100;

        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let conditions = `dateEntered > [${cutoffDate}]`;
        if (companyId !== undefined) {
          conditions += ` AND company/id=${companyId}`;
        }

        const tickets = await cwClient.getTickets(conditions, pageSize, 'dateEntered desc');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tickets.map(withActualHours), null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ConnectWise PSA MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
