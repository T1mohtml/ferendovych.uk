-- Adds timed-ban support without dropping existing data.
ALTER TABLE banned_ips ADD COLUMN expires_at TIMESTAMP;
