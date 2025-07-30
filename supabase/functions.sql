-- Function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_image TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_messages AS (
    SELECT 
      m.conversation_id,
      CASE 
        WHEN m.sender_id = user_id THEN m.recipient_id
        ELSE m.sender_id
      END as other_user_id,
      m.content as last_message,
      m.created_at as last_message_time,
      m.recipient_id = user_id AND NOT m.is_read as is_unread
    FROM messages m
    WHERE m.sender_id = user_id OR m.recipient_id = user_id
  ),
  latest_messages AS (
    SELECT DISTINCT ON (conversation_id, other_user_id)
      conversation_id,
      other_user_id,
      last_message,
      last_message_time
    FROM user_messages
    ORDER BY conversation_id, other_user_id, last_message_time DESC
  ),
  unread_counts AS (
    SELECT 
      conversation_id,
      other_user_id,
      COUNT(*) FILTER (WHERE is_unread) as unread_count
    FROM user_messages
    GROUP BY conversation_id, other_user_id
  )
  SELECT 
    lm.conversation_id,
    lm.other_user_id,
    u.display_name as other_user_name,
    u.image_url as other_user_image,
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count
  FROM latest_messages lm
  JOIN users u ON u.id = lm.other_user_id
  LEFT JOIN unread_counts uc ON uc.conversation_id = lm.conversation_id 
    AND uc.other_user_id = lm.other_user_id
  ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get provider rating statistics
CREATE OR REPLACE FUNCTION get_provider_rating_stats(provider_id UUID)
RETURNS TABLE (
  average_rating DECIMAL,
  total_reviews BIGINT,
  rating_1 BIGINT,
  rating_2 BIGINT,
  rating_3 BIGINT,
  rating_4 BIGINT,
  rating_5 BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::DECIMAL, 2) as average_rating,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE rating = 1) as rating_1,
    COUNT(*) FILTER (WHERE rating = 2) as rating_2,
    COUNT(*) FILTER (WHERE rating = 3) as rating_3,
    COUNT(*) FILTER (WHERE rating = 4) as rating_4,
    COUNT(*) FILTER (WHERE rating = 5) as rating_5
  FROM reviews
  WHERE reviews.provider_id = get_provider_rating_stats.provider_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate platform fees (7% as requested)
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND(amount * 0.07, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get available time slots for a provider
CREATE OR REPLACE FUNCTION get_available_slots(
  provider_id UUID,
  service_duration INTEGER, -- in minutes
  date_from DATE,
  date_to DATE
)
RETURNS TABLE (
  slot_date DATE,
  start_time TIME,
  end_time TIME
) AS $$
DECLARE
  current_date DATE;
  availability_record RECORD;
  slot_start TIME;
  slot_end TIME;
BEGIN
  -- Loop through each date in range
  current_date := date_from;
  WHILE current_date <= date_to LOOP
    -- Get availability for this day of week
    FOR availability_record IN 
      SELECT * FROM availability a
      WHERE a.provider_id = get_available_slots.provider_id
        AND a.day_of_week = EXTRACT(DOW FROM current_date)
        AND a.is_active = true
    LOOP
      -- Generate slots within availability window
      slot_start := availability_record.start_time;
      WHILE slot_start + (service_duration || ' minutes')::INTERVAL <= availability_record.end_time LOOP
        slot_end := slot_start + (service_duration || ' minutes')::INTERVAL;
        
        -- Check if slot is not already booked
        IF NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.provider_id = get_available_slots.provider_id
            AND b.status IN ('pending', 'confirmed')
            AND DATE(b.start_time) = current_date
            AND (
              (b.start_time::TIME < slot_end AND b.end_time::TIME > slot_start)
            )
        ) THEN
          -- Return available slot
          slot_date := current_date;
          start_time := slot_start;
          end_time := slot_end;
          RETURN NEXT;
        END IF;
        
        -- Move to next slot
        slot_start := slot_start + (service_duration || ' minutes')::INTERVAL;
      END LOOP;
    END LOOP;
    
    -- Move to next date
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;