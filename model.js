const mongoose = require('mongoose');

const licenseKeysSchema = mongoose.Schema({

  licenseKey: {
    type: String,
    unique: true,
  },
  inUse: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: null
  },
  url2: {
    type: String,
    default: null
  }

});



module.exports = mongoose.model('licenseKeys', licenseKeysSchema);
