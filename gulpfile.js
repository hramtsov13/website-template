import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import concat from 'gulp-concat';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';

import dartSass from 'sass';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import browserSync from 'browser-sync';
import del from 'del';

const paths = {
  css: {
    src: 'app/src/scss/**/*.scss',
    concat: 'style.min.css',
    devDist: 'app/src/css',
    dist: 'dist/css',
  },
  js: {
    src: 'app/src/js/!(script.min.js)',
    concat: 'script.min.js',
    devDist: 'app/src/js',
    dist: 'dist/js',
  },
  html: {
    src: 'app/*.html',
    dist: 'dist',
  },
  img: {
    src: 'app/src/img/*[.png,.jpg,.svg]',
    dist: 'dist/img',
  },
  fonts: {
    src: 'app/fonts/**/*',
    dist: 'dist/fonts',
  },
};

// Compile
const compileScript = () => {
  return gulp
    .src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(concat(paths.js.concat))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.devDist))
    .pipe(browserSync.stream());
};

const compileStyle = () => {
  const sass = gulpSass(dartSass);
  var plugins = [autoprefixer(), cssnano()];

  return gulp
    .src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(postcss(plugins))
    .pipe(concat(paths.css.concat))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.devDist))
    .pipe(browserSync.stream());
};

const compile = gulp.parallel(compileScript, compileStyle);

// Serve
const startServer = (done) => {
  browserSync.init({
    server: {
      baseDir: 'app',
    },

    port: 3000,
  });
  done();
};

const reload = (done) => {
  browserSync.reload();
  done();
};

const serve = gulp.series(compile, startServer);

// Watch
const watchMarkup = (done) => {
  gulp.watch(paths.html.src, gulp.series(reload));
  done();
};

const watchScript = (done) => {
  gulp.watch(paths.js.src, gulp.series(compileScript));
  done();
};

const watchStyle = (done) => {
  gulp.watch(paths.css.src, gulp.series(compileStyle));
  done();
};

const watch = gulp.parallel(watchMarkup, watchScript, watchStyle);
const defaultTasks = gulp.parallel(serve, watch);

// Build
const buildMarkup = () => {
  return gulp.src(paths.html.src).pipe(gulp.dest(paths.html.dist));
};

const buildScript = () => {
  return gulp.src(paths.js.devDist).pipe(gulp.dest(paths.js.dist));
};

const buildStyle = () => {
  return gulp.src(paths.css.devDist).pipe(gulp.dest(paths.css.dist));
};

const buildFonts = () => {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dist));
};

const buildImage = () => {
  return gulp.src(paths.img.src).pipe(imagemin()).pipe(gulp.dest(paths.img.dist));
};

const removeDist = () => {
  return del('dist');
};

const build = gulp.series(
  removeDist,
  compile,
  gulp.parallel(buildMarkup, buildScript, buildStyle, buildFonts, buildImage)
);

gulp.task('build', build);
gulp.task('default', defaultTasks);
