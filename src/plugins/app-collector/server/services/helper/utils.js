/* 
 * API - Helper functions
 */

const isUrl = (str) => {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i' // fragment locator
    );

    return !!pattern.test(str);
};

module.exports = {
    getTypeOf: (type) => {
        let isUndefined = false,
            isNull = false,
            isArray = false,
            isNested = false,
            isBool = false,
            isURL = false;
    
        switch (true) {
            case typeof(type) === "undefined":
                isUndefined = true;
                break;
            case type === null:
                isNull = true;
                break;
            case Array.isArray(type):
                isArray = true;
    
                if (typeof(type[0]) === "object") {
                    isNested = true;
                }
                break;
            case typeof(type) === "object":
                isNested = true;
                break;
            case typeof(type) === "boolean":
                isBool = true;
                break;
            case isUrl(type):
                isURL = true;
            default:
                break;
        }
    
        return { isUndefined, isNull, isArray, isNested, isBool, isURL };
    },
    formatMyDate: (value, locale = 'sv-SV') => {
        return new Date(value).toLocaleDateString(locale);
    }
}
