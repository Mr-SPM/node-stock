const express = require('express')

const app = express()

const port = process.env.DB_HOST || 3000

const mongoose = require('mongoose');

const path = require('path')
const { initDB } = require('./utils')
const apiRouter = require('./router')

app.use(express.static(path.join(__dirname, 'public')));




app.use('/api', apiRouter)

initDB()


app.listen(port, () => {

    console.log(`Example app listening on port ${port}`)

})

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', '/index.html'));
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
