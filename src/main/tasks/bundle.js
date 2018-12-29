const bundler = require('aurelia-bundler'),
    bundles = require(`${process.cwd()}/build/bundles.js`),
    config = {
        force: true,
        baseURL: process.cwd(),
        configPath: `${process.cwd()}/jspm.config.js`,
        bundles: bundles.bundles
    };


function bundle() {
    return bundler.bundle(config);
}

function unbundle() {
    return bundler.unbundle(config);
}

// gulp.task('bundle', ['build'], function () {
//     return bundler.bundle(config);
// });
//
// gulp.task('unbundle', function () {
//     return bundler.unbundle(config);
// });


module.exports = (gulp) => {
    gulp.task('unbundle', unbundle);
    gulp.task('bundle', gulp.series('build', bundle));
};