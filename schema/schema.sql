CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE scraped_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    location VARCHAR(255),
    address TEXT,
    phone_number VARCHAR(50),
    website_link VARCHAR(255),
    job_title VARCHAR(255),
    gst_number VARCHAR(50),
    post_date DATE,
    contact_person_name VARCHAR(255),
    mobile VARCHAR(50),
    email VARCHAR(255),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(20),
    bd_name VARCHAR(255),
    industry VARCHAR(255),
    sub_industry VARCHAR(255),
    updated ENUM('yes','no') DEFAULT 'no',
    communication_status VARCHAR(100),
    notes TEXT,
    meeting_date DATE,
    lead_status VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
