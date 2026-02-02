
import createProxyMiddleware from 'http-proxy-middleware';
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.BACKEND_PROXY,
      changeOrigin: true, //stop here for original
      // pathRewrite: {
      //     '^/api': '', // remove /api from the request path
      // },
      onProxyReq: (proxyReq, req) => {
        console.log('Proxying request to:', 'http://localhost:8080');
        console.log('Original request path:', req.originalUrl);
        console.log('Proxied request path:', proxyReq.path);
      },
      onError: (err) => {
        console.error('Proxy error:', err);
      },
      onProxyRes: (proxyRes) => {
        console.log('Received response from target:', proxyRes.statusCode);
      },
    }),
  );
};
