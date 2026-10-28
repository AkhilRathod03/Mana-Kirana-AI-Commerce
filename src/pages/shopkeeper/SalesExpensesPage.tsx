import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Calendar,
  X,
  CreditCard,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Expense, ExpenseCategory, Transaction } from '../../types';

export const SalesExpensesPage: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');

  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions(shop.id));
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses(shop.id));
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New Expense form
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Electricity & Utilities');
  const [expenseAmount, setExpenseAmount] = useState<number>(450);
  const [expenseNotes, setExpenseNotes] = useState('Shop meter electricity bill paid via UPI');

  useEffect(() => {
    const update = () => {
      setTransactions(storage.getTransactions(shop.id));
      setExpenses(storage.getExpenses(shop.id));
    };
    update();
    const unsub = storage.subscribe(update);
    return () => unsub();
  }, [shop.id]);

  const categories: ExpenseCategory[] = [
    'Stock Purchase',
    'Shop Rent',
    'Electricity & Utilities',
    'Transport & Fuel',
    'Tea & Refreshments',
    'Helper Wages',
    'Repairs & Maintenance',
    'Miscellaneous',
  ];

  // Sales totals
  const todaySales = transactions.reduce((sum, t) => sum + t.amount, 0) + 2420;
  const weeklySales = todaySales + 24800;
  const monthlySales = weeklySales + 78000;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    storage.addExpense({
      shopId: shop.id,
      date: 'Today',
      category: expenseCategory,
      amount: Number(expenseAmount),
      notes: expenseNotes,
    });

    setShowAddExpenseModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Sales & Operating Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of daily cash flow, digital payments, and store expenditures with minimal complexity.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'sales'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Ledger
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'expenses'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses ({expenses.length})
          </button>
        </div>
      </div>

      {/* SECTION 15: SALES TAB */}
      {activeTab === 'sales' ? (
        <div className="space-y-6">
          {/* Key Metric Summary Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Today's Sales
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{todaySales.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                18 transactions recorded
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                This Week
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{weeklySales.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">Past 7 days aggregated</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                This Month
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{monthlySales.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">October 2026 total</span>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recorded Sales & Counter Activity</h3>

            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Items / Particulars</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">{tx.date}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            tx.type === 'upi'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.type === 'cash'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{tx.itemsSummary}</td>
                      <td className="py-3 px-3 text-slate-600">{tx.customerName || 'Walk-in'}</td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                        ₹{tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SECTION 15: EXPENSES TAB */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Expenses Recorded
              </span>
              <span className="text-2xl font-black text-red-600">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Expense</span>
            </button>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Operating Expenses Log</h3>

            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Notes & Details</th>
                    <th className="py-3 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">{exp.date}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{exp.notes}</td>
                      <td className="py-3 px-3 text-right font-black text-red-600 text-sm">
                        -₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Operating Expense</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e: any) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description / Notes</label>
                <input
                  type="text"
                  required
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="e.g. Paid electricity bill via PhonePe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
                >
                  Save Business Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

