const express = require('express');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');

const fs = require('fs');
const https = require('https');
const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  rejectUnauthorized: false
};

// Create Express App
const app = express();

const API_SERVICE_URL = "https://nextgenle.test.apps.ciena.com/";

const PROXY_PATHS = [
  'login',
  'ui',
  'ems',
  'maps',
  'planner-plus-ui',
  'nominatim',
  'tron',
  'planner',
  'sfdataprovider',
  'scenariobuilder',
  'system-ui',
  'platform-ui',
  'swagger-ui',
  'solutionmanager',
  'equipmenttopologyplanning',
  'nsi',
  'slv-support',
  'quote-proxy',
  'sso',
  'nsi',

]

// Logging
app.use(morgan('dev'));

// Proxy endpoints
app.use('/dev', createProxyMiddleware({
  target: 'https://localhost:8080/',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    ['^/dev']: '',
  },
}));

PROXY_PATHS.forEach(path => {
  app.use(`/${path}`, createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    secure: false
  }));
})

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(8090);
