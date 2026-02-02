/* eslint-disable @typescript-eslint/no-var-requires */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.BACKEND_PROXY,
      changeOrigin: true,
      
      onProxyReq: (proxyReq, _req, _res) => {
        // eslint-disable-next-line no-console
        console.log('Proxying request to:', 'http://localhost:8080');
        console.log('Original request path:', _req.originalUrl);
        console.log('Proxied request path:', proxyReq.path);
      },
      onError: (err, _req, _res) => {
        // eslint-disable-next-line no-console
        console.error('Proxy error:', err);
      },
      onProxyRes: (proxyRes, _req, _res) => {
        console.log('Received response from target:', proxyRes.statusCode);
      },
    }),
  );
};
