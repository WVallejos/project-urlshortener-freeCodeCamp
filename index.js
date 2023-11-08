require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./myDB')
const dns = require('dns')
const db = connectDB();
const app = express();
const Urls = require('./models/Urls')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}, {limit: '50mb'}));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello/:id', function(req, res) {
  const id = req.params.id
  res.json({ greeting: 'hello API', id: id });
});

app.post('/api/shorturl', async function(req,res) {
    const { url } = req.body
    if (!url.includes('http')) {
      res.json({error: 'invalid url'})
    } 
    else {
      const saved_url = await Urls.find({url: url})
      if(saved_url.length > 0) {
        res.json({original_url: saved_url[0].url, short_url: saved_url[0].short_url})
      } else {
        const url_hostname = new URL(url).hostname
        dns.lookup(url_hostname, async (err, address, family) => {
          const short_url = await Urls.countDocuments() + 1
          const new_entry = new Urls({url: url, short_url: short_url})
          new_entry.save()
          res.json({original_url: url, short_url: short_url})
        })
      } 
    }
})

app.get('/api/shorturl/:id', async function(req,res) {
  const urlid = req.params.id
  const urlid_number = Number(urlid)
  if(!urlid_number) res.json({error: 'wrong format'})
  else {
    const saved_url = await Urls.find({short_url: urlid_number})
    if(saved_url.length > 0) res.redirect(saved_url[0].url)
    else res.json({error: "No short URL found for the given input"})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

