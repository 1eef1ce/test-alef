'use strict';

// General
const gulp = require('gulp');
const del = require('del');
const newer = require('gulp-newer');
const multipipe = require('multipipe');
const rename = require('gulp-rename');
const rigger = require('gulp-rigger');

// Styles
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');

sass.compiler = require('node-sass');

//Scripts
const uglify = require('gulp-uglify');

//Html
const jade = require('gulp-jade');

// BrowserSync
const browserSync = require('browser-sync').create();

// Paths to project folders
const paths = {
    input: 'src/',
    output: 'public/',
    scripts: {
        input: 'src/js/*.js',
        output: 'public/js/',
        watch: 'src/js/**/*.js'
    },
    styles: {
        input: 'src/styles/**/style.scss',
        output: 'public/css/',
        watch: 'src/styles/**/*.*'
    },
    assets: {
        input: 'src/assets/**/*.*',
        output: 'public/assets/',
        watch: 'src/assets/**/*.*'
    },
    html: {
        input: 'src/index.html',
        output: 'public/',
        watch: 'src/**/*.html'
    }
};

// Tasks
gulp.task('styles', function () {
    const plugins = [
        autoprefixer(),
        cssnano()
    ];
    return multipipe(
        gulp.src(paths.styles.input),
        sass(),
        postcss(plugins),
        rename({suffix: '.min'}),
        gulp.dest(paths.styles.output)
    );
});

gulp.task('scripts', function () {
    return multipipe(
        gulp.src(paths.scripts.input),
        concat('main.js'),
        rename({ suffix: '.min' }),
        uglify(),
        gulp.dest(paths.scripts.output)
    );
});

gulp.task('assets', function(){
    return gulp.src(paths.assets.input, {since: gulp.lastRun('assets')})
        .pipe(newer(paths.assets.output))
        .pipe(gulp.dest('paths.assets.output'));
});
/*
gulp.task('jade', function() {
    return multipipe(
        gulp.src(paths.html.input),
        jade(),
        rigger(),
        gulp.dest(paths.html.output)
    );
});
*/
gulp.task('html', function () {
   return gulp.src(paths.html.input)
       .pipe(rigger())
       .pipe(gulp.dest(paths.html.output));
});

gulp.task('clean', function () {
    return del(paths.output);
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles', 'scripts', 'assets', 'html'))
);

gulp.task('watch', function () {
    gulp.watch(paths.styles.watch, gulp.series('styles'));
    gulp.watch(paths.scripts.watch, gulp.series('scripts'));
    gulp.watch(paths.assets.watch, gulp.series('assets'));
    gulp.watch(paths.html.watch, gulp.series('html'));
});

gulp.task('serve', function () {
    browserSync.init({
        server: 'public'
    });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev',
    gulp.series('build',
        gulp.parallel('watch', 'serve'))
);

// Default task
gulp.task('default',
    gulp.series ('build', 'serve'));
