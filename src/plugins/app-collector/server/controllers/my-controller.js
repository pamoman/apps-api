'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('app-collector')
      .service('myService')
      .getWelcomeMessage();
  },
};
