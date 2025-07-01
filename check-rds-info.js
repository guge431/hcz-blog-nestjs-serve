// check-rds-info.js
const { execSync } = require('child_process');

console.log('🔍 获取 RDS 实例信息...\n');

try {
  // 使用 AWS CLI 获取数据库实例信息
  const command = `aws rds describe-db-clusters --db-cluster-identifier guge-blog-database-2 --region us-east-1`;
  
  console.log('执行命令:', command);
  console.log('请确保你已经配置了 AWS CLI 凭据\n');
  
  const result = execSync(command, { encoding: 'utf8' });
  const data = JSON.parse(result);
  
  if (data.DBClusters && data.DBClusters.length > 0) {
    const cluster = data.DBClusters[0];
    console.log('✅ 找到集群信息:');
    console.log('集群标识符:', cluster.DBClusterIdentifier);
    console.log('主用户名:', cluster.MasterUsername);
    console.log('数据库名:', cluster.DatabaseName || '(未设置)');
    console.log('引擎:', cluster.Engine);
    console.log('状态:', cluster.Status);
    console.log('端点:', cluster.Endpoint);
    console.log('读取端点:', cluster.ReaderEndpoint);
  }
  
} catch (error) {
  console.error('❌ 无法获取 RDS 信息:');
  console.error('错误:', error.message);
  console.log('\n💡 请检查:');
  console.log('1. AWS CLI 是否已安装 (运行: aws --version)');
  console.log('2. AWS 凭据是否已配置 (运行: aws configure)');
  console.log('3. 你的 AWS 账户是否有访问 RDS 的权限');
  console.log('\n或者手动检查 AWS 控制台中的信息。');
}