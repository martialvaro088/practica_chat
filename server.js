var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var fs = require('fs');
app.use(express.static('public'));

var messages = [{
    id: 1,
    texto: "Hola, soy el mensaje de inicio",
    autor: "aDMINISTRADOR"

}]

app.get('/', (req, response) => {
    var contenido = fs.readFileSync("public/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

server.listen(8080, function () {
    console.log('Servidor corriendo en http://localhost:8080');
});

// Permite establecer el canal de comunicacion usando socket io
// La funcion io.on('conection') gestiona las conexiones con el canal
io.on('connection', function (socket) {
    //Cada vez que alguien se conecta al canal, mostramos un mensaje en consola y le enviamos (socket.emit) nuestra coleccion de mensajes
    console.log('Un cliente se ha conectado');
    socket.emit('messages', messages);
    io.emit("hay-nuevo", "Hay alguien nuevo en el chat");

    // Cada vez que se produce el evento inventado por nosotros 'new-message', se recupera de la variable data el nuevo mensaje emitido por alguien y se añade a nuestra coleccion de mensajes
    socket.on('new-message', function (data) {
        messages.push(data);
        // Una vez actualizada nuestra coleccion de mensajes, GRITAMOS el evento 'messages' y enviamos la coleccion de mensajes actualizas a todos los oyentes
        io.emit('messages', messages);
    })
});