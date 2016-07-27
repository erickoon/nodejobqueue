var validUrl = require('valid-url');

exports.get = function(req, res) {

	var jobsCol = req.app.get("jobsCol");

	var job = jobsCol.get(req.params.id);

	if (job) {
		res.send(getResponseObject(job));
	}
	else {
		res.status(404).send({
			"error": 'Cannot find job id: ' + req.params.id
		});
	}

	
};

exports.create = function(req, res) {

	var jobsCol = req.app.get("jobsCol");
	var queue = req.app.get("queue");

	if (req.body.url && validUrl.isHttpUri(req.body.url)) {

		// To save some duplicate effort, we can use old result if url was fetch in the past 1 min
		var results = jobsCol.chain()
			.find({
				"url": req.body.url,
				"status": "COMPLETED"
			})
			.simplesort('time', true)
			.limit(1)
			.data();

		if (results.length == 1 && (Date.now() - new Date(results[0].time).getTime()) <= 60000) {
			//console.log("Url was fetch in the past 1 min, returning old result: "+req.body.url);
			res.status(201).send(getResponseObject(results[0]));
		} else {

			var dbJob = jobsCol.insert({
						url: req.body.url,
						status: "INCOMPLETE",
					});

			var qJob = queue.create('fetch_url', {
					url: req.body.url,
					dbId: dbJob.$loki
				})
				.save(function(err) {
					if (!err) {
						// console.log("Added jobId to queue: " + qJob.id);
						res.status(201).send(getResponseObject(dbJob));
					}
				});
		}
	} else {
		res.status(400).send({
			"error": "Bad url or https is not supported."
		})
	}
};

getResponseObject = function(dbObj) {

	var response = {};

	if (dbObj.$loki) {
		response.id = dbObj.$loki;
	}
	if (dbObj.url) {
		response.url = dbObj.url;
	}
	if (dbObj.status) {
		response.status = dbObj.status;
	}
	if (dbObj.time) {
		response.time = dbObj.time;
	}
	if (dbObj.result) {
		response.result = dbObj.result;
	}

	if (dbObj.queueId) {
		response.queueId = dbObj.queueId;
	}

	return response;
}