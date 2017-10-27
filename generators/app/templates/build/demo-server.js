const gulp = require('gulp');

gulp.task('server', cb => {
  const StaticServer = require('static-server');
  const {join} = require('path');


  server = new StaticServer({
    rootPath: join(process.cwd(), '.demo'),
    port: (() => {
      try {
        const port = require('../.yo-rc.json').demoPort;

        if (port) {
          return parseInt(port);
        }
      } catch (e) {

      }

      return parseInt(process.env.PORT || '1337');
    })()
  });

  server.start(() => {
    console.log('\t\t\tDemo server listening on');
    console.log(`\t\t\thttps://127.0.0.1:${server.port}`);
    cb();
  });
});