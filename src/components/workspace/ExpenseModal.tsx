import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trip, Expense, ExpenseCategory } from '@/types/trip';
import { useTripStore } from '@/store/tripStore';
import { formatCurrency } from '@/lib/utils';
import { Plus, IndianRupee, Split, ArrowRight, UserCheck } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

const CATEGORIES: ExpenseCategory[] = [
  'STAY',
  'FOOD',
  'TRANSPORT',
  'ACTIVITIES',
  'SHOPPING',
  'RENTALS',
  'OTHER',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const addExpense = useTripStore((state) => state.addExpense);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [paidBy, setPaidBy] = useState(trip.members[0]?.id || 'm1');

  const totalSpent = trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const remaining = trip.totalPlannedBudget - totalSpent;
  const costPerPerson = Math.round(totalSpent / Math.max(1, trip.travelerCount));

  // Compute settlement debts (simplified)
  // Each member's net balance = amount paid - fair share
  const memberBalances: Record<string, number> = {};
  trip.members.forEach((m) => {
    memberBalances[m.id] = 0;
  });

  trip.expenses.forEach((exp) => {
    const splitCount = exp.splitAmongMemberIds.length || trip.members.length;
    const share = exp.amount / splitCount;

    // Credit payer
    memberBalances[exp.paidByMemberId] = (memberBalances[exp.paidByMemberId] || 0) + exp.amount;

    // Debit participants
    exp.splitAmongMemberIds.forEach((mId) => {
      memberBalances[mId] = (memberBalances[mId] || 0) - share;
    });
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    addExpense({
      tripId: trip.id,
      title: title.trim(),
      amount: num,
      category,
      paidByMemberId: paidBy,
      splitAmongMemberIds: trip.members.map((m) => m.id),
      splitType: 'EQUAL',
    });

    setTitle('');
    setAmount('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trip Budget & Splitwise Ledger"
      description="Record expenses, track category allocations, and settle group balances effortlessly."
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top 4 Budget Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-canvas-50 border border-canvas-200 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
              {formatCurrency(trip.totalPlannedBudget)}
            </span>
          </div>
          <div className="bg-canvas-50 border border-canvas-200 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Spending</span>
            <span className="text-base font-extrabold text-terracotta-600 mt-0.5 block">
              {formatCurrency(totalSpent)}
            </span>
          </div>
          <div className="bg-canvas-50 border border-canvas-200 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
            <span
              className={`text-base font-extrabold mt-0.5 block ${
                remaining >= 0 ? 'text-forest-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
          <div className="bg-canvas-50 border border-canvas-200 p-3 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Per Person</span>
            <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
              {formatCurrency(costPerPerson)}
            </span>
          </div>
        </div>

        {/* Add Quick Expense Form */}
        <form onSubmit={handleAddExpense} className="bg-canvas-100/70 p-4 rounded-3xl border border-canvas-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Add New Group Expense</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="What was it for? (e.g. Seafood Dinner, Taxi)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-canvas-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
            <div>
              <input
                type="number"
                required
                placeholder="Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-canvas-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
            <div>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-canvas-300 text-xs font-medium focus:outline-none"
              >
                {trip.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    Paid by {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider transition-colors ${
                    category === cat
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-white text-slate-600 hover:bg-canvas-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Button size="sm" type="submit">
              Log Expense
            </Button>
          </div>
        </form>

        {/* Group Balances & Settlement Summary */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-forest-500" />
            <span>Group Member Balances (Splitwise Settlement):</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trip.members.map((member) => {
              const balance = Math.round(memberBalances[member.id] || 0);
              const isPositive = balance >= 0;
              return (
                <div
                  key={member.id}
                  className="bg-white border border-canvas-200 p-3 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-canvas-200 text-slate-700 flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{member.name}</span>
                      <span className="text-[10px] text-slate-400">{member.role}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-black text-sm block ${
                        isPositive ? 'text-forest-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${formatCurrency(balance)}` : formatCurrency(balance)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isPositive ? 'gets back' : 'owes group'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Expense Feed */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Logged Expenses ({trip.expenses.length}):
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {trip.expenses.map((exp) => {
              const payer = trip.members.find((m) => m.id === exp.paidByMemberId)?.name || 'Someone';
              return (
                <div
                  key={exp.id}
                  className="p-2.5 rounded-xl bg-canvas-50 border border-canvas-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{exp.title}</span>
                    <span className="text-[10px] text-slate-400">
                      Paid by {payer} • {exp.category}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900">{formatCurrency(exp.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
