const socket = io();

const spanServerMessage = document.getElementById(`serverNotification`);
const usersList = document.getElementById(`usersList`);
const sendMessage = document.getElementById(`sendMessage`);
const messageInput = document.getElementById(`messageInput`);
const messagesContainer = document.getElementById('messagesContainer');

// Obtengo userName de la URL
const urlParams = new URLSearchParams(window.location.search);
const { userName } = urlParams.get('userName');

//Cliente --> Servidor: el cliente le envía al servidor el nombre del usuario.
socket.emit(`joinChat`, { userName });

//Servidor --> Cliente: El servidor envía notificación.
socket.on(`notification`, data => {
    spanServerMessage.innerHTML = data;
});

//Servidor --> Cliente: El servidor envía todos los mensajes al usuario que se conecta.
socket.on(`allMenssage`, data => {
    const message = "";
    data.forEach(message => {
        message = `
            <li class="clearfix">
                <div class="message-data text-right">
                    <span> ${message.time}, ${message.user.userName}:</span>
                </div>
                <div class="float-right"> ${message.text} </div>
            </li>
        `;
        messagesContainer.innerHTML += message;
    })
});

//Servidor --> Cliente: El servidor envía la lista actualizada de usuarios
socket.on(`users`, data => {

    const users = data
        .map(user => {
            const userTemplate = `
                <li class="clearfix">
                    <div>
                        <div class="name"> ${user.userName}</div>>
                    </div>
                </li>
            `;
            return userTemplate;
        })
        .join(``);

    usersList.innerHTML += users;
});

//Cliente --> Servidor: ejecuto un evento que envia el mensaje escrito por el usuario.
sendMessage.addEventListener('click', () => {
    socket.emit('messageInput', messageInput.value);
    messageInput.value = "";
});


//Servidor -->cliente:
socket.on(`message`, data => {
    const message = `
        <li class="clearfix">
            <div class="text-right">
                <span> ${data.time}, ${data.userName}:</span>
            </div>
            <div class="message other-message float-right"> ${data.text} </div>
        </li>`

    messagesContainer.innerHTML += message;
});