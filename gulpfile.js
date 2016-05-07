// // require("babel-register");
// // require('typescript-require')({
// //     targetES5: true,
// //     exitOnError: true
// // });
// import gulp from 'gulp';
// // path = require('path');
// import gutil from "gulp-util";
// import jade from 'jade';
// import gulpJade from 'gulp-jade';
// // Server = require('karma').Server;
// // fs = require('fs');
// // _ = require('lodash/fp');
//
// let paths = {
//   src: './app/',
//   dist: './dist/',
//   vendor: './app/vendor/**/*.*',
//   static: './app/static/**/*.*',
//   swagger: './app/swagger/**/*.*',
//   index: './app/index.jade',
//   tests: './app/tests.jade'
// };
//
// gulp.task('default', [
//   'index',
//   'tests'
// ]);
//
// gulp.task('watch', function() {
//   gulp.watch(paths.vendor, ['vendor']);
//   gulp.watch(paths.static, ['static']);
//   gulp.watch(paths.swagger, ['swagger']);
//   gulp.watch(paths.index, ['index']);
//   return gulp.watch(paths.tests, ['tests']);
// });
//
// let copy = (glob, op = gutil.noop(), to = paths.dist) =>
//   gulp.src(glob, {base: paths.src})
//       .pipe(op)
//       .pipe(gulp.dest(to));
//
// gulp.task('vendor', () => copy(paths.vendor));
// gulp.task('static', () => copy(paths.static));
// gulp.task('swagger', () => copy(paths.swagger));
// gulp.task('jade',   () => copy(paths.jade, gulpJade({jade, pretty: true})));
// gulp.task('index',   () => copy(paths.index, gulpJade({jade, pretty: true})));
// gulp.task('tests',   () => copy(paths.tests, gulpJade({jade, pretty: true}))); //, paths.src
// // locals: YOUR_LOCALS
//
// // karma_conf = __dirname + '/karma.conf.js';
// //
// // gulp.task('test', (done) =>
// //   new Server({configFile: karma_conf, singleRun: true }, done).start());
// //
// // gulp.task('tdd', (done) =>
// //   new Server({ configFile: karma_conf }, done).start());
//
// // for production add uglify, google closure compiler...