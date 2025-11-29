CREATE DATABASE demand_estimator;
USE demand_estimator;

CREATE TABLE Housing_Property (
    PropertyID INT AUTO_INCREMENT PRIMARY KEY,
    PricePerM2 DECIMAL(10,2),
    Area DECIMAL(10,2),
    LivingRooms INT,
    DrawingRooms INT,
    Kitchen INT,
    Bathrooms INT,
    Floors INT,
    BuildingType VARCHAR(100),
    ParkingSpace BOOLEAN,
    BuildingStructure VARCHAR(100),
    PropertyType VARCHAR(50),
    Bedrooms INT,
    ConstructionYear YEAR,
    District VARCHAR(100),
    CommunityAverage DECIMAL(10,2),
    Followers INT,
    BrandName VARCHAR(100)
);

CREATE TABLE Materials (
    MaterialID INT AUTO_INCREMENT PRIMARY KEY,
    MaterialName VARCHAR(100),
    UnitOfMeasure VARCHAR(50),
    UnitCost DECIMAL(10,2),
    Category VARCHAR(100)
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


CREATE TABLE RecentHistory (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    PropertyID INT,
    DemandFS DECIMAL(10,4),                   
    ItemsUsed TEXT,                      
    TotalCost DECIMAL(12,2),             
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (PropertyID) REFERENCES Housing_Property(PropertyID)
        ON DELETE CASCADE
);
