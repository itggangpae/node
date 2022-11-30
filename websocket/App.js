/*
let WebSocketServer = require('websocket').server;
let http = require('http');
let fs = require('fs');

let server = http.createServer(function (req, res) {
	   if(req.url == "/"){
		   res.writeHead(200, {'Content-Type': 'text/html'});
		   res.end('Web Socket');
	   }
	   else if(req.url == "/index"){
		   fs.readFile('index.html', function (error, data) {
	            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	            res.end(data);
	       });
	   }
});

server.listen(8000, function () {
  console.log('Server is listening on port 8000');
});

let wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function (request) {
  let connection = request.accept('example-echo', request.origin);
  connection.on('message', function (message) {
      if (message.type === 'utf8') {
        console.log('Received message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
      }else if (message.type === 'binary') {
        connection.sendBytes(message.binaryData);
      }
      connection.on('close', function (reasonCode, description) {
          console.log('Peer ' + connection.remoteAddress + ' disconnected.');
      });
  });
});
*/

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();
const webSocket = require('./socket');
const indexRouter = require('./routes');

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use('/', indexRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});

webSocket(server);

//const io = require('socket.io')(server); 

