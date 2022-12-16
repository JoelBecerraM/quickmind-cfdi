
function initFactura(params) {
    
    var onCompleteC = function(response) {
        let $compania = $("#datos-form [name='compania']");
        $compania.val(response.compania);
        $compania.attr("data-record", JSON.stringify(response));
    }
    loadPage("config", onCompleteC);

    var onCompleteI = function(response) {
        let invoices = response instanceof Object ?
            response : JSON.parse(response);
        if (invoices.length===0) {
            error("No existe informacion de esta factura "+params.op);
            return;
        }

        let invoice = invoices[0];

        let $rfcreceptor = $("#datos-form [name='rfcreceptor']");
        $rfcreceptor.val(invoice.Entity.EntityID);
        $rfcreceptor.attr("data-record", JSON.stringify(invoices));
        
        let $nombrereceptor = $("#datos-form [name='nombrereceptor']");
        $nombrereceptor.val(invoice.EntityName);
        
        let $guid = $("#datos-form [name='guid']");
        $guid.val(invoice.GUID);
        
        // Si ya esta timbrado el envio
        if (invoice.CustomFields.cfdi_uuid!=="") {
            let $tipodocumento = $("#datos-form [name='tipodocumento']");
            $tipodocumento.val(invoice.CustomFields.cfdi_tipodocumento);
            let $documento = $("#datos-form [name='documento']");
            $documento.val(invoice.CustomFields.cfdi_documento);
            let $fecha = $("#datos-form [name='fecha']");
            $fecha.val(invoice.CustomFields.cfdi_fecha);
            let $uuid = $("#datos-form [name='uuid']");
            $uuid.val(invoice.CustomFields.cfdi_uuid);

            habilitaDescarga();
        }
    }
    loadPage("invoices?op="+params.op, onCompleteI);

    $("#btn-timbrar").click(function() {
        timbrarFactura();
    });

    notify("Listo.");
}

function timbrarFactura() {
    let $compania = $("#datos-form [name='compania']");
    let dataconfig = $compania.attr("data-record");
    if (dataconfig==="") {
        error("No puedo recuperar la configuracion.");
        return;
    }

    let config = JSON.parse(dataconfig);

    let $rfcreceptor = $("#datos-form [name='rfcreceptor']");
    let datainvoice = $rfcreceptor.attr("data-record");
    if (datainvoice==="") {
        error("No puedo recuperar la factura.");
        return;
    }

    let invoice = JSON.parse(datainvoice);

    var confirm = function() {
        timbrarFacturaConfirmado(config, invoice);
    };
    question("&iquest;Esta seguro de timbrar el comprobante?", confirm);
}

function timbrarFacturaConfirmado(config, invoice) {
    var url = config.endpoint+"/v2/API";
    var json = {
        accion: "creaFacturaMagaya", 
        compania: config.compania, 
        usuario: config.usuario, 
        token: config.apikey, 
        data: invoice
    };

    var data = {
        json: JSON.stringify(json)
    };

    var onFail = function(err) {
        error("Error al crear la Factura.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        let factura = response[0];
        if (!factura.compania) {
            error("No existe informacion de la factura creada.");
            return;
        }
        
        let $fecha = $("#datos-form [name='fecha']");
        $fecha.val(factura.fecha);

        let $documento = $("#datos-form [name='documento']");

        if (factura.factura) {
            $documento.val(factura.factura);

            timbrarFacturaConfirmadoII(config, "timbraFactura", "factura", factura.factura);
        }
        if (factura.cartaporte) {
            $documento.val(factura.cartaporte);

            timbrarFacturaConfirmadoII(config, "timbraCartaPorte", "cartaporte", factura.cartaporte);
        }
    };
    notify("Generando Factura ...");
    post(url, data, onComplete, onFail, onError);
}

function timbrarFacturaConfirmadoII(config, accion, nombre, documento) {
    var url = config.endpoint+"/v2/API";
    var json = {
        accion: accion, 
        compania: config.compania, 
        usuario: config.usuario, 
        token: config.apikey, 
    };
    json[nombre] = documento;

    var data = {
        json: JSON.stringify(json)
    };

    var onFail = function(err) {
        error("Error al timbrar la Factura.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        if (response.uuid==="") {
            error("No se pudo generar el CFDI. <b>"+response.cadenaoriginal+"</b>");
            return;
        }

        let $tipodocumento = $("#datos-form [name='tipodocumento']");
        $tipodocumento.val(response.tipodocumento);

        let $uuid = $("#datos-form [name='uuid']");
        $uuid.val(response.uuid);
        $uuid.attr("data-record", JSON.stringify(response));

        guardaFactura(response);
    };
    notify("Timbrando Factura ...");
    post(url, data, onComplete, onFail, onError);
}

function guardaFactura(response) {
    let $guid = $("#datos-form [name='guid']");
    var guid = $guid.val();

    var data = {
        guid: guid,
        tipodocumento: response.tipodocumento,
        documento: response.documento,
        fecha: response.fecertificacion,
        uuid: response.uuid
    };

    var onFail = function(err) {
        error("Error al guardar la Factura.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        habilitaDescarga();

        notify("Factura timbrada correctamente.");
        success("Factura timbrada correctamente.");
    };
    post("invoices", data, onComplete, onFail, onError);
}

function habilitaDescarga() {
    $("#btn-timbrar").attr("disabled", true);

    $("#btn-pdf").removeAttr("disabled");
    $("#btn-pdf").click(function() {
        descargaDocumento("downloadPDF");
    });

    $("#btn-xml").removeAttr("disabled");
    $("#btn-xml").click(function() {
        descargaDocumento("downloadXML");
    });
}

function descargaDocumento(tipo) {
    let $compania = $("#datos-form [name='compania']");
    let dataconfig = $compania.attr("data-record");
    if (dataconfig==="") {
        error("No puedo recuperar la configuracion.");
        return;
    }

    let config = JSON.parse(dataconfig);

    let $tipodocumento = $("#datos-form [name='tipodocumento']");
    let tipodocumento = $tipodocumento.val();

    let $documento = $("#datos-form [name='documento']");
    let documento = $documento.val();

    var complete = function() {
        notify("Listo.");
    };
    var params = "compania="+config.compania+"&tipodocumento="+tipodocumento+"&documento="+documento;
    download(config.endpoint+"/Documento?tipo="+tipo+"&"+params, complete);
}

