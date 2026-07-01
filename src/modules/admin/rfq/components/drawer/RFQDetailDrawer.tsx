import * as React from 'react';
import { Sheet, SheetContent } from '../../../../../components/ui/Sheet';
import type { RFQDetail } from '../../types/rfqTypes';
import { DrawerHeader } from './DrawerHeader';
import { DrawerActions } from './DrawerActions';
import { DrawerTabs } from './DrawerTabs';
import { DrawerFooter } from './DrawerFooter';

interface RFQDetailDrawerProps {
  rfq: RFQDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (text: string, isInternal: boolean) => Promise<void>;
  onDownloadAttachment: (filename: string) => void;
  onDownloadQuote: (quoteId: string, filename: string) => void;
  onAction: (actionKey: string) => void;
}

export function RFQDetailDrawer({
  rfq,
  isOpen,
  onClose,
  onAddNote,
  onDownloadAttachment,
  onDownloadQuote,
  onAction
}: RFQDetailDrawerProps) {
  // Responsive drawer alignment state
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 767px)');
    setIsMobile(media.matches);

    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  if (!rfq) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="p-0 flex flex-col justify-between overflow-hidden w-full max-w-full sm:max-w-xl md:max-w-2xl h-full border-border bg-surface shadow-lg text-left"
      >
        {/* Mobile handle pull bar */}
        {isMobile && (
          <div className="mx-auto h-1 w-12 rounded-full bg-border mt-3 mb-1 shrink-0" />
        )}

        {/* Header container */}
        <div className="px-4 md:px-6 pt-4 pb-2 shrink-0">
          <DrawerHeader rfq={rfq} />
        </div>

        {/* Content Tabs (takes remaining height) */}
        <DrawerTabs
          rfq={rfq}
          onAddNote={onAddNote}
          onDownloadAttachment={onDownloadAttachment}
          onDownloadQuote={onDownloadQuote}
        />

        {/* Actions panel */}
        <DrawerActions rfq={rfq} onAction={onAction} />

        {/* Footer info metadata */}
        <DrawerFooter rfq={rfq} />
      </SheetContent>
    </Sheet>
  );
}
