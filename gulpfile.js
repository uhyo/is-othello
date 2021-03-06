var path=require('path');
var gulp=require('gulp');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var babelify=require('babelify');
var typescript=require('gulp-typescript');
var del=require('del');
var sass=require('gulp-sass');

const tsproj = typescript.createProject('tsconfig.json', {
    typescript: require('typescript'),
});
gulp.task('tsc',function(){
    return gulp.src("src/**/*.ts")
    .pipe(tsproj())
    .js
    .pipe(gulp.dest("js/"));
});
gulp.task('jsx',function(){
    return browserify({
        entries:[path.join(__dirname,"jsx/entrypoint.jsx")],
        transform:[babelify.configure({
            presets: ['@babel/preset-react'],
        })],
        extensions:['.js','.jsx'],
        basedir:__dirname
    })
    .bundle()
    .pipe(source("components.js"))
    .pipe(gulp.dest("dist"));
});
gulp.task('sass',function(){
    return gulp.src("sass/**/*.scss")
    .pipe(sass().on("error",sass.logError))
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
