module.paths.push(`${process.cwd()}/node_modules`);
const
    paths = require('../paths.js');


//**================================================================================
// Task watch
//================================================================================

module.exports = (gulp) => {
    const serve = require('./serve.js');
    const watch = (done) => {
        gulp.watch(paths.pug, gulp.series('build:pug', 'reload'));
        if(paths.allStyles) {
            gulp.watch(paths.allStyles, gulp.series('build:sass', 'reload'));
        }
        if(paths.components && paths.generate) {
            gulp.watch([paths.components, paths.extraComponents], gulp.series('aire:generate'))
        }
        gulp.watch(paths.typescript, gulp.series(gulp.parallel('build:ts', 'build:docs'), 'reload'));
    };

    gulp.task('reload', serve.reload);
    gulp.task('serve', serve.synchronize);
    gulp.task('watch', gulp.parallel(watch, 'serve'));
};





