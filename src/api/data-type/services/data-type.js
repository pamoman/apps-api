'use strict';

/**
 * data-type service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-type.data-type', ({ strapi }) => ({
    createIfNotExists: async (data) => {
        const { name } = data;
        const res =  await strapi.db.query('api::data-type.data-type').findOne({ where: { name } });

        if (!res) {
            return await strapi.db.query('api::data-type.data-type').create({ data });
        }

        return res;
    }
}));
