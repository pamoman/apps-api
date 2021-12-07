'use strict';

/*
 * App Collector
 */

const { collectApps } = require('./collect');

module.exports = ({ strapi }) => ({
    collectApps: async ({ params }) => {
        return await collectApps({ strapi, params });
    }
});