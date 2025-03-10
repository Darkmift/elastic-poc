import express, { Express, Request, Response } from 'express';
import { testConnection } from './config/elasticsearch';
import { streetService } from './services/streetService';

const app: Express = express();
const port = process.env.PORT || 3000;

app.get('/', (_: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/import-streets', async (req: Request, res: Response) => {
  try {
    const result = await streetService.importFromCsv('path/to/your/csv');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to import streets data' });
  }
});

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  // Test ElasticSearch connection
  await testConnection();
}); 