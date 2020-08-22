'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (
      startLatitude < -90 ||
      startLatitude > 90 ||
      startLongitude < -180 ||
      startLongitude > 180
    ) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message:
          'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (
      endLatitude < -90 ||
      endLatitude > 90 ||
      endLongitude < -180 ||
      endLongitude > 180
    ) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message:
          'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    const query =
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)';
    var values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];

    await db.run(query, values, function (err) {
      if (err) {
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      const query = 'SELECT * FROM Rides WHERE rideID = ?';
      const id = this.lastID;
      db.all(query, id, function (err, rows) {
        if (err) {
          return res.status(500).send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        res.status(201).send({
          message: 'Successfully create a ride',
          ride: rows[0],
        });
      });
    });
  });

  app.get('/rides', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 5;
      const offset = (page - 1) * perPage;
      const query = 'SELECT * FROM Rides LIMIT ? OFFSET ?';

      await db.all(query, perPage, offset, (_, rows) => {
        if (rows.length === 0) {
          return res.status(404).send({
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          });
        }

        return res.status(200).send({
          rides: rows,
          page: page,
          perPage: perPage,
        });
      });
    } catch (err) {
      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const params = req.params.id;
      const query = 'SELECT * FROM Rides WHERE rideID = ?';

      await db.all(query, params, (_, rows) => {
        if (rows.length === 0) {
          return res.status(404).send({
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          });
        }

        res.status(200).send({
          ride: rows[0],
        });
      });
    } catch (err) {
      return res.status(500).send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  return app;
};
