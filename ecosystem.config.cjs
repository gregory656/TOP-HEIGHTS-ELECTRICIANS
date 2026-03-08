module.exports = {
  apps: [
    {
      name: 'topheights-chat-api',
      cwd: './server',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
