/*
 * PAIRS API Unit Test
 * 
 * Notice:
 *  - should dump out data from DB
 *  - restore data after testing
 *
 */

var TEST_SERVER = 'http://localhost/'
var frisby = require('frisby');

frisby.create('GET /login_status - 200 (Success)')
    .get(TEST_SERVER + 'login_status')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        status: 0,
        result: "ok",
        message: "Not logged in"
    })
    .expectJSONTypes({
        status: Number,
        result: String,
        message: String
    })
    .toss();

/*
frisby.create('GET /login - 200 (Success)')
    .get('http://api.pairs.cc/login')
    .expectStatus(302)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        status: 0,
        result: "ok",
        message: "Not logged in"
    })
    .expectJSONTypes({
        status: Number,
        result: String,
        message: String
    })
    .toss();
*/
