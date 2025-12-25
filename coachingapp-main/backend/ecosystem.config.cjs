module.exports = {
  apps: [{
    name: 'coaching-backend',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      LIVEKIT_API_KEY: 'API33FTdmH3p6gU',
      LIVEKIT_SECRET: 'LrciIfCz2urcYSB1xfUZifegRGidUmTPtknLtZhvHcJC',
      LIVEKIT_URL: 'wss://coaching-fvctf1ld.livekit.cloud'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

