const hoje = new Date()

//Iniciando conexão, como é com meu prórpio servidor, eu não preciso colocar nenhum parâmetro
const socket = io();

//Variavel pra armazenar quem é o usuário
let username = '';

//Lista dos users
let userList = [];

//Campos principais
let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

//Inputs
let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

//Começar com a tela de login e dps a tela de chat
loginPage.style.display = 'flex';
chatPage.style.display = 'none';

//func para renderizar a user list
function renderUserList(){
    let ul = document.querySelector('.userList');
    //limpando a lista
    ul.innerHTML = '';
    //preenchendo atualizada(o 'i' é o nome do usuário)
    userList.forEach(i =>{
        //adicionando o que ja tinha antes
        ul.innerHTML += '<li>'+i+'</li>';
    })
}

//func para mostrar as atualizações no chat
function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');

    //swicth pra ver o type da msg
    switch(type){
        case 'status':
            ul.innerHTML += '<li class="m-status">'+msg+'</li>'
        break;
        
        case 'msg':
            //se for o mesmo user da msg
            if(username == user){
                ul.innerHTML += '<li class="m-txt"><span class="me">'+user+'</span>'+msg+'</li>'  
            }else{
                ul.innerHTML += '<li class="m-txt"><span>'+user+'</span>'+msg+'</li>'
        }
        break;
    }

    //fazer a barr a de rolagem acompanhar
    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        let name = loginInput.value.trim();
        if(name != ''){
            username = name;
            document.title = 'Chat ('+username+')'

            //emmit do user, mensagem do emmit que esta no server.js e o parametro que sera enviado
            socket.emit('join-request', username);
        }
    } 
});

//envio de mensagem
textInput.addEventListener('keyup', (e)=>{
    //só pra lembrar a keycode 13 é o enter
    if(e.keyCode === 13){
        //Pegar o que o cara digitou
        let txt = textInput.value.trim();
        textInput.value='';

        //se digitou algo
        if(txt != ''){
            //mostrar mensagem automaticamente
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt);
        }
    }
});

socket.on('user-ok', (list)=>{
    //dps de receber o nome e colocar na lista de users online
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    //mostrar atualização no chat
    addMessage('status', null, 'Pai ta ON');

    //preencher userList
    userList = list;

    //renderizar a lista de usuarios
    renderUserList();
});

//listener do broadcast, (o'data' tem a info do broadcast no server.js)
socket.on('list-update', (data)=>{
    //se alg entrou
    if(data.joined){
        //data.joined é o nome do cara
        addMessage('status', null, data.joined+' entrou no chat');
    }
    //se alg saiu
    if(data.left){
        //data.left é o nome do cara
        addMessage('status', null, data.left+' saiu do chat');
    }


    userList = data.list;
    //colocando os nomes novos
    renderUserList();
});

//listener pra aparecer a mensagem
socket.on('show-msg', (data)=>{
    addMessage('msg', data.username, data.message);
});

//listener caso o server caia
socket.on('disconnect', ()=>{
    addMessage('status', null, 'Você foi desconectado!');
    //limpando toda a lista de users
    userList = [];
    renderUserList();
})

//listener para caso reconectar de erro
socket.on('connect_error', ()=>{
    addMessage('status',null, 'Tentando Reconectar...')
});

//listener pra quando reconectar
socket.on('connect', ()=>{
    //requisição de entrada pra não precisar digitar o username dnv
    addMessage('status', null, 'Salve!')
    if(username != ''){
        socket.emit('join-request', username);
    }
});