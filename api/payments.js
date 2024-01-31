
//
//
//

function getCurrency(dbx, algorithm, c) {
    let currency = {
        Code: c.Code,
        DecimalPlaces: c.DecimalPlaces,
        ExchangeRate: c.ExchangeRate,
        Name: c.Name,
        Symbol: c.Symbol
    };
    return currency;
}

async function getPaymentItems(dbx, algorithm, list) {
    let paymentItems = [];
    await algorithm.forEach(dbx.using(list)).callback(pi => {
        let paymentItem = {
            AmountPaid: pi.AmountPaid,
            AmountPaidInCurrency: pi.AmountPaidInCurrency,
            IsPaid: pi.IsPaid,
            GUID: pi.ItemPaid.GUID,
            Invoice: {}
        };
        paymentItems.push(paymentItem);
    });
    return paymentItems;
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

async function getPaymentData(dbx, algorithm, p) {
    let payment = {
        CustomFieldDefinitions: p.CustomFieldDefinitions,
        CustomFields: {
            cfdi_tipodocumento: p.CustomFields.cfdi_tipodocumento,
            cfdi_documento: p.CustomFields.cfdi_documento,
            cfdi_fecha: p.CustomFields.cfdi_fecha,
            cfdi_uuid: p.CustomFields.cfdi_uuid,
            cfdi_formadepago: p.CustomFields.cfdi_formadepago,
            cfdi_numoperacion: p.CustomFields.cfdi_numoperacion,
            cfdi_rfcbeneficiario: p.CustomFields.cfdi_rfcbeneficiario,
            cfdi_ctabeneficiario: p.CustomFields.cfdi_ctabeneficiario
            },
        CreatedOn: p.CreatedOn,
        CreationStamp: p.CreationStamp,
        Currency: getCurrency(dbx, algorithm, p.Currency),
        DbClassType: p.DbClassType,
        Entity: getEntity(dbx, algorithm, p.Entity),
        EntityName: p.EntityName,
        GUID: p.GUID,
        id: p.id,
        Notes: p.Notes,
        Number: p.Number,
        PaymentItems: await getPaymentItems(dbx, algorithm, p.PaymentItems),
        TotalAmount: p.TotalAmount,
        TotalAmountInCurrency: p.TotalAmountInCurrency
    };
    return payment;
}

async function getPaymentsByGuid(hyperion, guid) {
    const list = hyperion.dbx.Accounting.Payment.ListByGuid;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list)
        .from(guid).to(guid))
        .where(current => current.GUID === guid);
    let payments = [];
    if (found) {
        let payment = await getPaymentData(hyperion.dbx, hyperion.algorithm, found);
        payments.push(payment);
    }
    return payments;
}

async function updatePaymentByGuid(hyperion, data) {
    const list = hyperion.dbx.Accounting.Payment.ListByGuid;
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
    const list = hyperion.dbx.Accounting.Payment.ListByGuid;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list)
        .from(data.guid).to(data.guid))
        .where(current => current.GUID === data.guid);
    if (found) {
        let existeAttXML = false;
        let existeAttPDF = false;
        
        if (found.Attachments) {
            await hyperion.algorithm.forEach(hyperion.dbx.using(found.Attachments)).callback(a => {
                let fileName ;
                if (a.Name){
                    fileName = a.Name + "." + a.Extension;
                }
                else if (a.Filename) {
                    fileName = a.Filename + "." + a.FileExtension;
                }

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
        }

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
    getPaymentsByGuid: getPaymentsByGuid,
    updatePaymentByGuid: updatePaymentByGuid,
    saveAttachmentsInvoiceByGuid: saveAttachmentsInvoiceByGuid
}

//
//
//