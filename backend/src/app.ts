import express from "express";
import { CONFIG } from "@config";
import { errorHandler } from "@middlewares/errorMiddleware";
import ticketRouter from "@routes/ticketRoutes";
import serviceRouter from "@routes/serviceRoutes";

import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use(CONFIG.ROUTES.TICKETS, ticketRouter);
app.use(CONFIG.ROUTES.SERVICES, serviceRouter);

// This must always be the last middleware added
app.use(errorHandler);

export default app;
