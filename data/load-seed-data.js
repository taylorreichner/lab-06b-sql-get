const client = require('../lib/client');
const stylesData = require('./styles.js');
const quarterbacks = require('./quarterbacks.js');
const usersData = require('./users.js');

const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    const responses = await Promise.all(
      stylesData.map(style => {
        return client.query(`
                INSERT INTO styles (name)
                VALUES ($1)
                RETURNING *;
        `,
        [style.name]);
      })
    );
    
    const styles = responses.map(({rows}) => rows[0]);

    const user = users[0].rows[0];

    await Promise.all(
      quarterbacks.map(qb => {
        

        return client.query(`
                    INSERT INTO quarterbacks (name, accuracy, is_old, style_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [
          qb.name, 
          qb.accuracy, 
          qb.is_old, 
          qb.style_id,
          user.id
        ]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
