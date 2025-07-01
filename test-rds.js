const { Client } = require('pg'); // PostgreSQL 客户端
const originalPassword = '~?yzQ1r?lC:ORxAA8m7yk~1';
const encodedPassword = encodeURIComponent(originalPassword);
async function testRDSConnection() {
  // 测试写库连接
  const writeClient = new Client({
    host: 'guge-blog-database-2.cluster-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'guge123',
    password: encodedPassword,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false // AWS RDS 需要 SSL
    }
  });

  // 测试读库连接
  const readClient = new Client({
    host: 'guge-blog-database-2.cluster-ro-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'guge123',
    password: encodedPassword,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 测试写库连接...');
    await writeClient.connect();
    const writeResult = await writeClient.query('SELECT NOW() as current_time');
    console.log('✅ 写库连接成功:', writeResult.rows[0]);
    await writeClient.end();

    console.log('🔄 测试读库连接...');
    await readClient.connect();
    const readResult = await readClient.query('SELECT NOW() as current_time');
    console.log('✅ 读库连接成功:', readResult.rows[0]);
    await readClient.end();

    console.log('🎉 所有数据库连接测试通过！');

  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('详细错误:', error);
  }
}

testRDSConnection();