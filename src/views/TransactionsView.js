import React from "react";

export default function TransactionsView({ navigate, transactions, user }) {
  if (!user || user.role !== "admin") {
    return <div className="p-20 text-center text-xl">Access Denied. Admins only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Payment Transactions</h1>
          <p className="text-slate-500">Stored in MongoDB after successful Razorpay payments.</p>
        </div>
        <button
          onClick={() => navigate("dashboard")}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Dashboard
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-medium">Transaction ID</th>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Event</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4 font-mono text-blue-600 dark:text-blue-400">{txn.id}</td>
                    <td className="p-4 font-semibold">{txn.user}</td>
                    <td className="p-4 text-slate-500">{txn.event}</td>
                    <td className="p-4 font-bold">
                      {txn.currency} {txn.amount}
                    </td>
                    <td className="p-4 text-slate-500">{new Date(txn.date).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
