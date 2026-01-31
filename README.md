# Version-Controlled Record Management System (FSD-43)

## 1. Project Overview
This project is a Version-Controlled Record Management System designed to maintain multiple versions of records while ensuring data integrity. It enforces specific business rules where previous versions of a record are **immutable** (read-only), and only the latest version can be edited. 

When an **EDITOR** updates a record, the system does not overwrite the existing data. Instead, it creates a new document in the database with an incremented version number, preserving the entire history of changes.

## 2. Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (using Mongoose ODM) 
* **Authentication:** JSON Web Tokens (JWT) 
* **Security:** bcryptjs (Password Hashing), CORS

## 3. User Roles & Permissions
The system enforces Role-Based Access Control (RBAC).

### **EDITOR**
* Can register and log in.
* Can create new records (starts at Version 1).
* Can update records (triggering the creation of a new Version).
* Can view record history.

### **VIEWER**
* Can register and log in.
* Can view the list of records (latest versions).
* Can view the full version history of a record.
* **Cannot** create or update records.

## 4. Database Schema

### **Users Collection**
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique User ID |
| `username` | String | Unique username |
| `password` | String | Hashed password |
| `role` | String | Enum: `['EDITOR', 'VIEWER']` |

### **Records Collection**
*Every version is stored as a separate document.*
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique Document ID |
| `recordId` | String (UUID) | Common ID linking all versions of one record |
| `title` | String | Record Title |
| `content` | String | Record Content |
| `version` | Number | Version number (1, 2, 3...) |
| `createdBy` | ObjectId | Reference to User |
| `createdAt` | Date | Timestamp of version creation |

## 5. API Endpoints

### **Authentication**
* `POST /api/auth/register` - Register a new user (`role` is required).
* `POST /api/auth/login` - Login and receive a JWT token.

### **Record Management**
* `GET /api/records`
    * **Access:** EDITOR, VIEWER
    * **Desc:** Fetches all records. Returns only the **latest version** of each record.
* `POST /api/records`
    * **Access:** EDITOR
    * **Desc:** Creates a new record (Version 1).
* `PUT /api/records/:recordId`
    * **Access:** EDITOR
    * **Desc:** Updates a record. Creates a **NEW** database entry with `version + 1`.
* `GET /api/records/:recordId/history`
    * **Access:** EDITOR, VIEWER
    * **Desc:** Retrieves all versions of a specific record lineage.

## 6. Steps to Run Locally 

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-link>
    cd fsd-43-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```

4.  **Run the Server**
    * Development (with nodemon):
        ```bash
        npm run dev
        ```
    * Production:
        ```bash
        npm start
        ```

## 7. Live Deployment
* **Backend URL:** 
* **Frontend URL:** 

## 8. Business Rules Implementation (Critical)
1.  **Immutability:** The `updateRecord` controller never uses `findByIdAndUpdate`. It specifically uses `Record.create()` to ensure previous versions remain untouched in the database.
2.  **Versioning:** A composite index on `recordId` and `version` ensures integrity. The backend logic automatically increments the version number based on the previous latest entry.
