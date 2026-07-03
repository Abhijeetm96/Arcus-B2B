import { pgPool, usePostgres, readJsonDb, writeJsonDb } from './db';

// Enums matching type declarations
const STATUSES = ['DRAFT', 'SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW', 'NEGOTIATION', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const LOCATIONS = ['Mumbai, MH', 'Bangalore, KA', 'Hubli, KA', 'Pune, MH', 'Chennai, TN', 'Hyderabad, TG', 'Delhi, DL', 'Kolkata, WB'];

// 15 Seed Users
export const SEED_USERS = [
  { id: 'user_admin_test', name: 'System Admin', email: 'admin@arcus.com', role: 'ADMIN', adminRole: 'SUPER_ADMIN' },
  { id: 'user_sales_1', name: 'Vikram Sharma', email: 'vikram@arcus.com', role: 'USER', adminRole: 'SALES_MANAGER' },
  { id: 'user_sales_2', name: 'Ananya Sen', email: 'ananya@arcus.com', role: 'USER', adminRole: 'SALES_MANAGER' },
  { id: 'user_sales_3', name: 'Rahul Deshmukh', email: 'rahul.d@arcus.com', role: 'USER', adminRole: 'SALES_MANAGER' },
  { id: 'user_procure_1', name: 'Karan Malhotra', email: 'karan@arcus.com', role: 'USER', adminRole: 'OPERATIONS_MANAGER' },
  { id: 'user_procure_2', name: 'Neha Gupta', email: 'neha@arcus.com', role: 'USER', adminRole: 'OPERATIONS_MANAGER' },
  { id: 'user_procure_3', name: 'Amit Patel', email: 'amit@arcus.com', role: 'USER', adminRole: 'OPERATIONS_MANAGER' },
  { id: 'user_cat_1', name: 'Sanjay Singhania', email: 'sanjay@arcus.com', role: 'USER', adminRole: 'OPERATIONS_MANAGER' },
  { id: 'user_cat_2', name: 'Priya Sharma', email: 'priya.s@arcus.com', role: 'USER', adminRole: 'OPERATIONS_MANAGER' },
  { id: 'user_buyer_1', name: 'Sunil Yardi', email: 'sunil.y@lntecc.com', role: 'USER', adminRole: 'CUSTOMER_SUPPORT' },
  { id: 'user_buyer_2', name: 'Manoj Kumar', email: 'manoj.k@prestigeconst.com', role: 'USER', adminRole: 'CUSTOMER_SUPPORT' },
  { id: 'user_buyer_3', name: 'Vilas Patil', email: 'vilas@abcconstructions.in', role: 'USER', adminRole: 'CUSTOMER_SUPPORT' },
  { id: 'user_buyer_4', name: 'Rakesh Shah', email: 'rakesh.shah@fortis-india.com', role: 'USER', adminRole: 'CUSTOMER_SUPPORT' },
  { id: 'user_buyer_5', name: 'Ashok Ranade', email: 'aranade@tataprojects.com', role: 'USER', adminRole: 'CUSTOMER_SUPPORT' },
  { id: 'user_buyer_6', name: 'H. S. Patil', email: 'ee.hdbypass@kpwd.gov.in', role: 'USER', adminRole: 'CUSTOMER_SUPPORT' }
];

// 30 Construction Companies Scenarios
const COMPANIES = [
  { name: 'L&T Construction', contact: 'Sunil Yardi', email: 'sunil.y@lntecc.com', phone: '+91 98200 12345', gst: '27AAACL1234D1Z2' },
  { name: 'Prestige Builders', contact: 'Manoj Kumar', email: 'manoj.k@prestigeconst.com', phone: '+91 94480 98765', gst: '29AABCP9876C2Z3' },
  { name: 'ABC Constructions', contact: 'Vilas Patil', email: 'vilas@abcconstructions.in', phone: '+91 83620 54321', gst: '29AABCA5432E1Z8' },
  { name: 'Fortis Healthcare', contact: 'Rakesh Shah', email: 'rakesh.shah@fortis-india.com', phone: '+91 91200 45678', gst: '27AAACF4567M1Z4' },
  { name: 'Tata Projects', contact: 'Ashok Ranade', email: 'aranade@tataprojects.com', phone: '+91 99220 33445', gst: '27AAACT3344F1Z0' },
  { name: 'Karnataka PWD', contact: 'H. S. Patil', email: 'ee.hdbypass@kpwd.gov.in', phone: '+91 83622 11002', gst: '29AAAGK1102A1Z9' },
  { name: 'Godrej Properties', contact: 'Rohit Bal', email: 'rohit.bal@godrejprop.com', phone: '+91 98110 22334', gst: '27AAACG2233H1Z1' },
  { name: 'DLF Limited', contact: 'Rajesh Goel', email: 'rgoel@dlf.in', phone: '+91 98100 44556', gst: '06AAACD4455E1Z5' },
  { name: 'Shapoorji Pallonji', contact: 'Cyrus Mistry', email: 'cyrus@shapoorji.com', phone: '+91 22220 33445', gst: '27AAACS3344J1Z6' },
  { name: 'Sobha Developers', contact: 'J. C. Sharma', email: 'jcsharma@sobha.com', phone: '+91 80220 44556', gst: '29AAACS4455K1Z7' },
  { name: 'Oberoi Realty', contact: 'Vikas Oberoi', email: 'vikas@oberoirealty.com', phone: '+91 22660 11223', gst: '27AAACO1122D1Z3' },
  { name: 'Lodha Group', contact: 'Abhishek Lodha', email: 'abhishek@lodhagroup.com', phone: '+91 22613 34455', gst: '27AAACL3445F1Z2' },
  { name: 'Brigade Group', contact: 'Jaishankar M', email: 'jaishankar@brigadegroup.com', phone: '+91 80413 77889', gst: '29AAACB7788G1Z9' },
  { name: 'Mahindra Lifespaces', contact: 'Arvind Subramanian', email: 'arvind@mahindra.com', phone: '+91 22661 22334', gst: '27AAACM2233I1Z0' },
  { name: 'Hiranandani Group', contact: 'Niranjan H', email: 'niranjan@hiranandani.net', phone: '+91 22257 00112', gst: '27AAACH0112J1Z8' },
  { name: 'K Raheja Corp', contact: 'Neel Raheja', email: 'neel@kraheja.com', phone: '+91 22265 64000', gst: '27AAACK6400K1Z9' },
  { name: 'Kolte-Patil Developers', contact: 'Gopal Sarda', email: 'gopal@koltepatil.com', phone: '+91 20669 47000', gst: '27AAACK7000L1Z1' },
  { name: 'Puravankara Limited', contact: 'Ashish Puravankara', email: 'ashish@puravankara.com', phone: '+91 80255 99000', gst: '29AAACP9000M1Z2' },
  { name: 'Salarpuria Sattva', contact: 'Bijay Agarwal', email: 'bijay@sattvagroup.in', phone: '+91 80426 99000', gst: '29AAACS9000N1Z3' },
  { name: 'Ashoka Buildcon', contact: 'Satish Parakh', email: 'satish@ashokabuildcon.com', phone: '+91 25330 11777', gst: '27AAACA1777O1Z4' },
  { name: 'IRB Infrastructure', contact: 'Virendra Mhaiskar', email: 'vmhaiskar@irb.co.in', phone: '+91 22664 04000', gst: '27AAACI4000P1Z5' },
  { name: 'Dilip Buildcon', contact: 'Dilip Suryavanshi', email: 'dilip@dilipbuildcon.co.in', phone: '+91 75540 29999', gst: '23AAACD9999Q1Z6' },
  { name: 'NCC Limited', contact: 'A. A. V. Ranga Raju', email: 'raju@nccltd.in', phone: '+91 40232 68888', gst: '36AAACN8888R1Z7' },
  { name: 'Sadbhav Engineering', contact: 'Vashishtha Patel', email: 'vpatel@sadbhav.co.in', phone: '+91 79264 63384', gst: '24AAACS3384S1Z8' },
  { name: 'GMR Infrastructure', contact: 'Kiran Kumar Grandhi', email: 'kiran@gmrgroup.in', phone: '+91 11425 32600', gst: '07AAACG2600T1Z9' },
  { name: 'Afcons Infrastructure', contact: 'S. Paramasivan', email: 'paramasivan@afcons.com', phone: '+91 22671 91000', gst: '27AAACA1000U1Z0' },
  { name: 'Simplex Infrastructures', contact: 'Rajiv Mundhra', email: 'rajiv@simplexinfra.com', phone: '+91 33230 11600', gst: '19AAACS1600V1Z1' },
  { name: 'ITD Cementation', contact: 'Santi Congtrakul', email: 'santi@itdcem.co.in', phone: '+91 22669 31600', gst: '27AAACI1600W1Z2' },
  { name: 'HCC Limited', contact: 'Ajit Gulabchand', email: 'ajit@hccg.com', phone: '+91 22257 51000', gst: '27AAACH1000X1Z3' },
  { name: 'Punj Lloyd', contact: 'Atul Punj', email: 'atul@punjlloyd.com', phone: '+91 12426 20123', gst: '06AAACP0123Y1Z4' }
];

// Product Materials Seed Data
const MATERIALS = [
  { itemName: 'OPC 53 Grade Cement', description: 'UltraTech or ACC, standard 50kg bag', unit: 'Bags', targetPrice: 420 },
  { itemName: 'TMT Steel Bars (12mm Fe500D)', description: 'TATA Tiscon or JSW Neosteel', unit: 'Metric Tons', targetPrice: 64000 },
  { itemName: 'AAC Blocks (600x200x150mm)', description: 'Grade I, density 600 kg/m3', unit: 'Pieces', targetPrice: 65 },
  { itemName: 'HDPE Corrugated Pipe (DN 200)', description: 'Class SN8, drainage application', unit: 'Meters', targetPrice: 420 },
  { itemName: 'VRF Outdoor Condensing Unit (18 HP)', description: 'Daikin or Blue Star, scroll inverter', unit: 'Units', targetPrice: 320000 },
  { itemName: 'Main Power Distribution Panel (800A)', description: 'Siemens/ABB switchgear', unit: 'Panels', targetPrice: 240000 },
  { itemName: 'Structural Steel I-Beams (ISMB 400)', description: 'Fe410 grade, 12m length', unit: 'Metric Tons', targetPrice: 62000 },
  { itemName: 'Ready Mix Concrete (M30)', description: 'Standard mix, slump retention 4 hours', unit: 'Cubic Meters', targetPrice: 4800 },
  { itemName: 'HEPA Filter Fan Units (FFU)', description: 'Efficiency 99.997% at 0.3 micron', unit: 'Pieces', targetPrice: 28000 },
  { itemName: 'LT Armored XLPE Cable (3.5C x 300)', description: '1.1KV grade, copper conductor', unit: 'Meters', targetPrice: 1850 }
];

const commentTexts = [
  "Can we revise the delivery lead time to 10 days instead of 15? The project launch date is creeping closer.",
  "Checked the specifications for the TMT Steel. Fe500D from TATA is approved. Please upload the mill test certificate.",
  "Owner: Vikram Sharma updated the priority to CRITICAL. Need category manager input on cement availability in Hubli warehouse.",
  "Procurement has reached out to three premium manufacturers. Quotations are expected by Friday afternoon.",
  "Clarification: Cassette AC blowers must support 4-way direction blow panel with remote configuration.",
  "Warning: The site access path has restricted load capacity (max 20 tons). Deliveries must be in split trucks."
];

const filenames = [
  { name: 'structural_steel_drawing_v1.pdf', type: 'PDF', size: '4.8 MB' },
  { name: 'bill_of_quantities_excel.xlsx', type: 'EXCEL', size: '1.2 MB' },
  { name: 'hvac_flow_schematics.dwg', type: 'CAD', size: '15.4 MB' },
  { name: 'site_entrance_clearance.jpg', type: 'IMAGE', size: '2.1 MB' }
];

export async function seedDevelopmentRfqs(): Promise<void> {
  console.log('🌱 Starting Module 2 v2.5 development RFQs seeding...');

  const hash = '6877d764d4cbb63e60a9c4f1a1697a67bdf8a986302ed58acb9d6690e6355ddcbf84d7475055dcc942d6e3b11a2a1ba1539cb4490ee7dbbfa5e4a6d08348d97a';
  const salt = 'c76d0827a59b535f9736b215ae649e70';

  if (usePostgres && pgPool) {
    console.log('Seeding PostgreSQL database tables...');
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // Clear old tables
      await client.query('DELETE FROM rfq_assignment_history');
      await client.query('DELETE FROM rfq_assignments');
      await client.query('DELETE FROM rfq_watchers');
      await client.query('DELETE FROM rfq_comments');
      await client.query('DELETE FROM activity_logs');
      await client.query('DELETE FROM attachments');
      await client.query('DELETE FROM rfq_items');
      await client.query('DELETE FROM quotations');
      await client.query('DELETE FROM rfqs');

      // Seed 15 Users if they do not exist
      let userIdx = 10;
      for (const u of SEED_USERS) {
        const uExist = await client.query('SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)', [u.email]);
        if (uExist.rows.length === 0) {
          const userPhone = `+91 99999 ${String(userIdx).padStart(5, '0')}`;
          userIdx++;
          await client.query(`
            INSERT INTO users (id, name, email, phone, password_hash, password_salt, role, email_verified, customer_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, 'BUSINESS')
          `, [u.id, u.name, u.email, userPhone, hash, salt, u.role]);

          if (u.role === 'ADMIN') {
            await client.query('INSERT INTO admin_profiles (user_id, admin_role) VALUES ($1, $2)', [u.id, u.adminRole]);
          } else {
            const userGst = `29AAAAA${String(userIdx).padStart(4, '0')}A1Z0`;
            await client.query('INSERT INTO business_profiles (user_id, company_name, gst_number) VALUES ($1, $2, $3)', [u.id, u.name + ' Org', userGst]);
          }
        }
      }

      // Seed 105 RFQs
      for (let i = 0; i < 105; i++) {
        const companyIndex = i % COMPANIES.length;
        const comp = COMPANIES[companyIndex];
        
        // Dynamic status distribution
        const status = STATUSES[i % STATUSES.length];
        // Dynamic priority distribution
        const priority = PRIORITIES[i % PRIORITIES.length];
        
        const salesRep = SEED_USERS[1 + (i % 3)]; // Vikram, Ananya, Rahul
        const procureRep = SEED_USERS[4 + (i % 3)]; // Karan, Neha, Amit
        const catManager = SEED_USERS[7 + (i % 2)]; // Sanjay, Priya
        const creator = SEED_USERS[9 + (i % 6)]; // Sunil, Manoj, Vilas, Rakesh, Ashok, HS Patil

        const location = LOCATIONS[i % LOCATIONS.length];
        const timestamp = new Date(Date.now() - (i * 2 + 1) * 3600000 * 4).toISOString(); // Shift creation dates backwards
        const dueDate = new Date(Date.now() + (5 + (i % 20)) * 24 * 3600000).toISOString();
        const reminderDate = new Date(new Date(dueDate).getTime() - 2 * 24 * 3600000).toISOString();

        const rfqNumber = `RFQ-2026-${String(i + 1).padStart(3, '0')}`;
        
        // Generate dynamic items for this RFQ
        const numItems = 2 + (i % 3); // 2 to 4 items per RFQ
        let rfqValue = 0;
        const itemsList = [];
        for (let j = 0; j < numItems; j++) {
          const mat = MATERIALS[(i + j) % MATERIALS.length];
          const qty = 50 + (i * j % 20) * 10;
          rfqValue += qty * mat.targetPrice;
          itemsList.push({ ...mat, quantity: String(qty) });
        }

        const customerInfo = {
          id: creator.id,
          name: comp.contact,
          companyName: comp.name,
          email: comp.email,
          phone: comp.phone,
          gstNumber: comp.gst,
          location: location,
          industry: 'Infrastructure Development'
        };

        // Insert RFQ returning UUID id
        const insertRes = await client.query(`
          INSERT INTO rfqs (
            rfq_number, timestamp, name, phone, category, quantity, location, details,
            created_by_id, assigned_to_id, status, priority, due_date, reminder_date, value, project_type, customer_json
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id
        `, [
          rfqNumber,
          timestamp,
          comp.contact,
          comp.phone,
          itemsList[0].itemName,
          itemsList[0].quantity,
          location,
          `Procurement request for ${comp.name} project at ${location}. Core specifications attached.`,
          creator.id,
          salesRep.id,
          status,
          priority,
          dueDate,
          reminderDate,
          rfqValue,
          'Structural Works',
          JSON.stringify(customerInfo)
        ]);

        const rfqUuid = insertRes.rows[0].id;

        // Seed RFQ Items
        for (let j = 0; j < itemsList.length; j++) {
          const item = itemsList[j];
          await client.query(`
            INSERT INTO rfq_items (rfq_id, item_name, quantity, specification_requirements)
            VALUES ($1, $2, $3, $4)
          `, [
            rfqUuid,
            item.itemName,
            item.quantity,
            JSON.stringify({ description: item.description, unit: item.unit, targetPrice: item.targetPrice })
          ]);
        }

        // Seed Active Assignments
        await client.query(`
          INSERT INTO rfq_assignments (rfq_id, primary_owner_id, secondary_owner_id, assigned_by_id, notes, reason)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          rfqUuid,
          salesRep.id,
          procureRep.id,
          'user_admin_test',
          `Standard distribution routing to sales rep ${salesRep.name} and procurement executive ${procureRep.name}.`,
          'Automated Territory Rule routing match'
        ]);

        // Seed Assignment History
        await client.query(`
          INSERT INTO rfq_assignment_history (rfq_id, primary_owner_id, secondary_owner_id, assigned_by_id, notes, reason)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          rfqUuid,
          salesRep.id,
          procureRep.id,
          'user_admin_test',
          'Initial auto assignment log',
          'System router execution'
        ]);

        // Seed Watchers
        await client.query(`
          INSERT INTO rfq_watchers (rfq_id, user_id)
          VALUES ($1, $2), ($1, $3)
        `, [rfqUuid, catManager.id, 'user_admin_test']);

        // Seed Activity Logs (Average 10 timeline logs per RFQ)
        const activityEvents = [
          { action: 'RFQ_CREATED', title: 'RFQ Created', desc: `RFQ submitted by client customer ${comp.contact}.` },
          { action: 'SLA_DUE_DATE_SET', title: 'Due Date Scheduled', desc: `RFQ due date configured for ${new Date(dueDate).toLocaleDateString()}.` },
          { action: 'RFQ_ASSIGNED', title: 'Owners Allocated', desc: `Assigned primary owner Vikram Sharma, watcher Sanjay Singhania.` },
          { action: 'STATUS_UPDATED', title: 'Status Transitioned', desc: `Status progressed from DRAFT to SUBMITTED.`, prev: 'DRAFT', next: 'SUBMITTED' },
          { action: 'PRIORITY_UPDATED', title: 'Priority Set', desc: `Priority set to ${priority}.`, prev: 'MEDIUM', next: priority }
        ];

        // Fill remaining up to 10 dynamically
        for (let k = 0; k < Math.min(10, activityEvents.length); k++) {
          const act = activityEvents[k];
          await client.query(`
            INSERT INTO activity_logs (entity_type, entity_id, action, title, description, timestamp, performed_by_id, prev_value, new_value)
            VALUES ('RFQ', $1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            rfqUuid,
            act.action,
            act.title,
            act.desc,
            new Date(new Date(timestamp).getTime() + k * 10 * 60000).toISOString(),
            salesRep.id,
            act.prev || null,
            act.next || null
          ]);
        }

        // Seed Comments (Threaded)
        const parentIdRes = await client.query(`
          INSERT INTO rfq_comments (rfq_id, author_id, author_name, author_role, text, timestamp, is_internal)
          VALUES ($1, $2, $3, $4, $5, $6, TRUE)
          RETURNING id
        `, [
          rfqUuid,
          salesRep.id,
          salesRep.name,
          'Sales Executive',
          commentTexts[i % commentTexts.length],
          new Date(new Date(timestamp).getTime() + 15 * 60000).toISOString()
        ]);
        const parentCommentId = parentIdRes.rows[0].id;

        // Nested reply
        await client.query(`
          INSERT INTO rfq_comments (rfq_id, author_id, author_name, author_role, text, timestamp, is_internal, parent_comment_id)
          VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
        `, [
          rfqUuid,
          procureRep.id,
          procureRep.name,
          'Procurement Lead',
          `Replying to primary owner: Understood. Requesting pricing verification from sub-vendors.`,
          new Date(new Date(timestamp).getTime() + 25 * 60000).toISOString(),
          parentCommentId
        ]);

        // Customer visible comment
        await client.query(`
          INSERT INTO rfq_comments (rfq_id, author_id, author_name, author_role, text, timestamp, is_internal)
          VALUES ($1, $2, $3, $4, $5, $6, FALSE)
        `, [
          rfqUuid,
          creator.id,
          creator.name,
          'Buyer Client Representative',
          "Standard bill of materials is final. Let us know if you require structural grade alterations.",
          new Date(new Date(timestamp).getTime() + 45 * 60000).toISOString()
        ]);

        // Seed Attachments
        for (let j = 0; j < 2; j++) {
          const file = filenames[(i + j) % filenames.length];
          await client.query(`
            INSERT INTO attachments (
              entity_type, entity_id, filename, storage_provider, storage_key, 
              public_url, mime_type, size, uploaded_by_id, uploaded_at
            )
            VALUES ('RFQ', $1, $2, 'local', $3, $4, $5, $6, $7, $8)
          `, [
            rfqUuid,
            file.name,
            `uploads/rfqs/${rfqNumber}/${file.name}`,
            `/api/attachments/download/${file.name}`,
            file.type === 'PDF' ? 'application/pdf' : 'application/octet-stream',
            file.size === '4.8 MB' ? 5033164 : 1258291,
            creator.id,
            new Date(new Date(timestamp).getTime() + 50 * 60000).toISOString()
          ]);
        }
      }

      await client.query('COMMIT');
      console.log('✅ PostgreSQL database tables seeded with 105 normalized RFQs successfully.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Error during PostgreSQL seeder run:', err);
      throw err;
    } finally {
      client.release();
    }
  } else {
    console.log('Seeding JSON DB fallback file...');
    try {
      const db = await readJsonDb();
      db.rfqs = [];
      db.rfq_items = [];
      db.attachments = [];
      db.activity_logs = [];
      db.rfq_watchers = [];
      db.rfq_assignments = [];
      db.rfq_assignment_history = [];
      db.rfq_comments = [];

      // Seed Users if they do not exist
      if (!db.users) db.users = [];
      for (const u of SEED_USERS) {
        if (!db.users.find((x: any) => x.email.toLowerCase() === u.email.toLowerCase())) {
          db.users.push({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: '+91 99999 00000',
            passwordHash: hash,
            passwordSalt: salt,
            role: u.role,
            emailVerified: true
          });
        }
      }

      // Generate 105 mock RFQs for JSON DB fallback
      for (let i = 0; i < 105; i++) {
        const companyIndex = i % COMPANIES.length;
        const comp = COMPANIES[companyIndex];
        const status = STATUSES[i % STATUSES.length];
        const priority = PRIORITIES[i % PRIORITIES.length];
        
        const salesRep = SEED_USERS[1 + (i % 3)];
        const creator = SEED_USERS[9 + (i % 6)];
        const location = LOCATIONS[i % LOCATIONS.length];
        const timestamp = new Date(Date.now() - (i * 2 + 1) * 3600000 * 4).toISOString();
        const dueDate = new Date(Date.now() + (5 + (i % 20)) * 24 * 3600000).toISOString();
        
        const rfqId = `rfq_uuid_${i + 1}`;
        const rfqNumber = `RFQ-2026-${String(i + 1).padStart(3, '0')}`;

        const numItems = 2 + (i % 3);
        let rfqValue = 0;
        const itemsList = [];
        for (let j = 0; j < numItems; j++) {
          const mat = MATERIALS[(i + j) % MATERIALS.length];
          const qty = 50 + (i * j % 20) * 10;
          rfqValue += qty * mat.targetPrice;
          itemsList.push({ ...mat, quantity: String(qty) });
        }

        const customerInfo = {
          id: creator.id,
          name: comp.contact,
          companyName: comp.name,
          email: comp.email,
          phone: comp.phone,
          gstNumber: comp.gst,
          location: location,
          industry: 'Construction Materials'
        };

        db.rfqs.push({
          id: rfqId,
          rfq_number: rfqNumber,
          version: 1,
          timestamp,
          name: comp.contact,
          phone: comp.phone,
          category: itemsList[0].itemName,
          quantity: itemsList[0].quantity,
          location,
          details: `Procurement request for ${comp.name} project at ${location}. Core specifications attached.`,
          created_by_id: creator.id,
          assigned_to_id: salesRep.id,
          status,
          priority,
          due_date: dueDate,
          reminder_date: new Date(new Date(dueDate).getTime() - 2 * 24 * 3600000).toISOString(),
          value: rfqValue,
          project_type: 'Structural Works',
          customer_json: customerInfo
        });

        // Seed Items
        for (let j = 0; j < itemsList.length; j++) {
          const item = itemsList[j];
          db.rfq_items.push({
            id: `item_uuid_${i + 1}_${j + 1}`,
            rfq_id: rfqId,
            item_name: item.itemName,
            quantity: item.quantity,
            specification_requirements: { description: item.description, unit: item.unit, targetPrice: item.targetPrice }
          });
        }

        // Seed Active Assignments
        db.rfq_assignments.push({
          rfq_id: rfqId,
          primary_owner_id: salesRep.id,
          assigned_by_id: 'user_admin_test',
          assigned_at: timestamp,
          notes: 'Standard distribution routing'
        });

        // Seed Comments
        const parentCommentId = `comment_uuid_${i + 1}_parent`;
        db.rfq_comments.push({
          id: parentCommentId,
          rfq_id: rfqId,
          author_id: salesRep.id,
          author_name: salesRep.name,
          author_role: 'Sales Manager',
          text: commentTexts[i % commentTexts.length],
          timestamp,
          is_internal: true
        });

        db.rfq_comments.push({
          id: `comment_uuid_${i + 1}_reply`,
          rfq_id: rfqId,
          author_id: 'user_admin_test',
          author_name: 'System Admin',
          author_role: 'Admin Org',
          text: 'Acknowledged. Routing progress.',
          timestamp: new Date(new Date(timestamp).getTime() + 10 * 60000).toISOString(),
          is_internal: true,
          parent_comment_id: parentCommentId
        });

        // Seed Activity Logs
        db.activity_logs.push({
          id: `activity_uuid_${i + 1}`,
          entity_type: 'RFQ',
          entity_id: rfqId,
          action: 'RFQ_CREATED',
          title: 'RFQ Created',
          description: `RFQ successfully created for ${comp.name}`,
          timestamp,
          performed_by_id: creator.id
        });

        // Seed Attachments
        const file = filenames[i % filenames.length];
        db.attachments.push({
          id: `attachment_uuid_${i + 1}`,
          entity_type: 'RFQ',
          entity_id: rfqId,
          filename: file.name,
          storage_provider: 'local',
          storage_key: `uploads/${file.name}`,
          mime_type: 'application/pdf',
          size: 1024 * 1024,
          uploaded_by_id: creator.id,
          uploaded_at: timestamp,
          version: 'v1.0'
        });
      }

      await writeJsonDb(db);
      console.log('✅ JSON DB fallback seeded with 105 normalized RFQs successfully.');
    } catch (err) {
      console.error('❌ Error seeding JSON DB RFQs:', err);
      throw err;
    }
  }
}
