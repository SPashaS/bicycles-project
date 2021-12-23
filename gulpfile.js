"use strict";

// Подключаем модули
const {src, dest} = require('gulp');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps'); // благодаря ему в браузере видим не минифицированный код, а привычную разметку
const autoprefixer = require('gulp-autoprefixer'); // расставляет префиксы для поддержки свойств в разных браузерах
const cssbeautify = require('gulp-cssbeautify'); // форматирует css, чтобы он был легким для чтения
const removeComments = require('gulp-strip-css-comments'); // удаляет комментарии
const rename = require('gulp-rename'); // для переименования файлов
const sass = require('gulp-sass'); // для компиляции sass в css
const cssnano = require('gulp-cssnano'); //для минификации css
const uglify = require('gulp-uglify'); // для минификации (сжатия) js-кода. Обратного преобразования нет.
const concat = require('gulp-concat'); //"склеивает" несколько файлов в один
const plumber = require('gulp-plumber'); // для обработки ошибок
const imagemin = require('gulp-imagemin'); //для минификации изображений
const del = require('del'); // для удаления файлов и папок
const notify = require('gulp-notify'); //предоставляет информацию об ошибке
const browserSync = require('browser-sync').create(); // для запуска сервера и перезагрузки страницы при внесении изменений


// Пути 
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    // Исходные файлы. С этими файлами мы будем работать 
    src: {
        html:   srcPath + "*.html",
        js:     srcPath + "assets/js/*.js",
        css:    srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    // В эти папки будут собираться файлы 
    build: {
        html:   distPath,
        js:     distPath + "assets/js/",
        css:    distPath + "assets/css/",
        images: distPath + "assets/images/",
        fonts:  distPath + "assets/fonts/"
    },
    // За этими файлами мы будем следить. При изменении этих файлов бдет перезагружаться браузер
    watch: {
        html:   srcPath + "**/*.html",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
}

// Если нужно выполнять преобразование файлов в определенном порядке, то используем массив с нужным нам порядком:
const jsFiles = [
    srcPath + 'assets/js/lib.js',
    srcPath + 'assets/js/main.js'
]


// TASKS
// объявляем функции под сборки (все пути относительные)

// Локальный сервер
function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    });
}

// HTML 
function html(cb) {
    return src(path.src.html, {base: srcPath}) 
         //.pipe() - Это 1 конкретное действие, которое мы хотим совершить над нашими файлами.
        .pipe(plumber())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// CSS 
function css(cb) {
    return src(srcPath + 'assets/scss/style.scss') // если порядок файлов не важен, то: return src(path.src.css, {base: srcPath + 'assets/scss/'})
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(concat('style.css'))
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// Для быстрой компиляции CSS во время разработки 
function cssWatch(cb) {
    return src(srcPath + 'assets/scss/style.scss') // если порядок файлов не важен, то: return src(path.src.css, {base: srcPath + 'assets/scss/'})  
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(concat('style.css'))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// JS 
function js(cb) {
    return src(jsFiles) // если порядок не важен, то берем все файлы: return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(concat('script.js'))
        // .pipe(uglify({ //расскомментируй, если надо будет минифицировать js
        //     toplevel: true //(опция модуля uglify) - как сильно сжимать. Есть три уговня, это самый сильный.
        // }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// Для быстрой компиляции JS во время разработки 
function jsWatch(cb) {
    return src(jsFiles) // если порядок не важен, то берем все файлы: return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(concat('script.js'))
        // .pipe(uglify({ //расскомментируй, если надо будет минифицировать js
        //     toplevel: true //(опция модуля uglify) - как сильно сжимать. Есть три уговня, это самый сильный.
        // }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// Images 
function images(cb) {
    return src(path.src.images)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 95, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// Fonts 
function fonts(cb) {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

// При сборке проекта удаляет папку dist и создает новую со свежими файлами 
function clean(cb) {
    return del(path.clean);
    cb();
}

// Для слежки за файлами. Перезагрузит страницу, если что-то изменится 
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], cssWatch);
    gulp.watch([path.watch.js], jsWatch);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}


const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts)); // Будет запускаться по команде gulp build
const watch = gulp.parallel(build, watchFiles, serve); // Будет запускаться по дефолтной команде gulp 


// Экспорты тасок
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;


// На сервер (или заказчику) пойдет только папка dist

// Как юзать этот сборщик в другом проекте:
// 1. B папку с новым проектом переносим файлы gulpfile.js, package.json и папку src;
// 2. B консоли пишем npm install (установятся все нужные модули);
// 3. Соблюдаем файловую структуру или в сборках подправляем пути "откуда берем"/"куда кладем" файлы.