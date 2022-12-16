
function getDate() {
    var today = new Date();
    var localoffset = -(today.getTimezoneOffset() / 60);
    return new Date(new Date().getTime() + localoffset * 3600 * 1000);
}

function getISODateTime() {
    return replaceAll(getDate().toJSON().substring(0,19), "T", " ");
}

function formatNumber(value) {
    var format = formatMoney(value);
    format = format.substring(1);
    format = format.substring(0, format.length - 3);
    return format;
}

function formatMoney(value) {
    return "$"+parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
}

function formatPercentage(value) {
    return redondea(parseFloat(value) * 100)+"%";
}

function redondea(value, decimals) {
    if (!decimals)
        decimals = 2;
    return Number(parseFloat(value)).toFixed(decimals);
}

function isMobile() {
    var match = window.matchMedia || window.msMatchMedia;
    if(match) {
        var mq = match("(pointer:coarse)");
        return mq.matches;
    }
    return false;
}

function replaceAll(value, find, replace) {
    return value.replace(new RegExp(find, "g"), replace);
}

function replaceAllIgnoreCase(value, find, replace) {
    return value.replace(new RegExp(find, "ig"), replace);
}

function scv(name, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + "; " + expires;
}

function gcv(name) {
    var s = document.cookie;
    var pos = s.indexOf(name + "=");
    if (pos===-1)
        return null;
    var start = pos + name.length + 1;
    var end = s.indexOf(";", start);
    if (end===-1)
        end = s.length;
    return s.substring(start, end);
}

function rcv(name) {
    scv(name, "", -1);
}

function gi(id) {
    return document.getElementById(id);
}

function ce(id) {
    return document.createElement(id);
}

function kc(e) {
    var a = window.event ? event.keyCode : e.keyCode;
    return a;
}

function wm() {
    Codebase.layout('header_loader_on');
}

function cwm() {
    Codebase.layout('header_loader_off');
}

function wmp() {
    Codebase.loader('show');
}

function cwmp() {
    Codebase.loader('hide');
}

function getProperties(obj) {
    var properties = [];
    //var methods = [];
    // Determination functions and properties of the target by a parent object
    Object.getOwnPropertyNames(obj).forEach((name) => {
        if (typeof obj[name]==='function') {
            //methods.push(name);
        } else if (obj.hasOwnProperty(name) && properties.indexOf(name)===-1) {
            properties.push(name);
        }
    });
    return properties;
}

function getParameters(response) {
    var ret = "";
    var properties = getProperties(response);
    properties.forEach(function(element) {
        var value = response[element];
        if (value&&value!=="")
            ret += "&"+element+"="+response[element];
    });
    return ret;
}

function setFormValues($form, response) {
    var properties = getProperties(response);
    properties.forEach(function(element) {
        var $input = $("#"+$form[0].id+" [name="+element+"]");
        if ($input[0]) {
            var type = $input[0].type;
            if (type==="checkbox") {
                $input.prop("checked", response[element]==="1");
            } else {
                $input.val(response[element]);
            }
        }
    });
}

function getFormValues($form) {
    var values = {};
    $.each($("input, select, textarea", $form), function (k) {
        var name = $(this).attr("name");
        var type = $(this)[0].type;
        if (type==="checkbox") {
            values[name] = $(this).is(":checked") ? "1" : "0";
        } else {
            var value = $(this).val();
            if ($(this).hasClass("text-uppercase"))
                value = value.toUpperCase();
            values[name] = value;
        }
    });
    return values;
}

function emptyFormValues($form) {
    $.each($("input, select, textarea", $form), function (k) {
        //var name = $(this).attr("name");
        var disabled = $(this)[0].disabled;
        if (disabled)
            return;
        var type = $(this)[0].type;
        if (type==="checkbox") {
            $(this).attr("checked", false);
        } else if (type==="select-one") {
            $(this).prop("selectedIndex", 0);
        } else {
            $(this).val("");
        }
    });
}

function resetForm($form) {
    $form[0].reset();
}

function comboRegistros(registro, where, order, $campo, valor, texto, valorinicial) {
    var onFail = function(err) {
        var mensaje = "Error al obtener la lista de registros ["+registro+";"+where+"] .<br><br><b>("+err.status+") "+err.statusText+"</b>";
        error(mensaje);
    };
    var onError = function(response) {
        error(response.mensaje);
    };
    var onComplete = function(response) {
        //$campo.empty();
        for (var i=0; i<response.length; i++) {
            $campo.append($("<option></option>").attr("value",
                response[i][valor]).text(response[i][texto]));
        }
        if (valorinicial)
            $campo.val(valorinicial);
    };
    lista(registro, where, order, onComplete, onError, onFail);
}

function download(url, complete) {
    //wm();

    $.fileDownload(url, {
        successCallback: function (url) {
            //cwm();
            if (complete)
                complete();
        },
        failCallback: function (responseHtml, url, err) {
            cwm();
            error(JSON.stringify(err));
        }
    });
}

function lista(registro, where, order, onComplete, onError, onFail) {
    $.ajax({
        url: "MVC",
        beforeSend: function() {
            wm();
        },
        data: {
            id: "Lista",
            where: where,
            order: order,
            registro: registro
        }
    }).done(function(response, textStatus, jqXHR) {
        cwm();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (onError)
                onError(response);
        } else {
            if (onComplete)
                onComplete(response);
        }
    }).fail(function(err) {
        cwm();
        if (onFail)
            onFail(err);
        else
            error("Error al obtener la lista de registros ["+registro+";"+where+"] .<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function coleccion(registro, where, onComplete, onError, onFail) {
    $.ajax({
        url: "MVC",
        beforeSend: function() {
            wm();
        },
        data: {
            id: "Coleccion",
            registro: registro,
            where: where
        }
    }).done(function(response, textStatus, jqXHR) {
        cwm();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (onError)
                onError(response);
        } else {
            if (onComplete)
                onComplete(response);
        }
    }).fail(function(err) {
        cwm();
        if (onFail)
            onFail(err);
        else
            error("Error al obtener la coleccion de los registros.<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function catalogos(registro, accion, valores, onComplete, onError, onFail) {
    $.ajax({
        url: "MVC",
        beforeSend: function() {
            wm();
        },
        data: {
            id: "Catalogos",
            registro: registro,
            accion: accion,
            valores: valores
        }
    }).done(function(response, textStatus, jqXHR) {
        cwm();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (onError)
                onError(response);
        } else {
            if (onComplete)
                onComplete(response);
        }
    }).fail(function(err) {
        cwm();
        if (onFail)
            onFail(err);
        else
            error("Error al ejecutar el catalogo sobre el registro ["+registro+";"+accion+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function accion(registro, accion, valores, onComplete, onError, onFail) {
    $.ajax({
        url: "MVC",
        beforeSend: function() {
            wm();
        },
        data: {
            id: "Accion",
            registro: registro,
            accion: accion,
            valores: valores
        }
    }).done(function(response, textStatus, jqXHR) {
        cwm();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (onError)
                onError(response);
        } else {
            if (onComplete)
                onComplete(response);
        }
    }).fail(function(err) {
        cwm();
        if (onFail)
            onFail(err);
        else
            error("Error al ejecutar la accion en el registro ["+registro+";"+accion+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function registro(record, valores, onComplete, onError, onFail) {
    $.ajax({
        url: "MVC",
        beforeSend: function() {
            wm();
        },
        data: {
            id: "Registro",
            registro: record,
            valores: valores
        }
    }).done(function(response, textStatus, jqXHR) {
        cwm();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (onError)
                onError(response);
        } else {
            if (onComplete)
                onComplete(response);
        }
    }).fail(function(err) {
        cwm();
        if (onFail)
            onFail(err);
        else
            error("Error al obtener el registro ["+record+";"+valores+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function mvc_post(data, done, fail, message) {
    $.ajax({
        url: "MVC",
        method: "post",
        beforeSend: function() {
            wmp();
        },
        data: data
    }).done(function(response, textStatus, jqXHR) {
        cwmp();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (message) {
                message(response);
                return;
            }
            error(response.mensaje);
            return;
        }
        if (done)
            done(response);
    }).fail(function(err) {
        cwmp();
        if (fail)
            fail(err);
    });
}

function mvc(data, done, fail, message) {
    $.ajax({
        url: "MVC",
        beforeSend: function() {
            wm();
        },
        data: data
    }).done(function(response, textStatus, jqXHR) {
        cwm();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (message) {
                message(response);
                return;
            }
            error(response.mensaje);
            return;
        }
        if (done)
            done(response);
    }).fail(function(err) {
        cwm();
        if (fail)
            fail(err);
    });
}

function post(url, data, done, fail, message) {
    $.ajax({
        url: url,
        method: "post",
        beforeSend: function() {
            wmp();
        },
        data: data
    }).done(function(response, textStatus, jqXHR) {
        cwmp();
        if (jqXHR.status===205) {
            var complete = function() {
                top.location = index;
            };
            warning("La sesion no existe o ha expirado, para continuar debe de iniciar su sesión nuevamente.", complete);
            return;
        }
        if (response.error) {
            if (message) {
                message(response);
                return;
            }
            error(response.mensaje);
            return;
        }
        if (done)
            done(response);
    }).fail(function(err) {
        cwmp();
        if (fail)
            fail(err);
    });
}

function notify(msg, $div) {
    if (!$div)
        $div = $("#notify-div");
    $div.html(msg);
}

function alert_primary(msg, $div) {
    if (!$div)
        $div = $("#notify-div");
    $div.empty();
    var $divAlert = $('<div class="alert alert-primary" role="alert"/>')
            .append(msg);
    $div.html($divAlert);
}

function notify_success(msg) {
    Codebase.helpers("jq-notify", {
        align: "right", from: "top",
        type: "success", icon: "fa fa-check fa-xl me-2",
        message: msg
    });
}

function notify_info(msg) {
    Codebase.helpers("jq-notify", {
        align: "right", from: "top",
        type: "info", icon: "fa fa-info fa-xl me-2",
        message: msg
    });
}

function notify_warning(msg) {
    Codebase.helpers("jq-notify", {
        align: "right", from: "top",
        type: "warning", icon: "fa fa-exclamation fa-xl me-2",
        message: msg
    });
}

function notify_error(msg) {
    Codebase.helpers("jq-notify", {
        align: "right", from: "top",
        type: "danger", icon: "fa fa-cancel fa-xl me-2",
        message: msg
    });
}

var $modalDialogNavigation = $("#modalDialogNavigation");
var $modalDialogBusquedas = $("#modalDialogBusquedas");

function question(msg, onConfirm, onCancel, buttonText) {
    if (!buttonText)
        buttonText = ["Aceptar", "Cancelar"];
    Swal.fire({
        icon: "question",
        showClass: {
            popup: darkmode ?
                "swal2-popup-dark-mode" : "swal2-popup"
        },
        title: "Pregunta",
        showCancelButton: true,
        confirmButtonText: "<i class=\"fa fa-check\"></i>&nbsp;&nbsp;"+buttonText[0],
        cancelButtonText: "<i class=\"fa fa-cancel\"></i>&nbsp;&nbsp;"+buttonText[1],
        reverseButtons: true,
        focusCancel: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: msg
    }).then((result) => {
        if (result.isConfirmed) {
            if (onConfirm)
                onConfirm();
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            if (onCancel)
                onCancel();
        }
    });
}

function success(msg, onConfirm, buttonText) {
    if (!buttonText)
        buttonText = "Aceptar";
    Swal.fire({
        icon: "success",
        showClass: {
            popup: darkmode ?
                "swal2-popup-dark-mode" : "swal2-popup"
        },
        title: "&Eacute;xito",
        confirmButtonText: "<i class=\"fa fa-check\"></i>&nbsp;&nbsp;"+buttonText,
        customClass: {
            confirmButton: "btn btn-success m-1"
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: msg
    }).then((result) => {
        if (result.isConfirmed) {
            if (onConfirm)
                onConfirm();
        }
    });
}

function info(msg, onConfirm, buttonText) {
    if (!buttonText)
        buttonText = "Aceptar";
    Swal.fire({
        icon: "info",
        showClass: {
            popup: darkmode ?
                "swal2-popup-dark-mode" : "swal2-popup"
        },
        title: "Informaci&oacute;n",
        confirmButtonText: "<i class=\"fa fa-info\"></i>&nbsp;&nbsp;"+buttonText,
        customClass: {
            confirmButton: "btn btn-info m-1"
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: msg
    }).then((result) => {
        if (result.isConfirmed) {
            if (onConfirm)
                onConfirm();
        }
    });
}

function warning(msg, onConfirm, buttonText) {
    if (!buttonText)
        buttonText = "Aceptar";
    Swal.fire({
        icon: "warning",
        showClass: {
            popup: darkmode ?
                "swal2-popup-dark-mode" : "swal2-popup"
        },
        title: "Precauci&oacute;n",
        confirmButtonText: "<i class=\"fa fa-exclamation\"></i>&nbsp;&nbsp;"+buttonText,
        customClass: {
            confirmButton: "btn btn-warning m-1"
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: msg
    }).then((result) => {
        if (result.isConfirmed) {
            if (onConfirm)
                onConfirm();
        }
    });
}

function error(msg, onConfirm, buttonText) {
    if (!buttonText)
        buttonText = "Aceptar";
    Swal.fire({
        icon: "error",
        showClass: {
            popup: darkmode ?
                "swal2-popup-dark-mode" : "swal2-popup"
        },
        title: "Error",
        confirmButtonText: "<i class=\"fa fa-cancel\"></i>&nbsp;&nbsp;"+buttonText,
        customClass: {
            confirmButton: "btn btn-danger m-1"
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: msg
    }).then((result) => {
        if (result.isConfirmed) {
            if (onConfirm)
                onConfirm();
        }
    });
}

function loadScript(script, onComplete) {
    $.getScript(script)
    .done(function(script, textStatus) {
        if (onComplete)
            onComplete();
    }).fail(function(err) {
        error("Error al obtener el script ["+script+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function loadPage(page, onComplete) {
    $.ajax({
        url: page,
        beforeSend: function() {
            wm();
        }
    }).done(function(response) {
        cwm();
        if (onComplete)
            onComplete(response);
    }).fail(function(err) {
        cwm();
        error("Error al obtener la pagina ["+page+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function loadPageContainer(page, onComplete) {
    $.ajax({
        url: page,
        beforeSend: function() {
            wm();
        }
    }).done(function(response) {
        cwm();
        $("#page-container").html(response);
        if (onComplete)
            onComplete();
    }).fail(function(err) {
        cwm();
        error("Error al obtener la pagina ["+page+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function loadMainContainer(page, onComplete) {
    $.ajax({
        url: page,
        beforeSend: function() {
            wm();
        }
    }).done(function(response) {
        cwm();
        $("#main-container").html(response);
        if (onComplete)
            onComplete();
    }).fail(function(err) {
        cwm();
        error("Error al obtener la pagina ["+page+"].<br><br><b>("+err.status+") "+err.statusText+"</b>");
    });
}

function autocomplete(min, inp, data, result, render, onclick) {
    var arr = [];
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;

    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var val = this.value;
        //close any already open lists of autocompleted values
        closeAllLists();
        if (!val) {
            arr = [];
            return;
        }
        //starts only whit min characters
        if (arr.length===0&&val.length<min) {
            return;
        }
        seekRecords(val);
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var list = gi(this.id+"-autocomplete-list");
        if (!list)
            return;
        var x = list.getElementsByTagName("div");
        if (e.keyCode===40) {
        /*If the arrow DOWN key is pressed,
         increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
            /*scroll div*/
            list.scrollTop = x[currentFocus].offsetTop;
            return false;
        } else if (e.keyCode===38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x, list);
            /*scroll div*/
            list.scrollTop = x[currentFocus].offsetTop;
            return false;
        } else if (e.keyCode===13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > - 1) {
                /*and simulate a click on the "active" item:*/
                if (x)
                    x[currentFocus].click();
                return false;
            }
        }
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keyup", function(e) {
        var k = kc(e);
        /*close on ESC*/
        if (k===27) {
            arr = [];
            closeAllLists();
            e.preventDefault();
            return false;
        }
        /*seek on ENTER*/
        else if (k===13) {
            if (arr.length===0) {
                var val = inp.value;
                if (val==="")
                    return;
                arr = [];
                closeAllLists();
                seekRecords(val);
            }
            e.preventDefault();
            return false;
        }
        /*seek ALL on HOME*/
        else if (k===36) {
            if (arr.length===0) {
                var val = inp.value;
                arr = [];
                closeAllLists();
                seekRecords(val);
            }
            e.preventDefault();
            return false;
        }
    });

    function seekRecords(val) {
        currentFocus = - 1;
        /*fill the array*/
        if (arr.length===0) {
            var ondata = function(array) {
                arr = array;
                if (arr.length===1) {
                    closeAllLists();
                    var record = arr[0];
                    arr = [];
                    onclick(inp, record);
                    return;
                }
                if (arr.length===0) {
                    inp.select();
                    inp.focus();
                    return;
                }
                selectedRecords(val);
            };
            data(val, ondata);
            return;
        } else {
            /*search records*/
            selectedRecords(val);
        }
    };

    function selectedRecords(val) {
        val = val.toUpperCase();
        var a;
        /*create a div element that will contain the items (values):*/
        a = ce("div");
        a.setAttribute("id", inp.id+"-autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the div element as a child of the autocomplete container:*/
        inp.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (var i=0; i<arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (result(arr[i], val)) {
            //if (arr[i].substr(0, val.length).toUpperCase()===val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                var b = ce("div");
                /*make the matching letters bold:*/
                b.innerHTML = render(arr[i], val);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='"+JSON.stringify(arr[i])+"'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*get the value for the autocomplete text field:*/
                    var value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    /*empty array*/
                    arr = [];
                    /*callback*/
                    onclick(inp, JSON.parse(value));
                });
                a.appendChild(b);
            }
        }
        inp.focus();
    }

    function addActive(x, list) {
        /*a function to classify an item as "active":*/
        if (!x)
            return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length)
            currentFocus = 0;
        if (currentFocus < 0)
            currentFocus = (x.length - 1);
        /*add class "active":*/
        x[currentFocus].classList.add("bg-primary","text-white");
    }

    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i=0; i<x.length; i++) {
            x[i].classList.remove("bg-primary","text-white");
        }
    }

    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i=0; i<x.length; i++) {
            if (elmnt!==x[i] && elmnt!==inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    /*execute a function when someone clicks in the document:*/
    //document.addEventListener("click", function (e) {
    //    closeAllLists(e.target);
    //});
}

