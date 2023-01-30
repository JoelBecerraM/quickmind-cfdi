
//
//
//

async function getCustomFieldsDefinitions(dbx, algorithm, list) {
    let fields = [];
    await algorithm.forEach(dbx.using(list)).callback(f => {
        let field = {
            Category: f.Category,
            DbClassType: f.DbClassType,
            DisplayName: f.DisplayName,
            id: f.id,
            InternalName: f.InternalName,
            ObjectType: f.ObjectType,
            Type: f.Type
        };
        fields.push(field);
    });
    return Promise.all(fields);
}

function getCurrency(dbx, algorithm, c) {
    let currency = {
        DecimalPlaces: c.DecimalPlaces,
        ExchangeRate: c.ExchangeRate,
        Name: c.Name,
        Symbol: c.Symbol
    };
    return currency;
}

async function getCharges(dbx, algorithm, list) {
    let charges = [];
    await algorithm.forEach(dbx.using(list)).callback(c => {
        let charge = {
            Amount: c.Amount,
            ChargeDefinition: {
                Amount: c.ChargeDefinition.Amount,
                Code: c.ChargeDefinition.Code,
                Currency: getCurrency(dbx, algorithm, c.ChargeDefinition.Currency),
                CustomFieldDefinitions: c.ChargeDefinition.CustomFieldDefinitions,
                CustomFields: {
                    cfdi_claveunidad: c.ChargeDefinition.CustomFields.cfdi_claveunidad,
                    cfdi_claveproductoservicio: c.ChargeDefinition.CustomFields.cfdi_claveproductoservicio,
                    cfdi_unidadmedida: c.ChargeDefinition.CustomFields.cfdi_unidadmedida
                    },
                Description: c.ChargeDefinition.Description
            },
            Price: c.Price,
            Quantity: c.Quantity,
            RetentionRate: c.RetentionRate,
            TaxAmount: c.TaxAmount,
            TaxRate: c.TaxRate
        };
        charges.push(charge);
    });
    return charges;
}

function getAddress(s) {
    if (!s)
        return undefined;
    let address = {
        City: s.City,
        ContactEmail: s.ContactEmail,
        ContactFax: s.ContactFax,
        ContactName: s.ContactName,
        ContactPhone: s.ContactPhone,
        ContactPhoneExtension: s.ContactPhoneExtension,
        CountryName: s.CountryName,
        Description: s.Description,
        id: s.id,
        State: s.State,
        Street: s.Street,
        ZipCode: s.ZipCode
    };
    return address;
}

function getEntity(dbx, algorithm, e) {
    let entity = {
        Address: getAddress(e.Address),
        AccountNumber: e.AccountNumber,
        BillingAddress: getAddress(e.BillingAddress),
        CreationDate: e.CreationDate,
        CustomFieldDefinitions: e.CustomFieldDefinitions,
        CustomFields: {
            numregidtrib: e.CustomFields.numregidtrib,
            residenciafiscal: e.CustomFields.residenciafiscal,
            calle: e.CustomFields.calle,
            numeroexterior: e.CustomFields.numeroexterior,
            numerointerior: e.CustomFields.numerointerior,
            referencia: e.CustomFields.referencia,
            ddom_descripcion: e.CustomFields.ddom_descripcion,
            ddom_codificacion: e.CustomFields.ddom_codificacion,
            cfdi_regimenfiscal: e.CustomFields.cfdi_regimenfiscal,
            cfdi_usocfdi: e.CustomFields.cfdi_usocfdi,
            cfdi_formadepago: e.CustomFields.cfdi_formadepago,
            cfdi_metododepago: e.CustomFields.cfdi_metododepago,
            cfdi_numctapago: e.CustomFields.cfdi_numctapago
            },
        Email: e.Email,
        EntityID: e.EntityID,
        GUID: e.GUID,
        id: e.id,
        Name: e.Name
    };
    return entity;
}

function getRelated(dbx, algorithm, r) {
    let related = {
        GUID: r.GUID,
        id: r.id,
        Name: r.Name,
        Type: r.Type
    };
    return related;
}

async function getInvoiceData(dbx, algorithm, i) {
    let invoice = {
        CustomFieldDefinitions: i.CustomFieldDefinitions,
        CustomFields: {
            cfdi_tipodocumento: i.CustomFields.cfdi_tipodocumento,
            cfdi_documento: i.CustomFields.cfdi_documento,
            cfdi_fecha: i.CustomFields.cfdi_fecha,
            cfdi_uuid: i.CustomFields.cfdi_uuid,
            },
        BillingAddress: getAddress(i.BillingAddress),
        Charges: await getCharges(dbx, algorithm, i.Charges),
        CreatedOn: i.CreatedOn,
        CreationStamp: i.CreationStamp,
        DueDate: i.DueDate,
        Entity: getEntity(dbx, algorithm, i.Entity),
        EntityName: i.EntityName,
        GUID: i.GUID,
        id: i.id,
        IsFiscalPrinted: i.IsFiscalPrinted,
        TaxAmount: i.TaxAmount,
        TotalAmount: i.TotalAmount
    }
    if (i.RelatedObject) {
        let related = getRelated(dbx, algorithm, i.RelatedObject);
        invoice.Related = related;
    }
    return invoice;
}

async function getInvoicesByGuid(hyperion, guid) {
    const list = hyperion.dbx.Accounting.Invoice.ListByGuid;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list)
        .from(guid).to(guid))
        .where(current => current.GUID === guid);
    let invoices = [];
    if (found) {
        let invoice = await getInvoiceData(hyperion.dbx, hyperion.algorithm, found);
        invoices.push(invoice);
    }
    return invoices;
}

async function updateInvoiceByGuid(hyperion, data) {
    const list = hyperion.dbx.Accounting.Invoice.ListByGuid;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list)
        .from(data.guid).to(data.guid))
        .where(current => current.GUID === data.guid);
    if (found) {
        let editTrans = await hyperion.dbw.edit(found);

        editTrans.CustomFields.cfdi_tipodocumento = data.tipodocumento;
        editTrans.CustomFields.cfdi_documento = data.documento;
        editTrans.CustomFields.cfdi_fecha = data.fecha;
        editTrans.CustomFields.cfdi_uuid = data.uuid;

        await hyperion.dbw.save(editTrans);
    }
}

async function saveAttachmentsInvoiceByGuid(hyperion, data, fileXML, filePDF) {
    const list = hyperion.dbx.Accounting.Invoice.ListByGuid;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list)
        .from(data.guid).to(data.guid))
        .where(current => current.GUID === data.guid);
    if (found) {
        let existeAttXML = false;
        let existeAttPDF = false;
        
        await hyperion.algorithm.forEach(hyperion.dbx.using(found.Attachments)).callback(a => {
            let fileName = a.Name+"."+a.Extension;

            let fileNameXML = ""+fileXML;
            if (fileNameXML.length>=fileName.length)
                fileNameXML = fileNameXML.substring(fileNameXML.length - fileName.length);
            let fileNamePDF = ""+filePDF;
            if (fileNamePDF.length>=fileName.length)
                fileNamePDF = fileNamePDF.substring(fileNamePDF.length - fileName.length);
    
            if (fileNameXML===fileName)
                existeAttXML = true;
            if (fileNamePDF===fileName)
                existeAttPDF = true;
        });

        if (!existeAttXML||!existeAttPDF) {
            let editTrans = await hyperion.dbw.edit(found);

            if (!existeAttXML) {
                let attXML = new hyperion.dbx.DbClass.Attachment(fileXML);
                hyperion.dbx.insert(editTrans.Attachments, attXML);
            }
            if (!existeAttPDF) {
                let attPDF = new hyperion.dbx.DbClass.Attachment(filePDF);
                hyperion.dbx.insert(editTrans.Attachments, attPDF);
            }
            
            await hyperion.dbw.save(editTrans);
        }
    }
}

module.exports  = {
    getCustomFieldsDefinitions: getCustomFieldsDefinitions,
    getInvoicesByGuid: getInvoicesByGuid,
    updateInvoiceByGuid: updateInvoiceByGuid,
    saveAttachmentsInvoiceByGuid: saveAttachmentsInvoiceByGuid
}

//
//
//