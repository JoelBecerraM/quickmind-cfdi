
function initPerfilUsuario() {
    $("#perfil-nombre").html(usuario.nombre);
    $("#perfil-descripcion").html("<a class=\"text-primary-light\" href=\"javascript:void(0)\">"
            +usuario.email+"</a>");

    setFormValues($("#datos-form"), usuario);
    $("#avatar-img").attr("src", usuario.avatar);
    setFormValues($("#password-form"), usuario);

    $("#password-form [name=password]").val("");

    $("#datos-form").validate({
        rules: {
            compania: {
                required: !0
            },
            usuario: {
                required: !0
            },
            nombre: {
                required: !0, minlength: 3
            },
            email: {
                required: !0,
                email: true
            },
            avatar: {
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
            nombre: {
                required: "Por favor ingrese el <b>nombre</b>.", minlength: "El <b>nombre</b> debe de tener por lo menos 3 caracteres."
            },
            email: {
                required: "Por favor ingrese el <b>correo electr&oacute;nico</b>.", email: "Por favor escriba un <b>correo electr&oacute;nico</b> v&aacute;lido."
            },
            avatar: {
                required: "Por favor eliga el <b>avatar</b>."
            }
        }
    });
    $("#password-form").validate({
        rules: {
            compania: {
                required: !0
            },
            usuario: {
                required: !0
            },
            password: {
                required: !0
            },
            newpassword: {
                required: !0, minlength: 8, maxlength: 20
                //,hardPassword: true
            },
            newpassword2: {
                required: !0, minlength: 8, maxlength: 20,
                //hardPassword: true, 
                equalTo: "#newpassword"
            }
        },
        messages: {
            compania: {
                required: "Por favor ingrese la <b>compa&ntilde;&iacute;a</b>."
            },
            usuario: {
                required: "Por favor ingrese el <b>usuario</b>."
            },
            password: {
                required: "Por favor ingrese la <b>contrase&ntilde;a</b>."
            },
            newpassword: {
                required: "Por favor ingrese la nueva <b>contrase&ntilde;a</b>.",
                minlength: "La nueva <b>contrase&ntilde;a</b> debe de tener por lo menos 8 caracteres.", maxlength: "La nueva <b>contrase&ntilde;a</b> debe de tener hasta 20 caracteres."
                //,hardPassword: "Por favor ingrese una <b>contrase&ntilde;a</b> v&aacute;lida, m&iacute;nimo de 8 caracteres, que lleve una may&uacute;scula y un car&aacute;cter especial."
            },
            newpassword2: {
                required: "Por favor confirme la nueva <b>contrase&ntilde;a</b>.",
                minlength: "La nueva <b>contrase&ntilde;a</b> debe de tener por lo menos 8 caracteres.", maxlength: "La nueva <b>contrase&ntilde;a</b> debe de tener hasta 20 caracteres.",
                //hardPassword: "Por favor ingrese una <b>contrase&ntilde;a</b> v&aacute;lida, m&iacute;nimo de 8 caracteres, que lleve una may&uacute;scula y un car&aacute;cter especial.",
                equalTo: "La confirmacion de la nueva <b>contrase&ntilde;a</b> no es igual."
            }
        }
    });
}

function actualizarDatos() {
    var $form = $("#datos-form");
    var pass = $form.valid();
    if (!pass) {
        notify_error("Hay errores con los datos, favor de corregirlos.");
        return;
    }

    var data = getFormValues($form);

    data["id"] = "CambiaDatos";

    var onFail = function(err) {
        error("Error al Cambiar los Datos.<br><br><b>("+err.status+") "+err.statusText+"</b>");
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
            top.location = "/cartaporte";
        };
        success("Cambio de Datos <b>"+response.nombre+"</b> efectuado correctamente.", inicio);
    };
    mvc(data, onComplete, onFail, onError);
}

function actualizarPassword() {
    var $form = $("#password-form");
    var pass = $form.valid();
    if (!pass) {
        notify_error("Hay errores con los datos, favor de corregirlos.");
        return;
    }

    var data = getFormValues($form);

    data["id"] = "CambiaPassword";

    var onFail = function(err) {
        error("Error al Cambiar la Contrase&ntilde;a.<br><br><b>("+err.status+") "+err.statusText+"</b>");
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
            top.location = "/cartaporte";
        };
        success("Cambio de Contrase&ntilde;a <b>"+response.nombre+"</b> efectuado correctamente.", inicio);
    };
    mvc(data, onComplete, onFail, onError);
}
