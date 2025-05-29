SELECT *
FROM event_config ec 

ALTER TABLE event_config ADD code varchar(255);

SELECT * FROM event_config 
WHERE code = 'ABC12'
  AND isWebOpen = 1
  AND event_date = CURDATE()
  AND CURTIME() BETWEEN startTime AND endTime;

  
  CURDATE();