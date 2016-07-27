var request = require('supertest'),
	app = require('./app');

var testUrl = "http://www.google.com";


describe('Jobs API Tests', function() {


	it('Get /jobs/1', function(done) {
		request(app)
			.get('/jobs/1')
			.expect('Content-Type', /json/)
			.expect(404, done);
	})

	it('Post invalid url to /jobs/', function(done) {
		request(app)
			.post('/jobs/')
			.send({
				url: 'https://www.google.com'
			})
			.expect('Content-Type', /json/)
			.expect(function(res) {
				res.body.error = 'Bad url or https is not supported.';
			})
			.expect(400, done);
	})

	it('Post valid url to /jobs/', function(done) {
		request(app)
			.post('/jobs/')
			.send({
				url: testUrl
			})
			.expect('Content-Type', /json/)
			.expect(201, {
				id: 1,
				url: testUrl,
				status: 'INCOMPLETE'
			}, done);
	})

	it('Get /jobs/1', function(done) {
		request(app)
			.get('/jobs/1')
			.expect('Content-Type', /json/)
			.expect(200, done);
		})		
})