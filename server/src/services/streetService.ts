import { client } from '../config/elasticsearch';
import { csvParser } from '../utils/csvParser';
import { Street } from '../types/street';

export class StreetService {
  private readonly indexName = 'streets';

  async importFromCsv(filePath: string) {
    try {
      // Parse CSV file with Street type
      const streets = await csvParser.parseFile<Street>(filePath);
      
      // Create index if it doesn't exist
      const indexExists = await client.indices.exists({ index: this.indexName });
      
      if (!indexExists) {
        await this.createIndex();
      }

      // Bulk insert records
      const operations = streets.flatMap(street => [
        { index: { _index: this.indexName } },
        street
      ]);

      const result = await client.bulk({ operations });
      
      return {
        success: !result.errors,
        total: streets.length,
        errors: result.errors ? result.items.filter(item => item.index?.error) : []
      };
    } catch (error) {
      console.error('Error importing streets:', error);
      throw error;
    }
  }

  private async createIndex() {
    await client.indices.create({
      index: this.indexName,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }  // Allows for exact matching
            }
          }
          // Add other fields based on your CSV structure
        }
      }
    });
  }
}

export const streetService = new StreetService(); 