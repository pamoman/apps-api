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
    {
      method: 'GET',
      path: '/evaluate/:domain/:type',
      handler: 'apps.evaluate',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/export/:domain/:type',
      handler: 'apps.export',
      config: {
        policies: [],
      },
    },
  ],
};