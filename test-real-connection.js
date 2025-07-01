// test-real-connection.js
import pkg from 'pg';
const { Client } = pkg;

async function testRealConnection() {
  // 从 Secrets Manager 获取到的真实凭据
  const credentials = {
    host: 'guge-blog-database-2.cluster-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'guge123',
    password: '~?oyzQ1r?lCuCQ6:ORxAA8m7yk~1', // 真实密码
    database: 'postgres'
  };

  console.log('🔄 使用真实密码测试连接...\n');
  console.log('📋 连接信息:');
  console.log(`主机: ${credentials.host}`);
  console.log(`端口: ${credentials.port}`);
  console.log(`用户: ${credentials.user}`);
  console.log(`密码: ${credentials.password.substring(0, 4)}***`);
  console.log(`数据库: ${credentials.database}\n`);

  // 测试写库连接
  const writeClient = new Client({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    ssl: false, // 先尝试不使用 SSL
    connectionTimeoutMillis: 10000
  });

  try {
    console.log('🔄 测试写库连接（不使用SSL）...');
    await writeClient.connect();
    
    const result = await writeClient.query('SELECT now() as current_time, current_database() as db_name, current_user as user_name');
    console.log('✅ 写库连接成功!');
    console.log(`⏰ 当前时间: ${result.rows[0].current_time}`);
    console.log(`🗄️  数据库: ${result.rows[0].db_name}`);
    console.log(`👤 用户: ${result.rows[0].user_name}`);
    
    await writeClient.end();
    
    // 测试读库连接
    console.log('\n🔄 测试读库连接...');
    const readClient = new Client({
      host: 'guge-blog-database-2.cluster-ro-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: credentials.user,
      password: credentials.password,
      database: credentials.database,
      ssl: false,
      connectionTimeoutMillis: 10000
    });
    
    await readClient.connect();
    const readResult = await readClient.query('SELECT now() as read_time');
    console.log('✅ 读库连接成功!');
    console.log(`⏰ 读库时间: ${readResult.rows[0].read_time}`);
    await readClient.end();
    
    console.log('\n🎉 所有连接测试成功！');
    printConfiguration(credentials);
    
  } catch (error) {
    console.error('❌ 无SSL连接失败:', error.message);
    
    // 如果无SSL失败，尝试使用SSL
    console.log('\n🔄 尝试使用SSL连接...');
    await testWithSSL(credentials);
  }
}

async function testWithSSL(credentials) {
  const sslClient = new Client({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
  });

  try {
    await sslClient.connect();
    const result = await sslClient.query('SELECT now() as current_time');
    console.log('✅ SSL连接成功!');
    console.log(`⏰ 当前时间: ${result.rows[0].current_time}`);
    await sslClient.end();
    
    console.log('\n🎉 SSL连接测试成功！');
    printSSLConfiguration(credentials);
    
  } catch (error) {
    console.error('❌ SSL连接也失败:', error.message);
    console.log('\n💡 可能的解决方案:');
    console.log('1. 检查安全组设置');
    console.log('2. 检查网络连接');
    console.log('3. 确认数据库状态');
  }
}

function printConfiguration(credentials) {
  console.log('\n📝 更新你的 template.yaml（无SSL）:');
  console.log('Environment:');
  console.log('  Variables:');
  console.log(`    DATABASE_WRITE_HOST: ${credentials.host}`);
  console.log(`    DATABASE_WRITE_PORT: ${credentials.port}`);
  console.log(`    DATABASE_WRITE_USERNAME: ${credentials.user}`);
  console.log(`    DATABASE_WRITE_PASSWORD: ${credentials.password}`);
  console.log(`    DATABASE_WRITE_NAME: ${credentials.database}`);
  console.log(`    DATABASE_READ_HOST: guge-blog-database-2.cluster-ro-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com`);
  console.log(`    DATABASE_READ_PORT: ${credentials.port}`);
  console.log(`    DATABASE_READ_USERNAME: ${credentials.user}`);
  console.log(`    DATABASE_READ_PASSWORD: ${credentials.password}`);
  console.log(`    DATABASE_READ_NAME: ${credentials.database}`);
  console.log('    DATABASE_TYPE: postgres');
}

function printSSLConfiguration(credentials) {
  console.log('\n📝 更新你的 template.yaml（使用SSL）:');
  console.log('Environment:');
  console.log('  Variables:');
  console.log(`    DATABASE_WRITE_HOST: ${credentials.host}`);
  console.log(`    DATABASE_WRITE_PORT: ${credentials.port}`);
  console.log(`    DATABASE_WRITE_USERNAME: ${credentials.user}`);
  console.log(`    DATABASE_WRITE_PASSWORD: ${credentials.password}`);
  console.log(`    DATABASE_WRITE_NAME: ${credentials.database}`);
  console.log(`    DATABASE_READ_HOST: guge-blog-database-2.cluster-ro-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com`);
  console.log(`    DATABASE_READ_PORT: ${credentials.port}`);
  console.log(`    DATABASE_READ_USERNAME: ${credentials.user}`);
  console.log(`    DATABASE_READ_PASSWORD: ${credentials.password}`);
  console.log(`    DATABASE_READ_NAME: ${credentials.database}`);
  console.log('    DATABASE_TYPE: postgres');
  console.log('    DATABASE_SSL: true  # 如果你的 NestJS 应用支持此配置');
}

testRealConnection().catch(console.error);