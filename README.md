# LangChain + OpenRouter + Cisco MCP Example

This project demonstrates how to use LangChain with OpenRouter and integrate MCP (Model Context Protocol) servers, specifically the Cisco Support MCP server.

## Files

- **[index.ts](index.ts)** - Basic LangChain agent example with OpenRouter
- **[cisco-mcp-example.ts](cisco-mcp-example.ts)** - LangChain agent integrated with Cisco Support MCP server

## Prerequisites

1. **OpenRouter API Key**
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Get your API key from the dashboard

2. **Cisco API Credentials** (for MCP example)
   - Visit [Cisco API Console](https://apiconsole.cisco.com/)
   - Create an application
   - Get your Client ID and Client Secret
   - Ensure your app has access to Bug API, Case API, EoX API, and PSIRT API

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Edit the [.env](.env) file and add your credentials:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   CISCO_CLIENT_ID=your_cisco_client_id
   CISCO_CLIENT_SECRET=your_cisco_client_secret
   ```

## Running Examples

### Basic Example (Weather Tool)

```bash
npx tsx index.ts
```

This runs a simple agent with a custom weather tool using Claude 3.5 Sonnet via OpenRouter.

### Cisco MCP Example

```bash
npx tsx cisco-mcp-example.ts
```

This example:
1. Connects to the Cisco Support MCP server
2. Loads all available Cisco Support API tools (Bug, Case, EoX, PSIRT)
3. Converts them to LangChain tools
4. Creates an agent that can use these tools
5. Runs a query about Cisco bugs

## Example Queries for Cisco MCP

Once you have the Cisco credentials configured, you can ask questions like:

- "Search for recent bugs related to 'crash' in Cisco products"
- "Find high-severity bugs modified in the last 30 days"
- "Search for bugs affecting Catalyst 9200 series"
- "Get details for bug CSCab12345"
- "Show me end-of-life information for product XYZ"

## Available Cisco Support APIs

The MCP server provides access to:

1. **Bug API** (14 tools) - Bug search and details
2. **Case API** (4 tools) - Support case management
3. **EoX API** (4 tools) - End-of-Life information
4. **PSIRT API** (8 tools) - Security vulnerabilities
5. **Product API** (3 tools) - Product information
6. **Software API** (6 tools) - Software releases
7. **Serial API** (3 tools) - Serial number lookups
8. **RMA API** (3 tools) - Return authorization

## Customization

### Change the AI Model

In [cisco-mcp-example.ts](cisco-mcp-example.ts:73-81), you can change the model to any OpenRouter-supported model:

```typescript
const model = new ChatOpenAI({
  model: "anthropic/claude-3.5-sonnet", // Change this
  apiKey: process.env.OPENROUTER_API_KEY,
  // ...
});
```

Popular options:
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4-turbo`
- `google/gemini-pro`
- `meta-llama/llama-3.1-70b-instruct`

### Enable/Disable Cisco APIs

In [cisco-mcp-example.ts](cisco-mcp-example.ts:13), modify the `SUPPORT_API` environment variable:

```typescript
SUPPORT_API: "bug,case,eox,psirt", // Add or remove APIs
```

Options: `bug`, `case`, `eox`, `psirt`, `product`, `software`, `serial`, `rma`, or `all`

## Architecture

```
LangChain Agent (with OpenRouter)
    ↓
MCP Client (connects to Cisco Support MCP Server)
    ↓
Cisco Support APIs (Bug, Case, EoX, PSIRT, etc.)
```

The MCP client acts as a bridge between LangChain and the Cisco Support APIs, providing structured tool definitions that the agent can use.

## Troubleshooting

### "No cookie auth credentials found" error
- Make sure you're using `apiKey` not `openAIApiKey` in the ChatOpenAI configuration
- Ensure your `.env` file doesn't have `export` statements (just `KEY=value`)

### MCP connection errors
- Verify your Cisco Client ID and Secret are correct
- Check that `npx mcp-cisco-support` can run standalone
- Ensure you have network access to Cisco's API servers

### TypeScript errors
- Make sure `@types/node` is installed: `npm install --save-dev @types/node`
- Verify `"type": "module"` is in [package.json](package.json)

## Resources

- [LangChain Documentation](https://js.langchain.com/)
- [OpenRouter](https://openrouter.ai/)
- [Cisco Support MCP Server](https://github.com/sieteunoseis/mcp-cisco-support)
- [Cisco API Console](https://apiconsole.cisco.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
