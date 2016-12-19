var gulp = require("gulp"),
    uglify = require("gulp-uglify"),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    pkg = require('./package.json');

gulp.task("updateFileHeader", function(){
    gulp.src(["jquery.validate.unobtrusive.js"], { base: "." })
        .pipe(replace(/@version.*/, '@version v' + pkg.version))
        .pipe(gulp.dest("."));
});

gulp.task("minifyJS", function () {
    gulp.src(["jquery.validate.unobtrusive.js"], { base: "." })
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest("."));
});

gulp.task("default", ["updateFileHeader","minifyJS"]);
