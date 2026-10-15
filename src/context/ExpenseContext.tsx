import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllExpenses, insertExpense, updateExpense, deleteExpense } from '@/database/expenseRepository';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  editExpense: (expense: Expense) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarGastos = async () => {
    try {
      const guardados = await getAllExpenses(db);
      setExpenses(guardados);
    } catch (error) {
      console.error('No se pudieron cargar los gastos', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarGastos();
  }, [db]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
    };
    await insertExpense(db, newExpense);
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const editExpense = async (updated: Expense) => {
    await updateExpense(db, updated);
    setExpenses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const removeExpense = async (id: string) => {
    await deleteExpense(db, id);
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  };

  const getMonthlyTotal = () => {
    return getCurrentMonthExpenses().reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        editExpense,
        removeExpense,
        getMonthlyTotal,
        getCurrentMonthExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within an ExpenseProvider');
  return context;
};