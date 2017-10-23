export const sbgHelperLibrary = `
var setMetadata = function(file, metadata) {
    if (!('metadata' in file))
        file['metadata'] = metadata;
    else {
        for (var key in metadata) {
            file['metadata'][key] = metadata[key];
        }
    }
    return file
};

var inheritMetadata = function(o1, o2) {
    var commonMetadata = {};
    if (!Array.isArray(o2)) {
        o2 = [o2]
    }
    for (var i = 0; i < o2.length; i++) {
        var example = o2[i]['metadata'];
        for (var key in example) {
            if (i == 0)
                commonMetadata[key] = example[key];
            else {
                if (!(commonMetadata[key] == example[key])) {
                    delete commonMetadata[key]
                }
            }
        }
    }
    if (!Array.isArray(o1)) {
        o1 = setMetadata(o1, commonMetadata)
    } else {
        for (var i = 0; i < o1.length; i++) {
            o1[i] = setMetadata(o1[i], commonMetadata)
        }
    }
    return o1;
};`;