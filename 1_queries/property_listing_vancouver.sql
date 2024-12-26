-- Query to show property details in Vancouver with average ratings >= 4
SELECT 
  properties.id, 
  properties.title, 
  properties.cost_per_night, 
  ROUND(AVG(property_reviews.rating), 2) AS average_rating
FROM properties
LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE properties.city = 'Vancouver'
GROUP BY properties.id
HAVING AVG(property_reviews.rating) >= 4
ORDER BY properties.cost_per_night ASC
LIMIT 10;

