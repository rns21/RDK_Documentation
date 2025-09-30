# Rbus

## 1. Overview
RDK Bus (RBus) is a lightweight, fast and efficient bus messaging system enabling interprocess communication (IPC) and remote procedure call (RPC) between multiple processes on a hardware device. It supports a hierarchical data model of named objects containing properties, events, and methods. Providers implement and register data elements; consumers discover, query, modify, subscribe, and invoke them. A process may be both provider and consumer.

## 2. Architecture and Roles
- Providers:
  - Register properties, objects (tables), events, and methods.
  - Implement get/set for properties; add/remove/sync for table rows; method handlers; event publish logic.
- Consumers:
  - Get/set property values (single, multiple, wildcard, partial path).
  - Add/remove table rows.
  - Subscribe/unsubscribe to events (value change, object create/delete, general, interval, initial value, duration complete).
  - Invoke methods (sync or async).
- Bus Broker (daemon) mediates routing except in direct mode (rbus_openDirect) which forms optimized component-to-component connections.

## 3. Naming Conventions and Data Model
- Names are hierarchical tokens separated by '.' similar to TR-069/TR-181 (e.g. `Device.IP.Interface.1.Status`).
- Tables (multi-instance objects) have names ending in a '.' and use instance numbers or aliases (e.g. `Device.IP.Interface.`; rows: `Device.IP.Interface.1.` or `Device.IP.Interface.[lan1].`).
- Instance wildcards supported with `*` (e.g. `Device.IP.Interface.*.Status`). Multiple indices can be wildcarded.
- Maximum name length: `RBUS_MAX_NAME_LENGTH` (256). Maximum depth (token count): `RBUS_MAX_NAME_DEPTH` (16).
- Event names may be general or derived from properties/tables. (Event type drives semantics.)

## 4. Data Element Types
`rbusElementType_t`:
- `RBUS_ELEMENT_TYPE_PROPERTY` – scalar or hierarchical property; supports get/set and value-change events.
- `RBUS_ELEMENT_TYPE_TABLE` – multi-instance object (rows can be added/removed).
- `RBUS_ELEMENT_TYPE_EVENT` – exclusive event element (general provider-defined events).
- `RBUS_ELEMENT_TYPE_METHOD` – invokable method element.
# RBUS Protocol Documentation

1. Introduction
RDK Bus (RBus) is a lightweight, fast and efficient bus messaging system enabling interprocess communication (IPC) and remote procedure call (RPC) among processes on a device. It supports a hierarchical data model of named objects containing properties, events, and methods. Components can act as providers (exposing data elements) and/or consumers (accessing them).

2. Terminology
- Element: A named item (property, table, event, or method) in the hierarchical namespace.
- Property: A readable and/or writable value.
- Table: A multi-instance object supporting dynamic row add/remove.
- Event: A notification that can be subscribed to (value change, object lifecycle, general, etc.).
- Method: A remotely invokable procedure.
- Handle (rbusHandle_t): Opaque connection context for a component.
- Session: Grouped set/mutate operations coordinated via commit.

3. Naming & Constraints
- Maximum element name length: 256 (RBUS_MAX_NAME_LENGTH)
- Maximum hierarchical depth: 16 tokens (RBUS_MAX_NAME_DEPTH)
- Hierarchical levels separated by '.'
- Tables indicated by instance numbers or alias in brackets (e.g. Device.IP.Interface.1 or Device.IP.Interface.[lan1]).
- Events may use the same element names or dedicated event elements (RBUS_ELEMENT_TYPE_EVENT).

4. Error Codes (rbusError_t)
Representative values (see `rbus.h` for full list):
- RBUS_ERROR_SUCCESS
- RBUS_ERROR_BUS_ERROR
- RBUS_ERROR_INVALID_INPUT
- RBUS_ERROR_NOT_INITIALIZED
- RBUS_ERROR_OUT_OF_RESOURCES
- RBUS_ERROR_DESTINATION_NOT_FOUND / NOT_REACHABLE
- RBUS_ERROR_DESTINATION_RESPONSE_FAILURE
- RBUS_ERROR_INVALID_RESPONSE_FROM_DESTINATION
- RBUS_ERROR_INVALID_OPERATION / INVALID_EVENT / INVALID_METHOD
- RBUS_ERROR_INVALID_HANDLE / INVALID_CONTEXT
- RBUS_ERROR_COMPONENT_NAME_DUPLICATE / ELEMENT_NAME_DUPLICATE
- RBUS_ERROR_ELEMENT_NAME_MISSING / COMPONENT_DOES_NOT_EXIST / ELEMENT_DOES_NOT_EXIST
- RBUS_ERROR_ACCESS_NOT_ALLOWED / NOT_WRITABLE / NOT_READABLE
- RBUS_ERROR_TIMEOUT / ASYNC_RESPONSE
- RBUS_ERROR_SUBSCRIPTION_ALREADY_EXIST / NOSUBSCRIBERS
- RBUS_ERROR_INVALID_NAMESPACE / DIRECT_CON_NOT_EXIST
- RBUS_ERROR_SESSION_ALREADY_EXIST
- RBUS_ERROR_INVALID_PARAMETER_TYPE / INVALID_PARAMETER_VALUE

5. Core Data Types & Structures
- rbusHandle_t: Opaque pointer identifying an opened component connection.
- rbusValue_t / rbusProperty_t / rbusObject_t: Value, property (name+value), and structured object containers.
- rbusSetOptions_t: { commit:bool, sessionId:uint32_t }
- rbusGetHandlerOptions_t: { context:void*, requestingComponent:char* }
- rbusSetHandlerOptions_t: { commit:bool, sessionId:uint32_t, requestingComponent:char* }
- rbusEvent_t: { name, type (rbusEventType_t), data (rbusObject_t) }
- rbusEventRawData_t: { name, rawData ptr, rawDataLen }
- rbusEventSubscription_t: { eventName, filter, interval, duration, handler, userData, ... }
- rbusRowName_t: Linked list of { name, instNum, alias }
- rbusDataElement_t: { name, type (rbusElementType_t), cbTable (rbusCallbackTable_t) }
- rbusElementCallbackTable_t / rbusCallbackTable_t: Sets of provider callbacks.
- rbusElementInfo_t: { name, component, type, access flags }
- rbusTimeoutValues_t: Per-handle default timeout configuration.

6. Element Types (rbusElementType_t)
- PROPERTY
- TABLE (multi-instance)
- EVENT (exclusive event element)
- METHOD

7. Access Flags (rbusAccess_t)
Bitwise OR of: GET, SET, ADDROW, REMOVEROW, SUBSCRIBE, INVOKE.

8. Event Types (rbusEventType_t)
- OBJECT_CREATED
- OBJECT_DELETED
- VALUE_CHANGED
- GENERAL
- INITIAL_VALUE
- INTERVAL
- DURATION_COMPLETE

9. Initialization APIs
Methods:
- rbus_checkStatus() -> rbusStatus_t
- rbus_open(rbusHandle_t* handle, const char* componentName)
- rbus_close(rbusHandle_t handle)

10. Trace Context APIs
- rbusHandle_SetTraceContextFromString(handle, traceParent, traceState)
- rbusHandle_ClearTraceContext(handle)
- rbusHandle_GetTraceContextAsString(handle, traceParentBuf, traceParentLen, traceStateBuf, traceStateLen)

11. Discovery APIs
- rbus_discoverComponentName(handle, numElements, elementNames, &numComponents, &componentNameArray)
- rbus_discoverComponentDataElements(handle, name, nextLevel, &numElements, &elementNamesArray)
- rbusElementInfo_get(handle, elemName, depth, &infoList)
- rbusElementInfo_free(handle, infoList)

12. Provider Registration APIs
- rbus_regDataElements(handle, numDataElements, elementsArray)
- rbus_unregDataElements(handle, numDataElements, elementsArray)
- rbusTable_registerRow(handle, tableName, instNum, aliasName)
- rbusTable_unregisterRow(handle, rowName)
- rbus_registerDynamicTableSyncHandler(handle, tableName, syncHandler)

13. Consumer Property Get APIs
- rbus_get(handle, name, &value)
- rbus_getExt(handle, paramCount, paramNames, &numProps, &properties)
- rbus_getBoolean(handle, paramName, &boolVal)
- rbus_getInt(handle, paramName, &intVal)
- rbus_getUint(handle, paramName, &uintVal)
- rbus_getStr(handle, paramName, &charPtr) (caller frees)

14. Consumer Property Set APIs
- rbus_set(handle, name, value, opts)
- rbus_setCommit(handle, name, opts)
- rbus_setMulti(handle, numProps, properties, opts)
- rbus_setMultiExt(handle, numProps, properties, opts, timeoutMs, &failedParamName)
- rbus_setBoolean(handle, paramName, boolVal)
- rbus_setInt(handle, paramName, intVal)
- rbus_setUInt(handle, paramName, uintVal)
- rbus_setStr(handle, paramName, strVal)

15. Table Consumer APIs
- rbusTable_addRow(handle, tableName, aliasName, &instNum)
- rbusTable_removeRow(handle, rowName)
- rbusTable_getRowNames(handle, tableName, &rowNameList)
- rbusTable_freeRowNames(handle, rowNameList)

16. Session Management APIs
- rbus_createSession(handle, &sessionId)
- rbus_getCurrentSession(handle, &sessionId)
- rbus_closeSession(handle, sessionId)

17. Event Subscription (Consumer) APIs
- rbusEvent_IsSubscriptionExist(handle, eventName, subscription)
- rbusEvent_Subscribe(handle, eventName, handler, userData, timeoutSec)
- rbusEvent_SubscribeRawData(handle, eventName, handler, userData, timeoutSec)
- rbusEvent_SubscribeAsync(handle, eventName, handler, subscribeRespHandler, userData, timeoutSec)
- rbusEvent_Unsubscribe(handle, eventName)
- rbusEvent_UnsubscribeRawData(handle, eventName)
- rbusEvent_SubscribeEx(handle, subscriptionsArray, num, timeoutSec)
- rbusEvent_SubscribeExRawData(handle, subscriptionsArray, num, timeoutSec)
- rbusEvent_SubscribeExAsync(handle, subscriptionsArray, num, subscribeRespHandler, timeoutSec)
- rbusEvent_UnsubscribeEx(handle, subscriptionsArray, num)
- rbusEvent_UnsubscribeExRawData(handle, subscriptionsArray, num)

18. Event Publish (Provider) APIs
- rbusEvent_Publish(handle, &eventData)
- rbusEvent_PublishRawData(handle, &rawEventData)

19. Method Invocation (Consumer) APIs
- rbusMethod_Invoke(handle, methodName, inParams, &outParams)
- rbusMethod_InvokeAsync(handle, methodName, inParams, callback, timeoutSec)

20. Method Response (Provider) API
- rbusMethod_SendAsyncResponse(asyncHandle, errorCode, outParams)

21. Direct Connection APIs
- rbus_openDirect(handle, &directHandle, parameterName)
- rbus_closeDirect(directHandle)

22. Timeout Configuration APIs
- rbusHandle_ConfigTimeoutValues(handle, timeoutValuesStruct)
- rbusHandle_ConfigSetTimeout(handle, ms)
- rbusHandle_ConfigGetTimeout(handle, ms)
- rbusHandle_ConfigGetMultiTimeout(handle, ms)
- rbusHandle_ConfigSetMultiTimeout(handle, ms)
- rbusHandle_ConfigSubscribeTimeout(handle, ms)

23. Logging APIs
- rbus_registerLogHandler(logHandler)
- rbus_setLogLevel(level)
- Log levels: DEBUG, INFO, WARN, ERROR, FATAL

24. Callback Handler Types (Provider)
- rbusGetHandler_t(handle, property, getOptions)
- rbusSetHandler_t(handle, property, setOptions)
- rbusTableAddRowHandler_t(handle, tableName, aliasName, &instNum)
- rbusTableRemoveRowHandler_t(handle, rowName)
- rbusMethodHandler_t(handle, methodName, inParams, outParams, asyncHandle)
- rbusEventSubHandler_t(handle, action, eventName, filter, interval, &autoPublish)
- rbusTableSyncHandler_t(handle, tableName)

25. Event Handler Types (Consumer)
- rbusEventHandler_t(handle, eventData, subscription)
- rbusEventHandlerRawData_t(handle, rawEventData, subscription)
- rbusSubscribeAsyncRespHandler_t(handle, subscription, error)
- rbusMethodAsyncRespHandler_t(handle, methodName, error, params)

26. Usage Flow Summary
Provider typical sequence:
1. rbus_open
2. Prepare rbusDataElement_t array with callback tables
3. rbus_regDataElements
4. (Optional) rbusTable_registerRow for dynamic initial rows
5. Publish events via rbusEvent_Publish when state changes
6. Respond to gets/sets/methods via registered handlers
7. rbus_unregDataElements (shutdown)
8. rbus_close

Consumer typical sequence:
1. rbus_open
2. Discover (optional): rbus_discoverComponentDataElements / rbusElementInfo_get
3. Get/Set via rbus_get / rbus_set / *Ext APIs
4. Subscribe to events via rbusEvent_Subscribe* APIs
5. Invoke methods via rbusMethod_Invoke / Async
6. rbus_close

27. Session Based Set Pattern
1. rbus_createSession -> sessionId
2. Perform multiple rbus_set(..., opts{sessionId, commit=false}) or table add/remove
3. Final rbus_set / rbus_setCommit with opts.commit=true to apply all
4. rbus_closeSession

28. Asynchronous Method Pattern
Provider: In methodHandler return RBUS_ERROR_ASYNC_RESPONSE and retain asyncHandle. Later call rbusMethod_SendAsyncResponse(asyncHandle, status, outParams).
Consumer: Use rbusMethod_InvokeAsync and process callback with final outParams.

29. Auto vs Manual Event Publish
If eventSubHandler sets autoPublish=true for value-change events, library polls value (1s) and rate-limits (1 event per 2s). For high-frequency or precise events set autoPublish=false and explicitly call rbusEvent_Publish.

30. Direct Mode (rbus_openDirect)
Used for high frequency / low latency access to a specific parameter provider, bypassing central daemon routing and using more resources. Only open where necessary.

31. Timeout Management
Configure per-handle defaults (SET, GET, wildcard GET, SET multi, Subscribe) using rbusHandle_ConfigTimeoutValues or individual setters. Zero input resets to default internal value (e.g., standard 15s defaults mentioned in comments for setMultiExt per-provider operations).

32. Memory Management Notes
- Caller must free strings returned by rbus_getStr.
- Caller must release rbusValue_t, rbusProperty_t lists after use following value/property API lifecycles (per headers in repo).
- Row lists from rbusTable_getRowNames freed with rbusTable_freeRowNames.
- Element info lists from rbusElementInfo_get freed with rbusElementInfo_free.

33. Event Subscription Attributes
rbusEventSubscription_t fields:
- filter (optional) applied provider-side
- interval (seconds) for periodic publish (with optional filtering)
- duration (auto-unsubscribe after seconds; 0 = indefinite)
- publishOnSubscribe (initial value emission when supported)

34. Error Handling Guidance
- RBUS_ERROR_ASYNC_RESPONSE: Method response will arrive later
- RBUS_ERROR_TIMEOUT: Operation exceeded configured or default timeout
- RBUS_ERROR_ACCESS_NOT_ALLOWED / NOT_WRITABLE / NOT_READABLE: Permission / capability issue
- RBUS_ERROR_ELEMENT_DOES_NOT_EXIST: Invalid name or unregistered element

35. Logging Integration
Use rbus_registerLogHandler to intercept library log messages (level, file, line, thread, message). Otherwise configure built-in verbosity with rbus_setLogLevel.

36. Extensibility Callback Summary
Place appropriate handler pointers in rbusElementCallbackTable_t (or rbusCallbackTable_t legacy) per element. Unused capabilities set to NULL; library substitutes internal error responders.

37. Concurrency & Asynchrony Notes
- Async method responses require explicit SendAsyncResponse.
- Subscription retries occur up to timeout if provider absent.
- AutoPublish polling frequency 1 Hz (implicit from comments) with min 2s rate-limit for value-change events when enabled.

38. API Versioning
Versioning is implicit in component naming/registration within this source tree; no separate semantic API version function is defined in `rbus.h` (refer only to repository content; no external version list).

39. Limitations & Constraints
- Max name length and depth as above.
- Filters and raw data subscriptions reduce overhead (raw bypasses object encoding/decoding).
- Direct mode consumes more memory—use sparingly.

40. Appendix: Representative Callback Signatures
Provider:
- rbusError_t getHandler(rbusHandle_t, rbusProperty_t, rbusGetHandlerOptions_t*)
- rbusError_t setHandler(rbusHandle_t, rbusProperty_t, rbusSetHandlerOptions_t*)
- rbusError_t tableAddRowHandler(rbusHandle_t, const char*, const char*, uint32_t*)
- rbusError_t tableRemoveRowHandler(rbusHandle_t, const char*)
- rbusError_t methodHandler(rbusHandle_t, const char*, rbusObject_t in, rbusObject_t out, rbusMethodAsyncHandle_t asyncHandle)
- rbusError_t eventSubHandler(rbusHandle_t, rbusEventSubAction_t, const char*, rbusFilter_t, int32_t interval, bool* autoPublish)

Consumer:
- void rbusEventHandler(rbusHandle_t, const rbusEvent_t*, rbusEventSubscription_t*)
- void rbusEventHandlerRawData(rbusHandle_t, const rbusEventRawData_t*, rbusEventSubscription_t*)
- void rbusSubscribeAsyncRespHandler(rbusHandle_t, rbusEventSubscription_t*, rbusError_t)
- void rbusMethodAsyncRespHandler(rbusHandle_t, const char*, rbusError_t, rbusObject_t)

41. Change Reference
For detailed evolution refer to `CHANGELOG.md` in repository (not reproduced here per instruction to confine to source content).

42. Minimal Usage Snippets (Abstracted)
(Names only; full code can be built from headers in repository)
Provider skeleton:
- open -> regDataElements -> (callbacks invoked) -> unreg -> close
Consumer skeleton:
- open -> get/set/method invoke -> subscribe -> unsubscribe -> close

43. Completion Statement
This document enumerates protocol-level structure and callable interfaces strictly extracted from repository header `rbus.h` and related local documentation without external augmentation.