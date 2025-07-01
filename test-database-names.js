const { Client } = require('pg');

async function testDatabaseNames() {
  const password = '~?yzQ1r?lC:ORxAA8m7yk~1';
  const username = 'guge123';
  
  // PostgreSQL 可能的默认数据库名
  const possibleDatabases = [
    'postgres',        // PostgreSQL 默认数据库
    'guge123',         // 与用户名同名
    'template1',       // PostgreSQL 模板数据库
    '',               // 不指定数据库（让 PostgreSQL 决定）
    undefined         // 同上
  ];

  console.log('🔍 测试不同的数据库名...\n');
  
  for (const database of possibleDatabases) {
    const dbName = database || '(默认)';
    console.log(`🔄 测试数据库: ${dbName}`);
    
    const client = new Client({
      host: 'guge-blog-database-2.cluster-cwtmqaa6mnq9.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: username,
      password: password,
      database: database, // 可能是 undefined，这是可以的
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });

    try {
      await client.connect();
      console.log('✅ 连接成功！');
      
      // 获取实际连接的数据库信息
      const result = await client.query(`
        SELECT 
          current_database() as connected_db,
          current_user as current_user,
          version() as pg_version
      `);
      
      console.log('实际连接的数据库:', result.rows[0].connected_db);
      console.log('当前用户:', result.rows[0].current_user);
      console.log('PostgreSQL 版本:', result.rows[0].pg_version.substring(0, 50) + '...');
      
      // 列出所有可用的数据库
      const dbListResult = await client.query(`
        SELECT datname, datowner, datacl 
        FROM pg_database 
        WHERE datistemplate = false 
        ORDER BY datname
      `);
      
      console.log('\n📋 所有可用数据库:');
      dbListResult.rows.forEach(row => {
        console.log(`  - ${row.datname}`);
      });
      
      await client.end();
      
      console.log(`\n🎉 成功！正确的数据库配置:`);
      console.log(`DATABASE_WRITE_NAME: ${result.rows[0].connected_db}`);
      console.log(`DATABASE_READ_NAME: ${result.rows[0].connected_db}`);
      
      return result.rows[0].connected_db; // 返回正确的数据库名
      
    } catch (error) {
      console.log(`❌ 失败: ${error.message}`);
      if (error.code === '3D000') {
        console.log('   → 数据库不存在');
      } else if (error.code === '28P01') {
        console.log('   → 密码认证失败');
      }
    }
    
    console.log(''); // 空行
  }
  
  console.log('❌ 所有数据库名都测试失败');
}

testDatabaseNames();