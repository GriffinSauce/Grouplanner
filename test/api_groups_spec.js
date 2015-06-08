var frisby = require('frisby');
var Group = require(__dirname + '/../server/mongoose/group.js');

frisby.create('Groups test')
  .get('http://localhost:8085/api/group')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes(Group.schema.tree)
.toss();
