import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trip, ExportSnapshot } from '@/types/trip';
import { useTripStore } from '@/store/tripStore';
import { formatCurrency, formatTimeDisplay, formatDateDisplay } from '@/lib/utils';
import { FileDown, Printer, History, AlertCircle, CheckCircle } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const registerPdfExport = useTripStore((state) => state.registerPdfExport);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(
    trip.exportHistory[0]?.exportedAt || null
  );

  // Check if trip was modified since last export
  const lastSnapshot = trip.exportHistory[0];
  const totalItemCount = trip.days.reduce((acc, d) => acc + d.items.length, 0);
  const hasDrift = lastSnapshot && (lastSnapshot.itemCount !== totalItemCount || new Date(trip.updatedAt).getTime() > new Date(lastSnapshot.exportedAt).getTime());

  const generatePDF = () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      // Palette
      const primaryColor = [217, 93, 57]; // #D95D39 Terracotta
      const slateDark = [30, 37, 43];
      const slateLight = [100, 116, 139];

      // Document Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(trip.title.toUpperCase(), 40, 50);

      // Subtitle / Meta Bar
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      const dateRange = `${formatDateDisplay(trip.startDate)} – ${formatDateDisplay(trip.endDate)}`;
      const metaText = `Dates: ${dateRange}   |   Travelers: ${trip.travelerCount}   |   Budget: ${formatCurrency(trip.budgetPerPerson)}/person (Total: ${formatCurrency(trip.totalPlannedBudget)})`;
      doc.text(metaText, 40, 70);

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(1);
      doc.line(40, 80, 555, 80);

      let currentY = 100;

      // Iterate through each day
      trip.days.forEach((day) => {
        // Day Heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`DAY ${day.dayNumber} — ${formatDateDisplay(day.date)}: ${day.themeTitle}`, 40, currentY);
        currentY += 12;

        // Table Rows
        const tableBody = day.items.map((item) => {
          const time = `${formatTimeDisplay(item.timeSlot.plannedStart)} - ${formatTimeDisplay(item.timeSlot.plannedEnd)}`;
          const travel = item.travelFromPrevious ? `${item.travelFromPrevious.durationMinutes}m (${item.travelFromPrevious.distanceKm}km)` : '—';
          const transport = item.travelFromPrevious?.mode || '—';
          const cost = item.estimatedCost.value > 0 ? formatCurrency(item.estimatedCost.value) : 'Free';
          const location = item.location.address || item.location.name;
          const notes = item.whyRecommended ? item.whyRecommended.slice(0, 75) + '...' : item.notes || '—';

          return [time, item.title, location, travel, transport, cost, notes];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Time', 'Activity', 'Location', 'Travel', 'Transport', 'Cost', 'Notes']],
          body: tableBody,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 37, 43],
            textColor: [255, 255, 255],
            fontSize: 8.5,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [40, 40, 40],
            cellPadding: 4,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 90, fontStyle: 'bold' },
            2: { cellWidth: 90 },
            3: { cellWidth: 50 },
            4: { cellWidth: 55 },
            5: { cellWidth: 45 },
            6: { cellWidth: 115 },
          },
          margin: { left: 40, right: 40 },
          didDrawPage: (data) => {
            currentY = data.cursor ? data.cursor.y + 25 : currentY + 30;
          },
        });
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(slateLight[0], slateLight[1], slateLight[2]);
        doc.text(
          `YourTrip Digital Operating System  •  Exported on ${new Date().toLocaleString()}  •  Page ${i} of ${totalPages}`,
          40,
          820
        );
      }

      // Record snapshot in trip history
      const snapshot: ExportSnapshot = {
        revisionId: `rev_${Date.now()}`,
        exportedAt: new Date().toISOString(),
        contentHash: Math.random().toString(36).substring(2, 9),
        itemCount: totalItemCount,
        totalBudgetSnapshot: trip.totalPlannedBudget,
      };

      registerPdfExport(snapshot);
      setLastExported(snapshot.exportedAt);

      // Save PDF
      doc.save(`${trip.destination.toLowerCase()}_itinerary_yourtrip.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Tabular Itinerary PDF"
      description="Download a crisp, high-contrast, printable vector itinerary for your trip."
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Drift Status Alert */}
        {hasDrift && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your itinerary has changed since your last export on{' '}
              {new Date(lastSnapshot.exportedAt).toLocaleDateString()}. Exporting will create a fresh updated snapshot.
            </span>
          </div>
        )}

        {/* Snapshot Summary Card */}
        <div className="bg-canvas-50 border border-canvas-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Document:</span>
            <span className="font-bold text-slate-800">{trip.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Days Included:</span>
            <span className="font-semibold text-slate-800">{trip.days.length} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Activities:</span>
            <span className="font-semibold text-slate-800">{totalItemCount} scheduled stops</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Format:</span>
            <span className="font-semibold text-slate-800">Clean Table (Printable A4 Vector PDF)</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-canvas-200 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} size="sm">
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isExporting}
            onClick={generatePDF}
            className="px-6"
          >
            <FileDown className="w-4 h-4 mr-1.5" />
            <span>Download PDF Snapshot</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
