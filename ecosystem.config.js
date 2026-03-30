module.exports = {
  apps: [{
    name: 'private-domain',
    script: 'npx',
    args: 'tsx src/index.ts',
    cwd: './server',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'your-production-secret-change-me'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true
  }]
}
