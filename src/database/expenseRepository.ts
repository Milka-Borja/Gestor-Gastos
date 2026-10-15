import { SQLiteDatabase } from 'expo-sqlite';
import { Expense } from '@/types/expense';

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM expenses ORDER BY date DESC;'
  );
  return rows.map((row) => ({
    ...row,
    date: new Date(row.date),
  }));
}

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
  const dateStr =
    expense.date instanceof Date
      ? expense.date.toISOString()
      : new Date(expense.date).toISOString();

  // Asegura que si vienen vacíos o undefined, pasen como null a SQLite
  const cleanDescription = expense.description ? expense.description : null;
  const cleanInvoiceUri = expense.invoiceUri ? expense.invoiceUri : null;

  await db.runAsync(
    'INSERT INTO expenses (id, amount, category, date, description, invoiceUri) VALUES (?, ?, ?, ?, ?, ?);',
    [
      expense.id,
      expense.amount,
      expense.category,
      dateStr,
      cleanDescription,
      cleanInvoiceUri,
    ]
  );
}

export async function updateExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
  const dateStr =
    expense.date instanceof Date
      ? expense.date.toISOString()
      : new Date(expense.date).toISOString();

  const cleanDescription = expense.description ? expense.description : null;
  const cleanInvoiceUri = expense.invoiceUri ? expense.invoiceUri : null;

  await db.runAsync(
    'UPDATE expenses SET amount = ?, category = ?, date = ?, description = ?, invoiceUri = ? WHERE id = ?;',
    [
      expense.amount,
      expense.category,
      dateStr,
      cleanDescription,
      cleanInvoiceUri,
      expense.id,
    ]
  );
}

export async function deleteExpense(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
}