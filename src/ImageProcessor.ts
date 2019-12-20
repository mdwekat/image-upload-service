import sharp from 'sharp';
import ITemplate from "Template";
import IStorageDriver from "./types/StorageDriver";

export default class ImageProcessor {

    constructor(private storageDriver: IStorageDriver) {
    }

    /**
     *
     * @param image {object} sharp Image object sharp(buffer|file)
     * @param metadata {Object} sharp image meta data
     * @param fileIdintifier {string} md5 hash of the uuid v4 file key
     * @param output {"webp"|"jpg"|null}
     * @param aspectRatio {string} ex: 4:3 or 16:9
     * @return {Promise<void>}
     */
    TransformAndSave(image: sharp.Sharp, metadata: sharp.Metadata, fileIdintifier: string, output: string = null, aspectRatio: string = "4:3"): Promise<any> {
        const bucketName = process.env.S3_BUCKET_NAME;
        const cdnBaseURL = process.env.CDN_BASE_URL;
        const mimeType = (output !== 'webp') ? 'image/webp' : 'image/jpeg';

        const {height, width} = this.calculateImageDimentions(metadata, aspectRatio);

        return new Promise(async (resolve, reject) => {
            try {
                const pipe = image.resize({height, width, fit: sharp.fit.cover, position: sharp.strategy.entropy});

                switch (output) {
                    case "jpg":
                        pipe.webp({quality: 80});
                        break;
                    case "webp":
                        pipe.jpeg({quality: 80});
                    default:
                        break;
                }

                const imageBuffer = await pipe.toBuffer();


                const imageData = await this.storageDriver.save({
                    Bucket: bucketName,
                    Body: imageBuffer,
                    Key: `${output}/${aspectRatio.replace(':', '-')}/${fileIdintifier}.${output}`,
                    ContentType: mimeType
                });
                resolve({
                    ...imageData,
                    cdnImage: `${cdnBaseURL}/${output}/${aspectRatio.replace(':', '-')}/${fileIdintifier}.${output}`
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
     *
     * @param {sharp.Metadata} metadata
     * @param {string} aspectRatio
     * @return {{width: number; height: number}}
     */
    calculateImageDimentions(metadata: sharp.Metadata, aspectRatio: string = "4:3"): { width: number; height: number } {
        const {height, width} = metadata;

        const ratio = aspectRatio.split(":").map(str => parseInt(str, 10));
        const widthToHightRation = ratio[0] / ratio[1];
        const hightToWidthRatio = ratio[1] / ratio[0];

        if (height * hightToWidthRatio > height) {
            return {
                width: Math.floor(height * widthToHightRation),
                height
            }
        } else {
            return {
                width,
                height: Math.floor(width * hightToWidthRatio)
            }
        }
    }


}
