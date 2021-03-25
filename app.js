const express = require('express')
const app = express()

const routes = require('./routes/route')
app.use('/', routes)

let port = process.env.PORT || 3000
app.listen(port)
