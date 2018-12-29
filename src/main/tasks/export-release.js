'use strict';

const
    del = require('del'),
    vinylPaths = require('vinyl-paths'),
    jspm = require('jspm'),
    paths = require(`${process.cwd()}/build/paths.js`),
    bundles = require(`${process.cwd()}/build/bundles.js`),
    resources = require(`${process.cwd()}/build/export.js`);

function getBundles() {
    let bl = [];
    for (let b in bundles.bundles) {
        bl.push(b + '*.js');
    }
    return bl;
}

function getExportList() {
    return resources.list.concat(getBundles());
}

function normalizeExportPaths() {
    const pathsToNormalize = resources.normalize;

    let promises = pathsToNormalize.map(pathSet => {
        const packageName = pathSet[0];
        const fileList = pathSet[1];

        return jspm.normalize(packageName).then(normalized => {
            const packagePath = normalized.substring(
                normalized.indexOf('jspm_packages'),
                normalized.lastIndexOf('.js')
            );
            return fileList.map(file => packagePath + file);
        });
    });

    return Promise.all(promises).then(normalizedPaths => {
        return normalizedPaths.reduce((prev, curr) => prev.concat(curr), []);
    });
}

module.exports = gulp => {

    gulp.task('clean-export', function () {
        return gulp.src([paths.exportSrv], {allowEmpty:true}).pipe(vinylPaths(del));
    });

    gulp.task('export-copy', function () {
        return gulp
            .src(getExportList(), {base: '.'})
            .pipe(gulp.dest(paths.exportSrv));
    });

    gulp.task('export-normalized-resources',() =>  {
        return normalizeExportPaths().then(normalizedPaths => {
            return gulp
                .src(normalizedPaths, {base: '.'})
                .pipe(gulp.dest(paths.exportSrv));
        });
    });

// use after prepare-release
    gulp.task('export',
        gulp.series(
            'bundle',
            'clean-export',
            'export-normalized-resources',
            'export-copy'
        ));
};
