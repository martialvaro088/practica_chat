function irARegister() {
    window.location.href = "register.html";
}

function iniciarSesion() {

    var usuario = document.getElementById('usuario').value;
    var contraseña = document.getElementById('clave').value;

    //HAGO LA PETICION AL SERVIDOR Y GUARDO LA RESPUESTA EN LA VARIABLE PROMISE
    var promise = $.ajax({
        type: 'POST',
        url: '/identificar',
        data: JSON.stringify({ username: usuario, password: contraseña }),
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json'
    });

    //TRATAR LA RESPUESTA QUE ME DA EL SERVIDOR
    promise.always(function (data) {

        if (data.res == "login true") {
            window.location.replace("/rutaSegura");
        }
        else if (data.res == "usuario no valido") {
            alert("No estas autorizado, ese usuario no es valido");
        }
        else if (data.res == "login failed") {
            alert("Debes introducir el usuario y contraseña");
        }
        else {
            window.alert("Error")
        }
    })
}

function registrarUsuario() {

    var usuario = document.getElementById('usuario').value;
    var contraseña = document.getElementById('clave').value;

    //HAGO LA PETICION AL SERVIDOR Y GUARDO LA RESPUESTA EN LA VARIABLE PROMISE
    var promise = $.ajax({
        type: 'POST',
        url: '/registrar',
        data: JSON.stringify({ username: usuario, password: contraseña }),
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json'
    });


    //TRATAR LA RESPUESTA QUE ME DA EL SERVIDOR
    promise.always(function (data) {

        if (data.res == "register true") {
            window.location.replace("/index.html");
        }
        else if (data.res == "usuario ya existe") {
            alert("Ya existe ese usuario");
        }
        else if (data.res == "register failed") {
            alert("Debes introducir el usuario y contraseña");
        }
        else {
            window.alert("Error")
        }
    })
}