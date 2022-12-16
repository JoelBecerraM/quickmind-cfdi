function viewMain() {
    function onComplete() {
        function onCompleteII() {
            initMain();
        };
        loadScript("assets/js/view/main.js", onCompleteII);
    };

    loadMainContainer("assets/view/main.html", onComplete);
}

function viewFactura(params) {
    var state = {
        func: "_viewFactura",
        params: params
    };
    pushState(state);

    _viewFactura(params);
}

function _viewFactura(params) {
    function onComplete() {
        function onCompleteII() {
            initFactura(params);
        };
        loadScript("assets/js/view/cfdi/factura.js", onCompleteII);
    };

    loadMainContainer("assets/view/cfdi/factura.html", onComplete);
}

function viewEnvio(params) {
    var state = {
        func: "_viewEnvio",
        params: params
    };
    pushState(state);

    _viewEnvio(params);
}

function _viewEnvio(params) {
    function onComplete() {
        function onCompleteII() {
            initEnvio(params);
        };
        loadScript("assets/js/view/cfdi/envio.js", onCompleteII);
    };

    loadMainContainer("assets/view/cfdi/envio.html", onComplete);
}

function viewConfiguracion() {
    var state = {
        func: "_viewConfiguracion"
    };
    pushState(state);

    _viewConfiguracion();
}

function _viewConfiguracion() {
    function onComplete() {
        function onCompleteII() {
            initConfiguracion();
        };
        loadScript("assets/js/view/config/configuracion.js", onCompleteII);
    };

    loadMainContainer("assets/view/config/configuracion.html", onComplete);
}

function perfilUsuario() {
    var state = {
        func: "_perfilUsuario"
    };
    pushState(state);

    _perfilUsuario();
}

function perfilUsuario() {
    function onComplete() {
        function onCompleteII() {
            initPerfilUsuario();
        };
        loadScript("assets/js/view/config/perfilusuario.js", onCompleteII);
    };

    loadMainContainer("assets/view/config/perfilusuario.html", onComplete);
}

//
//
//

function validaPermiso(permiso) {
    if (mobile)
        Codebase.layout("sidebar_toggle");

    if (!usuario.permisos.includes(permiso)) {
        warning("Usted no tiene permiso para esta opci&oacute;n \"<b>"+permiso+"</b>\".");
        return false;
    }

    return true;
}

function pushState(state) {
    //console.log("pushState");
    //console.log(state);
    window.history.pushState(state, null, "");
}

function renderState(state) {
    //console.log("renderState");
    //console.log(state);
    if (!state)
        return;
    if (!state.func)
        return;
    if (!state.data) {
        var fn = window[state.func];
        if (typeof fn==="function")
            fn.apply(null, null);
    } else {
        if (state.func==="_viewFactura") {
            _viewFactura(state.data.params);
        }
        if (state.func==="_viewEnvio") {
            _viewEnvio(state.data.params);
        }
    }
}

var Constantes = {
    DOCUMENTO_CARTAPORTE_MANUAL : "Manual",
    DOCUMENTO_FACTURA_MANUAL : "FacturaManual",

    STATUS_TIMBRADO_PENDIENTE : "PENDIENTE",
    STATUS_TIMBRADO_UUID : "TIMBRADO",
    STATUS_TIMBRADO_ERROR_0 : "REINTENTAR",
    STATUS_TIMBRADO_ERROR_1 : "ERROR",
    STATUS_TIMBRADO_CANCELADO : "CANCELADO",
    STATUS_TIMBRADO_BORRADO : "ELIMINADO"
};

function initApp() {
    jQuery.extend(!0, jQuery.fn.dataTable.defaults, {
        language: {
            aria: {
                sortAscending: "Activar para ordenar la columna de manera ascendente",
                sortDescending: "Activar para ordenar la columna de manera descendente"
            },
            decimal: ".", thousands: ",", infoThousands: ",",
            lengthMenu: "_MENU_", search: "_INPUT_", searchPlaceholder: "Filtrar ...",
            loadingRecords: "Cargando ...", processing: "Procesando ...",
            emptyTable: "<span class=\"text-warning\">No hay datos disponibles en la tabla</span>",
            zeroRecords: "<span class=\"text-warning\">No se encontraron coincidencias</span>", infoEmpty: "",
            infoFiltered: "<span class=\"text-info\">(Filtrado de un total de _MAX_ entradas)</span>",
            info: "", //"Pagina <strong>_PAGE_</strong> de <strong>_PAGES_</strong>",
            paginate: {
                first: '<i class="fa fa-angle-double-left"></i>', previous: '<i class="fa fa-angle-left"></i>',
                next: '<i class="fa fa-angle-right"></i>', last: '<i class="fa fa-angle-double-right"></i>'}
        }
    });
    jQuery.validator.addMethod("minValue",
        function (value, element) {
            var minValue = element.getAttribute("data-min-value");
            if (!minValue)
                minValue = "0";
            return this.optional(element) || parseFloat(value)>parseFloat(minValue);
            },
        "Por favor debe de escribir una cantidad mayor.");
    jQuery.validator.addMethod("maxValue",
        function (value, element) {
            var maxValue = element.getAttribute("data-max-value");
            if (!maxValue)
                maxValue = "0";
            return this.optional(element) || parseFloat(value)<parseFloat(maxValue);
            },
        "Por favor debe de escribir una cantidad menor.");
    jQuery.validator.addMethod("digitsOnly",
        function (value, element) {
            var maxDigits = element.getAttribute("data-max-digits");
            if (!maxDigits)
                maxDigits = 4;
            var pattern = new RegExp("^\\-?\\d{0,"+maxDigits+"}$");
            return this.optional(element) || pattern.test(value);
            },
        "Por favor ingrese solo <b>d&iacute;gitos</b>.");
    jQuery.validator.addMethod("digitsWhitDecimals",
        function (value, element) {
            var maxDigits = element.getAttribute("data-max-digits");
            if (!maxDigits)
                maxDigits = 4;
            var maxDecimalDigits = element.getAttribute("data-max-decimal-digits");
            if (!maxDecimalDigits)
                maxDecimalDigits = 2;
            var pattern = new RegExp("^[0-9]{1,"+maxDigits+"}(.[0-9]{1,"+maxDecimalDigits+"})?$");
            return this.optional(element) || pattern.test(value);
            },
        "Por favor ingrese un <b>numero entero con posiciones decimales</b>.");
    jQuery.validator.addMethod("hardPassword",
        function (value, element) {
            // Un especial, un digito, una minuscula, una mayuscula de 8 a 20
            //return this.optional(element) || /^(?=.*[!@#$%^&_])(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/.test(value);
            //
            // Un especial y una mayuscula
            return this.optional(element) || /^(?=.*[.,;:*()%$@+-/=])(?=.*[A-Z]).{8,20}$/.test(value);
            },
        "Por favor ingrese un <b>password</b> v&aacute;lido, m&iacute;nimo de 8 caracteres, que lleve una may&uacute;scula y un car&aacute;cter especial.");
    jQuery.validator.addMethod("rfc",
        function (value, element) {
            return this.optional(element) || /[A-Za-z&amp;ñÑ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Za-z0-9]{2}[0-9Aa]/.test(value);
            },
        "Por favor ingrese un <b>rfc</b> v&aacute;lido.");
    jQuery.validator.addMethod("placaVehicular",
        function (value, element) {
            var pattern = new RegExp("^[a-zA-Z0-9]{5,7}$");
            return this.optional(element) || pattern.test(value);
            },
        "Por favor ingrese una <b>placa</b> v&aacute;lida, debe de tener de 5 a 7 car&aacute;cteres, solo n&uacute;meros o letras.");
    jQuery.validator.addMethod("anioModeloVehiculo",
        function (value, element) {
            return this.optional(element) || /(19[0-9]{2}|20[0-9]{2})/.test(value);
            },
        "Por favor ingrese un <b>a&ntilde;o de modelo</b> v&aacute;lido, 1900 - 2099.");

    window.onresize = function() {
        mobile = isMobile();
    };
    window.history.replaceState(null, null, "");
    window.onpopstate = function(event) {
        if (event.state) {
            renderState(event.state);
        }
    };

    var codebaseDarkMode = window.localStorage.getItem("codebaseDarkMode");
    darkmode = !codebaseDarkMode ? false : true;

    mobile = isMobile();

    Codebase.layout("sidebar_toggle");

    let query = location.search;
    const params = parseQueryString(query);

    if (!params.view) {
        viewMain();
    } else {
        if (params.view==="config")
            viewConfiguracion();
        else if (params.view==="invoice")
            viewFactura(params);
        else if (params.view==="shipment")
            viewEnvio(params);            
    }
}

function parseQueryString(qs) {
    var query = {};
    var pairs = qs.
        replace(/^\?/, '').
        split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair[0]!=="")
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}  

function toggleDarkMode() {
    Codebase.layout("dark_mode_toggle");

    var codebaseDarkMode = window.localStorage.getItem("codebaseDarkMode");
    darkmode = !codebaseDarkMode ? false : true;

    Codebase._uiHandleTheme();
}

function togglePassword(input) {
    var $input = $("#"+input);
    var type = $input.attr("type")==="password" ? "text" : "password";
    $input.attr("type", type);

    var $btn = $input.parent().parent().find(".btn");
    if ($btn.hasClass("active"))
        $btn.removeClass("active");
    else
        $btn.addClass("active");
}

function seleccionaAvatar(avatar) {
    var img = "assets/media/avatars/avatars-"+avatar+".png";
    $("#datos-form  [name=avatar]").val(img);
    $("#avatar-img").attr("src", img);
}