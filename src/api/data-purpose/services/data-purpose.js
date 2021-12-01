'use strict';

/**
 * data-purpose service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-purpose.data-purpose');
