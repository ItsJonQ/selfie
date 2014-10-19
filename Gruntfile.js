module.exports = function(grunt) { 'use strict';

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths
  var config = {
    dist: 'public',
    src: 'src',
    liveReload: 35729,
    port: 1212,
    url: 'localhost'
  };

  var modRewrite = require('connect-modrewrite');

  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= config.src %>/scripts/{,*/}*.js'],
        tasks: ['jshint', 'copy:scripts'],
        options: {
          livereload: 35729
        }
      },
      images: {
        files: ['<%= config.src %>/images/**/*'],
        tasks: ['copy:images'],
        options: {
          livereload: 35729
        }
      },
      html: {
        files: ['*.html'],
        options: {
          livereload: 35729
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      sass: {
        files: ['<%= config.src %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['sass:server'],
        options: {
          livereload: 35729
        }
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: '<%= config.port %>',
        open: true,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: '<%= config.url %>'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            './'
          ],
          // MODIFIED: Add this middleware configuration
          middleware: function(connect, options) {
            var middlewares = [];

            middlewares.push(modRewrite(['^[^\\.]*$ /index.html [L]'])); //Matches everything that does not contain a '.' (period)
            options.base.forEach(function(base) {
              middlewares.push(connect.static(base));
            });
            return middlewares;
          }
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= config.dist %>/*',
            '!<%%= config.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.src %>/scripts/{,*/}*.js',
        '!<%= config.src %>/scripts/vendor/*'
      ]
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourcemap: true,
        loadPath: 'bower_components'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/styles',
          src: ['*.{scss,sass}'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/styles',
          src: ['*.{scss,sass}'],
          dest: '<%= config.dist %>/styles',
          ext: '.css'
        }]
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= config.dist %>/scripts/{,*/}*.js',
            '<%= config.dist %>/styles/{,*/}*.css',
            '<%= config.dist %>/images/{,*/}*.*',
            '<%= config.dist %>/styles/fonts/{,*/}*.*',
            '<%= config.dist %>/*.{ico,png}'
          ]
        }
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      images: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/images',
          dest: '<%= config.dist %>/images',
          src: ['**']
        }]
      },
      scripts: {
        src: '<%= config.src %>/scripts/main.js',
        dest: '<%= config.dist %>/scripts/main.js'
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.src %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.webp',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*'
          ]
        }, {
          src: 'node_modules/apache-server-configs/dist/.htaccess',
          dest: '<%= config.dist %>/.htaccess'
        }, {
          expand: true,
          dot: true,
          cwd: '.',
          src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
          dest: '<%= config.dist %>'
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= config.src %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up build process
    concurrent: {
      server: [
        'sass:server',
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'sass',
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    }

  });

  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('start', [
    'sass',
    'server'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concurrent:dist',
    'concat',
    'cssmin',
    'uglify',
    'copy:dist',
    'rev'
  ]);

  grunt.registerTask('default', [
      'jshint',
      'build'
  ]);
};