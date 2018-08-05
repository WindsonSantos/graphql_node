import * as http from 'http';

import app from './app';

const server = http.createServer(app);

server.listen(3000);
server.on('listening',()=>'Listenning on port 3000...');