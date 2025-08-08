# Configuration

RDKShell provides extensive configuration capabilities through environment variables, configuration files, and compile-time options. The configuration system is designed to support both development scenarios with detailed debugging capabilities and production deployments with optimized performance characteristics. The system supports hierarchical configuration sources, allowing for system-wide defaults, platform-specific overrides, and application-specific customizations.

## Environment Variables

### Core System Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RDKSHELL_LOG_LEVEL` | string | "Information" | Sets the verbosity level for logging output. Valid values are "Debug", "Information", "Warn", "Error", and "Fatal". When set to "Debug", detailed runtime information is printed to help with development and troubleshooting. |
| `RDKSHELL_FRAMERATE` | integer | 40 | Controls the target frame rate for the main rendering loop. Higher values provide smoother animation but consume more CPU resources. The system will attempt to maintain this frame rate while processing input events and updating application states. |
| `RDKSHELL_ENABLE_IPC` | boolean | "0" | Enables the socket-based IPC communication system when set to "1". This allows external applications to communicate with RDKShell through JSON-RPC over Unix domain sockets. |
| `RDKSHELL_ENABLE_WS_IPC` | boolean | "0" | Enables the WebSocket-based IPC communication system when set to "1". This provides real-time bidirectional communication capabilities for web-based applications and modern client frameworks. |

### Memory Management Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RDKSHELL_LOW_MEMORY_THRESHOLD` | double | 200.0 | Sets the threshold in megabytes for low memory notifications. When available system memory falls below this threshold, RDKShell will send low memory notifications to registered applications, allowing them to free up resources proactively. |
| `RDKSHELL_CRITICALLY_LOW_MEMORY_THRESHOLD` | double | 100.0 | Defines the critically low memory threshold in megabytes. When system memory falls below this level, RDKShell will send critical memory notifications and may take more aggressive resource management actions. This value must be less than or equal to the low memory threshold. |
| `RDKSHELL_SWAP_MEMORY_INCREASE_THRESHOLD` | double | 50.0 | Sets the threshold in megabytes for swap memory increase notifications. When swap usage increases by more than this amount, applications will be notified of potential memory pressure conditions. |

### Input System Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RDKSHELL_KEY_INITIAL_DELAY` | integer | 500 | Configures the initial delay in milliseconds before key repeat events begin. This affects how long a user must hold a key before it starts repeating, providing control over input responsiveness and preventing accidental repeated inputs. |
| `RDKSHELL_KEY_REPEAT_INTERVAL` | integer | 100 | Sets the interval in milliseconds between key repeat events once repeating has started. Lower values result in faster key repetition, while higher values provide more controlled input for navigation scenarios. |

### Display Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RDKSHELL_SET_GRAPHICS_720` | boolean | "0" | Forces the graphics system to initialize in 720p mode (1280x720) when set to "1". This is useful for devices with limited graphics capabilities or when 720p output is specifically required. The system will initialize with these dimensions regardless of the display's native resolution. |
| `RDKSHELL_SHOW_SPLASH_SCREEN` | string | undefined | When defined, enables the splash screen functionality. The splash screen provides visual feedback during system initialization and can be customized with specific images or animations. |
| `RDKSHELL_DISABLE_SPLASH_SCREEN_FILE` | string | undefined | Specifies a file path that, when present, will disable the splash screen even if `RDKSHELL_SHOW_SPLASH_SCREEN` is set. This provides a mechanism for runtime control of splash screen behavior. |

### Plugin and Extension Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RDKSHELL_WESTEROS_PLUGIN_DIRECTORY` | string | "/usr/lib/plugins/westeros/" | Specifies the directory path where Westeros plugins are located. RDKShell will search this directory for compatible plugins that extend the core functionality with platform-specific features. |

## Configuration Files

### Input Device Configuration (`inputdevices.conf`)

```json
{
    "inputDevices": [
        {
            "vendor": "0x119b",
            "product": "0x2101", 
            "deviceType": "0x00",
            "deviceMode": "0x00"
        },
        {
            "vendor": "0x119b",
            "product": "0x212b",
            "deviceType": "0x01", 
            "deviceMode": "0x0f"
        },
        {
            "vendor": "0x06e7",
            "product": "0x8038",
            "deviceType": "0x02",
            "deviceMode": "0x03"
        }
    ],
    "irInputDeviceTypeMapping": [
        {
            "filterCode": 19,
            "deviceType": "0xf2"
        },
        {
            "filterCode": 20,
            "deviceType": "0xf1"
        },
        {
            "filterCode": 21,
            "deviceType": "0xf3"
        }
    ]
}
```

#### Input Device Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `vendor` | string | USB vendor ID in hexadecimal format. This identifies the manufacturer of the input device and is used for device-specific handling and configuration. |
| `product` | string | USB product ID in hexadecimal format. Combined with the vendor ID, this uniquely identifies the specific device model and determines appropriate input handling behavior. |
| `deviceType` | string | Device type classification in hexadecimal format. This determines how the device's input events are processed and which input handling routines are applied. |
| `deviceMode` | string | Device mode configuration in hexadecimal format. This controls specific operational characteristics of the device, such as key repeat behavior and input event filtering. |

#### IR Input Device Mapping

| Parameter | Type | Description |
|-----------|------|-------------|
| `filterCode` | integer | IR filter code that identifies specific IR signal patterns. This allows the system to distinguish between different types of IR input devices and remote controls. |
| `deviceType` | string | Device type mapping for IR devices in hexadecimal format. This determines how IR input events are translated into standard input events within the system. |

### Permissions Configuration (`rdkshellPermissions.conf`)

```json
{
    "clients": [
        {
            "client": "trusted_application",
            "extensions": ["libwesteros_plugin_rdkshell_client_control.so"]
        },
        {
            "client": "system_service",
            "extensions": [
                "libwesteros_plugin_rdkshell_client_control.so",
                "libwesteros_plugin_rdkshell_extended_input.so"
            ]
        }
    ],
    "default": {
        "extensions": []
    }
}
```

#### Permission Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `client` | string | Application identifier that matches the client name used in API calls. |
| `extensions` | array | List of extension library names that the client is permitted to use. |
| `default.extensions` | array | Default extension permissions applied to clients not explicitly listed in the configuration. |

## Compile-Time Configuration Options

### Build Configuration Flags

| Option | Default | Description |
|--------|---------|-------------|
| `RDKSHELL_BUILD_APP` | ON | Controls whether the main RDKShell executable is built. |
| `RDKSHELL_BUILD_WEBSOCKET_IPC` | OFF | Enables WebSocket-based IPC communication support. |
| `RDKSHELL_BUILD_KEY_METADATA` | OFF | Enables extended key metadata support that provides additional information about input events. |
| `RDKSHELL_BUILD_IPC` | ON | Enables traditional socket-based IPC communication. |
| `RDKSHELL_BUILD_CLIENT` | ON | Controls whether the RDKShell client library is built. |
| `RDKSHELL_BUILD_FORCE_1080` | OFF | Enables compile-time support for forcing 1080p resolution. |
| `RDKSHELL_BUILD_ENABLE_KEYREPEATS` | OFF | Enables advanced key repeat functionality with configurable timing and behavior. |

### Advanced Build Options

| Option | Default | Description |
|--------|---------|-------------|
| `RDKSHELL_BUILD_HIDDEN_SUPPORT` | OFF | Enables support for hidden application states. |
| `RDKSHELL_BUILD_EXTERNAL_APPLICATION_SURFACE_COMPOSITION` | ON | Enables support for compositing surfaces from external applications. |
| `RDKSHELL_BUILD_KEYBUBBING_TOP_MODE` | ON | Enables key bubbling to topmost applications. |
| `RDKSHELL_BUILD_KEY_METADATA_EXTENDED_SUPPORT_FOR_IR` | OFF | Enables extended IR support that provides additional metadata for infrared input devices. |

## Runtime Configuration

### Memory Monitor Configuration

```cpp
// Configure memory monitoring with specific parameters
std::map<std::string, RdkShellData> config;
config["enable"] = true;
config["interval"] = 2.0;  // Check every 2 seconds
config["lowRam"] = 150.0;  // 150MB threshold
config["criticallyLowRam"] = 75.0;  // 75MB critical threshold
config["swapIncreaseLimit"] = 25.0;  // 25MB swap increase limit
RdkShell::setMemoryMonitor(config);
```

### Dynamic Display Configuration

Display parameters can be adjusted at runtime through the API system, allowing applications to adapt to changing display conditions or user preferences. This includes resolution changes, display mode adjustments, and multi-display configuration management.

### Input Device Runtime Configuration

Input device behavior can be modified at runtime through the input management APIs, enabling dynamic adaptation to different input scenarios and user preferences. This includes key mapping changes, device enable/disable operations, and input routing configuration.

## Best Practices

=== "Development"

    Enable debug logging and extended metadata collection to facilitate troubleshooting and performance analysis.
    
    Use higher frame rates for smoother development experience but be aware of increased resource consumption.
    
    Enable additional build options that provide debugging capabilities and detailed system information.

=== "Production"

    Use optimized logging levels and carefully tuned memory thresholds based on the specific hardware platform and application requirements.
    
    Disable unnecessary features to minimize resource usage and potential security exposure.
    
    Use conservative memory thresholds to ensure system stability under varying load conditions.

=== "Security"

    Carefully configure the permissions system to ensure that only trusted applications have access to sensitive extensions and capabilities.
    
    Regularly review and update permission configurations as applications are added or removed from the system.
    
    Use the principle of least privilege when granting extension access to applications.

=== "Performance"

    Configure frame rates and memory thresholds based on the specific hardware capabilities and performance requirements of the target deployment.
    
    Monitor system performance under typical usage scenarios and adjust configuration parameters to optimize for the specific use case and hardware platform.
