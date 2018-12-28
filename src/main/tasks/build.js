// module.paths.push(`${process.cwd()}/node_modules`);

const
    gulp = require('gulp'),
    utils = require('./utils.js'),
    scss = require('gulp-sass'),
    paths = require('../paths.js'),
    clean = require('./clean'),
    log = require('gulp-util'),
    concat = require('gulp-concat'),
    pug = require('gulp-pug'),
    dox = require('gulp-dox'),
    rename = require('gulp-rename'),
    typescript = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    project = typescript.createProject('tsconfig.json'),
    del = require('del'),
    vinylPaths = require('vinyl-paths');


const buildDocs = () => {
    return gulp.src(paths.typescript)
        .pipe(dox())
        .pipe(rename(utils.reparent))
        .pipe(gulp.dest(paths.output));
};

//================================================================================
// build scss
//================================================================================

const buildScss = () => {
    let include = paths.createScssInclusions(utils),
        cfg = include && include.length ? {
            includePaths: include
        } : {};
    return gulp.src(paths.styles)
        .pipe(scss(cfg).on('error', scss.logError))
        .pipe(concat('aire.css'))
        .pipe(gulp.dest(paths.output));

};


const buildIncludedScss = (done) => {
    if (paths.includedStyles) {
        return gulp.src(paths.includedStyles)
            .pipe(gulp.dest(`${paths.dest}/scss`));
    }
    done();
};

//================================================================================
// build typescript
//================================================================================


const build = () => {
    return gulp
        .src(paths.typescript)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(project(typescript.reporter.fullReporter()))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '.'}))
        .pipe(rename(utils.reparent))
        .pipe(gulp.dest(paths.output));
};


//================================================================================
// build pug files
//================================================================================


const buildPug = () => {

    return gulp.src(paths.pug)
        .pipe(pug({}))
        .pipe(rename(utils.reparent))
        .pipe(gulp.dest(paths.output));
};

//================================================================================
// copy metadata
//================================================================================

const copyMetadata = (done) => {
    if (paths.metadata) {
        return gulp.src(paths.metadata)
            .pipe(rename(utils.reparent))
            .pipe(gulp.dest(paths.output));
    }
    return done();
};

//================================================================================
// copy scss: copy all scss to dist
//================================================================================


const copyScss = () => {
    return gulp.src(paths.styles)
        .pipe(gulp.dest(paths.output));
};

//================================================================================
// task definitions
//================================================================================


//================================================================================
// aggregate
//================================================================================


module.exports = (gulp) => {

    require('./watch.js')(gulp);
    const site = require('./site.js');
    gulp.task('aire:generate', site.aireGenerate);
    gulp.task('clean', () => {
        return gulp.src(paths.output, {
            allowEmpty: true
        }).pipe(vinylPaths(del));
    });

//================================================================================
// copy
//================================================================================


    gulp.task('copy:metadata', copyMetadata);
    gulp.task('copy:sass', copyScss);


//================================================================================
// build
//================================================================================


    gulp.task('build:ts', build);
    gulp.task('build:docs', buildDocs);
    gulp.task('build:pug', buildPug);
    gulp.task('build:sass',
        gulp.series(
            buildIncludedScss,
            buildScss,
            'copy:metadata'
        ));
    gulp.task('build',
        gulp.series('clean',
            gulp.parallel(
                'build:pug',
                'build:docs',
                'build:sass',
                'build:ts',
                'copy:metadata'
            )));


};


