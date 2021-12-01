'use strict';

/**
 * privacy-risk service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::privacy-risk.privacy-risk');
