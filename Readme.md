# APIs

## POST /rides
```
POST /rides
Content-Type: application/json

Request:
{
    "start_lat": 45,
    "start_long": 45,
    "end_lat": 60,
    "end_long": 60,
    "rider_name": "yudi riski",
    "driver_name": "chandratama",
    "driver_vehicle": "vespa"
}

Response 201:
{
    "message": "Successfully create a ride",
    "ride": {
        "rideID": 1,
        "startLat": 45,
        "startLong": 45,
        "endLat": 60,
        "endLong": 60,
        "riderName": "yudi riski",
        "driverName": "chandratama",
        "driverVehicle": "honda",
        "created": "2020-08-20 08:05:30"
    }
}

Response 400:
{
    "error_code": "VALIDATION_ERROR",
    "message": "some error message"
}
```

## GET /rides
Endpoint supported pagination with `page` and `per_page` query.
If not given, `page` in default will be 1 and `per_page` will be 5.
```
GET /rides
Content-Type: application/json

Response 200:
{
    "rides": [
        {
            "rideID": 1,
            "startLat": 45,
            "startLong": 45,
            "endLat": 60,
            "endLong": 60,
            "riderName": "yudi riski",
            "driverName": "chandratama",
            "driverVehicle": "honda",
            "created": "2020-08-20 08:05:30"
        }
    ],
    "page": 1,
    "per_page": 5
}

Response 404:
{
    "error_code": "RIDES_NOT_FOUND_ERROR",
    "message": "Could not find any rides"
}
```

## GET /rides/:id
```
GET /rides/1
Content-Type: application/json

Response 200:
{
    "ride": {
        "rideID": 1,
        "startLat": 45,
        "startLong": 45,
        "endLat": 60,
        "endLong": 60,
        "riderName": "yudi riski",
        "driverName": "chandratama",
        "driverVehicle": "honda",
        "created": "2020-08-20 08:13:11"
    }
}

Response 404:
{
    "error_code": "RIDES_NOT_FOUND_ERROR",
    "message": "Could not find any rides"
}
```