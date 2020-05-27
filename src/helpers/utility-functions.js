module.exports.asyncErrorHandler = (fn) => {
  return function safeAsync(req, res, next) {
    // the async fn will return a promise which we can catch
    fn(req, res, next).catch((err) => {
      res.status(500).json({ success: false, errors: [`Server error: ${err}`] })
    });
  }
};

module.exports.pythonScript = (path, ...args) => {
  const spawn = require('child_process').spawn;
  return new Promise(function runScript(success, reject) {
    const pythonProcess = spawn('python', [path, ...args]);
    let error = null
    // output from script will be in hex, you can toString this if needed
    pythonProcess.stderr.on('data', data => {
      error = data.toString()
    });
    pythonProcess.on('close', () => {
      if(error) reject('could not set image, check about page')
      success('script successful')
    })
  });
};
