import {IImage} from "IImage";
import mongoose, {Schema, Document} from 'mongoose';

const ImageSchema: Schema = new Schema({
    pid: {type: String, required: true, unique: true}, // UUID v4 for the image
    identifier: {type: String, required: true, unique: true}, // md5 hashed curruntly the pid md5 hash
    originalFilename: {type: String, required: true},
    title: {type: String, default: ''},
    description: {type: String, default: ''},
    media: {type: Array, default: []}
}, {
    timestamps: true
});

// Export the model and return your IUser interface
export default mongoose.model<IImage>('Image', ImageSchema);
