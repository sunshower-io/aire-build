const
    paths = require(`${process.cwd()}/build/paths.js`),
    changelog = require('conventional-changelog'),
    fs = require('fs'),
    bump = require('gulp-bump'),
    args = require(`${process.cwd()}/build/args.js`);


module.exports = gulp => {
    gulp.task('bump-version', () => {
        return gulp.src(`${process.cwd()}/package.json`)
            .pipe(bump({type: args.bump}))
            .pipe(gulp.dest(process.cwd()));
    });

    gulp.task('changelog', (callback) => {
        const pkg = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`, 'utf-8'));
        return changelog({
                repository: pkg.repository.url,
                version: pkg.version,
                file: paths.doc + '/CHANGELOG.md'
            },
            (err, log) => {
                fs.writeFileSync(paths.doc + '/CHANGELOG.md', log);
            }
        );
    });

    gulp.task('prepare-release', gulp.series('build', 'lint', 'bump-version', 'changelog'));
};
