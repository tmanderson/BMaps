module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        src: {
            files: ['src/Options.js', 'src/Utils.js', 'src/Events.js', 'src/Map.js', 'src/Location.js', 'src/Pin.js', 'src/Directions.js', 'src/View.js', 'src/Poi.js', 'src/BMaps.js']
        },

        concat: {
            main: {
                options: {
                    banner: 'BMaps = {}\n',
                    separator: '\n'
                },
                src: '<%= src.files %>',
                dest: 'bmaps.js'
            },

            test: {
                options: {
                    banner: 'BMaps = {}\n',
                    separator: '\n'
                },
                src: '<%= src.files %>',
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