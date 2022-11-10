const express = require(`express`);
const { Server: HttpServer } = require(`http`);
const { Server: IOServer } = require(`socket.io`);

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static(`./public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set(`views`, `./views`);
app.set(`view engine`, `ejs`);

const PORT = 8080;
httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));


const ContenedorP = require(`./contenedorProducto.js`);
const ContenedorC = require(`./contenedorChat.js`);
let contenedorProductos = new ContenedorP(`./productos.txt`);
let contenedorChat = new ContenedorC(`./mensajes.txt`);

let users = [];

app.get(`/`, (req, res) => {
    const data = {
        title: "Desafio Nº6 - Websockets",
        content: "Alumno: Lucas Alastuey"
    }
    return res.render(`index`, data);
});

app.get(`/form`, (req, res) => res.render(`formProductos`));

app.get(`/login`, (req, res) => res.render(`login`));

app.post(`/login`, (req, res) => {
    const { userName } = req.body;
    return res.redirect(`/chat/?userName=${userName}`);
});

app.get(`/chat`, (req, res) => res.render('chat'));


//Evento de conexión cliente
io.on(`connection`, socket => {

    socket.on(`sendProduct`, () => {
        (async () => {
            try {
                allProducts = await contenedorProductos.getAll();
                socket.emit(`allProducts`, allProducts);
            } catch (err) {
                return res.status(404).json({
                    error: `Error ${err}`
                });
            }
        })();
    });

    socket.on(`addProducts`, data => {
        (async () => {

            const newProducto = {
                title: `${data.name}`,
                price: Number(data.price),
                thumbnail: `${data.img}`
            };
            const id = await contenedorProductos.save(newProducto);

            const product = await contenedorProductos.getById(id);

            //Envio el producto nuevo a todos los clientes conectados
            io.sockets.emit(`refreshTable`, product);
        })();

    });

    socket.on(`joinChat`, ({ userName }) => {
        (async () => {
            users.push({
                id: socket.id,
                userName: userName
            });

            try {
                allMessage = await contenedorChat.getAll();
                socket.emit(`allMenssage`, allMessage);
            } catch (err) {
                return res.status(404).json({error: `Error ${err}`});
            }
        })();
    });

    //Cliente --> Servidor: messageInput event
    socket.on(`messageInput`, data => {
        (async () => {
            const now = new Date();
            const user = users.find(user => user.id === socket.id);
            const message = {
                text: data,
                time: `${now.getHours()}:${now.getMinutes()}`,
                user
            };

            socket.emit(`message`, message);

            socket.broadcast.emit(`message`, message);

            await contenedorChat.save(message);
        })();
    });

});