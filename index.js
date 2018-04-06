const logger = require('consola');
let beatmapsFile = process.argv[2];
let beatmaps = [];
if (!beatmapsFile) return logger.error('You didn\'t specify a beatmap list file!\nUsage: node index.js <beatmap list file>\nExample: node index.js beatmaps.txt');

const fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    request = require('request').defaults({
        jar: true,
        headers: { 'User-Agent': 'osu!batchDL v0.1.0' }
    }),
    osu = require('node-osu'),
    clean = require('sanitize-filename');

let config = require('./config.json');
let freeThreads = config.maxThreads || 3;
let osuApi = new osu.Api(config.token);

beatmapsFile = path.resolve(beatmapsFile);
if (!fs.existsSync(beatmapsFile)) {
    return logger.error('Beatmap list file does not exist! Check the filename.');
}

logger.start('osu!batchDL v 0.1.0\nby TheNozomi');

readline.createInterface({
    input: fs.createReadStream(beatmapsFile),
    terminal: false
}).on('line', (line) => {
    beatmaps.push(line);
}).on('close', () => {
    logger.success('Beatmap list file loaded!');
    let beatmapCount = beatmaps.length;
    beatmaps.forEach((beatmap, index) => {
        function checkThreads() {
            if (freeThreads < 1) {
                setTimeout(checkThreads, 500);
            } else {
                (async () => {
                    freeThreads--;
                    let dl_err = null;
                    let dl = await downloadBeatmap(beatmap, index, beatmapCount)
                        .catch((err) => {
                            dl_err = err;
                        });
                    if (!dl) {
                        logger.error(`Download error: ${dl_err} (${index + 1} of ${beatmapCount})`)
                        freeThreads++;
                    } else {
                        logger.success(`Downloaded: ${dl.artist} - ${dl.title} (${index + 1} of ${beatmapCount})`)
                        freeThreads++;
                    }
                })();
            }
        }
        checkThreads();
    })
});

const downloadBeatmap = (url, index, total) => {
    return new Promise((resolve, reject) => {
        let setRegex = /.*http(s|):\/\/osu.ppy.sh\/(s|b)\/([0-9]*)((\?|\&)m=[0-9]|)/;
        let notAvailableRegex = /This download is no longer available/i;
        let map = url;
        let mapType = JSON.parse('{"' + map.replace(setRegex, '$2') + '": ' + map.replace(setRegex, '$3') + '}');
        osuApi.getBeatmaps(mapType).then(beatmaps => {
            if (beatmaps.length > 0) {
                let beatmap = beatmaps[0];
                request.post({
                    url: 'https://osu.ppy.sh/forum/ucp.php?mode=login',
                    formData: {
                        login: 'Login',
                        password: config.password,
                        username: config.username
                    }
                }, (err, res, body) => {
                    if (err) reject(err);
                    logger.info(`Downloading: ${beatmap.artist} - ${beatmap.title} (${index + 1} of ${total})`)
                    let url = config.noVideo ? `http://osu.ppy.sh/d/${beatmap.beatmapSetId}n` : `http://osu.ppy.sh/d/${beatmap.beatmapSetId}`;
                    let beatmapFileName = clean(`${beatmap.beatmapSetId} ${beatmap.artist} - ${beatmap.title}.osz`);
                    let beatmapFilePath = `./maps/${beatmapFileName}`;
                    if (fs.existsSync(beatmapFilePath)) {
                        logger.info(`Already downloaded: ${beatmap.artist} - ${beatmap.title} (${index + 1} of ${total})`);
                        return resolve(beatmap);
                    }
                    let stream = fs.createWriteStream(beatmapFilePath);
                    request.get(url, (err, res, body) => {
                        if (err) {
                            reject('Internal Error!');
                        }
                        if (notAvailableRegex.test(body)) {
                            stream.end();
                            reject(`${beatmap.artist} - ${beatmap.title} is not available to download`);
                        }
                    }).pipe(stream).on('finish', () => {
                        stream.end();
                        beatmap.path = beatmapFilePath;
                        beatmap.link = map;
                        resolve(beatmap);
                    });
                });
            }
        }).catch(reject);
    });
}