module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        src: {
            files: ['src/main.js', 'src/utils.js', 'src/events.js', 'src/modules.js', 'src/map.js', 'src/poi.js', 'src/geolocate.js', 'src/display.js', 'src/directions.js'],
            dev  : ['src/main.js', 'src/utils.js', 'src/events.js', 'src/modules.js', 'src/map.js', 'src/location.js', 'src/directions.js']
        },

        concat: {
            main: {
                options: {
                    separator: '\n'
                },
                src: '<%= src.files %>',
                dest: 'bmaps.js'
            },

            test: {
                options: {
                    separator: '\n'
                },
                src: '<%= src.files %>',
                dest: 'test/src/bmaps.js'
            },
            dev: {
                options: {
                    separator: '\n'
                },
                src: '<%= src.dev %>',
                dest: 'test/src/bmaps.js'
            }
        },
        uglify: {
            min: {
                src: 'bmaps.js',
                dest: 'bmaps.min.js'
            }      
        },
        watch: {
            scripts: {
                files: ['src/**'],
                tasks: ['concat'],
                options: {
                    nospawn: true,
                    interval: 1000
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat:main', 'concat:test', 'uglify:min']);
};