require('dotenv').config();
const express = require('express');
const app = express();
const con = require('./src/db.js');
const PORT = process.env.port || 3000;
app.use(express.json());
const Movies = require('./models/movies.js');
const Tags = require('./models/tags.js');
const Shows = require('./models/shows.js');

app.get('/', (req, res) => {
    res.send('hello i m live')
})

app.get('/movies', async (req, res) => {
    if (req.query.name) {
        const str = req.query.name;
        try {
            const tmp = await Movies.find({ movieName: str }).select({
                movieDownloads: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }

    }
    else if (req.query.tag) {
        try {
            const tmp = await Movies.find({ movieTags: req.query.tag }).select({
                movieDirectors: 0,
                movieDownloads: 0,
                movieTags: 0,
                movieShots: 0,
                movieReview: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400)
        }
    }
    else if (req.query.year) {
        try {
            const nums = Number.parseInt(req.query.year);
            const tmp = await Movies.find({ releaseYear: nums }).select({
                movieDirectors: 0,
                movieDownloads: 0,
                movieTags: 0,
                movieShots: 0,
                movieReview: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }
    }
    else if (req.query.id) {
        try {
            const tmp = await Movies.find({ _id: req.query.id }).select({
                movieDownloads: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }
    }
    else if (req.query.page) {
        const Count = await Movies.find().count();
        const page = Number(req.query.page);
        const Limit = 10;
        const Skip = (page - 1) * Limit;

        if (Skip < Count) {
            try {
                const tmp = await Movies.find().select({
                    movieDirectors: 0,
                    movieShots: 0,
                    movieDescription: 0,
                    movieDownloads: 0,
                    date: 0,
                    __v: 0
                }).skip(Skip).limit(Limit).sort({ date: -1 });
                res.send(tmp);
            } catch (error) {
                res.sendStatus(400);
            }
        }
        else res.sendStatus(400);
    }
    else res.sendStatus(404);
})

app.post('/movies', async (req, res) => {
    const tmp = await Movies.insertMany([req.body]);
    const li = req.body.movieTags;
    for (let i = 0; i < li.length; i++) {
        let result = await Tags.updateOne({ tagName: li[i] }, {
            $inc: {
                tagMovies: 1
            }
        })
        console.log(result);
    }
    res.send(tmp);
})

app.get('/tags', async (req, res) => {
    const tmp = await Tags.find().select({
        _id: 0,
        __v: 0
    });
    res.send(tmp);
})

app.get('/shows', async (req, res) => {
    if (req.query.name) {
        const str = req.query.name;
        try {
            const tmp = await Shows.find({ showName: str }).select({
                movieCreators: 0,
                "showEpisodes.downloads": 0,
                showShots: 0,
                showReview: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }

    }
    else if (req.query.tag) {
        try {
            const tmp = await Shows.find({ showTags: req.query.tag }).select({
                movieCreators: 0,
                showEpisodes: 0,
                showShots: 0,
                showReview: 0,
                showEpisodes: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }
    }
    else if (req.query.year) {
        try {
            const tmp = await Shows.find({ releaseYear: req.query.year }).select({
                movieCreators: 0,
                showEpisodes: 0,
                showShots: 0,
                showReview: 0,
                showEpisodes: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }
    }
    else if (req.query.id) {
        try {
            const tmp = await Shows.find({ _id: req.query.id }).select({
                "showEpisodes.downloads": 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(400);
        }
    }
    else if (req.query.page) {
        const Count = await Shows.find().count();
        const page = Number(req.query.page);
        const Limit = 10;
        const Skip = (page - 1) * Limit;

        if (Skip < Count) {
            try {
                const tmp = await Shows.find().select({
                    showCreators: 0,
                    showShots: 0,
                    showDescription: 0,
                    showEpisodes: 0,
                    date: 0,
                    __v: 0
                }).skip(Skip).limit(Limit).sort({ date: -1 });
                res.send(tmp);
            } catch (error) {
                res.sendStatus(400);
            }
        }
        else res.sendStatus(400);
    }
    else res.sendStatus(404);
})

app.post('/shows', async (req, res) => {
    const tmp = await Shows.insertMany([req.body]);
    const li = req.body.showTags;
    for (let i = 0; i < li.length; i++) {
        let result = await Tags.updateOne({ tagName: li[i] }, {
            $inc: {
                tagShows: 1
            }
        })
        console.log(result);
    }
    res.send(tmp);
})

app.patch('/shows', async (req, res) => { // for adding episodes
    const id = req.query.id;
    try {
        const tmp = await Shows.findOneAndUpdate({ _id: id }, { $push: { showEpisodes: req.body } }, {
            $set: {
                date: Date.now()
            }
        });
        res.send(tmp);
    } catch (error) {
        res.sendStatus(400);
    }
})

app.get('/download', async (req, res) => {
    if (req.query.id && req.query.type) {
        if (req.query.type == 'movie') {
            try {
                const tmp = await Movies.find({ _id: req.query.id }).select({
                    movieName: 1,
                    movieDownloads: 1
                });
                res.send(tmp);
            } catch (error) {
                res.sendStatus(400);
            }
        }
        else if (req.query.type == 'show') {
            try {
                const tmp = await Shows.find({ _id: req.query.id }).select({
                    showName: 1,
                    showEpisodes: 1
                });
                res.send(tmp);
            } catch (error) {
                res.sendStatus(400);
            }
        }
        else res.sendStatus(400);
    }
    else res.sendStatus(404);
})

app.get('*', (req, res) => {
    res.sendStatus(404);
})
const start = async () => {
    await con(process.env.MONGODB_URL);
    app.listen(PORT, () => {
        console.log('server runs');
    })
}
start();

