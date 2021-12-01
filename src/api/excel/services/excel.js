'use strict';

/**
 * excel service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::excel.excel');
