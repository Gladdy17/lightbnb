const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require ('pg');
const pool = new Pool({
  host: 'localhost',        // The host where your database is running
  port: 5432,               // The port PostgreSQL is listening on
  user: 'your_username',    // The database username
  password: 'your_password',// The password for the username
  database: 'your_database',// Your PostgreSQL connection details here
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  // Use parameterized query to avoid SQL injection
  return pool
    .query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    .then(result => {
      if (result.rows.length === 0) {
        // If no user is found, return null
        return null;
      }
      // Return the first matching user (there should only be one)
      return result.rows[0];
    })
    .catch(err => {
      console.error('Error getting user with email:', err);
      throw err;
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query('SELECT * FROM users WHERE id = $1', [id])
    .then(result => {
      // If no user is found, return null
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0]; // Return the user object
    })
    .catch(err => {
      console.error('Error getting user with ID:', err);
      throw err;
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, email, password } = user;

  return pool
    .query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    )
    .then(result => {
      return result.rows[0]; // Return the new user with the generated ID
    })
    .catch(err => {
      console.error('Error adding user:', err);
      throw err;
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
    SELECT 
      reservations.id AS reservation_id,
      reservations.start_date,
      reservations.end_date,
      properties.id AS property_id,
      properties.name AS property_name,
      properties.address AS property_address,
      properties.price_per_night,
      users.id AS guest_id,
      users.first_name AS guest_first_name,
      users.last_name AS guest_last_name
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN users ON reservations.guest_id = users.id
    WHERE reservations.guest_id = $1
    LIMIT $2;
  `;
  
  return db.query(queryString, [guest_id, limit])
    .then(res => res.rows)
    .catch(err => {
      console.error('Error fetching reservations:', err);
      throw err;
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // 1. Set up an array to hold any parameters that will be added to the query
  const queryParams = [];
  // 2. Start the query with the base SELECT statement
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
  `;

  // 3. Start the WHERE clause, if there are filters provided
  let conditions = [];
  
  // 4. Check if 'city' filter is provided
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    conditions.push(`city LIKE $${queryParams.length}`);
  }
  
  // 5. Check if 'owner_id' filter is provided
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    conditions.push(`properties.owner_id = $${queryParams.length}`);
  }

  // 6. Check if 'minimum_price_per_night' filter is provided
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100); // Convert dollars to cents
    conditions.push(`properties.cost_per_night >= $${queryParams.length}`);
  }

  // 7. Check if 'maximum_price_per_night' filter is provided
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100); // Convert dollars to cents
    conditions.push(`properties.cost_per_night <= $${queryParams.length}`);
  }

  // 8. Check if 'minimum_rating' filter is provided
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    conditions.push(`avg(property_reviews.rating) >= $${queryParams.length}`);
  }

  // 9. If any conditions were added, append them to the query string with 'AND' 
  if (conditions.length > 0) {
    queryString += ` WHERE ${conditions.join(' AND ')}`;
  }

  // 10. Add GROUP BY, ORDER BY, and LIMIT clauses to the query
  queryParams.push(limit);
  queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  // 11. Log the query string and parameters for debugging
  console.log(queryString, queryParams);

  // 12. Execute the query and return the results
  return pool.query(queryString, queryParams).then((res) => res.rows);
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
