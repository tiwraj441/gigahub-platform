-- users (admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_desc TEXT,
  long_desc TEXT,
  price NUMERIC(12,2),
  sku VARCHAR(100),
  specs JSONB,
  images TEXT[],
  datasheet_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  highlights TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

-- case studies
CREATE TABLE IF NOT EXISTS case_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  summary TEXT,
  content TEXT,
  client VARCHAR(255),
  images TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

-- blog posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  excerpt TEXT,
  content TEXT,
  author VARCHAR(255),
  tags TEXT[],
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- leads (from contact/quote)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  interested_in VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT now()
);
