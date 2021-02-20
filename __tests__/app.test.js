require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns quarterbacks', async() => {

      const quarterbacks = [
        {
            'id': 1,
            'name': 'Tom_Brady',
            'accuracy': 94,
            'is_old': true,
            'owner_id': 1
        },
        {
            'id': 2,
            'name': 'Aaron_Rodgers',
            'accuracy': 98,
            'is_old': true,
            'owner_id': 1
        },
        {   'id': 3,
            'name': 'Patrick_Mahomes',
            'accuracy': 97,
            'is_old': false,
            'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Russel_Wilson',
          'accuracy': 96,
          'is_old': true,
          'owner_id': 1
      },
      {
          'id': 5,
          'name': 'Josh_Allen',
          'accuracy': 91,
          'is_old': false,
          'owner_id': 1
      },
      {
          'id': 6,
          'name': 'Drew_Brees',
          'accuracy': 93,
          'is_old': true,
          'owner_id': 1
      },
    ];
      
        
  

      const data = await fakeRequest(app)
        .get('/quarterbacks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(quarterbacks);
      });

      test('returns a single candy with the matching id', async() => {

        const singleQB = {
            'id': 1,
            'name': 'Tom_Brady',
            'accuracy': 94,
            'is_old': true,
            'owner_id': 1
        };

        const data = await fakeRequest(app)
        .get('/quarterbacks/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(singleQB);
  });
});
});

