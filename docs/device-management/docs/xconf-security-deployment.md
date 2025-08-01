---
hide:
  - navigation
---

# XConf Security & Deployment

## Authentication & Authorization

XConf implements a comprehensive security model with flexible access control for different organizational structures. The system supports external authentication providers and role-based access control (RBAC) built on the principle of least privilege.

### Token-based Authentication

XConf uses OAuth2 providers for secure access control with configurable token validation endpoints. This enables integration with existing organizational identity management systems while maintaining secure access to configuration functions.

```go
type AuthConfig struct {
    TokenAPIEnabled    bool   `json:"token_api_enabled"`
    TokenValidationURL string `json:"token_validation_url"`
    AuthProvider       string `json:"auth_provider"`
}
```

**Authentication Flow:**

1. User authenticates with external OAuth2 provider
2. Provider issues authentication token
3. XConf validates token with configured validation endpoint
4. System determines user's authorized application types and permissions
5. Access granted based on token validation and permission matrix

**Token Validation Features:**

- Configurable validation endpoints for different OAuth2 providers
- Support for custom authentication systems
- Token refresh mechanisms for session management
- Automatic token expiration and renewal handling

### Application Type Isolation

XConf ensures users can only access resources for their authorized application types (STB, xHome, rdkCloud) with strict isolation between environments. Each user's access is scoped to specific application types based on authentication credentials and role assignments.

**Isolation Benefits:**

- Prevents cross-contamination between device populations
- Enables specialized teams to manage specific device types
- Supports multi-tenant deployments with clear boundaries
- Reduces risk of configuration errors affecting wrong device types

**Implementation:**

- Application type embedded in authentication tokens
- API endpoints validate application type access
- Database queries filtered by application type
- UI dynamically adjusts based on user's application access

### Permission Validation Flow

The system follows structured validation that extracts and validates authentication tokens, determines authorized application types, and checks specific operation permissions. This includes both resource-level and operation-level access checks for granular permission control.

**Validation Steps:**

1. **Token Extraction**: Authentication token extracted from request headers
2. **Token Validation**: Token verified with authentication provider
3. **Application Type Check**: User's authorized application types determined
4. **Resource Access Check**: Verify user can access requested resource type
5. **Operation Permission Check**: Confirm user can perform specific operation
6. **Final Authorization**: Grant or deny access based on complete validation

---

## Security Features

XConf implements multiple security layers protecting against common attack vectors while maintaining usability and performance. The architecture addresses external threats and internal security requirements.

### Request Validation and Input Security

**Input Sanitization:**

- Comprehensive validation prevents injection attacks through input sanitization
- All user inputs undergo strict validation before processing
- Parameterized database queries prevent SQL injection
- Input length limits and format validation prevent buffer overflows

**XSS Protection:**

- Cross-site scripting protection throughout the web interface
- Content Security Policy (CSP) headers prevent script injection
- Input encoding and output escaping for all user-generated content
- Secure cookie handling with HttpOnly and Secure flags

**Request Rate Limiting:**

- DoS prevention through configurable rate limiting
- Per-user and per-IP request throttling
- Adaptive rate limiting based on system load
- Graceful degradation under high load conditions

### Data Protection and Encryption

**Communication Security:**

- All administrative communications use secure HTTPS channels
- TLS 1.2+ required for all external communications
- Certificate validation and pinning for enhanced security
- Secure WebSocket connections for real-time features

**Data Encryption:**

- Sensitive configuration data encrypted at rest in database
- Encryption keys managed through secure key management system
- Field-level encryption for highly sensitive data
- Secure backup and recovery procedures for encrypted data

**Audit and Compliance:**

- Comprehensive audit logging for all administrative actions
- Immutable audit trail for compliance reporting
- Detailed change tracking with modification histories
- Automated compliance reporting and alerting

### Access Control and Session Management

**Fine-grained Authorization:**

- Role-based permissions beyond basic authentication
- Resource-level and operation-level access controls
- Dynamic permission evaluation based on context
- Principle of least privilege enforcement

**Session Security:**

- Configurable session timeouts with automatic termination
- Secure session token generation and management
- Session invalidation on suspicious activity
- Multi-factor authentication support for sensitive operations

**Network Security:**

- IP-based access restrictions for administrative interfaces
- VPN requirement options for remote access
- Network segmentation between components
- Firewall rules and network access controls

---

## Deployment and Configuration

XConf's modular architecture supports flexible deployment from development setups to large-scale production environments serving millions of devices. Each component can be deployed independently for optimal scaling based on specific load characteristics.

### XConf DataService Configuration

Core service configuration emphasizing performance optimization for high-volume device requests:

```toml
xconfwebconfig {
  # Build and version information
  code_git_commit = "xconfwebconfig-22.2.14-461.879f957"
  build_time = "Thu Feb 14 02:14:00 2022 UTC"
  token_api_enabled = true

  # Database configuration
  cassandra {
    hosts = ["localhost:9042"]
    keyspace = "ApplicationsDiscoveryDataService"
    consistency = "ONE"
    timeout = "10s"
    max_connections = 100
    retry_policy = "default"
  }

  # HTTP server configuration
  server {
    port = 9000
    read_timeout = "30s"
    write_timeout = "30s"
    idle_timeout = "60s"
    max_header_bytes = 1048576
  }

  # Performance optimization
  cache {
    enabled = true
    ttl = "300s"
    max_entries = 10000
    eviction_policy = "LRU"
  }

  # Logging configuration
  logging {
    level = "INFO"
    format = "json"
    output = "stdout"
  }
}
```

#### Key Configuration Areas:

- **Database Connection**: Optimized for high-throughput device requests
- **Caching Strategy**: Reduces database load for frequently requested configurations
- **Timeout Settings**: Balanced for responsiveness and resource conservation
- **Logging**: Structured logging for operational visibility

### XConf Admin Configuration

Administrative service configuration focusing on security and external system integration:

```toml
xconfwebconfig {
  ProjectName = "xconfadmin"

  # Server configuration with security features
  server {
    port = 9001
    cors_enabled = true
    allowed_origins = ["http://localhost:8081", "https://admin.example.com"]
    allowed_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers = ["Content-Type", "Authorization"]
  }

  # Authentication and authorization
  auth {
    enabled = true
    provider = "oauth2"
    token_validation_url = "https://auth.example.com/validate"
    required_scopes = ["xconf:admin"]
    token_cache_ttl = "300s"
  }

  # Database configuration
  cassandra {
    hosts = ["localhost:9042"]
    keyspace = "ApplicationsDiscoveryDataService"
    consistency = "QUORUM"
    timeout = "30s"
  }

  # Security settings
  security {
    session_timeout = "3600s"
    max_login_attempts = 5
    lockout_duration = "900s"
  }
}
```

#### Security Focus Areas:

- **CORS Configuration**: Secure cross-origin resource sharing
- **Authentication Integration**: OAuth2 provider integration
- **Session Management**: Secure session handling and timeouts
- **Access Control**: Role-based permissions and restrictions

### XConf UI Configuration

Web interface configuration for backend integration and security:

```toml
xconfui {
  # Backend service endpoints
  xconfadmin {
    host = "http://localhost:9001/xconfAdminService"
    timeout = "30s"
    retry_attempts = 3
  }

  xconfdataservice {
    host = "http://localhost:9000"
    timeout = "10s"
    retry_attempts = 2
  }

  # UI server configuration
  server {
    port = 8081
    static_files = "./app"
    index_file = "index.html"
    gzip_enabled = true
  }

  # Security headers and policies
  security {
    content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'"
    x_frame_options = "DENY"
    x_content_type_options = "nosniff"
    strict_transport_security = "max-age=31536000; includeSubDomains"
  }

  # Caching and performance
  cache {
    static_cache_duration = "86400s"
    api_cache_duration = "300s"
  }
}
```

#### UI-Specific Features:

- **Backend Integration**: Optimized communication with admin and data services
- **Security Headers**: Comprehensive web security headers
- **Performance Optimization**: Caching and compression for better user experience
- **Static Asset Management**: Efficient serving of web application resources

---

## Setup and Deployment

XConf setup requires attention to system prerequisites, database configuration, and service coordination. The process is designed for straightforward deployment with flexibility for different operational environments.

### Prerequisites

#### System Requirements

| Requirement               | Details                                      |
|---------------------------|----------------------------------------------|
| OS                        | Ubuntu 18.04+, CentOS 7+, RHEL 7+            |
| RAM                       | Minimum 4GB (8GB+ recommended)               |
| Disk Space                | 50GB+ for database and logs                  |
| Network                   | Required for device communication            |
| Firewall                  | Proper configuration for service ports       |

#### Software Dependencies

| Dependency         | Version/Note                        | Purpose                                |
|--------------------|-------------------------------------|----------------------------------------|
| Cassandra          | 3.x+ (4.x recommended)               | Database                                |
| Go                 | 1.18+                                | Required for building from source       |
| Git                | Latest                              | Source code management                  |
| Make               | Latest                              | Build automation     

#### Go Module Dependencies

```go
// Core dependencies managed through Go modules
require (
    github.com/gorilla/mux v1.8.0        // HTTP routing and middleware
    github.com/gocql/gocql v1.0.0        // Cassandra database connectivity
    github.com/sirupsen/logrus v1.8.1    // Structured logging
    github.com/google/uuid v1.3.0        // UUID generation for entities
    github.com/rs/cors v1.8.0            // CORS support for web APIs
)
```
### Database Setup

**Cassandra Installation:**
```bash
# Install Cassandra on Ubuntu/Debian
sudo apt-get update
sudo apt-get install openjdk-8-jdk
echo "deb http://www.apache.org/dist/cassandra/debian 40x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
curl https://www.apache.org/dist/cassandra/KEYS | sudo apt-key add -
sudo apt-get update
sudo apt-get install cassandra

# Configure and start Cassandra
sudo systemctl start cassandra
sudo systemctl enable cassandra

# Verify installation
sudo systemctl status cassandra
cqlsh localhost 9042
```

**Schema Initialization:**
```bash
# Create XConf database schema
cqlsh localhost 9042

# Execute schema creation script
SOURCE 'xconfwebconfig/db/dbinit.cql';

# Verify table creation
DESCRIBE KEYSPACE "ApplicationsDiscoveryDataService";
```

**Schema Structure:**
```sql
-- Create keyspace with appropriate replication
CREATE KEYSPACE IF NOT EXISTS "ApplicationsDiscoveryDataService"
WITH replication = {
  'class': 'SimpleStrategy', 
  'replication_factor': 1
};

USE "ApplicationsDiscoveryDataService";

-- Create core configuration tables
CREATE TABLE IF NOT EXISTS "FirmwareConfig" (
    key text,
    column1 text,
    value blob,
    PRIMARY KEY ((key), column1)
) WITH COMPACT STORAGE;

CREATE TABLE IF NOT EXISTS "DcmRule" (
    key text,
    column1 text,
    value blob,
    PRIMARY KEY ((key), column1)
) WITH COMPACT STORAGE;

-- Additional tables follow similar wide-row patterns
```

!!! note "Production Considerations"
    For production deployments, consider using NetworkTopologyStrategy for replication and adjust replication factors based on cluster size and availability requirements.

### Application Deployment

**Build and Deploy Services:**
```bash
# Build XConf DataService
cd xconfwebconfig
make build
sudo cp xconfwebconfig /usr/local/bin/
sudo cp sample_xconfwebconfig.conf /etc/xconf/

# Build XConf Admin Service
cd ../xconfadmin
make build
sudo cp xconfadmin /usr/local/bin/
sudo cp sample_xconfadmin.conf /etc/xconf/

# Build XConf UI
cd ../xconfui
make build
sudo cp xconfui /usr/local/bin/
sudo cp sample_xconfui.conf /etc/xconf/
```

**Service Startup:**
```bash
# Start services in dependency order
sudo systemctl start cassandra

# Start XConf DataService
sudo systemctl start xconf-dataservice

# Start XConf Admin Service
sudo systemctl start xconf-admin

# Start XConf UI
sudo systemctl start xconf-ui
```

**Verification:**
```bash
# Check service health
curl http://localhost:9000/health
curl http://localhost:9001/xconfAdminService/health
curl http://localhost:8081/health

# Test basic functionality
curl "http://localhost:9000/xconf/swu/stb?eStbMac=AA:BB:CC:DD:EE:FF&model=TEST_MODEL"
```

### Production Deployment Considerations

**High Availability:**

- Deploy multiple instances behind load balancer (HAProxy, NGINX)
- Use Cassandra cluster with replication factor ≥ 3
- Implement health checks and auto-restart mechanisms
- Set up monitoring and alerting for service availability

**Performance Optimization:**

- Configure appropriate JVM settings for Cassandra
- Tune database connection pools and timeouts
- Implement application-level caching strategies
- Monitor and optimize query performance

**Security Hardening:**

- Enable HTTPS/TLS for all communications
- Configure proper authentication provider integration
- Set up network firewalls and access controls
- Implement regular security updates and patches
- Enable audit logging and monitoring

**Backup and Recovery:**

- Regular Cassandra backups using nodetool snapshot
- Configuration file versioning and backup
- Disaster recovery procedures and testing
- Data retention policies and cleanup procedures

---
