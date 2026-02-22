# ConnectWise PSA MCP Server

A custom Model Context Protocol (MCP) server for ConnectWise PSA integration with Claude Desktop and Claude Code.

## Features

This MCP server provides tools to interact with ConnectWise PSA:

### Service Desk / Tickets
- `get_tickets` - Search for service tickets with filtering
- `get_ticket` - Get a specific ticket by ID
- `create_ticket` - Create a new service ticket

### Companies & Contacts
- `get_companies` - Search for companies
- `get_company` - Get a specific company by ID
- `get_contacts` - Search for contacts
- `get_contact` - Get a specific contact by ID

### Time Entries
- `get_time_entries` - Search for time entries
- `create_time_entry` - Create a new time entry

### Configuration Items
- `get_configurations` - Search for configuration items
- `get_configuration` - Get a specific configuration item by ID

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- ConnectWise PSA API credentials:
  - Company ID
  - Public Key
  - Private Key
  - Client ID
  - API URL (e.g., https://api-na.myconnectwise.net)

## Getting Your ConnectWise API Credentials

1. Log into ConnectWise PSA
2. Go to **System** > **Members**
3. Find your member record and click on it
4. Go to the **API Keys** tab
5. Click **New** to generate a new API key pair
6. Save the **Public Key** and **Private Key** (you won't be able to see the private key again)
7. Your **Company ID** is your ConnectWise company identifier
8. For **Client ID**, you'll need to register an application in the ConnectWise Developer portal

## Installation

1. Navigate to the project directory:
```bash
cd connectwise-mcp-server
```

2. Install dependencies (already done if you ran npm install earlier):
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Configuration

### Step 1: Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your ConnectWise credentials:
```env
CONNECTWISE_COMPANY_ID=your_company_id
CONNECTWISE_PUBLIC_KEY=your_public_key
CONNECTWISE_PRIVATE_KEY=your_private_key
CONNECTWISE_CLIENT_ID=your_client_id
CONNECTWISE_API_URL=https://api-na.myconnectwise.net
```

**IMPORTANT:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### Step 2: Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "connectwise": {
      "command": "node",
      "args": [
        "C:\\path\\to\\connectwise-mcp-server\\build\\index.js"
      ],
      "env": {
        "CONNECTWISE_COMPANY_ID": "your_company_id",
        "CONNECTWISE_PUBLIC_KEY": "your_public_key",
        "CONNECTWISE_PRIVATE_KEY": "your_private_key",
        "CONNECTWISE_CLIENT_ID": "your_client_id",
        "CONNECTWISE_API_URL": "https://api-na.myconnectwise.net"
      }
    }
  }
}
```

**Note:** Update the path in `args` to match your actual installation location.

### Step 3: Restart Claude Desktop

After updating the configuration, restart Claude Desktop to load the MCP server.

## Usage Examples

Once configured, you can use natural language to interact with ConnectWise:

### Tickets
- "Show me all open tickets"
- "Get ticket #12345"
- "Create a new ticket for Acme Corp on the Service Desk board"

### Companies
- "Find all companies in Chicago"
- "Get company details for company ID 250"

### Contacts
- "Show me contacts for company 250"
- "Find contact John Smith"

### Time Entries
- "Show my time entries for today"
- "Create a time entry for ticket 12345 for 2 hours"

### Configurations
- "Show configuration items for company 250"
- "Get configuration details for config ID 1500"

## ConnectWise API Conditions

When using search functions, you can use ConnectWise API conditions syntax:

- `status/name='New'` - Find tickets with "New" status
- `company/name contains 'Acme'` - Find items for companies with "Acme" in the name
- `id > 1000` - Find items with ID greater than 1000

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Start Server
```bash
npm start
```

## Security Considerations

1. **API Credentials**: Keep your API credentials secure and never commit them to version control
2. **Least Privilege**: Use API keys with minimal required permissions
3. **Read-Only Testing**: Consider creating read-only API keys for initial testing
4. **Monitor Usage**: Regularly review API usage in ConnectWise
5. **Client ID**: Generate a unique Client ID for this application

## Troubleshooting

### Server won't start
- Check that all environment variables are set correctly
- Verify your ConnectWise API credentials are valid
- Ensure Node.js version is 18 or higher

### API errors
- Verify your API URL is correct for your region
- Check that your API keys have the necessary permissions
- Review ConnectWise API documentation for endpoint requirements

### Claude Desktop not showing the server
- Ensure the path in `claude_desktop_config.json` is correct
- Check that the server builds without errors (`npm run build`)
- Restart Claude Desktop after configuration changes

## API Documentation

For more information on ConnectWise API endpoints and parameters:
- [ConnectWise API Documentation](https://developer.connectwise.com/)

## License

MIT
