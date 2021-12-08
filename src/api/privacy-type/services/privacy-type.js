'use strict';

/**
 * privacy-type service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::privacy-type.privacy-type', ({ strapi }) => ({
    createIfNotExists: async (data) => {
        const { name } = data;
        const res =  await strapi.db.query('api::privacy-type.privacy-type').findOne({ where: { name } });

        if (!res) {
            return await strapi.db.query('api::privacy-type.privacy-type').create({ data });
        }

        return res;
    }
}));
