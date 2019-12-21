# Simple image upload service
The main goal out of this is uploading after converting them to the desired format the images will be pushed to s3 storage on AWS.

## Running the service
This service is built with `typescript` and uses Node.js runtime it can run on any machine that can run Node.

However there are a couple of ways that you can run the service

## Useng Docker
1. Make sure that you have docker on your machine.
2. Make sure that MonogoDB installed and running with database `images-data` created.
3. Clone or downlod the repo.
4. Navigate to the project root.
1. Open `templates.json` and edit or add image types by default it will create `webp` and `jpg` with both `4:3` and `16:9` aspect ratio.
5. Run the command after adding your actual enviromate environment
```shell script
docker build -t <image_tag> .
&& docker run
-p <host-port>:<container-port> -p 9229:9229
--env NODE_ENV=development
--env AWS_ACCESSKEY_ID=<your-amazon-accesskey-id>
--env AWS_SECRET_ACCESS_KEY=<your-amazon-secret-access-key>
--env S3_BUCKET_NAME=<bucket-name>
--env CDN_BASE_URL=<cloud-front-cdn-endpoint-if-any>
--env MONOG_URI=<mongo-db-connection-uri>
--name <any-name-to-set-as-container-name>
<image_tag> 
```

Note: I have created all the needed keys and dtabases they will be included in the email I will send.

## Running directly on machine
1. Make sure that you have Node `v12.13.1` on your machine.
2. Make sure MonogoDB installed and running with database `images-data` created.
3. Clone or downlod the repo.
4. Navigate to the project root.
6. copy the `example.env` and rename it to `.env`.
1. Open `templates.json` and edit or add image types by default it will create `webp` and `jpg` with both `4:3` and `16:9` aspect ratio.
7. open the file and change the values of each key to your values.
5. Run:
```shell script
npm install && npm start
```
# Using the service

### Upload an Image

```curl
 POST /upload
```
Form data:

`images` type `file`.

Response:

`title` type `string` default `''`.

`description` type `string` default `''`.

`media` type `array` default `''` contains the images based on the templates defined in `templates.json`.

### Get List of images

```curl
 GET /image
```

Response:

Returns an  array of image objects as the following:

`title` type `string` default `''`.

`description` type `string` default `''`.

`media` type `array` default `[]` contains the images.

### Get Image by ID

```curl
 GET /image/:id
```
URL params:

`id` type `string` The ID of the imaage you want to retrive its data.

Response:

Returns the image object as the following:

`title` type `string` default `''`.

`description` type `string` default `''`.

`media` type `array` default `[]` contains the images.

### Update image data

 ```curl
  PUT /image/:id
 ```
 URL params:
 
 `id` type `string` The ID of the imaage you want to update.
 
 BODY:
 ```json
{
	"title": "String",
	"description":"String"
}
 ```
 
 Response:
 
 Returns the updated image object:
 
 `title` type `string` default `''`.
 
 `description` type `string` default `''`.
 
 `media` type `array` default `[]` contains the images.

