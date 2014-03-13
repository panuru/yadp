module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: ['src/js/templates.js', 'src/js/datepicker.js', 'src/js/jquery.fn.datepicker.js'],
        dest: 'src/datepicker.js',
      }
    },
    watch: {
      src: {
        files: ['src/js/*'],
        tasks: ['concat']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'watch']);

};
