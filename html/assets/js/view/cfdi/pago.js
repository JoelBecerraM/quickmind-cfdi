
function initPago(params) {
    
    var onCompleteC = function(response) {
        let $compania = $("#datos-form [name='compania']");
        $compania.val(response.compania);
        $compania.attr("data-record", JSON.stringify(response));
    }
    loadPage("config", onCompleteC);

    var onCompleteI = function(response) {
        let payments = response instanceof Object ?
            response : JSON.parse(response);
        if (payments.length===0) {
            error("No existe informacion de este pago "+params.op);
            return;
        }

        let payment = payments[0];

        let $rfcreceptor = $("#datos-form [name='rfcreceptor']");
        $rfcreceptor.val(payment.Entity.EntityID);
        $rfcreceptor.attr("data-record", JSON.stringify(payments));
        
        let $nombrereceptor = $("#datos-form [name='nombrereceptor']");
        $nombrereceptor.val(payment.EntityName);
        
        let $guid = $("#datos-form [name='guid']");
        $guid.val(payment.GUID);
        
        // Si ya esta timbrado el pago
        if (payment.CustomFields.cfdi_uuid!=="") {
            let $tipodocumento = $("#datos-form [name='tipodocumento']");
            $tipodocumento.val(payment.CustomFields.cfdi_tipodocumento);
            let $documento = $("#datos-form [name='documento']");
            $documento.val(payment.CustomFields.cfdi_documento);
            let $fecha = $("#datos-form [name='fecha']");
            $fecha.val(payment.CustomFields.cfdi_fecha);
            let $uuid = $("#datos-form [name='uuid']");
            $uuid.val(payment.CustomFields.cfdi_uuid);

            habilitaDescarga();
        }
    }
    loadPage("payments?op="+params.op, onCompleteI);

    $("#btn-timbrar").click(function() {
        timbrarPago();
    });

    notify("Listo.");
}

function timbrarPago() {
    let $compania = $("#datos-form [name='compania']");
    let dataconfig = $compania.attr("data-record");
    if (dataconfig==="") {
        error("No puedo recuperar la configuracion.");
        return;
    }

    let config = JSON.parse(dataconfig);

    let $rfcreceptor = $("#datos-form [name='rfcreceptor']");
    let datapayment = $rfcreceptor.attr("data-record");
    if (datapayment==="") {
        error("No puedo recuperar el pago.");
        return;
    }

    let payment = JSON.parse(datapayment);

    var confirm = function() {
        timbrarPagoConfirmado(config, payment);
    };
    question("&iquest;Esta seguro de timbrar el comprobante?", confirm);
}

function timbrarPagoConfirmado(config, payment) {
    var url = config.endpoint+"/v2/API";
    var json = {
        accion: "creaPagoMagaya", 
        compania: config.compania, 
        usuario: config.usuario, 
        token: config.apikey, 
        data: payment
    };

    var data = {
        json: JSON.stringify(json)
    };

    var onFail = function(err) {
        error("Error al crear el Pago.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        let pago = response[0];
        if (!pago.compania) {
            error("No existe informacion del pago creado.");
            return;
        }
        
        let $fecha = $("#datos-form [name='fecha']");
        $fecha.val(pago.fecha);

        let $documento = $("#datos-form [name='documento']");

        if (pago.pago) {
            $documento.val(pago.pago);

            timbrarFacturaConfirmadoII(config, "timbraPago", "pago", pago.pago);
        }
    };
    notify("Generando Pago ...");
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
        error("Error al timbrar el Pago.<br><br><b>("+err.status+") "+err.statusText+"</b>");
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

        guardaPago(response);
    };
    notify("Timbrando Pago ...");
    post(url, data, onComplete, onFail, onError);
}

function guardaPago(response) {
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

        notify("Pago timbrado correctamente.");
        success("Pago timbrado correctamente.");
    };
    post("payments", data, onComplete, onFail, onError);
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

    $("#btn-attach").removeAttr("disabled");
    $("#btn-attach").click(function() {
        guardaAttachments();
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

function guardaAttachments() {
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

    guardaAttachmentsConfirmado(config, tipodocumento, documento);
}    

function guardaAttachmentsConfirmado(config, tipodocumento, documento) {
    var url = config.endpoint+"/v2/API";
    var json = {
        accion: "descargaDocumento", 
        compania: config.compania, 
        usuario: config.usuario, 
        token: config.apikey, 
        tipodocumento: tipodocumento,
        documento: documento
    };

    var data = {
        json: JSON.stringify(json)
    };

    var onFail = function(err) {
        error("Error al descargar el Documento.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        guardaAttachmentsConfirmadoII(response);
    };
    notify("Descargando Documento ...");
    post(url, data, onComplete, onFail, onError);
}

function guardaAttachmentsConfirmadoII(response) {
    let $guid = $("#datos-form [name='guid']");
    var guid = $guid.val();

    var data = {
        guid: guid,
        tipodocumento: response.tipodocumento,
        documento: response.documento,
        xml: response.xml,
        pdf: response.pdf
    };

    var onFail = function(err) {
        error("Error al guardar el Adjunto.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        notify("Documento Descargado Correctamente.");
        success("Documento Descargado Correctamente.");
    };
    put("payments", data, onComplete, onFail, onError);
}