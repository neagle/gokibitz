var gulp = require('gulp');

// Tasks to be run by Travis CI
gulp.task('travis', ['lint', 'code-style']);
