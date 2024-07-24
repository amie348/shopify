// this code will generate a server using expressjs and wil add a bodyparser for json
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { generateUniqueString } = require(`./helper`)
const LicenseKeysModel = require(`./model`)
var app = express();


(async () => {

  app.use(cors());
  app.use(bodyParser.json());
  app.use(morgan(`dev`));

  // writing 3 endpoints for getting authenticating and updating the licenseKeys

  //connecting to mongodb server using mongoose

  await mongoose.connect('mongodb://localhost:27017/shpify');

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    // we're connected!
    console.log('connected to mongodb');
  });


  app.post('/authenticate-key', async (req, res) => {
    try {
      const { key, url1, url2 } = req.body;

      if (!key || !url1 || !url2 || typeof key !== 'string' || typeof url1 !== 'string' || typeof url2 !== 'string') {

        return res.status(400).json({
          message: 'Urls and Key should be strings and are required'
        })

      }

      const foundKey = await LicenseKeysModel.findOne({ licenseKey: key })

      if (!foundKey) {

        return res.status(404).json({
          message: 'License key not found'
        })

      }


      if(!foundKey.url) {
        await LicenseKeysModel.findOneAndUpdate({ licenseKey: key }, { inUse: true, url:url1, url2 })
      } else if (foundKey.url !== url1 || foundKey.url2 !== url2) {

        return res.status(400).json({
          message: 'not ok'
        })

      }


      return res.status(200).json({
        message: 'ok'
      })
    } catch (error) {

      console.log(error);
      return res.status(500).json({
        message: 'Something went wrong'
      })

    }


  });

  app.post('/update-license-key', async (req, res) => {


    try {
      const { key } = req.body;

      if (!key || typeof key !== 'string') {

        return res.status(400).json({
          message: 'Key should be string and is required'
        })

      }

      const foundKey = await LicenseKeysModel.findOneAndUpdate({ licenseKey: key }, { inUse: false, url: ``, url2: `` })

      if (!foundKey) {
        return res.status(404).json({
          message: 'License key not found'
        })
      }

      return res.status(200).json({
        message: 'License key released and ready for use again'
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Something went wrong'
      })
    }
  });

  app.get('/get-license-keys', async (req, res) => {

    try {

      let keyToReturn = ``;

      const key = await LicenseKeysModel.findOne({ inUse: false })

      if (!key) {

        for (let i = 0; i < 10; i++) {
          const newKey = generateUniqueString();
          const newKeyModel = new LicenseKeysModel({
            licenseKey: newKey
          })
          await newKeyModel.save();
          keyToReturn = newKey;
        }

      } else {
        keyToReturn = key.licenseKey;
      }

      return res.status(200).json({
        licenseKey: keyToReturn
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'Something went wrong'
      })
    }
  });


  // for (let i = 0; i < 100; i++) {
  //   const newKey = generateUniqueString();
  //   const newKeyModel = new LicenseKeysModel({
  //     licenseKey: newKey
  //   })
  //   newKeyModel.save();
  //   // keyToReturn = newKey;
  // }


  app.listen(5000, function () {
    console.log('Example app listening on port 3000!');
  });

})()
