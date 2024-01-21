const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const privateKey = fs.readFileSync('miclave.key', 'utf8');
const certificate = fs.readFileSync('micertificado.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate, passphrase: '123456' };
var https = require('https');

let usuariosConectados = {};

var server = https.createServer(credentials, app);
//var server = require('http').Server(app);
var port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'tu cadena secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));
app.use(cookieParser('your secret here'));
var usuarios = cargarUsuarios();

//FUNCIONES
var auth = function (req, res, next) {
    if (req.session && req.session.user === "admin" && req.session.admin) {
        return next();
    }
    else {
        return res.sendStatus(401);
    }

}

//FUNCIONES GET
app.get('/', (req, response) => {
    var contenido = fs.readFileSync("public/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});
app.get('/rutaSegura', auth, (req, response) => {
    var contenido = fs.readFileSync("public/chat.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});
app.get('/registro', (req, response) => {
    var contenido = fs.readFileSync("public/register.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

//FUNCIONES POST

//Loguear usando el fichero JSON
app.post('/identificar', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.send({ "res": "login failed" });
    }
    else {
        const usuarioEncontrado = usuarios.find(usuario =>
            usuario.username == req.body.username && usuario.password == req.body.password
        );

        if (usuarioEncontrado) {
            req.session.user = "admin";
            req.session.admin = true;
            return res.send({ "res": "login true" });
        }
        else {
            res.send({ "res": "usuario no valido" });
        }

    }

});

//Registrar por JSON
app.post('/registrar', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.send({ "res": "register failed" });
    }
    else {
        let usuarioExiste = false;

        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].username == req.body.username) {
                usuarioExiste = true;
            }
        }
        if (usuarioExiste) {
            res.send({ "res": "usuario ya existe" });
        } else {

            var usuario = {
                username: req.body.username,
                password: req.body.password
            }

            usuarios.push(usuario);
            console.log(usuarios);

            guardarUsuarios(usuarios);
            res.send({ "res": "register true" });

        }

    }

});

//FUNCIONES DE LOGICA
function guardarUsuarios(usuarios) {
    const json = JSON.stringify(usuarios);
    fs.writeFileSync('usuarios.json', json, 'utf8', function (err) {
        if (err) {
            console.log('Ha ocurrido un error al guardar los usuarios', err);
        } else {
            console.log('Usuarios guardados correctamente.');
        }
    });
}
function cargarUsuarios() {
    try {
        const data = fs.readFileSync('usuarios.json', 'utf8');
        console.log("#######USUARIOS CARGADOS##############");
        console.log(JSON.parse(data));
        return JSON.parse(data);
    } catch (err) {
        console.log('Error al leer los usuarios desde el archivo:', err);
        return [];
    }
}

io.on('connection', (socket) => {
    usuariosConectados[socket.id] = socket.id;

    io.emit('usuarios conectados', Object.keys(usuariosConectados));

    socket.on('chat message', (msg) => {
        io.emit('chat message', { msg: msg, from: socket.id, to: null });
    });

    socket.on('private message', (data) => {
        socket.to(data.to).emit('private message', { msg: data.msg, from: socket.id, to: data.to });
        socket.emit('private message', { msg: data.msg, from: socket.id, to: data.to });
    });

    socket.on('disconnect', () => {
        delete usuariosConectados[socket.id];

        io.emit('usuarios conectados', Object.keys(usuariosConectados));

    });
});

http.listen(3000, () => {
    console.log('Escuchando en el puerto 3000');
});
