// helper package for parsing command arguments
const {program} = require('commander');
const packageJson = require('./package.json');
const extConfigJson = require('./extension.config.json');
// require hyperion helper package. Pass as the second argument the unique identifier of our extension
const apiKey = '<YOUR-API-KEY-HERE>';
const hyperion = require('@magaya/hyperion-node')(process.argv, {
    'clientId' : `${extConfigJson.id.company}-${extConfigJson.id.name}`,
    'apiKey' : apiKey
});

program.version(packageJson.version)
    .option('-p, --port <n>', 'running port', parseInt)
    .option('-r, --root <value>', 'startup root for api')
    .option('-s, --service-name <value>', 'name for service')
    .option('-g, --gateway', 'dictates if we should be through gateway')
    .option('-i, --network-id <n>', 'magaya network id', parseInt)
    .option('-c, --connection-string <cs>', ' db connection string')
    .option('--no-daemon', 'pm2 no daemon option')
    .parse(process.argv);

const options = program.opts();
if (!options.port) {
    console.log('Must submit port on which to listen...');
    process.exit(1);
} else if (!options.root) {
    console.log('Must submit root...');
    process.exit(1);
} else if (!options.networkId) {
    console.log('Must submit Magaya network id...');
    process.exit(1);
}

if (!hyperion.dbx) {
    console.log(`Hyperion is not defined :'(`);
    process.exit(1);
}
if (!hyperion.dbw) {
    console.log(`Hyperion Write is not defined :'(`);
    process.exit(1);
}

const init = require('./helpers/initialize.js');
const fm = require('./helpers/fileManager.js');

init.initialize(hyperion, program, fm).then(result => {
    if(result.success) {
        const express = require('express');
        const app = express();
        const url = require('url');
        const ship = require('./api/shipments.js');
        const invo = require('./api/invoices.js');
        const paym = require('./api/payments.js');
        const path = require('path');
        const fs = require('fs');
        
        app.use(express.urlencoded());

        // static content
        app.use(`${options.root}/`, express.static(path.join(__dirname, 'html')));

        // api routes
        app.get(`${options.root}/payments`, async function(request, response) {
            const queryParams = url.parse(request.url, true).query;
            
            console.log("GET /payments");
            console.log(queryParams)

            let payments = await paym.getPaymentsByGuid(hyperion, queryParams.op); 
            // Busqueda de facturas
            for (var i=0; i < payments.length; i++) {
                console.log(payments[i].PaymentItems);     
                if (payments[i].PaymentItems) {
                    // Se supone que es un Invoice, asi que lo busco
                    for (var j=0; j<payments[i].PaymentItems.length; j++) {
                        let guid = payments[i].PaymentItems[j].GUID;
                        let invoices = await invo.getInvoicesByGuid(hyperion, guid);
                        if (invoices.length>0) {
                            payments[i].PaymentItems[j].Invoice = invoices[0];
                        }
                    }
                }
            }
            response.setHeader("Content-Type", "application/json");
            response.send(payments);
        });

        app.post(`${options.root}/payments`, async function(request, response) {
            let result = {};
            await paym.updatePaymentByGuid(hyperion, request.body);
            result["success"] = "OK";
            
            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });

        app.put(`${options.root}/payments`, async function(request, response) {
            let result = {};

            let resultSave;
            let fileNameXML = request.body.tipodocumento+"_"+request.body.documento+".xml";
            resultSave = fm.saveFileBase64(fileNameXML, request.body.xml);
            result["xml"] = resultSave.file;
            let fileNamePDF = request.body.tipodocumento+"_"+request.body.documento+".pdf";
            resultSave = fm.saveFileBase64(fileNamePDF, request.body.pdf);
            result["pdf"] = resultSave.file;

            await paym.saveAttachmentsInvoiceByGuid(hyperion, request.body, result.xml, result.pdf);
            fm.deleteFile(result.xml);            
            fm.deleteFile(result.pdf);            
            result["success"] = "OK";
            
            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });

        app.get(`${options.root}/invoices`, async function(request, response) {
            const queryParams = url.parse(request.url, true).query;
            
            console.log("GET /invoices");
            console.log(queryParams)

            let invoices = await invo.getInvoicesByGuid(hyperion, queryParams.op);            
            // Busqueda de relacionados
            for (var i=0; i < invoices.length; i++) {
                if (invoices[i].Related) {
                    // Si es un Shipment
                    if (invoices[i].Related.GUID!==""&&invoices[i].Related.Type===3) {
                        // Obtengo los datos del Shipment
                        let shipments = await ship.getShipmentsByGuid(hyperion, invoices[i].Related.GUID);
                        if (shipments.length>0) {                            
                            for (var j=0; j < shipments[0].PackingListItems.length; j++) {
                                let containeditems = await ship.getContainedItems(hyperion.dbx, hyperion.algorithm, 
                                    shipments[0].PackingListItems[j].ContainedItems);
                                shipments[0].PackingListItems[j].ContainedItems = containeditems;
                            }
                            invoices[i].Shipment = shipments[0];
                        }
                    }
                }
            }

            response.setHeader("Content-Type", "application/json");
            response.send(invoices);
        });
        
        app.post(`${options.root}/invoices`, async function(request, response) {
            let result = {};
            await invo.updateInvoiceByGuid(hyperion, request.body);
            result["success"] = "OK";
            
            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });

        app.put(`${options.root}/invoices`, async function(request, response) {
            let result = {};

            let resultSave;
            let fileNameXML = request.body.tipodocumento+"_"+request.body.documento+".xml";
            resultSave = fm.saveFileBase64(fileNameXML, request.body.xml);
            result["xml"] = resultSave.file;
            let fileNamePDF = request.body.tipodocumento+"_"+request.body.documento+".pdf";
            resultSave = fm.saveFileBase64(fileNamePDF, request.body.pdf);
            result["pdf"] = resultSave.file;

            await invo.saveAttachmentsInvoiceByGuid(hyperion, request.body, result.xml, result.pdf);
            fm.deleteFile(result.xml);            
            fm.deleteFile(result.pdf);            
            result["success"] = "OK";
            
            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });

        app.get(`${options.root}/shipments`, async function(request, response) {
            const queryParams = url.parse(request.url, true).query;
        
            console.log("GET /shipments");
            console.log(queryParams)

            // JBM: Es necesario la busqueda de segundo nivel
            let shipments = await ship.getShipmentsByGuid(hyperion, queryParams.op);
            for (var i=0; i < shipments.length; i++) {
                for (var j=0; j < shipments[i].PackingListItems.length; j++) {
                    let containeditems = await ship.getContainedItems(hyperion.dbx, hyperion.algorithm, 
                        shipments[i].PackingListItems[j].ContainedItems);
                    shipments[i].PackingListItems[j].ContainedItems = containeditems;
                }
            }
            
            response.setHeader("Content-Type", "application/json");
            response.send(shipments);
        });

        app.post(`${options.root}/shipments`, async function(request, response) {
            let result = {};
            await ship.updateShipmentByGuid(hyperion, request.body);
            result["success"] = "OK";
            
            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });
        
        app.put(`${options.root}/shipments`, async function(request, response) {
            let result = {};

            let resultSave;
            let fileNameXML = request.body.tipodocumento+"_"+request.body.documento+".xml";
            resultSave = fm.saveFileBase64(fileNameXML, request.body.xml);
            result["xml"] = resultSave.file;
            let fileNamePDF = request.body.tipodocumento+"_"+request.body.documento+".pdf";
            resultSave = fm.saveFileBase64(fileNamePDF, request.body.pdf);
            result["pdf"] = resultSave.file;

            await ship.saveAttachmentsShipmentByGuid(hyperion, request.body, result.xml, result.pdf);
            fm.deleteFile(result.xml);            
            fm.deleteFile(result.pdf);            
            result["success"] = "OK";
            
            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });

        // config routes
        app.get(`${options.root}/config`, function(request, response) {
            let fileLoc = path.join(process.env.ExtensionConfigFolder, "configuracion.json");
            let content = "{}";
            if (fs.existsSync(fileLoc)) {
                content = fs.readFileSync(fileLoc, "utf8");
            } else {
                fileLoc = path.join(__dirname, "./config", "configuracion.json");
                if (fs.existsSync(fileLoc)) {
                    content = fs.readFileSync(fileLoc, "utf8");
                }
            } 

            response.setHeader("Content-Type", "application/json");
            response.send(JSON.parse(content));
        });

        app.post(`${options.root}/config`, function(request, response) {
            let result = {};
            let fileLoc = path.join(process.env.ExtensionConfigFolder, "configuracion.json");
            if (fs.writeFileSync(fileLoc, JSON.stringify(request.body), "utf8")) {
                result["success"] = "OK";
            }

            response.setHeader("Content-Type", "application/json");
            response.send(result);
        });

        // start your application in the port 8000
        app.listen(options.port, () => {
            console.log(`Server started on port ${options.port} ...`);
        });      

    } else {
        logger.LogMessage(result.error);
        console.log(`Error al inicializar ${JSON.stringify(result.error)} ...`);
    }
});
