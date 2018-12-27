
module.paths.push(`${process.cwd()}/node_modules`);
const sync = require('browser-sync');


//================================================================================
// synchronize: configure browsersync
//================================================================================


const synchronize = (done) => {
    let cfg = {
        online: false,
        open: false,
        port:9000,
        server: {
            baseDir: ['.'],
            middleware: (req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        }

    };
    sync(cfg, done);
};

//================================================================================
// reload: reload browsersync
//================================================================================


const reload = done  => {
    sync.reload();
    done();
};

//================================================================================
// task definitions
//================================================================================



//================================================================================
// module exports
//================================================================================


exports.reload = reload;
exports.synchronize = synchronize;
