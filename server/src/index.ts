import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import contactsRoutes from './routes/contacts.routes';
import audiencesRoutes from './routes/audiences.routes';
import templatesRoutes from './routes/templates.routes';
import campaignsRoutes from './routes/campaigns.routes';
import trackingRoutes from './routes/tracking.routes';
import stripeRoutes from './routes/stripe.routes';
import { appConfig } from './config';


const app = express();
const port = appConfig.port;

app.use(
  cors({
    origin: [appConfig.frontendUrl, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/audiences', audiencesRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CampaignIQ Server Running' });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
