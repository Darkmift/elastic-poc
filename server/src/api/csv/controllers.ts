import { Request, Response } from 'express';
import { csvService } from './services';

export const uploadCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const contentType = req.headers['content-type'];
    if (!contentType?.includes('text/csv')) {
      res.status(400).json({ results: [], error: 'Content-Type must be text/csv' });
      return;
    }

    // Use query param or generate random name if not provided
    const fileName = req.query.name as string || `csv_${Date.now()}`;
    const indexName = fileName.toLowerCase();

    const result = await csvService.processStreamToElastic(req, indexName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      results: [], 
      error: `Server error: ${error.message}` 
    });
  }
};
