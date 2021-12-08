'use strict';

/**
 * app service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::app.app', ({ strapi }) => ({
    createOrUpdate: async (data) => {
        const { bundle_id } = data;
        const res =  await strapi.db.query('api::app.app').findOne({ where: { bundle_id } });

        if (res) {
            const { id, dynamic_risk } = res;

            /* Keep the following data and settings */
            data.dynamic_risk = dynamic_risk;

            strapi.log.info(`Updating ${bundle_id}.`);

            try {
                return await strapi.entityService.update('api::app.app', id, { data });
            } catch(e) {
                console.log(e);
            }

            
        } else {
            strapi.log.info(`Inserting ${bundle_id} into the database.`);

            return await strapi.entityService.create('api::app.app', { data });
        }
    }
}));
