import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  FileDown,
  Search,
  DollarSign,
  X,
  PhoneCall,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { pdfService } from '../../services/pdfService';
import { Customer, KhataTransaction } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const KhataManagement: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const { t, language } = useLanguage();

  const [customers, setCustomers] = useState<Customer[]>(storage.getCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'cust-1');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form states
  const [creditItemDesc, setCreditItemDesc] = useState('Soap × 3 (Lifebuoy)');
  const [creditAmount, setCreditAmount] = useState<number>(60);
  const [creditNotes, setCreditNotes] = useState('Monthly provisions');

  const [paymentAmount, setPaymentAmount] = useState<number>(500);
  const [paymentNotes, setPaymentNotes] = useState('Cash payment at counter');

  useEffect(() => {
    const update = () => setCustomers(storage.getCustomers());
    update();
    const unsub = storage.subscribe(update);
    return () => unsub();
  }, []);

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const transactions: KhataTransaction[] = storage.getKhata(shop.id, selectedCustomer?.id);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.khataBalance, 0);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.locality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDFStatement = () => {
    if (!selectedCustomer) return;
    pdfService.generateCustomerStatement(selectedCustomer, transactions, shop);
  };

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || creditAmount <= 0) return;

    const prevBal = selectedCustomer.khataBalance;
    const newBal = prevBal + Number(creditAmount);

    storage.addKhataTransaction({
      shopId: shop.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: 'Today',
      itemDescription: creditItemDesc,
      debit: Number(creditAmount),
      credit: 0,
      previousBalance: prevBal,
      remainingBalance: newBal,
      notes: creditNotes,
    });

    setShowAddCreditModal(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;

    const prevBal = selectedCustomer.khataBalance;
    const newBal = Math.max(0, prevBal - Number(paymentAmount));

    storage.addKhataTransaction({
      shopId: shop.id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: 'Today',
      itemDescription: 'Payment Received (జమ)',
      debit: 0,
      credit: Number(paymentAmount),
      previousBalance: prevBal,
      remainingBalance: newBal,
      notes: paymentNotes,
    });

    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('khataTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('khataSubtitle')}
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {t('totalKhataDue')}
            </span>
            <span className="text-xl font-black text-purple-950">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-full">
            {customers.length} {language === 'te' ? 'ఖాతాలు' : language === 'hi' ? 'खाते' : 'Accounts'}
          </span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer Directory Column */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchCustomer')}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredCustomers.map((c) => {
              const isSelected = c.id === selectedCustomer?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-900 text-xs truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.phone}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 block">
                      ₹{c.khataBalance}
                    </span>
                    <span className="text-[10px] text-red-600 font-bold">
                      {language === 'te' ? 'బాకీ' : language === 'hi' ? 'बाकी' : 'Due'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Customer Ledger */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          {/* Customer Profile Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{selectedCustomer?.name}</h2>
                <span className="text-xs text-slate-500 font-semibold">({selectedCustomer?.phone})</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedCustomer?.locality}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddCreditModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ {t('addKhataPurchase')}</span>
              </button>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{t('recordKhataPayment')}</span>
              </button>

              <button
                onClick={handleDownloadPDFStatement}
                className="px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                title={t('downloadStatementPDF')}
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>PDF Bill</span>
              </button>
            </div>
          </div>

          {/* Current Outstanding Balance Badge */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-purple-700 block">
                {language === 'te' ? 'కస్టమర్ ఇవ్వాల్సిన ప్రస్తుత బాకీ' : language === 'hi' ? 'ग्राहक का कुल बकाया' : 'Current Due Balance'}
              </span>
              <span className="text-2xl font-black text-purple-950">
                ₹{selectedCustomer?.khataBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <a
              href={`tel:${selectedCustomer?.phone}`}
              className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1 hover:bg-purple-100"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call</span>
            </a>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[500px] w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Particulars / Details</th>
                  <th className="py-3 px-3 text-right text-red-600">{t('debitOwed')}</th>
                  <th className="py-3 px-3 text-right text-emerald-600">{t('creditPaid')}</th>
                  <th className="py-3 px-3 text-right">{t('balanceRunning')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500">{tx.date}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {tx.itemDescription}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-red-600">
                        {tx.debit > 0 ? `+₹${tx.debit}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-600">
                        {tx.credit > 0 ? `-₹${tx.credit}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        ₹{tx.remainingBalance}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD CREDIT TRANSACTION MODAL */}
      {showAddCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {t('addKhataPurchase')} ({selectedCustomer?.name})
              </h3>
              <button
                onClick={() => setShowAddCreditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCredit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === 'te' ? 'తీసుకెళ్లిన సరుకులు' : language === 'hi' ? 'सामान का विवरण' : 'Items taken'}
                </label>
                <input
                  type="text"
                  required
                  value={creditItemDesc}
                  onChange={(e) => setCreditItemDesc(e.target.value)}
                  placeholder="e.g. 3 Soaps, 1L Oil"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === 'te' ? 'అరువు మొత్తం (₹)' : language === 'hi' ? 'उधार राशि (₹)' : 'Total Amount (₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-red-600"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm"
                >
                  {language === 'te' ? 'ఖాతాలో బాకీ రాయండి' : language === 'hi' ? 'खाते में उधार जोड़ें' : 'Save Credit Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {t('recordKhataPayment')} ({selectedCustomer?.name})
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === 'te' ? 'వచ్చిన డబ్బులు (₹)' : language === 'hi' ? 'जमा रकम (₹)' : 'Payment Received (₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {language === 'te' ? 'విధానం / గమనిక' : language === 'hi' ? 'नोट' : 'Note'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Cash / UPI"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  {language === 'te' ? 'డబ్బు జమ చేయండి & బాకీ తగ్గించండి' : language === 'hi' ? 'जमा करें और बकाया घटाएं' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
