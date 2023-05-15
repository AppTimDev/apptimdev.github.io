const gulp = require('gulp');
const {
    rimraf
} = require('rimraf')
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const htmlreplace = require('gulp-html-replace');
const minifyHTML = require('gulp-minify-html');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const terser = require('gulp-terser');
const babel = require('gulp-babel');
const webserver = require('gulp-webserver');
const browserSync = require('browser-sync').create();
const { exec } = require('child_process');
const imagemin = require("gulp-imagemin");
// const minifyCSS = require('gulp-minify-css');
// const copyFiles = require('gulp-contrib-copy');

const uglify_options = {
    //https://github.com/mishoo/UglifyJS
    mangle: {
        toplevel: true
    },
    compress: {
        drop_console: true
    },
    output: {
        beautify: false,
        comments: false,
        // preamble: "/* uglified */"
    }
}
const port = {
    dev: 3000,
    pro: 8080
}
const path = {
    src_folder: 'src/',
    dest_folder: 'dest/',
    dest_js_folder: 'dest/js/',
    dest_css_folder: 'dest/css/',
    src_lib_files: 'src/lib/**',
    src_lib_folder: 'src/lib',
    dest_lib_folder: 'dest/lib',

    src_files: 'src/**',
    src_images_files: 'src/images/**/*.{png,jpg,gif,ico}',
    dest_images_folder: 'dest/images',
    src_icons_files: 'src/icons/**/*',
    dest_icons_folder: 'dest/icons',
    src_ico_file: 'src/favicon.ico',
    src_html_files: 'src/*.html',
    src_css_files: 'src/css/*.css',
    src_js_files: 'src/js/*.js',

    dest_files: 'dest/**',
}

//remove all files of the destination folder
function clean() {
    return rimraf(path.dest_folder);
}

// Copy all static images, icons, ico
function copyImages() {
    return gulp.src(path.src_images_files)
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [
                {
                    removeViewBox: true
                }
            ]
        }))
        .pipe(gulp.dest(path.dest_images_folder));
}

function copyIco() {
    return gulp.src(path.src_ico_file)
        // .pipe(copyFiles())
        // .pipe(imagemin({
        //     interlaced: true,
        //     progressive: true,
        //     optimizationLevel: 5,
        //     svgoPlugins: [
        //         {
        //             removeViewBox: true
        //         }
        //     ]
        // }))
        .pipe(gulp.dest(path.dest_folder));
}

function copyIcons(done) {
    gulp.src(path.src_icons_files)
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [
                {
                    removeViewBox: true
                }
            ]
        }))
        .pipe(gulp.dest(path.dest_icons_folder));
    done();
}

function copyLib(done) {
    gulp.src(path.src_lib_files)
        .pipe(gulp.dest(path.dest_lib_folder));
    done();
}

function html() {
    var options = {
        comments: false,
        spare: false,
        quotes: true
    };
    return gulp.src(path.src_html_files)
        .pipe(htmlreplace({
            'css': 'css/bundle.min.css',
            'js': {
                src: 'js/bundle.min.js',
                tpl: '<script src="%s" defer></script>'
            }
        }))
        .pipe(minifyHTML(options))
        .pipe(gulp.dest(path.dest_folder));
}


//concat all css files into one bundle css file and minify this file
function css() {
    return gulp.src([
        'src/css/site/order/root.css', 
        'src/css/site/*.css',
        'src/css/*.css'
    ])
    .pipe(concat('bundle.min.css'))
    // .pipe(minifyCSS({
    //     keepBreaks: false,
    // }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(path.dest_css_folder));
}

//concat all js files into one bundle js file and minify this file
function js() {
    return gulp.src([
        'src/js/site/order/root.js', 
        'src/js/site/*.js',
        'src/js/*.js'
    ]).pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(concat('bundle.min.js'))
    // .pipe(terser({
    //     keep_fnames: false,
    //     mangle: true,
    //     compress:true,
    //     drop_console :true
    //   }))
    // .pipe(terser(uglify_options))
    .pipe(uglify(uglify_options))
    .pipe(gulp.dest(path.dest_js_folder));
}

function browserSyncInit(baseDir, port) {
    browserSync.init({
        server: {
            baseDir: baseDir,
        },
        port: port
    });
}
// BrowserSync
function browserSyncDev(done) {
    browserSyncInit(path.src_folder, port.dev)
    done();
}
function browserSyncPro(done) {
    browserSyncInit(path.dest_folder, port.pro)
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browserSync.reload();
    done();
}

// Watch files changes in source files
//if any files change in source files, reload the browser
function watchDev() {
    gulp.watch(path.src_files, browserSyncReload);
}

// Watch files changes in source files,
//if any files change in source files, 
//run the build task and then reload the browser (build task --> browserSync.reload)
function watchPro() {
    gulp.watch(path.src_files, gulp.series(build, browserSyncReload));
}

function startServer() {
    return gulp.src(path.dest_folder)
        .pipe(webserver({
            port: port.pro,
            livereload: true,
            directoryListing: false,
            open: true,
            fallback: 'index.html'
        }));
}

function deploy(cb) {
    exec('git subtree push --prefix dest origin gh-pages', (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);            
        }
        console.log(`${stdout}`);
        cb();
    });
}

//other task
//concat all css files
function concatCss() {
    return gulp.src(path.src_css_files)
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(path.dest_css_folder));
}

//concat all js files
function concatJs(cb) {
    return gulp.src(path.src_js_files)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(path.dest_js_folder));
}

//minify css file
function minifyCss() {
    return gulp.src(path.src_css_files)
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".css";
        }))
        .pipe(gulp.dest(path.dest_css_folder));
}
//minify css file
function minifyJs() {
    return gulp.src(path.src_js_files)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify(uglify_options))
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".js";
        }))
        .pipe(gulp.dest(path.dest_js_folder));
}

// export tasks
const copy = gulp.parallel(copyLib, copyImages, copyIcons, copyIco);
const build = gulp.parallel(html, css, js);
const pro = gulp.series(build, gulp.parallel(browserSyncPro, watchPro));
exports.clean = clean;
exports.copy = copy;

exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;

exports.dev = gulp.parallel(browserSyncDev, watchDev);
exports.pro = pro;
exports.start = startServer;
exports.deploy = deploy;
exports.default = gulp.series(clean, gulp.parallel(copy, build), gulp.parallel(browserSyncPro, watchPro));

//other task
exports.concatCss = concatCss;
exports.concatJs = concatJs;
exports.minifyCss = minifyCss;
exports.minifyJs = minifyJs;