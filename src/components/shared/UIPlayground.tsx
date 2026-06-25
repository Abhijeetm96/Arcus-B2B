import * as React from 'react';
import { ShieldCheck, Home, Wrench, Sparkles, Star, Bell, Award } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { Switch } from '../ui/Switch';
import { Avatar } from '../ui/Avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/Dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../ui/Sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerTrigger } from '../ui/Drawer';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/Tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/DropdownMenu';
import { StatusBadge } from '../ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MetricCard } from './Card';
import { Skeleton, EmptyState } from './States';
import { Breadcrumb } from '../navigation/Breadcrumb';
import { Pagination } from '../navigation/Pagination';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
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
  const [activePlaygroundTab, setActivePlaygroundTab] = React.useState('colors');

  // Form setup
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
      cell: ({ row }) => `₹${row.original.price.toLocaleString('en-IN')}`,
    },
  ];

  // Toggle/Check states
  const [checkedBox, setCheckedBox] = React.useState(true);
  const [radioVal, setRadioVal] = React.useState('option-a');
  const [switchOn, setSwitchOn] = React.useState(false);

  // Overlay states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Nested Overlay Test States
  const [isNestedOuterOpen, setIsNestedOuterOpen] = React.useState(false);
  const [isNestedInnerOpen, setIsNestedInnerOpen] = React.useState(false);



  // Sidebar navigation menu item configuration
  const navigationSections = [
    {
      group: 'Foundations',
      items: [
        { id: 'colors', name: 'Colors & Brand Theme' },
        { id: 'typography', name: 'Typography Scale' },
        { id: 'spacing', name: 'Spacing Tokens' },
      ]
    },
    {
      group: 'Basic Controls',
      items: [
        { id: 'buttons', name: 'Buttons & Action Toggles' },
        { id: 'inputs', name: 'Inputs & Form Fields' },
        { id: 'forms', name: 'Form Validation (Zod)' },
      ]
    },
    {
      group: 'Overlays & Modals',
      items: [
        { id: 'dialogs', name: 'Dialogs & Modal Alerts' },
        { id: 'sheets', name: 'Sheets & Sidebar Drawers' },
        { id: 'tooltips', name: 'Tooltips & Popovers' },
        { id: 'dropdowns', name: 'Dropdown Menus' },
      ]
    },
    {
      group: 'Data & Display',
      items: [
        { id: 'cards', name: 'Cards & Metrics' },
        { id: 'avatars', name: 'Avatars & Status Badges' },
        { id: 'tables', name: 'Data Tables (TanStack)' },
      ]
    },
    {
      group: 'Navigation & Layouts',
      items: [
        { id: 'navigation', name: 'Breadcrumbs & Pagination' },
        { id: 'layouts', name: 'Page & Workspace Layouts' },
      ]
    },
    {
      group: 'Feedback & States',
      items: [
        { id: 'states', name: 'Empty & Loading States' },
        { id: 'toasts', name: 'Toasts & Alerts' },
        { id: 'motion', name: 'Icons & Motion' },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-text-primary flex-col md:flex-row">
      <Toaster position="top-right" richColors />

      {/* Storybook Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 border-r border-border bg-slate-900 text-slate-200 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
              ARCUS <span className="text-primary text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">STORYBOOK</span>
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <span className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                {section.group}
              </span>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActivePlaygroundTab(item.id)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center justify-between",
                    activePlaygroundTab === item.id
                      ? "bg-primary text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  )}
                >
                  {item.name}
                  {activePlaygroundTab === item.id && <Sparkles className="h-3 w-3" />}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Active Workspace Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header Bar */}
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 md:px-8 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-text-primary">
              Design Playbook: {activePlaygroundTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="text-xs text-text-secondary font-semibold">
            ARCUS Design System v1.0
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-grow p-6 md:p-8 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-6 text-left">
          {/* COLORS & THEME */}
          {activePlaygroundTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Colors & Brand Palette</h3>
                <p className="text-xs text-text-secondary mt-1">Official color tokens mapping to the ARCUS procurement brand values.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <div className="h-24 bg-primary rounded-t flex items-end p-3"><span className="text-slate-950 font-extrabold text-xs">Primary Gold</span></div>
                  <CardContent className="p-3 text-xs space-y-1">
                    <p className="font-bold">#FFC107</p>
                    <p className="text-text-secondary">bg-primary, text-primary</p>
                  </CardContent>
                </Card>
                <Card>
                  <div className="h-24 bg-slate-900 rounded-t flex items-end p-3"><span className="text-white font-extrabold text-xs">Dark Charcoal</span></div>
                  <CardContent className="p-3 text-xs space-y-1">
                    <p className="font-bold">#0F172A</p>
                    <p className="text-text-secondary">bg-slate-900, text-white</p>
                  </CardContent>
                </Card>
                <Card>
                  <div className="h-24 bg-surface border border-border rounded-t flex items-end p-3"><span className="text-text-primary font-extrabold text-xs">Canvas Surface</span></div>
                  <CardContent className="p-3 text-xs space-y-1">
                    <p className="font-bold">#FFFFFF</p>
                    <p className="text-text-secondary">bg-surface, bg-white</p>
                  </CardContent>
                </Card>
                <Card>
                  <div className="h-24 bg-slate-50 border border-border rounded-t flex items-end p-3"><span className="text-text-primary font-extrabold text-xs">Page Background</span></div>
                  <CardContent className="p-3 text-xs space-y-1">
                    <p className="font-bold">#F8FAFC</p>
                    <p className="text-text-secondary">bg-slate-50</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY */}
          {activePlaygroundTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Typography Scale</h3>
                <p className="text-xs text-text-secondary mt-1">Official line height, font weights, and sizes for ARCUS portal views.</p>
              </div>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-border pb-4">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">h1. Heading Main</span>
                    <h1 className="text-3xl font-extrabold tracking-tight">ARCUS Commercial</h1>
                  </div>
                  <div className="border-b border-border pb-4">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">h2. Section Title</span>
                    <h2 className="text-xl font-bold uppercase tracking-wider">Purchase Workspace</h2>
                  </div>
                  <div className="border-b border-border pb-4">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">body. Core Text</span>
                    <p className="text-sm leading-relaxed">
                      Astral Poly Technik Limited provides a comprehensive 12-Year Limited Manufacturer Warranty against defects in materials and workmanship.
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">caption. Small Headers</span>
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      daily sales revenue trend
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SPACING TOKENS */}
          {activePlaygroundTab === 'spacing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Spacing Tokens</h3>
                <p className="text-xs text-text-secondary mt-1">Consistent margin, padding, and gaps applied in layouts.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Padding & Layout Spacing Visualizer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-text-secondary">p-8 (Desktop Page Padding - 32px)</span>
                    <div className="p-8 bg-primary/10 border border-dashed border-primary rounded text-center text-xs font-bold text-amber-900">
                      Standard outer dashboard shell padding
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-text-secondary">p-6 (Mobile/Dialog/Card Inner Padding - 24px)</span>
                    <div className="p-6 bg-slate-100 border border-dashed border-slate-300 rounded text-center text-xs font-bold text-slate-600">
                      Dialog overlays and stats card content padding
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-text-secondary">gap-6 (Grid Gap - 24px)</span>
                    <div className="flex gap-6 bg-slate-50 border border-dashed border-slate-200 p-4 rounded">
                      <div className="flex-1 bg-surface border border-border p-3 text-center text-xs font-bold">Grid Panel 1</div>
                      <div className="flex-1 bg-surface border border-border p-3 text-center text-xs font-bold">Grid Panel 2</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* BUTTONS */}
          {activePlaygroundTab === 'buttons' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Buttons & Action Controls</h3>
                <p className="text-xs text-text-secondary mt-1">Action button triggers in various sizes, variants, and loading states.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Button Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary Yellow</Button>
                    <Button variant="secondary">Secondary Slate</Button>
                    <Button variant="outline">Outline Border</Button>
                    <Button variant="ghost">Ghost Icon/Link</Button>
                    <Button variant="danger">Danger Action</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Sizes & Loading States</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small Action</Button>
                    <Button size="md">Default Md</Button>
                    <Button size="lg">Large Hero</Button>
                    <Button isLoading>Trigger Loading</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* INPUTS */}
          {activePlaygroundTab === 'inputs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Form Input Controls</h3>
                <p className="text-xs text-text-secondary mt-1">Interactive input controls (Inputs, Textareas, Selects, Checkboxes, Switches, RadioGroups).</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Text Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase">Product SKU</label>
                      <Input placeholder="Enter product code (e.g. AST-104)" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase">Material Select</label>
                      <Select 
                        value={radioVal} 
                        onChange={(e) => setRadioVal(e.target.value)}
                        options={[
                          { label: 'Plumbing CPVC Pipe', value: 'option-a' },
                          { label: 'JSW TMT Rebars', value: 'option-b' },
                          { label: 'OPC Cement Cement', value: 'option-c' },
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Checks & Switches</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" checked={checkedBox} onCheckedChange={(val) => setCheckedBox(!!val)} />
                      <label htmlFor="terms" className="text-xs font-semibold text-text-primary">I accept the terms and conditions</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="toggle-stock" checked={switchOn} onCheckedChange={setSwitchOn} />
                      <label htmlFor="toggle-stock" className="text-xs font-semibold text-text-primary">Filter low stock alerts only</label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-secondary uppercase block">Select Priority</label>
                      <Radio id="prio-low" name="prio" value="low" checked={radioVal === 'low'} onChange={() => setRadioVal('low')} label="Low Priority" />
                      <Radio id="prio-med" name="prio" value="med" checked={radioVal === 'med'} onChange={() => setRadioVal('med')} label="Medium Priority" />
                      <Radio id="prio-high" name="prio" value="high" checked={radioVal === 'high'} onChange={() => setRadioVal('high')} label="High Priority" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* FORMS */}
          {activePlaygroundTab === 'forms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">React Hook Form with Zod</h3>
                <p className="text-xs text-text-secondary mt-1">Official form validator wrapper integrating Zod resolver schemas.</p>
              </div>
              <Card className="max-w-xl">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">New RFQ Product Entry</CardTitle>
                  <CardDescription>All fields contain client validation rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="materialName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Cement, TMT Steel, CPVC Pipe..." {...field} />
                            </FormControl>
                            <FormDescription>Please specify exact manufacturer details.</FormDescription>
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
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            </FormControl>
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
                                {...field}
                                options={[
                                  { label: 'Low Priority', value: 'low' },
                                  { label: 'Medium Priority', value: 'medium' },
                                  { label: 'High Priority', value: 'high' },
                                ]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">Create RFQ Record</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* DIALOGS */}
          {activePlaygroundTab === 'dialogs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Dialogs & Modals</h3>
                <p className="text-xs text-text-secondary mt-1">Radix Dialog primitive overlay modals with focus trapping.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Modal Interactions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setIsDialogOpen(true)}>Open Action Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Standard Action Dialog</DialogTitle>
                        <DialogDescription>
                          This modal has custom backdrop blur, traps focus, and closes via Escape or close button.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 text-sm text-text-secondary">
                        Fill in any details here. Focus is maintained inside this container.
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => { setIsDialogOpen(false); toast.success('Dialog action confirmed'); }}>Confirm Action</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Stacked Dialog Verification */}
                  <Button onClick={() => setIsNestedOuterOpen(true)}>Verify Stacked Dialogs</Button>
                  <Dialog open={isNestedOuterOpen} onOpenChange={setIsNestedOuterOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Parent Modal</DialogTitle>
                        <DialogDescription>First overlay stack. Click below to stack another dialog.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Button onClick={() => setIsNestedInnerOpen(true)}>Open Child Modal</Button>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setIsNestedOuterOpen(false)}>Close Parent</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isNestedInnerOpen} onOpenChange={setIsNestedInnerOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Child Modal</DialogTitle>
                        <DialogDescription>Second overlay stack. Focus is trapped here. Closing this returns focus to Parent.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 text-xs text-danger font-semibold">
                        Pressing Escape will close this top modal only.
                      </div>
                      <div className="flex justify-end">
                        <Button variant="primary" onClick={() => setIsNestedInnerOpen(false)}>Close Child</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SHEETS */}
          {activePlaygroundTab === 'sheets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Sheets & Drawers</h3>
                <p className="text-xs text-text-secondary mt-1">Radix Dialog side panel sheets and mobile bottom drawers.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Sheet Panels</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button onClick={() => setIsSheetOpen(true)}>Trigger Right Sheet</Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Right Panel Sidebar</SheetTitle>
                        <SheetDescription>Usually for filters, activity details, or checklist logs.</SheetDescription>
                      </SheetHeader>
                      <div className="py-6 text-xs space-y-3">
                        <p className="font-bold uppercase text-text-secondary">Detail log info:</p>
                        <div className="p-3 bg-slate-50 border rounded text-slate-600 leading-relaxed">
                          All logs generated are locked to the user scope.
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Drawer (Sheet bottom side panel wrapper) */}
                  <Drawer open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                    <DrawerTrigger asChild>
                      <Button onClick={() => setIsMobileDrawerOpen(true)}>Trigger Bottom Drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Specialized Bottom Drawer</DrawerTitle>
                        <DrawerDescription>
                          A Sheet-based bottom drawer avoiding duplicate vaul dependency overlaps.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="py-4 text-sm text-center">
                        This layout is responsive, providing a clean indicator bar and bottom panel alignment.
                      </div>
                      <div className="flex justify-end p-4">
                        <DrawerClose asChild>
                          <Button variant="outline" onClick={() => setIsMobileDrawerOpen(false)}>Close Drawer</Button>
                        </DrawerClose>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TOOLTIPS */}
          {activePlaygroundTab === 'tooltips' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Tooltips & Popovers</h3>
                <p className="text-xs text-text-secondary mt-1">Radix Tooltip hover actions and Radix Popover contextual cards.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Tooltip & Popover Demos</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-6">
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover Tooltip</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-semibold">Vetted CPVC Material Specifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open Popover Card</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-text-primary">Active Procurement Sync</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Database is synced directly with ACC Cement & JSW Steel local dispatch yards.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            </div>
          )}

          {/* DROPDOWNS */}
          {activePlaygroundTab === 'dropdowns' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Dropdown Menus</h3>
                <p className="text-xs text-text-secondary mt-1">Radix DropdownMenu action selection with keyboard navigation support.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Dropdown Context Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>Show Actions Dropdown</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>RFQ Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toast.success('RFQ edit mode enabled')}>
                        <span>Edit RFQ Worksheet</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('PDF export initialized')}>
                        <span>Export as PDF Log</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        <span>Delete Worksheet (Locked)</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CARDS */}
          {activePlaygroundTab === 'cards' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Cards & Metrics</h3>
                <p className="text-xs text-text-secondary mt-1">Standard layout panels and KPI metric cards with trends.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Standard Canvas Panel</CardTitle>
                    <CardDescription>A basic layout wrapper with borders</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-text-secondary leading-relaxed">
                    This is a standard card content box. It has consistent padding, card typography weights, and border colors.
                  </CardContent>
                </Card>

                <MetricCard
                  title="Annual Sales Spend"
                  value="₹84,93,200"
                  description="Procurement volume over trailing 12 months"
                  icon={<Award className="h-4 w-4 text-text-secondary" />}
                  trend={{ value: '18.4%', isPositive: true }}
                />
              </div>
            </div>
          )}

          {/* AVATARS */}
          {activePlaygroundTab === 'avatars' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Avatars & Status Badges</h3>
                <p className="text-xs text-text-secondary mt-1">Official profile picture slots and status tag indicators.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Avatar Sizes</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4 flex-wrap">
                    <Avatar fallback="SM" size="sm" alt="Small Avatar" />
                    <Avatar fallback="MD" size="md" alt="Default Avatar" />
                    <Avatar fallback="LG" size="lg" alt="Large Avatar" />
                    <Avatar fallback="XL" size="xl" alt="Extra Large Avatar" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Status Indicators</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <StatusBadge status="Approved" />
                    <StatusBadge status="Pending" />
                    <StatusBadge status="Rejected" />
                    <StatusBadge status="Delivered" />
                    <StatusBadge status="Cancelled" />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TABLES */}
          {activePlaygroundTab === 'tables' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Data Tables (TanStack)</h3>
                <p className="text-xs text-text-secondary mt-1">Re-usable paginated table wrapper incorporating column searching.</p>
              </div>
              <Card>
                <CardContent className="p-6">
                  <DataTable
                    columns={materialColumns}
                    data={mockMaterials}
                    filterColumnId="name"
                    filterPlaceholder="Search products in worksheet..."
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* NAVIGATION */}
          {activePlaygroundTab === 'navigation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Breadcrumbs & Pagination</h3>
                <p className="text-xs text-text-secondary mt-1">Official navigation bars, breadcrumbs, and pagination wrappers.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Breadcrumb Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <Breadcrumb
                    items={[
                      { label: 'Admin Portal', href: '#/portal/admin' },
                      { label: 'Inventory Desk', href: '#/portal/admin/inventory' },
                      { label: 'Stock Audit' }
                    ]}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Pagination Shell</CardTitle>
                </CardHeader>
                <CardContent>
                  <Pagination
                    currentPage={2}
                    totalPages={5}
                    onPageChange={(page) => toast.info(`Navigated to page ${page}`)}
                    totalItems={45}
                    itemsPerPage={10}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* LAYOUTS */}
          {activePlaygroundTab === 'layouts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Page & Workspace Layout Shells</h3>
                <p className="text-xs text-text-secondary mt-1">Architectural templates demonstrating shell spacings and split pane detail views.</p>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-text-secondary uppercase">PageLayout Structure preview:</span>
                <div className="border border-border rounded overflow-hidden shadow-sm bg-slate-100 flex flex-col h-40">
                  <div className="h-8 bg-slate-900 text-white flex items-center px-4 justify-between text-[10px] font-bold">
                    <span>ARCUS Page Shell</span>
                    <span>Navbar.tsx</span>
                  </div>
                  <div className="flex flex-1 min-h-0">
                    <div className="w-12 bg-slate-800 border-r border-slate-700 flex flex-col gap-1 p-1 text-[8px] text-slate-400 font-semibold">
                      <div className="h-3 bg-slate-700 rounded-xs"></div>
                      <div className="h-3 bg-slate-700 rounded-xs"></div>
                      <div className="h-3 bg-slate-700 rounded-xs"></div>
                    </div>
                    <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                      <div className="h-3 bg-slate-300 w-1/4 rounded-xs"></div>
                      <div className="h-3 bg-slate-300 w-1/2 rounded-xs"></div>
                      <div className="h-10 bg-white border border-border rounded-xs"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-text-secondary uppercase">WorkspaceLayout Split-Pane preview:</span>
                <WorkspaceLayout
                  className="min-h-0 h-48"
                  toolbar={
                    <div className="flex items-center justify-between w-full text-[10px] font-bold">
                      <span>Workspace Toolbar Slot</span>
                      <Button size="sm" className="h-6 text-[9px] px-2">Action Button</Button>
                    </div>
                  }
                  splitPane
                  workspaceSidebar={
                    <div className="p-3 text-[10px] text-text-secondary space-y-1">
                      <p className="font-bold">Sidebar List Pane</p>
                      <div className="p-1.5 bg-primary/10 rounded-xs font-medium text-[9px]">Item Row 1</div>
                      <div className="p-1.5 hover:bg-slate-100 rounded-xs font-medium text-[9px]">Item Row 2</div>
                    </div>
                  }
                  workspaceDetails={
                    <div className="p-3 text-[10px] text-text-secondary space-y-1">
                      <p className="font-bold">Details Content Pane</p>
                      <p className="text-[9px]">Select any sidebar item to populate detailed analytics logs.</p>
                    </div>
                  }
                />
              </div>
            </div>
          )}

          {/* STATES */}
          {activePlaygroundTab === 'states' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Empty & Loading States</h3>
                <p className="text-xs text-text-secondary mt-1">Placeholder cards displaying data loader skeletons and empty lists.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Empty State Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      title="No RFQs Available"
                      description="You do not have any pending negotiations inside this folder."
                      className="min-h-0 py-6"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wider">Skeleton Loaders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TOASTS */}
          {activePlaygroundTab === 'toasts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Toast & Alert Feedbacks</h3>
                <p className="text-xs text-text-secondary mt-1">Standard notification push alerts triggered via user interactions.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wider">Toasts Triggers</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="outline" onClick={() => toast.info('System notification generated')}>Trigger Info Toast</Button>
                  <Button variant="primary" onClick={() => toast.success('Workspace settings updated successfully!')}>Trigger Success Toast</Button>
                  <Button variant="danger" onClick={() => toast.error('Connection timeout during document dispatch.')}>Trigger Error Toast</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MOTION & ICONS */}
          {activePlaygroundTab === 'motion' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-text-primary">Icons & Motion</h3>
                <p className="text-xs text-text-secondary mt-1">Lucide SVG icons and Tailwind animate classes.</p>
              </div>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 text-center">
                    <div className="flex flex-col items-center p-2 border border-border rounded bg-slate-50">
                      <Home className="h-5 w-5 text-text-secondary" />
                      <span className="text-[9px] font-mono mt-1">Home</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border border-border rounded bg-slate-50">
                      <Wrench className="h-5 w-5 text-text-secondary" />
                      <span className="text-[9px] font-mono mt-1">Wrench</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border border-border rounded bg-slate-50">
                      <ShieldCheck className="h-5 w-5 text-text-secondary" />
                      <span className="text-[9px] font-mono mt-1">Shield</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border border-border rounded bg-slate-50">
                      <Star className="h-5 w-5 text-text-secondary" />
                      <span className="text-[9px] font-mono mt-1">Star</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border border-border rounded bg-slate-50">
                      <Bell className="h-5 w-5 text-text-secondary" />
                      <span className="text-[9px] font-mono mt-1">Bell</span>
                    </div>
                    <div className="flex flex-col items-center p-2 border border-border rounded bg-slate-50">
                      <Award className="h-5 w-5 text-text-secondary" />
                      <span className="text-[9px] font-mono mt-1">Award</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-secondary uppercase">Animate Spin (Loading state):</span>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                      <span className="text-xs font-semibold text-text-secondary">Syncing repository cache...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
