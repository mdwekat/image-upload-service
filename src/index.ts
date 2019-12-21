import dotenv from "dotenv";
import fs from 'fs';
import {Response, Request} from "express";
import cors from 'cors';
import {IImage} from "IImage";
import {IMedia} from "IMedia";
import mongoose from "mongoose";
import ITemplate from "./types/Template";
import express from "express";
import morgan from 'morgan';
import md5 from 'md5';
import uuid from 'uuid';
import multer from 'multer';
import sharp from 'sharp';
import StorageDriver from './StorageDriver';
import ImageProcessor from './ImageProcessor';
import Image from './models/image.model'

const imageTemplates = require('../templates.json'); // This file contain the templates of the output images

if (fs.existsSync(".env")) {
    console.log('Getting config from .env file.');
    dotenv.config({path: ".env"});
}

if (!process.env.MONOG_URI) {
    throw new Error('Env var MONOG_URI not defined')
}
mongoose.connect(process.env.MONOG_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const store = multer.memoryStorage();
const upload = multer({storage: store});

const storage = new StorageDriver();
const imageProcessor = new ImageProcessor(storage);

const app = express();

app.use(morgan('dev')); // for requests logging
app.use(express.json()); // Allow barsing requist body as json
app.use(cors()); // enable CORS in the application
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req: Request, res: Response) => res.send("Hello, Alarabiay"));
app.post('/upload', upload.single('images'), async (req: Request, res: Response) => {
    try {

        const file = req.file;
        const filename = file.originalname;
        const pid = uuid();
        const fileIdintifier = md5(pid);

        const image = sharp(file.buffer);
        const metadata = await image.metadata();

        const promises: Promise<any>[] = [];
        imageTemplates.forEach((format: ITemplate) => {
            promises.push(imageProcessor.TransformAndSave(image, metadata, fileIdintifier, format.output, format.aspectRatio));
        });

        Promise.all(promises)
            .then(async (results) => {
                const image = new Image();
                image.pid = pid;
                image.identifier = fileIdintifier;
                image.originalFilename = filename;
                image.media = [];
                results.forEach(el => {
                    const media: IMedia = {
                        ETag: el.ETag,
                        VersionId: el.VersionId,
                        Location: el.Location,
                        key: el.key,
                        Bucket: el.Bucket,
                        cdnImage: el.cdnImage
                    };
                    image.media.push(media)
                });
                await image.save();
                res.send(image);
            })
            .catch(reason => res.send(reason.message));

    } catch (e) {
        console.log(e);
        res.send(e.message);
    }
});

app.get('/image/:id', async (req: Request, res: Response) => {
    const image = await Image.findById(req.params.id);
    res.send(image);
});

app.get('/image', async (req: Request, res: Response) => {
    const images: IImage[] = await Image.find({});
    res.send(images);
});

app.put('/image/:id', async (req: Request, res: Response) => {
    const image: IImage = await Image.findById(req.params.id);
    image.title = req.body.title;
    image.description = req.body.description;
    await image.save();
    res.send(image);
});


app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
        status: 404,
        message: "page not found"
    });
});


// TODO: Normalize port
app.listen(process.env.PORT || 3000, () => console.log(`App started and listing to port ${process.env.PORT || 3000}`));

