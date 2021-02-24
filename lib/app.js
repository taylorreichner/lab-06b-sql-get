const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/quarterbacks', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT 
        quarterbacks.id, 
        quarterbacks.name, 
        styles.name as style, 
        quarterbacks.accuracy, 
        quarterbacks.is_old, 
        quarterbacks.style_id,
        quarterbacks.owner_id
        FROM quarterbacks
        JOIN styles
        ON quarterbacks.style_id = styles.id
      `);

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});


//app.get('/quarterbacks', async(req, res) => {
  //try {
    //const data = await client.query('SELECT * from quarterbacks');
    
    ///res.json(data.rows);
  //} catch(e) {
    
    //res.status(500).json({ error: e.message });
  //}
//});

app.get('/quarterbacks/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query(`
    SELECT
    quarterbacks.id,
    quarterbacks.name,
    styles.name as style,
    quarterbacks.accuracy,
    quarterbacks.is_old,
    quarterbacks.style_id,
    quarterbacks.owner_id
    FROM quarterbacks
    JOIN styles
    ON quarterbacks.style_id = styles.id
    WHERE quarterbacks.id=$1`, [id]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/quarterbacks/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('DELETE FROM quarterbacks WHERE id=$1 RETURNING *', [id]);

    res.json(data.rows[0]);
  }
  catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/quarterbacks', async(req,res) => {
      try {
        const data = await client.query(`
        insert into quarterbacks (name, accuracy, is_old, style_id, owner_id)
        values ($1, $2, $3, $4, $5)
        returning *
        `,
        [
          req.body.name,
          req.body.accuracy,
          req.body.is_old,
          req.body.style_id,
          1,
        ]);

        res.json(data.rows[0]);
      } 
        catch(e) {
          res.status(500).json({error: e.message});
        }
  });

    app.put('/quarterbacks/:id', async(req, res) => {
      const id = req.params.id;

      try {
        const data = await client.query(`
        UPDATE quarterbacks
        SET name = $1,
        accuracy = $2,
        is_old = $3,
        style = $4
        WHERE id=$5
        returning *;
        `,
        [
          req.body.name,
          req.body.accuracy,
          req.body.is_old,
          req.body.style,
          id,
        ]);

        res.json(data.rows[0]);
      } catch(e) {
        res.status(500).json({error: e.message})
      }

    });





app.use(require('./middleware/error'));

module.exports = app;
