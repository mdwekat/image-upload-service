import {IMedia} from "IMedia";
import {Document} from "mongoose";

export interface IImage extends Document {
    pid: string;
    identifier: string;
    originalFilename: string;
    title?: string;
    description?: string;
    media: IMedia[];
}
