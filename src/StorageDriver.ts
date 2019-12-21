import AWS, {S3} from 'aws-sdk'
import {PutObjectResponse} from "aws-sdk/clients/mediastoredata";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import IStorageDriver from "./types/StorageDriver";
import SendData = ManagedUpload.SendData;

export default class StorageDriver implements IStorageDriver {
    private s3: S3;

    constructor() {
        //configuring the AWS environment
        if (!process.env.AWS_ACCESSKEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            throw new Error('Missing AWS_ACCESSKEY_ID or AWS_SECRET_ACCESS_KEY')
        }
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESSKEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
        this.s3 = new AWS.S3();
    }

    /**
     *
     * @param params {{Bucket:string,Body:Buffer,Key:string,ContentType:string}}
     */
    async save(params: PutObjectRequest): Promise<PutObjectResponse> {
        return new Promise((resolve, reject) => {
            this.s3.upload(params, (err: Error, data: SendData) => {
                //handle error
                if (err) {
                    reject(err)
                }

                //success
                if (data) {
                    resolve(data);
                }
            });
        })
    }
}
