const fs = require('fs');

fs.access('.travis-tmp', fs.constants.F_OK, doesntExist => {
  if (doesntExist) {
    fs.mkdirSync('.travis-tmp');
  }
});