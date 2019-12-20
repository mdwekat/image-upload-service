import dotenv from "dotenv";
import {Response, Request} from "express";
import ITemplate from "./types/Template";
import express from "express";
import morgan from 'morgan';
import md5 from 'md5';
import uuid from 'uuid';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import StorageDriver from './StorageDriver';
import ImageProcessor from './ImageProcessor';
import * as imageTemplates from '../templates.json' // This file contain the templates of the output images

if (fs.existsSync(".env")) {
    dotenv.config({path: ".env"});
}

const store = multer.memoryStorage();
const upload = multer({storage: store});

const storage = new StorageDriver();
const imageProcessor = new ImageProcessor(storage);

const app = express();

// for requests logging
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response) => res.send("Hello, Alarabiay"));
app.post('/', upload.single('images'), async (req: Request, res: Response) => {
    try {

        const file = req.file;
        const currentTime = Date.now();
        const filename = file.originalname;
        const fileIdintifier = md5(uuid());

        const image = sharp(file.buffer);
        const metadata = await image.metadata();

        const promises: Promise<any>[] = [];
        imageTemplates.forEach((format: ITemplate) => {
            promises.push(imageProcessor.TransformAndSave(image, metadata, fileIdintifier, format.output, format.aspectRatio));
        });

        Promise.all(promises)
            .then(results => res.send(results)).catch(reason => res.send(reason.message));

    } catch (e) {
        console.log(e);
        res.send(e.message);
    }
});


// TODO: Normalize port
app.listen(process.env.port || 3000, () => console.log(`App started and listing to port ${process.env.port || 3000}`));

