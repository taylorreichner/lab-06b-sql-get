require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const quarterbacks = require('../data/quarterbacks');
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
            'style_id': 1,
            'style': 'Pocket_Passer',
            'owner_id': 1
        },
        {
            'id': 2,
            'name': 'Aaron_Rodgers',
            'accuracy': 98,
            'is_old': true,
            'style_id': 2,
            'style': 'Gun_Slinger',
            'owner_id': 1
        },
        {   'id': 3,
            'name': 'Patrick_Mahomes',
            'accuracy': 97,
            'is_old': false,
            'style_id': 2,
            'style': 'Gun_Slinger',
            'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Russel_Wilson',
          'accuracy': 96,
          'is_old': true,
          'style_id': 3,
          'style': 'Balanced',
          'owner_id': 1
      },
      {
          'id': 5,
          'name': 'Josh_Allen',
          'accuracy': 91,
          'is_old': false,
          'style_id': 4,
          'style': 'Mobile',
          'owner_id': 1
      },
      {
          'id': 6,
          'name': 'Drew_Brees',
          'accuracy': 93,
          'is_old': true,
          'style_id': 1,
          'style': 'Pocket_Passer',
          'owner_id': 1
      },
    ];
      
        
  

      const data = await fakeRequest(app)
        .get('/quarterbacks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(quarterbacks);
      });

      test('returns a single qb with the matching id', async() => {

        const singleQB = {
            'id': 1,
            'name': 'Tom_Brady',
            'style': 'Pocket_Passer',
            'accuracy': 94,
            'is_old': true,
            'style_id': 1,
            'owner_id': 1
        };

        const data = await fakeRequest(app)
        .get('/quarterbacks/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(singleQB);
  });

    test('creates new quarterback thats is on the QB list', async() => {
      const newQuarterback = {
        name: 'Matt_Stafford',
        accuracy: 89,
        is_old: true,
        style_id: 1,
        
         };
      const expectedQuarterback = {
        ...newQuarterback,
        id: 7,
        owner_id: 1,
        style: 'Pocket_Passer',

      };
      const data = await fakeRequest(app)
      .post('/quarterbacks')
      .send(newQuarterback)
      .expect('Content-Type', /json/)
      .expect(200);
      
      expect(data.body).toEqual(expectedQuarterback);

      const allQuarterbacks = await fakeRequest(app)
      .get('/quarterbacks/7')
      .expect('Content-Type', /json/)
      .expect(200);

      const mattStafford = allQuarterbacks.body.find(quarterback => quarterback.name === 'Matt_Stafford');
      
      expect(mattStafford).toEqual(expectedQuarterback)
    });

    test('updates a qb', async() => {

      const newQuarterback = {
        name: 'Kyler_Murray',
        accuracy: 87,
        is_old: false,
      };

      const expectedQuarterback = {
        ...newQuarterback,
        owner_id: 1,
        id: 1,
      }

    await fakeRequest(app)
    .put('/quarterbacks/1')
    .send(newQuarterback)
    .expect('Content-Type', /json/)
    .expect(200);

    const updatedQuarterback = await fakeRequest(app)
    .get('/quarterbacks/1')
    .expect('Content-Type', /json/)
    .expect(200);

    expect(updatedQuarterback.body).toEqual(expectedQuarterback);
    });

  test('deletes a QB with matching id', async() => {
    const expectation = {
      'id': 3,
      'name': 'Patrick_Mahomes',
      'accuracy': 97,
      'is_old': false,
      'style_id': 2,
      'owner_id': 1,
    };

    const data = await fakeRequest(app)
    .delete('/quarterbacks/3')
    .expect('Content-Type', /json/)
    .expect(200);

    expect(data.body).toEqual(expectation)

    const empty = await fakeRequest(app)
    .get('/quarterbacks/3')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(empty.body).toEqual('');
  });
});
});

