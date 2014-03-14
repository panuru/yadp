module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: ['src/js/jquery.fn.datepicker.js', 'src/js/templates.js', 'src/js/datepicker.js'],
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
    watch: {
      js: {
        files: ['src/js/*'],
        tasks: ['concat']
      },
      stylesheets: {
        files: ['src/stylesheets/*'],
        tasks: ['compass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'compass', 'watch']);

};
