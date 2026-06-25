import * as React from 'react';
import { Play, Eye, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { Switch } from '../ui/Switch';
import { Avatar } from '../ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/Accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/Drawer';
import { StatusBadge } from '../ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MetricCard } from './Card';
import { SearchInput } from './SearchInput';
import { Skeleton, EmptyState, LoadingState } from './States';
import { Timeline, type TimelineItem } from './Timeline';
import { Breadcrumb } from '../navigation/Breadcrumb';
import { PageHeader } from '../navigation/PageHeader';
import { Pagination } from '../navigation/Pagination';
import { toast, Toaster } from 'sonner';
import { DataTable } from '../ui/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../ui/Form';

const playgroundFormSchema = z.object({
  materialName: z.string().min(3, { message: 'Material name must be at least 3 characters.' }),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1.' }),
  priority: z.enum(['low', 'medium', 'high']),
});

type PlaygroundFormValues = z.infer<typeof playgroundFormSchema>;

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

export function UIPlayground() {
  const [inputText, setInputText] = React.useState('');
  const [selectVal, setSelectVal] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PlaygroundFormValues>({
    resolver: zodResolver(playgroundFormSchema),
    defaultValues: {
      materialName: '',
      quantity: 10,
      priority: 'medium',
    },
  });

  const onSubmitForm = (values: PlaygroundFormValues) => {
    toast.success(`Form submitted successfully! Material: ${values.materialName}, Qty: ${values.quantity}, Priority: ${values.priority}`);
    form.reset();
  };

  const mockMaterials: MaterialItem[] = [
    { id: '1', name: 'Astral CPVC Pipe 1"', category: 'Plumbing', stock: 150, price: 450 },
    { id: '2', name: 'UltraTech Cement Bag', category: 'Cement', stock: 80, price: 390 },
    { id: '3', name: 'JSW TMT Rebar Fe500', category: 'Steel', stock: 240, price: 56000 },
    { id: '4', name: 'Anchor Modular Switch', category: 'Electrical', stock: 500, price: 85 },
  ];

  const materialColumns: ColumnDef<MaterialItem>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'stock',
      header: 'Stock Count',
    },
    {
      accessorKey: 'price',
      header: 'Unit Price',
      cell: ({ row }) => {
        return `₹${row.original.price.toLocaleString('en-IN')}`;
      },
    },
  ];

  // Toggle/Check states
  const [checkedBox, setCheckedBox] = React.useState(true);
  const [radioVal, setRadioVal] = React.useState('option-a');
  const [switchOn, setSwitchOn] = React.useState(false);

  // Overlay states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const mockTimeline: TimelineItem[] = [
    { id: 1, title: 'RFQ Posted', description: 'RFQ #1024 was submitted by Business Buyer Astral Ltd.', timestamp: '10:00 AM', status: 'info' },
    { id: 2, title: 'Admin Review Complete', description: 'Assigned to Operator ID 42', timestamp: '10:30 AM', status: 'success' },
    { id: 3, title: 'Supplier Bids Simulated', description: 'Simulated 3 vendor offers', timestamp: '11:15 AM', status: 'warning' },
    { id: 4, title: 'Pending Buyer Acceptance', description: 'Sent revised quotes to client', timestamp: '12:00 PM', status: 'default' },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 md:p-8 space-y-8">
      <Toaster position="top-right" richColors />
      
      {/* Page Header */}
      <div className="pb-6 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">ARCUS UI PLAYGROUND</h1>
          <p className="text-sm text-text-secondary mt-1 uppercase tracking-wider font-semibold">
            Internal Component Showcase & Visual Testing Environment (v1.0)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('System notification generated')}>Trigger Info Toast</Button>
          <Button variant="primary" size="sm" onClick={() => toast.success('Workspace settings updated successfully!')}>Trigger Success Toast</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base uppercase tracking-wider">Playground Index</CardTitle>
              <CardDescription>Quick jump to sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#buttons" className="block text-sm font-semibold hover:text-primary transition-colors">Buttons & Actions</a>
              <a href="#inputs" className="block text-sm font-semibold hover:text-primary transition-colors">Form Elements</a>
              <a href="#toggles" className="block text-sm font-semibold hover:text-primary transition-colors">Toggles & Checks</a>
              <a href="#avatars" className="block text-sm font-semibold hover:text-primary transition-colors">Avatars & Details</a>
              <a href="#badges" className="block text-sm font-semibold hover:text-primary transition-colors">Status Badges</a>
              <a href="#disclosure" className="block text-sm font-semibold hover:text-primary transition-colors">Tabs & Accordions</a>
              <a href="#overlays" className="block text-sm font-semibold hover:text-primary transition-colors">Modals & Sheets</a>
              <a href="#cards" className="block text-sm font-semibold hover:text-primary transition-colors">Cards & KPIs</a>
              <a href="#navigation" className="block text-sm font-semibold hover:text-primary transition-colors">Navigation Items</a>
              <a href="#states" className="block text-sm font-semibold hover:text-primary transition-colors">Placeholders & Loader States</a>
              <a href="#timeline" className="block text-sm font-semibold hover:text-primary transition-colors">Timelines & Feeds</a>
              <a href="#tables" className="block text-sm font-semibold hover:text-primary transition-colors">Data Tables (TanStack)</a>
              <a href="#forms" className="block text-sm font-semibold hover:text-primary transition-colors">React Hook Form (Zod)</a>
            </CardContent>
          </Card>
        </div>

        {/* Components Workspace */}
        <div className="lg:col-span-3 space-y-12">
          {/* Section 1: Buttons */}
          <section id="buttons" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Buttons & Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Button Variants</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Yellow</Button>
                  <Button variant="secondary">Secondary Gray</Button>
                  <Button variant="outline">Outline Border</Button>
                  <Button variant="ghost">Ghost Transparent</Button>
                  <Button variant="danger">Danger Red</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Sizes & States</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small Button</Button>
                  <Button size="md">Medium Base</Button>
                  <Button size="lg">Large Action</Button>
                  <Button disabled>Disabled State</Button>
                  <Button isLoading={isLoading} onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 2000);
                  }}>
                    Click to Load
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Inputs */}
          <section id="inputs" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Form Elements</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Standard Username"
                    placeholder="Enter email or username"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    required
                  />
                  <Input
                    label="Input Error Warning"
                    placeholder="Enter details"
                    error="This field is required and must contain 10 characters."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Materials Select List"
                    options={[
                      { label: 'Astral CPVC Pipe (1.5 Inch)', value: 'astral_cpvc' },
                      { label: 'UltraTech Cement (50kg Bag)', value: 'ultratech_cement' },
                      { label: 'JSW Steel TMT Rebar (Fe500)', value: 'jsw_steel' },
                    ]}
                    value={selectVal}
                    onChange={(e) => setSelectVal(e.target.value)}
                    placeholder="Select catalog product"
                  />
                  <SearchInput
                    placeholder="Global platform search..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onClear={() => setInputText('')}
                  />
                </div>

                <Textarea
                  label="Detailed RFQ Specifications"
                  placeholder="Enter bulk material specifications..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Toggles & Checks */}
          <section id="toggles" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Toggles & Checks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Checkboxes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Checkbox
                    label="I accept terms and conditions"
                    checked={checkedBox}
                    onChange={setCheckedBox}
                  />
                  <Checkbox
                    label="Disabled check state"
                    checked={true}
                    disabled
                  />
                  <Checkbox
                    label="Tax Invoice requested"
                    error="Required for business transactions."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Radio Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Radio
                    name="playground-radio"
                    label="Individual Account"
                    checked={radioVal === 'option-a'}
                    onChange={() => setRadioVal('option-a')}
                  />
                  <Radio
                    name="playground-radio"
                    label="Business Enterprise Account"
                    checked={radioVal === 'option-b'}
                    onChange={() => setRadioVal('option-b')}
                  />
                  <Radio
                    name="playground-radio"
                    label="Disabled Vendor Profile"
                    disabled
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Switches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Switch
                    label="Enable SMS Alert notifications"
                    checked={switchOn}
                    onChange={setSwitchOn}
                  />
                  <Switch
                    label="Dark Mode (Auto)"
                    checked={true}
                    disabled
                  />
                  <Switch
                    label="Auto-verify GST Status"
                    error="GST portal connection is offline."
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Avatars */}
          <section id="avatars" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Avatars & Details</h2>
            <Card>
              <CardContent className="flex flex-wrap items-center gap-6 pt-6">
                <Avatar size="sm" fallback="JD" alt="John Doe" />
                <Avatar size="md" fallback="AM" alt="Abhijeet M" className="bg-primary/20 text-text-primary" />
                <Avatar size="lg" fallback="BP" alt="BuildPoints" />
                <Avatar size="xl" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80" alt="Jane User" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-primary">Jane Smith</span>
                  <span className="text-xs text-text-secondary">Enterprise Administrator</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Badges */}
          <section id="badges" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Status Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Generic Badges</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Badge variant="default">New</Badge>
                  <Badge variant="secondary">Pending Review</Badge>
                  <Badge variant="success">Completed</Badge>
                  <Badge variant="warning">In Negotiation</Badge>
                  <Badge variant="danger">Cancelled</Badge>
                  <Badge variant="info">Assigned</Badge>
                  <Badge variant="outline">Draft Mode</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Semantic Status Badge Mapping</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <StatusBadge status="accepted" />
                  <StatusBadge status="negotiating" />
                  <StatusBadge status="failed" />
                  <StatusBadge status="shipping" />
                  <StatusBadge status="draft" />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 6: Disclosure & Tabs */}
          <section id="disclosure" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Tabs & Accordions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Tabs Navigation</span>
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rfqs">RFQs</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <p className="text-sm text-text-secondary">
                      This is the overview content segment. It displays the summary of recent activities and KPI targets.
                    </p>
                  </TabsContent>
                  <TabsContent value="rfqs">
                    <p className="text-sm text-text-secondary">
                      This panel contains the list of submitted B2B requests for quotations (RFQs).
                    </p>
                  </TabsContent>
                  <TabsContent value="invoices">
                    <p className="text-sm text-text-secondary">
                      Review billing statements, transaction records, and tax invoices here.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Accordion Expandables</span>
                <Accordion type="single" defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger value="item-1">How do BuildPoints work?</AccordionTrigger>
                    <AccordionContent value="item-1">
                      BuildPoints are loyalty points accumulated on every transaction. They can be redeemed during checkout to save money on construction materials.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger value="item-2">What is the standard response time for quotes?</AccordionTrigger>
                    <AccordionContent value="item-2">
                      Typically, suppliers respond with quotation bids within 24 to 48 hours after the RFQ is posted on the B2B portal.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger value="item-3">Can I edit my business GST settings?</AccordionTrigger>
                    <AccordionContent value="item-3">
                      Yes, you can edit business parameters and GST details inside the Settings module of your designated portal.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </section>

          {/* Section 7: Overlays & Modals */}
          <section id="overlays" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Modals & Sheets</h2>
            <Card>
              <CardContent className="flex flex-wrap gap-4 pt-6">
                <Button variant="primary" onClick={() => setIsDialogOpen(true)}>Open Dialog Modal</Button>
                <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>Open Right Sheet</Button>
              </CardContent>
            </Card>

            {/* Dialog Component Showcase */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Project Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this project workspace? This will permanently erase all associated RFQ drafts and quotations. This action is irreversible.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button variant="danger" onClick={() => {
                    setIsDialogOpen(false);
                    toast.error('Project workspace deleted successfully');
                  }}>Confirm Delete</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Sheet Component Showcase */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Audit Log Details</SheetTitle>
                  <SheetDescription>
                    System events and changes logged for RFQ #1024.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="rounded-lg bg-surface-secondary p-4 border border-border">
                    <span className="block text-xs font-semibold text-text-secondary">Operator ID</span>
                    <span className="text-sm font-medium text-text-primary">User #42 (Support Agent)</span>
                  </div>
                  <div className="rounded-lg bg-surface-secondary p-4 border border-border">
                    <span className="block text-xs font-semibold text-text-secondary">Action Code</span>
                    <span className="text-sm font-medium text-text-primary">SIMULATE_SUPPLIER_BIDS</span>
                  </div>
                  <div className="rounded-lg bg-surface-secondary p-4 border border-border">
                    <span className="block text-xs font-semibold text-text-secondary">Execution Timestamp</span>
                    <span className="text-sm font-medium text-text-primary">2026-06-25 11:15 AM</span>
                  </div>
                  <Button variant="outline" className="w-full mt-6" onClick={() => setIsSheetOpen(false)}>Close Sidebar</Button>
                </div>
              </SheetContent>
            </Sheet>
          </section>

          {/* Section 8: Cards */}
          <section id="cards" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Cards & KPIs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Active Projects"
                value="12"
                description="8 in Bengaluru, 4 in Chennai"
                icon={<Eye className="h-4 w-4" />}
                trend={{ value: '25%', isPositive: true }}
              />
              <MetricCard
                title="Redeemed BuildPoints"
                value="2,450"
                description="Equivalent to ₹2,450 savings"
                icon={<Play className="h-4 w-4" />}
                trend={{ value: '12%', isPositive: true }}
              />
              <MetricCard
                title="Pending B2B RFQs"
                value="4"
                description="Awaiting supplier simulation"
                icon={<FileText className="h-4 w-4" />}
                trend={{ value: '3%', isPositive: false }}
              />
            </div>
          </section>

          {/* Section 9: Navigation */}
          <section id="navigation" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Navigation Items</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <Breadcrumb
                  items={[
                    { label: 'Admin Portal', href: '#/portal/admin' },
                    { label: 'RFQ Management', href: '#/portal/admin/rfqs' },
                    { label: 'RFQ #1024' },
                  ]}
                />
                
                <PageHeader
                  title="RFQ Bidding Workspace"
                  description="Audit, negotiate and version quotations for RFQ #1024."
                  actions={
                    <>
                      <Button variant="outline" size="sm">Download PDF</Button>
                      <Button variant="primary" size="sm">Submit Quotation</Button>
                    </>
                  }
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={setCurrentPage}
                  totalItems={45}
                  itemsPerPage={10}
                />
              </CardContent>
            </Card>
          </section>

          {/* Section 10: Placeholders & Loaders */}
          <section id="states" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Placeholders & Loader States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Empty State Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="No Active Bids Found"
                    description="This RFQ has not received any supplier quotations yet. Trigger a bid simulation to begin."
                    icon={<AlertTriangle className="h-10 w-10 text-warning" />}
                    action={<Button size="sm">Simulate Bids</Button>}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Skeleton & Loading State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LoadingState text="Fetching audit metrics..." />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 11: Timelines */}
          <section id="timeline" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Timelines & Feeds</h2>
            <Card>
              <CardContent className="pt-6">
                <Timeline items={mockTimeline} />
              </CardContent>
            </Card>
          </section>

          {/* Section 12: Data Tables */}
          <section id="tables" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">Data Tables (TanStack)</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider">TanStack React Table Integration</CardTitle>
                <CardDescription>Includes pagination, column sorting, and filter text search.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={materialColumns}
                  data={mockMaterials}
                  filterColumnId="name"
                  filterPlaceholder="Search material name..."
                />
              </CardContent>
            </Card>
          </section>

          {/* Section 13: Forms */}
          <section id="forms" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-border pb-2">React Hook Form (Zod)</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider">Enterprise Form System Showcase</CardTitle>
                <CardDescription>Validating inputs with react-hook-form schema controllers and zod rules.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4 max-w-md">
                    <FormField
                      control={form.control}
                      name="materialName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter material name..." {...field} />
                          </FormControl>
                          <FormDescription>The catalog designation of the material.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Order batch quantity.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Select
                              options={[
                                { label: 'Low priority', value: 'low' },
                                { label: 'Medium priority', value: 'medium' },
                                { label: 'High priority', value: 'high' },
                              ]}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" variant="primary">Submit Material Request</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
