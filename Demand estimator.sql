DROP DATABASE IF EXISTS demand_estimator;
CREATE DATABASE demand_estimator;
USE demand_estimator;


CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'analyst', 'standard') DEFAULT 'standard',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Materials (
    MaterialID INT AUTO_INCREMENT PRIMARY KEY,
    MaterialName VARCHAR(100),
    UnitOfMeasure VARCHAR(50),
    UnitCost DECIMAL(10,2),
    Category VARCHAR(100)
);


CREATE TABLE Housing_Property (
    PropertyID INT AUTO_INCREMENT PRIMARY KEY,
    PricePerM2 DECIMAL(10,2),
    Area DECIMAL(10,2),
    LivingRooms INT,
    DrawingRooms INT,
    Kitchen INT,
    Bathrooms INT,
    Floor INT,
    BuildingType VARCHAR(100),
    RenovationCondition VARCHAR(100),
    BuildingStructure VARCHAR(100),
    LadderRatio DECIMAL(10,2),
    Elevator BOOLEAN,
    ConstructionYear YEAR,
    District VARCHAR(100),
    CommunityAverage DECIMAL(10,2),
    Followers INT,
    Longitude DECIMAL(10,6),
    Latitude DECIMAL(10,6)
);


CREATE TABLE PropertyMaterial (
    PropertyID INT,
    MaterialID INT,
    Quantity DECIMAL(10,2),
    UnitCost DECIMAL(10,2),
    TotalCost DECIMAL(12,2),
    
    PRIMARY KEY (PropertyID, MaterialID),
    

    FOREIGN KEY (PropertyID) REFERENCES Housing_Property(PropertyID)
        ON DELETE CASCADE,
    FOREIGN KEY (MaterialID) REFERENCES Materials(MaterialID)
        ON DELETE CASCADE
);

CREATE TABLE project_history (
    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    Project_Name VARCHAR(255) NOT NULL,
    Total_Value DECIMAL(12, 2) NOT NULL,
    Demand_Score INT,
    Date_Analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- GPE Analysis History (Complex ML Inputs/Outputs)
CREATE TABLE gpe_analysis_history (
    ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    Date_Analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- INPUTS (from gpe-calculator.html)
    Longitude DECIMAL(10, 6),
    Latitude DECIMAL(10, 6),
    Followers INT,
    PricePerSqm DECIMAL(10, 2),
    Area DECIMAL(10, 2),
    LivingRooms INT,
    Bathrooms INT,
    ConstructionYear YEAR,
    District INT,
    
    -- OUTPUTS (from /api/predict service)
    DFS_Percent DECIMAL(5, 2) NOT NULL,
    Predicted_DOM_Days DECIMAL(5, 1) NOT NULL,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);


INSERT INTO Materials (MaterialID, MaterialName, UnitOfMeasure, UnitCost, Category) VALUES
(1,'Cement', '50kg Bag', 85.00, 'Building'),
(2, 'Steel', 'Ton', 4200.00, 'Structural'),
(3, 'Blocks', 'Unit', 3.50, 'Building'),
(4, 'Sand', 'Trip', 250.00, 'Finishing'),
(5, 'Paint', 'Bucket', 300.00, 'Finishing');

