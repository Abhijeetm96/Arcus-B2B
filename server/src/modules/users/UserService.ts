/**
 * @file UserService.ts
 * @description Provides business operations for user accounts, OTP authentication, and profile updates.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { User, OtpRecord } from './User';

/**
 * Helper to enrich local JSON DB user record with profiles.
 * Construct a clean object containing only non-legacy user fields plus the normalized ones.
 */
function enrichUserWithProfiles(u: any, db: any, caller: string): any {
  if (!u) return null;
  const ip = db.individual_profiles?.find((p: any) => p.userId === u.id);
  const bp = db.business_profiles?.find((p: any) => p.userId === u.id);
  const pp = db.professional_profiles?.find((p: any) => p.userId === u.id);
  const w = db.buildpoints_wallets?.find((p: any) => p.userId === u.id);



  return {
    id: u.id,
    created_at: u.created_at || u.createdAt,
    updated_at: u.updated_at || u.updatedAt,
    name: u.name,
    full_name: u.fullName || u.full_name || u.name,
    email: u.email,
    phone: u.phone,
    phone_number: u.phoneNumber || u.phone_number || u.phone,
    email_verified: u.email_verified || u.emailVerified,
    password_hash: u.passwordHash || u.password_hash,
    password_salt: u.passwordSalt || u.password_salt,
    role: u.role,
    customer_type: u.customerType || u.customer_type,

    bp_company_name: bp?.companyName || bp?.company_name,
    bp_gst_number: bp?.gstNumber || bp?.gst_number,
    pp_service_category: pp?.serviceCategory || pp?.service_category,
    pp_experience_years: pp?.experienceYears !== undefined ? pp.experienceYears : (pp?.experience_years !== undefined ? pp.experience_years : undefined),
    pp_city: pp?.city,
    pp_state: pp?.state,
    pp_website_url: pp?.websiteUrl || pp?.website_url,
    pp_portfolio_url: pp?.portfolioUrl || pp?.portfolio_url,
    w_build_points: w?.balance
  };
}

/**
 * Maps a raw database user row to the standardized User interface.
 * Preserves compatibility between database representations (snake_case) and code representations (camelCase).
 * 
 * @param {any} row - The raw user row from PostgreSQL or JSON DB.
 * @returns {User} Standardized User entity.
 */
export function mapRowToUser(row: any, caller = 'UserService'): User {
  if (!row) return null as any;



  // 1. Resolve role: ADMIN or USER
  const dbRole = row.role;
  let resolvedRole: 'ADMIN' | 'USER' = 'USER';
  if (dbRole === 'Admin' || dbRole === 'ADMIN') {
    resolvedRole = 'ADMIN';
  }

  // 2. Resolve customerType based on legacy role or customer_type
  let resolvedCustomerType: 'INDIVIDUAL' | 'BUSINESS' | 'PROFESSIONAL' = 'INDIVIDUAL';
  if (row.customer_type) {
    resolvedCustomerType = String(row.customer_type).toUpperCase() as any;
  } else if (row.customerType) {
    resolvedCustomerType = String(row.customerType).toUpperCase() as any;
  } else {
    if (['Individual', 'Buyer', 'INDIVIDUAL', 'USER'].includes(dbRole)) {
      resolvedCustomerType = 'INDIVIDUAL';
    } else if (['Business', 'Contractor', 'Supplier', 'BUSINESS'].includes(dbRole)) {
      resolvedCustomerType = 'BUSINESS';
    } else if (['Professional', 'PROFESSIONAL'].includes(dbRole)) {
      resolvedCustomerType = 'PROFESSIONAL';
    }
  }

  const adminRole = row.admin_role || row.adminRole || (resolvedRole === 'ADMIN' ? 'SUPER_ADMIN' : undefined);

  // Sourced exclusively from normalized profiles and wallets
  const bpCompanyName = row.bp_company_name;
  const bpGstNumber = row.bp_gst_number;
  const ppServiceCategory = row.pp_service_category;
  const ppExperienceYears = row.pp_experience_years;
  const ppCity = row.pp_city;
  const ppState = row.pp_state;
  const ppWebsiteUrl = row.pp_website_url;
  const ppPortfolioUrl = row.pp_portfolio_url;
  const wBuildPoints = row.w_build_points;

  return {
    id: row.id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at || row.createdAt || Date.now()).toISOString(),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at || row.createdAt || Date.now()).toISOString(),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at || row.updatedAt || Date.now()).toISOString(),
    name: row.name,
    full_name: row.full_name || row.fullName || undefined,
    fullName: row.full_name || row.fullName || undefined,
    email: row.email,
    phone: row.phone,
    phone_number: row.phone_number || row.phoneNumber || undefined,
    phoneNumber: row.phone_number || row.phoneNumber || undefined,
    email_verified: row.email_verified,
    passwordHash: row.password_hash || row.passwordHash,
    password_hash: row.password_hash || row.passwordHash,
    passwordSalt: row.password_salt || row.passwordSalt,
    companyName: bpCompanyName || undefined,
    role: resolvedRole,
    gstNumber: bpGstNumber || undefined,
    serviceCategory: ppServiceCategory || undefined,
    experience: ppExperienceYears !== undefined && ppExperienceYears !== null ? `${ppExperienceYears} Years` : undefined,
    city: ppCity || undefined,
    state: ppState || undefined,
    website: ppWebsiteUrl || undefined,
    portfolioUrl: ppPortfolioUrl || undefined,
    customerType: resolvedCustomerType,
    adminRole: adminRole as any,
    buildPoints: wBuildPoints !== undefined && wBuildPoints !== null ? parseInt(wBuildPoints, 10) : 0
  };
}

/**
 * Registers a new user in the system.
 * Validates uniqueness of email, phone number, and GST number before committing.
 * 
 * @param {User} user - The user details to register.
 * @returns {Promise<User>} The registered User record.
 * @throws {Error} If user already exists with the same email, phone, or GST number.
 */
export async function addUser(user: User): Promise<User> {
  const generatedId = user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const createdAt = user.createdAt || new Date().toISOString();
  const customerType = user.customerType || (['Business', 'Contractor', 'Supplier'].includes(user.role) ? 'BUSINESS' : 'INDIVIDUAL');
  const buildPoints = user.buildPoints !== undefined ? user.buildPoints : 0;



  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO users (
          id, created_at, updated_at, name, full_name, email, phone, phone_number, password_hash, password_salt, role,
          email_verified, customer_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, created_at, updated_at, name, full_name, email, phone, phone_number, password_hash, password_salt, role, email_verified, customer_type
      `;
      const values = [
        generatedId,
        createdAt,
        createdAt,
        user.name,
        user.fullName || user.full_name || user.name,
        user.email.toLowerCase(),
        user.phone,
        user.phoneNumber || user.phone_number || user.phone,
        user.passwordHash || user.password_hash,
        user.passwordSalt,
        user.role,
        user.email_verified || false,
        customerType
      ];
      const res = await client.query(query, values);
      const createdUser = res.rows[0];

      // Dual write to individual_profiles
      const fullName = user.fullName || user.full_name || user.name;
      const altPhone = user.phoneNumber || user.phone_number || user.phone;
      await client.query(`
        INSERT INTO individual_profiles (user_id, full_name, alternate_phone, preferred_language, created_at, updated_at)
        VALUES ($1, $2, $3, 'English', $4, $4)
        ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, alternate_phone = EXCLUDED.alternate_phone, updated_at = EXCLUDED.updated_at
      `, [generatedId, fullName, altPhone, createdAt]);

      // Dual write to business_profiles if B2B
      const isB2B = customerType === 'BUSINESS';
      if (isB2B) {
        const companyName = user.companyName || 'Generic Corp';
        const gstNum = user.gstNumber || '29ABCDE1234F1Z5';
        await client.query(`
          INSERT INTO business_profiles (user_id, company_name, gst_number, verification_status, created_at, updated_at)
          VALUES ($1, $2, $3, 'APPROVED', $4, $4)
          ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name, gst_number = EXCLUDED.gst_number, updated_at = EXCLUDED.updated_at
        `, [generatedId, companyName, gstNum, createdAt]);
      }

      // Dual write to professional_profiles if professional
      const isPro = customerType === 'PROFESSIONAL' || user.role === 'Professional';
      if (isPro) {
        const svcCat = user.serviceCategory || 'General';
        const expYears = parseInt(user.experience || '0', 10) || 0;
        const city = user.city || 'Unknown';
        const state = user.state || 'Unknown';
        await client.query(`
          INSERT INTO professional_profiles (user_id, service_category, experience_years, city, state, website_url, portfolio_url, verification_status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED', $8, $8)
          ON CONFLICT (user_id) DO UPDATE SET service_category = EXCLUDED.service_category, experience_years = EXCLUDED.experience_years, city = EXCLUDED.city, state = EXCLUDED.state, website_url = EXCLUDED.website_url, portfolio_url = EXCLUDED.portfolio_url, updated_at = EXCLUDED.updated_at
        `, [generatedId, svcCat, expYears, city, state, user.website || null, user.portfolioUrl || null, createdAt]);
      }

      // Seed buildpoints wallet
      await client.query(`
        INSERT INTO buildpoints_wallets (user_id, balance, tier, lifetime_points_accumulated, updated_at)
        VALUES ($1, $2, 'BRONZE', $2, $3)
        ON CONFLICT (user_id) DO NOTHING
      `, [generatedId, buildPoints, createdAt]);

      await client.query('COMMIT');

      // Re-query to enrich created user with profiles correctly
      const enrichedQuery = `
        SELECT u.id, u.created_at, u.updated_at, u.name, u.full_name, u.email, u.phone, u.phone_number, u.password_hash, u.password_salt, u.role, u.email_verified, u.customer_type,
               bp.company_name AS bp_company_name,
               bp.gst_number AS bp_gst_number,
               pp.service_category AS pp_service_category,
               pp.experience_years AS pp_experience_years,
               pp.city AS pp_city,
               pp.state AS pp_state,
               pp.website_url AS pp_website_url,
               pp.portfolio_url AS pp_portfolio_url,
               w.balance AS w_build_points
        FROM users u
        LEFT JOIN business_profiles bp ON u.id = bp.user_id
        LEFT JOIN professional_profiles pp ON u.id = pp.user_id
        LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
        WHERE u.id = $1
      `;
      const enrichedRes = await client.query(enrichedQuery, [generatedId]);
      return mapRowToUser(enrichedRes.rows[0], 'addUser');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = await readJsonDb();
    if (!db.users) {
      db.users = [];
    }
    const cleanEmail = user.email.toLowerCase();
    const cleanPhone = user.phone;
    const cleanGst = user.gstNumber?.trim().toUpperCase();

    if (db.users.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Unable to process registration request with the provided details.');
    }
    if (db.users.some((u: any) => u.phone === cleanPhone)) {
      throw new Error('Unable to process registration request with the provided details.');
    }
    if (cleanGst && db.business_profiles?.some((p: any) => p.gstNumber?.toUpperCase() === cleanGst)) {
      throw new Error('Unable to process registration request with the provided details.');
    }

    const newUser: User = {
      id: generatedId,
      email: cleanEmail,
      name: user.name,
      fullName: user.fullName || user.full_name || user.name,
      full_name: user.fullName || user.full_name || user.name,
      phone: cleanPhone,
      phoneNumber: user.phoneNumber || user.phone_number || user.phone,
      phone_number: user.phoneNumber || user.phone_number || user.phone,
      email_verified: user.email_verified || false,
      passwordHash: user.passwordHash || user.password_hash,
      password_hash: user.passwordHash || user.password_hash,
      passwordSalt: user.passwordSalt,
      role: user.role,
      createdAt,
      created_at: createdAt,
      updated_at: createdAt,
      customerType,
    } as any;
    db.users.push(newUser);

    // JSON DB Profiles seed
    if (!db.individual_profiles) db.individual_profiles = [];
    if (!db.business_profiles) db.business_profiles = [];
    if (!db.professional_profiles) db.professional_profiles = [];
    if (!db.buildpoints_wallets) db.buildpoints_wallets = [];

    db.individual_profiles.push({
      userId: generatedId,
      fullName: user.fullName || user.full_name || user.name,
      alternatePhone: user.phoneNumber || user.phone_number || user.phone,
      preferredLanguage: 'English',
      createdAt,
      updatedAt: createdAt
    });

    if (customerType === 'BUSINESS') {
      db.business_profiles.push({
        userId: generatedId,
        companyName: user.companyName || 'Generic Corp',
        gstNumber: user.gstNumber || '29ABCDE1234F1Z5',
        verificationStatus: 'APPROVED',
        createdAt,
        updatedAt: createdAt
      });
    }

    if (customerType === 'PROFESSIONAL' || user.role === 'Professional') {
      db.professional_profiles.push({
        userId: generatedId,
        serviceCategory: user.serviceCategory || 'General',
        experienceYears: parseInt(user.experience || '0', 10) || 0,
        city: user.city || 'Unknown',
        state: user.state || 'Unknown',
        websiteUrl: user.website || '',
        portfolioUrl: user.portfolioUrl || '',
        verificationStatus: 'APPROVED',
        createdAt,
        updatedAt: createdAt
      });
    }

    db.buildpoints_wallets.push({
      userId: generatedId,
      balance: buildPoints,
      tier: 'BRONZE',
      lifetimePointsAccumulated: buildPoints,
      updatedAt: createdAt
    });

    await writeJsonDb(db);
    return mapRowToUser(enrichUserWithProfiles(newUser, db, 'addUser'), 'addUser');
  }
}

/**
 * Retrieves a user by their email address.
 * 
 * @param {string} email - The email address to look up.
 * @returns {Promise<User | null>} The user if found, otherwise null.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT u.id, u.created_at, u.updated_at, u.name, u.full_name, u.email, u.phone, u.phone_number, u.password_hash, u.password_salt, u.role, u.email_verified, u.customer_type,
             bp.company_name AS bp_company_name,
             bp.gst_number AS bp_gst_number,
             pp.service_category AS pp_service_category,
             pp.experience_years AS pp_experience_years,
             pp.city AS pp_city,
             pp.state AS pp_state,
             pp.website_url AS pp_website_url,
             pp.portfolio_url AS pp_portfolio_url,
             w.balance AS w_build_points
      FROM users u
      LEFT JOIN business_profiles bp ON u.id = bp.user_id
      LEFT JOIN professional_profiles pp ON u.id = pp.user_id
      LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const res = await pgPool.query(query, [email]);
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0], 'getUserByEmail');
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    return mapRowToUser(enrichUserWithProfiles(user, db, 'getUserByEmail'), 'getUserByEmail');
  }
}

/**
 * Retrieves a user by their phone number.
 * 
 * @param {string} phone - The phone number to look up.
 * @returns {Promise<User | null>} The user if found, otherwise null.
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT u.id, u.created_at, u.updated_at, u.name, u.full_name, u.email, u.phone, u.phone_number, u.password_hash, u.password_salt, u.role, u.email_verified, u.customer_type,
             bp.company_name AS bp_company_name,
             bp.gst_number AS bp_gst_number,
             pp.service_category AS pp_service_category,
             pp.experience_years AS pp_experience_years,
             pp.city AS pp_city,
             pp.state AS pp_state,
             pp.website_url AS pp_website_url,
             pp.portfolio_url AS pp_portfolio_url,
             w.balance AS w_build_points
      FROM users u
      LEFT JOIN business_profiles bp ON u.id = bp.user_id
      LEFT JOIN professional_profiles pp ON u.id = pp.user_id
      LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
      WHERE u.phone = $1
    `;
    const res = await pgPool.query(query, [phone]);
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0], 'getUserByPhone');
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u: any) => u.phone === phone);
    if (!user) return null;
    return mapRowToUser(enrichUserWithProfiles(user, db, 'getUserByPhone'), 'getUserByPhone');
  }
}

/**
 * Retrieves a user by their GSTIN (GST identification number).
 * 
 * @param {string} gstNumber - The GST number to look up.
 * @returns {Promise<User | null>} The user if found, otherwise null.
 */
export async function getUserByGst(gstNumber: string): Promise<User | null> {
  const cleanGst = gstNumber.trim().toUpperCase();
  if (usePostgres && pgPool) {
    const query = `
      SELECT u.id, u.created_at, u.updated_at, u.name, u.full_name, u.email, u.phone, u.phone_number, u.password_hash, u.password_salt, u.role, u.email_verified, u.customer_type,
             bp.company_name AS bp_company_name,
             bp.gst_number AS bp_gst_number,
             pp.service_category AS pp_service_category,
             pp.experience_years AS pp_experience_years,
             pp.city AS pp_city,
             pp.state AS pp_state,
             pp.website_url AS pp_website_url,
             pp.portfolio_url AS pp_portfolio_url,
             w.balance AS w_build_points
      FROM users u
      LEFT JOIN business_profiles bp ON u.id = bp.user_id
      LEFT JOIN professional_profiles pp ON u.id = pp.user_id
      LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
      WHERE UPPER(bp.gst_number) = $1
    `;
    const res = await pgPool.query(query, [cleanGst]);
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0], 'getUserByGst');
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u: any) => u.gstNumber?.toUpperCase() === cleanGst);
    if (!user) return null;
    return mapRowToUser(enrichUserWithProfiles(user, db, 'getUserByGst'), 'getUserByGst');
  }
}

/**
 * Retrieves a user by their unique ID.
 * 
 * @param {string} id - The user ID to look up.
 * @returns {Promise<User | null>} The user if found, otherwise null.
 */
export async function getUserById(id: string): Promise<User | null> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT u.id, u.created_at, u.updated_at, u.name, u.full_name, u.email, u.phone, u.phone_number, u.password_hash, u.password_salt, u.role, u.email_verified, u.customer_type,
             bp.company_name AS bp_company_name,
             bp.gst_number AS bp_gst_number,
             pp.service_category AS pp_service_category,
             pp.experience_years AS pp_experience_years,
             pp.city AS pp_city,
             pp.state AS pp_state,
             pp.website_url AS pp_website_url,
             pp.portfolio_url AS pp_portfolio_url,
             w.balance AS w_build_points
      FROM users u
      LEFT JOIN business_profiles bp ON u.id = bp.user_id
      LEFT JOIN professional_profiles pp ON u.id = pp.user_id
      LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
      WHERE u.id = $1
    `;
    const res = await pgPool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return mapRowToUser(res.rows[0], 'getUserById');
  } else {
    const db = await readJsonDb();
    if (!db.users) return null;
    const user = db.users.find((u: any) => u.id === id);
    if (!user) return null;
    return mapRowToUser(enrichUserWithProfiles(user, db, 'getUserById'), 'getUserById');
  }
}

/**
 * Updates an existing user's profile information.
 * Automatically synchronizes redundant/legacy field forms (name/fullName/full_name, phone/phoneNumber/phone_number).
 * 
 * @param {string} id - Unique identifier of the user to update.
 * @param {Partial<User>} updates - Subset of User properties to modify.
 * @returns {Promise<User | null>} The updated user record, or null if not found.
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const finalUpdates = { ...updates };
  if (finalUpdates.name && !finalUpdates.full_name && !finalUpdates.fullName) {
    finalUpdates.full_name = finalUpdates.name;
    finalUpdates.fullName = finalUpdates.name;
  }
  if (finalUpdates.fullName && !finalUpdates.full_name) {
    finalUpdates.full_name = finalUpdates.fullName;
  }
  if (finalUpdates.full_name && !finalUpdates.fullName) {
    finalUpdates.fullName = finalUpdates.full_name;
  }
  if (finalUpdates.phone && !finalUpdates.phone_number && !finalUpdates.phoneNumber) {
    finalUpdates.phone_number = finalUpdates.phone;
    finalUpdates.phoneNumber = finalUpdates.phone;
  }
  if (finalUpdates.phoneNumber && !finalUpdates.phone_number) {
    finalUpdates.phone_number = finalUpdates.phoneNumber;
  }
  if (finalUpdates.phone_number && !finalUpdates.phoneNumber) {
    finalUpdates.phoneNumber = finalUpdates.phone_number;
  }
  finalUpdates.updated_at = new Date().toISOString();



  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const [key, val] of Object.entries(finalUpdates)) {
        let colName = key;
        if (key === 'passwordHash') colName = 'password_hash';
        else if (key === 'passwordSalt') colName = 'password_salt';
        else if (key === 'fullName') colName = 'full_name';
        else if (key === 'phoneNumber') colName = 'phone_number';
        else if (key === 'emailVerified') colName = 'email_verified';
        else if (key === 'createdAt') colName = 'created_at';
        else if (key === 'updatedAt') colName = 'updated_at';
        else if (key === 'customerType') colName = 'customer_type';

        // Omit legacy columns from the base users table update list
        const legacyBaseCols = ['companyName', 'company_name', 'gstNumber', 'gst_number', 'serviceCategory', 'service_category', 'experience', 'city', 'state', 'website', 'portfolioUrl', 'portfolio_url', 'buildPoints', 'build_points'];
        if (legacyBaseCols.includes(key) || legacyBaseCols.includes(colName)) {
          continue;
        }

        fields.push(`${colName} = $${idx}`);
        values.push(val === undefined ? null : val);
        idx++;
      }
      
      if (fields.length > 0) {
        values.push(id);
        const query = `
          UPDATE users
          SET ${fields.join(', ')}
          WHERE id = $${idx}
        `;
        await client.query(query, values);
      }

      // Upsert individual profiles if name/phone updated
      const fullName = finalUpdates.fullName || finalUpdates.full_name || finalUpdates.name;
      const altPhone = finalUpdates.phoneNumber || finalUpdates.phone_number || finalUpdates.phone;
      if (fullName || altPhone) {
        await client.query(`
          INSERT INTO individual_profiles (user_id, full_name, alternate_phone, updated_at)
          VALUES ($1, COALESCE($2, 'User'), $3, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET 
            full_name = COALESCE(EXCLUDED.full_name, individual_profiles.full_name),
            alternate_phone = COALESCE(EXCLUDED.alternate_phone, individual_profiles.alternate_phone),
            updated_at = CURRENT_TIMESTAMP
        `, [id, fullName || null, altPhone || null]);
      }

      // Upsert business profiles
      if (finalUpdates.companyName || finalUpdates.gstNumber) {
        await client.query(`
          INSERT INTO business_profiles (user_id, company_name, gst_number, updated_at)
          VALUES ($1, COALESCE($2, 'Generic Corp'), COALESCE($3, '29ABCDE1234F1Z5'), CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET 
            company_name = COALESCE(EXCLUDED.company_name, business_profiles.company_name),
            gst_number = COALESCE(EXCLUDED.gst_number, business_profiles.gst_number),
            updated_at = CURRENT_TIMESTAMP
        `, [id, finalUpdates.companyName || null, finalUpdates.gstNumber || null]);
      }

      // Upsert professional profiles
      if (finalUpdates.serviceCategory || finalUpdates.experience || finalUpdates.city || finalUpdates.state || finalUpdates.website || finalUpdates.portfolioUrl) {
        const expYears = finalUpdates.experience ? parseInt(finalUpdates.experience, 10) || 0 : null;
        await client.query(`
          INSERT INTO professional_profiles (user_id, service_category, experience_years, city, state, website_url, portfolio_url, updated_at)
          VALUES ($1, COALESCE($2, 'General'), COALESCE($3, 0), COALESCE($4, 'Unknown'), COALESCE($5, 'Unknown'), $6, $7, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET 
            service_category = COALESCE(EXCLUDED.service_category, professional_profiles.service_category),
            experience_years = COALESCE(EXCLUDED.experience_years, professional_profiles.experience_years),
            city = COALESCE(EXCLUDED.city, professional_profiles.city),
            state = COALESCE(EXCLUDED.state, professional_profiles.state),
            website_url = COALESCE(EXCLUDED.website_url, professional_profiles.website_url),
            portfolio_url = COALESCE(EXCLUDED.portfolio_url, professional_profiles.portfolio_url),
            updated_at = CURRENT_TIMESTAMP
        `, [id, finalUpdates.serviceCategory || null, expYears, finalUpdates.city || null, finalUpdates.state || null, finalUpdates.website || null, finalUpdates.portfolioUrl || null]);
      }

      // Upsert buildpoints wallet balance
      if (finalUpdates.buildPoints !== undefined && finalUpdates.buildPoints !== null) {
        await client.query(`
          INSERT INTO buildpoints_wallets (user_id, balance, tier, lifetime_points_accumulated, updated_at)
          VALUES ($1, $2, 'BRONZE', $2, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET 
            balance = EXCLUDED.balance,
            lifetime_points_accumulated = GREATEST(buildpoints_wallets.lifetime_points_accumulated, EXCLUDED.lifetime_points_accumulated),
            updated_at = CURRENT_TIMESTAMP
        `, [id, finalUpdates.buildPoints]);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    return await getUserById(id);
  } else {
    const db = await readJsonDb();
    const userIdx = db.users.findIndex((u: any) => u.id === id);
    if (userIdx === -1) return null;
    const existing = db.users[userIdx];
    
    // Construct cleaned updates for user table (no legacy fields)
    const userUpdates = { ...finalUpdates };
    const legacyKeys = ['companyName', 'gstNumber', 'serviceCategory', 'experience', 'city', 'state', 'website', 'portfolioUrl', 'buildPoints', 'company_name', 'gst_number', 'service_category', 'portfolio_url', 'build_points'];
    for (const key of legacyKeys) {
      delete (userUpdates as any)[key];
    }
    
    const updatedUser = {
      ...existing,
      ...userUpdates
    };
    db.users[userIdx] = updatedUser;

    // JSON DB Sync profiles
    if (!db.individual_profiles) db.individual_profiles = [];
    if (!db.business_profiles) db.business_profiles = [];
    if (!db.professional_profiles) db.professional_profiles = [];
    if (!db.buildpoints_wallets) db.buildpoints_wallets = [];

    const ipIdx = db.individual_profiles.findIndex((p: any) => p.userId === id);
    const fullName = finalUpdates.fullName || finalUpdates.full_name || finalUpdates.name;
    const altPhone = finalUpdates.phoneNumber || finalUpdates.phone_number || finalUpdates.phone;
    if (ipIdx !== -1) {
      if (fullName) db.individual_profiles[ipIdx].fullName = fullName;
      if (altPhone) db.individual_profiles[ipIdx].alternatePhone = altPhone;
      db.individual_profiles[ipIdx].updatedAt = new Date().toISOString();
    } else if (fullName || altPhone) {
      db.individual_profiles.push({
        userId: id,
        fullName: fullName || 'User',
        alternatePhone: altPhone || '',
        preferredLanguage: 'English',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const bpIdx = db.business_profiles.findIndex((p: any) => p.userId === id);
    if (bpIdx !== -1) {
      if (finalUpdates.companyName) db.business_profiles[bpIdx].companyName = finalUpdates.companyName;
      if (finalUpdates.gstNumber) db.business_profiles[bpIdx].gstNumber = finalUpdates.gstNumber;
      db.business_profiles[bpIdx].updatedAt = new Date().toISOString();
    } else if (finalUpdates.companyName || finalUpdates.gstNumber) {
      db.business_profiles.push({
        userId: id,
        companyName: finalUpdates.companyName || 'Generic Corp',
        gstNumber: finalUpdates.gstNumber || '29ABCDE1234F1Z5',
        verificationStatus: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const ppIdx = db.professional_profiles.findIndex((p: any) => p.userId === id);
    if (ppIdx !== -1) {
      if (finalUpdates.serviceCategory) db.professional_profiles[ppIdx].serviceCategory = finalUpdates.serviceCategory;
      if (finalUpdates.experience) db.professional_profiles[ppIdx].experienceYears = parseInt(finalUpdates.experience, 10) || 0;
      if (finalUpdates.city) db.professional_profiles[ppIdx].city = finalUpdates.city;
      if (finalUpdates.state) db.professional_profiles[ppIdx].state = finalUpdates.state;
      if (finalUpdates.website) db.professional_profiles[ppIdx].websiteUrl = finalUpdates.website;
      if (finalUpdates.portfolioUrl) db.professional_profiles[ppIdx].portfolioUrl = finalUpdates.portfolioUrl;
      db.professional_profiles[ppIdx].updatedAt = new Date().toISOString();
    } else if (finalUpdates.serviceCategory || finalUpdates.experience || finalUpdates.city || finalUpdates.state) {
      db.professional_profiles.push({
        userId: id,
        serviceCategory: finalUpdates.serviceCategory || 'General',
        experienceYears: parseInt(finalUpdates.experience || '0', 10) || 0,
        city: finalUpdates.city || 'Unknown',
        state: finalUpdates.state || 'Unknown',
        websiteUrl: finalUpdates.website || '',
        portfolioUrl: finalUpdates.portfolioUrl || '',
        verificationStatus: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const wIdx = db.buildpoints_wallets.findIndex((w: any) => w.userId === id);
    if (wIdx !== -1) {
      if (finalUpdates.buildPoints !== undefined) {
        db.buildpoints_wallets[wIdx].balance = finalUpdates.buildPoints;
        db.buildpoints_wallets[wIdx].lifetimePointsAccumulated = Math.max(db.buildpoints_wallets[wIdx].lifetimePointsAccumulated, finalUpdates.buildPoints);
        db.buildpoints_wallets[wIdx].updatedAt = new Date().toISOString();
      }
    } else if (finalUpdates.buildPoints !== undefined) {
      db.buildpoints_wallets.push({
        userId: id,
        balance: finalUpdates.buildPoints,
        tier: 'BRONZE',
        lifetimePointsAccumulated: finalUpdates.buildPoints,
        updatedAt: new Date().toISOString()
      });
    }

    await writeJsonDb(db);
    return await getUserById(id);
  }
}

/**
 * Removes a user record by email address.
 * 
 * @param {string} email - Email address of the user to delete.
 * @returns {Promise<boolean>} True if user was deleted, false otherwise.
 */
export async function deleteUserByEmail(email: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    if (!db.users) return false;
    const initialLen = db.users.length;
    db.users = db.users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
    if (db.users.length !== initialLen) {
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}

/**
 * Removes a user record by GSTIN.
 * 
 * @param {string} gstNumber - GSTIN of the user/business account to delete.
 * @returns {Promise<boolean>} True if user was deleted, false otherwise.
 */
export async function deleteUserByGst(gstNumber: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('DELETE FROM users WHERE id IN (SELECT user_id FROM business_profiles WHERE gst_number = $1)', [gstNumber]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    if (!db.users) return false;
    const initialLen = db.users.length;
    // Delete in JSON DB
    const bp = db.business_profiles?.find((p: any) => p.gstNumber?.toUpperCase() === gstNumber.toUpperCase());
    const targetUserId = bp?.userId;
    if (targetUserId) {
      db.users = db.users.filter((u: any) => u.id !== targetUserId);
      db.business_profiles = db.business_profiles.filter((p: any) => p.userId !== targetUserId);
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}

/**
 * Saves/registers a verification OTP record for authentication purposes.
 * 
 * @param {OtpRecord} otp - OTP tracking record details.
 * @returns {Promise<OtpRecord>} The created OTP record.
 */
export async function addOtp(otp: OtpRecord): Promise<OtpRecord> {
  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO otps (id, user_id, otp_hash, expires_at, attempts, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      otp.id,
      otp.userId,
      otp.otpHash,
      new Date(otp.expiresAt),
      otp.attempts,
      new Date(otp.createdAt)
    ];
    await pgPool.query(query, values);
    return otp;
  } else {
    const db = await readJsonDb();
    if (!db.otps) {
      db.otps = [];
    }
    db.otps.push(otp);
    await writeJsonDb(db);
    return otp;
  }
}

/**
 * Retrieves the latest active OTP verification record for a user.
 * 
 * @param {string} userId - Unique identifier of the user.
 * @returns {Promise<OtpRecord | null>} The latest OTP record, or null if none exist.
 */
export async function getOtpByUserId(userId: string): Promise<OtpRecord | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('SELECT * FROM otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      otpHash: row.otp_hash,
      expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : new Date(row.expires_at).toISOString(),
      attempts: row.attempts,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()
    };
  } else {
    const db = await readJsonDb();
    if (!db.otps) return null;
    const userOtps = db.otps.filter((o: any) => o.userId === userId);
    if (userOtps.length === 0) return null;
    userOtps.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userOtps[0];
  }
}

/**
 * Increments the incorrect verification code attempt count on an OTP token.
 * 
 * @param {string} id - Unique identifier of the OTP record.
 * @returns {Promise<number>} The updated attempt count.
 */
export async function incrementOtpAttempts(id: string): Promise<number> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts', [id]);
    if (res.rows.length === 0) return 0;
    return res.rows[0].attempts;
  } else {
    const db = await readJsonDb();
    if (!db.otps) return 0;
    const idx = db.otps.findIndex((o: any) => o.id === id);
    if (idx === -1) return 0;
    db.otps[idx].attempts += 1;
    await writeJsonDb(db);
    return db.otps[idx].attempts;
  }
}

/**
 * Deletes an OTP record by ID.
 * 
 * @param {string} id - Unique identifier of the OTP token.
 * @returns {Promise<void>}
 */
export async function deleteOtp(id: string): Promise<void> {
  if (usePostgres && pgPool) {
    await pgPool.query('DELETE FROM otps WHERE id = $1', [id]);
  } else {
    const db = await readJsonDb();
    if (!db.otps) return;
    db.otps = db.otps.filter((o: any) => o.id !== id);
    await writeJsonDb(db);
  }
}

/**
 * Deletes all OTP verification codes issued to a specific user.
 * 
 * @param {string} userId - Unique identifier of the user.
 * @returns {Promise<void>}
 */
export async function deleteOtpsByUserId(userId: string): Promise<void> {
  if (usePostgres && pgPool) {
    await pgPool.query('DELETE FROM otps WHERE user_id = $1', [userId]);
  } else {
    const db = await readJsonDb();
    if (!db.otps) return;
    db.otps = db.otps.filter((o: any) => o.userId !== userId);
    await writeJsonDb(db);
  }
}

/**
 * Retrieves all registered users in the platform.
 * Computes lifetime stats: orderCount, rfqCount, and lifetimeValue (LTV) for each user.
 * 
 * @returns {Promise<User[]>} Array of all users with computed stats.
 */
export async function getAllUsers(): Promise<User[]> {
  let usersList: User[] = [];
  if (usePostgres && pgPool) {
    const query = `
      SELECT u.id, u.created_at, u.updated_at, u.name, u.full_name, u.email, u.phone, u.phone_number, u.password_hash, u.password_salt, u.role, u.email_verified, u.customer_type,
             bp.company_name AS bp_company_name,
             bp.gst_number AS bp_gst_number,
             pp.service_category AS pp_service_category,
             pp.experience_years AS pp_experience_years,
             pp.city AS pp_city,
             pp.state AS pp_state,
             pp.website_url AS pp_website_url,
             pp.portfolio_url AS pp_portfolio_url,
             w.balance AS w_build_points
      FROM users u
      LEFT JOIN business_profiles bp ON u.id = bp.user_id
      LEFT JOIN professional_profiles pp ON u.id = pp.user_id
      LEFT JOIN buildpoints_wallets w ON u.id = w.user_id
      ORDER BY u.created_at DESC
    `;
    const res = await pgPool.query(query);
    usersList = res.rows.map(row => mapRowToUser(row, 'getAllUsers'));
  } else {
    const db = await readJsonDb();
    usersList = (db.users || []).map((u: any) => mapRowToUser(enrichUserWithProfiles(u, db, 'getAllUsers'), 'getAllUsers'));
  }

  // To compute LTV and order counts:
  // Fetch all orders and RFQs dynamically to prevent circular imports
  const { getAllOrders } = require('../orders/OrderService');
  const { getAllRfqs } = require('../rfq/RFQService');

  try {
    const orders = await getAllOrders();
    const rfqs = await getAllRfqs();

    return usersList.map(u => {
      const userOrders = orders.filter((o: any) => o.userId === u.id);
      const activeOrders = userOrders.filter((o: any) => o.status !== 'Cancelled');
      
      const orderCount = userOrders.length;
      const rfqCount = rfqs.filter((r: any) => r.buyerId === u.id).length;
      
      const lifetimeValue = activeOrders.reduce((sum: number, o: any) => {
        const amt = typeof o.amount === 'number' ? o.amount : parseFloat(String(o.amount).replace(/[^\d.]/g, '')) || 0;
        return sum + amt;
      }, 0);

      return {
        ...u,
        orderCount,
        rfqCount,
        lifetimeValue
      };
    });
  } catch (err) {
    console.error('Error calculating user metrics in getAllUsers:', err);
    return usersList.map(u => ({
      ...u,
      orderCount: 0,
      rfqCount: 0,
      lifetimeValue: 0
    }));
  }
}


