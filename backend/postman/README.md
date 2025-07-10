# Visa Dossier API - Postman Collection

This directory contains a comprehensive Postman collection for testing and documenting the Visa Dossier API.

## 📁 Files

- **`Visa-Dossier-API.postman_collection.json`** - Main collection file with all API endpoints
- **`Visa-Dossier-API.postman_environment.json`** - Environment variables for development
- **`README.md`** - This documentation file

## 🚀 Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Drag and drop both `.json` files or select them individually
4. Select the "Visa Dossier API - Development" environment from the environment dropdown

### 2. Set Base URL

The collection is pre-configured for local development:
- **Base URL**: `http://localhost:8000`
- Update the `base_url` environment variable if your API runs on a different URL

### 3. Authentication Flow

1. **Register** a new user or **Login** with existing credentials
2. The authentication token will be automatically stored and used for subsequent requests
3. All protected endpoints will inherit the Bearer token authentication

## 📚 Collection Structure

### 🏠 Environment Setup
- **Health Check** - Verify API connectivity

### 🔐 Authentication
- **Register User** - Create new user account
- **Login User** - Authenticate and get access token
- **Get User Profile** - Retrieve authenticated user information
- **Logout User** - Revoke current access token

### 🎫 Token Management
- **List User Tokens** - Get all active tokens for user
- **Create New Token** - Generate new personal access token
- **Revoke Token** - Delete specific token

### 📁 Dossier Management
- **List Dossiers** - Get user's visa dossiers
- **Create Dossier** - Create new visa application
- **Get Dossier Details** - Retrieve specific dossier with documents
- **Update Dossier** - Modify dossier information
- **Delete Dossier** - Remove dossier and all documents

### 📄 Document Management
- **Get Document Types** - List available document categories
- **List Dossier Documents** - Get documents for specific dossier
- **Upload Document** - Add file to dossier
- **Get Document Details** - Retrieve document metadata
- **Download Document** - Get document file
- **Delete Document** - Remove document and file

## 🔧 Environment Variables

The collection uses dynamic environment variables for seamless testing:

| Variable        | Description                 | Auto-Set              |
| --------------- | --------------------------- | --------------------- |
| `base_url`      | API base URL                | Manual                |
| `auth_token`    | Bearer authentication token | ✅ After login         |
| `user_id`       | Current user ID             | ✅ After login         |
| `user_email`    | Current user email          | ✅ After login         |
| `dossier_id`    | Active dossier ID           | ✅ After create/select |
| `document_id`   | Active document ID          | ✅ After upload        |
| `document_type` | Default document type       | Manual                |
| `token_id`      | Token ID for revocation     | Manual                |
| `new_token`     | Newly created token         | ✅ After creation      |
| `timestamp`     | Current timestamp           | ✅ Auto-generated      |

## 🧪 Testing Features

### Automated Tests
Each request includes comprehensive tests that verify:
- HTTP status codes
- Response structure and data types
- Required fields presence
- Data consistency
- Authentication requirements

### Pre-request Scripts
- Automatic authentication token management
- Request logging for debugging
- Dynamic data generation
- Header standardization

### Post-response Processing
- Automatic variable extraction and storage
- Response validation
- Performance monitoring
- Error handling

## 📝 Usage Examples

### Basic Workflow

1. **Health Check**
   ```
   GET {{base_url}}/api
   ```

2. **Register/Login**
   ```
   POST {{base_url}}/api/auth/register
   POST {{base_url}}/api/auth/login
   ```

3. **Create Dossier**
   ```
   POST {{base_url}}/api/dossiers
   ```

4. **Upload Documents**
   ```
   POST {{base_url}}/api/dossiers/{{dossier_id}}/documents
   ```

### Sample Data

The collection uses Postman's dynamic variables for realistic test data:
- `{{$randomFullName}}` - Random full names
- `{{$randomEmail}}` - Random email addresses
- `{{$randomAlphaNumeric}}` - Random passport numbers
- `{{$randomCountryCode}}` - Random country codes
- `{{$timestamp}}` - Current timestamp

## 🔒 Authentication

The API uses **Laravel Sanctum** for authentication:

1. **Public Endpoints** (no auth required):
   - `POST /api/auth/register`
   - `POST /api/auth/login`

2. **Protected Endpoints** (Bearer token required):
   - All other endpoints require `Authorization: Bearer {token}` header
   - Token is automatically set after successful login/registration

## 📊 Data Models

### Dossier Object
```json
{
  "id": 1,
  "passport_number": "AB123456",
  "nationality": "US",
  "date_of_birth": "1990-05-15",
  "visa_type": "tourist",
  "application_status": "draft",
  "additional_data": {
    "purpose_of_visit": "Tourism",
    "intended_duration": "2 weeks"
  },
  "documents": [],
  "created_at": "2025-07-09T10:00:00Z"
}
```

### Document Object
```json
{
  "id": 1,
  "document_type": "passport",
  "name": "Passport - John Doe",
  "description": "Passport document",
  "file_size": 1048576,
  "mime_type": "application/pdf",
  "original_filename": "passport.pdf",
  "uploaded_at": "2025-07-09T10:30:00Z"
}
```

## 🎯 Available Values

### Visa Types
- `tourist` - Tourism visa
- `student` - Student visa
- `work` - Work visa
- `business` - Business visa
- `transit` - Transit visa

### Application Status
- `draft` - Initial status
- `submitted` - Application submitted
- `processing` - Under review
- `approved` - Application approved
- `rejected` - Application rejected

### Document Types
- `passport` - Passport
- `birth_certificate` - Birth Certificate
- `marriage_certificate` - Marriage Certificate
- `proof_of_income` - Proof of Income
- `bank_statement` - Bank Statement
- `accommodation_proof` - Accommodation Proof
- `health_insurance` - Health Insurance
- `criminal_record` - Criminal Record
- `educational_certificate` - Educational Certificate
- `employment_contract` - Employment Contract
- `visa_application_form` - Visa Application Form
- `passport_photo` - Passport Photo
- `other` - Other documents

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure you've logged in and the `auth_token` variable is set
   - Check token hasn't expired (logout and login again)

2. **File Upload Issues**
   - Ensure file is selected in the form-data
   - Check file size (max 4MB) and format (PDF, PNG, JPG, JPEG)
   - Verify `dossier_id` is set

3. **Missing Variables**
   - Run requests in sequence (login → create dossier → upload documents)
   - Check environment variables are properly set

4. **API Connection Issues**
   - Verify `base_url` is correct
   - Ensure API server is running
   - Check network connectivity

### Debug Tips

- Use the Postman Console (View → Show Postman Console) to see detailed logs
- Check the Test Results tab for specific test failures
- Verify environment variable values in the Environment tab

## 🔄 Environment Setup

### Development Environment
```
base_url: http://localhost:8000
```

### Staging Environment
```
base_url: https://staging-api.visa-dossier.com
```

### Production Environment
```
base_url: https://api.visa-dossier.com
```

## 📈 Performance Monitoring

The collection includes performance tests:
- Response time monitoring (< 5 seconds expected)
- File upload performance tracking
- API health checks

## 🛡️ Security Considerations

- Never commit environment files with real tokens to version control
- Use separate environments for different stages (dev/staging/prod)
- Rotate API tokens regularly
- Test with minimal required permissions

## 📞 Support

For API issues or questions:
- Check the API documentation in the Laravel project
- Review test failures for specific error messages
- Verify request format matches API expectations

---

**Created**: July 9, 2025  
**Version**: 1.0.0  
**Postman Version**: Compatible with Postman v10.0+
