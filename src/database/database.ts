import { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'expenses.db';

export async function initDatabase(db: SQLiteDatabase) {
  // Crea la tabla si la base de datos es totalmente nueva
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      invoiceUri TEXT
    );
  `);

  // Si la tabla ya existía de antes, añade la columna que falta
  try {
    await db.execAsync(`ALTER TABLE expenses ADD COLUMN invoiceUri TEXT;`);
  } catch (error) {
    // Si la columna ya existe, SQLite arroja error y se ignora de forma segura
  }
}