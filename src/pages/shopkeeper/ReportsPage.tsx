import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  FileDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BookOpen,
  ShoppingBag,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { pdfService } from '../../services/pdfService';

const SALES_TREND_DATA = [
  { day: 'Mon', sales: 3800, expenses: 1200 },
  { day: 'Tue', sales: 4100, expenses: 800 },
  { day: 'Wed', sales: 3650, expenses: 950 },
  { day: 'Thu', sales: 4400, expenses: 1400 },
  { day: 'Fri', sales: 4900, expenses: 1100 },
  { day: 'Sat', sales: 6200, expenses: 2200 },
  { day: 'Sun (Today)', sales: 4280, expenses: 650 },
];

const EXPENSE_CATEGORY_DATA = [
  { name: 'Stock Purchase', value: 14200, color: '#059669' },
  { name: 'Helper Wages', value: 1200, color: '#3b82f6' },
  { name: 'Electricity', value: 650, color: '#f59e0b' },
  { name: 'Transport', value: 350, color: '#8b5cf6' },
  { name: 'Maintenance', value: 450, color: '#ef4444' },
  { name: 'Tea & Refreshments', value: 120, color: '#10b981' },
];

const CATEGORY_SALES_SHARE = [
  { name: 'Groceries & Oil', value: 52 },
  { name: 'Electrical & Bulbs', value: 24 },
  { name: 'Personal Care & Soaps', value: 16 },
  { name: 'Dairy & Bread', value: 8 },
];

const PIE_COLORS = ['#059669', '#2563eb', '#f59e0b', '#8b5cf6'];

export const ReportsPage: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const customers = storage.getCustomers();
  const expenses = storage.getExpenses(shop.id);
  const orders = storage.getOrders(shop.id);

  const totalSales = 4280;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - 650; // Today operating profit
  const totalKhataDue = customers.reduce((sum, c) => sum + c.khataBalance, 0);

  const handleDownloadPDF = () => {
    pdfService.generateBusinessReport({
      shop,
      totalSales,
      totalExpenses,
      netProfit,
      totalKhataDue,
      totalOrders: orders.length,
      recentSales: [],
      expenseBreakdown: EXPENSE_CATEGORY_DATA.map((d) => ({
        category: d.name,
        amount: d.value,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider bg-emerald-100/70 px-2.5 py-1 rounded-md">
            Business Analytics • వ్యాపార నివేదికలు
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Store Performance & Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated calculations of daily sales, profit/loss, and customer balance auditing.
          </p>
        </div>

        {/* Generate PDF Button */}
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md self-start"
        >
          <FileDown className="w-4 h-4" />
          <span>Generate PDF Report</span>
        </button>
      </div>

      {/* KPI 4 Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">
            Today's Net Revenue
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            ₹{totalSales.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            ↑ 14% vs 7-day avg
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">
            Recorded Expenses (Total)
          </span>
          <span className="text-xl sm:text-2xl font-black text-red-600 mt-1 block">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Includes mandi stock restock
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">
            Net Operating Margin
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
            +₹{netProfit.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Healthy 84% daily margin
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 font-bold text-[10px] uppercase block">
            Outstanding Customer Khata
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-900 mt-1 block">
            ₹{totalKhataDue.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
            6 active ledgers
          </span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Sales vs Operating Cost Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Weekly Revenue & Cost Progression
              </h3>
              <p className="text-xs text-slate-400">Comparing daily sales against daily expenses (₹)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Sales
              </span>
              <span className="flex items-center gap-1 font-medium text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="sales" fill="#059669" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Contribution (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Product Sales Distribution</h3>
            <p className="text-xs text-slate-400">Category share of daily volume</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SALES_SHARE}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_SALES_SHARE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {CATEGORY_SALES_SHARE.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx] }}
                  />
                  <span>{cat.name}</span>
                </span>
                <span className="font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER KHATA BALANCES SUMMARY TABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Customer Credit Balances Audit</h3>
          <span className="text-xs text-slate-400">{customers.length} accounts analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Locality</th>
                <th className="py-2.5 px-3">Total Orders</th>
                <th className="py-2.5 px-3">Last Visit</th>
                <th className="py-2.5 px-3 text-right">Outstanding (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-3 text-slate-500">{c.phone}</td>
                  <td className="py-3 px-3 text-slate-500">{c.locality}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.totalOrders} visits</td>
                  <td className="py-3 px-3 text-slate-500">{c.lastVisit}</td>
                  <td className="py-3 px-3 text-right font-black text-purple-900 text-sm">
                    ₹{c.khataBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

