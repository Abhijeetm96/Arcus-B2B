import { Client } from 'pg';
import 'dotenv/config';

async function seed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vfdn7mLCKT2s@ep-cold-silence-aoktz9xt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  console.log('🌱 Connecting to database to seed orders...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    console.log('🌱 Inserting test addresses for user_business_test...');
    await client.query(`
      INSERT INTO user_addresses (id, user_id, address_type, recipient_name, phone_number, company_name, address_line_1, address_line_2, city, state, postal_code, is_default)
      VALUES 
        ('addr_shipping_test', 'user_business_test', 'SHIPPING', 'YUKEN INDIA LIMITED', '9876543210', 'YUKEN INDIA LIMITED', 'P. B. No. 5, Koppathimanahalli Village', 'H. Hoskote Gram Panchayat, Lakkur Hobli', 'Malur', 'Karnataka', '563160', true),
        ('addr_billing_test', 'user_business_test', 'BILLING', 'YUKEN INDIA LIMITED', '9876543210', 'YUKEN INDIA LIMITED', 'P. B. No. 5, Koppathimanahalli Village', 'H. Hoskote Gram Panchayat, Lakkur Hobli', 'Malur', 'Karnataka', '563160', true)
      ON CONFLICT (id) DO UPDATE SET 
        recipient_name = EXCLUDED.recipient_name,
        address_line_1 = EXCLUDED.address_line_1,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code;
    `);

    console.log('🌱 Inserting test delivered order ORD-B2B-2026-001...');
    await client.query(`
      INSERT INTO orders (id, user_id, timestamp, date, products, status, amount, items, shipping_address, billing_address, gst_number, payment_method, points_earned)
      VALUES (
        'ORD-B2B-2026-001',
        'user_business_test',
        NOW() - INTERVAL '2 days',
        'July 1, 2026',
        'Finolex PVC Pipe 4 Inch x 40, Supreme Elbow 90° x 60',
        'Delivered',
        '20640.00',
        '[{"productId": "finolex-pvc-pipe", "productName": "Finolex PVC Pipe 4 Inch", "qty": 40, "price": 480.00}, {"productId": "supreme-elbow-90", "productName": "Supreme Elbow 90°", "qty": 60, "price": 24.00}]'::jsonb,
        'YUKEN INDIA LIMITED, 9876543210, P. B. No. 5, Koppathimanahalli Village, H. Hoskote Gram Panchayat, Lakkur Hobli, Malur, Karnataka - 563160',
        'YUKEN INDIA LIMITED, 9876543210, P. B. No. 5, Koppathimanahalli Village, H. Hoskote Gram Panchayat, Lakkur Hobli, Malur, Karnataka - 563160',
        '29AAACY1160E1ZJ',
        'Net Banking',
        250
      )
      ON CONFLICT (id) DO UPDATE SET 
        status = EXCLUDED.status,
        amount = EXCLUDED.amount,
        items = EXCLUDED.items,
        shipping_address = EXCLUDED.shipping_address,
        billing_address = EXCLUDED.billing_address,
        gst_number = EXCLUDED.gst_number;
    `);

    console.log('🌱 Inserting order items...');
    await client.query(`
      INSERT INTO order_items (order_id, variant_id, quantity, unit_price, gst_rate, tax_amount, total_amount)
      VALUES 
        ('ORD-B2B-2026-001', 'finolex-pvc-pipe', 40, 480.00, 18.00, 2928.81, 19200.00),
        ('ORD-B2B-2026-001', 'supreme-elbow-90', 60, 24.00, 18.00, 219.66, 1440.00)
      ON CONFLICT (order_id, variant_id) DO NOTHING;
    `);

    console.log('✅ PostgreSQL orders database seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding PostgreSQL orders:', err);
  } finally {
    await client.end();
  }
}

seed();
