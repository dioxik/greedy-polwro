const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'admin123';

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  console.log(hash);
});