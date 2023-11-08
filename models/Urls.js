const mongoose = require('mongoose')

const urlsSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  short_url: Number,
})

module.exports = mongoose.model('Urls', urlsSchema)