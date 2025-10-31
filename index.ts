import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Initialize the MCP client for Cisco Support
async function initializeMCPClient() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "mcp-cisco-support"],
    env: {
      CISCO_CLIENT_ID: process.env.CISCO_CLIENT_ID!,
      CISCO_CLIENT_SECRET: process.env.CISCO_CLIENT_SECRET!,
      SUPPORT_API: "all", // Enable the APIs you need
    },
  });

  const client = new Client(
    {
      name: "langchain-cisco-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  return client;
}

// Convert MCP tools to LangChain tools
async function createLangChainToolsFromMCP(mcpClient: Client) {
  const mcpTools = await mcpClient.listTools();

  const langchainTools = mcpTools.tools.map((mcpTool) => {
    return tool(
      async (input: any) => {
        const result = await mcpClient.callTool({
          name: mcpTool.name,
          arguments: input,
        });

        // Extract the content from the MCP response
        if (result.content && result.content.length > 0) {
          const textContent = result.content.find((c: any) => c.type === "text");
          return textContent?.text || JSON.stringify(result.content);
        }
        return "No response from tool";
      },
      {
        name: mcpTool.name,
        description: mcpTool.description || `MCP tool: ${mcpTool.name}`,
        schema: z.object(
          mcpTool.inputSchema?.properties
            ? Object.fromEntries(
                Object.entries(mcpTool.inputSchema.properties).map(([key, value]: [string, any]) => [
                  key,
                  value.type === "string" ? z.string().describe(value.description || "") : z.any(),
                ])
              )
            : {}
        ),
      }
    );
  });

  return langchainTools;
}

async function main() {
  console.log("Initializing MCP client for Cisco Support...");
  const mcpClient = await initializeMCPClient();

  console.log("Converting MCP tools to LangChain tools...");
  const ciscoTools = await createLangChainToolsFromMCP(mcpClient);

  console.log(`Loaded ${ciscoTools.length} Cisco Support tools`);

  // Create the OpenAI model configured for OpenRouter
  const model = new ChatOpenAI({
    model: "anthropic/claude-3.5-sonnet",
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "LangChain Cisco MCP Agent",
      },
    },
  });

  // Create agent with Cisco Support tools
  const agent = createAgent({
    model: model,
    tools: ciscoTools,
  });

  // Example queries - uncomment the one you want to try
  const queries = [
    "Search for recent bugs related to 'crash' in Cisco products",
    "Find high-severity bugs modified in the last 30 days",
    "Search for bugs affecting Catalyst 9200 series",
  ];

  console.log("\nRunning query:", queries[0]);
  const result = await agent.invoke({
    messages: [{ role: "user", content: queries[0] }],
  });

  console.log("\n--- Agent Response ---");
  console.log(JSON.stringify(result, null, 2));

  // Clean up
  await mcpClient.close();
}

main().catch(console.error);
