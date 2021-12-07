/* 
 * API - JAMF
 */

const axios = require('axios');

const getDomainConfig = (domain) => {
    let url, auth;

    switch (domain.toLowerCase()) {
        case "dlg":
            url = process.env.JAMF_DLG_URL;
            auth = `Basic ${process.env.JAMF_DLG_AUTH}`;
            break;
        case "bos":
            url = process.env.JAMF_BOS_URL;
            auth = `Basic ${process.env.JAMF_BOS_AUTH}`;
            break;
        default:
            break;
    };

    return {
        url,
        config: {
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': auth
            }
        }
    }
};

const getJamfFields = (data) => {
    const {
        general: {
            id,
            name,
            bundle_id,
            category = "Unknown"
        }
    } = data || {};

    return {
        jamf_id: id,
        title: name,
        bundle_id,
        category
    };
};

module.exports = {
    getMobileApps: async (domain) => {
        strapi.log.info(`Getting all ${domain} Apps`);

        const { url, config } = getDomainConfig(domain);
        const { data } = await axios.get(`${url}/JSSResource/mobiledeviceapplications`, config);
        const { mobile_device_applications } = data || [];

        return mobile_device_applications;
    },
    getMobileAppData: async (domain, id) => {
        strapi.log.info(`Getting ${domain} App ${id}`);

        const { url, config } = getDomainConfig(domain);
        const { data } = await axios.get(`${url}/JSSResource/mobiledeviceapplications/id/${id}`, config);
        const { mobile_device_application } = data || [];

        return getJamfFields(mobile_device_application);
    }
};