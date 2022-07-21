//imports
const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
//socket na parte do servidor
const io = socket(server);

server.listen(3000);

//ler a pasta public
app.use(express.static(path.join(__dirname, 'public')));

//armazenar os users online
let connectedUsers = [];

/*comandos socket(io)*/

//listen de uma conexão (quando tiver uma conexão, a arrow sera realizada)
io.on('connection', (socket)=>{
    console.log("Conexão detectada...");

    //o 'on' no socket é para o listener, quando o servidor receber uma mensagem de join-request ele vai fazer a arrow
    socket.on('join-request', (username)=>{
        socket.username = username;
        //colocar o nome do user na lista de conectados
        connectedUsers.push(username);
        console.log(connectedUsers);

        //emmit da parte do server (depois que o user enviou o emmit)
        socket.emit('user-ok',connectedUsers);

        //broadcast 
        socket.broadcast.emit('list-update', {
            //info de entrada de conexão
            joined: username,
            list: connectedUsers
        });
    });

    //listener do DC
    socket.on('disconnect', ()=>{
        //filtro para remoção de um valor de um array
        connectedUsers = connectedUsers.filter(u => u != socket.username);
        console.log(connectedUsers);

        //ja que houve uma atualização na list, mandar um broadcast com um update 
        socket.broadcast.emit('list-update', {
            //info de entrada de conexão
            left: socket.username,
            list: connectedUsers
        });
    });

    //listener do envio da mensagem
    socket.on('send-msg', (txt)=>{
        //obj que sera enviado
        let obj = {
            username: socket.username,
            message: txt
        };

        //mandar a mensagem pro user
        //socket.emit('show-msg', obj); //ja que to mostrando a msg automaticamente no main.js, não preciso desse emmit
        //broadcast da msg
        socket.broadcast.emit('show-msg', obj);
    });

});

