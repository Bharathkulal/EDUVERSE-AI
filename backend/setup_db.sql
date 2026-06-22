-- Creates a dedicated dev user and database for EduVerse
-- Usage: psql -U postgres -f backend/setup_db.sql

CREATE ROLE devuser WITH LOGIN PASSWORD 'password';
CREATE DATABASE eduverse OWNER devuser;
GRANT ALL PRIVILEGES ON DATABASE eduverse TO devuser;

-- If you prefer to use the existing 'postgres' superuser, run:
-- CREATE DATABASE eduverse;
