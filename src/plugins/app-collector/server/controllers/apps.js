'use strict';

module.exports = ({ strapi }) => ({
    collect: ctx => {
        ctx.body = strapi
            .plugin('app-collector')
            .service('apps')
            .collectApps(ctx);
    },
    evaluate: ctx => {
        ctx.body = strapi
            .plugin('app-collector')
            .service('apps')
            .evaluateApps(ctx);
    },
    export: ctx => {
        ctx.body = strapi
            .plugin('app-collector')
            .service('apps')
            .exportApps(ctx);
    }
});