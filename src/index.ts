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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    const params = (args || {}) as any;

    switch (name) {
      // Ticket operations
      case 'get_tickets': {
        const result = await cwClient.getTickets(params.conditions, params.pageSize, params.orderBy);
        // Ensure actualHours is always present (defaults to 0 if not returned by API)
        const ticketsWithHours = result.map((ticket: any) => ({
          ...ticket,
          actualHours: ticket.actualHours ?? 0,
        }));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ticketsWithHours, null, 2),
            },
          ],
        };
      }

      case 'get_ticket': {
        const result = await cwClient.getTicketById(params.ticketId);
        // Ensure actualHours is always present (defaults to 0 if not returned by API)
        const ticketWithHours = {
          ...result,
          actualHours: result.actualHours ?? 0,
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ticketWithHours, null, 2),
            },
          ],
        };
      }

      case 'create_ticket': {
        const result = await cwClient.createTicket(params);
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
        const result = await cwClient.getCompanies(params.conditions, params.pageSize, params.orderBy);
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
        const result = await cwClient.getContacts(params.conditions, params.pageSize, params.orderBy);
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
        const result = await cwClient.getTimeEntries(params.conditions, params.pageSize, params.orderBy);
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
        const result = await cwClient.getConfigurations(params.conditions, params.pageSize, params.orderBy);
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
