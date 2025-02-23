CREATE TABLE jobs (
	job_id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(user_id),
	company_name VARCHAR(255),
	job_role VARCHAR(255),
	status VARCHAR(70),
	job_platform VARCHAR(100),
	job_link VARCHAR(100),
	job_location VARCHAR(100),
	interview_date TIMESTAMP,
	job_details jsonb,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);