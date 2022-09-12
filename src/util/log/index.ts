const path = require('path')

const log = require('electron-log');
//'{h}:{i}:{s}.{ms} › {text}' (renderer)
log.transports.console.format = '%c{h}:{i}:{s}.{ms}%c › {text}';

const basePath = path.join(process.cwd(), "/config").replace(/\\/g, "/")

log.transports.file.resolvePath = () => `${basePath}/logs/main.log`;
//只设置属性为false就可以禁用，例如：
log.transports.file.level = true;
log.transports.console.level = true;


export default log