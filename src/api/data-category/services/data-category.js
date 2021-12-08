'use strict';

/**
 * data-category service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-category.data-category', ({ strapi }) => ({
    createIfNotExists: async (data) => {
        const { name } = data;
        const res =  await strapi.db.query('api::data-category.data-category').findOne({ where: { name } });

        if (!res) {
            return await strapi.db.query('api::data-category.data-category').create({ data });
        }

        return res;
    }
}));
