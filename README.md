# Tractor Seva - Backend API

Heavy Equipment Parts Catalog & Admin System backend built with Node.js, Express, and MySQL.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0+
- **Auth:** JWT (HS256) with bcryptjs password hashing
- **File Uploads:** Multer (local storage)
- **Language:** Plain JavaScript (no TypeScript)

## Project Structure

```
backend/
├── server.js                 # Main Express app & server startup
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Example env file
├── package.json              # Dependencies
├── database-schema.sql       # MySQL DDL for all tables
├── config/
│   └── database.js           # MySQL connection pool
├── middleware/
│   ├── auth.js               # JWT verification middleware
│   └── errorHandler.js       # Global error handling
├── routes/
│   ├── auth.js               # POST /api/auth/login
│   ├── harvesters.js         # Harvester CRUD (admin)
│   ├── sections.js           # Section CRUD (admin)
│   ├── diagrams.js           # Diagram management (admin)
│   ├── parts.js              # Parts & hotspots (admin)
│   ├── inquiries.js          # Inquiry management
│   └── public.js             # Public catalog endpoints (no auth)
├── controllers/
│   ├── authController.js
│   ├── harvesterController.js
│   ├── sectionController.js
│   ├── diagramController.js
│   ├── partController.js
│   ├── inquiryController.js
│   └── statsController.js
├── utils/
│   ├── uuid.js               # UUID to/from BINARY(16) conversion
│   ├── jwt.js                # JWT sign/verify
│   ├── errors.js             # Custom error classes
│   └── validators.js         # Input validation
├── uploads/
│   ├── diagrams/             # Diagram images (local storage)
│   └── harvesters/           # Harvester images (local storage)
└── migrations/
    ├── init-db.js            # Database initialization script
    └── seed-admin.js         # Create default admin user
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
```

### 3. Initialize Database

Option A - Using the SQL file directly:

```bash
mysql -u root -p < database-schema.sql
```

Option B - Using the Node.js init script:

```bash
npm run db:init
```

### 4. Create Default Admin User

```bash
npm run seed
```

This creates an admin with:
- Email: `admin@example.com`
- Password: `admin123`

(Override with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` env vars)

### 5. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server runs on `http://localhost:5000`.

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login and get JWT token |

### Admin Routes (Auth Required)

All `/api/admin/*` routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/harvesters` | Get all harvesters |
| GET | `/api/admin/harvesters/:id` | Get single harvester |
| POST | `/api/admin/harvesters` | Create harvester (multipart) |
| PUT | `/api/admin/harvesters/:id` | Update harvester (multipart) |
| DELETE | `/api/admin/harvesters/:id` | Delete harvester (cascades) |
| GET | `/api/admin/sections?harvester_id=&parent_only=` | Get sections |
| GET | `/api/admin/sections/:id` | Get section with subsections |
| POST | `/api/admin/sections` | Create section/subsection |
| PUT | `/api/admin/sections/:id` | Update section |
| DELETE | `/api/admin/sections/:id` | Delete section (cascades) |
| GET | `/api/admin/diagrams?section_id=` | Get diagram for section |
| POST | `/api/admin/diagrams` | Upload/update diagram (multipart) |
| DELETE | `/api/admin/diagrams/:id` | Delete diagram |
| GET | `/api/admin/parts?image_id=` | Get parts by diagram |
| POST | `/api/admin/parts` | Create part with hotspot |
| PUT | `/api/admin/parts/:id` | Update part |
| PUT | `/api/admin/hotspots/:coordinate_id` | Update hotspot position |
| DELETE | `/api/admin/parts/:id` | Delete part (cascades hotspots) |
| GET | `/api/admin/inquiries?status=&search=` | Get all inquiries |
| GET | `/api/admin/inquiries/:id` | Get single inquiry |
| PUT | `/api/admin/inquiries/:id` | Update inquiry status |
| DELETE | `/api/admin/inquiries/:id` | Delete inquiry |
| GET | `/api/admin/stats` | Dashboard statistics |

### Public Routes (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/harvesters` | Get all harvesters |
| GET | `/api/harvesters/:id/sections?parent_only=` | Get sections for harvester |
| GET | `/api/sections/:id/subsections` | Get subsections |
| GET | `/api/sections/:id/diagram` | Get diagram for section |
| GET | `/api/diagrams/:id/parts` | Get parts for diagram |
| POST | `/api/inquiries` | Create inquiry |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Authentication

1. Login via `POST /api/auth/login` with email and password
2. Receive JWT token in response
3. Include `Authorization: Bearer <token>` header for all admin routes

## Error Format

All errors return:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

## File Uploads

- Images are stored locally in `uploads/diagrams/` and `uploads/harvesters/`
- Served at `http://localhost:5000/uploads/...`
- Max file size: 10MB (configurable via `MAX_FILE_SIZE`)
- Allowed types: JPEG, PNG, WebP

## Testing

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use the returned token for admin routes
TOKEN="eyJ..."

# Get all harvesters
curl -X GET http://localhost:5000/api/admin/harvesters \
  -H "Authorization: Bearer $TOKEN"
```
### MySQL WorkBench Setup for Visual Overview of DataBase

MySQL Workbench provides a graphical interface for your MySQL database, making it easier to inspect tables, browse records, run SQL queries, and debug data during development.

> **Note:** MySQL Workbench is **not** another database. It simply connects to the same MySQL server used by this project. No code or configuration changes are required.

#### Install MySQL Workbench

Download the latest version from the official MySQL website:

https://dev.mysql.com/downloads/workbench/

Choose:

- **Operating System:** Microsoft Windows
- **Package:** Windows (x86, 64-bit), MSI Installer

During installation, select the **Complete** installation option.

#### Connect to the Database

After opening MySQL Workbench, create (or use the existing) local connection with the following details:

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 3306 |
| Username | root |
| Password | Your MySQL password |

These values correspond to the project's `.env` configuration:

```env
DB_HOST=
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=tractor_seva
```

> If `DB_HOST` is left empty, MySQL defaults to `localhost`.

If a compatibility warning appears when connecting to MySQL 9.x, click **Continue Anyway**. This warning is expected and does not affect normal usage.

#### Explore the Database

After connecting:

1. Expand **SCHEMAS**
2. Open **tractor_seva**
3. Expand **Tables**

The project database contains tables such as:

- `admin_users`
- `harvesters`
- `image_coordinates`
- `images`
- `inquiries`
- `parts`
- `sections`

To view the contents of any table:

1. Right-click the table.
2. Select **Select Rows - Limit 1000**.

This allows you to:

- View records
- Verify inserted data
- Inspect image paths
- Execute SQL queries
- Debug application data visually

```
Node.js Application
        │
        ▼
   MySQL Server
        ▲
        │
MySQL Workbench
```

Both the application and MySQL Workbench access the same MySQL database simultaneously, so changes made by the application are immediately visible in Workbench.
