const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const rl = require('readline');

const server = http.createServer((req, res) => {
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
});

const rel = rl.createInterface({
  input: process.stdin,
  output: process.stdout
});

const wss = new WebSocket.Server({ server });
function payloadInj() {
  rel.question("action (type help if you don't know how to use): ", (action) => {
    if(action === "addElement") {
      rel.question("element: ", (element) => {
        rel.question("value: ", (value) => {
          wss.clients.forEach((client) => {
          client.send(JSON.stringify({
            action: "addElement",
            element: element,
            value: value
          }));
        });
          payloadInj();
        });
      }); 
    } else if (action === "changeTitle"){
      rel.question("value: ", (value) => {
        wss.clients.forEach((client) => {
          client.send(JSON.stringify({
            action: "changeTitle",
            value: value
          }));
        })
        payloadInj();
      });
    } else if (action === "execJS") {
      rel.question("value: ", (scr) => {
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({
              action: "exec",
              script: scr
            }))
          payloadInj();
        });
      })
    } else if (action === "getHTML") {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({action: "getHTML"}));
      })
      payloadInj();
    } else {
      payloadInj();
    }
  })
}

payloadInj();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if(data.action === "test") {
          return;
        } else if (data.action === "fetchHTML") {
          console.log(data.finalHTML)
        }
    });
});
  
  const localIpAddress = 'localhost';
  const port = 12345;
  
  server.listen(port, localIpAddress);