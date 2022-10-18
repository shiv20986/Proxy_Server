const express = require('express');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require("child_process");

const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const {proxy_paths, apps, remotes} = require('./conf.json')
const credentials = {
  key: privateKey,
  cert: certificate,
  rejectUnauthorized: false
};

// Create Express App
const app = express();
// Logging
app.use(morgan('dev'));

// Proxy endpoints

for (let [appName, spas] of Object.entries(apps)) {
  for (let {spa, port} of spas) {
    app.use(`/${appName}/${spa}`, createProxyMiddleware({
      target: `http://localhost:${port}/`,
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        [`^/${appName}/${spa}`]: '',
      },
    }));
  }
}

proxy_paths.forEach(path => {
  app.use(`/${path}`, createProxyMiddleware({
    target: 'https://devui.test.apps.ciena.com',
    changeOrigin: true,
    secure: false,
    router: remotes,
    logLevel: 'debug'
  }));
})


const httpsServer = https.createServer(credentials, app);
httpsServer.listen(8096);
