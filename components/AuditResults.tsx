import React from 'react';
import { AuditItem, Verdict } from '../types';
import { ZapIcon, TrashIcon, CheckCircleIcon, AlertCircleIcon } from './Icons';

interface AuditResultsProps {
  items: AuditItem[];
}

const AuditResults: React.FC<AuditResultsProps> = ({ items }) => {
  if (items.length === 0) return null;

  const focusCount = items.filter(i => i.verdict === Verdict.FOCUS).length;
  const trashCount = items.filter(i => i.verdict === Verdict.TRASH).length;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-sloe-panel border border-sloe-border p-4 rounded-lg flex items-center justify-between group hover:border-sloe-accent/50 transition-colors">
          <div>
            <p className="text-sloe-muted text-sm font-mono uppercase tracking-wider">Signal (Focus)</p>
            <p className="text-3xl font-bold text-sloe-accent mt-1">{focusCount}</p>
          </div>
          <div className="p-3 bg-sloe-accent/10 rounded-full text-sloe-accent">
            <ZapIcon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex-1 bg-sloe-panel border border-sloe-border p-4 rounded-lg flex items-center justify-between group hover:border-sloe-trash/50 transition-colors">
          <div>
            <p className="text-sloe-muted text-sm font-mono uppercase tracking-wider">Noise (Trash)</p>
            <p className="text-3xl font-bold text-sloe-trash mt-1">{trashCount}</p>
          </div>
          <div className="p-3 bg-sloe-trash/10 rounded-full text-sloe-trash">
            <TrashIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-sloe-border bg-sloe-panel shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-sloe-dark border-b border-sloe-border">
            <tr>
              <th className="px-6 py-4 font-mono text-sloe-muted font-medium uppercase tracking-wider w-1/4">Opportunity</th>
              <th className="px-6 py-4 font-mono text-sloe-muted font-medium uppercase tracking-wider w-32">Verdict</th>
              <th className="px-6 py-4 font-mono text-sloe-muted font-medium uppercase tracking-wider w-1/4">Reasoning</th>
              <th className="px-6 py-4 font-mono text-sloe-muted font-medium uppercase tracking-wider">AI Solution Pitch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sloe-border">
            {items.map((item, index) => {
              const isFocus = item.verdict === Verdict.FOCUS;
              return (
                <tr 
                  key={index} 
                  className={`group transition-colors ${
                    isFocus 
                      ? 'bg-sloe-accent/5 hover:bg-sloe-accent/10' 
                      : 'bg-sloe-panel hover:bg-sloe-border/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-sloe-text">
                    {item.opportunityName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                      isFocus
                        ? 'bg-sloe-accent/10 text-sloe-accent border-sloe-accent/20'
                        : 'bg-sloe-trash/10 text-sloe-trash border-sloe-trash/20'
                    }`}>
                      {isFocus ? <CheckCircleIcon className="w-3 h-3" /> : <AlertCircleIcon className="w-3 h-3" />}
                      {item.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sloe-muted group-hover:text-sloe-text transition-colors">
                    {item.reason}
                  </td>
                  <td className="px-6 py-4">
                    {isFocus && (
                      <div className="flex items-start gap-2 text-sloe-accent/90">
                        <ZapIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="font-medium italic">
                          "{item.aiPitch}"
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditResults;
