const { DataSource } = require('typeorm');
const { TrendEntity } = require('./apps/api-gateway/src/app/trend/entities/trend.entity');
const { SourceEntity } = require('./apps/api-gateway/src/app/trend/entities/source.entity');

async function testPersistence() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'ai_trend_user',
    password: 'ai_trend_pass',
    database: 'ai_trend_explorer',
    entities: [TrendEntity, SourceEntity],
    synchronize: true,
    logging: true,
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await dataSource.initialize();
    console.log('✓ Connected successfully!\n');

    // Test 1: Save a trend
    console.log('Test 1: Saving a trend...');
    const trendRepo = dataSource.getRepository(TrendEntity);
    const trend = trendRepo.create({
      id: 'test-1',
      title: 'Test Trend',
      description: 'Testing persistence',
      source: 'github',
      url: 'https://github.com/test',
      score: 100,
      topics: ['test', 'persistence'],
    });
    await trendRepo.save(trend);
    console.log('✓ Trend saved successfully\n');

    // Test 2: Retrieve the trend
    console.log('Test 2: Retrieving the trend...');
    const retrieved = await trendRepo.findOne({ where: { id: 'test-1' } });
    if (retrieved) {
      console.log('✓ Trend retrieved:', {
        id: retrieved.id,
        title: retrieved.title,
        source: retrieved.source,
        score: retrieved.score,
      });
    } else {
      throw new Error('Trend not found!');
    }
    console.log('');

    // Test 3: Save source status
    console.log('Test 3: Saving source status...');
    const sourceRepo = dataSource.getRepository(SourceEntity);
    const source = sourceRepo.create({
      name: 'github',
      status: 'ok',
    });
    await sourceRepo.save(source);
    console.log('✓ Source status saved\n');

    // Test 4: Retrieve source status
    console.log('Test 4: Retrieving source status...');
    const retrievedSource = await sourceRepo.findOne({ where: { name: 'github' } });
    if (retrievedSource) {
      console.log('✓ Source status retrieved:', {
        name: retrievedSource.name,
        status: retrievedSource.status,
      });
    } else {
      throw new Error('Source not found!');
    }
    console.log('');

    // Test 5: Count all trends
    console.log('Test 5: Counting all trends...');
    const count = await trendRepo.count();
    console.log(`✓ Total trends in database: ${count}\n`);

    console.log('═══════════════════════════════════════');
    console.log('✓ ALL PERSISTENCE TESTS PASSED!');
    console.log('═══════════════════════════════════════');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await dataSource.destroy();
    process.exit(1);
  }
}

testPersistence();