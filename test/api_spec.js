var frisby = require('frisby');

/**
* This test is to check if the api respons with a
* 401 (Unauthorized) to all routes before any login has occurred.
**/

frisby.create('Query groups')
  .get('http://localhost:8085/api/group')
  .expectStatus(401)
.toss();

frisby.create('Specific group')
  .get('http://localhost:8085/api/group/jhgjghjhg')
  .expectStatus(401)
.toss();
