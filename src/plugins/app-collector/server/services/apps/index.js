'use strict';

/*
 * App Collector
 */

const { collectApps } = require('./collect');
const { evaluateApps } = require('./evaluate');
const { exportApps } = require('./export');

module.exports = ({ strapi }) => ({
    collectApps,
    evaluateApps,
    exportApps
});