const express = require('express');
const path = require('path');
const app = express();
const port = require("./src/globals/environment").env.PORT;
const display_routes = require('./src/routes/display');

// serve static files from the react build
// __dirname is the directory in which this script is executed
app.use(express.static(path.join(__dirname, 'src/ui/build')));

/** API paths **/
app.use('/api/display', display_routes);

// allow React to take care of routing when request does not match API
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, 'src/ui/build/index.html'));
});

app.listen(port, () => console.log(`Inky dash API listening on port ${port}`));
