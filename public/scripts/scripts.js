var socket = io.connect();
socket.on('messages', function (data) {
    console.log(data);
    render(data);
})

socket.on('hay-nuevo', function (data) {
    alert(data);
})

function addMessage(e) {
    var message = {
        autor: document.getElementById("username").value,
        texto: document.getElementById("texto").value
    }
    socket.emit("new-message", message);
    return false;
}

function render(data) {
    var html = data.map(function (elem, index) {
        return (`<div>
                    <strong>${elem.autor}</strong>:
                    <em>${elem.texto}</em>
                </div>`);
    }).join(" ");
    document.getElementById('chat').innerHTML = html;
}
