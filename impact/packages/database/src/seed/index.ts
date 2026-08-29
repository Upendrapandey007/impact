import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/index';

/**
 * Seed Script for Impact Platform
 * Populates a complete higher education ecosystem for "Apex State University".
 */
export async function seedDatabase(connectionString?: string) {
  const dbUrl =
    connectionString ??
    process.env['DATABASE_URL'] ??
    'postgresql://postgres:postgres@localhost:5432/impact';

  console.log(`🌱 Connecting to database at ${dbUrl.replace(/:[^:@]+@/, ':****@')}...`);

  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log('🧹 Cleaning existing seed data...');
    // Delete in reverse FK order
    await db.delete(schema.impacts);
    await db.delete(schema.simulations);
    await db.delete(schema.scenarios);
    await db.delete(schema.opportunities);
    await db.delete(schema.opportunitySources);
    await db.delete(schema.rules);
    await db.delete(schema.policyChunks);
    await db.delete(schema.policyVersions);
    await db.delete(schema.policies);
    await db.delete(schema.sapRecords);
    await db.delete(schema.scholarships);
    await db.delete(schema.financialAidAwards);
    await db.delete(schema.academicRecords);
    await db.delete(schema.enrollments);
    await db.delete(schema.courses);
    await db.delete(schema.students);
    await db.delete(schema.programs);
    await db.delete(schema.terms);
    await db.delete(schema.users);
    await db.delete(schema.institutions);

    // ─── 1. Institution ───────────────────────────────────────────────────────
    console.log('🏛️ Creating Apex State University...');
    const [institution] = await db
      .insert(schema.institutions)
      .values({
        name: 'Apex State University',
        slug: 'apex-state',
        domain: 'apex.edu',
        settings: {
          riskThresholds: { critical: 80, high: 55, moderate: 30 },
          defaultDataRetentionDays: 2555, // 7 years
        },
        branding: {
          primaryColor: '#4f46e5',
          logoUrl: '/assets/apex-logo.svg',
          institutionFullName: 'Apex State University System',
        },
        isActive: true,
      })
      .returning();

    const institutionId = institution.id;

    // ─── 2. Users ─────────────────────────────────────────────────────────────
    console.log('👥 Creating users (advisors, students, admins)...');
    const [adminUser, advisorUser, faoUser, studentUser1, studentUser2, studentUser3] = await db
      .insert(schema.users)
      .values([
        {
          institutionId,
          email: 'admin@apex.edu',
          name: 'Eleanor Vance',
          role: 'admin',
          isActive: true,
        },
        {
          institutionId,
          email: 'advisor.smith@apex.edu',
          name: 'Dr. Jane Smith',
          role: 'advisor',
          isActive: true,
        },
        {
          institutionId,
          email: 'fao.miller@apex.edu',
          name: 'Marcus Miller',
          role: 'financial_aid_officer',
          isActive: true,
        },
        {
          institutionId,
          email: 'alex.brown@apex.edu',
          name: 'Alex Brown',
          role: 'student',
          isActive: true,
        },
        {
          institutionId,
          email: 'sarah.kim@apex.edu',
          name: 'Sarah Kim',
          role: 'student',
          isActive: true,
        },
        {
          institutionId,
          email: 'john.doe@apex.edu',
          name: 'John Doe',
          role: 'student',
          isActive: true,
        },
      ])
      .returning();

    // ─── 3. Academic Programs ─────────────────────────────────────────────────
    console.log('🎓 Creating academic programs...');
    const [csProgram, bioProgram, bbaProgram] = await db
      .insert(schema.programs)
      .values([
        {
          institutionId,
          code: 'CS',
          name: 'Computer Science',
          degreeType: 'BS',
          totalCredits: 120,
          isActive: true,
        },
        {
          institutionId,
          code: 'BIO',
          name: 'Biological Sciences',
          degreeType: 'BS',
          totalCredits: 120,
          isActive: true,
        },
        {
          institutionId,
          code: 'BBA',
          name: 'Business Administration',
          degreeType: 'BBA',
          totalCredits: 120,
          isActive: true,
        },
      ])
      .returning();

    // ─── 4. Terms ─────────────────────────────────────────────────────────────
    console.log('📅 Creating academic terms...');
    const [fall2026, spring2027] = await db
      .insert(schema.terms)
      .values([
        {
          institutionId,
          code: '2026FA',
          name: 'Fall 2026',
          startDate: '2026-08-24',
          endDate: '2026-12-18',
          addDeadline: '2026-09-08',
          dropDeadline: '2026-09-22',
          withdrawalDeadline: '2026-10-30',
          isCurrent: true,
        },
        {
          institutionId,
          code: '2027SP',
          name: 'Spring 2027',
          startDate: '2027-01-18',
          endDate: '2027-05-14',
          addDeadline: '2027-02-01',
          dropDeadline: '2027-02-15',
          withdrawalDeadline: '2027-03-26',
          isCurrent: false,
        },
      ])
      .returning();

    // ─── 5. Courses ───────────────────────────────────────────────────────────
    console.log('📚 Creating course catalog...');
    const courseRows = await db
      .insert(schema.courses)
      .values([
        {
          institutionId,
          code: 'BIO201',
          title: 'Introduction to Biology',
          credits: '3.00',
          department: 'Biology',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'BIO201L',
          title: 'Introduction to Biology Lab',
          credits: '1.00',
          department: 'Biology',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'CHEM202',
          title: 'Organic Chemistry',
          credits: '4.00',
          department: 'Chemistry',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'CS201',
          title: 'Discrete Structures',
          credits: '3.00',
          department: 'Computer Science',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'CS301',
          title: 'Data Structures and Algorithms',
          credits: '3.00',
          department: 'Computer Science',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'CS401',
          title: 'Senior Capstone Project',
          credits: '3.00',
          department: 'Computer Science',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'MATH201',
          title: 'Calculus II',
          credits: '3.00',
          department: 'Mathematics',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'ENG101',
          title: 'Technical and Academic Writing',
          credits: '3.00',
          department: 'English',
          isRepeatable: false,
          isActive: true,
        },
        {
          institutionId,
          code: 'ECON101',
          title: 'Principles of Microeconomics',
          credits: '3.00',
          department: 'Economics',
          isRepeatable: false,
          isActive: true,
        },
      ])
      .returning();

    const courseMap = new Map(courseRows.map((c) => [c.code, c]));

    // ─── 6. Students ──────────────────────────────────────────────────────────
    console.log('🧑‍🎓 Creating student records...');
    const [alex, sarah, john] = await db
      .insert(schema.students)
      .values([
        {
          institutionId,
          userId: studentUser1.id,
          studentNumber: 'STU-1001',
          programId: csProgram.id,
          level: 'junior',
          enrollmentStatus: 'full_time',
          expectedGraduation: '2027-05-15',
          advisorId: advisorUser.id,
          isActive: true,
        },
        {
          institutionId,
          userId: studentUser2.id,
          studentNumber: 'STU-1002',
          programId: bioProgram.id,
          level: 'sophomore',
          enrollmentStatus: 'full_time',
          expectedGraduation: '2028-05-15',
          advisorId: advisorUser.id,
          isActive: true,
        },
        {
          institutionId,
          userId: studentUser3.id,
          studentNumber: 'STU-1003',
          programId: bbaProgram.id,
          level: 'senior',
          enrollmentStatus: 'half_time',
          expectedGraduation: '2026-12-18',
          advisorId: advisorUser.id,
          isActive: true,
        },
      ])
      .returning();

    // ─── 7. Enrollments ───────────────────────────────────────────────────────
    console.log('📝 Creating enrollments for current term...');
    await db.insert(schema.enrollments).values([
      // Alex Brown: 5 courses = 15 credits
      {
        institutionId,
        studentId: alex.id,
        courseId: courseMap.get('BIO201')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: alex.id,
        courseId: courseMap.get('CS301')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: alex.id,
        courseId: courseMap.get('MATH201')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: alex.id,
        courseId: courseMap.get('ENG101')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: alex.id,
        courseId: courseMap.get('CS201')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },

      // Sarah Kim: 4 courses = 11 credits
      {
        institutionId,
        studentId: sarah.id,
        courseId: courseMap.get('BIO201')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: sarah.id,
        courseId: courseMap.get('BIO201L')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '1.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: sarah.id,
        courseId: courseMap.get('CHEM202')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '4.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: sarah.id,
        courseId: courseMap.get('ENG101')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },

      // John Doe: 2 courses = 6 credits
      {
        institutionId,
        studentId: john.id,
        courseId: courseMap.get('ECON101')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
      {
        institutionId,
        studentId: john.id,
        courseId: courseMap.get('ENG101')!.id,
        termId: fall2026.id,
        status: 'enrolled',
        creditsAttempted: '3.00',
        creditsEarned: '0.00',
      },
    ]);

    // ─── 8. Academic Records ──────────────────────────────────────────────────
    console.log('📊 Creating academic records...');
    await db.insert(schema.academicRecords).values([
      {
        institutionId,
        studentId: alex.id,
        termId: fall2026.id,
        termGpa: '3.210',
        cumulativeGpa: '3.180',
        creditsAttempted: '78.00',
        creditsEarned: '75.00',
        creditsEnrolled: '15.00',
        totalCreditsCompleted: '75.00',
        standing: 'good',
      },
      {
        institutionId,
        studentId: sarah.id,
        termId: fall2026.id,
        termGpa: '3.750',
        cumulativeGpa: '3.650',
        creditsAttempted: '45.00',
        creditsEarned: '45.00',
        creditsEnrolled: '11.00',
        totalCreditsCompleted: '45.00',
        standing: 'good',
      },
      {
        institutionId,
        studentId: john.id,
        termId: fall2026.id,
        termGpa: '2.400',
        cumulativeGpa: '2.350',
        creditsAttempted: '102.00',
        creditsEarned: '96.00',
        creditsEnrolled: '6.00',
        totalCreditsCompleted: '96.00',
        standing: 'good',
      },
    ]);

    // ─── 9. Financial Aid Awards ──────────────────────────────────────────────
    console.log('💰 Creating financial aid packages...');
    await db.insert(schema.financialAidAwards).values([
      // Alex Brown Aid: $9,500 total
      {
        institutionId,
        studentId: alex.id,
        termId: fall2026.id,
        aidType: 'PELL',
        source: 'Federal',
        name: 'Federal Pell Grant',
        amount: '3500.00',
        status: 'disbursed',
        conditions: [
          {
            type: 'enrollment_status',
            value: 'half_time',
            description: 'Must maintain at least half-time enrollment (>= 6 credits)',
          },
        ],
      },
      {
        institutionId,
        studentId: alex.id,
        termId: fall2026.id,
        aidType: 'SCHOLARSHIP',
        source: 'Institutional',
        name: 'University Merit Scholarship',
        amount: '2500.00',
        status: 'disbursed',
        conditions: [
          {
            type: 'min_credits',
            value: 15,
            description: 'Must maintain full-time enrollment of at least 15 credits per semester',
          },
          {
            type: 'min_gpa',
            value: 3.0,
            description: 'Must maintain minimum 3.0 cumulative GPA',
          },
        ],
      },
      {
        institutionId,
        studentId: alex.id,
        termId: fall2026.id,
        aidType: 'LOAN_SUB',
        source: 'Federal',
        name: 'Direct Subsidized Loan',
        amount: '1750.00',
        status: 'disbursed',
        conditions: [],
      },
      {
        institutionId,
        studentId: alex.id,
        termId: fall2026.id,
        aidType: 'GRANT',
        source: 'State',
        name: 'State Opportunity Grant',
        amount: '1750.00',
        status: 'disbursed',
        conditions: [],
      },

      // Sarah Kim Aid: $6,500 total
      {
        institutionId,
        studentId: sarah.id,
        termId: fall2026.id,
        aidType: 'SCHOLARSHIP',
        source: 'Institutional',
        name: 'Apex STEM Excellence Award',
        amount: '3000.00',
        status: 'disbursed',
        conditions: [
          {
            type: 'min_credits',
            value: 12,
            description: 'Must maintain full-time enrollment (>= 12 credits)',
          },
        ],
      },
      {
        institutionId,
        studentId: sarah.id,
        termId: fall2026.id,
        aidType: 'PELL',
        source: 'Federal',
        name: 'Federal Pell Grant',
        amount: '3500.00',
        status: 'disbursed',
        conditions: [],
      },
    ]);

    // ─── 10. Scholarships ─────────────────────────────────────────────────────
    console.log('🏆 Registering institutional scholarships...');
    await db.insert(schema.scholarships).values([
      {
        institutionId,
        name: 'University Merit Scholarship',
        amount: '2500.00',
        renewable: true,
        conditions: [
          { type: 'min_credits', value: 15, description: 'Requires >= 15 credits per term' },
          { type: 'min_gpa', value: 3.0, description: 'Requires >= 3.00 GPA' },
        ],
        isActive: true,
      },
      {
        institutionId,
        name: 'Apex STEM Excellence Award',
        amount: '3000.00',
        renewable: true,
        conditions: [
          { type: 'min_credits', value: 12, description: 'Requires >= 12 credits per term' },
          { type: 'min_gpa', value: 3.5, description: 'Requires >= 3.50 GPA' },
          { type: 'program', value: 'CS,BIO', description: 'Restricted to STEM majors' },
        ],
        isActive: true,
      },
    ]);

    // ─── 11. SAP Records ──────────────────────────────────────────────────────
    console.log('🛡️ Creating SAP compliance records...');
    await db.insert(schema.sapRecords).values([
      {
        institutionId,
        studentId: alex.id,
        termId: fall2026.id,
        status: 'satisfactory',
        paceRate: '0.9615', // 75 / 78
        maxTimeframePct: '0.6500',
        qualitativeGpa: '3.180',
        isAppealApproved: false,
      },
      {
        institutionId,
        studentId: sarah.id,
        termId: fall2026.id,
        status: 'satisfactory',
        paceRate: '1.0000', // 45 / 45
        maxTimeframePct: '0.3750',
        qualitativeGpa: '3.650',
        isAppealApproved: false,
      },
      {
        institutionId,
        studentId: john.id,
        termId: fall2026.id,
        status: 'warning',
        paceRate: '0.9411', // 96 / 102
        maxTimeframePct: '0.8500',
        qualitativeGpa: '2.350',
        isAppealApproved: false,
        notes: 'Approaching maximum timeframe for BBA program.',
      },
    ]);

    // ─── 12. Policies & Policy Versions ───────────────────────────────────────
    console.log('📜 Ingesting institutional policies...');
    const [faPolicy, schPolicy, sapPolicy] = await db
      .insert(schema.policies)
      .values([
        {
          institutionId,
          name: '2026–27 Financial Aid Policy Handbook',
          type: 'financial_aid',
          description: 'Federal and institutional aid guidelines, credit minimums, and disbursement rules.',
          ownerOffice: 'Office of Student Financial Aid',
          isActive: true,
        },
        {
          institutionId,
          name: '2026–27 Institutional Scholarship Policy',
          type: 'scholarship',
          description: 'Merit and departmental scholarship renewal criteria.',
          ownerOffice: 'University Scholarship Committee',
          isActive: true,
        },
        {
          institutionId,
          name: '2026–27 Satisfactory Academic Progress (SAP) Standards',
          type: 'sap',
          description: 'Title IV federal compliance rules for qualitative GPA, quantitative pace rate, and max timeframe.',
          ownerOffice: 'Office of the Registrar',
          isActive: true,
        },
      ])
      .returning();

    const [faVersion, schVersion, sapVersion] = await db
      .insert(schema.policyVersions)
      .values([
        {
          institutionId,
          policyId: faPolicy.id,
          versionLabel: 'v2026.1',
          effectiveFrom: '2026-08-01',
          effectiveTo: '2027-07-31',
          status: 'active',
          uploadedBy: adminUser.id,
          approvedBy: adminUser.id,
          approvedAt: new Date(),
        },
        {
          institutionId,
          policyId: schPolicy.id,
          versionLabel: 'v2026.1',
          effectiveFrom: '2026-08-01',
          effectiveTo: '2027-07-31',
          status: 'active',
          uploadedBy: adminUser.id,
          approvedBy: adminUser.id,
          approvedAt: new Date(),
        },
        {
          institutionId,
          policyId: sapPolicy.id,
          versionLabel: 'v2026.1',
          effectiveFrom: '2026-08-01',
          effectiveTo: '2027-07-31',
          status: 'active',
          uploadedBy: adminUser.id,
          approvedBy: adminUser.id,
          approvedAt: new Date(),
        },
      ])
      .returning();

    // ─── 13. Policy Rules ─────────────────────────────────────────────────────
    console.log('⚙️ Defining deterministic policy rules...');
    await db.insert(schema.rules).values([
      // Full-Time Enrollment Status Rule
      {
        institutionId,
        ruleCode: 'RULE-ENRL-001',
        policyVersionId: faVersion.id,
        type: 'enrollment_status',
        name: 'Full-time enrollment threshold (>= 12 credits)',
        description: 'Undergraduate students must maintain >= 12 enrolled credits to be classified as full-time.',
        priority: 10,
        status: 'active',
        effectiveFrom: '2026-08-01',
        effectiveTo: '2027-07-31',
        conditionJson: {
          type: 'field',
          field: 'creditsEnrolled',
          operator: '>=',
          value: 12,
        },
        resultJson: { status: 'full_time' },
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },

      // Half-Time Enrollment Status Rule
      {
        institutionId,
        ruleCode: 'RULE-ENRL-002',
        policyVersionId: faVersion.id,
        type: 'enrollment_status',
        name: 'Half-time enrollment threshold (6–11 credits)',
        description: 'Undergraduate students must maintain between 6 and 11 enrolled credits for half-time status.',
        priority: 20,
        status: 'active',
        effectiveFrom: '2026-08-01',
        effectiveTo: '2027-07-31',
        conditionJson: {
          type: 'and',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 6 },
            { type: 'field', field: 'creditsEnrolled', operator: '<', value: 12 },
          ],
        },
        resultJson: { status: 'half_time' },
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },

      // Merit Scholarship Rule (15 credits + 3.0 GPA)
      {
        institutionId,
        ruleCode: 'RULE-SCH-001',
        policyVersionId: schVersion.id,
        type: 'scholarship_eligibility',
        name: 'University Merit Scholarship credit and GPA renewal requirement',
        description: 'Recipients must be enrolled in at least 15 credits per semester and maintain a cumulative GPA >= 3.00.',
        priority: 30,
        status: 'active',
        effectiveFrom: '2026-08-01',
        effectiveTo: '2027-07-31',
        conditionJson: {
          type: 'and',
          conditions: [
            { type: 'field', field: 'creditsEnrolled', operator: '>=', value: 15 },
            { type: 'field', field: 'cumulativeGpa', operator: '>=', value: 3.0 },
          ],
        },
        resultJson: { eligible: true, scholarshipName: 'University Merit Scholarship', amount: 2500 },
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },

      // Pell Grant Rule (Half-time requirement)
      {
        institutionId,
        ruleCode: 'RULE-PELL-001',
        policyVersionId: faVersion.id,
        type: 'aid_eligibility',
        name: 'Pell Grant minimum enrollment eligibility',
        description: 'Pell Grant disbursement requires at least half-time (>= 6 credits) enrollment.',
        priority: 40,
        status: 'active',
        effectiveFrom: '2026-08-01',
        effectiveTo: '2027-07-31',
        conditionJson: {
          type: 'field',
          field: 'creditsEnrolled',
          operator: '>=',
          value: 6,
        },
        resultJson: { eligible: true, aidType: 'PELL' },
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },

      // SAP Quantitative (Pace Rate >= 67%)
      {
        institutionId,
        ruleCode: 'RULE-SAP-001',
        policyVersionId: sapVersion.id,
        type: 'sap_quantitative',
        name: 'SAP quantitative completion pace rate (>= 67%)',
        description: 'Students must successfully earn at least 67% of all cumulative attempted credit hours.',
        priority: 50,
        status: 'active',
        effectiveFrom: '2026-08-01',
        effectiveTo: '2027-07-31',
        conditionJson: {
          type: 'field',
          field: 'sapPaceRate',
          operator: '>=',
          value: 0.67,
        },
        resultJson: { sapQuantitative: 'satisfactory' },
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },

      // SAP Qualitative (GPA >= 2.0)
      {
        institutionId,
        ruleCode: 'RULE-SAP-002',
        policyVersionId: sapVersion.id,
        type: 'sap_qualitative',
        name: 'SAP qualitative minimum cumulative GPA (>= 2.00)',
        description: 'Students must maintain a cumulative GPA of at least 2.00.',
        priority: 60,
        status: 'active',
        effectiveFrom: '2026-08-01',
        effectiveTo: '2027-07-31',
        conditionJson: {
          type: 'field',
          field: 'cumulativeGpa',
          operator: '>=',
          value: 2.0,
        },
        resultJson: { sapQualitative: 'satisfactory' },
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
      },
    ]);

    // ─── 14. Opportunity Sources & Scraped Opportunities ──────────────────────
    console.log('💼 Seeding scraped campus jobs & alternative scholarships...');
    const [careerFeed, stateFeed] = await db
      .insert(schema.opportunitySources)
      .values([
        {
          institutionId,
          name: 'Apex Career Center Student Job Feed',
          sourceType: 'rss',
          targetUrl: 'https://careers.apex.edu/student-jobs.rss',
          robotsPolicyUrl: 'https://careers.apex.edu/robots.txt',
          rateLimitPerMin: 30,
          isActive: true,
          lastScrapedAt: new Date(),
          lastScrapeStatus: 'success',
        },
        {
          institutionId,
          name: 'State Higher Education Assistance Agency Grants',
          sourceType: 'public_api',
          targetUrl: 'https://heas.state.gov/api/v1/scholarships',
          rateLimitPerMin: 60,
          isActive: true,
          lastScrapedAt: new Date(),
          lastScrapeStatus: 'success',
        },
      ])
      .returning();

    await db.insert(schema.opportunities).values([
      {
        institutionId,
        sourceId: careerFeed.id,
        type: 'student_job',
        title: 'Computer Science Peer Tutor / Teaching Assistant',
        provider: 'Apex Department of Computer Science',
        description: 'Assist lower-division undergraduate students in CS 101 and CS 201 with labs and debugging.',
        amountOrWage: '$18.50 / hour (10-15 hrs/wk)',
        amountNumeric: '18.50',
        applicationDeadline: '2026-10-15',
        sourceUrl: 'https://careers.apex.edu/jobs/cs-peer-tutor-402',
        sourceDomain: 'careers.apex.edu',
        contentHash: 'hash-cs-tutor-402',
        isVerified: true,
        status: 'active',
        eligibilityCriteria: {
          minGpa: 3.0,
          requiredMajorCodes: ['CS'],
          minCreditsEnrolled: 6,
        },
        tags: ['tutoring', 'on-campus', 'computer science', 'flexible hours'],
        lastScrapedAt: new Date(),
      },
      {
        institutionId,
        sourceId: stateFeed.id,
        type: 'scholarship',
        title: 'State STEM Bridge Opportunity Grant',
        provider: 'State Department of Higher Education',
        description: 'Tuition assistance grant for full-time juniors and seniors majoring in STEM fields.',
        amountOrWage: '$2,000 / semester',
        amountNumeric: '2000.00',
        applicationDeadline: '2026-10-30',
        sourceUrl: 'https://heas.state.gov/scholarships/stem-bridge-2026',
        sourceDomain: 'heas.state.gov',
        contentHash: 'hash-stem-bridge-2026',
        isVerified: true,
        status: 'active',
        eligibilityCriteria: {
          minGpa: 3.0,
          minCreditsEnrolled: 12,
          requiredMajorCodes: ['CS', 'BIO'],
        },
        tags: ['state grant', 'stem', 'tuition assistance'],
        lastScrapedAt: new Date(),
      },
      {
        institutionId,
        sourceId: careerFeed.id,
        type: 'work_study',
        title: 'Campus Science Library Assistant',
        provider: 'Apex University Libraries',
        description: 'Circulation desk support, inventory maintenance, and study room scheduling in the Science Library.',
        amountOrWage: '$16.00 / hour (8-12 hrs/wk)',
        amountNumeric: '16.00',
        applicationDeadline: '2026-10-01',
        sourceUrl: 'https://careers.apex.edu/jobs/library-asst-109',
        sourceDomain: 'careers.apex.edu',
        contentHash: 'hash-lib-asst-109',
        isVerified: true,
        status: 'active',
        eligibilityCriteria: {
          minCreditsEnrolled: 6,
        },
        tags: ['work-study', 'library', 'quiet work environment'],
        lastScrapedAt: new Date(),
      },
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('─────────────────────────────────────────────');
    console.log('🎓 Institution: Apex State University (slug: apex-state)');
    console.log('🧑‍🎓 Seeded Student: Alex Brown (alex.brown@apex.edu) — 15 credits, $9,500 aid');
    console.log('🧑‍🎓 Seeded Student: Sarah Kim (sarah.kim@apex.edu) — 11 credits');
    console.log('🧑‍🎓 Seeded Student: John Doe (john.doe@apex.edu) — 6 credits');
    console.log('👩‍🏫 Seeded Advisor: Dr. Jane Smith (advisor.smith@apex.edu)');
    console.log('─────────────────────────────────────────────');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Allow direct execution: tsx src/seed/index.ts
if (require.main === module || process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
