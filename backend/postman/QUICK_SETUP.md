# Postman Collection Setup Guide

Quick setup guide for the Visa Dossier API Postman collection.

## 🚀 5-Minute Setup

### Step 1: Import Files
1. Open Postman
2. Click **Import** (top left)
3. Drag both files from `/postman/` folder:
   - `Visa-Dossier-API.postman_collection.json`
   - `Visa-Dossier-API.postman_environment.json`

### Step 2: Select Environment
1. Click the environment dropdown (top right)
2. Select **"Visa Dossier API - Development"**

### Step 3: Verify Base URL
1. Check that `base_url` is set to your API URL
2. Default: `http://localhost:8000`
3. Update if needed in environment settings

### Step 4: Test API Connection
1. Run **🏠 Environment Setup > Health Check**
2. Should return `200 OK`

### Step 5: Authenticate
1. Run **🔐 Authentication > Register User** OR **Login User**
2. Token will be automatically stored
3. All subsequent requests will use this token

## ✅ You're Ready!

Now you can test all API endpoints. The collection handles:
- ✅ Automatic authentication
- ✅ Dynamic variable management  
- ✅ Comprehensive testing
- ✅ Error validation
- ✅ Response logging

## 🔧 Environment Variables (Auto-Managed)

| Variable      | Purpose            | When Set                 |
| ------------- | ------------------ | ------------------------ |
| `auth_token`  | API authentication | After login/register     |
| `user_id`     | Current user       | After login/register     |
| `dossier_id`  | Active dossier     | After creating dossier   |
| `document_id` | Active document    | After uploading document |

## 📝 Quick Test Sequence

1. **Health Check** - Verify connection
2. **Register/Login** - Get authenticated
3. **Create Dossier** - Make a visa application
4. **Upload Document** - Add a file (select file first!)
5. **Get Dossier Details** - View complete dossier

## 🆘 Troubleshooting

**No auth token?** → Run login/register first  
**File upload fails?** → Select a file in the request body  
**API not found?** → Check base_url and server status  
**Tests failing?** → Check Postman Console for details  

---
**Need help?** Check `README.md` for detailed documentation.
