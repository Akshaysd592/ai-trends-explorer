const { DataSource } = require('typeorm');
const { TrendEntity } = require('./src/app/trend/entities/trend.entity');
const { SourceEntity } = require('./src/app/trend/entities/source.entity');

async function testPersistence() {
  console.log('=== Testing PostgreSQL Data Persistence ===\n');

  // Load environment variables
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env' });

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_USERNAME || 'ai_trend_user',
    password: process.env.DB_PASSWORD || 'ai_trend_pass',
    database: process.env.DB_NAME || 'ai_trend_explorer',
    entities: [TrendEntity, SourceEntity],
    synchronize: true,
    logging: true,
  });

  try {
    console.log('1. Connecting to PostgreSQL...');
    await dataSource.initialize();
    console.log('   ✓ Connected successfully!\n');

    const trendRepo = dataSource.getRepository(TrendEntity);
    const sourceRepo = dataSource.getRepository(SourceEntity);

    // Test 1: Save a trend
    console.log('2. Testing trend persistence...');
    const trend = trendRepo.create({
      id: 'test-' + Date.now(),
      title: 'Test Trend from API',
      description: 'Testing PostgreSQL persistence',
      source: 'github',
      url: 'https://github.com/test/repo',
      score: 100,
      topics: ['ai', 'machine-learning'],
    });
    await trendRepo.save(trend);
    console.log('   ✓ Trend saved to database\n');

    // Test 2: Retrieve the trend
    console.log('3. Retrieving trend from database...');
    const retrieved = await trendRepo.findOne({ where: { id: trend.id } });
    if (retrieved) {
      console.log('   ✓ Trend retrieved:', retrieved.title);
      console.log('   - Source:', retrieved.source);
      console.log('   - Score:', retrieved.score);
      console.log('   - Saved at:', retrieved.savedAt);
    } else {
      throw new Error('Trend not found!');
    }
    console.log('');

    // Test 3: Save source status
    console.log('4. Testing source status persistence...');
    const source = sourceRepo.create({
      name: 'github',
      status: 'ok',
    });
    await sourceRepo.save(source);
    console.log('   ✓ Source status saved\n');

    // Test 4: Count all records
    console.log('5. Checking database contents...');
    const trendCount = await trendRepo.count();
    const sourceCount = await sourceRepo.count();
    console.log('   ✓ Total trends:', trendCount);
    console.log('   ✓ Total sources:', sourceCount);
    console.log('');

    // Test 5: Verify data persistence
    console.log('6. Verifying data persistence...');
    const allTrends = await trendRepo.find();
    console.log('   ✓ All trends in database:');
    allTrends.forEach(t => {
      console.log(`     - ${t.title} (${t.source}) - ${t.score} points`);
    });
    console.log('');

    console.log('═══════════════════════════════════════');
    console.log('✓ ALL PERSISTENCE TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\nPostgreSQL is working correctly!');
    console.log('Data is being saved and retrieved successfully.');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('\nFull error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

testPersistence();