'use strict';

module.exports = ({ strapi }) => ({
    collect: ctx => {
        ctx.body = strapi
            .plugin('app-collector')
            .service('appCollector')
            .collectApps(ctx);
    }
});