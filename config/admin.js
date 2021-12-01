module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '3e173db066899c1c5dfff6574ba91412'),
  },
});
