'use strict';

/*
 * Get Jamf apps and insert into App collection
 */

/*
 * Global variables
 */

const jamf = require('./jamf');
const appstore = require('./appstore');

const collectApps = async ({ strapi, params }) => {
    const validTypes = ["all", "appstore", "jamf", "appstore-dev"];
    const domain = params.domain;
    const type = params.type;

    let fields = {};

    /* 
    * Merge 2 object properties.
    * The properties are overwritten by other objects that
    * have the same properties later in the parameters order.
    */
    const mergeFields = (data) => {
        fields = { ...fields, ...data };
    };

    /*
    * Collect app data
    */
    const collect = async (app) => {
        try {
            switch (type) {
                case "all":
                    mergeFields(await jamf.getMobileAppData(domain, app.id));
                    mergeFields(await appstore.getAppStoreApp(fields.bundle_id));
                    mergeFields(await appstore.getAppStorePrivacy(fields.appstore_id));
                    mergeFields(await appstore.getAppStoreDev(fields.appstore_url));
                    break;
                case "appstore":
                    mergeFields(await jamf.getMobileAppData(domain, app.id));
                    mergeFields(await appstore.getAppStoreApp(fields.bundle_id));
                    mergeFields(await appstore.getAppStorePrivacy(fields.appstore_id));
                    break;
                case "jamf":
                    mergeFields(await jamf.getMobileAppData(domain, app.id));
                    break;
                case "appstore-dev":
                    const { bundle_id, appstore_url } = app;

                    mergeFields({ bundle_id });
                    mergeFields(await appstore.getAppStoreDev(appstore_url));
                    break;
                
                default:
                    break;
            }

            return fields;
        } catch (e) {
            strapi.log.error(e.message);

            return {};
        }
    };

    /*
    * Create new or update current apps
    */
    const createOrUpdateApps = async () => {
        const props = {};

        let data, count = 0;

        if (type === "appstore-dev") {
            data = await strapi.query("app").find({ _limit: -1 });
        } else {
            data = await jamf.getMobileApps(domain);
        }

        for (const app of data) {
            const updatedApp = await collect(app);

            await strapi.services.app.createOrUpdate(updatedApp);
            
            // Important: Clear fields before next loop
            fields = {}

            count++;
        };

        return { jamf: "Mobile Apps", count };
    };

    return validTypes.includes(type)
        ? await createOrUpdateApps()
        : strapi.log.error("Invalid params!");
};

module.exports = {
    collectApps,
};