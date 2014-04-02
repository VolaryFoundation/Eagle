module.exports = function(grunt) {

  grunt.registerTask('spec', [ 'units' ]);

  grunt.registerTask('units', 'Running units...', function() {
    var done = this.async();
    require('child_process').exec('mocha --compilers coffee:coffee-script/register --reporter spec ./spec', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
};
