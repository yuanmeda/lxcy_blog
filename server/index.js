/*
 * @Author: 钟媛
 * @Date: 2021-09-10 17:34:36
 * @LastEditTime: 2021-09-10 18:21:18
 * @Description: 服务器
 */
const http = require('http');

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end({ name: 'hello' });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

