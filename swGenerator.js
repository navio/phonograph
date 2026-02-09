const path = require('path');
const fs = require('fs');

const readDirRecursive = (dir) => {
  const directoryPath = path.join(__dirname, dir);
  return new Promise((acc) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, entries) => {
      if (err || !entries) {
        acc([]);
        return;
      }
      const promises = entries.map((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return readDirRecursive(fullPath);
        }
        return Promise.resolve([fullPath]);
      });
      Promise.all(promises).then((results) => acc(results.flat()));
    });
  });
}

const writeFile = (file, content) => {
  const filePath = path.join(__dirname, file);
  return new Promise( acc => {
    fs.writeFile(filePath,content,acc);
  });
}

const readFile = (file) => {
  const filePath = path.join(__dirname, file);
  return new Promise( (acc,rej) => {
    fs.readFile(filePath,'utf8', (err, data) => {
      if (err) {
        rej(err)
      }
      acc(data)
    });
  });
}


const found = ['/', '/library', '/discover', '/settings', '/podcast'];
readDirRecursive('dist')
.then(files => {
  files.forEach((file) => {
    const relativePath = '/' + file.replace(/^dist\//, '');
    if (relativePath !== '/service-worker.js') {
      found.push(relativePath);
    }
  });
})
.then(()=> {

  readFile('/dist/service-worker.js')
  .then( data => {
    const readyToWrite = data.replace("addAll([])",`addAll(${JSON.stringify(found)})`);

    writeFile("/dist/service-worker.js", readyToWrite)


  })
});
