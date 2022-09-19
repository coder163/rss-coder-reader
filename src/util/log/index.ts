const path = require('path')

const log = require('electron-log');
//格式
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';

// 日志格式
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';

// log.transports.file.level = 'debug';

// 日志大小，默认：1048576（1M），达到最大上限后，备份文件并重命名为：main.old.log，有且仅有一个备份文件
log.transports.file.maxSize = 1048576;

const basePath = path.join(process.cwd(), "/config").replace(/\\/g, "/")

log.transports.file.resolvePath = () => `${basePath}/logs/main.log`;
//只设置属性为false就可以禁用，例如：
log.transports.file.level = true;
log.transports.console.level = true;


export default log