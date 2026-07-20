-- Drop the unique constraint on (instructorId, dayOfWeek) to allow multiple time ranges per day
DROP INDEX IF EXISTS "availability_instructorId_dayOfWeek_key";
