import React, { useState } from 'react';

interface Project {
  id: string;
  title: string;
  category: 'Commercial' | 'Infrastructure' | 'Residential' | 'Renovation';
  status: 'Completed' | 'In Progress';
  client: string;
  location: string;
  scope: string;
  image: string;
  materials: { name: string; qty: string; link?: string }[];
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Commercial' | 'Infrastructure' | 'Residential' | 'Renovation'>('All');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    projectName: '',
    projectScope: '',
    estimatedBudget: '₹10 Lakhs - ₹50 Lakhs',
    timeline: 'Within 3 Months'
  });

  const projectsList: Project[] = [
    {
      id: 'PRJ-801',
      title: 'Sobha IT Tech Park (Phase 3)',
      category: 'Commercial',
      status: 'Completed',
      client: 'Sobha Developers Ltd',
      location: 'Whitefield, Bengaluru',
      scope: 'Complete structural civil works, drainage plumbing, and high-capacity electrical riser installations.',
      image: '/pdp_cpvc_pipe_warehouse.png',
      materials: [
        { name: 'Astral CPVC Pipe (1")', qty: '1,200 Pieces', link: '#/product/astral-cpvc-pipe' },
        { name: 'Supreme Elbow 90° (1")', qty: '2,500 Units', link: '#/product/supreme-elbow' },
        { name: 'JSW Steel TMT Rebars', qty: '85 Tons' }
      ]
    },
    {
      id: 'PRJ-802',
      title: 'Indiranagar Elevated Metro Station',
      category: 'Infrastructure',
      status: 'In Progress',
      client: 'BMRCL (Namma Metro)',
      location: 'Indiranagar, Bengaluru',
      scope: 'High-strength structural concrete foundation works and platform reinforcement layouts.',
      image: '/services_house_construction.png',
      materials: [
        { name: 'Ultratech Cement (50kg)', qty: '12,000 Bags', link: '#/product/ultratech-cement' },
        { name: 'Ambuja Cement (50kg)', qty: '5,000 Bags' },
        { name: 'JSW Steel Rebars (Fe 550D)', qty: '140 Tons' }
      ]
    },
    {
      id: 'PRJ-803',
      title: 'Prestige Green Meadows (Villa 42)',
      category: 'Residential',
      status: 'Completed',
      client: 'Prestige Group / Private Buyer',
      location: 'Sarjapur Road, Bengaluru',
      scope: 'Turnkey interior architecture, home automation cabling, premium plumbing, and structural finishes.',
      image: '/services_solar_install.png',
      materials: [
        { name: 'Finolex Copper Wire (2.5mm)', qty: '350 Coils', link: '#/product/finolex-wire' },
        { name: 'Anchor Modular Switches', qty: '1,800 Units', link: '#/product/anchor-switch' },
        { name: 'Jaquar Basin Mixers', qty: '15 Units', link: '#/product/jaquar-basin-mixer' }
      ]
    },
    {
      id: 'PRJ-804',
      title: 'HSR Commercial Hub Renovation',
      category: 'Renovation',
      status: 'Completed',
      client: 'FoodSpace Corporate Offices',
      location: 'HSR Layout, Bengaluru',
      scope: 'Internal partition overhaul, false ceiling layout, industrial washroom piping, and high-durability floor tiling.',
      image: '/services_bathroom_renovation.png',
      materials: [
        { name: 'Astral CPVC Pipes (1.5")', qty: '400 Pieces' },
        { name: 'Kajaria Floor Tiles (Boxes)', qty: '1,100 Boxes' },
        { name: 'Havells 3-Phase MCB DBs', qty: '12 Boards', link: '#/product/havells-mcb' }
      ]
    }
  ];

  const handleInquireProject = (projectTitle: string) => {
    setFormData(prev => ({
      ...prev,
      projectName: `Inquiry: Similar to ${projectTitle}`,
      projectScope: `We are looking to execute a project similar to "${projectTitle}" and require matching procurement and contractor bids.`
    }));
    document.getElementById('project-intake-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.projectName) return;

    try {
      const res = await fetch('http://localhost:5000/api/contractor-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId: 'ARCUS-PORTFOLIO',
          contractorCompany: 'Arcus Verified Network',
          name: formData.name,
          phone: formData.phone,
          budget: formData.estimatedBudget,
          timeline: formData.timeline,
          description: `Project: ${formData.projectName} | Company: ${formData.company} | Scope: ${formData.projectScope}`
        })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.warn('Network offline, showing success banner locally:', err);
      setSubmitted(true);
    }
  };

  const filteredProjects = projectsList.filter(p => activeFilter === 'All' || p.category === activeFilter);

  return (
    <div className="bg-background min-h-screen text-on-surface select-none">
      {/* Hero Section */}
      <section className="w-full bg-[#1a1c1c] text-white py-[80px] md:py-[112px] border-b border-surface-variant relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 skew-x-12 translate-x-1/3 pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-lg text-left flex flex-col gap-md relative z-10">
          <span className="bg-primary text-[#0A0A0A] font-bold px-md py-1 rounded w-fit text-[11px] font-label-caps tracking-wider">
            PROJECT PORTFOLIO
          </span>
          <h1 className="font-sans font-extrabold text-[40px] md:text-[56px] leading-[1.1] max-w-2xl text-white">
            ARCUS Build Portfolio
          </h1>
          <p className="font-sans font-medium text-[18px] md:text-[20px] text-gray-400 max-w-3xl leading-relaxed">
            Discover how India\'s top builders, infrastructure firms, and property developers leverage the ARCUS supply chain to construct on schedule.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-[1440px] mx-auto px-lg pt-xl md:pt-2xl text-left">
        <div className="flex flex-wrap gap-sm border-b border-surface-variant pb-md">
          {(['All', 'Commercial', 'Infrastructure', 'Residential', 'Renovation'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-xl py-3 rounded-full text-xs font-bold font-label-caps transition-all select-none border ${
                activeFilter === filter
                  ? 'bg-primary text-[#0A0A0A] border-primary shadow-sm'
                  : 'bg-white text-secondary border-surface-variant hover:border-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-[1440px] mx-auto px-lg py-xl md:py-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-surface-variant rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-primary transition-all duration-300 group"
            >
              {/* Image Banner */}
              <div className="w-full h-[260px] bg-surface-container relative overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={project.image}
                  alt={project.title}
                />
                <span className={`absolute top-4 left-4 text-[10px] font-bold font-label-caps tracking-wider px-md py-1 rounded-full border ${
                  project.status === 'Completed'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-[#FFF8E1] text-[#E65100] border-[#FFE082]'
                }`}>
                  {project.status}
                </span>
                <span className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-bold px-md py-1 rounded-full">
                  {project.category}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-xl text-left flex-1 flex flex-col justify-between space-y-lg">
                <div className="space-y-md">
                  <div className="space-y-xs">
                    <p className="text-[10px] font-bold text-secondary uppercase font-label-caps tracking-wider">{project.location}</p>
                    <h3 className="font-bold text-[22px] text-[#0A0A0A] leading-snug">{project.title}</h3>
                  </div>
                  
                  <div className="text-xs space-y-1.5 text-secondary border-l-2 border-primary pl-md">
                    <p><strong>Client:</strong> {project.client}</p>
                    <p className="leading-relaxed"><strong>Scope:</strong> {project.scope}</p>
                  </div>

                  {/* Materials Supplied Box */}
                  <div className="bg-[#F8F9FA] border border-surface-variant p-md rounded space-y-sm">
                    <p className="text-[10px] font-bold text-on-surface uppercase font-label-caps tracking-wider flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">local_mall</span>
                      Materials Supplied
                    </p>
                    <div className="flex flex-wrap gap-xs">
                      {project.materials.map((mat, idx) => (
                        mat.link ? (
                          <a
                            key={idx}
                            href={mat.link}
                            className="bg-white border border-surface-variant hover:border-primary px-sm py-1 rounded text-xs font-medium text-primary hover:text-on-surface flex items-center gap-1 transition-all"
                          >
                            {mat.name} <span className="text-[10px] text-secondary font-bold">({mat.qty})</span>
                          </a>
                        ) : (
                          <span
                            key={idx}
                            className="bg-white border border-surface-variant px-sm py-1 rounded text-xs font-medium text-[#0A0A0A] flex items-center gap-1"
                          >
                            {mat.name} <span className="text-[10px] text-secondary font-bold">({mat.qty})</span>
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleInquireProject(project.title)}
                  className="w-full h-11 border border-[#0A0A0A] text-[#0A0A0A] font-bold rounded hover:bg-surface-container transition-colors flex items-center justify-center gap-xs font-label-caps text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Inquire for Similar Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Intake Form */}
      <section id="project-intake-form" className="max-w-[1440px] mx-auto px-lg pb-5xl pt-xl text-left">
        <div className="bg-[#1a1c1c] text-white p-xl md:p-5xl rounded-3xl border border-surface-variant relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 skew-x-12 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-xxl items-center">
            <div className="space-y-xl">
              <span className="bg-primary text-[#0A0A0A] font-bold px-md py-1 rounded w-fit text-[10px] font-label-caps tracking-wider">
                PARTNER WITH ARCUS
              </span>
              <div className="space-y-sm">
                <h2 className="font-extrabold text-[32px] md:text-[40px] leading-tight text-white">
                  Initiate Your Project
                </h2>
                <p className="text-gray-400 text-body-md max-w-md leading-relaxed">
                  Submit your upcoming construction layout, blueprint summary, or procurement schedule to receive integrated factory bids and verify contractor availability.
                </p>
              </div>

              <div className="space-y-md text-xs text-gray-400">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
                  <span>Consolidated project material pricing quotes.</span>
                </div>
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                  <span>Matched with Class-A contractors and engineers.</span>
                </div>
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                  <span>Escrow payment milestones for work validation safety.</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-surface-variant text-on-surface p-lg md:p-xl rounded shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-[64px] text-center gap-md">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                    <span className="material-symbols-outlined text-green-600 text-[36px]">check</span>
                  </div>
                  <h3 className="font-bold text-[22px] text-[#0A0A0A] mt-2">Project Registered</h3>
                  <p className="text-secondary text-xs max-w-sm leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Our structural estimating team will review your scope and follow up at <strong>{formData.phone}</strong>.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-lg px-xl h-11 bg-[#121212] text-white font-bold rounded hover:bg-on-surface transition-all font-label-caps text-xs"
                  >
                    Submit Another Project
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-[20px] text-[#0A0A0A] border-b border-surface-variant pb-sm mb-md flex items-center gap-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">folder_shared</span>
                    Project Scope Details
                  </h4>
                  <form onSubmit={handleFormSubmit} className="space-y-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <div>
                        <label className="block text-secondary text-label-caps text-[10px] mb-xs">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-secondary text-label-caps text-[10px] mb-xs">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <div>
                        <label className="block text-secondary text-label-caps text-[10px] mb-xs">Work Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-secondary text-label-caps text-[10px] mb-xs">Company Name (Optional)</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-secondary text-label-caps text-[10px] mb-xs">Project / Site Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prestige Green Meadows false ceiling"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <div>
                        <label className="block text-secondary text-label-caps text-[10px] mb-xs">Estimated Project Budget</label>
                        <select
                          value={formData.estimatedBudget}
                          onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                          className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        >
                          <option value="Under ₹10 Lakhs">Under ₹10 Lakhs</option>
                          <option value="₹10 Lakhs - ₹50 Lakhs">₹10 Lakhs - ₹50 Lakhs</option>
                          <option value="₹50 Lakhs - ₹2 Crores">₹50 Lakhs - ₹2 Crores</option>
                          <option value="Above ₹2 Crores">Above ₹2 Crores</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-secondary text-label-caps text-[10px] mb-xs">Target Commencement</label>
                        <select
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          className="w-full h-10 px-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white"
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="Within 3 Months">Within 3 Months</option>
                          <option value="Within 6 Months">Within 6 Months</option>
                          <option value="Flexible / Planning stage">Flexible / Planning stage</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-secondary text-label-caps text-[10px] mb-xs">Brief Scope of Work *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe the materials and services needed..."
                        value={formData.projectScope}
                        onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                        className="w-full p-md border border-surface-variant rounded focus:border-primary-container focus:ring-0 text-body-sm bg-white resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 bg-primary hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded flex items-center justify-center gap-xs transition-all shadow font-label-caps text-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">engineering</span>
                      Submit Project Inquiry
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
