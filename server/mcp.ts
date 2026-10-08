// Daily Bouquet - an MCP server (stdio) so any model that speaks MCP can put flowers in the vase: Claude Desktop,
// Claude Code, or your own agent. It writes to the same DATA_DIR as the HTTP server, so the page shows what it arranges.
// The tools (arrange, recent, catalog, today) live in server/mcpServer.ts; remote clients reach the same ones at /mcp.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcpServer.ts';

await createMcpServer().connect(new StdioServerTransport());
