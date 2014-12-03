var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    nodemon = require('gulp-nodemon');

var pathToSrc = ['config/**/*.js', 'src/**/*.js', 'gulpfile.js'];

gulp.task('default', ['dev','lint'], function () {
});

gulp.task('dev', function () {
    nodemon({ script: 'server.js' })
        .on('change', ['lint']);
});

gulp.task('lint', function () {
    gulp.src(pathToSrc)
        .pipe(jshint({
            strict:false
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

/////////////////////////////////////
/////////////// PROD ///////////////
///////////////////////////////////

// TODO