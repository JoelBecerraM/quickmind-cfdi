
const fm = require('./fileManager.js');

async function addCustomField(hyperion, InternalName, DisplayName, Category, ObjectType, Type, callback, description) {
    if (!ObjectType)
        return;

    let definitions_list = hyperion.dbx.CustomField.Definition.Lists.at(ObjectType);
    let custom_field_exists = definitions_list && await hyperion.algorithm.find(hyperion.dbx.using(definitions_list))
        .where(function (obj) {
            return obj.InternalName === InternalName;
        });

    var cf = new hyperion.dbx.DbClass.CustomFieldDefinition();
    cf.ObjectType = ObjectType;
    cf.InternalName = InternalName;
    cf.DisplayName = DisplayName;
    cf.Category = Category;
    cf.Type = Type;
    if (description)
        cf.Description = description;
    if (callback)
        callback(cf);

    if (custom_field_exists) {

        /*console.log(`Edit custom field ${ObjectType} ${InternalName} ${DisplayName} ...`);
        let editTrans = await hyperion.dbw.edit(custom_field_exists);

        editTrans.ObjectType = ObjectType;
        editTrans.InternalName = InternalName;
        editTrans.DisplayName = DisplayName;
        editTrans.Category = Category;
        editTrans.Type = Type;
        if (description)
            editTrans.Description = description;
        if (callback)
            callback(editTrans);

        await hyperion.dbw.save(editTrans);*/

    } else {

        console.log(`Create custom field ${ObjectType} ${InternalName} ${DisplayName} ...`);
        await hyperion.dbw.save(cf);

    }
}

async function createCustomFields(hyperion) {
    let category = 'CFDI';

    let regimenfiscal = fm.textToArray("regimenfiscal.txt");
    let regimenfiscalOptions = (cf) => {
        cf.PickItems = regimenfiscal;
    };
    
    await addCustomField(hyperion, "cfdi_regimenfiscal", "Régimen Fiscal", category, 
        hyperion.dbx.Common.DbClassType.Company, hyperion.dbx.CustomField.Definition.DataType.PickList, 
        regimenfiscalOptions, "Regimen Fiscal del SAT");
    
    await addCustomField(hyperion, "cfdi_regimenfiscal", "Régimen Fiscal", category, 
        hyperion.dbx.Common.DbClassType.Client, hyperion.dbx.CustomField.Definition.DataType.PickList, 
        regimenfiscalOptions, "Regimen Fiscal del SAT");

    let usocfdi = fm.textToArray("usocfdi.txt");
    let usocfdiOptions = (cf) => {
        cf.PickItems = usocfdi;
    };
    
    await addCustomField(hyperion, "cfdi_usocfdi", "Uso de CFDI", category, 
        hyperion.dbx.Common.DbClassType.Client, hyperion.dbx.CustomField.Definition.DataType.PickList, 
        usocfdiOptions, "Uso de CFDI del SAT");

    let formadepago = fm.textToArray("formadepago.txt");
    let formadepagoOptions = (cf) => {
        cf.PickItems = formadepago;
    };
    
    await addCustomField(hyperion, "cfdi_formadepago", "Forma de Pago",  category, 
        hyperion.dbx.Common.DbClassType.Client, hyperion.dbx.CustomField.Definition.DataType.PickList, 
        formadepagoOptions, "Forma de Pago del SAT");

    let metododepago = fm.textToArray("metododepago.txt");
    let metododepagoOptions = (cf) => {
        cf.PickItems = metododepago;
    };
    
    await addCustomField(hyperion, "cfdi_metododepago", "Metodo de Pago", category, 
        hyperion.dbx.Common.DbClassType.Client, hyperion.dbx.CustomField.Definition.DataType.PickList, 
        metododepagoOptions, "Metodo de Pago del SAT");
    
    await addCustomField(hyperion, "cfdi_numctapago", "Numero de Cuenta", category, 
        hyperion.dbx.Common.DbClassType.Client, hyperion.dbx.CustomField.Definition.DataType.String, 
        null, "Numero de Cuenta");
    
    let claveunidad = fm.textToArray("claveunidad.txt");
    let claveunidadOptions = (cf) => {
        cf.PickItems = claveunidad;
        cf.DefaultValue = "E48 | Unidad de servicio";
    };

    await addCustomField(hyperion, "cfdi_claveunidad", "Clave Unidad", category, 
        hyperion.dbx.Common.DbClassType.ChargeDefinition, hyperion.dbx.CustomField.Definition.DataType.PickList, 
        claveunidadOptions, "Clave Unidad del SAT");

    await addCustomField(hyperion, "cfdi_claveproductoservicio", "Clave Producto o Servicio", category, 
        hyperion.dbx.Common.DbClassType.ChargeDefinition, hyperion.dbx.CustomField.Definition.DataType.String, 
        null, "Clave Producto o Servicio del SAT");

    let unidadmedidaOptions = (cf) => {
        cf.DefaultValue = "SERVICIO";
    };

    await addCustomField(hyperion, "cfdi_unidadmedida", "Unidad de Medida", category, 
        hyperion.dbx.Common.DbClassType.ChargeDefinition, hyperion.dbx.CustomField.Definition.DataType.String, 
        unidadmedidaOptions, "Unidad de Medida");

    let fieldOptions = (cf) => {
    };    

    await addCustomField(hyperion, "cfdi_tipodocumento", "Tipo Documento", category, 
        hyperion.dbx.Common.DbClassType.Shipment, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "Tipo Documento");

    await addCustomField(hyperion, "cfdi_documento", "Documento", category, 
        hyperion.dbx.Common.DbClassType.Shipment, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "Documento");

    await addCustomField(hyperion, "cfdi_fecha", "Fecha", category, 
        hyperion.dbx.Common.DbClassType.Shipment, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "Fecha");

    await addCustomField(hyperion, "cfdi_uuid", "UUID", category, 
        hyperion.dbx.Common.DbClassType.Shipment, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "UUID");

    await addCustomField(hyperion, "cfdi_tipodocumento", "Tipo Documento", category, 
        hyperion.dbx.Common.DbClassType.Invoice, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "Tipo Documento");

    await addCustomField(hyperion, "cfdi_documento", "Documento", category, 
        hyperion.dbx.Common.DbClassType.Invoice, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "Documento");

    await addCustomField(hyperion, "cfdi_fecha", "Fecha", category, 
        hyperion.dbx.Common.DbClassType.Invoice, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "Fecha");

    await addCustomField(hyperion, "cfdi_uuid", "UUID", category, 
        hyperion.dbx.Common.DbClassType.Invoice, hyperion.dbx.CustomField.Definition.DataType.String, 
        fieldOptions, "UUID");

}

async function initialize(hyperion) {
    let result = {
        success: false,
        error: ""
    };

    try {
        ////let idExt = { company: "quickmind", name: "cfdi" };
        ////fm.initExtensionFolders(idExt, program.networkId);

        createCustomFields(hyperion);

        result.success = true;
        result.error = undefined;
    } catch (error) {
        result.success = false;
        result.error = error
    }

    return result;
}

module.exports = {
    initialize: initialize
}
