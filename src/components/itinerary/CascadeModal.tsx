import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CascadeConflictReport, CascadeOption } from '@/types/trip';
import { AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatTimeDisplay } from '@/lib/utils';

interface CascadeModalProps {
  report: CascadeConflictReport | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (optionId: CascadeOption['id']) => void;
}

export const CascadeModal: React.FC<CascadeModalProps> = ({
  report,
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Impact Detected"
      description="Real life happened. Here is how this change affects your day—you choose how to adapt."
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              {report.affectedCount} {report.affectedCount === 1 ? 'activity is' : 'activities are'} affected by this time shift
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              Downstream visits will overlap or run past scheduled buffers. The system will never silently overwrite your plan.
            </p>
          </div>
        </div>

        {/* Affected Activities Comparison List */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Affected Timeline:
          </h5>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {report.affectedItems.map((affected, idx) => (
              <div
                key={affected.item.id}
                className="bg-canvas-50 border border-canvas-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{affected.item.title}</span>
                  <span className="text-[11px] text-slate-500">{affected.description}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-slate-400 line-through text-[11px]">
                    {formatTimeDisplay(affected.originalStart)}
                  </div>
                  <div className="font-bold text-terracotta-600">
                    {formatTimeDisplay(affected.proposedStart)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Decision Options */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Choose How You Want To Proceed:
          </h5>
          <div className="grid grid-cols-1 gap-2.5">
            {report.options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className="p-3.5 rounded-2xl border border-canvas-300 hover:border-terracotta-500 hover:bg-terracotta-50/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-terracotta-600 transition-colors">
                      {opt.title}
                    </span>
                    {opt.confidenceScore >= 85 && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{opt.description}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{opt.impactSummary}</p>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0 group-hover:bg-terracotta-500 group-hover:text-white transition-colors">
                  <span>Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-canvas-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">The choice is always yours.</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel / Keep Original
          </Button>
        </div>
      </div>
    </Modal>
  );
};
