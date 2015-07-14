var path=require('path');
var gulp=require('gulp');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var reactify=require('reactify');
var babelify=require('babelify');
var globule=require('globule');
var typescript=require('gulp-typescript');
var del=require('del');
var sass=require('gulp-ruby-sass');

gulp.task('tsc',function(){
    return gulp.src("src/**/*.ts")
    .pipe(typescript({
        module:"commonjs",
        target:"es5",
        typescript:require('typescript')
    }))
    .js
    .pipe(gulp.dest("js/"));
});
gulp.task('jsx',function(){
    return browserify({
        entries:[path.join(__dirname,"jsx/entrypoint.jsx")],
        transform:[babelify,reactify],
        extensions:['.js','.jsx'],
        basedir:__dirname
    })
    .bundle()
    .pipe(source("components.js"))
    .pipe(gulp.dest("dist"));
});
gulp.task('sass',function(){
    return sass("sass/")
    .on("error",function(e){
        console.error(e)
    })
    .pipe(gulp.dest("dist"));
});

gulp.task('clean',function(cb){
    del([
        //tsc
        "js",
        "src/**/*.js",
        //jsx,sass
        "dist",
    ],cb);
});


gulp.task('default',['jsx','tsc','sass']);
