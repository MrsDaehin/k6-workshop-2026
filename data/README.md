# Test User Data - Registered Users for Load Testing

This directory contains generated test user data for K6 load testing workloads.

## 📋 Table of Contents

- [Files](#files)
- [Usage](#usage)
  - [Setup Initial (One-Time)](#setup-initial-one-time)
  - [Using Users in Tests](#using-users-in-tests)
  - [Generate Token for Local Testing](#generate-token-for-local-testing)
  - [How Users Are Distributed Across VUs](#how-users-are-distributed-across-vus)
- [File Format](#file-format)
- [Authentication Flow](#authentication-flow)
- [Workload Structure](#workload-structure)
- [App Tracking Events](#app-tracking-events)
- [Load Testing Configurations](#load-testing-configurations)
- [Maintenance & Best Practices](#maintenance--best-practices)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

## 📁 Files

- `registered_users.json` - JSON array of registered users with `userId` assigned (required by most workloads)
- `user_id_assignments.log` - Log output from profile creation and `userId` assignment (optional, for debugging)

## 🚀 Usage

### **Setup Initial (One-Time)**

1. **Generate users with userId**: Run `./scripts/setup/generate_users_with_ids.sh`
   - This executes `workloads/setup/generate_profiles_from_json.js` (K6 workload)
   - Creates user profiles via POST to `/lt/integrations/mobile/profile/v1/profiles`
   - Creates consents via POST to `/lt/integrations/mobile/consents/v1/consents`
   - Assigns unique `userId` (21 digits) to each user without one
   - Updates `registered_users.json` with the assigned `userId`s
   - **This is a setup script** - run it once or when you need to add more users

2. **Register existing users to database** (after DB cleanup): Run `./scripts/setup/register_existing_users.sh`
   - Registers users with `userId` to database via POST /profiles and POST /consents
   - Handles "Profile already exists" errors gracefully (treats as success)
   - Useful after database cleanup when users have `userId` but profiles don't exist in DB

3. **Verify profiles exist** (optional verification): Run `./scripts/setup/verify_profiles_exist.sh`
   - Verifies all users with `userId` have profiles in database via GET /profiles
   - Shows which profiles exist and which are missing

4. **Generate consents for existing users** (optional): Run `./scripts/setup/run_post_consents_for_all_users.sh`
   - Creates consents for all users that already have `userId`
   - Useful if you need to update consents for existing users

### **Using Users in Tests**

Most workloads **REQUIRE** this file to exist and contain users with `userId`:

#### **Workloads que USAN `registered_users.json`**:
- ✅ `clientfunnel.js` - Usuarios navegando la app (homepage → cupones → configuración → actualización perfil)
- ✅ `loyalty-plus.js` - Flujo completo cliente + POS (navegación app → compras → puntos → cupones)
- ✅ `mymeds-flow.js` - Búsqueda de medicamentos y reservas

**Características**:
- Each VU gets a different user based on VU ID (round-robin selection: `userIndex = (vuId - 1) % usersWithId.length`)
- JWT tokens are generated directly from the `userId` (no passwordless auth - más rápido y confiable)
- Users are **reused across iterations** - el mismo VU usa el mismo usuario en todas sus iteraciones
- **IMPORTANT**: If `registered_users.json` doesn't exist, is empty, or has no users with `userId`, these workloads will **FAIL** with a clear error message

#### **Workloads que NO USAN `registered_users.json`**:
- ❌ `profile_register.js` - **Genera usuarios nuevos en cada iteración**

**Características**:
- Creates a **new unique user** per iteration (not per VU)
- Generates unique `phone`, `email`, and `userId` dynamically per iteration
- Does NOT read from `registered_users.json`
- Useful for testing user registration flow and onboarding at scale

**Setup Requirement**:
- You must run `./scripts/setup/generate_users_with_ids.sh` first to create users with `userId` for workloads that require it

### **Generate Token for Local Testing**

To generate a JWT token for a specific user (useful for local testing with Postman or manual API calls):

```bash
# Generate token for user at index 0
./scripts/setup/generate_token.sh 0

# Generate token for user at index 5
./scripts/setup/generate_token.sh 5

# The token will be printed to console and can be used in Authorization header:
# Authorization: Bearer <generated-token>
```

**Token Details**:
- Tokens are generated using **HS256** algorithm
- Tokens contain the user's `userId` in the payload
- Tokens are valid indefinitely (no expiration for load testing)
- Same token generation method used by K6 workloads

## How Users Are Distributed Across VUs

### **Round-Robin Selection**

When a workload starts, users are distributed to VUs using round-robin:

```javascript
const vuId = __VU || 1;                           // VU ID (1, 2, 3, ...)
const userIndex = (vuId - 1) % usersWithId.length; // Round-robin index
const userEntry = usersWithId[userIndex];          // Selected user
```

**Example** with 100 users and 250 VUs:
- VU 1 → User 0
- VU 2 → User 1
- ...
- VU 100 → User 99
- VU 101 → User 0 (wraps around)
- VU 102 → User 1
- ...

**Benefits**:
- ✅ Each VU consistently uses the same user across all iterations
- ✅ Even distribution of users across VUs
- ✅ Predictable behavior for debugging
- ✅ Works with any number of VUs (even if VUs > users)

**Requirements**:
- Minimum recommended users: **~200-500** for typical load tests
- For stress tests (up to 2,000 VUs): **~1,000-2,000 users** recommended
- If you have fewer users than VUs, multiple VUs will share the same user (still works, but less realistic)

## File Format

```json
[
  {
    "phone": "600123456",
    "prefix": "+34",
    "email": "user@example.com",
    "name": "Test",
    "surname": "User",
    "birthdate": "1990-01-01T00:00:00Z",
    "gender": "male",
    "storeId": "500",
    "loginSessionId": "123",
    "countryCustomerId": "",
    "external_user_id": "uuid-here",
    "userId": "17646751988434907407",
    "registeredAt": "2025-11-21T12:00:00.000Z"
  }
]
```

**Important fields**:
- `userId` - **REQUIRED** - Unique user identifier used to generate JWT tokens
- `phone` - Phone number (without prefix)
- `prefix` - Phone prefix (e.g., "+34")
- `email` - User email address
- `name`, `surname` - User name and surname
- `registeredAt` - Timestamp when the user was registered/created

## Authentication Flow

**⚠️ IMPORTANT**: The workloads now use **JWT token generation** instead of passwordless authentication:

1. Load users with `userId` from `registered_users.json` (except `profile_register.js`)
2. Select a user for each VU using round-robin: `userIndex = (vuId - 1) % usersWithId.length`
3. Generate JWT token with HS256 format using the user's `userId`
4. Use the token for all API calls throughout the VU's lifetime

**Benefits**:
- ✅ **Faster**: No HTTP calls for authentication (~100ms saved per iteration)
- ✅ **More reliable**: No session expiration issues during long tests
- ✅ **Better for load testing**: Instant token generation, consistent performance
- ✅ **Simpler**: No need to handle token refresh or passwordless auth errors

## Workload Structure

All workloads (except `profile_register.js`) follow a **group-based structure** for better metrics granularity:

### **clientfunnel.js** - Navegación completa de la app
- **Step 1: Access Homepage** (100% iteraciones) - Homepage navigation + app tracking
- **Step 2: Coupons Home** (75% iteraciones) - Cupones, puntos, marketplace + app tracking
- **Step 3: Reservations** (20% iteraciones) - Consulta reservas + app tracking
- **Step 4: Account Settings** (70% iteraciones) - Configuración, recibos + app tracking
- **Step 5: Profile & Consents Update** (~8% iteraciones, 1/12) - Actualización perfil + app tracking

### **mymeds-flow.js** - Búsqueda de medicamentos y reservas
- **Step 1: Access Homepage** (100% iteraciones) - Homepage navigation + app tracking
- **Step 2: MyMeds Flow** (~33% iteraciones, 1/3) - Búsqueda medicamentos, disponibilidad + app tracking
- **Step 3: Reservations** (10% iteraciones, 1/10) - Crear reserva + app tracking

### **loyalty-plus.js** - Flujo completo cliente + POS
- **Step 1: Access Homepage** (100% iteraciones) - Homepage navigation + app tracking
- **Step 2: Purchases** (~4% iteraciones, 1/25) - Operaciones POS (compras físicas) + app tracking
- **Step 2: Points & Marketplace** (~96% iteraciones, 24/25) - Puntos, marketplace, canjeo + app tracking
- **Step 4: Advanced Actions** (~25% iteraciones, 1/4) - Activar cupones + app tracking

### **profile_register.js** - Registro de nuevos usuarios
- Flujo completo de registro (stores → consents → profile → get profile → get consents → app tracking)
- Cada iteración = **usuario nuevo único** con phone/email/userId generados dinámicamente

## App Tracking Events

All workloads now implement **App Tracking Events** (`POST /apptracking/v1/events`) at the end of each group:

**Event Structure**:
```json
{
  "version": "1.0.5",
  "trackingId": "4709316E-2D20-4243-B0E9-A1D50150E93E-LT",
  "events": [
    {
      "localEventTs": "2025-12-19T10:30:00.000Z",
      "page": "GET /profiles",
      "action": "GET"
    }
  ],
  "appId": "company.thehubs.phoenix.benu.rs.debug",
  "platform": 2
}
```

**Key Features**:
- ✅ **TrackingId con sufijo `-LT`**: Identifica eventos de Load Testing
- ✅ **Timestamp dinámico**: `localEventTs` con timestamp actual ISO
- ✅ **Eventos por grupo**: Cada grupo envía los endpoints consumidos en ese grupo
- ✅ **Configurables**: Usa env vars `APPTRACKING_VERSION` y `APPTRACKING_APP_ID`

## Load Testing Configurations

The project uses **5 shared configuration files** in `configs/` that work for all workloads:

| Config | Type | VUs | Duration | Rate/Pattern | Thresholds |
|--------|------|-----|----------|--------------|------------|
| **load.json** | Carga normal | 200-400 | 30min | 6,150 req/min | p(95)<300ms, failed<10% |
| **ramp.json** | Escalamiento | 50→250 | 12min | Ramping VUs | p(95)<300ms, failed<10% |
| **soak.json** | Resistencia | 200-400 | 8 horas | 6,150 req/min | p(95)<300ms, failed<10% |
| **spike.json** | Picos | 40→400 | 25min | Spike pattern | p(95)<10s, iter<3min |
| **stress.json** | Estrés | 400-2000 | 30min | 12,050 req/min | p(95)<500ms, failed<30% |

**Usage**:
```bash
# Run load test for any workload
make test WORKLOAD=clientfunnel CONFIG=load

# Run stress test for loyalty-plus
make test WORKLOAD=loyalty-plus CONFIG=stress

# Run soak test for mymeds-flow
make test WORKLOAD=mymeds-flow CONFIG=soak
```

## Maintenance & Best Practices

### **Cleanup**

To manually clean the file (useful when starting fresh or after corrupted data):

```bash
# Clear all users
echo "[]" > data/registered_users.json

# Then regenerate users
./scripts/setup/generate_users_with_ids.sh
```

**⚠️ Warning**: After cleaning, you must regenerate users before running workloads that require `registered_users.json`.

### **Adding More Users**

If you need more users for higher VU counts:

```bash
# Generate additional users (adds to existing)
./scripts/setup/generate_users_with_ids.sh

# Or: Clear and regenerate all users
echo "[]" > data/registered_users.json
./scripts/setup/generate_users_with_ids.sh
```

**Recommended user counts**:
- **Load/Ramp tests (200-400 VUs)**: 200-500 users
- **Soak tests (200-400 VUs, 8 hours)**: 500-1,000 users
- **Spike tests (up to 400 VUs)**: 500-1,000 users
- **Stress tests (up to 2,000 VUs)**: 1,000-2,000 users

### **Validating Data**

Check if your `registered_users.json` is valid:

```bash
# Count users with userId
cat data/registered_users.json | jq '[.[] | select(.userId != null and .userId != "")] | length'

# View first 3 users
cat data/registered_users.json | jq '.[0:3]'

# Check for duplicates (should be 0)
cat data/registered_users.json | jq '[.[].userId] | group_by(.) | map(select(length > 1))'
```

## Troubleshooting

### **Error: "registered_users.json not found or empty"**

**Cause**: Workload requires users but file doesn't exist.

**Solution**:
```bash
./scripts/setup/generate_users_with_ids.sh
```

### **Error: "No users with userId found"**

**Cause**: File exists but no users have `userId` assigned.

**Solution**:
```bash
# Regenerate users
echo "[]" > data/registered_users.json
./scripts/setup/generate_users_with_ids.sh
```

### **Performance Issues with High VUs**

**Symptom**: Tests fail or slow down with 1,000+ VUs.

**Possible causes**:
1. ✅ Not enough users → Add more users to `registered_users.json`
2. ✅ Thresholds too strict → Use `stress.json` config with relaxed thresholds
3. ✅ Backend can't handle load → Scale backend infrastructure

**Solution**:
```bash
# Add more users
./scripts/setup/generate_users_with_ids.sh

# Use stress config with relaxed thresholds
make test WORKLOAD=clientfunnel CONFIG=stress
```

### **Users Being Reused Too Much**

**Symptom**: Same user appears in multiple VUs simultaneously.

**Cause**: More VUs than users (e.g., 1,000 VUs but only 100 users).

**Solution**:
- Generate more users to match or exceed VU count
- For realistic simulation: **1 user per VU** is ideal
- Minimum acceptable: **1 user per 2-3 VUs**

## Related Documentation

- **`configs/LOAD_HYPOTHESIS.md`** - Load testing strategy and scenarios
- **`configs/README.md`** - Configuration files documentation
- **`docs/PROFILE_REGISTER.md`** - Profile registration flow documentation
- **`Makefile`** - Available commands for running tests
