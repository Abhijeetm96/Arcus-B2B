/**
 * @file SearchService.ts
 * @description Implements procurement relevance-based product searches, click logging, and search telemetry reporting.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { Product } from '../catalog/Product';
import { getAllProducts, mapRowToProduct } from '../catalog/ProductService';

interface ServiceItem {
  name: string;
  slug: string;
  price: string;
  desc: string;
  categoryName: string;
  categorySlug: string;
  typeName: string;
  typeSlug: string;
}

const servicesList: ServiceItem[] = [
  { name: 'Geyser Installation', slug: 'geyser-installation', price: '₹499', desc: 'Worry-free geyser installation by certified plumbers.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Water Tank Services', typeSlug: 'water-tank-services' },
  { name: 'Solar Installation', slug: 'solar-installation', price: '₹95,000', desc: 'On-grid rooftop solar setup with net-metering support.', categoryName: 'Maintenance & Specialized', categorySlug: 'maintenance-specialized', typeName: 'Specialized Works', typeSlug: 'specialized-works' },
  { name: 'Electrical Wiring', slug: 'electrical-wiring', price: '₹2,499', desc: 'CONCEALED wiring and wire pulling for residential setups.', categoryName: 'Electrical Services', categorySlug: 'electrical-services', typeName: 'Wiring Services', typeSlug: 'wiring-services' },
  { name: 'New Wiring', slug: 'new-wiring', price: '₹1,499', desc: 'Conduiting and wire pulling for under-construction houses and complexes.', categoryName: 'Electrical Services', categorySlug: 'electrical-services', typeName: 'Wiring Services', typeSlug: 'wiring-services' },
  { name: 'Rewiring', slug: 'rewiring', price: '₹2,499', desc: 'Replacing old degraded aluminum or copper wires with high-grade FR wires.', categoryName: 'Electrical Services', categorySlug: 'electrical-services', typeName: 'Wiring Services', typeSlug: 'wiring-services' },
  { name: 'Concealed Wiring', slug: 'concealed-wiring', price: '₹3,499', desc: 'Wall cutting and pipe laying for concealed residential electrical setups.', categoryName: 'Electrical Services', categorySlug: 'electrical-services', typeName: 'Wiring Services', typeSlug: 'wiring-services' },
  { name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', price: '₹699', desc: 'High-pressure chemical-free water tank cleaning and sanitization.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Water Tank Services', typeSlug: 'water-tank-services' },
  { name: 'Interior Painting', slug: 'interior-painting', price: '₹12,999', desc: 'Bespoke interior accent wall textures & coatings.', categoryName: 'Painting & Finishing', categorySlug: 'painting-finishing', typeName: 'Interior Painting', typeSlug: 'interior-painting' },
  { name: 'Washing Machine Setup', slug: 'washing-machine-setup', price: '₹349', desc: 'Inlet/outlet hose connections & level balancing.', categoryName: 'Maintenance & Specialized', categorySlug: 'maintenance-specialized', typeName: 'Building Maintenance', typeSlug: 'building-maintenance' },
  { name: 'Bathroom Renovation', slug: 'bathroom-renovation', price: '₹45,000', desc: 'Complete tile fitments and sanitary line updates.', categoryName: 'Civil & Construction', categorySlug: 'civil-construction', typeName: 'Renovation Projects', typeSlug: 'renovation-projects' },
  { name: 'Modular Kitchen', slug: 'modular-kitchen', price: '₹1,20,000', desc: 'Modern modular cabinetry with soft-close hinges.', categoryName: 'Carpentry Services', categorySlug: 'carpentry-services', typeName: 'Modular Solutions', typeSlug: 'modular-solutions' },
  { name: 'House Construction', slug: 'house-construction', price: '₹18,00,000', desc: 'Turnkey independent house building from layout to handover.', categoryName: 'Civil & Construction', categorySlug: 'civil-construction', typeName: 'Residential Construction', typeSlug: 'residential-construction' },
  { name: 'Waterproofing', slug: 'waterproofing', price: '₹5,000', desc: 'Multi-layer terrace elastomeric waterproofing.', categoryName: 'Maintenance & Specialized', categorySlug: 'maintenance-specialized', typeName: 'Waterproofing', typeSlug: 'waterproofing' },
  { name: 'PVC Pipe Installation', slug: 'pvc-pipe-installation', price: '₹299', desc: 'Standard PVC piping for cold water systems and drainage lines.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pipe Installation', typeSlug: 'pipe-installation' },
  { name: 'CPVC Pipe Installation', slug: 'cpvc-pipe-installation', price: '₹349', desc: 'High-temperature CPVC pipe installation for hot & cold water supply.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pipe Installation', typeSlug: 'pipe-installation' },
  { name: 'UPVC Pipe Installation', slug: 'upvc-pipe-installation', price: '₹319', desc: 'Lead-free UPVC piping for potable water distribution systems.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pipe Installation', typeSlug: 'pipe-installation' },
  { name: 'HDPE Pipe Installation', slug: 'hdpe-pipe-installation', price: '₹499', desc: 'Heavy-duty HDPE piping for high-pressure municipal and industrial mains.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pipe Installation', typeSlug: 'pipe-installation' },
  { name: 'Water Tank Installation', slug: 'water-tank-installation', price: '₹1,499', desc: 'Installation of overhead, loft, and underground water storage tanks.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Water Tank Services', typeSlug: 'water-tank-services' },
  { name: 'Water Tank Repair', slug: 'water-tank-repair', price: '₹499', desc: 'Leakage patching, lid replacement, and structural repairs for water tanks.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Water Tank Services', typeSlug: 'water-tank-services' },
  { name: 'Pump Installation', slug: 'pump-installation', price: '₹999', desc: 'Installation of booster pumps, monoblock pumps, and borewell submersibles.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pump Services', typeSlug: 'pump-services' },
  { name: 'Pump Repair', slug: 'pump-repair', price: '₹599', desc: 'Motor rewinding, impeller replacement, and mechanical seal repairs.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pump Services', typeSlug: 'pump-services' },
  { name: 'Pump Maintenance', slug: 'pump-maintenance', price: '₹399', desc: 'Scheduled greasing, electrical checkups, and efficiency optimization audits.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Pump Services', typeSlug: 'pump-services' },
  { name: 'Faucet Installation', slug: 'faucet-installation', price: '₹199', desc: 'Installing wall mixers, pillar cocks, and sensor taps.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Bathroom Fittings', typeSlug: 'bathroom-fittings' },
  { name: 'Shower Installation', slug: 'shower-installation', price: '₹299', desc: 'Setting up overhead showers, hand showers, and multi-flow thermostatic panels.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Bathroom Fittings', typeSlug: 'bathroom-fittings' },
  { name: 'Sanitary Fittings Installation', slug: 'sanitary-fittings-installation', price: '₹999', desc: 'Installing wall-hung commodes, washbasins, and vanity setups.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Bathroom Fittings', typeSlug: 'bathroom-fittings' },
  { name: 'Drain Cleaning', slug: 'drain-cleaning', price: '₹399', desc: 'Unclogging kitchen drains, sewer lines, and gully traps using mechanical snakes.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Drainage Solutions', typeSlug: 'drainage-solutions' },
  { name: 'Drain Installation', slug: 'drain-installation', price: '₹499', desc: 'Laying down floor traps, chamber systems, and sewage connection lines.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Drainage Solutions', typeSlug: 'drainage-solutions' },
  { name: 'Sewage Line Services', slug: 'sewage-line-services', price: '₹1,999', desc: 'Heavy-duty commercial sewer pipe replacement and septic tank connections.', categoryName: 'Plumbing Services', categorySlug: 'plumbing-services', typeName: 'Drainage Solutions', typeSlug: 'drainage-solutions' }
];

const mockProfessionals = [
  {
    id: 'rajesh-varma',
    name: 'Rajesh Varma',
    company: 'Supreme Electricals Ltd.',
    specializations: ['Electrical', 'Maintenance'],
    skills: ['Electrician', 'Wiring', 'Solar', 'Maintenance', 'Generator'],
    startingPrice: '₹499',
    responseTime: 'Within 1 Hour',
    city: 'Bangalore'
  },
  {
    id: 'ananya-shrivastava',
    name: 'Ananya Shrivastava',
    company: 'Elite Studio Works',
    specializations: ['Interior Design', 'Renovation', 'Painting'],
    skills: ['Designer', 'Painting', 'Interior', 'Decor', 'Carpentry'],
    startingPrice: '₹1,499',
    responseTime: 'Within 2 Hours',
    city: 'Mumbai'
  },
  {
    id: 'karan-mehra',
    name: 'Karan Mehra',
    company: 'Rapid Flow Plumbing',
    specializations: ['Plumbing', 'Maintenance'],
    skills: ['Plumber', 'Pipe', 'Leak', 'Geyser', 'Tank cleaning'],
    startingPrice: '₹399',
    responseTime: 'Within 1 Hour',
    city: 'Delhi NCR'
  }
];

const serviceCategoriesList = [
  { id: 'plumbing-services', name: 'Plumbing Services', path: '#/services/plumbing-services' },
  { id: 'electrical-services', name: 'Electrical Services', path: '#/services/electrical-services' },
  { id: 'carpentry-services', name: 'Carpentry Services', path: '#/services/carpentry-services' },
  { id: 'painting-finishing', name: 'Painting & Finishing', path: '#/services/painting-finishing' },
  { id: 'civil-construction', name: 'Civil & Construction', path: '#/services/civil-construction' },
  { id: 'architecture-design', name: 'Architecture & Design', path: '#/services/architecture-design' },
  { id: 'equipment-rental', name: 'Equipment Rental', path: '#/services/equipment-rental' },
  { id: 'maintenance-specialized', name: 'Maintenance & Specialized', path: '#/services/maintenance-specialized' }
];

const productCategoriesList = [
  { id: 'plumbing', name: 'Plumbing', path: '#/materials/plumbing' },
  { id: 'electrical', name: 'Electrical', path: '#/materials/electrical' },
  { id: 'cement-concrete', name: 'Cement & Concrete', path: '#/materials/cement-concrete' },
  { id: 'steel-structural', name: 'Steel & Structural', path: '#/materials/steel-structural' },
  { id: 'paints-chemicals', name: 'Paints & Chemicals', path: '#/materials/paints-chemicals' },
  { id: 'tiles-flooring', name: 'Tiles & Flooring', path: '#/materials/tiles-flooring' },
  { id: 'hardware-tools', name: 'Hardware & Tools', path: '#/materials/hardware-tools' },
  { id: 'building-materials', name: 'Building Materials', path: '#/materials/building-materials' }
];

export const searchService = {
  /**
   * Executes a string match search across product names, brands, descriptions, slugs, and specifications.
   * Logs query analytics (zero-result query flags and total matches) in the background.
   * 
   * @param {string} query - The search query term.
   * @param {string} [location] - The location city of the user.
   * @param {string} [state] - The location state of the user.
   * @param {boolean} [logQuery=true] - Whether to write telemetry logs to the database.
   * @returns {Promise<{ products: Product[]; brands: string[]; categories: string[]; services: any[]; professionals: any[] }>} Grouped matching properties.
   */
  async search(query: string, location?: string, state?: string, logQuery: boolean = true): Promise<{
    products: Product[];
    brands: { brand: string; productCount: number }[];
    categories: { id: string; name: string; path: string }[];
    services: any[];
    professionals: any[];
  }> {
    const queryLower = (query || '').toLowerCase().trim();
    
    // Helper match function for in-memory / JSON fallback
    const matchProductInMemory = (p: Product, qLower: string): boolean => {
      if (!p) return false;
      const name = p.name ?? '';
      const description = p.description ?? '';
      const brand = p.brand ?? '';
      const model = p.model ?? '';
      const categoryId = p.categoryId ?? '';
      const categoryTitle = p.categoryTitle ?? '';
      const subcategorySlug = p.subcategorySlug ?? '';
      const leafSlug = p.leafSlug ?? '';
      return (
        name.toLowerCase().includes(qLower) ||
        description.toLowerCase().includes(qLower) ||
        brand.toLowerCase().includes(qLower) ||
        model.toLowerCase().includes(qLower) ||
        categoryId.toLowerCase().includes(qLower) ||
        categoryTitle.toLowerCase().includes(qLower) ||
        subcategorySlug.toLowerCase().includes(qLower) ||
        leafSlug.toLowerCase().includes(qLower)
      );
    };

    // 1. Search Products
    let results: Product[] = [];
    if (usePostgres && pgPool) {
      try {
        const queryStr = `
          SELECT DISTINCT ON (p.id) p.id, p.category_title, p.name, p.unit, p.rating, p.icon, p.link, p.description,
                 p.specifications, p.recommended_accessories, p.subcategory_slug, p.leaf_slug, p.status, p.category_id,
                 v.sku, v.name AS variant_name, v.price AS variant_price, v.unit_of_measure, v.minimum_order_quantity, v.order_multiple, v.status AS variant_status,
                 v.procurement_price,
                 inv.available_stock AS variant_stock, inv.reserved_stock AS inventory_reserved, inv.reorder_level AS inventory_reorder_level,
                 (
                     SELECT COALESCE(json_agg(json_build_object(
                         'min', pt.min_quantity,
                         'max', pt.max_quantity,
                         'price', pt.price,
                         'save', pt.discount_percentage
                     ) ORDER BY pt.min_quantity), '[]'::json)
                     FROM (
                         SELECT DISTINCT min_quantity, max_quantity, price, discount_percentage, variant_id
                         FROM product_price_tiers
                     ) pt
                     WHERE pt.variant_id = v.id
                 ) AS variant_price_tiers,
                 (
                     SELECT COALESCE(json_agg(img.image_url ORDER BY img.display_order), '[]'::json)
                     FROM product_images img
                     WHERE img.product_id = p.id
                 ) AS variant_images,
                 (
                     SELECT COALESCE(json_agg(json_build_object(
                         'id', r.id,
                         'reviewerName', r.reviewer_name,
                         'reviewerRole', r.reviewer_role,
                         'rating', r.rating,
                         'comment', r.comment,
                         'isVerifiedPurchase', r.is_verified_purchase,
                         'status', r.status,
                         'createdAt', r.created_at
                     ) ORDER BY r.created_at DESC), '[]'::json)
                     FROM product_reviews r
                     WHERE r.product_id = p.id
                 ) AS variant_reviews
          FROM products p
          LEFT JOIN product_variants v ON p.id = v.product_id
          LEFT JOIN inventory inv ON v.id = inv.variant_id
          WHERE (
            p.name ILIKE $1 OR
            p.description ILIKE $1 OR
            p.category_id ILIKE $1 OR
            p.category_title ILIKE $1 OR
            p.subcategory_slug ILIKE $1 OR
            p.leaf_slug ILIKE $1 OR
            p.specifications::text ILIKE $1
          )
          ORDER BY p.id
        `;
        const res = await pgPool.query(queryStr, [`%${query}%`]);
        results = res.rows.map(row => mapRowToProduct(row, 'SearchService'));
      } catch (err) {
        console.error('Error searching products from database, falling back to in-memory:', err);
        const allProducts = await getAllProducts();
        results = (allProducts || []).filter(p => matchProductInMemory(p, queryLower));
      }
    } else {
      const allProducts = await getAllProducts();
      results = (allProducts || []).filter(p => matchProductInMemory(p, queryLower));
    }

    // 2. Search Services
    const matchedServices = servicesList.filter(s => {
      const name = s.name.toLowerCase();
      const desc = s.desc.toLowerCase();
      const catName = s.categoryName.toLowerCase();
      const typeName = s.typeName.toLowerCase();
      return (
        name.includes(queryLower) ||
        desc.includes(queryLower) ||
        catName.includes(queryLower) ||
        typeName.includes(queryLower)
      );
    }).map(s => ({
      name: s.name,
      slug: s.slug,
      price: s.price,
      desc: s.desc,
      categorySlug: s.categorySlug,
      typeSlug: s.typeSlug,
      path: `#/services/${s.categorySlug}/${s.typeSlug}/${s.slug}`
    }));

    // 3. Search Professionals (joining Postgres DB and Mock List)
    const matchingPros: any[] = [];

    if (usePostgres && pgPool) {
      try {
        const queryStr = `
          SELECT p.user_id, p.service_category, p.skills, p.city, p.average_rating,
                 u.name, u.email, u.company_name
          FROM professional_profiles p
          JOIN users u ON p.user_id = u.id
        `;
        const dbRes = await pgPool.query(queryStr);
        dbRes.rows.forEach((row: any) => {
          const skillsArr = Array.isArray(row.skills) ? row.skills : [];
          const name = row.name ?? '';
          const company = row.company_name ?? '';
          const category = row.service_category ?? '';
          const city = row.city ?? '';
          const skillsStr = skillsArr.join(' ');
          
          const match = 
            name.toLowerCase().includes(queryLower) ||
            company.toLowerCase().includes(queryLower) ||
            category.toLowerCase().includes(queryLower) ||
            city.toLowerCase().includes(queryLower) ||
            skillsStr.toLowerCase().includes(queryLower);

          if (match) {
            matchingPros.push({
              id: row.user_id,
              name: name,
              company: company || 'Independent',
              specializations: [category],
              skills: skillsArr,
              startingPrice: '₹499',
              responseTime: 'Within 2 Hours',
              city: city
            });
          }
        });
      } catch (err) {
        console.error('Error fetching professional profiles from pg:', err);
      }
    }

    mockProfessionals.forEach(p => {
      if (matchingPros.some(mp => mp.id === p.id)) return;

      const name = p.name.toLowerCase();
      const company = p.company.toLowerCase();
      const specs = p.specializations.map(s => s.toLowerCase());
      const skills = p.skills.map(s => s.toLowerCase());
      const city = p.city.toLowerCase();

      // Mappings to handle electrician, plumber, contractor terms
      let matches = 
        name.includes(queryLower) ||
        company.includes(queryLower) ||
        city.includes(queryLower) ||
        specs.some(s => s.includes(queryLower)) ||
        skills.some(s => s.includes(queryLower));

      if (queryLower === 'contractor') {
        matches = true;
      }
      if (queryLower.includes('geyser') && p.id === 'karan-mehra') {
        matches = true;
      }
      if (queryLower.includes('solar') && p.id === 'rajesh-varma') {
        matches = true;
      }
      if (queryLower.includes('plumbing') && p.id === 'karan-mehra') {
        matches = true;
      }
      if (queryLower.includes('electrician') && p.id === 'rajesh-varma') {
        matches = true;
      }
      if (queryLower.includes('painting') && p.id === 'ananya-shrivastava') {
        matches = true;
      }

      if (matches) {
        matchingPros.push({
          id: p.id,
          name: p.name,
          company: p.company,
          specializations: p.specializations,
          startingPrice: p.startingPrice,
          responseTime: p.responseTime,
          city: p.city
        });
      }
    });

    // 4. Search Categories (combining products categories and services categories)
    const matchingProductCats = productCategoriesList.filter(pc => {
      return pc.name.toLowerCase().includes(queryLower) || pc.id.toLowerCase().includes(queryLower);
    });

    const matchingServiceCats = serviceCategoriesList.filter(sc => {
      return sc.name.toLowerCase().includes(queryLower) || sc.id.toLowerCase().includes(queryLower);
    });

    const categoriesMap = new Map<string, string>();
    // Add explicitly matched ones first
    matchingProductCats.forEach(c => categoriesMap.set(c.id, c.name));
    matchingServiceCats.forEach(c => categoriesMap.set(c.id, c.name));

    // Add categories inferred from product results
    results.forEach(p => {
      if (p?.categoryTitle) {
        const id = p.categoryTitle.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        if (!categoriesMap.has(id)) {
          categoriesMap.set(id, p.categoryTitle);
        }
      }
    });

    const categories = Array.from(categoriesMap.entries()).map(([id, name]) => {
      const isService = serviceCategoriesList.some(sc => sc.id === id);
      return {
        id,
        name,
        path: isService ? `#/services/${id}` : `#/materials/${id}`
      };
    });

    if (logQuery) {
      try {
        const resolvedCity = location || 'Unknown';
        const cityStateMap: Record<string, string> = {
          'bangalore': 'Karnataka',
          'mumbai': 'Maharashtra',
          'delhi ncr': 'Delhi',
          'chennai': 'Tamil Nadu',
          'hyderabad': 'Telangana',
          'kolkata': 'West Bengal',
          'pune': 'Maharashtra'
        };
        const resolvedState = state || cityStateMap[resolvedCity.toLowerCase()] || 'Unknown';
        const matchedCategoryNames = categories.map(c => c.name).join(', ') || 'None';
        const pageBrowsed = `#/search?q=${encodeURIComponent(query)}`;

        let isDuplicate = false;
        if (usePostgres && pgPool) {
          const dupCheck = await pgPool.query(
            "SELECT id FROM search_queries WHERE query = $1 AND timestamp > NOW() - INTERVAL '3 seconds' LIMIT 1",
            [query]
          );
          isDuplicate = dupCheck.rows.length > 0;
        } else {
          const db = await readJsonDb();
          const existing = db.searchAnalytics || [];
          const last = existing
            .filter((x: any) => (x.query || '').toLowerCase() === query.toLowerCase())
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          if (last && (new Date().getTime() - new Date(last.timestamp).getTime()) < 3000) {
            isDuplicate = true;
          }
        }

        if (!isDuplicate) {
          if (usePostgres && pgPool) {
            await pgPool.query(
              "INSERT INTO search_queries (query, results_count, location, state, categories, page_browsed) VALUES ($1, $2, $3, $4, $5, $6)",
              [query, results.length + matchedServices.length + matchingPros.length, resolvedCity, resolvedState, matchedCategoryNames, pageBrowsed]
            );
          } else {
            const db = await readJsonDb();
            db.searchAnalytics = db.searchAnalytics || [];
            db.searchAnalytics.push({
              query,
              resultsCount: results.length,
              location: resolvedCity,
              state: resolvedState,
              categories: matchedCategoryNames,
              pageBrowsed,
              timestamp: new Date().toISOString()
            });
            await writeJsonDb(db);
          }
        }
      } catch (err) {
        console.error('Error logging search query:', err);
      }
    }

    const brandsMap = new Map<string, number>();
    results.forEach(p => {
      if (!p) return;
      if (p.brand) {
        brandsMap.set(p.brand, (brandsMap.get(p.brand) || 0) + 1);
      }
    });

    const brands = Array.from(brandsMap.entries()).map(([brand, count]) => ({
      brand,
      productCount: count
    }));

    return {
      products: results,
      brands,
      categories,
      services: matchedServices,
      professionals: matchingPros
    };
  },

  /**
   * Records a product selection/click from search suggestions.
   * 
   * @param {string} productId - Selected product ID.
   * @param {string} query - The query term initiating the selection.
   * @returns {Promise<void>}
   */
  async trackClick(productId: string, query: string): Promise<void> {
    try {
      if (usePostgres && pgPool) {
        await pgPool.query(
          "INSERT INTO search_clicks (query, product_id) VALUES ($1, $2)",
          [query, productId]
        );
      } else {
        const db = await readJsonDb();
        db.searchClicks = db.searchClicks || [];
        db.searchClicks.push({ query, productId, timestamp: new Date().toISOString() });
        await writeJsonDb(db);
      }
    } catch (err) {
      console.error('Error logging click:', err);
    }
  },

  /**
   * Generates search analytics reports for the Admin dashboard.
   * 
   * @returns {Promise<{ totalSearches: number; uniqueQueriesCount: number; totalClicks: number; topQueries: any[]; zeroResults: any[]; locationMetrics: any[]; detailedLogs: any[] }>} Search insights collections.
   */
  async getAnalytics(): Promise<{
    totalSearches: number;
    uniqueQueriesCount: number;
    totalClicks: number;
    topQueries: { query: string; count: number; clickedCount?: number; locations?: string }[];
    zeroResults: { query: string; count: number }[];
    locationMetrics: { city: string; count: number }[];
    detailedLogs: { id: number | string; timestamp: string; query: string; resultsCount: number; city: string; state: string; categories: string; pageBrowsed: string }[];
  }> {
    if (usePostgres && pgPool) {
      const totalSearchesRes = await pgPool.query("SELECT COUNT(*)::integer as count FROM search_queries");
      const uniqueQueriesRes = await pgPool.query("SELECT COUNT(DISTINCT query)::integer as count FROM search_queries");
      const totalClicksRes = await pgPool.query("SELECT COUNT(*)::integer as count FROM search_clicks");

      const topRes = await pgPool.query(`
        SELECT q.query, COUNT(*)::integer as count,
               (SELECT COUNT(*)::integer FROM search_clicks c WHERE LOWER(c.query) = LOWER(q.query))::integer as "clickedCount",
               string_agg(DISTINCT COALESCE(q.location, 'Unknown'), ', ') as locations
        FROM search_queries q
        GROUP BY q.query
        ORDER BY count DESC
        LIMIT 10
      `);

      const zeroRes = await pgPool.query(`
        SELECT query, COUNT(*)::integer as count
        FROM search_queries
        WHERE results_count = 0
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `);

      const locRes = await pgPool.query(`
        SELECT COALESCE(location, 'Unknown') as city, COUNT(*)::integer as count
        FROM search_queries
        GROUP BY location
        ORDER BY count DESC
        LIMIT 10
      `);

      const detailedRes = await pgPool.query(`
        SELECT q.id, q.timestamp::text as timestamp, q.query, q.results_count as "resultsCount",
               COALESCE(q.location, 'Unknown') as city,
               COALESCE(q.state, 'Unknown') as state,
               COALESCE(q.categories, 'None') as categories,
               COALESCE(
                 (SELECT p.name FROM search_clicks c JOIN products p ON c.product_id = p.id WHERE LOWER(c.query) = LOWER(q.query) ORDER BY c.timestamp DESC LIMIT 1),
                 q.page_browsed,
                 'None'
               ) as "pageBrowsed"
        FROM search_queries q
        ORDER BY q.timestamp DESC
        LIMIT 50
      `);

      return {
        totalSearches: totalSearchesRes.rows[0]?.count || 0,
        uniqueQueriesCount: uniqueQueriesRes.rows[0]?.count || 0,
        totalClicks: totalClicksRes.rows[0]?.count || 0,
        topQueries: topRes.rows.map(row => ({
          query: row.query,
          count: row.count,
          clickedCount: row.clickedCount,
          locations: row.locations
        })),
        zeroResults: zeroRes.rows,
        locationMetrics: locRes.rows,
        detailedLogs: detailedRes.rows
      };
    } else {
      const db = await readJsonDb();
      const queries = Array.isArray(db?.searchAnalytics) ? db.searchAnalytics : [];
      const clicks = Array.isArray(db?.searchClicks) ? db.searchClicks : [];
      
      const totalSearches = queries.length;
      
      const uniqueQueriesSet = new Set(
        queries.map((q: any) => (q?.query ?? '').toLowerCase()).filter(Boolean)
      );
      const uniqueQueriesCount = uniqueQueriesSet.size;
      
      const totalClicks = clicks.length;

      const qCount: Record<string, number> = {};
      const zeroQCount: Record<string, number> = {};
      const locationsMap: Record<string, Set<string>> = {};
      const cityCount: Record<string, number> = {};
      
      queries.forEach((q: any) => {
        if (!q) return;
        const key = q.query ?? 'Unknown';
        qCount[key] = (qCount[key] || 0) + 1;
        
        if (q.resultsCount === 0) {
          zeroQCount[key] = (zeroQCount[key] || 0) + 1;
        }

        const normKey = key.toLowerCase();
        if (!locationsMap[normKey]) {
          locationsMap[normKey] = new Set();
        }
        locationsMap[normKey].add(q.location || 'Unknown');

        const loc = q.location || 'Unknown';
        cityCount[loc] = (cityCount[loc] || 0) + 1;
      });

      const topQueries = Object.entries(qCount).map(([query, count]) => {
        const clickedCount = clicks.filter((c: any) => (c?.query ?? '').toLowerCase() === query.toLowerCase()).length;
        const locations = Array.from(locationsMap[query.toLowerCase()] || []).join(', ');
        return { query, count, clickedCount, locations };
      }).sort((a, b) => b.count - a.count).slice(0, 10);

      const zeroResults = Object.entries(zeroQCount).map(([query, count]) => ({ query, count })).sort((a, b) => b.count - a.count).slice(0, 10);

      const locationMetrics = Object.entries(cityCount).map(([city, count]) => ({
        city,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10);

      const allProducts = await getAllProducts();
      const detailedLogs = queries.map((q: any, index: number) => {
        const click = clicks.find((c: any) => c.query.toLowerCase() === q.query.toLowerCase());
        let pageBrowsed = q.pageBrowsed || `#/search?q=${encodeURIComponent(q.query)}`;
        if (click) {
          const prod = allProducts.find((p: any) => p.id === click.productId);
          if (prod) {
            pageBrowsed = `Product: ${prod.name}`;
          }
        }
        return {
          id: q.id || index,
          timestamp: q.timestamp || new Date().toISOString(),
          query: q.query || 'Unknown',
          resultsCount: q.resultsCount || 0,
          city: q.location || 'Unknown',
          state: q.state || 'Unknown',
          categories: q.categories || 'None',
          pageBrowsed
        };
      }).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);

      return {
        totalSearches,
        uniqueQueriesCount,
        totalClicks,
        topQueries,
        zeroResults,
        locationMetrics,
        detailedLogs
      };
    }
  }
};
