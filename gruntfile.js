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
        },
        less: {
            options: {
                paths: ["javascript/css"],
            },
            src: {
                expand: true,
                cwd: "javascript/css",
                src: "*.less",
                dest: "javascript/css",
                ext: ".css",
            }
        },
        typescript: {
            base: {
                src: ['typescript/**/*.ts', "!**/*.d.ts"],
                dest: 'typescript',
                options: {
                    module: 'commonjs', 
                    target: 'es5',
                    rootDir: 'typescript',
                    sourceMap: true,
                    declaration: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('default', ['uglify', 'less', 'typescript']);
}
