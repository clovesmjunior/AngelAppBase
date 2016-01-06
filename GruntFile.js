module.exports = function(grunt) {
    var srcPath         = ["js/**/*.js"];
    var cssPath         = ["css/**/*.css"];
    var libs            = [ 
                            "public/bower_components/q/q.js", 
                            "public/bower_components/jquery/dist/jquery.js",                                                       
    ];
    var cssArray = [
        
    ];
    var specsPath       = 'specs/**/*spec*.js';
    var helperPath      = 'specs/helpers/*.js';

    grunt.initConfig({
        concat: {
            none : {},
            js : {
                options: {
                    process: function(src, filepath) {
                        return '\n' + '// FILE: ' + filepath + '\n' + src;
                    }
                },
                src:libs.concat(srcPath),
                dest: 'dist/js/main.js'
            },
            css : {
                options: {
                    process: function(src, filepath) {
                        return '\n' + '// FILE: ' + filepath + '\n' + src;
                    }
                },
                src:cssArray.concat(cssPath),
                dest: 'dist/css/main.css'
            }
        },
        csslint: {
          strict: {
            options: {
                process: function(src, filepath) {
                    return '\n' + '// FILE: ' + filepath + '\n' + src;
                }
            },
            src: cssArray,
            dest: 'dist/css/main.css'
          },
          lax: {
             options: {
                process: function(src, filepath) {
                    return '\n' + '// FILE: ' + filepath + '\n' + src;
                }
            },
            src: cssArray,
            dest: 'dist/css/main.css'
          }
        },
        jshint: {
            all: ['Gruntfile.js', specsPath].concat(srcPath)
        },    
        jasmine : {
            pivotal:{
                // Your project's source files
                src : [srcPath],
                // Your Jasmine spec files
                options: {
                    vendor : ["specs/libs/*.js"].concat(libs),
                    specs : specsPath,
                    // Your spec helper files
                    helpers : helperPath,
                    coverage : {
                        output : 'coverage/',
                        reportType : 'cobertura',
                        excludes : ['lib/**/*.js', 'bower_components/**/*.js']    
                      },
                }
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: false,
                report : 'min',
                // the banner is inserted at the top of the output
                banner: '/*! <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: { 
                'dist/js/main.min.js': libs.concat(srcPath)
                }
            }
        },
        cssmin: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
          pivotal:{
            src: cssArray.concat(cssPath),
            dest: 'dist/css/main.min.css'
          }
        },
        watch: {
            pivotal : {
                files: [specsPath].concat(srcPath), 
                tasks: ['jshint', 'uglify', 'concat']
            },
            test : {
                files: [specsPath].concat(srcPath), 
                tasks: ['jasmine']
            }
        },
         complexity: {
            generic: {
                src: srcPath,
                exclude: ['doNotTest.js'],
                options: {
                    breakOnErrors: true,
                    jsLintXML: 'report.xml',         // create XML JSLint-like report
                    checkstyleXML: 'checkstyle.xml', // create checkstyle report
                    errorsOnly: false,               // show only maintainability errors
                    cyclomatic: [],          // or optionally a single value, like 3
                    halstead: [8, 13, 20],           // or optionally a single value, like 8
                    maintainability: 100,
                    hideComplexFunctions: false,     // only display maintainability
                    broadcast: false                 // broadcast data over event-bus
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-complexity');

    // Default task.
    grunt.registerTask('default', ['jshint', 'jasmine', 'uglify', 'concat', 'concat min cssmin'] );
    grunt.registerTask('commit', ['jshint','uglify','concat'] );
    
};