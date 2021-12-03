'use strict';

module.exports = ({ strapi }) => ({
    doSomething(ctx) {
        ctx.body = { message: 'HelloWorld' };
    },
});