const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', ['static'],()=>{
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

//tarefa para pegar qualquer arquivo json e copiar para diretorio 'dist'
gulp.task('static', ['clean'], ()=> {
    return gulp
    .src(['src/**/*.json'])
    .pipe(gulp.dest('dist'));
});

//tarefa responsavel para limpar todo diretorio 'dist'
//caso haja alguma exclusao no src ele será escluido no 'dist'
gulp.task('clean',()=>{
    return gulp
    .src('dist')
    .pipe(clean());
});

//tarefa para chamar as outras tarefas, chamando em ordem
gulp.task('build',['scripts']);

gulp.task('watch',['build'],()=>{
    return gulp.watch(['src/**/*.ts','src/**/*.json'],['build']);
});

gulp.task('develop', function (done) {
var stream = nodemon({ 
          script: 'index.js'
        , ext: 'html js'
        //, ignore: ['ignored.js']
        //, tasks: ['lint']
        , done: done})

stream
    .on('restart', function () {
        console.log('restarted!')
    })
    .on('crash', function() {
        console.error('Application has crashed!\n')
        stream.emit('restart', 10)  // restart the server in 10 seconds
    })
});

gulp.task('default',['watch']);