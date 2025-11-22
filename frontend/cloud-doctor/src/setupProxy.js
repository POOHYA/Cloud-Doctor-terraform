const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API 요청만 프록시
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:9090',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying API request:', req.method, req.url);
        proxyReq.setHeader('Origin', 'https://localhost:3001');
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('API Proxy response:', proxyRes.statusCode, req.url);
        const setCookieHeader = proxyRes.headers['set-cookie'];
        if (setCookieHeader) {
          proxyRes.headers['set-cookie'] = setCookieHeader.map(cookie => 
            cookie.replace(/Domain=[^;]+/gi, 'Domain=localhost')
                  .replace(/SameSite=None/gi, 'SameSite=Lax')
          );
        }
      }
    })
  );
  
  // 백엔드 /admin API만 프록시 (구체적인 API 경로만)
  app.use(
    ['/admin/services', '/admin/guidelines', '/admin/users', '/admin/checklists'],
    createProxyMiddleware({
      target: 'http://localhost:9090',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying Admin API request:', req.method, req.url);
        proxyReq.setHeader('Origin', 'https://localhost:3001');
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Admin API Proxy response:', proxyRes.statusCode, req.url);
        const setCookieHeader = proxyRes.headers['set-cookie'];
        if (setCookieHeader) {
          proxyRes.headers['set-cookie'] = setCookieHeader.map(cookie => 
            cookie.replace(/Domain=[^;]+/gi, 'Domain=localhost')
                  .replace(/SameSite=None/gi, 'SameSite=Lax')
          );
        }
      }
    })
  );
};