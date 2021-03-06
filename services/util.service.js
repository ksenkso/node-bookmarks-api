const url = require('url');
const zlib = require('zlib');
const pe = require('parse-error');
const ico = require("icojs");
const cheerio = require("cheerio");
const sharp = require("sharp");
const randomString = require("randomstring");
const request = require('request');
const fs = require('fs');

module.exports.ReE = function(res, err, code){ // Error Web Response
    if (typeof err === 'object' && typeof err.message !== 'undefined') {
        err = err.message;
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json({success:false, error: err});
};

module.exports.ReS = function(res, data, code){ // Success Web Response
    let send_data = {success:true};

    if (typeof data === 'object') {
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};

module.exports.TE = TE = function(err_message, log){ // TE stands for Throw Error
    if(log === true){
        console.error(err_message);
    }

    throw new Error(err_message);
};
module.exports.handleError = function (error, next) {
    const err = pe(error);
    console.error(error);
    err.status = error.status || 500;
    next(err);
};

/**
 * Save an image
 *
 * 1. Download the page from the URL
 * 2. Find the `og:image` or something
 * 3. Download the image if found
 * 4. Resize the image to small size
 * 5. Save resized image to disk with corresponding generated name
 * 6. If image wasn't found, use the placeholder image
 */

/**
 *
 * @param {String} $
 * @param {Number} userId
 * @param {String} siteUrl
 * @return {Promise<{buffer: Buffer, userId: Number}>}
 */
function getImage($, userId, siteUrl) {
    return new Promise((resolve, reject) => {
        let type = 'OG';
        // Image types
        const images = [
            /*{
                selector: 'meta[property="og:image"]',
                attr: 'content'
            },
            {
                selector: 'link[rel="apple-touch-icon"]',
                attr: 'href'
            },*/
            {
                selector: 'link[rel="shortcut icon"]',
                attr: 'href'
            },
            {
                selector: 'link[rel="mask-icon"]',
                attr: 'href'
            },
            {
                selector: 'link[rel="icon"]',
                attr: 'href'
            }, /*
            {
                selector: 'link[itemprop="image"]',
                attr: 'href'
            },*/
        ];
        // Get the OpenGraph image
        let imageLink;
        while (!imageLink && images.length) {
            const image = images.shift();
            const iconsCollection = $(image.selector);
            if (iconsCollection.is('sizes')) {
                console.log(iconsCollection);
                // Find the biggest image
                let maxSize = 0, biggestImage = null;
                for (let i = 0; i < iconsCollection.length; i++) {

                    const currentSize = +iconsCollection.eq(i).attr('sizes').split('x')[0];
                    if (currentSize > maxSize) {
                        maxSize = currentSize;
                        biggestImage = iconsCollection.eq(i);
                    }
                }
                if (biggestImage) {
                    imageLink = biggestImage.attr(image.attr);
                    // Else skip image type
                }
            } else {
                imageLink = iconsCollection.attr(image.attr);
            }
        }
        if (!imageLink) {
            const error = new Error('Image not found');
            error.status = 404;
            reject(error);
        } else {
            let parsedUrl = url.parse(imageLink);
            console.log(parsedUrl.pathname);
            if (!parsedUrl.hostname) {
                parsedUrl = new url.URL(parsedUrl.path, siteUrl);
            }
            type = parsedUrl.pathname.match(/\w+\.ico/) ? 'ICO' : 'SPLASH';

            /*if (parsedUrl.protocol) {
                // If the url is relative, append the site url
                imageLink = //(siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl) + ;
            }*/
            imageLink = parsedUrl.toString();
            request({url: imageLink, headers: {'Accept-Encoding': 'gzip, deflate'}})
                .on('response', response => {

                    // Create an empty buffer to write to it
                    let buffer = Buffer.alloc(0);
                    console.log(imageLink);
                    response.on('data', data => {
                        // Add data chunks to buffer storage
                        buffer = Buffer.concat([buffer, data], buffer.length + data.length);
                    });
                    response.on('end', () => {
                        if (response.headers['content-encoding'] === 'gzip') {
                            buffer = zlib.unzipSync(buffer);
                        }
                        resolve({buffer, userId, type});

                        // Resolve an object with buffer and userId
                    })
                })
                .on('error', error => {
                    // Reject if request fails

                    reject(error);
                });
        }
    });
}

module.exports.getImage = getImage;

/**
 * @typedef {'OG'|'SCH'|'APL'|'ICO'} ImageType
 */

/**
 * @typedef {{image: String, color: String, type: ImageType}} BackgroundInfo
 */
/**
 *
 * @param {Buffer} buffer
 * @param {Number} userId
 * @param {ImageType} type
 * @return {Promise<BackgroundInfo>}
 */
function saveImage({buffer, userId, type}) {
    return new Promise(async (resolve, reject) => {
        if (type === 'ICO') {
            const images = await ico.parse(buffer, 'image/png');
            let maxSize = {width: 0};
            const data = images.reduce((prev, next) => {
                if (next.width > prev.width) {
                    return next;
                }
                return prev;
            }, maxSize).buffer;
            buffer = Buffer.from(data);
        }
        // Transform image to make them all equal width
        const imageSettings = {
            'ICO': {
                background: {r: 0, g: 0, b: 0, alpha: 0},
                resize: 64,
                format: 'png',
                extension: '.png'
            },
            'SPLASH': {
                background: {r: 255, g: 255, b: 255, alpha: 255},
                resize: 256,
                format: 'jpeg',
                extension: '.jpg'
            }
        };
        const transformImage = sharp(buffer)
            .resize(imageSettings[type].resize, null)
            // Fill the background with white color if it is transparent
            .background(imageSettings[type].background)
            .embed()
            // Save as JPEG
            .toFormat(imageSettings[type].format)
            .toBuffer();
        const createBackground = type === 'ICO' ? getImageReversedAverageColor(buffer) : Promise.resolve(null);
        const [transformedImageBuffer, background] = await Promise.all([
            transformImage,
            createBackground
        ]);
        // Generate image name
        const path = `uploads/${userId + '_' + randomString.generate({length: 64}) + imageSettings[type].extension}`;

        fs.writeFile(path, transformedImageBuffer, (error) => {
            if (error) {
                error.status = 500;
                reject(error);
            } else {
                resolve({
                    image: path,
                    background,
                    type
                });
            }
        });
    });
}

module.exports.saveImage = saveImage;

/**
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @return {String}
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

module.exports.rgbToHex = rgbToHex;

/**
 *
 * @param {Buffer} imageBuffer
 * @return {Promise<String>}
 */
async function getImageReversedAverageColor(imageBuffer) {
    const {data, info} = await sharp(imageBuffer)
        .raw()
        .toBuffer({resolveWithObject: true});
    const channelsCount = info.channels;
    const pixels = new Uint8Array(/** @type Buffer*/data);
    let avg = Array(channelsCount).fill(0);
    for (let i = 0; i < pixels.length; i++) {
        avg[i % channelsCount] += pixels[i];
    }
    const pixelCount = info.size / channelsCount;
    avg = avg.map(color => 255 - (color / pixelCount | 0));
    return rgbToHex(...avg);
}

module.exports.getImageReversedAverageColor = getImageReversedAverageColor;

/**
 *
 * @param {CheerioStatic} $
 * @param {String} siteUrl
 * @param {Number} userId
 * @return {Promise<BackgroundInfo>}
 */
function loadImageForUser($, siteUrl, userId) {
    return getImage(/** @type CheerioStatic */$, userId, siteUrl)
        .then(saveImage);
    /*return new Promise(async (resolve, reject) => {
        request(siteUrl, (error, response, body) => {
            if (response.statusCode === 200) {
                getImage(body, userId, siteUrl)
                    .then(saveImage)
                    .then(resolve)
                    .catch(reject);
            } else {
                error.status = response.statusCode;
                reject(error);
            }
        });
    });*/
}

module.exports.loadImageForUser = loadImageForUser;

/**
 *
 * @param {CheerioStatic} $
 * @return {?String}
 */
function getTitle($) {
    const titles = [
        {
            selector: 'meta[property="og:title"]',
            attr: 'content'
        },
        {
            selector: 'title',
            text: true
        }
    ];
    let title = null;
    while (!title && titles.length) {
        const options = titles.shift();
        if (options.text) {
            title = $(options.selector).text();
        } else {
            title = $(options.selector).attr(options.attr);
        }
    }
    return title;
}

module.exports.getTitle = getTitle;

/**
 *
 * @param siteUrl
 * @return {Promise<CheerioStatic>}
 */
function loadPage(siteUrl) {
    return new Promise(async (resolve, reject) => {
        request(siteUrl, (error, response, body) => {
            if (response && response.statusCode === 200) {
                resolve(cheerio.load(body));
            } else {
                error.status = (response && response.statusCode) || 500;
                reject(error);
            }
        });
    });
}

module.exports.loadPage = loadPage;

function getSiteDomain(url) {
    url = url.replace(/^https?:\/\/w+\d?.?/, '');
    return url.replace(/\?.*$/, '');
}

module.exports.getSiteDomain = getSiteDomain;

function extractHostname(url) {
    let hostname;
    // find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    // find & remove port number
    hostname = hostname.split(':')[0];
    // find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}

module.exports.extractHostname = extractHostname;


// To address those who want the "root domain," use this function:
function extractRootDomain(url) {
    let domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;
    // extracting the root domain here
    // if there is a subdomain
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        // check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2) {
            // this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

module.exports.extractRootDomain = extractRootDomain;
