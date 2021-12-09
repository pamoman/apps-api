/* 
 * API - Evaluate Apps
 */

/* Update the app risk level based on app risk assements */
const handleRiskLevel = async (riskAssessments, riskLevels, data) => {
    const risks = [];

    let res;
    
    for (const riskAssessment of riskAssessments) {
        const { risk_level } = riskAssessment;

        risks.push(risk_level);
    };

    if (!risks.length) {
        res = riskLevels.find(risk => risk.default === true)
    } else {
        const maxRiskLevel = Math.max.apply(Math, risks.map((risk) => risk.level ));

        res = riskLevels.find(risk => risk.level === maxRiskLevel);
    }

    data.risk_level = res.id;

    return res;
};

/* Update the dates when changing risk levels */
const handleRiskDates = async (level, dateConfirmed, data) => {
    const { utils } = strapi.service('plugin::app-collector.helper');

    switch (true) {
        case level === 0:
            data.date_confirmed = null;
            data.date_revised = null;
            break;
        case (level > 0 && dateConfirmed === null):
            data.date_confirmed = utils.formatMyDate(new Date());
            break;
        case (level > 0 && dateConfirmed != null):
            data.date_revised = utils.formatMyDate(new Date());
            break;
        default:
            break;
    }
};

/* Evaluate all app risk levels */
const evaluateAppRisk = async (domain) => {
    const apps = await strapi.entityService.findMany('api::app.app', {
        populate: ['privacy_risks', 'privacy_risks.risk_level']
    });

    const riskLevels = await strapi.db.query('api::risk-level.risk-level').findMany({ _limit: -1 });

    let count = 0;

    for (const app of apps) {
        const { id, title, dynamic_risk, privacy_risks, date_confirmed } = app;

        if (dynamic_risk) {
            strapi.log.info(`Evaluating risk level for ${domain} app: ${title}`);

            const data = {};

            const { level } = await handleRiskLevel(privacy_risks, riskLevels, data);

            handleRiskDates(level, date_confirmed, data);

            await strapi.db.query('api::app.app').update({ where: { id }, data });

            count++;
        }
    }

    return { action: "App risk evaluation", count };
};

module.exports = {
    evaluateApps: async ({ params }) => {
        const { domain, type } = params;
        const allowed = ["bos", "dlg"];

        if (allowed.includes(domain)) {
            switch (type) {
                case "risk":
                    strapi.log.info(`Risk evaluating ${domain} Apps...`);
    
                    return await evaluateAppRisk(domain);
                default:
                    break;
            }
        } else {
            strapi.log.fatal("Invalid domain name.");
        }

        return { action: "invalid" };
    }
}