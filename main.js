import * as __webserver from './webserver.js';
import * as ledstrip from './ledstrip.js';
import * as config from './config.js';

ledstrip.setup();
setInterval(ledstrip.loop, config.get('ledstrip_interval'));