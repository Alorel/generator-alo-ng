const fs = require('fs');

fs.access('.travis-tmp', fs.constants.F_OK, doesntExist => {
  if (doesntExist) {
    fs.mkdirSync('.travis-tmp');
    console.log('Created .travis-tmp');
  } else {
    console.log('Skipping .travis-tmp creation: dir already exists');
  }
});