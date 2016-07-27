# nodejobqueue

Create a job queue whose workers fetch data from a URL and store the results in a database.  The job queue should expose a REST API for adding jobs and checking their status / results.

User submits www.google.com to your endpoint.  The user gets back a job id. Your system fetches www.google.com (the result of which would be HTML) and stores the result.  The user asks for the status of the job id and if the job is complete, he gets a response that includes the HTML for www.google.com

## Background
Haven't used NodeJS for a long time, thought it will be interesting to implement with it.

Modules used:

In-memory DB called Lokijs

Queue module called Kue (Redis backed).

ExpressJS


## Instructions
Install NodeJS

Install NPM (Should come with NodeJS)

Install and start Redis

Install mocha and supertest via NPM


Can use brew for both if you are on a mac


## Running the app
To run the app - node app.js

To run tests - mocha tests.js

## Endpoints

GET - http://localhost:3000/jobs/{id}
POST - http://localhost:3000/jobs/
Payload - {"url":"http://www.google.com"}

