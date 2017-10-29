const gulp = require('gulp');
const pug = require('pug');
const gulpPug = require('gulp-pug');
const seq = require('gulp-sequence');
const ren = require('gulp-rename');

gulp.task('copy:typings', ['clean:empty-declarations'], () => {
  return gulp.src('./dist/esm2015/**/*.d.ts')
    .pipe(gulp.dest('./dist/typings'));
});

gulp.task('copy:demo.pug', () => {
  return gulp.src('./src/demo/demo.pug')
    .pipe(gulpPug({
      pug,
      doctype: 'html'
    }))
    .pipe(ren(path => {
      path.basename = 'index';
    }))
    .pipe(gulp.dest('./.demo'));
});

gulp.task('copy:demo-to-pre-aot', () => {
  return gulp.src('./.tmp/src-inlined-templates/**/*')
    .pipe(gulp.dest('./.tmp/pre-aot'))
});

gulp.task('copy:demo.pug:watch', () => {
  seq('copy:demo.pug', () => {
  });
  gulp.watch('./src/demo/demo.pug', ['copy:demo.pug']);
});