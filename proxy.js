const Bundler = require('parcel-bundler');
const express = require('express');
const {createProxyMiddleware: proxy} = require('http-proxy-middleware');

const app = express();

app.use('/api', proxy({
  pathRewrite: {'/api' : '/.netlify/functions/'},
  target: 'http://localhost:9000',
  changeOrigin: true,
}));

app.use('/ln', proxy({
    pathRewrite: {'/ln' : '/api/v2/'},
    target: 'https://listen-api.listennotes.com',
    changeOrigin: true,
  }));

const bundler = new Bundler('public/index.html');
app.use(bundler.middleware());

app.listen(Number(process.env.PORT || 1234));