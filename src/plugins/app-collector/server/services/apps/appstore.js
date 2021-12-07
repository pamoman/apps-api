/* 
 * API - App Store scraper
 */

const store = require('app-store-scraper');
const puppeteer = require('puppeteer');

/*
 * Global Variables
 */
let riskAssessments = [];

/*
 * Convert Privacy type name to shortname
 */
const getPrivacyTypeShortName = (type) => {
    switch (type) {
        case "Data Used to Track You":
            return "Tracked";
        case "Data Linked to You":
            return "Linked";
        case "Data Not Linked to You":
            return "Not Linked";
        case "Data Not Collected":
            return "Not collected";
        default:
            return type;
    }
};

const getSupportedDevices = async (supportedDevices) => {
    const devices = [];

    supportedDevices.findIndex(element => element.includes("iPhone") && devices.push("iPhone"));
    supportedDevices.findIndex(element => element.includes("iPad") && devices.push("iPad"));
    supportedDevices.findIndex(element => element.includes("Watch") && devices.push("Apple Watch"));
    supportedDevices.findIndex(element => element.includes("TV") && devices.push("Apple TV"));

    const deviceFields = await forEach(devices, async device => {
        const res = await strapi.query("device").findOne({ name: device })
        const { id } = res || {};

        return id;
    })
    
    return deviceFields;
};

/* async/await map */
const forEach = async (data, callback) => {
    const res = [];

    for (const item of data) {
        res.push(await callback(item));
    }

    return res;
};

/*
 * Insert privacy type into database
 */
const insertPrivacyType = async (name) => {
    try {
        await strapi.services["privacy-type"].createOrUpdate({ name });
    } catch (e) {
        strapi.log.fatal(e.message);
    }
};

/*
 * Insert privacy purpose type into database
 */
const insertPurpose = async (name) => {
    try {
        await strapi.services["data-purpose"].createOrUpdate({ name });
    } catch (e) {
        strapi.log.fatal(e.message);
    }
};

/*
 * Insert privacy data type into database
 */
const insertDataType = async (dataType, category) => {
    try {
        const { id } = await strapi.services["data-category"].createOrUpdate({ name: category });

        category = id;
            
        await strapi.services["data-type"].createOrUpdate({ name: dataType, data_category: category });
    } catch (e) {
        strapi.log.fatal(e.message);
    }
};

/*
 * Insert risk assessment into database
 */
const insertRiskAssessment = async (type, purpose, data) => {
    try {
        const shortName = getPrivacyTypeShortName(type);
        const name = `${shortName}: ${data} for ${purpose}`;

        let res = await strapi.query("risk-assessment").findOne({ name });

        if (!res) {

            const privacyType = await strapi.query("privacy-type").findOne({ name: type });
            const dataPurpose = purpose ? await strapi.query("data-purpose").findOne({ name: purpose }) : null;
            const dataType = await strapi.query("data-type").findOne({ name: data });
            const riskLevel = await strapi.query("risk-level").findOne({ default: true });

            const riskAssessment = {
                name,
                privacy_type: privacyType?.id,
                data_purpose: dataPurpose?.id,
                data_type: dataType?.id,
                risk_level: riskLevel?.id
            };

            res = await strapi.query("risk-assessment").create(riskAssessment) || {};
        }

        const { id } = res || {};

        riskAssessments.push(id);
    } catch (e) {
        strapi.log.fatal(e.message);
    }
};

/*
 * Loop and insert privacy data categories, data types and call risk assessmenets
 */
const handlePrivacyData = async (dataCategories, privacyType, purpose = "Functionality") => {
    await insertPurpose(purpose);

    const res = await forEach(dataCategories, async cat => {
        const { dataCategory, identifier, dataTypes } = cat;

        const data_types = await forEach(dataTypes, async data => {
            await insertDataType(data, dataCategory);
            await insertRiskAssessment(privacyType, purpose, data);
    
            return { data };
        });

        return {
            data_category: dataCategory,
            identifier,
            data_types
        };
    });

    return res;
};

/*
 * What app fields should be returned
 */
const getAppStoreAppFields = async (data) => {
    const {
        id = 0,
        url = "",
        title = "",
        description = "",
        icon = "",
        free = true,
        price = 0,
        genres = [],
        supportedDevices = []
    } = data || {};

    return {
        appstore_id: id,
        appstore_url: url,
        title,
        description,
        icon,
        free,
        price,
        genres,
        devices: await getSupportedDevices(supportedDevices)
    };
};

/*
 * Loop privacy data and get database fields
 */
const getAppStorePrivacyFields = async (data) => {
    const { managePrivacyChoicesUrl, privacyTypes = [] } = data;

    // Reset Risk Assessments arrays
    riskAssessments = [];

    const privacy = await forEach(privacyTypes, async type => {
        let {
            privacyType,
            identifier,
            description,
            dataCategories = [],
            purposes = []
        } = type || {};

        await insertPrivacyType(privacyType);

        purposes = await forEach(purposes, async p => {
            const { purpose, identifier, dataCategories } = p;

            const data_categories = await handlePrivacyData(dataCategories, privacyType, purpose);

            return {
                purpose,
                identifier,
                data_categories
            }
        });

        const data_categories = await handlePrivacyData(dataCategories, privacyType);

        return {
            privacy_type: privacyType,
            identifier,
            description,
            data_categories,
            purposes
        };
    });

    return {
        privacy,
        manage_privacy_url: managePrivacyChoicesUrl,
        risk_assessments: riskAssessments
    };
};

/*
 * Return the developer privacy policy url field
 */
const getAppStoreDevFields = (data) => {
    const {
        developer_privacy_policy = ""
    } = data || {};

    return {
        developer_privacy_policy
    };
};

module.exports = {
    getAppStoreApp: async (appId) => {
        if (appId) {
            try {
                const data = await store.app({ appId, country: "se" });

                return await getAppStoreAppFields(data);
            } catch (e) {
                strapi.log.error("App store data:", appId, e.message);
            }
        }

        return {};
    },
    getAppStorePrivacy: async (id) => {
        if (id) {
            try {
                const privacy = await store.privacy({ id, country: "se" });

                return getAppStorePrivacyFields(privacy);
            } catch (e) {
                strapi.log.error("App store privacy:", id, e.message);
            }
        }

        return {};
    },
    getAppStoreDev: async (url) => {
        if (url) {
            try {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                strapi.log.info(`Scraping ${url}`);

                await page.goto(url);

                const privacyUrl = await page.$eval('.app-privacy a', a => a.href);
                const data = { developer_privacy_policy: privacyUrl };

                await browser.close();

                return getAppStoreDevFields(data);
            } catch (e) {
                strapi.log.error("App store privacy url:", url, e.message);
            }
        } 
    }
};