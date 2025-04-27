# Abnormal File Vault

A full-stack file management application built with React and Django, designed for efficient file handling and storage with advanced features like file type detection and metadata extraction.

## 🚀 Technology Stack

### Backend
- Django 4.x (Python web framework)
- Django REST Framework (API development)
- SQLite (Development database)
- Gunicorn (WSGI HTTP Server)
- WhiteNoise (Static file serving)
- Python-magic for file type detection
- Pillow for image processing

### Frontend
- React 18 with TypeScript
- TanStack Query (React Query) for data fetching
- Axios for API communication
- Tailwind CSS for styling
- Heroicons for UI elements
- React Testing Library for component testing
- Jest for test running

### Infrastructure
- Docker and Docker Compose
- Local file storage with volume mounting
- Environment-based configuration

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Docker (20.10.x or higher) and Docker Compose (2.x or higher)
- Node.js (18.x or higher) - for local development
- Python (3.9 or higher) - for local development
- libmagic (for file type detection)
  - macOS: `brew install libmagic`
  - Ubuntu/Debian: `sudo apt-get install libmagic1`
  - Windows: Install through WSL or use pre-built binaries

## 🛠️ Installation & Setup

### Using Docker (Recommended)

```bash
docker-compose up --build
```

### Local Development Setup

#### Backend Setup
1. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create necessary directories**
   ```bash
   mkdir -p media staticfiles data
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup
1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**
   Create `.env.local`:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 🧪 Running Tests

### Frontend Tests
1. **Run all tests**
   ```bash
   cd frontend
   npm test
   ```

2. **Run tests in watch mode**
   ```bash
   npm test -- --watch
   ```

3. **Run tests with coverage**
   ```bash
   npm test -- --coverage
   ```

4. **Run specific test file**
   ```bash
   npm test -- FileUpload.test.tsx
   ```

### Backend Tests
1. **Run all tests**
   ```bash
   cd backend
   python manage.py test
   ```

2. **Run specific test file**
   ```bash
   python manage.py test files.tests
   ```

## 🌐 Accessing the Application

- Frontend Application: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Documentation: http://localhost:8000/api/docs

## 📝 API Documentation

### File Management Endpoints

#### List Files
- **GET** `/api/files/`
- Returns a list of all uploaded files
- Response includes file metadata (name, size, type, upload date, mime type)
- Supports pagination and filtering

#### Upload File
- **POST** `/api/files/`
- Upload a new file
- Request: Multipart form data with 'file' field
- Returns: File metadata including ID, upload status, and detected file type
- Supports multiple file types with automatic detection

#### Get File Details
- **GET** `/api/files/<file_id>/`
- Retrieve details of a specific file
- Returns: Complete file metadata including:
  - File name and size
  - MIME type
  - Upload date
  - File type (image, document, etc.)
  - Additional metadata based on file type

#### Delete File
- **DELETE** `/api/files/<file_id>/`
- Remove a file from the system
- Returns: 204 No Content on success
- Automatically cleans up associated files and metadata

#### Download File
- Access file directly through the file URL provided in metadata
- Supports streaming for large files
- Includes proper content-type headers

## 🗄️ Project Structure

```
abnormal-file-hub/
├── backend/                # Django backend
│   ├── files/             # Main application
│   │   ├── models.py      # Data models
│   │   ├── views.py       # API views
│   │   ├── urls.py        # URL routing
│   │   ├── serializers.py # Data serialization
│   │   ├── tests.py       # Backend tests
│   │   └── utils/         # Utility functions
│   ├── core/              # Project settings
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FileList.tsx
│   │   │   └── FileItem.tsx
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── __tests__/     # Frontend tests
│   └── package.json      # Node.js dependencies
└── docker-compose.yml    # Docker composition
```

## 🔧 Development Features

- Hot reloading for both frontend and backend
- React Query DevTools for debugging data fetching
- TypeScript for better development experience
- Tailwind CSS for rapid UI development
- Comprehensive test coverage
- File type detection and metadata extraction
- Error handling and validation
- Responsive design

## 🐛 Troubleshooting

1. **Port Conflicts**
   ```bash
   # If ports 3000 or 8000 are in use, modify docker-compose.yml or use:
   # Frontend: npm start -- --port 3001
   # Backend: python manage.py runserver 8001
   ```

2. **File Upload Issues**
   - Maximum file size: 10MB
   - Ensure proper permissions on media directory
   - Check network tab for detailed error messages
   - Verify file type is supported

3. **Database Issues**
   ```bash
   # Reset database
   rm backend/data/db.sqlite3
   python manage.py migrate
   ```

4. **Test Issues**
   ```bash
   # Clear test cache
   rm -rf frontend/.jest-cache
   # Reinstall test dependencies
   cd frontend && npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
   ```

## 📦 Deployment

The application is configured for easy deployment with Docker:

```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build
```

Environment variables can be configured in:
- Backend: `.env` file
- Frontend: `.env.production` file

## 🔒 Security Features

- File type validation
- Size limits
- Secure file storage
- API authentication (if configured)
- CORS protection
- Input sanitization

## 📈 Performance Optimizations

- File streaming for large files
- Efficient database queries
- Caching with React Query
- Optimized image handling
- Lazy loading of components
