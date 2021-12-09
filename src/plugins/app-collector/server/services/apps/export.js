/* 
 * API - Apps to excel
 */

const ExcelJS = require('exceljs');

const getContents = (column = {}, app = {}) => {
    const { utils } = strapi.service('plugin::app-collector.helper');
    const { key, settings } = column;
    const { separator = ", ", nested_prop = "name", bool_true = "Yes", bool_false = "No" } = settings || {};
    const appVal = app[key];

    const { isUndefined, isNull, isArray, isNested, isBool, isURL } = utils.getTypeOf(appVal);

    let val;

    if (!isUndefined || !isNull) {
        switch (true) {
            case isArray && isNested:
                val = appVal.map(element => {
                    return element[nested_prop];
                }).join(separator);
                break;
            case isArray:
                val = appVal.map(element => {
                    return element;
                }).join(separator);
                break;
            case isNested:
                val = appVal[nested_prop];
                break;
            case isBool:
                val = appVal ? bool_true : bool_false;
                break;
            case isURL:
                val = {
                    text: appVal,
                    hyperlink: appVal,
                    tooltip: appVal
                };
                break;
            default:
                val = appVal;
                break;
        }
    }

    return { [key]: val };
};

const getTypeRow = (columns) => {
    const typeRow = {};

    columns.forEach(column => {
        const { key, type } = column;

        if (type) {
            typeRow[key] = type.name;
        }
    });

    return typeRow;
};

const getAppRows = async (columns) => {
    const apps = await strapi.entityService.findMany('api::app.app', {
        populate: ['privacy_risks', 'privacy_risks.risk_level']
    });

    const appRows = apps.map(app => {
        const fields = {};
        
        columns.forEach(column => {
            Object.assign(fields, getContents(column, app));
        });

        return fields;
    });

    return appRows;
};

const applyLinkStyle = (sheet) => {
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            const { value: { hyperlink } } = cell || {};

            switch (true) {
                case typeof(hyperlink) !== "undefined":
                    row.getCell(colNumber).font = {
                        underline: true,
                        color: { argb: 'FF0000FF' }
                    }
                    break;
                default:
                    break;
            }
        });
    });
};

const toExcel = async (domain) => {
    const filename = `./public/apps/${domain}/excel/apps.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(domain);

    const { columns } = await strapi.db.query('api::excel.excel').findOne({
        populate: { columns: true }
    });

    sheet.columns = columns.map(column => {
        const { header, key, width } = column;

        return { header, key, width };
    });

    sheet.getRow(1).font = {
        size: 14,
        bold: true
    };

    const typeRow = getTypeRow(columns);
    const appRows = await getAppRows(columns);

    sheet.addRow(typeRow);
    sheet.addRows(appRows);

    applyLinkStyle(sheet);

    await workbook.xlsx.writeFile(filename);

    strapi.log.info(`Excel file saved to: ${filename}`);

    return { download: `https://apps-api.lidkoping.school/apps/${domain}/excel/apps.xlsx`};
};

module.exports = {
    exportApps: async ({ params }) => {
        const { domain, type } = params;
        const allowed = ["bos", "dlg"];

        if (allowed.includes(domain)) {
            switch (type) {
                case "excel":
                    strapi.log.info("Creating apps excel file");
    
                    return await toExcel(domain);
            }
        } else {
            strapi.log.error("Invalid domain name.")
        }
    }
};