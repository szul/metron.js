module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: false,
                sourceMap: true
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: "javascript",
                        src: ["**/*.js", "!**/*.min.js"],
                        dest: "javascript",
                        ext: ".min.js"
                    }
                ]
            }
        }//,
        /*
        less: {
            options: {
                paths: ["css"],
            },
            src: {
                expand: true,
                cwd: "css",
                src: "*.less",
                dest: "css",
                ext: ".css",
            }
        }
        */
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-less');

    //grunt.registerTask('default', ['uglify', 'less']);
    grunt.registerTask('default', ['uglify']);
}
