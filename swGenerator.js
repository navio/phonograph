const path = require('path');
const fs = require('fs');



const readDir = (dir) => {
  const directoryPath = path.join(__dirname, dir);
  return new Promise((acc) => fs.readdir(directoryPath, (err, files) => acc(files)));
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
readDir('dist')
.then(files => files.forEach((file) => found.push(`/${file}`)))
.then(()=> {

  readFile('/dist/service-worker.js')
  .then( data => { 
    const readyToWrite = data.replace("addAll([])",`addAll(${JSON.stringify(found)})`);
    
    writeFile("/dist/service-worker.js", readyToWrite)


  })
});
