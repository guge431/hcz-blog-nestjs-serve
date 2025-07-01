// get-rds-password.js
import { execSync } from 'child_process';
import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 从 AWS Secrets Manager 获取 RDS 密码...\n');

async function getRDSPassword() {
  try {
    // 查找与 guge-blog-database-2 相关的密钥
    console.log('步骤 1: 查找 RDS 相关的密钥...');
    const listCommand = `aws secretsmanager list-secrets --region us-east-1 --query "SecretList[?contains(Name, 'guge-blog-database-2') || contains(Description, 'guge-blog-database-2')]"`;
    
    const secretsList = execSync(listCommand, { encoding: 'utf8' });
    const secrets = JSON.parse(secretsList);
    
    if (secrets && secrets.length > 0) {
      console.log(`✅ 找到 ${secrets.length} 个相关密钥:\n`);
      
      for (const secret of secrets) {
        console.log(`🔑 密钥名称: ${secret.Name}`);
        console.log(`   ARN: ${secret.ARN}`);
        console.log(`   描述: ${secret.Description || '无'}`);
        
        try {
          // 获取密钥内容
          console.log('   📋 获取密钥内容...');
          const getCommand = `aws secretsmanager get-secret-value --secret-id "${secret.ARN}" --region us-east-1 --query "SecretString" --output text`;
          const secretValue = execSync(getCommand, { encoding: 'utf8' });
          const credentials = JSON.parse(secretValue.trim());
          
          console.log('   ✅ 数据库连接信息:');
          console.log(`   🖥️  主机: ${credentials.host}`);
          console.log(`   🔌 端口: ${credentials.port}`);
          console.log(`   👤 用户名: ${credentials.username}`);
          console.log(`   🔐 密码: ${credentials.password}`);
          console.log(`   🗄️  数据库: ${credentials.dbname || credentials.database || 'postgres'}`);
          console.log(`   🚀 引擎: ${credentials.engine || 'N/A'}`);
          
          // 立即测试连接
          console.log('\n🔄 测试连接...');
          await testConnection(credentials);
          
        } catch (error) {
          console.log(`   ❌ 无法读取密钥: ${error.message}`);
        }
        
        console.log('\n' + '-'.repeat(50) + '\n');
      }
    } else {
      console.log('❌ 未找到相关密钥');
      console.log('尝试搜索所有 RDS 相关密钥...');
      
      // 更广泛的搜索
      const broadCommand = `aws secretsmanager list-secrets --region us-east-1 --query "SecretList[?contains(Name, 'rds') || contains(Name, 'database') || contains(Name, 'aurora')]"`;
      const broadResult = execSync(broadCommand, { encoding: 'utf8' });
      const broadSecrets = JSON.parse(broadResult);
      
      if (broadSecrets && broadSecrets.length > 0) {
        console.log('找到其他 RDS 相关密钥:');
        broadSecrets.forEach(secret => {
          console.log(`- ${secret.Name}: ${secret.Description || '无描述'}`);
        });
      } else {
        console.log('❌ 完全没有找到 RDS 相关密钥');
      }
    }
    
  } catch (error) {
    console.error('❌ 获取密钥失败:', error.message);
    console.log('\n💡 可能的问题:');
    console.log('1. AWS CLI 权限不足');
    console.log('2. 密钥在不同区域');
    console.log('3. 密钥名称格式不同');
    
    // 如果 Secrets Manager 失败，尝试另一种方法
    console.log('\n🔄 尝试从 RDS 集群信息获取 Secrets ARN...');
    await tryGetSecretsFromRDS();
  }
}

// 测试数据库连接
async function testConnection(credentials) {
  const client = new Client({
    host: credentials.host,
    port: credentials.port,
    user: credentials.username,
    password: credentials.password,
    database: credentials.dbname || credentials.database || 'postgres',
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    const result = await client.query('SELECT now() as current_time, current_database() as db_name');
    console.log('   ✅ 连接测试成功!');
    console.log(`   ⏰ 当前时间: ${result.rows[0].current_time}`);
    console.log(`   🗄️  连接的数据库: ${result.rows[0].db_name}`);
    await client.end();
    
    console.log('\n🎉 找到正确的数据库凭据！');
    console.log('\n📝 更新你的 template.yaml:');
    console.log(`DATABASE_WRITE_USERNAME: ${credentials.username}`);
    console.log(`DATABASE_WRITE_PASSWORD: ${credentials.password}`);
    console.log(`DATABASE_WRITE_NAME: ${credentials.dbname || credentials.database || 'postgres'}`);
    
  } catch (error) {
    console.log(`   ❌ 连接测试失败: ${error.message}`);
  }
}

// 尝试从 RDS 集群信息获取 Secrets Manager ARN
async function tryGetSecretsFromRDS() {
  try {
    console.log('从 RDS 集群描述中查找 Secrets Manager ARN...');
    const rdsCommand = `aws rds describe-db-clusters --db-cluster-identifier guge-blog-database-2 --region us-east-1 --query "DBClusters[0].MasterUserSecret.SecretArn" --output text`;
    
    const secretArn = execSync(rdsCommand, { encoding: 'utf8' }).trim();
    
    if (secretArn && secretArn !== 'None' && secretArn !== 'null') {
      console.log(`✅ 找到 Secrets ARN: ${secretArn}`);
      
      // 使用 ARN 获取密钥内容
      const getCommand = `aws secretsmanager get-secret-value --secret-id "${secretArn}" --region us-east-1 --query "SecretString" --output text`;
      const secretValue = execSync(getCommand, { encoding: 'utf8' });
      const credentials = JSON.parse(secretValue.trim());
      
      console.log('\n🔐 从 RDS 关联的密钥获取到凭据:');
      console.log(`主机: ${credentials.host}`);
      console.log(`端口: ${credentials.port}`);
      console.log(`用户名: ${credentials.username}`);
      console.log(`密码: ${credentials.password}`);
      console.log(`数据库: ${credentials.dbname || credentials.database || 'postgres'}`);
      
      // 测试连接
      await testConnection(credentials);
      
    } else {
      console.log('❌ RDS 集群未关联 Secrets Manager');
      console.log('需要手动重置密码');
    }
    
  } catch (error) {
    console.log(`❌ 无法从 RDS 获取 Secrets 信息: ${error.message}`);
  }
}

// 运行主函数
getRDSPassword().catch(console.error);