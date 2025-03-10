import { Readable } from 'stream';
import { client } from '../../config/elasticsearch';
// using require to avoid type errors
const { Parser } = require('csv-parse');

export interface CsvValidationResult {
  isValid: boolean;
  error?: string;
}

interface CsvRecord {
  [key: string]: string;
}

export class CsvService {
  async validateCsvFormat(buffer: Buffer): Promise<CsvValidationResult> {
    try {
      const content = buffer.toString();
      const records: CsvRecord[] = [];

      return new Promise((resolve) => {
        const parser = new Parser({
          columns: true,
          skip_empty_lines: true
        });

        Readable.from(content)
          .pipe(parser)
          .on('data', (record: CsvRecord) => {
            records.push(record);
            if (records.length > 1) {
              // We only need to validate format, so we can stop after first record
              resolve({ isValid: true });
            }
          })
          .on('error', (error: Error) => {
            resolve({ isValid: false, error: `Invalid CSV format: ${error.message}` });
          })
          .on('end', () => {
            if (records.length === 0) {
              resolve({ isValid: false, error: 'CSV file is empty' });
            } else {
              resolve({ isValid: true });
            }
          });
      });
    } catch (error) {
      return { isValid: false, error: 'Failed to process CSV file' };
    }
  }

  async processStreamToElastic(readableStream: Readable, indexName: string) {
    try {
      const records: CsvRecord[] = [];
      const parser = new Parser({
        columns: true,
        skip_empty_lines: true
      });

      // Process stream
      await new Promise((resolve, reject) => {
        readableStream
          .pipe(parser)
          .on('data', (record: CsvRecord) => records.push(record))
          .on('error', reject)
          .on('end', resolve);
      });

      if (records.length === 0) {
        return { results: [], error: 'No records found in CSV' };
      }

      // Create index if doesn't exist
      const indexExists = await client.indices.exists({ index: indexName });
      if (!indexExists) {
        await this.createIndex(indexName, Object.keys(records[0]));
      }

      // Bulk insert
      const operations = records.flatMap(record => [
        { index: { _index: indexName } },
        record
      ]);

      const result = await client.bulk({ operations });

      if (result.errors) {
        const errors = result.items
          .filter(item => item.index?.error)
          .map(item => item.index?.error?.reason);
        return { results: [], error: `Indexing errors: ${errors.join(', ')}` };
      }

      return {
        indexName,
        results: records.slice(0, 6),
        error: null
      };
    } catch (error: any) {
      return {
        indexName: null,
        results: [],
        error: `Failed to process CSV: ${error.message}`
      };
    }
  }

  private async createIndex(indexName: string, fields: string[]) {
    const properties: Record<string, any> = {};

    fields.forEach(field => {
      properties[field] = {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' }
        }
      };
    });

    await client.indices.create({
      index: indexName,
      mappings: { properties }
    });
  }
}

export const csvService = new CsvService();
