import app from "./app";
import { CONFIG } from "@config";
import { logError, logInfo } from "@services/loggingService";
import { closeDatabase, initializeDatabase } from "@database";
import { Server } from "http";
import WebSocket, { WebSocketServer } from 'ws';

let server: Server;
let wss: WebSocketServer | undefined;

async function startServer() {
  try {
    await initializeDatabase();
    server = app.listen(CONFIG.APP_PORT, () => {
      logInfo(`Server started on http://${CONFIG.APP_HOST}:${CONFIG.APP_PORT}`);
    });

    // attach WebSocket server to the same HTTP server
    wss = new WebSocketServer({ server });

    // forward events from queueServices.emitter to connected websocket clients
    const qs = await import("./services/queueServices");
    qs.emitter.on('queue_updated', (payload: any) => {
      const msg = JSON.stringify({ type: 'queue_updated', payload });
      wss!.clients.forEach((c: WebSocket) => {
        if (c.readyState === WebSocket.OPEN) c.send(msg);
      });
    });

    qs.emitter.on('ticket_called', (payload: any) => {
      const msg = JSON.stringify({ type: 'ticket_called', payload });
      wss!.clients.forEach((c: WebSocket) => {
        if (c.readyState === WebSocket.OPEN) c.send(msg);
      });
    });

    qs.emitter.on('ticket_served', (payload: any) => {
      const msg = JSON.stringify({ type: 'ticket_served', payload });
      wss!.clients.forEach((c: WebSocket) => {
        if (c.readyState === WebSocket.OPEN) c.send(msg);
      });
    });

    wss.on('connection', (socket: WebSocket) => {
      logInfo('WebSocket client connected');
      socket.on('close', () => logInfo('WebSocket client disconnected'));
    });

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
