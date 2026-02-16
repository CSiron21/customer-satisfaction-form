# How to Build and Run the Customer Satisfaction Website

This project is containerized using Docker. Follow these steps to build, run, and push your image to Docker Hub.

## Prerequisites
- Docker Desktop installed and running.
- A Docker Hub account (if you plan to push the image).

## 1. Local Development with Docker Compose (Recommended)

Docker Compose will start both the web server (Apache + PHP) and the MySQL database.
The database, tables, and a default admin account are **created automatically** on first run.

1. Open a terminal in this directory.
2. Run the following command:
   ```bash
   docker-compose up --build -d
   ```
3. Wait ~10 seconds for MySQL to fully initialize on first run.
4. Open your browser:
   - **Survey Form**: `http://localhost:8080`
   - **Admin Login**: `http://localhost:8080/admin_login.php`

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Stopping the Containers
```bash
docker-compose down
```

### Resetting the Database
To completely reset the database (delete all data):
```bash
docker-compose down -v
docker-compose up --build -d
```

## 2. Local Development with XAMPP

If you prefer to use XAMPP instead of Docker:

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Place this project folder inside `C:\xampp\htdocs\`.
3. Open your browser:
   - **Survey Form**: `http://localhost/Customer-Satisfaction-Form-Website/`
   - **Admin Login**: `http://localhost/Customer-Satisfaction-Form-Website/admin_login.php`
4. The database (`customer_satisfaction`) and all tables are created automatically.

## 3. Building for Docker Hub
To package the application for Docker Hub:

1. **Login to Docker Hub** via terminal:
   ```bash
   docker login
   ```

2. **Build the Image**:
   ```bash
   docker build -t fakerprime/customersatisfactionwebsite:latest .
   ```

3. **Push to Docker Hub**:
   ```bash
   docker push fakerprime/customersatisfactionwebsite:latest
   ```

## 4. Deployment on Tablet
Once the image is on Docker Hub, you can pull and run it on any device with Docker installed:

```bash
docker run -d -p 80:80 fakerprime/customersatisfactionwebsite:latest
```

> **Note**: For standalone deployment (without docker-compose), you will need a separate MySQL server.
> Set the `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` environment variables accordingly.

## Tablet Optimization Features
- **Large Touch Targets**: Buttons and inputs are sized for touch interaction.
- **Responsive Layout**: Adapts to different tablet screen sizes (iPad, Android tablets).
- **Simplified Navigation**: Minimal distractions for users.

## Project Structure
```
Customer-Satisfaction-Form-Website/
├── config/
│   └── database.php          # DB connection + auto-creation
├── helpers/
│   ├── FormHelper.php        # Survey CRUD operations
│   └── AuthHelper.php        # Admin authentication
├── admin/
│   ├── dashboard.php         # Admin dashboard (view submissions)
│   └── logout.php            # Logout handler
├── css/
│   ├── survey_aesthetic.css  # Survey form styles
│   ├── admin_login.css       # Login page styles
│   └── dashboard.css         # Dashboard styles
├── js/
│   └── admin_login.js        # Login page interactions
├── images/                   # Logo assets
├── index.php                 # Survey form
├── admin_login.php           # Admin login page
├── style.css                 # Legacy styles
├── Dockerfile
├── docker-compose.yml
└── BUILD_INSTRUCTIONS.md
```
