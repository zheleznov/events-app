var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['copy-html', 'copy-bootstrap', 'styles'], function(){
    gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('index.html', ['copy-html']);
    gulp.watch('dist/index.html').on('change', browserSync.reload);
});

//run sass with autoprefixer
gulp.task('styles', function(){
    gulp.src('sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./dist/css'))
});

//copy index.html to product
gulp.task('copy-html', function(){
    gulp.src('./index.html')
        .pipe(gulp.dest('./dist'));
});

//copy bootstrap to product folder
gulp.task('copy-bootstrap', function(){
    gulp.src('./css/bootstrap.min.css')
        .pipe(gulp.dest('./dist/css'));
});

//concat scripts
gulp.task('scripts', function(){
    gulp.src('js/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/js'));
});

//concat and minify
gulp.task('scripts-dist', function(){
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

//create production version
gulp.task('create-production', ['copy-html', 'copy-bootstrap', 'styles', 'scripts-dist']);

//browser sync
browserSync.init({
    server: "./dist"
});
browserSync.stream();