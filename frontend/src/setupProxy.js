const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const backendUrl = process.env.BACKEND_PROXY || 'http://backend:8080';
  console.log('Setting up proxy to:', backendUrl);
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      onError: (err) => {
        console.error('Proxy error:', err);
      },
    }),
  );
};
