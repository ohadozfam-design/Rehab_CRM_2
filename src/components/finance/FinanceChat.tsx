import { useState } from 'react';
import { Bot, SendHorizontal, Sparkles, User } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { projectSpent } from '../../lib/metrics';
import {
  accruedInterest,
  budgetHealth,
  lienRequired,
  monthlyPayment,
  scheduleMeter,
  trueProjectCost,
} from '../../lib/finance';
import type { Renovation } from '../../types';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

/** Rule-based answer to a free-text finance question. */
function answer(r: Renovation, q: string): string {
  const s = q.toLowerCase();
  const health = budgetHealth(r);
  const spent = projectSpent(r);

  if (s.includes('loan') || s.includes('interest')) {
    if (!r.loan?.enabled) return 'This project is not loan-financed.';
    return `The loan is ${r.loan.loanType} — ${formatCurrency(r.loan.principal)} at ${r.loan.interestRate}% for ${r.loan.termMonths} months. Monthly payment is ${formatCurrency(monthlyPayment(r.loan))}, with ${formatCurrency(accruedInterest(r.loan))} of interest accrued so far.`;
  }
  if (s.includes('schedule') || s.includes('behind') || s.includes('time')) {
    const m = scheduleMeter(r);
    return `Work is ${m.workPct}% complete while ${m.timePct}% of the timeline has elapsed (${m.daysElapsed} of ${m.daysTotal} days, ${m.daysLeft} to deadline). ${m.behind ? 'You are running behind schedule.' : 'You are on track.'}`;
  }
  if (s.includes('variance')) {
    return `True project cost is ${formatCurrency(health.trueCost)} against a ${formatCurrency(r.totalBudget)} budget — a variance of ${formatCurrency(health.variance)} (${health.variance < 0 ? 'over' : 'under'}).`;
  }
  if (s.includes('next') || s.includes('do')) {
    const needing = r.financialEntries.filter(
      (e) => lienRequired(e) && !e.lienWaiverUrl,
    ).length;
    return needing > 0
      ? `${needing} transaction(s) still need a signed lien waiver — resolve those next to stay compliant.`
      : 'No compliance items outstanding. Keep logging expenses and marking SOW items complete.';
  }
  // Default: budget.
  return `You've spent ${formatCurrency(spent)} of your ${formatCurrency(r.totalBudget)} budget. Including accrued loan interest, true cost is ${formatCurrency(trueProjectCost(r))} (${health.usedPct}% used) — ${health.label}.`;
}

export default function FinanceChat({ renovation }: { renovation: Renovation }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: 'bot',
      text: `Hi! I'm your finance assistant for ${renovation.name}. Ask me about budget, schedule, loan, variance, or what to do next.`,
    },
  ]);
  const [text, setText] = useState('');

  const send = () => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [
      ...m,
      { from: 'user', text: q },
      { from: 'bot', text: answer(renovation, q) },
    ]);
    setText('');
  };

  return (
    <div className="mb-4 overflow-hidden rounded border border-border bg-surface">
      <div
        className="flex items-center gap-2.5 border-b border-border px-4 py-3"
        style={{
          background:
            'linear-gradient(135deg, var(--accent-soft), var(--purple-soft))',
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-text">
            Finance Assistant
          </div>
          <div className="text-[10px] text-text-3">
            Ask about budget, loan, schedule, or what's next
          </div>
        </div>
      </div>

      <div className="max-h-[240px] space-y-3 overflow-y-auto p-3.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-text-2">
              {m.from === 'user' ? <User size={13} /> : <Bot size={13} />}
            </div>
            <div
              className={`max-w-[72%] rounded-xl px-3 py-2 text-[13px] ${
                m.from === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-text-2'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-border p-2.5">
        <input
          className="flex-1 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-[13px] text-text outline-none focus:border-accent"
          placeholder="Ask about your finances..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          className="inline-flex items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-white"
          onClick={send}
          title="Send"
        >
          <SendHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
