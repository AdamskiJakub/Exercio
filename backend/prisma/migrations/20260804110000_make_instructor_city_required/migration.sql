-- Make city required on instructor_profiles (beachhead: instructor always has a city)
ALTER TABLE "instructor_profiles" ALTER COLUMN "city" SET NOT NULL;
