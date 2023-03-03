require('dotenv').config();
const express = require('express');
const app = express();
const con=require('./src/db.js');
const PORT = process.env.port || 3000;
app.use(express.json());
const Movies = require('./models/movies.js');
const Tags = require('./models/tags.js');
const Shows = require('./models/shows.js');

app.get('/',(req,res)=>{
    res.send('hello i m live')
})

app.get('/movie', async (req, res) => {
    if (req.query.name) {
        const str = req.query.name;
        try {
            const tmp = await Movies.find({ movieName: str }).select({
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(404);
        }

    }
    else if (req.query.tag) {
        const tmp = await Movies.find({ movieTags: req.query.tag }).select({
            movieDownloads: 0,
            movieTags: 0,
            movieShots: 0,
            date: 0,
            __v: 0
        });
        res.send(tmp);
    }
    else if (req.query.year) {
        try {
            const nums = Number.parseInt(req.query.year);
            const tmp = await Movies.find({ releaseYear: nums }).select({
                movieDownloads: 0,
                movieTags: 0,
                movieShots: 0,
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(404);
        }
    }
    else if (req.query.id) {
        try {
            const tmp = await Movies.find({ _id: req.query.id }).select({
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }
})

app.post('/movie', async (req, res) => {
    const tmp = await Movies.insertMany([req.body]);
    const li = req.body.movieTags;
    for(let i=0;i<li.length;i++){
        let result = await Tags.updateOne({tagName:li[i]},{
            $inc:{
                tagMovies:1
            }
        })
        console.log(result);
    }
    res.send(tmp);
})

app.get('/tags', async (req, res) => {
    const tmp = await Tags.find();
    res.send(tmp);
})

app.get('/shows', async (req, res) => {
    if (req.query.name) {
        const str = req.query.name;
        try {
            const tmp = await Shows.find({ showName: str }).select({
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(404);
        }

    }
    else if (req.query.tag) {
        const tmp = await Shows.find({ showTags: req.query.tag }).select({
            showDownloads: 0,
            showTags: 0,
            showSeasons: 0,
            date: 0,
            __v: 0
        });
        res.send(tmp);
    }
    else if (req.query.id) {
        try {
            const tmp = await Shows.find({ _id: req.query.id }).select({
                date: 0,
                __v: 0
            });
            res.send(tmp);
        } catch (error) {
            res.sendStatus(404);
        }
    }
    else{
        res.sendStatus(404);
    }
})

app.post('/shows', async (req, res) => {
    const tmp = await Shows.insertMany([req.body]);
    const li = req.body.showTags;
    // for(let i=0;i<li.length;i++){
    //     let result = await Tags.updateOne({tagName:li[i]},{
    //         $inc:{
    //             tagShows:1
    //         }
    //     })
    //     console.log(result);
    // }
    res.send(tmp);
})

app.get('*',(req,res)=>{
    res.sendStatus(404);
})
const start =async ()=>{
    await con(process.env.MONGODB_URL);
    app.listen(PORT, () => {
        console.log('server runs');
    })
}
start();
