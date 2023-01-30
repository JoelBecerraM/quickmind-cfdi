
const fsHelper = require('@magaya/extension-fs-helper');
const path = require('path');
const fs = require('fs');

function initExtensionFolders (id, networkId) {
    const extensionDataFolder = fsHelper.GetExtensionDataFolder(id, networkId);
    process.env.ExtensionDataFolder = extensionDataFolder;
    let extensionConfigFolder = path.join(extensionDataFolder, "config");
    if (!fs.existsSync(extensionConfigFolder)) {
        fs.mkdirSync(extensionConfigFolder);
    }
    process.env.ExtensionConfigFolder = extensionConfigFolder;
}

function textToJson(file, separator) {
    let json =[];
    let array = textToArray(file);
    if (array.length) {
        array.forEach(function(item) {
            let parts = item.split(separator);
            if (parts.length == 2) {
                let jelem = {
                    code : parts[0].trim(),
                    description : parts[1].trim()
                };
                json.push(jelem);
            }
        });
    }
    return json;
} 

function textToArray(file) {
    let array =[];
    let fileLoc = path.join(__dirname, "../config", file);

    if (fs.existsSync(fileLoc)) {
        try {
            let content = fs.readFileSync(fileLoc, "utf8");
            array = content.split(/\r\n|\r|\n/);
        }
        catch (error) {
            logger.LogMessage(error);
        }
    }
    return array;
}

function deleteFile(file) {
    fs.unlink(file, function (err) {
        if (err) {
            console.log("Problem deleting a file locally");
        }
    }); 
}

function saveFileBase64(fileName, content) {
    let uploadsFolder = path.join(process.env.ExtensionConfigFolder, '../uploads'); 
    if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder);
    }
    let result = {};
    let tempFile = path.join(uploadsFolder, fileName); 
    try {
        let buffer = Buffer.from(content, "base64");
        fs.writeFileSync(tempFile, buffer)
        result["success"] = true;
        result["file"] = tempFile;
    }
    catch (error) {
        console.log("Unable to save file. "+fileName);
        result["success"] = false;
    }
    return result;
}

module.exports = {
    initExtensionFolders: initExtensionFolders,
    textToJson: textToJson,
    textToArray: textToArray,
    deleteFile: deleteFile,
    saveFileBase64: saveFileBase64
}
