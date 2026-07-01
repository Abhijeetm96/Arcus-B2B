export const INDUSTRIES = [
  'Commercial Construction',
  'Residential Real Estate',
  'Infrastructure & Highways',
  'Industrial & Warehousing',
  'Healthcare Projects',
  'Government Infrastructure',
  'Institutional Buildings'
] as const;

export const LOCATIONS = [
  'Mumbai, MH',
  'Hubli, KA',
  'Bangalore, KA',
  'Pune, MH',
  'Chennai, TN',
  'Delhi NCR',
  'Hyderabad, TG',
  'Kolkata, WB'
] as const;

export const OWNERS = [
  'Vikram Sharma',
  'Priya Patel',
  'Amit Singh',
  'Rajesh Kumar',
  'Sneha Reddy',
  'Ananya Rao',
  'Sanjay Dutt',
  'Meera Nair',
  'Arjun Mehta',
  'Karan Johar'
] as const;

export const VALUE_RANGES = [
  { label: 'All Values', min: 0, max: Infinity },
  { label: 'Under ₹5 Lakhs', min: 0, max: 500000 },
  { label: '₹5 Lakhs - ₹20 Lakhs', min: 500000, max: 2000000 },
  { label: '₹20 Lakhs - ₹1 Crore', min: 2000000, max: 10000000 },
  { label: 'Over ₹1 Crore', min: 10000000, max: Infinity }
] as const;

export const SAVED_FILTERS = [
  { id: 'all', name: 'All Active RFQs', status: 'all', priority: 'all', owner: 'all' },
  { id: 'critical-high', name: 'Critical/High Priority', status: 'all', priority: 'High,Critical', owner: 'all' },
  { id: 'my-rfqs', name: 'Assigned to Me (Vikram)', status: 'all', priority: 'all', owner: 'Vikram Sharma' },
  { id: 'awaiting-review', name: 'Awaiting Internal Review', status: 'Submitted,Under Review', priority: 'all', owner: 'all' },
  { id: 'negotiation-value', name: 'High Value Negotiations', status: 'Negotiation', priority: 'all', owner: 'all', minVal: 2000000 }
] as const;
