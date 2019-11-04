const express = require('express')
const multer = require('multer')
const fs = require('fs')
const flash = require("connect-flash")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const app = express()

const upload = multer({
    dest: './photos',
    limits: (10 * 1024 * 1024), // (MB * kb * bytes)
    storage: multer.memoryStorage()
})

app.use(cookieParser())
app.use(
    session({
        secret: 'SERVER-SECRET-GOES-HERE',
        resave: true,
        saveUninitialized: true
    })
);
app.use(flash());
app.set("view engine", "ejs");
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000)
})

app.get('/', (req, res) => {
    res.render('home')
})

app.post('/fileUpload', upload.any(), async (req, res) => {
    console.log('POST: fileUpload')
    var today = `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    today.replace(' ', '_')
    let verifiedDir = await checkForDir(`./photos/${today}/`)

    createPhotos(req.files, 0, [`./${verifiedDir}/img_${new Date()}.jpg`])

    req.flash("success", 'File saved sucessfully')
    res.redirect('/')
    console.log('POST: fileUpload-1')
})

function checkForDir(dir) {
    console.log('checkForDir ()')
    return new Promise(function (resolve, reject) {
        if (!dir || dir == undefined) { reject('No directory given.'); return }

        fs.stat(dir, (err, stats) => {
            if (err || !stats) {
                console.log(err);

                fs.mkdirSync(dir, { recursive: true })
                resolve(dir)

            } else if (stats !== undefined) {
                resolve(dir);
            }
        });
    });
};

function createPhotos(files, i, filePaths) {
    if (i === files.length) return;

    var writeStream = fs.createWriteStream(filePaths[i]);
    writeStream.write(files[i]["buffer"]);
    writeStream.end();

    if (i === files.length) {
        return;
    } else {
        createPhotos(files, i + 1, filePaths);
    }
};