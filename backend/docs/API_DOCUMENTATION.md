# API Documentation - Laravel Sanctum Authentication

## Overview

This API uses Laravel Sanctum for authentication, providing both API token authentication for mobile/third-party applications and SPA authentication for same-domain applications.

## Base URL
```
http://localhost:8000/api
```

## Authentication

### API Token Authentication
For mobile apps and third-party integrations, include the token in the Authorization header:
```
Authorization: Bearer {your-api-token}
```

### SPA Authentication
For single-page applications on the same domain, use session-based authentication with CSRF protection.

## Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "device_name": "mobile-app" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "created_at": "2025-07-09T18:33:04.000000Z",
    "updated_at": "2025-07-09T18:33:04.000000Z"
  },
  "token": "1|abc123def456..."
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "device_name": "mobile-app" // optional
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "created_at": "2025-07-09T18:33:04.000000Z",
    "updated_at": "2025-07-09T18:33:04.000000Z"
  },
  "token": "2|xyz789abc123..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

#### Logout User
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

#### Get User Profile
```http
GET /api/auth/user
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "created_at": "2025-07-09T18:33:04.000000Z",
    "updated_at": "2025-07-09T18:33:04.000000Z"
  }
}
```

### Token Management Endpoints

#### List User Tokens
```http
GET /api/tokens
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "tokens": [
    {
      "id": 1,
      "name": "mobile-app",
      "abilities": ["*"],
      "last_used_at": "2025-07-09T18:33:04.000000Z",
      "expires_at": null,
      "created_at": "2025-07-09T18:33:04.000000Z",
      "updated_at": "2025-07-09T18:33:04.000000Z"
    }
  ]
}
```

#### Create New Token
```http
POST /api/tokens
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "mobile-app-v2",
  "abilities": ["read", "write"] // optional, defaults to ["*"]
}
```

**Response (201):**
```json
{
  "token": "3|newtoken123...",
  "message": "Token created successfully"
}
```

#### Revoke Token
```http
DELETE /api/tokens/{tokenId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Token revoked successfully"
}
```

**Error Response (404):**
```json
{
  "message": "Token not found or does not belong to the user."
}
```

### Protected Routes Example
```http
GET /api/user
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified_at": null,
  "created_at": "2025-07-09T18:33:04.000000Z",
  "updated_at": "2025-07-09T18:33:04.000000Z"
}
```

## Error Responses

### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Not Found (404)
```json
{
  "message": "Not found."
}
```

## Frontend Integration Examples

### JavaScript/Axios
```javascript
// Register
const registerResponse = await axios.post('/api/auth/register', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  device_name: 'web-app'
});

const token = registerResponse.data.token;

// Store token for future requests
localStorage.setItem('auth_token', token);

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Make authenticated requests
const userResponse = await axios.get('/api/auth/user');
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/user');
      setUser(response.data.user);
    } catch (error) {
      logout();
    }
  };

  const login = async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('auth_token', token);
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      // Handle error
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return { user, login, logout, token };
};
```

## Security Features

- **Password Hashing**: All passwords are hashed using Laravel's default bcrypt hasher
- **Token Security**: API tokens are hashed in the database using SHA-256
- **CSRF Protection**: Enabled for SPA authentication
- **Input Validation**: All endpoints have proper validation rules
- **Rate Limiting**: Can be configured on routes as needed
- **Token Abilities**: Fine-grained permissions can be assigned to tokens

## Token Abilities

You can create tokens with specific abilities for granular access control:

```json
{
  "name": "read-only-token",
  "abilities": ["read"]
}
```

Then protect routes with specific abilities:
```php
Route::get('/sensitive-data', function () {
    // Only tokens with 'admin' ability can access
})->middleware(['auth:sanctum', 'ability:admin']);
```
