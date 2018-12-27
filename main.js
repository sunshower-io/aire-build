
const
    root = process.cwd(),
    paths = require('./src/main/paths.js'),
    cleanscripts = require('./src/main/tasks/clean.js'),
    servescripts = require('./src/main/tasks/serve.js'),
    sitescripts = require('./src/main/tasks/site.js'),
    utilscripts = require('./src/main/tasks/utils.js'),
    watchscripts = require('./src/main/tasks/watch.js');


module.exports = (gulp) => {
    require('./src/main/tasks/build.js')(gulp);
};
