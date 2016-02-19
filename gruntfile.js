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
                        cwd: "src",
                        src: ["**/*.js", "!**/*.min.js"],
                        dest: "src",
                        ext: ".min.js"
                    }
                ]
            }
        },
        typescript: {
            base: {
                src: ['src/**/*.ts', "!**/*.d.ts"],
                dest: 'src',
                options: {
                    module: 'commonjs', 
                    target: 'es5',
                    rootDir: 'src',
                    sourceMap: true,
                    declaration: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('default', ['uglify', 'typescript']);
};

