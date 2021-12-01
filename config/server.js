module.exports = ({ env }) => ({
  host: env('HOST', '192.168.1.110'),
  port: env.int('PORT', 1337),
  url: env('URL', 'http://localhost:1337'),
  cron: {
    enabled: true
  },
});
