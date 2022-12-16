
function initEnvio(params) {
    
    var onCompleteC = function(response) {
        let $compania = $("#datos-form [name='compania']");
        $compania.val(response.compania);
        $compania.attr("data-record", JSON.stringify(response));
    }
    loadPage("config", onCompleteC);

    var onCompleteI = function(response) {
        let shipments = response instanceof Object ? 
            response : JSON.parse(response);
        if (shipments.length===0) {
            error("No existe informacion de este envio "+params.op);
            return;
        }

        let shipment = shipments[0];        

        let $nombre = $("#datos-form [name='nombre']");
        $nombre.val(shipment.Name);
        $nombre.attr("data-record", JSON.stringify(shipments));
        
        let $guid = $("#datos-form [name='guid']");
        $guid.val(shipment.GUID);
        
        // Si ya esta timbrado el envio
        if (shipment.CustomFields.cfdi_uuid!=="") {
            let $tipodocumento = $("#datos-form [name='tipodocumento']");
            $tipodocumento.val(shipment.CustomFields.cfdi_tipodocumento);
            let $documento = $("#datos-form [name='documento']");
            $documento.val(shipment.CustomFields.cfdi_documento);
            let $fecha = $("#datos-form [name='fecha']");
            $fecha.val(shipment.CustomFields.cfdi_fecha);
            let $uuid = $("#datos-form [name='uuid']");
            $uuid.val(shipment.CustomFields.cfdi_uuid);

            habilitaDescarga();
        }
    }
    loadPage("shipments?op="+params.op, onCompleteI);

    $("#btn-timbrar").click(function() {
        timbrarEnvio();
    });

    notify("Listo.");
}

function timbrarEnvio() {
    let $compania = $("#datos-form [name='compania']");
    let dataconfig = $compania.attr("data-record");
    if (dataconfig==="") {
        error("No puedo recuperar la configuracion.");
        return;
    }

    let config = JSON.parse(dataconfig);

    let $nombre = $("#datos-form [name='nombre']");
    let datashipment = $nombre.attr("data-record");
    if (datashipment==="") {
        error("No puedo recuperar el envio.");
        return;
    }

    let shipment = JSON.parse(datashipment);

    var confirm = function() {
        timbrarEnvioConfirmado(config, shipment);
    };
    question("&iquest;Esta seguro de timbrar el comprobante?", confirm);
}

function timbrarEnvioConfirmado(config, shipment) {
    var url = config.endpoint+"/v2/API";
    var json = {
        accion: "creaCartaPorteMagaya", 
        compania: config.compania, 
        usuario: config.usuario, 
        token: config.apikey, 
        data: shipment
    };

    var data = {
        json: JSON.stringify(json)
    };

    var onFail = function(err) {
        error("Error al crear la Carta Porte.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        let cartaporte = response[0];
        if (!cartaporte.compania) {
            error("No existe informacion de la carta porte generada.");
            return;
        }
        
        let $documento = $("#datos-form [name='documento']");
        $documento.val(cartaporte.cartaporte);

        let $fecha = $("#datos-form [name='fecha']");
        $fecha.val(cartaporte.fecha);

        timbrarEnvioConfirmadoII(config, cartaporte);
    };
    notify("Generando Carta Porte ...");
    post(url, data, onComplete, onFail, onError);
}

function timbrarEnvioConfirmadoII(config, cartaporte) {
    var url = config.endpoint+"/v2/API";
    var json = {
        accion: "timbraCartaPorte", 
        compania: config.compania, 
        usuario: config.usuario, 
        token: config.apikey, 
        cartaporte: cartaporte.cartaporte
    };

    var data = {
        json: JSON.stringify(json)
    };

    var onFail = function(err) {
        error("Error al timbrar la Carta Porte.<br><br><b>("+err.status+") "+err.statusText+"</b>");
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

        guardaEnvio(response);
    };
    notify("Timbrando Carta Porte ...");
    post(url, data, onComplete, onFail, onError);
}

function guardaEnvio(response) {
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
        error("Error al guardar el Envio.<br><br><b>("+err.status+") "+err.statusText+"</b>");
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

        notify("Carta Porte timbrada correctamente.");
        success("Carta Porte timbrada correctamente.");
    };
    post("shipments", data, onComplete, onFail, onError);
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
