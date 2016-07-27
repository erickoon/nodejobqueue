/**
 * Module dependencies and Setup
 */

var express = require('express'),
  loki = require('lokijs'),
  kue = require('kue'),
  jobs = require('./routes/jobs'),
  http = require('http'),
  path = require('path');

var app = express();
var db = new loki('massdrop');
var jobsCol = db.addCollection('jobs', {
  indices: ['url']
});
var queue = kue.createQueue();

app.set('jobsCol', jobsCol);
app.set('queue', queue);

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler());
});


/**
 Routes Setup
**/
app.get('/jobs/:id', jobs.get);
app.post('/jobs', jobs.create);

/**
 Start server
**/
http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});


/**
 Job Processing from Kue
**/
queue.process('fetch_url', function(job, done) {
  fetchUrl(job, done);
});

function fetchUrl(job, done) {
  
  // console.log("Fetching jobId:" + job.id);
  var dbjob = jobsCol.get(parseInt(job.data.dbId));

  if(dbjob) {
    http.get(job.data.url, (res) => {

      var body = '';
      res.on("data", function(chunk) {
        body += chunk;
      });

      res.on('end', () => {

        // console.log("finished jobId:" + job.id);
        dbjob.status = "COMPLETE";
        dbjob.result = body
        dbjob.time = new Date();

        jobsCol.update(dbjob);
      });

    }).on('error', (e) => {

      console.log(`Got error: ${e.message}`);

      dbjob.status = "ERROR";
      dbjob.result = `Got error: ${e.message}`;
      jobsCol.update(dbjob);
        
    });

  }
  else {
    console.log(`something went wrong.  Cannot find job in db.`);
  }
    
  done();
}

module.exports = app;