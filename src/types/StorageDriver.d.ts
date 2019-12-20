import {PutObjectResponse} from "aws-sdk/clients/mediastoredata";
import {PutObjectRequest} from "aws-sdk/clients/s3";

export default interface IStorageDriver {
    save(params: PutObjectRequest): Promise<PutObjectResponse>
}
