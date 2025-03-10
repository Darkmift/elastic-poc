import { parse } from 'csv-parse';
import fs from 'fs';
import { Readable } from 'stream';

interface CsvParserOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  fromLine?: number;
  columns?: boolean | string[];
}

export class CsvParser {
  private defaultOptions: CsvParserOptions = {
    delimiter: ',',
    skipEmptyLines: true,
    fromLine: 1, // Skip header by default
    columns: true, // Return results as objects using headers as keys
  };

  async parseFile<T>(filePath: string, options: CsvParserOptions = {}): Promise<T[]> {
    const parseOptions = { ...this.defaultOptions, ...options };
    const records: T[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse(parseOptions))
        .on('data', (record: T) => {
          records.push(record);
        })
        .on('error', (error: Error) => {
          reject(error);
        })
        .on('end', () => {
          resolve(records);
        });
    });
  }

  async parseString<T>(csvString: string, options: CsvParserOptions = {}): Promise<T[]> {
    const parseOptions = { ...this.defaultOptions, ...options };
    const records: T[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from([csvString]);
      
      stream
        .pipe(parse(parseOptions))
        .on('data', (record: T) => {
          records.push(record);
        })
        .on('error', (error: Error) => {
          reject(error);
        })
        .on('end', () => {
          resolve(records);
        });
    });
  }
}

export const csvParser = new CsvParser(); 