
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

async function getContainedItems(dbx, algorithm, list) {
    let items = [];
    await algorithm.forEach(dbx.using(list)).callback(i => {
        let item = {
            CommodityTypeName: i.CommodityTypeName,
            CustomFieldDefinitions: i.CustomFieldDefinitions,
            CustomFields: {
                subtiporem: i.CustomFields.subtiporem,
                orden_remolque: i.CustomFields.orden_remolque,
                cp_moneda: i.CustomFields.cp_moneda,
                cp_pedimento: i.CustomFields.cp_pedimento
                },
            Description: i.Description,
            GUID: i.GUID,
            Height: i.Height,
            id: i.id,
            IsDangerousGoods: i.IsDangerousGoods,
            Length: i.Length,
            Model: i.Model,
            Package: {
                CustomFieldDefinitions: i.Package.CustomFieldDefinitions,
                CustomFields: {
                    c_claveunidad: i.Package.CustomFields.c_claveunidad,
                    c_tipoembalaje: i.Package.CustomFields.c_tipoembalaje                        
                },
            },
            PackageName: i.PackageName,
            Pieces: i.Pieces,
            SerialNumber: i.SerialNumber,
            TotalValue: i.TotalValue,
            Volume: i.Volume,
            Weight: i.Weight,
            Width: i.Width
        };
        if (i.Hazardous) {
            item["Hazardous"] = {
                MaterialCode: i.Hazardous.MaterialCode,
                MaterialDescription: i.Hazardous.MaterialDescription
            };
        }
        items.push(item);
    });
    return Promise.all(items);
}

async function getShipmentItems(dbx, algorithm, list) {
    let items = [];
    await algorithm.forEach(dbx.using(list)).callback(i => {
        let item = {
            ContainedItems: i.ContainedItems,
            CustomFieldDefinitions: i.CustomFieldDefinitions,
            CustomFields: {
                subtiporem: i.CustomFields.subtiporem,
                orden_remolque: i.CustomFields.orden_remolque
            },
            Description: i.Description,
            GUID: i.GUID,
            id: i.id,
            PackageName: i.PackageName,
            SerialNumber: i.SerialNumber
        };
        items.push(item);
    });
    return Promise.all(items);
}

function getContact(dbx, algorithm, c) {
    let contact = {
        AccountNumber: c.AccountNumber,
        CreationDate: c.CreationDate,
        CustomFieldDefinitions: c.CustomFieldDefinitions,
        CustomFields: {
            tipo_de_figura: c.CustomFields.tipo_de_figura,
            numero_de_licencia: c.CustomFields.numero_de_licencia,
            calle: c.CustomFields.calle,
            numeroexterior: c.CustomFields.numeroexterior,
            numerointerior: c.CustomFields.numerointerior,
            referencia: c.CustomFields.referencia,
            ddom_descripcion: c.CustomFields.ddom_descripcion,
            ddom_codificacion: c.CustomFields.ddom_codificacion
            },
        EntityID: c.EntityID,
        GUID: c.GUID,
        id: c.id,
        Name: c.Name
    };
    return contact;
}

function getCarrier(dbx, algorithm, c) {
    let carrier = {
        AccountNumber: c.AccountNumber,
        CreationDate: c.CreationDate,
        CustomFieldDefinitions: c.CustomFieldDefinitions,
        CustomFields: {
            tipo_de_figura: c.CustomFields.tipo_de_figura,
            numero_de_licencia: c.CustomFields.numero_de_licencia,
            permsct: c.CustomFields.permsct,
            numpermisosct: c.CustomFields.numpermisosct,
            numregidtrib: c.CustomFields.numregidtrib,
            residenciafiscal: c.CustomFields.residenciafiscal,
            calle: c.CustomFields.calle,
            numeroexterior: c.CustomFields.numeroexterior,
            numerointerior: c.CustomFields.numerointerior,
            referencia: c.CustomFields.referencia,
            ddom_descripcion: c.CustomFields.ddom_descripcion,
            ddom_codificacion: c.CustomFields.ddom_codificacion
            },
        EntityID: c.EntityID,
        GUID: c.GUID,
        id: c.id,
        Name: c.Name
    };
    return carrier;
}

function getCustomer(dbx, algorithm, c) {
    let customer = {
        AccountNumber: c.AccountNumber,
        CreationDate: c.CreationDate,
        CustomFieldDefinitions: c.CustomFieldDefinitions,
        CustomFields: {
            numregidtrib: c.CustomFields.numregidtrib,
            residenciafiscal: c.CustomFields.residenciafiscal,
            calle: c.CustomFields.calle,
            numeroexterior: c.CustomFields.numeroexterior,
            numerointerior: c.CustomFields.numerointerior,
            referencia: c.CustomFields.referencia,
            ddom_descripcion: c.CustomFields.ddom_descripcion,
            ddom_codificacion: c.CustomFields.ddom_codificacion                      
            },
        EntityID: c.EntityID,
        GUID: c.GUID,
        id: c.id,
        Name: c.Name
    };
    return customer;
}

async function getShipmentData(dbx, algorithm, s) {
    let shipment = {
        CreatedByName: s.CreatedByName,
        CustomFieldDefinitions: s.CustomFieldDefinitions,
        CustomFields: {
            asegurarespcivil: s.CustomFields.asegurarespcivil,
            polizarespcivil: s.CustomFields.polizarespcivil,
            aseguramedambiente: s.CustomFields.aseguramedambiente,
            polizamedambiente: s.CustomFields.polizamedambiente,
            aseguracarga: s.CustomFields.aseguracarga,
            polizacarga: s.CustomFields.polizacarga,
            primaseguro: s.CustomFields.primaseguro,
            clave_y_tipo_de_transporte: s.CustomFields.clave_y_tipo_de_transporte,
            totaldistrec: s.CustomFields.totaldistrec,
            or_tipoubicacion: s.CustomFields.or_tipoubicacion,
            or_idubicacion: s.CustomFields.or_idubicacion,
            de_tipoubicacion: s.CustomFields.de_tipoubicacion,
            de_idubicacion: s.CustomFields.de_idubicacion,
            distanciarecorrida: s.CustomFields.distanciarecorrida,
            or_domicilio: getCustomer(dbx, algorithm, s.CustomFields.or_domicilio),
            de_domicilio: getCustomer(dbx, algorithm, s.CustomFields.de_domicilio),
            tr_domicilio: getCarrier(dbx, algorithm, s.CustomFields.tr_domicilio),
            edit_anio_modelo: s.CustomFields.edit_anio_modelo,
            econfigvehicular: s.CustomFields.econfigvehicular,
            eparte_del_transporte: s.CustomFields.eparte_del_transporte,
            op_domicilio: getContact(dbx, algorithm, s.CustomFields.op_domicilio),
            transpinternac: s.CustomFields.transpinternac,
            paisorigendestino: s.CustomFields.paisorigendestino,
            tipofigura: s.CustomFields.tipofigura,
            entradasalidamerc: s.CustomFields.entradasalidamerc,
            viaentradasalida: s.CustomFields.viaentradasalida,
            pesobrutototal: s.CustomFields.pesobrutototal,
            unidadpeso: s.CustomFields.unidadpeso,
            numtotalmercancias: s.CustomFields.numtotalmercancias,
            cantidadtransporta: s.CustomFields.cantidadtransporta,
            cfdi_tipodocumento: s.CustomFields.cfdi_tipodocumento,
            cfdi_documento: s.CustomFields.cfdi_documento,
            cfdi_fecha: s.CustomFields.cfdi_fecha,
            cfdi_uuid: s.CustomFields.cfdi_uuid,
            },
        CustomerReferenceNumber: s.CustomerReferenceNumber,
        CutoffDate: s.CutoffDate,
        EstimatedArrivalDate: s.EstimatedArrivalDate,
        EstimatedDepartureDate: s.EstimatedDepartureDate,
        GUID: s.GUID,
        id: s.id,
        IssuedByAddress: getAddress(s.IssuedByAddress),
        IssuedByName: s.IssuedByName,
        Name: s.Name,
        PackingListItems: await getShipmentItems(dbx, algorithm, s.PackingList.Items),
        PickupDate: s.PickupDate,
        ShipperAddress: getAddress(s.ShipperAddress),
        ShipperName: s.ShipperName,
        TotalPieces: s.TotalPieces,
        TotalVolume: s.TotalVolume,
        TotalVolumeWeight: s.TotalVolumeWeight,
        TotalWeight: s.TotalWeight,
        VehicleNumber: s.VehicleNumber
    };
    if (s.DestinationPort) {
        shipment.DestinationPort = {
            Code: s.DestinationPort.Code,
            Country: s.DestinationPort.Country.Code,
            CountryId: s.DestinationPort.Country.id,
            CountryName: s.DestinationPort.Country.Name,
            id: s.DestinationPort.id,
            Method: s.DestinationPort.Method,
            Name: s.DestinationPort.Name,
            Notes: s.DestinationPort.Notes,
            Remarks: s.DestinationPort.Remarks,
            Subdivision: s.DestinationPort.Subdivision
        }
    }
    return shipment;
}

async function getShipmentsByGuid(hyperion, guid) {
    const list = hyperion.dbx.Shipping.Shipment.ListByGuid;
    const found = await hyperion.algorithm.find(hyperion.dbx.using(list)
        .from(guid).to(guid))
        .where(current => current.GUID === guid);
    let shipments = [];
    if (found) {
        let shipment = await getShipmentData(hyperion.dbx, hyperion.algorithm, found);
        shipments.push(shipment);
    }
    return shipments;
}

async function updateShipmentByGuid(hyperion, data) {
    const list = hyperion.dbx.Shipping.Shipment.ListByGuid;
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

module.exports = {    
    getCustomFieldsDefinitions: getCustomFieldsDefinitions,
    getContainedItems: getContainedItems,
    getShipmentsByGuid: getShipmentsByGuid,
    updateShipmentByGuid: updateShipmentByGuid
}

//
//
//