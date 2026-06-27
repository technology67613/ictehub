ALTER TABLE leads 
ADD COLUMN enrolled_institute_course_id UUID REFERENCES institute_courses(id) ON DELETE SET NULL;
