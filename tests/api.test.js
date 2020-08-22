'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

var chai = require('chai')
var expect = chai.expect;
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('should return error when no records available', (done) => {
      chai.request(app)
          .get('/rides')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body.error_code).to.equal('RIDES_NOT_FOUND_ERROR');
            expect(res.body.message).to.equal('Could not find any rides');
            done();
          });
    });
  });

  describe('POST /rides', () => {
    it('should create a new record when params in valid', (done) => {
      chai.request(app)
          .post('/rides')
          .send(valid_rider_params)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body.ride).to.have.property('rideID');
            expect(res.body.ride.rideID).to.equal(1);
            expect(res.body.message).to.equal('Successfully create a ride');
            done();
          });
    });

    it('should return errors when params is empty', (done) => {
      chai.request(app)
          .post('/rides')
          .send({})
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error_code).to.equal('VALIDATION_ERROR');
            expect(res.body.message).to.equal('Rider name must be a non empty string');
            done();
          });
    });

    it('should return error when start params is out of range', (done) => {
      chai.request(app)
          .post('/rides')
          .send(invalid_start_params)
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error_code).to.equal('VALIDATION_ERROR');
            expect(res.body.message).to.equal('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
            done();
          });
    });

    it('should return error when end params is out of range', (done) => {
      chai.request(app)
          .post('/rides')
          .send(invalid_end_params)
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.error_code).to.equal('VALIDATION_ERROR');
            expect(res.body.message).to.equal('End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
            done();
          });
    });
  });

  describe('GET /rides', () => {
    it('should return all rides with default pagination', (done) => {
      chai.request(app).post('/rides').send(valid_rider_params).end();
      chai.request(app)
          .get('/rides')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.rides.length).to.equal(2);
            expect(res.body.page).to.equal(1);
            expect(res.body.perPage).to.equal(5);
            done();
          });
    });

    it('should return paginate rides with given pagination params', (done) => {
      chai.request(app)
          .get('/rides')
          .query({page: 1, perPage: 1})
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.rides.length).to.equal(1);
            expect(res.body.page).to.equal(1);
            expect(res.body.perPage).to.equal(1);
            done();
          })
    });
  });

  describe('GET /rides/:id', () => {
    it('should return rider record with ID=1', (done) => {
      const id = 1;
      chai.request(app)
          .get(`/rides/${id}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.ride.rideID).to.equal(1);
            done();
          });
    });

    it('should return error when ID is not found', (done) => {
      const id = 3;
      chai.request(app)
          .get(`/rides/${id}`)
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body.error_code).to.equal('RIDES_NOT_FOUND_ERROR');
            expect(res.body.message).to.equal('Could not find any rides');
            done();
          });
    });
  });

  // TODO: Moved to factory-bot
  let valid_rider_params = {
    'start_lat': 45,
    'start_long': 45,
    'end_lat': 60,
    'end_long': 60,
    'rider_name': 'lorem',
    'driver_name': 'ipsum',
    'driver_vehicle': 'lipsum'
  };

  let invalid_start_params = {
    'start_lat': -120,
    'start_long': 135,
    'end_lat': 60,
    'end_long': 60,
    'rider_name': 'lorem',
    'driver_name': 'ipsum',
    'driver_vehicle': 'lipsum'
  };

  let invalid_end_params = {
    'start_lat': 45,
    'start_long': 45,
    'end_lat': -120,
    'end_long': 240,
    'rider_name': 'lorem',
    'driver_name': 'ipsum',
    'driver_vehicle': 'lipsum'
  };
});
