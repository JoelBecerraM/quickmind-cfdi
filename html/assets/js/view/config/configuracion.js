
function initConfiguracion() {
    $("#url").html(location.href);

    var onComplete = function(response) {
        setFormValues($("#datos-form"), response);
    }
    loadPage("config", onComplete);

    $("#datos-form").validate({
        rules: {
            compania: {
                required: !0
            },
            usuario: {
                required: !0
            },
            endpoint: {
                required: !0
            },
            apikey: {
                required: !0
            }
        },
        messages: {
            compania: {
                required: "Por favor ingrese la <b>compa&ntilde;&iacute;a</b>."
            },
            usuario: {
                required: "Por favor ingrese el <b>usuario</b>."
            },
            endpoint: {
                required: "Por favor ingrese el <b>endpoint</b>."
            },
            apikey: {
                required: "Por favor ingrese el <b>apikey</b>."
            }
        }
    });

    $("#btn-limpiar").click(function() {
        limpiaForma();
    });
    $("#btn-guardar").click(function() {
        guardarConfiguracion();
    });

    notify("Listo.");
}

function limpiaForma() {
    var $form = $("#datos-form");
    emptyFormValues($form);

    $(window).scrollTop($form.offset().top);

    notify("Listo.");
} 

function guardarConfiguracion() {
    var $form = $("#datos-form");
    var pass = $form.valid();
    if (!pass) {
        notify_error("Hay errores con los datos, favor de corregirlos.");
        return;
    }

    var data = getFormValues($form);
    data["modificado"] = getISODateTime();

    var onFail = function(err) {
        error("Error al guardar la Configuracion.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    };
    var onError = function(response) {
        if (response.exception.indexOf("WebException")!==-1) {
            notify_warning(response.mensaje);
        } else {
            notify_error(response.exception);
        }
    };
    var onComplete = function(response) {
        var inicio = function() {
        };
        success("Configuracion guardada correctamente.", inicio);
    };
    post("config", data, onComplete, onFail, onError);
}
