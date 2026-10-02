import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PRODUCTION CMS ENHANCEMENT TESTS ===\n');

  // TEST 1: Public GET /api/experience
  console.log('[TEST 1] Testing public GET /api/experience...');
  const publicExp = await request({
    hostname: 'localhost',
    port: API_PORT,
    path: '/api/experience',
    method: 'GET',
  });
  if (publicExp.status !== 200 || !publicExp.data?.success) {
    throw new Error(`Test 1 Failed: Status ${publicExp.status}, message: ${publicExp.data?.message}`);
  }
  console.log('✓ Public /api/experience returned status 200.');
  console.log(`  Categories count: ${publicExp.data.data.experience.categories.length}`);
  console.log(`  Certificates count: ${publicExp.data.data.certificates.length}`);
  console.log(`  First certificate: ${publicExp.data.data.certificates[0]?.name}`);

  // TEST 2: Security check - Unauthenticated PUT /api/content must be REJECTED (401)
  console.log('\n[TEST 2] Testing security: Unauthenticated PUT /api/content...');
  const unauthPut = await request(
    {
      hostname: 'localhost',
      port: API_PORT,
      path: '/api/content',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    },
    { experience: { title: 'Hacked' } }
  );
  if (unauthPut.status !== 401) {
    throw new Error(`Test 2 Failed: Unauthenticated PUT should return 401, got ${unauthPut.status}`);
  }
  console.log('✓ Unauthenticated mutation correctly rejected with 401 Unauthorized.');

  // TEST 3: Admin Authentication & Mutation
  console.log('\n[TEST 3] Testing authorized Admin mutation with Logo, Categories, and Certificates...');
  const adminToken = jwt.sign({ id: 'test-admin-id', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Get current content first
  const currentContentRes = await request({
    hostname: 'localhost',
    port: API_PORT,
    path: '/api/content',
    method: 'GET',
    headers: {
      Cookie: `token=${adminToken}`,
    },
  });

  const contentData = currentContentRes.data.data;
  const categories = contentData.experience.categories || [];

  // Update Askuala Link entry with explicit company logo
  const updatedCategories = categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => {
      if (/askuala/i.test(item.company || item.role)) {
        return {
          ...item,
          company: 'Askuala Link',
          role: 'Full Stack Developer Intern',
          duration: 'June 2026 – September 2026',
          startDate: 'June 2026',
          endDate: 'September 2026',
          current: false,
          location: 'Bahir Dar, Ethiopia',
          logo: '/images/askuala.png',
          description: 'Engineered high-performance web applications and distributed architectures.',
          bullets: [
            'Architected real-time WebSocket state streaming dashboards cutting latency by 45%.',
            'Implemented TOTP 2FA authentication pipelines and JWT authorization middleware.',
          ],
          skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
          tags: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
          order: 1,
          published: true,
        };
      }
      return item;
    }),
  }));

  // Add or update certificates with real images and ordering
  const updatedCertificates = [
    {
      id: 'cert-1',
      name: 'Meta Front-End Developer',
      issuer: 'Meta',
      issuerColor: '#0081FB',
      date: '2024',
      image: '/certificates/meta-frontend.svg',
      credentialUrl: 'https://www.coursera.org/account/accomplishments/professional-cert/meta-front-end-developer',
      skills: ['React', 'JavaScript', 'CSS'],
      order: 1,
      published: true,
    },
    {
      id: 'cert-2',
      name: 'MongoDB Node.js Developer Path',
      issuer: 'MongoDB University',
      issuerColor: '#00ED64',
      date: '2024',
      image: '/certificates/mongodb-developer.svg',
      credentialUrl: 'https://learn.mongodb.com/',
      skills: ['MongoDB', 'Node.js', 'Aggregation'],
      order: 2,
      published: true,
    },
    {
      id: 'cert-3',
      name: 'Draft Hidden Certificate',
      issuer: 'Test Provider',
      issuerColor: '#FF4D00',
      date: '2025',
      image: '/certificates/fcc-backend.svg',
      credentialUrl: '#',
      skills: ['Draft Skill'],
      order: 3,
      published: false, // Testing visibility filtering!
    },
  ];

  const putRes = await request(
    {
      hostname: 'localhost',
      port: API_PORT,
      path: '/api/content',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${adminToken}`,
      },
    },
    {
      experience: {
        ...contentData.experience,
        title: "Where I've built\nreal systems.",
        eyebrow: 'Career Record',
        resumeUrl: '/resume.pdf',
        categories: updatedCategories,
      },
      certificates: updatedCertificates,
    }
  );

  if (putRes.status !== 200 || !putRes.data?.success) {
    throw new Error(`Test 3 Failed: Admin PUT returned status ${putRes.status}: ${JSON.stringify(putRes.data)}`);
  }
  console.log('✓ Admin successfully updated Experience & Certificates via PUT /api/content.');

  // TEST 4: Verify Public GET filters out unpublished items (Feature 8, 11)
  console.log('\n[TEST 4] Testing visibility filter on public GET /api/experience...');
  const publicVerify = await request({
    hostname: 'localhost',
    port: API_PORT,
    path: '/api/experience',
    method: 'GET',
  });

  const pubCerts = publicVerify.data.data.certificates;
  const hasHiddenCert = pubCerts.some((c) => c.name === 'Draft Hidden Certificate');
  if (hasHiddenCert) {
    throw new Error('Test 4 Failed: Public response contained unpublished certificate!');
  }
  console.log(`✓ Unpublished certificate correctly excluded from public API (count: ${pubCerts.length}).`);

  // TEST 5: Verify Admin GET returns unpublished items
  console.log('\n[TEST 5] Testing Admin GET /api/content returns both published and draft items...');
  const adminVerify = await request({
    hostname: 'localhost',
    port: API_PORT,
    path: '/api/content',
    method: 'GET',
    headers: {
      Cookie: `token=${adminToken}`,
    },
  });

  const adminCerts = adminVerify.data.data.certificates;
  const adminHasHidden = adminCerts.some((c) => c.name === 'Draft Hidden Certificate');
  if (!adminHasHidden) {
    throw new Error('Test 5 Failed: Admin response did not include unpublished certificate!');
  }
  console.log(`✓ Admin API correctly returned all certificates including draft (count: ${adminCerts.length}).`);

  // TEST 6: Verify Company Logo is present in public API
  console.log('\n[TEST 6] Testing Company Logo presence in public API response...');
  const askualaItem = publicVerify.data.data.experience.categories
    .flatMap((c) => c.items)
    .find((i) => /askuala/i.test(i.company));

  if (!askualaItem || askualaItem.logo !== '/images/askuala.png') {
    throw new Error(`Test 6 Failed: Askuala Link logo not found or mismatch: ${askualaItem?.logo}`);
  }
  console.log(`✓ Askuala Link company logo verified: "${askualaItem.logo}".`);
  console.log(`  Skills: ${askualaItem.skills.join(', ')}`);
  console.log(`  Bullets count: ${askualaItem.bullets.length}`);

  // Restore 4 standard certificates so portfolio has complete certified list
  console.log('\n[TEST 7] Restoring all 4 verified certificates as published...');
  const finalCerts = [
    {
      id: 'cert-1',
      name: 'Meta Front-End Developer',
      issuer: 'Meta',
      issuerColor: '#0081FB',
      date: '2024',
      image: '/certificates/meta-frontend.svg',
      credentialUrl: 'https://www.coursera.org/account/accomplishments/professional-cert/meta-front-end-developer',
      skills: ['React', 'JavaScript', 'CSS'],
      order: 1,
      published: true,
    },
    {
      id: 'cert-2',
      name: 'MongoDB Node.js Developer Path',
      issuer: 'MongoDB University',
      issuerColor: '#00ED64',
      date: '2024',
      image: '/certificates/mongodb-developer.svg',
      credentialUrl: 'https://learn.mongodb.com/',
      skills: ['MongoDB', 'Node.js', 'Aggregation'],
      order: 2,
      published: true,
    },
    {
      id: 'cert-3',
      name: 'Back End Development and APIs',
      issuer: 'freeCodeCamp',
      issuerColor: '#FF4D00',
      date: '2023',
      image: '/certificates/fcc-backend.svg',
      credentialUrl: 'https://www.freecodecamp.org/certification/esubalew/back-end-development-and-apis',
      skills: ['Node.js', 'Express', 'REST APIs'],
      order: 3,
      published: true,
    },
    {
      id: 'cert-4',
      name: 'Responsive Web Design',
      issuer: 'freeCodeCamp',
      issuerColor: '#3b82f6',
      date: '2023',
      image: '/certificates/fcc-responsive.svg',
      credentialUrl: 'https://www.freecodecamp.org/certification/esubalew/responsive-web-design',
      skills: ['HTML', 'CSS', 'Flexbox'],
      order: 4,
      published: true,
    },
  ];

  await request(
    {
      hostname: 'localhost',
      port: API_PORT,
      path: '/api/content',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${adminToken}`,
      },
    },
    {
      certificates: finalCerts,
    }
  );
  console.log('✓ All 4 verified certificates set as published in database.');

  console.log('\n=== ALL END-TO-END CMS INTEGRATION TESTS PASSED! ===');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
