'use strict';

module.exports = ({ strapi }) => ({
    doSomething(ctx) {
        ctx.body = { message: 'HelloWorld' };
    },
    collect: ctx => {
        ctx.body = strapi
            .plugin('app-collector')
            .service('appCollector')
            .collectApps(ctx);
    }
});