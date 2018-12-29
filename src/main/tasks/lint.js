const paths = require(`${process.cwd()}/build/paths`),
    tslint = require('gulp-tslint');

module.exports = (gulp) => {

    gulp.task('lint', function () {
        return gulp
            .src(paths.source)
            .pipe(
                tslint({
                    emitError: false
                })
            )
            .pipe(tslint.report());
    });
};
