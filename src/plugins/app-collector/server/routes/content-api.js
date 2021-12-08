'use strict';

module.exports = {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/collect/:domain/:type',
      handler: 'apps.collect',
      config: {
        policies: [],
      },
    },
  ],
};