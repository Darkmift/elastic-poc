import express, { Express, Request, Response } from 'express';
import { testConnection } from './config/elasticsearch';
import csvRoutes from './api/csv/routes';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// health check
app.use('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/csv', csvRoutes);

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  // Test ElasticSearch connection
  await testConnection();
}); 