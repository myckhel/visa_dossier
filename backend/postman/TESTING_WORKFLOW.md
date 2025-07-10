# Visa Dossier API Testing Workflow

This document outlines the recommended testing sequence for the Visa Dossier API using the Postman collection.

## 🔄 Complete Testing Workflow

### Phase 1: Environment Setup and Authentication

#### 1.1 Environment Verification
```
🏠 Environment Setup
└── Health Check
```
**Purpose**: Verify API connectivity and server status  
**Expected**: 200 OK response  
**Variables Set**: None  

#### 1.2 User Registration
```
🔐 Authentication
└── Register User
```
**Purpose**: Create a new test user account  
**Expected**: 201 Created with user object and token  
**Variables Set**: `auth_token`, `user_id`, `user_email`  
**Data**: Uses dynamic random data for testing  

#### 1.3 User Authentication
```
🔐 Authentication
└── Login User
```
**Purpose**: Authenticate with existing credentials  
**Expected**: 200 OK with user object and token  
**Variables Set**: `auth_token`, `user_id`, `user_email`  
**Note**: Alternative to registration for existing users  

#### 1.4 Profile Verification
```
🔐 Authentication
└── Get User Profile
```
**Purpose**: Verify authentication is working  
**Expected**: 200 OK with user profile data  
**Variables Set**: None  
**Dependency**: Requires `auth_token`  

### Phase 2: Token Management Testing

#### 2.1 List Current Tokens
```
🎫 Token Management
└── List User Tokens
```
**Purpose**: View all active tokens for the user  
**Expected**: 200 OK with tokens array  
**Variables Set**: None  
**Dependency**: Requires `auth_token`  

#### 2.2 Create Additional Token
```
🎫 Token Management
└── Create New Token
```
**Purpose**: Generate a new personal access token  
**Expected**: 200 OK with new token string  
**Variables Set**: `new_token`  
**Dependency**: Requires `auth_token`  

#### 2.3 Token Revocation (Optional)
```
🎫 Token Management
└── Revoke Token
```
**Purpose**: Test token revocation functionality  
**Expected**: 200 OK with success message  
**Variables Set**: None  
**Dependency**: Requires `token_id` (set manually)  
**Note**: Use with caution - don't revoke current token  

### Phase 3: Dossier Management

#### 3.1 List Initial Dossiers
```
📁 Dossier Management
└── List Dossiers
```
**Purpose**: View existing dossiers (likely empty for new user)  
**Expected**: 200 OK with data array  
**Variables Set**: `dossier_id` (if any exist)  
**Dependency**: Requires `auth_token`  

#### 3.2 Create New Dossier
```
📁 Dossier Management
└── Create Dossier
```
**Purpose**: Create a new visa application dossier  
**Expected**: 201 Created with dossier object  
**Variables Set**: `dossier_id`  
**Dependency**: Requires `auth_token`  
**Data**: Uses dynamic passport number and country code  

#### 3.3 Get Dossier Details
```
📁 Dossier Management
└── Get Dossier Details
```
**Purpose**: Retrieve detailed dossier information  
**Expected**: 200 OK with complete dossier object  
**Variables Set**: None  
**Dependency**: Requires `auth_token`, `dossier_id`  

#### 3.4 Update Dossier
```
📁 Dossier Management
└── Update Dossier
```
**Purpose**: Modify dossier information  
**Expected**: 200 OK with updated dossier object  
**Variables Set**: None  
**Dependency**: Requires `auth_token`, `dossier_id`  

### Phase 4: Document Management

#### 4.1 Get Document Types
```
📄 Document Management
└── Get Document Types
```
**Purpose**: Retrieve available document categories  
**Expected**: 200 OK with types array  
**Variables Set**: `document_type`  
**Dependency**: Requires `auth_token`, `dossier_id`  

#### 4.2 List Initial Documents
```
📄 Document Management
└── List Dossier Documents
```
**Purpose**: View documents in dossier (likely empty initially)  
**Expected**: 200 OK with data array  
**Variables Set**: `document_id` (if any exist)  
**Dependency**: Requires `auth_token`, `dossier_id`  

#### 4.3 Upload Document
```
📄 Document Management
└── Upload Document
```
**Purpose**: Add a document file to the dossier  
**Expected**: 201 Created with document object  
**Variables Set**: `document_id`  
**Dependency**: Requires `auth_token`, `dossier_id`  
**Note**: Must select a file in Postman before sending  

#### 4.4 Get Document Details
```
📄 Document Management
└── Get Document Details
```
**Purpose**: Retrieve detailed document information  
**Expected**: 200 OK with document object  
**Variables Set**: None  
**Dependency**: Requires `auth_token`, `dossier_id`, `document_id`  

#### 4.5 Download Document
```
📄 Document Management
└── Download Document
```
**Purpose**: Download the document file  
**Expected**: 200 OK with binary file data  
**Variables Set**: None  
**Dependency**: Requires `auth_token`, `dossier_id`, `document_id`  

### Phase 5: Cleanup and Logout

#### 5.1 Delete Document (Optional)
```
📄 Document Management
└── Delete Document
```
**Purpose**: Remove document and its file  
**Expected**: 200 OK with success message  
**Variables Set**: Clears `document_id`  
**Dependency**: Requires `auth_token`, `dossier_id`, `document_id`  

#### 5.2 Delete Dossier (Optional)
```
📁 Dossier Management
└── Delete Dossier
```
**Purpose**: Remove dossier and all documents  
**Expected**: 200 OK with success message  
**Variables Set**: Clears `dossier_id`  
**Dependency**: Requires `auth_token`, `dossier_id`  

#### 5.3 Logout
```
🔐 Authentication
└── Logout User
```
**Purpose**: End session and revoke current token  
**Expected**: 200 OK with success message  
**Variables Set**: Clears `auth_token`, `user_id`, `user_email`  
**Dependency**: Requires `auth_token`  

## 📋 Quick Test Sequences

### Minimal Workflow (Core Functionality)
1. Health Check
2. Register User
3. Create Dossier
4. Upload Document
5. Logout

### Complete Workflow (All Features)
1. Health Check
2. Register User
3. Get User Profile
4. List User Tokens
5. Create New Token
6. List Dossiers
7. Create Dossier
8. Get Dossier Details
9. Get Document Types
10. Upload Document
11. Get Document Details
12. Download Document
13. Update Dossier
14. Logout

### Document Management Focus
1. Login User (with existing account)
2. Create Dossier
3. Get Document Types
4. Upload Document (multiple types)
5. List Dossier Documents
6. Download Document
7. Delete Document

### Error Testing Scenarios

#### Authentication Errors
- Try accessing protected endpoints without token
- Use expired/invalid tokens
- Test logout with already logged out user

#### Validation Errors
- Create dossier with invalid data
- Upload unsupported file types
- Upload files exceeding size limit
- Create dossier with duplicate passport number

#### Authorization Errors
- Try accessing another user's dossier
- Attempt to upload documents to non-existent dossier
- Try to delete documents belonging to other users

## 🔧 Testing Best Practices

### 1. Variable Management
- Always run requests in dependency order
- Verify variables are set after each request
- Clear variables when testing cleanup operations

### 2. File Upload Testing
- Prepare test files in different formats (PDF, PNG, JPG)
- Test with various file sizes
- Include both valid and invalid file types

### 3. Data Validation
- Use realistic test data
- Test edge cases (empty fields, maximum lengths)
- Verify data persistence across requests

### 4. Error Handling
- Test all error scenarios systematically
- Verify error response formats
- Check appropriate HTTP status codes

### 5. Performance Testing
- Monitor response times during tests
- Test with larger files (near 4MB limit)
- Verify concurrent request handling

## 📊 Expected Test Results

### Success Criteria
- All requests return expected status codes
- Response data matches documented schemas
- Variables are correctly set and used
- File uploads and downloads work properly
- Authentication flow is secure and functional

### Performance Benchmarks
- API responses < 2 seconds (health check)
- File uploads < 5 seconds (4MB files)
- Document downloads < 3 seconds
- Authentication < 1 second

### Security Validations
- Unauthorized access properly blocked
- Tokens correctly validated
- User isolation enforced
- File access restricted to owners

---

**Note**: This workflow assumes a clean testing environment. Adjust the sequence based on existing data or specific testing requirements.
