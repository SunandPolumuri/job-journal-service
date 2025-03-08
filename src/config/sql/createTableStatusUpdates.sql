CREATE TABLE status_updates (
    status_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL,
    status VARCHAR(70),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    additional_info jsonb,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);


ALTER TABLE status_updates 
ADD COLUMN user_id INT NOT NULL


ALTER TABLE status_updates
ADD CONSTRAINT fk_userId
FOREIGN KEY (user_id)
REFERENCES users(user_id) ON DELETE CASCADE