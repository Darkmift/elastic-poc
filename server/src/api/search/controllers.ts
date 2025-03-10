import { Request, Response } from 'express';
import { searchService, SearchType } from './services';

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, type = SearchType.FREE, indexName } = req.query;

    if (!query) {
      res.status(400).json({
        results: [],
        total: 0,
        error: 'Query is required'
      });
      return;
    }

    const result = await searchService.search({
      query: query as string,
      type: type as SearchType,
      ...(indexName && { indexName: indexName as string })
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      results: [],
      total: 0,
      error: `Search failed: ${error.message}`
    });
  }
};

export const listIndexes = async (_: Request, res: Response): Promise<void> => {
  try {
    const result = await searchService.listIndexes();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      results: [],
      error: `Failed to list indexes: ${error.message}`
    });
  }
};

export const deleteRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { indexName, recordId } = req.params;

    if (!indexName || !recordId) {
      res.status(400).json({
        success: false,
        error: 'Index name and record ID are required'
      });
      return;
    }

    const result = await searchService.deleteRecord(indexName, recordId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: `Delete failed: ${error.message}`
    });
  }
}; 