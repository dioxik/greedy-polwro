-- Create tables
CREATE TABLE materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER,
    attribute_name TEXT NOT NULL,
    value INTEGER,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

-- Insert sample data
-- Insert materials
INSERT INTO materials (name) VALUES ('ABS');
INSERT INTO materials (name) VALUES ('ABS -EDS');
-- Add more materials as needed

-- Insert attributes for ABS
INSERT INTO attributes (material_id, attribute_name, value) VALUES
((SELECT id FROM materials WHERE name = 'ABS'), 'Bezpieczeństwo użytkownika', 6),
((SELECT id FROM materials WHERE name = 'ABS'), 'Gęstość [g/cm3]', 4);
-- Add more attributes for ABS as needed

-- Insert attributes for ABS -EDS
INSERT INTO attributes (material_id, attribute_name, value) VALUES
((SELECT id FROM materials WHERE name = 'ABS -EDS'), 'Bezpieczeństwo użytkownika', 6),
((SELECT id FROM materials WHERE name = 'ABS -EDS'), 'Gęstość [g/cm3]', 4);
-- Add more attributes for ABS -EDS as needed
