import express from 'express';
import { ROUTES } from './config/config';
import serviceRoutes from './routes/serviceRoutes';
const app = express();

app.use(express.json());

app.use(ROUTES.SERVICES_URL, serviceRoutes);
//app.use(ROUTES.TICKETS_URL, ticketRoutes);


export default app;