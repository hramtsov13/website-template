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
    src: 'app/src/scss/*.scss',
    dest: 'app/dist/css',
  },
  js: {
    src: 'app/src/js/*.js',
    dest: 'app/dist/js',
  },
  html: {
    src: 'app/*.html',
    dest: 'app/dist/html',
  },
  img: {
    src: 'app/src/img/*[.png,.jpg,.svg]',
    dest: 'app/dist/img',
  },
};

//compile
const compileScript = () => {
  return gulp
    .src(['app/src/js/script.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('script.min.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/src/js'))
    .pipe(browserSync.stream());
};

const compileStyle = () => {
  const sass = gulpSass(dartSass);
  var plugins = [autoprefixer(), cssnano()];

  return gulp
    .src(['app/src/scss/styles.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(concat('style.min.css'))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/src/css'))
    .pipe(browserSync.stream());
};

const compileImages = () =>
  gulp.src(paths.img.src).pipe(imagemin()).pipe(gulp.dest(paths.img.dest).pipe(browserSync.stream()));

const compile = gulp.parallel(compileScript, compileStyle, compileImages);

//Watch relodaings
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

//Serve
const serve = gulp.series(compile, startServer);

const watchMarkup = (done) => {
  gulp.watch('app/*.html', gulp.series(reload));
  done();
};

const watchScript = (done) => {
  gulp.watch('app/src/js/script.js', gulp.series(compileScript));
  done();
};

const watchStyle = (done) => {
  gulp.watch('app/src/scss/*.scss', gulp.series(compileStyle));
  done();
};

const watch = gulp.parallel(watchMarkup, watchScript, watchStyle);
const defaultTasks = gulp.parallel(serve, watch);

//build
const buildMarkup = () => {
  return gulp.src('app/*.html').pipe(gulp.dest('dist'));
};

const buildScript = () => {
  return gulp.src(['app/src/js/script.js']).pipe(gulp.dest('dist/js'));
};

const buildStyle = () => {
  return gulp.src(['app/src/scss/styles.scss']).pipe(gulp.dest('dist/css'));
};

const buildFonts = () => {
  return gulp.src(['app/src/fonts/**/*']).pipe(gulp.dest('dist/fonts'));
};

const buildImage = () => {
  return gulp.src(['app/src/img/**/*']).pipe(gulp.dest('dist/img'));
};

const removeDocs = () => {
  return del('docs');
};

const build = gulp.series(
  removeDocs,
  compile,
  gulp.parallel(buildMarkup, buildScript, buildStyle, buildFonts, buildImage)
);

gulp.task('build', build);
gulp.task('default', defaultTasks);
