import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../../components/ui/Tabs';
import type { RFQDetail } from '../../types/rfqTypes';
import { OverviewTab } from './tabs/OverviewTab';
import { ItemsTab } from './tabs/ItemsTab';
import { TimelineTab } from './tabs/TimelineTab';
import { NotesTab } from './tabs/NotesTab';
import { AttachmentsTab } from './tabs/AttachmentsTab';
import { CustomerTab } from './tabs/CustomerTab';
import { QuotationTab } from './tabs/QuotationTab';

interface DrawerTabsProps {
  rfq: RFQDetail;
  onAddNote: (text: string, isInternal: boolean) => Promise<void>;
  onDownloadAttachment: (filename: string) => void;
  onDownloadQuote: (quoteId: string, filename: string) => void;
}

export function DrawerTabs({
  rfq,
  onAddNote,
  onDownloadAttachment,
  onDownloadQuote
}: DrawerTabsProps) {
  return (
    <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
      {/* Scrollable Tabs Trigger Bar */}
      <div className="border-b border-border bg-slate-50/50 p-2 shrink-0">
        <TabsList className="flex overflow-x-auto w-full gap-1 p-0.5 justify-start bg-transparent border-0 scrollbar-none">
          <TabsTrigger value="overview" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Overview
          </TabsTrigger>
          <TabsTrigger value="items" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Items ({rfq.items?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Notes ({rfq.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="attachments" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Attachments ({rfq.attachments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="customer" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Customer
          </TabsTrigger>
          <TabsTrigger value="quotations" className="text-xs font-semibold px-3 py-1.5 rounded-md h-8 shrink-0">
            Quotes ({rfq.quotations?.length || 0})
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tabs Content Sections */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-surface">
        <TabsContent value="overview" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <OverviewTab rfq={rfq} />
        </TabsContent>
        
        <TabsContent value="items" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <ItemsTab rfq={rfq} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <TimelineTab rfq={rfq} />
        </TabsContent>

        <TabsContent value="notes" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <NotesTab rfq={rfq} onAddNote={onAddNote} />
        </TabsContent>

        <TabsContent value="attachments" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <AttachmentsTab rfq={rfq} onDownload={onDownloadAttachment} />
        </TabsContent>

        <TabsContent value="customer" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <CustomerTab rfq={rfq} />
        </TabsContent>

        <TabsContent value="quotations" className="mt-0 p-0 border-0 shadow-none bg-transparent">
          <QuotationTab rfq={rfq} onDownloadQuote={onDownloadQuote} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
