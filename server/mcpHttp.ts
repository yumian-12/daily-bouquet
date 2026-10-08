// Daily Bouquet - the MCP server over Streamable HTTP, for remote MCP clients: POST /mcp on the HTTP server (server/index.ts),
// so it shares PORT and DATA_DIR with the API and the page. Stateless: a fresh server and transport per request, no sessions.
// If VASE_TOKEN is set, it asks for the same Bearer token as POST /api/vase/arrange.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcpServer.ts';

const TOKEN = process.env.VASE_TOKEN ?? '';

const rpcError = (res: ServerResponse, status: number, message: string) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message }, id: null }));
};

export async function handleMcp(req: IncomingMessage, res: ServerResponse) {
  if (TOKEN && req.headers.authorization !== `Bearer ${TOKEN}`) return rpcError(res, 401, 'unauthorized');
  // Stateless: no SSE stream to open with GET, no session to end with DELETE.
  if (req.method !== 'POST') { res.setHeader('allow', 'POST'); return rpcError(res, 405, 'method not allowed'); }
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res);
}
