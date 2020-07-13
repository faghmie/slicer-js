module.exports = function(grunt) {
    require('jit-grunt')(grunt);
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
          options: {
            // define a string to put between each file in the concatenated output
            separator: ';'
          },
          core: {
            // the files to concatenate
            src: ['<%= pkg.scripts.core %>'],
            // the location of the resulting JS file
            dest: 'dist/js/<%= pkg.name %>.js'
		  }
        },
        terser: {
          options: {
            // the banner is inserted at the top of the output
            // banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
          },
          output: {
            files: {
				'dist/js/<%= pkg.name %>.min.js': [
												'<%= concat.core.dest %>',
											] 
            }
          }
        },
        jshint: {
          // define the files to lint
          files: [
					'Gruntfile.js',
					'<%= pkg.scripts.core %>',
				],
          // configure JSHint (documented at http://www.jshint.com/docs/)
          options: {			  
              laxcomma: true,
              loopfunc: true,
            // more options here if you want to override JSHint defaults
            globals: {
              jQuery: true,
              console: true,
              module: true
            }
          }
        },
        cssmin: {
				core_styles: {
					src: '<%= pkg.scripts.css_core %>',
					dest: 'dist/css/<%= pkg.name %>.min.css'
				}
			},
		clean: {
				all_css: ['dist/**/*.css'],
				js: ['dist/**/*.js'],
				production: [
							'dist/js/<%= pkg.name %>.js',
							]
			},
    });
    
    grunt.loadNpmTasks('grunt-service-worker');
    // grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-terser');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-connect');
    // grunt.loadNpmTasks('grunt-php');
    grunt.loadNpmTasks('grunt-newer');
	// grunt.loadNpmTasks('grunt-html-build');
	
	
    grunt.registerTask('default', 
				[
					'clean', 
					'jshint', 
					'newer:concat', 
					'newer:terser', 
					'cssmin', 
					// 'newer:copy', 
					// 'htmlbuild',
					//'service_worker',
					// 'php', 
					// 'watch'
				]
			);
};
