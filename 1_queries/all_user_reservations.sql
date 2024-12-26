-- Query to show all reservations for a user with id = 1
SELECT 
  reservations.id AS reservation_id,
  properties.title,
  properties.cost_per_night,
  reservations.start_date,
  ROUND(AVG(property_reviews.rating), 2) AS average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY reservations.id, properties.title, properties.cost_per_night, reservations.start_date
ORDER BY reservations.start_date ASC
LIMIT 10;

