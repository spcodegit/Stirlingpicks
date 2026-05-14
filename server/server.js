//--------------- Import ---------------
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const fileUpload = require('express-fileupload');

//--------------- Configure Env ---------------
require('dotenv').config();

//--------------- Database Connection ---------------
require('./connections/connection');
const {CONFIG} = require("./config/config");

//--------------- Middleware ---------------
server.use(express.static('public'));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
server.use(express.json());
server.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    origin: '*'
}))
server.use(fileUpload({useTempFiles: false, tempFileDir: 'public'}))

//--------------- Routes ---------------
require('./routes/index')(server)

//--------------- PORT Setting ---------------
const PORT = process.env.PORT || CONFIG.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on port ${PORT}`);
});