# RBUS Protocol Documentation

## 1. Overview

RBUS (RDK Bus) is a lightweight, fast and efficient bus messaging system that enables interprocess communication (IPC) and remote procedure calls (RPC) between multiple processes running on a hardware device. It supports the creation and use of a hierarchical data model with named objects containing properties, events, and methods.

## 2. Architecture

### 2.1 Component Roles

RBUS operates on a Provider-Consumer model:

**Providers:**
- Register properties and implement get/set operations
- Register objects and implement CRUD operations (create, read, update, delete)
- Register and publish events
- Register and implement methods for remote invocation

**Consumers:**
- Get and set property values
- Get, set, create, and delete objects
- Subscribe to and listen for events
- Invoke remote methods

**Note:** A single process can act as both provider and consumer.

### 2.2 Naming Convention

RBUS follows TR-069 naming convention with hierarchical structure:
- Levels separated by dots (`.`)
- Object instances denoted by braces (`{}`)
- Example: `Device.IP.Interface.{i}.Status`

## 3. Core Data Types

### 3.1 RBUS Value Types

```c
typedef enum {
    RBUS_BOOLEAN = 0x500,   // bool true or false
    RBUS_CHAR,              // char of size 1 byte
    RBUS_BYTE,              // unsigned char
    RBUS_INT8,              // 8 bit int
    RBUS_UINT8,             // 8 bit unsigned int
    RBUS_INT16,             // 16 bit int
    RBUS_UINT16,            // 16 bit unsigned int
    RBUS_INT32,             // 32 bit int
    RBUS_UINT32,            // 32 bit unsigned int
    RBUS_INT64,             // 64 bit int
    RBUS_UINT64,            // 64 bit unsigned int
    RBUS_SINGLE,            // 32 bit float
    RBUS_DOUBLE,            // 64 bit float
    RBUS_DATETIME,          // rbusDateTime_t structure
    RBUS_STRING,            // null terminated string
    RBUS_BYTES,             // byte array
    RBUS_PROPERTY,          // property instance
    RBUS_OBJECT,            // object instance
    RBUS_NONE
} rbusValueType_t;
```

### 3.2 Element Types

```c
typedef enum {
    RBUS_ELEMENT_TYPE_PROPERTY = 1,  // Properties with get/set operations
    RBUS_ELEMENT_TYPE_TABLE,         // Multi-instance objects
    RBUS_ELEMENT_TYPE_EVENT,         // Event elements
    RBUS_ELEMENT_TYPE_METHOD         // Method elements
} rbusElementType_t;
```

## 4. Error Codes

### 4.1 Standard Error Codes

```c
typedef enum {
    RBUS_ERROR_SUCCESS = 0,                     // Success
    RBUS_ERROR_BUS_ERROR = 1,                   // General Error
    RBUS_ERROR_INVALID_INPUT,                   // Invalid Input
    RBUS_ERROR_NOT_INITIALIZED,                 // Bus not initialized
    RBUS_ERROR_OUT_OF_RESOURCES,                // Running out of resources
    RBUS_ERROR_DESTINATION_NOT_FOUND,           // Destination element not found
    RBUS_ERROR_DESTINATION_NOT_REACHABLE,       // Destination element not reachable
    RBUS_ERROR_DESTINATION_RESPONSE_FAILURE,    // Destination failed to respond
    RBUS_ERROR_INVALID_RESPONSE_FROM_DESTINATION,// Invalid destination response
    RBUS_ERROR_INVALID_OPERATION,               // Invalid Operation
    RBUS_ERROR_INVALID_EVENT,                   // Invalid Event
    RBUS_ERROR_INVALID_HANDLE,                  // Invalid Handle
    RBUS_ERROR_SESSION_ALREADY_EXIST,           // Session already opened
    RBUS_ERROR_COMPONENT_NAME_DUPLICATE,        // Component name already exists
    RBUS_ERROR_ELEMENT_NAME_DUPLICATE,          // Element name previously registered
    RBUS_ERROR_ELEMENT_NAME_MISSING,            // No names provided
    RBUS_ERROR_COMPONENT_DOES_NOT_EXIST,        // Component not registered
    RBUS_ERROR_ELEMENT_DOES_NOT_EXIST,          // Element not registered
    RBUS_ERROR_ACCESS_NOT_ALLOWED,              // Access not permitted
    RBUS_ERROR_INVALID_CONTEXT,                 // Context mismatch
    RBUS_ERROR_TIMEOUT,                         // Operation timed out
    RBUS_ERROR_ASYNC_RESPONSE,                  // Async method response
    RBUS_ERROR_INVALID_METHOD,                  // Invalid Method
    RBUS_ERROR_NOSUBSCRIBERS,                   // No subscribers present
    RBUS_ERROR_SUBSCRIPTION_ALREADY_EXIST,      // Subscription already exists
    RBUS_ERROR_INVALID_NAMESPACE,               // Invalid namespace
    RBUS_ERROR_DIRECT_CON_NOT_EXIST,            // Direct connection not exist
    RBUS_ERROR_NOT_WRITABLE,                    // Set not permitted
    RBUS_ERROR_NOT_READABLE,                    // Get not permitted
    RBUS_ERROR_INVALID_PARAMETER_TYPE,          // Invalid parameter type
    RBUS_ERROR_INVALID_PARAMETER_VALUE          // Invalid parameter value
} rbusError_t;
```

## 5. API Methods

### 5.1 Initialization and Connection

#### rbus_open
```c
rbusError_t rbus_open(rbusHandle_t* handle, char const* componentName)
```
**Description:** Opens a bus connection for a software component.

**Parameters:**
- `handle`: Bus Handle (output)
- `componentName`: Name of the component initializing onto the bus

**Returns:** RBUS_ERROR_SUCCESS on success, error codes on failure

**Example Usage:**
```c
rbusHandle_t handle;
rbusError_t rc = rbus_open(&handle, "MyComponent");
if(rc != RBUS_ERROR_SUCCESS) {
    printf("Failed to open rbus: %d\n", rc);
}
```

#### rbus_close
```c
rbusError_t rbus_close(rbusHandle_t handle)
```
**Description:** Closes a bus connection from a component.

**Parameters:**
- `handle`: Bus Handle

**Returns:** RBUS_ERROR_SUCCESS on success

#### rbus_checkStatus
```c
rbusStatus_t rbus_checkStatus(void)
```
**Description:** Checks whether RBUS is enabled on the device.

**Returns:** RBUS status (RBUS_ENABLED, RBUS_DISABLED, etc.)

### 5.2 Element Registration

#### rbus_regDataElements
```c
rbusError_t rbus_regDataElements(rbusHandle_t handle, int numDataElements, rbusDataElement_t *elements)
```
**Description:** Registers one or more named data elements (parameters, events, methods).

**Parameters:**
- `handle`: Bus Handle
- `numDataElements`: Number of elements to register
- `elements`: Array of data elements

**Returns:** RBUS_ERROR_SUCCESS or error codes

**Example:**
```c
rbusDataElement_t dataElements[] = {
    {"Device.MyComponent.Property1", RBUS_ELEMENT_TYPE_PROPERTY, 
     {getHandler, setHandler, NULL, NULL, NULL, NULL}},
    {"Device.MyComponent.Event1!", RBUS_ELEMENT_TYPE_EVENT, 
     {NULL, NULL, NULL, NULL, eventSubHandler, NULL}}
};
rbus_regDataElements(handle, 2, dataElements);
```

#### rbus_unregDataElements
```c
rbusError_t rbus_unregDataElements(rbusHandle_t handle, int numDataElements, rbusDataElement_t *elements)
```
**Description:** Unregisters previously registered data elements.

### 5.3 Property Operations

#### rbus_get
```c
rbusError_t rbus_get(rbusHandle_t handle, char const* name, rbusValue_t* value)
```
**Description:** Gets the value of a single parameter.

**Parameters:**
- `handle`: Bus Handle  
- `name`: Parameter name
- `value`: Returned value (output)

**Returns:** RBUS_ERROR_SUCCESS or error codes

**Example:**
```c
rbusValue_t value;
rbusError_t rc = rbus_get(handle, "Device.MyComponent.Property1", &value);
if(rc == RBUS_ERROR_SUCCESS) {
    printf("Value: %s\n", rbusValue_GetString(value, NULL));
    rbusValue_Release(value);
}
```

#### rbus_set
```c
rbusError_t rbus_set(rbusHandle_t handle, char const* name, rbusValue_t value, rbusSetOptions_t* opts)
```
**Description:** Sets the value of a single parameter.

**Parameters:**
- `handle`: Bus Handle
- `name`: Parameter name
- `value`: Value to set
- `opts`: Set options (can be NULL for immediate commit)

**Returns:** RBUS_ERROR_SUCCESS or error codes

#### Type-Specific Get Methods
```c
rbusError_t rbus_getBoolean(rbusHandle_t handle, char const* paramName, bool* paramVal)
rbusError_t rbus_getInt(rbusHandle_t handle, char const* paramName, int* paramVal)
rbusError_t rbus_getUint(rbusHandle_t handle, char const* paramName, unsigned int* paramVal)
rbusError_t rbus_getStr(rbusHandle_t handle, char const* paramName, char** paramVal)
```

#### Type-Specific Set Methods
```c
rbusError_t rbus_setBoolean(rbusHandle_t handle, char const* paramName, bool paramVal)
rbusError_t rbus_setInt(rbusHandle_t handle, char const* paramName, int paramVal)
rbusError_t rbus_setUInt(rbusHandle_t handle, char const* paramName, unsigned int paramVal)
rbusError_t rbus_setStr(rbusHandle_t handle, char const* paramName, char const* paramVal)
```

### 5.4 Multi-Parameter Operations

#### rbus_getExt
```c
rbusError_t rbus_getExt(rbusHandle_t handle, int paramCount, char const** paramNames, int *numProps, rbusProperty_t* properties)
```
**Description:** Gets one or more parameter values in a single operation. Supports wildcards and partial path queries.

#### rbus_setMulti
```c
rbusError_t rbus_setMulti(rbusHandle_t handle, int numProps, rbusProperty_t properties, rbusSetOptions_t* opts)
```
**Description:** Sets multiple parameters at once.

### 5.5 Table Operations

#### rbusTable_addRow
```c
rbusError_t rbusTable_addRow(rbusHandle_t handle, char const* tableName, char const* aliasName, uint32_t* instNum)
```
**Description:** Adds a new row to a table.

**Parameters:**
- `handle`: Bus Handle
- `tableName`: Table name (must end with ".")
- `aliasName`: Optional alias name for the row
- `instNum`: Returned instance number (output)

#### rbusTable_removeRow
```c
rbusError_t rbusTable_removeRow(rbusHandle_t handle, char const* rowName)
```
**Description:** Removes a row from a table.

#### rbusTable_getRowNames
```c
rbusError_t rbusTable_getRowNames(rbusHandle_t handle, char const* tableName, rbusRowName_t** rowNames)
```
**Description:** Gets a list of row names in a table.

### 5.6 Event Operations

#### rbusEvent_Subscribe
```c
rbusError_t rbusEvent_Subscribe(rbusHandle_t handle, char const* eventName, rbusEventHandler_t handler, void* userData, int timeout)
```
**Description:** Subscribes to a single event.

**Parameters:**
- `handle`: Bus Handle
- `eventName`: Fully qualified event name
- `handler`: Event callback handler
- `userData`: User data passed to callback
- `timeout`: Max retry timeout in seconds

**Example:**
```c
void eventHandler(rbusHandle_t handle, rbusEvent_t const* event, rbusEventSubscription_t* subscription) {
    printf("Event received: %s\n", event->name);
}

rbusEvent_Subscribe(handle, "Device.MyComponent.Event1!", eventHandler, NULL, 0);
```

#### rbusEvent_Unsubscribe
```c
rbusError_t rbusEvent_Unsubscribe(rbusHandle_t handle, char const* eventName)
```
**Description:** Unsubscribes from an event.

#### rbusEvent_Publish
```c
rbusError_t rbusEvent_Publish(rbusHandle_t handle, rbusEvent_t* eventData)
```
**Description:** Publishes an event to all subscribers.

**Example:**
```c
rbusEvent_t event = {0};
event.name = "Device.MyComponent.Event1!";
event.type = RBUS_EVENT_GENERAL;
event.data = myEventObject;
rbusEvent_Publish(handle, &event);
```

### 5.7 Method Operations

#### rbusMethod_Invoke
```c
rbusError_t rbusMethod_Invoke(rbusHandle_t handle, char const* methodName, rbusObject_t inParams, rbusObject_t* outParams)
```
**Description:** Invokes a remote method synchronously.

**Parameters:**
- `handle`: Bus Handle
- `methodName`: Method name
- `inParams`: Input parameters
- `outParams`: Output parameters (output)

#### rbusMethod_InvokeAsync
```c
rbusError_t rbusMethod_InvokeAsync(rbusHandle_t handle, char const* methodName, rbusObject_t inParams, rbusMethodAsyncRespHandler_t callback, int timeout)
```
**Description:** Invokes a remote method asynchronously.

### 5.8 Discovery Operations

#### rbus_discoverComponentName
```c
rbusError_t rbus_discoverComponentName(rbusHandle_t handle, int numElements, char const** elementNames, int *numComponents, char ***componentName)
```
**Description:** Discovers components that provide specific data elements.

#### rbus_discoverComponentDataElements
```c
rbusError_t rbus_discoverComponentDataElements(rbusHandle_t handle, char const* name, bool nextLevel, int *numElements, char*** elementNames)
```
**Description:** Discovers all data elements provided by a component.

## 6. Event Types

### 6.1 Event Type Enumeration
```c
typedef enum {
    RBUS_EVENT_OBJECT_CREATED,   // Object instance created in table
    RBUS_EVENT_OBJECT_DELETED,   // Object instance deleted in table
    RBUS_EVENT_VALUE_CHANGED,    // Property value changed
    RBUS_EVENT_GENERAL,          // Provider defined event
    RBUS_EVENT_INITIAL_VALUE,    // Initial value after subscription
    RBUS_EVENT_INTERVAL,         // Interval-based event
    RBUS_EVENT_DURATION_COMPLETE // Duration timeout event
} rbusEventType_t;
```

## 7. Sessions and Transactions

### 7.1 Session Management

#### rbus_createSession
```c
rbusError_t rbus_createSession(rbusHandle_t handle, uint32_t *pSessionId)
```
**Description:** Creates a new session for coordinated parameter operations.

#### rbus_closeSession  
```c
rbusError_t rbus_closeSession(rbusHandle_t handle, uint32_t sessionId)
```
**Description:** Closes an existing session.

## 8. Configuration and Logging

### 8.1 Timeout Configuration

#### rbusHandle_ConfigTimeoutValues
```c
rbusError_t rbusHandle_ConfigTimeoutValues(rbusHandle_t handle, rbusTimeoutValues_t timeoutValues)
```
**Description:** Configures timeout values for RBUS operations.

### 8.2 Logging

#### rbus_registerLogHandler
```c
rbusError_t rbus_registerLogHandler(rbusLogHandler logHandler)
```
**Description:** Registers a custom log handler.

#### rbus_setLogLevel
```c
rbusError_t rbus_setLogLevel(rbusLogLevel_t level)
```
**Description:** Sets the logging level.

**Log Levels:**
- RBUS_LOG_DEBUG = 0
- RBUS_LOG_INFO = 1  
- RBUS_LOG_WARN = 2
- RBUS_LOG_ERROR = 3
- RBUS_LOG_FATAL = 4

## 9. Direct Connection Mode

### 9.1 Direct Connection APIs

#### rbus_openDirect
```c
rbusError_t rbus_openDirect(rbusHandle_t handle, rbusHandle_t* myDirectHandle, char const* parameterName)
```
**Description:** Opens a direct connection to a provider for high-frequency, low-latency operations.

#### rbus_closeDirect
```c
rbusError_t rbus_closeDirect(rbusHandle_t handle)
```
**Description:** Closes a direct connection.

## 10. Sample Usage Patterns

### 10.1 Simple Provider Example

```c
#include <rbus.h>

rbusError_t myGetHandler(rbusHandle_t handle, rbusProperty_t property, rbusGetHandlerOptions_t* opts) {
    char const* name = rbusProperty_GetName(property);
    rbusValue_t value;
    
    rbusValue_Init(&value);
    if(strcmp(name, "Device.MyApp.Status") == 0) {
        rbusValue_SetString(value, "Running");
    }
    rbusProperty_SetValue(property, value);
    rbusValue_Release(value);
    return RBUS_ERROR_SUCCESS;
}

int main() {
    rbusHandle_t handle;
    rbusDataElement_t dataElements[] = {
        {"Device.MyApp.Status", RBUS_ELEMENT_TYPE_PROPERTY, {myGetHandler, NULL, NULL, NULL, NULL, NULL}}
    };
    
    rbus_open(&handle, "MyProvider");
    rbus_regDataElements(handle, 1, dataElements);
    
    // Keep running...
    sleep(3600);
    
    rbus_close(handle);
    return 0;
}
```

### 10.2 Simple Consumer Example

```c
#include <rbus.h>

int main() {
    rbusHandle_t handle;
    rbusValue_t value;
    
    rbus_open(&handle, "MyConsumer");
    
    if(rbus_get(handle, "Device.MyApp.Status", &value) == RBUS_ERROR_SUCCESS) {
        printf("Status: %s\n", rbusValue_GetString(value, NULL));
        rbusValue_Release(value);
    }
    
    rbus_close(handle);
    return 0;
}
```

## 11. Best Practices

### 11.1 Memory Management
- Always call `rbusValue_Release()` after using values returned by get operations
- Use proper reference counting with `rbusValue_Retain()` and `rbusValue_Release()`
- Initialize objects and properties properly before use

### 11.2 Error Handling
- Always check return codes from RBUS API calls
- Use `rbusError_ToString()` for human-readable error messages
- Handle timeout scenarios appropriately

### 11.3 Naming Conventions
- Follow TR-069 hierarchical naming: `Device.Component.Object.Property`
- Use descriptive names for better discoverability
- Ensure unique names across the system to avoid conflicts

### 11.4 Performance Considerations
- Use `rbus_getExt()` for multiple parameter queries
- Consider direct connections for high-frequency operations
- Use appropriate timeout values based on operation complexity

## 12. Build and Deployment

### 12.1 Dependencies
- cJSON library for JSON processing
- msgpack library for message serialization
- rdklogger (optional) for enhanced logging

### 12.2 CMake Configuration
```cmake
find_package(rbus REQUIRED)
target_link_libraries(my_app rbus)
```

### 12.3 Runtime Requirements
- rtrouted daemon must be running for RBUS communication
- Proper system permissions for IPC operations
- Sufficient system resources for message queuing

This documentation provides a comprehensive overview of the RBUS protocol and its APIs based on the source code analysis. The protocol enables efficient inter-process communication through a well-defined set of operations for properties, events, methods, and tables in a hierarchical data model.