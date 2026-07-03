import type { RFQDetail, RFQSummary, RFQItem, RFQTimelineEvent, RFQComment, RFQAttachment, RFQQuotation } from '../types/rfqTypes';
import { RFQStatus } from '../constants/status';
import { RFQPriority } from '../constants/priority';
import { LOCATIONS, OWNERS } from '../constants/filters';

let mockRFQs: RFQDetail[] = [];

// Base template definitions for realistic procurement
const SCENARIOS = [
  {
    company: 'L&T Construction',
    project: 'Metro Line - Phase 3 Structural Girders',
    industry: 'Infrastructure & Highways',
    projectType: 'Highway Construction',
    location: 'Mumbai, MH',
    contact: 'Sunil Yardi',
    email: 'sunil.y@lntecc.com',
    phone: '+91 98200 12345',
    gst: '27AAACL1234D1Z2',
    description: 'Procurement of structural steel beams and high-tensile bolts for the Elevated Metro Viaduct section. Delivery must align with pre-cast launching schedules.',
    items: [
      { itemName: 'Structural Steel I-Beams (ISMB 400)', description: 'Fe410 grade, standard 12m length', quantity: 120, unit: 'Metric Tons', targetPrice: 62000 },
      { itemName: 'High-Tensile Bolts & Nuts (M24)', description: 'Grade 8.8, hot-dip galvanized', quantity: 5000, unit: 'Pieces', targetPrice: 140 },
      { itemName: 'Welding Electrodes (E7018)', description: 'Low hydrogen, vacuum packed', quantity: 350, unit: 'Boxes', targetPrice: 850 }
    ]
  },
  {
    company: 'Prestige Builders',
    project: 'Prestige Royal Gardens - Phase 2',
    industry: 'Residential Real Estate',
    projectType: 'Apartment Project',
    location: 'Bangalore, KA',
    contact: 'Manoj Kumar',
    email: 'manoj.k@prestigeconst.com',
    phone: '+91 94480 98765',
    gst: '29AABCP9876C2Z3',
    description: 'Procurement of partition wall blocks and building cement for structural infill walls across 3 residential towers (G+18 floors).',
    items: [
      { itemName: 'AAC Blocks (600x200x150mm)', description: 'Grade I, density 600 kg/m3', quantity: 18000, unit: 'Pieces', targetPrice: 65 },
      { itemName: 'OPC 53 Grade Cement', description: 'UltraTech or ACC, standard 50kg bag', quantity: 2500, unit: 'Bags', targetPrice: 420 },
      { itemName: 'Polymer Modified Joint Mortar', description: 'Self-curing thin-bed adhesive', quantity: 450, unit: 'Bags', targetPrice: 380 }
    ]
  },
  {
    company: 'ABC Constructions',
    project: 'Commercial Plaza - Core & Shell',
    industry: 'Commercial Construction',
    projectType: 'Commercial Building',
    location: 'Hubli, KA',
    contact: 'Vilas Patil',
    email: 'vilas@abcconstructions.in',
    phone: '+91 83620 54321',
    gst: '29AABCA5432E1Z8',
    description: 'Core reinforcement and masonry package for commercial high-street showroom complex.',
    items: [
      { itemName: 'TMT Steel Bars (12mm Fe500D)', description: 'TATA Tiscon or JSW Neosteel', quantity: 45, unit: 'Metric Tons', targetPrice: 64000 },
      { itemName: 'Ready Mix Concrete (M30)', description: 'Standard mix, pumpable, 4 hours slump retention', quantity: 850, unit: 'Cubic Meters', targetPrice: 4800 },
      { itemName: 'Flyash Clay Bricks', description: 'Class 7.5, size 230x110x70mm', quantity: 65000, unit: 'Pieces', targetPrice: 8 }
    ]
  },
  {
    company: 'Fortis Healthcare',
    project: 'Fortis Multi-Specialty Wing Renovation',
    industry: 'Healthcare Projects',
    projectType: 'Hospital Procurement',
    location: 'Pune, MH',
    contact: 'Dr. Rakesh Shah',
    email: 'rakesh.shah@fortis-india.com',
    phone: '+91 91200 45678',
    gst: '27AAACF4567M1Z4',
    description: 'Renovation of operating theaters and ICU zones requiring central VRF air conditioning and cleanroom lighting solutions.',
    items: [
      { itemName: 'VRF Outdoor Condensing Unit (18 HP)', description: 'Daikin or Blue Star, inverter scroll compressor', quantity: 4, unit: 'Units', targetPrice: 320000 },
      { itemName: 'VRF Ceiling Cassette Indoor Unit (2.0 TR)', description: '4-way blow panel, low noise', quantity: 32, unit: 'Units', targetPrice: 45000 },
      { itemName: 'HEPA Filter Fan Units (FFU)', description: 'Efficiency 99.997% at 0.3 micron', quantity: 12, unit: 'Pieces', targetPrice: 28000 }
    ]
  },
  {
    company: 'Tata Projects',
    project: 'Smart Electronics Factory Expansion',
    industry: 'Industrial & Warehousing',
    projectType: 'Factory Expansion',
    location: 'Pune, MH',
    contact: 'Ashok Ranade',
    email: 'aranade@tataprojects.com',
    phone: '+91 99220 33445',
    gst: '27AAACT3344F1Z0',
    description: 'Main electrical distribution panel and high-capacity armored cabling setup for new factory testing floor.',
    items: [
      { itemName: 'LT Armored XLPE Cable (3.5C x 300 sq mm)', description: '1.1KV grade, copper conductor, ISI marked', quantity: 850, unit: 'Meters', targetPrice: 1850 },
      { itemName: 'Main Power Distribution Panel (800A)', description: 'Siemens/ABB switchgear, IP54 floor standing', quantity: 2, unit: 'Panels', targetPrice: 240000 },
      { itemName: 'Copper Grounding Plate (600x600x6mm)', description: 'Including copper flat tape and charcoal-salt mix', quantity: 15, unit: 'Sets', targetPrice: 7500 }
    ]
  },
  {
    company: 'Karnataka PWD',
    project: 'Hubli-Dharwad Ring Road Bypass - Package B',
    industry: 'Government Infrastructure',
    projectType: 'Government Tender',
    location: 'Hubli, KA',
    contact: 'H. S. Patil (Executive Engineer)',
    email: 'ee.hdbypass@kpwd.gov.in',
    phone: '+91 83622 11002',
    gst: '29AAAGK1102A1Z9',
    description: 'High-density drainage piping and geogrid soil stabilization sheets for embankment reinforcement.',
    items: [
      { itemName: 'HDPE Corrugated Perforated Pipe (DN 200)', description: 'Class SN8, drainage application', quantity: 1600, unit: 'Meters', targetPrice: 420 },
      { itemName: 'Biaxial Polyester Geogrid (80kN/m)', description: 'Aperture size 35x35mm, UV stabilized', quantity: 12000, unit: 'Square Meters', targetPrice: 85 },
      { itemName: 'Non-woven Geotextile Fabric (200 GSM)', description: 'Continuous filament, polypropylene', quantity: 15000, unit: 'Square Meters', targetPrice: 45 }
    ]
  }
];

export function initializeMockData() {
  if (mockRFQs.length > 0) return;

  const statuses = Object.values(RFQStatus);
  const priorities = Object.values(RFQPriority);

  let currentId = 1;

  // Generate 54 RFQs (9 of each of the 6 templates)
  for (let i = 0; i < 54; i++) {
    const scenarioIndex = i % SCENARIOS.length;
    const template = SCENARIOS[scenarioIndex];

    const rfqIdStr = `RFQ-2026-${String(currentId).padStart(3, '0')}`;
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const owner = OWNERS[i % OWNERS.length];
    const location = LOCATIONS[i % LOCATIONS.length];

    // Dates calculations
    const today = new Date('2026-06-26T00:00:00Z');
    const createdDaysAgo = (i * 2) + 1;
    const createdDate = new Date(today.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
    const updatedDaysAgo = Math.max(0, createdDaysAgo - (i % 3));
    const updatedDate = new Date(today.getTime() - updatedDaysAgo * 24 * 60 * 60 * 1000);
    const dueDaysInFuture = 15 + (i % 10);
    const dueDate = new Date(today.getTime() + dueDaysInFuture * 24 * 60 * 60 * 1000);

    // Items details setup
    const items: RFQItem[] = template.items.map((it, idx) => ({
      id: `${rfqIdStr}-ITEM-${idx + 1}`,
      itemName: it.itemName,
      description: it.description,
      quantity: it.quantity + (i * (idx + 1) * 2), // slightly vary quantities
      unit: it.unit,
      targetPrice: it.targetPrice
    }));

    // Calculate value based on items
    const rfqValue = items.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || 0)), 0);

    // Timeline events generation
    const timeline: RFQTimelineEvent[] = [
      {
        id: `${rfqIdStr}-EV-1`,
        eventType: 'SUBMITTED',
        title: 'RFQ Submitted',
        description: `RFQ successfully submitted by ${template.contact} from ${template.company}.`,
        timestamp: new Date(createdDate.getTime()).toISOString(),
        user: template.contact,
        userRole: 'Buyer'
      }
    ];

    if (status !== RFQStatus.DRAFT && status !== RFQStatus.SUBMITTED) {
      timeline.push({
        id: `${rfqIdStr}-EV-2`,
        eventType: 'ASSIGNED',
        title: 'Assigned to Sales Representative',
        description: `RFQ assigned to ${owner} for verification.`,
        timestamp: new Date(createdDate.getTime() + 1.5 * 60 * 60 * 1000).toISOString(),
        user: 'System Auto-Router',
        userRole: 'System'
      });
    }

    if (status === RFQStatus.UNDER_REVIEW || status === RFQStatus.NEGOTIATION || status === RFQStatus.APPROVED || status === RFQStatus.CONVERTED) {
      timeline.push({
        id: `${rfqIdStr}-EV-3`,
        eventType: 'NOTE_ADDED',
        title: 'Internal Specification Verified',
        description: 'Verified structural grades and delivery lead times. Stock availability confirmed at nearby Hubli warehouse.',
        timestamp: new Date(createdDate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        user: owner,
        userRole: 'Sales Representative'
      });
    }

    if (status === RFQStatus.NEGOTIATION || status === RFQStatus.APPROVED || status === RFQStatus.CONVERTED) {
      timeline.push({
        id: `${rfqIdStr}-EV-4`,
        eventType: 'QUOTE_CREATED',
        title: 'Quotation Draft Version 1 Generated',
        description: `Draft Proposal sent to Buyer for approval. Offer value: ₹${(rfqValue * 0.98).toLocaleString('en-IN')}`,
        timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        user: owner,
        userRole: 'Sales Representative'
      });

      timeline.push({
        id: `${rfqIdStr}-EV-5`,
        eventType: 'REVISION_REQUESTED',
        title: 'Revision Requested by Customer',
        description: `Requested 3% additional volume discount on primary items and longer credit terms.`,
        timestamp: new Date(createdDate.getTime() + 36 * 60 * 60 * 1000).toISOString(),
        user: template.contact,
        userRole: 'Buyer'
      });

      timeline.push({
        id: `${rfqIdStr}-EV-6`,
        eventType: 'QUOTE_CREATED',
        title: 'Quotation Version 2 (Revised) Dispatched',
        description: `Revised Quotation V2 dispatched. Value adjusted to: ₹${(rfqValue * 0.96).toLocaleString('en-IN')}`,
        timestamp: new Date(createdDate.getTime() + 42 * 60 * 60 * 1000).toISOString(),
        user: owner,
        userRole: 'Sales Representative'
      });
    }

    if (status === RFQStatus.APPROVED || status === RFQStatus.CONVERTED) {
      timeline.push({
        id: `${rfqIdStr}-EV-7`,
        eventType: 'APPROVED',
        title: 'Quotation V2 Approved by Customer',
        description: 'Buyer accepted proposal terms and dispatched advance payment confirmation.',
        timestamp: new Date(updatedDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        user: template.contact,
        userRole: 'Buyer'
      });
    }

    if (status === RFQStatus.CONVERTED) {
      timeline.push({
        id: `${rfqIdStr}-EV-8`,
        eventType: 'CONVERTED',
        title: 'RFQ Converted to Confirmed Order',
        description: `Order successfully generated: ORD-2026-${String(100 + currentId).padStart(3, '0')}.`,
        timestamp: updatedDate.toISOString(),
        user: owner,
        userRole: 'Sales Representative'
      });
    }

    if (status === RFQStatus.REJECTED) {
      timeline.push({
        id: `${rfqIdStr}-EV-7`,
        eventType: 'REJECTED',
        title: 'Proposal Rejected by Buyer',
        description: 'Customer opted for local vendor quoting shorter delivery times.',
        timestamp: updatedDate.toISOString(),
        user: template.contact,
        userRole: 'Buyer'
      });
    }

    // Comments/Notes list
    const notes: RFQComment[] = [
      {
        id: `${rfqIdStr}-NOTE-1`,
        author: 'System',
        authorRole: 'System',
        text: 'RFQ ingestion validated. Standard structure matching GST records.',
        timestamp: new Date(createdDate.getTime() + 5 * 60 * 1000).toISOString(),
        isInternal: true
      }
    ];

    if (status !== RFQStatus.DRAFT && status !== RFQStatus.SUBMITTED) {
      notes.push({
        id: `${rfqIdStr}-NOTE-2`,
        author: owner,
        authorRole: 'Sales Representative',
        text: `Spoke to ${template.contact}. They need this delivered strictly by ${dueDate.toLocaleDateString('en-IN')}. Verify lead time for item 1.`,
        timestamp: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        isInternal: true
      });
    }

    if (status === RFQStatus.NEGOTIATION || status === RFQStatus.APPROVED || status === RFQStatus.CONVERTED) {
      notes.push({
        id: `${rfqIdStr}-NOTE-3`,
        author: template.contact,
        authorRole: 'Buyer',
        text: 'Please apply a bulk discount. We have another project in Hubli coming up next month.',
        timestamp: new Date(createdDate.getTime() + 35 * 60 * 60 * 1000).toISOString(),
        isInternal: false
      });
    }

    // Mock attachments
    const attachments: RFQAttachment[] = [
      {
        id: `${rfqIdStr}-ATT-1`,
        filename: `${template.company.replace(/\s+/g, '_')}_Procurement_Brief.pdf`,
        fileType: 'PDF',
        size: '1.4 MB',
        uploader: template.contact,
        uploadedAt: createdDate.toISOString(),
        version: 'v1.0'
      }
    ];

    if (i % 2 === 0) {
      attachments.push({
        id: `${rfqIdStr}-ATT-2`,
        filename: `${template.company.replace(/\s+/g, '_')}_Material_Specs.xlsx`,
        fileType: 'EXCEL',
        size: '2.8 MB',
        uploader: template.contact,
        uploadedAt: new Date(createdDate.getTime() + 10 * 60 * 1000).toISOString(),
        version: 'v1.0'
      });
    }

    if (i % 3 === 0 && template.industry === 'Infrastructure & Highways') {
      attachments.push({
        id: `${rfqIdStr}-ATT-3`,
        filename: `${template.company.replace(/\s+/g, '_')}_CAD_Drawing.dwg`,
        fileType: 'CAD',
        size: '14.5 MB',
        uploader: template.contact,
        uploadedAt: new Date(createdDate.getTime() + 25 * 60 * 1000).toISOString(),
        version: 'v1.1'
      });
    }

    // Quotations versions
    const quotations: RFQQuotation[] = [];
    if (status === RFQStatus.NEGOTIATION || status === RFQStatus.APPROVED || status === RFQStatus.CONVERTED) {
      quotations.push({
        id: `QUO-${rfqIdStr}-001`,
        version: 'v1.0',
        value: rfqValue * 0.98,
        status: 'REJECTED',
        createdAt: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(createdDate.getTime() + 54 * 60 * 60 * 1000).toISOString(),
        pdfUrl: `/exports/quotes/quo-${rfqIdStr}-001.pdf`,
        isPersisted: false
      });

      quotations.push({
        id: `QUO-${rfqIdStr}-002`,
        version: 'v2.0',
        value: rfqValue * 0.96,
        status: status === RFQStatus.NEGOTIATION ? 'SENT' : 'ACCEPTED',
        createdAt: new Date(createdDate.getTime() + 42 * 60 * 60 * 1000).toISOString(),
        validUntil: new Date(createdDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
        pdfUrl: `/exports/quotes/quo-${rfqIdStr}-002.pdf`,
        isPersisted: false
      });
    }

    const rfq: RFQDetail = {
      id: rfqIdStr,
      rfqNumber: rfqIdStr,
      companyName: template.company,
      contactName: template.contact,
      status,
      priority,
      owner,
      value: rfqValue,
      lastUpdated: updatedDate.toISOString(),
      dueDate: dueDate.toISOString(),
      projectType: template.projectType,
      description: template.description,
      customer: {
        id: `CUST-${String(100 + currentId).padStart(3, '0')}`,
        name: template.contact,
        companyName: template.company,
        email: template.email,
        phone: template.phone,
        gstNumber: template.gst,
        location,
        industry: template.industry
      },
      items,
      timeline,
      notes,
      attachments,
      quotations
    };

    mockRFQs.push(rfq);
    currentId++;
  }
}

// Service Interface implementations
export const rfqMockService = {
  getRFQList(filters?: {
    search?: string;
    status?: string;
    priority?: string;
    owner?: string;
    location?: string;
    industry?: string;
    minVal?: number;
    maxVal?: number;
  }): RFQSummary[] {
    initializeMockData();

    let list = mockRFQs;

    if (filters) {
      const { search, status, priority, owner, location, industry, minVal, maxVal } = filters;

      if (search) {
        const query = search.toLowerCase();
        list = list.filter(r => 
          r.rfqNumber.toLowerCase().includes(query) ||
          r.companyName.toLowerCase().includes(query) ||
          r.contactName.toLowerCase().includes(query) ||
          (r.projectType && r.projectType.toLowerCase().includes(query))
        );
      }

      if (status && status !== 'all') {
        const statusList = status.split(',');
        list = list.filter(r => statusList.includes(r.status));
      }

      if (priority && priority !== 'all') {
        const priorityList = priority.split(',');
        list = list.filter(r => priorityList.includes(r.priority));
      }

      if (owner && owner !== 'all') {
        list = list.filter(r => r.owner === owner);
      }

      if (location && location !== 'all') {
        list = list.filter(r => r.customer.location === location);
      }

      if (industry && industry !== 'all') {
        list = list.filter(r => r.customer.industry === industry);
      }

      if (minVal !== undefined) {
        list = list.filter(r => r.value >= minVal);
      }

      if (maxVal !== undefined) {
        list = list.filter(r => r.value <= maxVal);
      }
    }

    // Map detail records to standard summaries
    return list.map(r => ({
      id: r.id,
      rfqNumber: r.rfqNumber,
      companyName: r.companyName,
      contactName: r.contactName,
      status: r.status,
      priority: r.priority,
      owner: r.owner,
      value: r.value,
      lastUpdated: r.lastUpdated,
      dueDate: r.dueDate
    }));
  },

  getRFQDetail(id: string): RFQDetail | undefined {
    initializeMockData();
    return mockRFQs.find(r => r.id === id);
  },

  addNote(rfqId: string, author: string, authorRole: string, text: string, isInternal: boolean): RFQDetail {
    initializeMockData();
    const rfqIndex = mockRFQs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');

    const newNote: RFQComment = {
      id: `${rfqId}-NOTE-${Date.now()}`,
      author,
      authorRole,
      text,
      timestamp: new Date().toISOString(),
      isInternal
    };

    const rfq = mockRFQs[rfqIndex];
    rfq.notes = [newNote, ...rfq.notes];
    rfq.lastUpdated = new Date().toISOString();

    // Log timeline event
    const newEvent: RFQTimelineEvent = {
      id: `${rfqId}-EV-${Date.now()}`,
      eventType: 'NOTE_ADDED',
      title: isInternal ? 'Internal Note Appended' : 'Customer Comment Logged',
      description: text.length > 60 ? text.substring(0, 60) + '...' : text,
      timestamp: new Date().toISOString(),
      user: author,
      userRole: authorRole
    };
    rfq.timeline = [newEvent, ...rfq.timeline];

    mockRFQs[rfqIndex] = { ...rfq };
    return mockRFQs[rfqIndex];
  },

  addAttachment(rfqId: string, attachment: { filename: string; fileType: string; size: string; uploader: string }): RFQDetail {
    initializeMockData();
    const rfqIndex = mockRFQs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');

    const rfq = mockRFQs[rfqIndex];
    const newAttachment: RFQAttachment = {
      id: `${rfqId}-ATT-${Date.now()}`,
      filename: attachment.filename,
      fileType: attachment.fileType,
      size: attachment.size,
      uploader: attachment.uploader,
      uploadedAt: new Date().toISOString(),
      version: 'v1.0'
    };

    rfq.attachments = [...rfq.attachments, newAttachment];
    rfq.lastUpdated = new Date().toISOString();

    const newEvent: RFQTimelineEvent = {
      id: `${rfqId}-EV-${Date.now()}`,
      eventType: 'NOTE_ADDED', // or ATTACHMENT_UPLOADED
      title: 'Attachment Uploaded',
      description: `File ${attachment.filename} uploaded by ${attachment.uploader}.`,
      timestamp: new Date().toISOString(),
      user: attachment.uploader,
      userRole: 'Sales Representative'
    };
    rfq.timeline = [newEvent, ...rfq.timeline];

    mockRFQs[rfqIndex] = { ...rfq };
    return mockRFQs[rfqIndex];
  },

  changeStatus(rfqId: string, status: string, user: string, userRole: string): RFQDetail {
    initializeMockData();
    const rfqIndex = mockRFQs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');

    const rfq = mockRFQs[rfqIndex];
    const oldStatus = rfq.status;
    rfq.status = status;
    rfq.lastUpdated = new Date().toISOString();

    const newEvent: RFQTimelineEvent = {
      id: `${rfqId}-EV-${Date.now()}`,
      eventType: status.toUpperCase().replace(/\s+/g, '_'),
      title: `Status Changed to ${status}`,
      description: `Status transitioned from ${oldStatus} to ${status}.`,
      timestamp: new Date().toISOString(),
      user,
      userRole
    };
    rfq.timeline = [newEvent, ...rfq.timeline];

    mockRFQs[rfqIndex] = { ...rfq };
    return mockRFQs[rfqIndex];
  },

  assignOwner(rfqId: string, owner: string, user: string, userRole: string): RFQDetail {
    initializeMockData();
    const rfqIndex = mockRFQs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');

    const rfq = mockRFQs[rfqIndex];
    const oldOwner = rfq.owner;
    rfq.owner = owner;
    rfq.lastUpdated = new Date().toISOString();

    const newEvent: RFQTimelineEvent = {
      id: `${rfqId}-EV-${Date.now()}`,
      eventType: 'ASSIGNED',
      title: `Assigned to ${owner}`,
      description: `Owner re-assigned from ${oldOwner} to ${owner}.`,
      timestamp: new Date().toISOString(),
      user,
      userRole
    };
    rfq.timeline = [newEvent, ...rfq.timeline];

    mockRFQs[rfqIndex] = { ...rfq };
    return mockRFQs[rfqIndex];
  },

  createQuotation(rfqId: string, quoteDetails: { value: number; validityDays: number }, user: string, userRole: string): RFQDetail {
    initializeMockData();
    const rfqIndex = mockRFQs.findIndex(r => r.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');

    const rfq = mockRFQs[rfqIndex];
    const vNumber = rfq.quotations.length + 1;
    const today = new Date();
    const expiryDate = new Date(today.getTime() + quoteDetails.validityDays * 24 * 60 * 60 * 1000);

    const newQuote: RFQQuotation = {
      id: `QUO-${rfqId}-${String(vNumber).padStart(3, '0')}`,
      version: `v${vNumber}.0`,
      value: quoteDetails.value,
      status: 'SENT',
      createdAt: today.toISOString(),
      validUntil: expiryDate.toISOString(),
      pdfUrl: `/exports/quotes/quo-${rfqId}-${String(vNumber).padStart(3, '0')}.pdf`
    };

    rfq.quotations = [...rfq.quotations, newQuote];
    rfq.status = RFQStatus.NEGOTIATION; // Automatically move status
    rfq.lastUpdated = today.toISOString();

    const newEvent: RFQTimelineEvent = {
      id: `${rfqId}-EV-${Date.now()}`,
      eventType: 'QUOTE_CREATED',
      title: `Quotation Version v${vNumber}.0 Generated`,
      description: `Offer value: ₹${quoteDetails.value.toLocaleString('en-IN')}, Valid until: ${expiryDate.toLocaleDateString('en-IN')}.`,
      timestamp: today.toISOString(),
      user,
      userRole
    };
    rfq.timeline = [newEvent, ...rfq.timeline];

    mockRFQs[rfqIndex] = { ...rfq };
    return mockRFQs[rfqIndex];
  },

  createRFQ(rfqData: {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    location: string;
    projectType: string;
    details: string;
    priority: string;
    dueDate: string;
    items: Array<{ itemName: string; quantity: number; description: string; unit: string; targetPrice: number }>;
  }): RFQDetail {
    initializeMockData();
    const rfqId = `RFQ-2026-${String(Date.now()).substring(7)}`;
    const timestamp = new Date().toISOString();
    
    let rfqValue = 0;
    const items = rfqData.items.map((it, idx) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.targetPrice) || 0;
      rfqValue += qty * price;
      return {
        id: `${rfqId}-ITEM-${idx + 1}`,
        itemName: it.itemName,
        description: it.description || '',
        quantity: qty,
        unit: it.unit || 'Piece',
        targetPrice: price
      };
    });

    const newRfq: RFQDetail = {
      id: rfqId,
      rfqNumber: rfqId,
      companyName: rfqData.companyName || rfqData.contactName,
      contactName: rfqData.contactName,
      status: 'Submitted',
      priority: rfqData.priority || 'Normal',
      owner: 'Unassigned',
      value: rfqValue,
      lastUpdated: timestamp,
      dueDate: rfqData.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      projectType: rfqData.projectType || 'Material Purchase',
      description: rfqData.details || '',
      customer: {
        id: `CUST-${Date.now()}`,
        name: rfqData.contactName,
        companyName: rfqData.companyName || 'Generic Corp',
        email: rfqData.email || '',
        phone: rfqData.phone,
        gstNumber: '',
        location: rfqData.location || '',
        industry: 'Commercial Construction'
      },
      items,
      timeline: [
        {
          id: `${rfqId}-EV-1`,
          eventType: 'SUBMITTED',
          title: 'RFQ Created via Admin Portal',
          description: `RFQ successfully created in mock database.`,
          timestamp,
          user: 'Admin Portal',
          userRole: 'Admin'
        }
      ],
      notes: [],
      attachments: [],
      quotations: []
    };

    mockRFQs.push(newRfq);
    return newRfq;
  }
};
