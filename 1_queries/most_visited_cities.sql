-- Query to get the most visited cities based on the number of reservations
SELECT 
  properties.city, 
  COUNT(reservations.id) AS total_reservations
FROM properties
JOIN reservations ON properties.id = reservations.property_id
GROUP BY properties.city
ORDER BY total_reservations DESC;

