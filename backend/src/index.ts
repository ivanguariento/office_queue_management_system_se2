import app from "./app";
import { CONFIG } from "@config";
import { logError, logInfo } from "@services/loggingService";
import { closeDatabase, initializeDatabase } from "@database";
import { Server } from "http";

let server: Server;
let wss: any | undefined;

async function startServer() {
  try {
    await initializeDatabase();
    server = app.listen(CONFIG.APP_PORT, () => {
      logInfo(`Server started on http://${CONFIG.APP_HOST}:${CONFIG.APP_PORT}`);
    });

    // attempt to load ws dynamically; if not installed, skip WebSocket setup
    try {
      // require instead of import to avoid TS type-check errors when ws not installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ws = require('ws');
      const WebSocketServer = ws.WebSocketServer || ws.Server;
      wss = new WebSocketServer({ server });

      // forward events from queueServices.emitter to connected websocket clients
      const qs = await import("./services/queueServices");
      const broadcast = (type: string, payload: any) => {
        const msg = JSON.stringify({ type, payload });
        wss.clients.forEach((c: any) => {
          if (c.readyState === c.OPEN) c.send(msg);
        });
      };

      qs.emitter.on('queue_updated', (payload: any) => broadcast('queue_updated', payload));
      qs.emitter.on('ticket_called', (payload: any) => broadcast('ticket_called', payload));
      qs.emitter.on('ticket_served', (payload: any) => broadcast('ticket_served', payload));

      wss.on('connection', (socket: any) => {
        logInfo('WebSocket client connected');
        socket.on('close', () => logInfo('WebSocket client disconnected'));
      });
    } catch (err) {
      logInfo('ws module not available; WebSocket server not started');
    }

  } catch (error) {
    logError("Error in app initialization:", error);
    process.exit(1);
  }
}

function closeServer(): Promise<void> {
  if (server) {
    return new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  } else {
    return Promise.resolve();
  }
}

async function shutdown() {
  logInfo("Shutting down server...");

  await closeServer();
  await closeDatabase();

  logInfo("Shutdown complete.");
  process.exit(0);
}

startServer();

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
