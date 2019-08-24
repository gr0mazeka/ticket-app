const gulp = require("gulp"),
  rename = require("gulp-rename"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  nested = require("postcss-nested"),
  cssnano = require("cssnano"),
  postcssVars = require("postcss-simple-vars"),
  atImport = require("postcss-import"),
  // var mqpacker = require('css-mqpacker');
  babel = require("gulp-babel"),
  uglify = require("gulp-uglify-es").default,
  browserSync = require("browser-sync");
// reporter = require('postcss-reporter'),
// stylelint = require('stylelint');

function style() {
  var processors = [
    atImport(),
    // mqpacker,
    nested,
    postcssVars,
    autoprefixer({
      overrideBrowserslist: ["last 10 version"]
    }),
    // stylelint(),
    // reporter(),
    cssnano()
  ];
  return gulp
    .src("css/style.post.css")
    .pipe(postcss(processors))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("./dist/"))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    proxy: "localhost/ticket"
  });
  gulp.watch("./css/**/*.css", style);
  gulp.watch("./*.html").on("change", browserSync.reload);
  gulp.watch("./js/**/*.js").on("change", browserSync.reload);
}

function jsconfirm() {
  // return gulp.src('js/ticket.js')
  return (
    gulp
      .src("js/confirm.js")
      //.pipe(babel({
      // "presets": ["@babel/preset-env"]
      // }))
      .pipe(uglify())
      .pipe(rename("confirm.min.js"))
      .pipe(gulp.dest("dist"))
  );
}
function jsticket() {
  return gulp
    .src("js/ticket.js")
    .pipe(uglify())
    .pipe(rename("ticket.min.js"))
    .pipe(gulp.dest("dist"));
}

function compress() {
  return pipeline(gulp.src("js/ticket.js"), uglify(), gulp.dest("dist"));
}

exports.style = style;
exports.compress = compress;
exports.jsconfirm = jsconfirm;
exports.jsticket = jsticket;
exports.watch = watch;
