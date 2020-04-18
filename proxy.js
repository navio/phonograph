const Bundler = require('parcel-bundler');
const express = require('express');

const fs = require('fs');
const https = require('https');
const http = require('http');

const {createProxyMiddleware: proxy} = require('http-proxy-middleware');

const app = express();

app.use('/api', proxy({
  pathRewrite: {'/api' : '/.netlify/functions/'},
  target: 'http://localhost:9000',
  changeOrigin: true,
}));

app.use('/rss-full', proxy({
  pathRewrite: {'/rss-full' : '/.netlify/functions/findCast/'},
  target: 'http://localhost:9000',
  changeOrigin: true,
}));

app.use('/ln', proxy({
    pathRewrite: {'/ln' : '/api/v2/'},
    target: 'https://listen-api.listennotes.com',
    changeOrigin: true,
    onProxyReq(proxyReq, req, res){
      proxyReq.setHeader('X-ListenAPI-Key','ebbd0481aa1b4acc8949a9ffeedf4d7b');
      proxyReq.setHeader('X-From', 'Gramophone-DEV');
      proxyReq.end();
    }
  }));

const bundler = new Bundler('public/index.html');
app.use(bundler.middleware());

// app.listen(Number(process.env.PORT || 1234));


const cert = "/etc/letsencrypt/live/cloud.hosts.mx/fullchain.pem";
const key = "/etc/letsencrypt/live/cloud.hosts.mx/privkey.pem";

const privateKey  = fs.readFileSync(key);
const certificate = fs.readFileSync(cert);
const credentials = {key: privateKey, cert: certificate};

https.createServer(credentials, app)
.listen(1234, () => console.log("Running!"));

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(4234);

  