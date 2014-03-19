module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        debug: true,
        globals: {
          jQuery: true
        },
      },
      uses_defaults: ['Gruntfile.js', 'src/js/*']
    },
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: ['src/js/jquery.fn.datepicker.js', 'src/js/templates.js', 'src/js/calendar.js', 'src/js/datepicker.js'],
        dest: 'src/datepicker.js',
      }
    },
    compass: {
      all: {
        options: {
          sassDir: 'src/stylesheets',
          cssDir: 'src/'
        }
      }
    },
    bower: {
      dev: {
        dest: 'demo/',
        js_dest: 'demo/js',
        css_dest: 'demo/css'
      }
    },
    copy: {
      js: {
        files: [
          { expand: true, flatten: true, src: ['src/*.js', 'vendor/*.js'], dest: 'demo/js/', filter: 'isFile' }
        ]
      },
      css: {
        files: [
          { expand: true, flatten: true, src: ['src/*.css'], dest: 'demo/css/', filter: 'isFile' }
        ]
      },
      fonts: {
        files: [
          { expand: true, flatten: true, src: ['fonts/**/*.*'], dest: 'demo/fonts/', filter: 'isFile' }
        ]
      }
    },
    watch: {
      js: {
        files: ['src/js/*'],
        tasks: ['jshint', 'concat', 'copy:js']
      },
      stylesheets: {
        files: ['src/stylesheets/*'],
        tasks: ['compass', 'copy:css']
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['bower', 'jshint', 'concat', 'compass', 'copy', 'watch']);

};
