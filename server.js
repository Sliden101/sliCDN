//Import required modules
//Utils
const fs = require('fs');
const path = require('path');
const url = require('url');
//Image proccessing
const jimp = require('jimp');
//Upload
const bodyParser = require('body-parser');
const multer = require('multer');
//Server
const express = require('express');

//Express Instance  
const app = express();

//Cors middleware to dissallow cross origin requests
const cors = require('cors');
const corsOptions = {
    origin: process.env.APP_ORIGIN && process.env.APP_ORIGIN != '*' ? process.env.APP_ORIGIN.split(',') : '*',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

//Custom error handler
app.use(function (err, req, res, next){
    console.error(err.stack);
    //Display error message from http.cat
    res.status(500).send(`<img src="https://http.cat/500" alt="500 Internal Server Error" />`);
})

//Storage config for multer
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'public/images');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
  });
const upload = multer({ 
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Parse incoming request bodies in a middleware before  handlers, available under req.body property.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle POST requests to upload an image
app.post('/upload', upload.single('file'), function(req, res) {
	if (!req.file) {
		res.status(400).send('No file uploaded.');
	} else {
		let width = parseInt(req.body.width) || null;
		let height = parseInt(req.body.height) || null;
		let quality = parseInt(req.body.quality) || 80;
		
		res.send('localhost:3000/' + req.file.filename+"?w="+width+"&h="+height+"&q="+quality+" ");

	}
  });


//Handle requests
app.get('*', async function (req, res) {

	// Remove headers info
	res.removeHeader('Transfer-Encoding');
	res.removeHeader('X-Powered-By');

	const query = url.parse(req.url, true).query;
	let file = url.parse(req.url).pathname;
	let filePath = path.join(__dirname, `public/images/${file}`);

	if (!fs.existsSync(filePath)) {
		file = process.env.DEFAULT_IMAGE;
		filePath = path.join(__dirname, `public/images/${file}`);
	}

	const height = parseInt(query.h) || 0; // Get height from query string
	const width = parseInt(query.w) || 0; // Get width from query string
	const quality = parseInt(query.q) < 100 ? parseInt(query.q) : 99; // Get quality from query string

	const folder = `q${quality}_h${height}_w${width}`;
	const out_file = `public/thumb/${folder}/${file}`;
	if (fs.existsSync(path.resolve(out_file))) {
		res.sendFile(path.resolve(out_file));
		return;
	}

	// If no height or no width display original image
	if (!height || !width) {
		res.sendFile(path.resolve(`public/images/${file}`));
		return;
	}
	// Use jimp to resize image
	jimp.read(path.resolve(`public/images/${file}`))
		.then(image => {

			image.resize(width, height); // resize
			image.quality(quality); // set JPEG quality

			image.write(path.resolve(out_file), () => {
				fs.createReadStream(path.resolve(out_file)).pipe(res);
			}); // save and display
		})
		.catch(err => {
			res.sendFile(path.resolve(`public/images/${file}`));
		});

});

app.listen(3000, function() {
	console.log('Server started on port 3000');
  });
