'use strict';

module.exports = {
  type: 'content-api',
  routes: [
    {
        method: 'GET',
        path: '/',
        handler: 'myController.index',
        config: {
          policies: [],
        },
      },
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