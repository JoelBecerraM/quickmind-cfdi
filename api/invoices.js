
//
//
//

async function getCustomFieldsDefinitions(dbx, algorithm, list) {
    let fields = [];
    await algorithm.forEach(dbx.using(list)).callback(
        async function (f) {
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
    return fields;
}

async function getCurrency(dbx, algorithm, c) {
    let currency = {
        DecimalPlaces: c.DecimalPlaces,
        ExchangeRate: c.ExchangeRate,
        Name: c.Name,
        Symbol: c.Symbol
    };
    return currency;
}

async function getChargeDefinition(dbx, algorithm, c) {
    let charge = {
        Amount: c.Amount,
        Code: c.Code,
        Currency: await getCurrency(dbx, algorithm, c.Currency),
        CustomFieldDefinitions: c.CustomFieldDefinitions,
        CustomFields: {
            cfdi_claveunidad: c.CustomFields.cfdi_claveunidad,
            cfdi_claveproductoservicio: c.CustomFields.cfdi_claveproductoservicio,
            cfdi_unidadmedida: c.CustomFields.cfdi_unidadmedida
            },
        Description: c.Description
    };
    return charge;
}

async function getCharges(dbx, algorithm, list) {
    let charges = [];
    await algorithm.forEach(dbx.using(list)).callback(
        async function (c) {
            let charge = {
                Amount: c.Amount,
                ChargeDefinition: await getChargeDefinition(dbx, algorithm, c.ChargeDefinition),
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

async function getEntity(dbx, algorithm, e) {
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

async function getRelated(dbx, algorithm, r) {
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
        Entity: await getEntity(dbx, algorithm, i.Entity),
        EntityName: i.EntityName,
        GUID: i.GUID,
        id: i.id,
        IsFiscalPrinted: i.IsFiscalPrinted,
        TaxAmount: i.TaxAmount,
        TotalAmount: i.TotalAmount
    }
    if (i.RelatedObject) {
        let related = await getRelated(dbx, algorithm, i.RelatedObject);
        invoice.Related = related;
    }
    return invoice;
}

async function getInvoicesByGuid(hyperion, guid) {
    const list = hyperion.dbx.Accounting.Invoice.ListByTime;
    const foundInvoice = await hyperion.algorithm.find(hyperion.dbx.using(list))
        .where(current => current.GUID === guid);
    let invoices = [];
    if (foundInvoice) {
        let invoice = await getInvoiceData(hyperion.dbx, hyperion.algorithm, foundInvoice);
        invoices.push(invoice);
    }
    return invoices;
}

async function getInvoices(hyperion) {
    const list = hyperion.dbx.Accounting.Invoice.ListByTime;
    let invoices = [];
    await hyperion.algorithm.forEach(hyperion.dbx.using(list)).callback(
        async function (i) {
            let invoice = await getInvoiceData(hyperion.dbx, hyperion.algorithm, i);
            invoices.push(invoice);
        });
    return invoices;
}

async function updateInvoiceByGuid(hyperion, data) {
    const list = hyperion.dbx.Accounting.Invoice.ListByTime;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list))
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

module.exports  = {
    getCustomFieldsDefinitions: getCustomFieldsDefinitions,
    getInvoicesByGuid: getInvoicesByGuid,
    getInvoices: getInvoices,
    updateInvoiceByGuid: updateInvoiceByGuid
}

//
//
//