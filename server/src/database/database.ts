import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

type Database = any;

let db: any;

export const initDatabase = async (): Promise<any> => {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'thinking-tool.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');
  
  return db;
};

export const getDatabase = (): any => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};