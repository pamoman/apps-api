'use strict';

/**
 * data-purpose service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-purpose.data-purpose', ({ strapi }) => ({
    createIfNotExists: async (data) => {
        const { name } = data;
        const res =  await strapi.db.query('api::data-purpose.data-purpose').findOne({ where: { name } });

        if (!res) {
            return await strapi.db.query('api::data-purpose.data-purpose').create({ data });
        }

        return res;
    }
}));
