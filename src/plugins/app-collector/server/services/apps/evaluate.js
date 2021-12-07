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
    const { helper } = strapi.config.functions.apps;

    switch (true) {
        case level === 0:
            data.date_confirmed = null;
            data.date_revised = null;
            break;
        case (level > 0 && dateConfirmed === null):
            data.date_confirmed = helper.formatMyDate(new Date());
            break;
        case (level > 0 && dateConfirmed != null):
            data.date_revised = helper.formatMyDate(new Date());
            break;
        default:
            break;
    }
};

/* Evaluate all app risk levels */
const evaluateAppRisk = async (domain) => {
    const apps = await strapi.query("app").find({ _limit: -1 }, ["risk_assessments", "risk_assessments.risk_level"]);
    const riskLevels = await strapi.query("risk-level").find();

    let count = 0;

    for (const app of apps) {
        const { id, title, dynamic_risk, risk_assessments, date_confirmed } = app;

        if (dynamic_risk) {
            strapi.log.info(`Evaluating risk level for ${domain} app: ${title}`);

            const data = {};

            const { level } = await handleRiskLevel(risk_assessments, riskLevels, data);

            handleRiskDates(level, date_confirmed, data);

            await strapi.query("app").update({ id }, data);

            count++;
        }
    }

    return { action: "App risk evaluation", count };
};

module.exports = {
    appData: async (params) => {
        const { domain, type } = params;
        const allowed = ["bos", "dlg"];

        if (allowed.includes(domain)) {
            switch (type) {
                case "risk":
                    strapi.log.info(`Risk evaluating ${domain} Apps...`);
    
                    return await evaluateAppRisk(domain);
            }
            
            
            return await evaluateAppRisk();
            
        } else {
            strapi.log.fatal("Invalid domain name.")
        }
    }
}