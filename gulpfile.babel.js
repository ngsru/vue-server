import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import jshint from 'gulp-jshint';
import del from 'del';
import runSequence from 'run-sequence';

var config = {
  paths: {
    js: {
      src: 'src/**/*.js',
      dist: 'dist/'
    }
  }
};

gulp.task('clean', () =>
  del(config.paths.js.dist)
);

gulp.task('babel', ['babel-src']);

gulp.task('babel-src', ['lint-src'], () =>
  gulp.src(config.paths.js.src)
    .pipe(babel())
    .pipe(gulp.dest(config.paths.js.dist))
);

gulp.task('lint-src', () =>
  gulp.src(config.paths.js.src)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
);

gulp.task('watch', () => {
  gulp.watch(config.paths.js.src, ['babel-src']);
});

// Default Task
gulp.task('default', () =>
  runSequence('clean', ['babel'])
);
