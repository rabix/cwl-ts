export const sbgHelperLibrary = `
var updateMetadata = function(file, key, value) {
    file['metadata'][key] = value;
    return file;
};

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
};

var toArray = function(file) {
    return [].concat(file);
};

var groupBy = function(files, key) {
    var groupedFiles = [];
    var tempDict = {};
    for (var i = 0; i < files.length; i++) {
        var value = files[i]['metadata'][key];
        if (value in tempDict)
            tempDict[value].push(files[i]);
        else tempDict[value] = [files[i]];
    }
    for (var key in tempDict) {
        groupedFiles.push(tempDict[key]);
    }
    return groupedFiles;
};

var orderBy = function(files, key, order) {
    var compareFunction = function(a, b) {
        if (a['metadata'][key].constructor === Number) {
            return a['metadata'][key] - b['metadata'][key];
        } else {
            var nameA = a['metadata'][key].toUpperCase();
            var nameB = b['metadata'][key].toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        }
    };

    files = files.sort(compareFunction);
    if (order == undefined || order == "asc")
        return files;
    else
        return files.reverse();
};`;