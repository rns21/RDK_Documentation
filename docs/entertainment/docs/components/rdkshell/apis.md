# RDKShell APIs

## Overview

RDKShell provides multiple API interfaces to accommodate different integration scenarios and programming languages. The system supports JSON-RPC over both traditional socket-based IPC and modern WebSocket connections, as well as direct C++ APIs for native code integration. All APIs provide access to the same underlying functionality through the CompositorController interface.

=== "JSON-RPC API"

    ### Application Management APIs

    ???+ note "createDisplay"
        **Method:** `org.rdk.RDKShell.1.createDisplay`

        **Parameters:**
        - `client` (string, required): Unique identifier for the application
        - `displayName` (string, optional): Custom name for the display surface
        - `displayWidth` (uint32, optional): Width of the display surface
        - `displayHeight` (uint32, optional): Height of the display surface
        - `virtualDisplayEnabled` (boolean, optional): Enable virtual display mode
        - `virtualWidth` (uint32, optional): Virtual display width
        - `virtualHeight` (uint32, optional): Virtual display height
        - `topmost` (boolean, optional): Create display in topmost layer
        - `focus` (boolean, optional): Give focus to the new display
        - `autodestroy` (boolean, optional): Automatically destroy when client disconnects

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "3",
          "result": {
            "success": true
          }
        }
        ```

        **Example Request:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "3",
          "method": "org.rdk.RDKShell.1.createDisplay",
          "params": {
            "client": "netflix",
            "displayWidth": 1920,
            "displayHeight": 1080,
            "topmost": true,
            "focus": true
          }
        }
        ```

    ???+ note "launchApplication"
        **Method:** `org.rdk.RDKShell.1.launchApplication`

        **Parameters:**
        - `client` (string, required): Application identifier
        - `uri` (string, required): Application URI or path
        - `mimeType` (string, required): MIME type of the application
        - `topmost` (boolean, optional): Launch in topmost layer
        - `focus` (boolean, optional): Give focus to launched application

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "4",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "kill"
        **Method:** `org.rdk.RDKShell.1.kill`

        **Parameters:**
        - `client` (string, required): Application identifier to terminate

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "5",
          "result": {
            "success": true
          }
        }
        ```

    ### Display Management APIs

    ???+ note "getScreenResolution"
        **Method:** `org.rdk.RDKShell.1.getScreenResolution`

        **Parameters:** None

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "6",
          "result": {
            "w": 1920,
            "h": 1080,
            "success": true
          }
        }
        ```

    ???+ note "setScreenResolution"
        **Method:** `org.rdk.RDKShell.1.setScreenResolution`

        **Parameters:**
        - `w` (uint32, required): Screen width in pixels
        - `h` (uint32, required): Screen height in pixels

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "7",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "getBounds"
        **Method:** `org.rdk.RDKShell.1.getBounds`

        **Parameters:**
        - `client` (string, required): Application identifier

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "8",
          "result": {
            "bounds": {
              "x": 100,
              "y": 50,
              "w": 800,
              "h": 600
            },
            "success": true
          }
        }
        ```

    ???+ note "setBounds"
        **Method:** `org.rdk.RDKShell.1.setBounds`

        **Parameters:**
        - `client` (string, required): Application identifier
        - `x` (int32, required): X coordinate
        - `y` (int32, required): Y coordinate
        - `w` (uint32, required): Width in pixels
        - `h` (uint32, required): Height in pixels

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "9",
          "result": {
            "success": true
          }
        }
        ```

    ### Visibility and Appearance APIs

    ???+ note "getVisibility"
        **Method:** `org.rdk.RDKShell.1.getVisibility`

        **Parameters:**
        - `client` (string, required): Application identifier

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "10",
          "result": {
            "visible": true,
            "success": true
          }
        }
        ```

    ???+ note "setVisibility"
        **Method:** `org.rdk.RDKShell.1.setVisibility`

        **Parameters:**
        - `client` (string, required): Application identifier
        - `visible` (boolean, required): Visibility state

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "11",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "getOpacity"
        **Method:** `org.rdk.RDKShell.1.getOpacity`

        **Parameters:**
        - `client` (string, required): Application identifier

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "12",
          "result": {
            "opacity": 255,
            "success": true
          }
        }
        ```

    ???+ note "setOpacity"
        **Method:** `org.rdk.RDKShell.1.setOpacity`

        **Parameters:**
        - `client` (string, required): Application identifier
        - `opacity` (uint32, required): Opacity value (0-255)

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "13",
          "result": {
            "success": true
          }
        }
        ```

    ### Z-Order Management APIs

    ???+ note "moveToFront"
        **Method:** `org.rdk.RDKShell.1.moveToFront`

        **Parameters:**
        - `client` (string, required): Application identifier

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "14",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "moveToBack"
        **Method:** `org.rdk.RDKShell.1.moveToBack`

        **Parameters:**
        - `client` (string, required): Application identifier

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "15",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "moveBehind"
        **Method:** `org.rdk.RDKShell.1.moveBehind`

        **Parameters:**
        - `client` (string, required): Application to move
        - `target` (string, required): Application to move behind

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "16",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "getZOrder"
        **Method:** `org.rdk.RDKShell.1.getZOrder`

        **Parameters:** None

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "17",
          "result": {
            "clients": ["app1", "app2", "app3"],
            "success": true
          }
        }
        ```

    ### Focus Management APIs

    ???+ note "setFocus"
        **Method:** `org.rdk.RDKShell.1.setFocus`

        **Parameters:**
        - `client` (string, required): Application identifier

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "18",
          "result": {
            "success": true
          }
        }
        ```

    ???+ note "getFocused"
        **Method:** `org.rdk.RDKShell.1.getFocused`

        **Parameters:** None

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "19",
          "result": {
            "client": "netflix",
            "success": true
          }
        }
        ```

    ### Input Management APIs

    ???+ note "addKeyIntercept"
        **Method:** `org.rdk.RDKShell.1.addKeyIntercept`

        **Parameters:**
        - `client` (string, required): Application identifier
        - `keyCode` (uint32, required): Key code to intercept
        - `modifiers` (array, optional): Modifier keys (ctrl, shift, alt)

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "20",
          "result": {
            "success": true
          }
        }
        ```

        **Example Request:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "20",
          "method": "org.rdk.RDKShell.1.addKeyIntercept",
          "params": {
            "client": "netflix",
            "keyCode": 48,
            "modifiers": ["ctrl", "shift"]
          }
        }
        ```

    ???+ note "removeKeyIntercept"
        **Method:** `org.rdk.RDKShell.1.removeKeyIntercept`

        **Parameters:**
        - `client` (string, required): Application identifier
        - `keyCode` (uint32, required): Key code to remove
        - `modifiers` (array, optional): Modifier keys

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "21",
          "result": {
            "success": true
          }
        }
        ```

    ### System Information APIs

    ???+ note "getClients"
        **Method:** `org.rdk.RDKShell.1.getClients`

        **Parameters:** None

        **Response:**
        ```json
        {
          "jsonrpc": "2.0",
          "id": "22",
          "result": {
            "clients": ["netflix", "youtube", "settings"],
            "success": true
          }
        }
        ```

=== "WebSocket API"

    RDKShell supports WebSocket-based communication for real-time interaction. The WebSocket API uses the same method names and parameters as the JSON-RPC API but operates over WebSocket connections for lower latency and bidirectional communication.

    **Connection Endpoint:** `ws://localhost:3000`

    **Message Format:**
    ```json
    {
      "msg": "methodName",
      "params": {
        "parameter1": "value1",
        "parameter2": "value2"
      }
    }
    ```

=== "C++ Native API"

    For native code integration, RDKShell provides direct C++ APIs through the CompositorController class. These APIs offer the same functionality as the JSON-RPC interfaces but with direct function calls for maximum performance.

    ### Key C++ API Functions

    ```cpp
    // Application management
    bool CompositorController::createDisplay(const std::string& client, const std::string& displayName);
    bool CompositorController::kill(const std::string& client);
    bool CompositorController::launchApplication(const std::string& client, const std::string& uri, const std::string& mimeType);

    // Display management
    bool CompositorController::setBounds(const std::string& client, uint32_t x, uint32_t y, uint32_t width, uint32_t height);
    bool CompositorController::getBounds(const std::string& client, uint32_t &x, uint32_t &y, uint32_t &width, uint32_t &height);
    bool CompositorController::setVisibility(const std::string& client, bool visible);
    bool CompositorController::getVisibility(const std::string& client, bool& visible);

    // Focus and z-order management
    bool CompositorController::setFocus(const std::string& client);
    bool CompositorController::moveToFront(const std::string& client);
    bool CompositorController::moveToBack(const std::string& client);
    bool CompositorController::moveBehind(const std::string& client, const std::string& target);

    // Input management
    bool CompositorController::addKeyIntercept(const std::string& client, uint32_t keyCode, uint32_t flags);
    bool CompositorController::removeKeyIntercept(const std::string& client, uint32_t keyCode, uint32_t flags);
    ```

## Error Handling

All APIs return success/failure indicators and provide detailed error information when operations fail. Common error conditions include:

- **Invalid client identifier**: Specified application does not exist
- **Resource constraints**: Insufficient memory or graphics resources
- **Permission denied**: Application lacks required permissions
- **Invalid parameters**: Malformed or out-of-range parameter values
- **System state conflicts**: Operation conflicts with current system state

Error responses follow the JSON-RPC error format:
```json
{
  "jsonrpc": "2.0",
  "id": "23",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": "Client 'invalid_app' not found"
  }
}
```