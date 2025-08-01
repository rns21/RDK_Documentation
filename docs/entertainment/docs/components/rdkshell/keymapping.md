# RDKShell Key Mappings and Input Management

## Overview

RDKShell implements a comprehensive key mapping system that translates between different key code formats and provides sophisticated input event routing capabilities. The system supports both Wayland key codes for low-level input handling and RDKShell virtual key codes for application-level input processing. This dual-layer approach ensures compatibility with various input devices while providing a consistent interface for applications.

The key mapping system is designed to handle the diverse input requirements of set-top box and smart TV environments, where applications must work with various remote controls, keyboards, and specialized input devices. The system provides flexible mapping capabilities that can be configured for different device types and user preferences.

## Key Code Translation System

=== "Wayland Key Codes"

    RDKShell uses Wayland key codes as the foundation for low-level input processing. These codes correspond directly to Linux input event codes and provide the interface between hardware input devices and the RDKShell input processing system. Wayland key codes are hardware-specific and may vary between different input devices and platforms.

=== "RDKShell Virtual Key Codes"

    The virtual key code system provides a standardized interface for applications, abstracting away hardware-specific details and ensuring consistent behavior across different input devices and platforms. Virtual key codes are designed to be stable across different hardware configurations and provide a consistent programming interface for application developers.

## Standard Key Mappings

### Alphanumeric Keys

| Key | Wayland Code | RDKShell Code | Description |
|-----|--------------|---------------|-------------|
| 0 | 11 | 48 | Number zero key |
| 1 | 2 | 49 | Number one key |
| 2 | 3 | 50 | Number two key |
| 3 | 4 | 51 | Number three key |
| 4 | 5 | 52 | Number four key |
| 5 | 6 | 53 | Number five key |
| 6 | 7 | 54 | Number six key |
| 7 | 8 | 55 | Number seven key |
| 8 | 9 | 56 | Number eight key |
| 9 | 10 | 57 | Number nine key |
| A | 30 | 65 | Letter A key |
| B | 48 | 66 | Letter B key |
| C | 46 | 67 | Letter C key |
| D | 32 | 68 | Letter D key |
| E | 18 | 69 | Letter E key |
| F | 33 | 70 | Letter F key |
| G | 34 | 71 | Letter G key |
| H | 35 | 72 | Letter H key |
| I | 23 | 73 | Letter I key |
| J | 36 | 74 | Letter J key |
| K | 37 | 75 | Letter K key |
| L | 38 | 76 | Letter L key |
| M | 50 | 77 | Letter M key |
| N | 49 | 78 | Letter N key |
| O | 24 | 79 | Letter O key |
| P | 25 | 80 | Letter P key |
| Q | 16 | 81 | Letter Q key |
| R | 19 | 82 | Letter R key |
| S | 31 | 83 | Letter S key |
| T | 20 | 84 | Letter T key |
| U | 22 | 85 | Letter U key |
| V | 47 | 86 | Letter V key |
| W | 17 | 87 | Letter W key |
| X | 45 | 88 | Letter X key |
| Y | 21 | 89 | Letter Y key |
| Z | 44 | 90 | Letter Z key |

### Function Keys

| Key | Wayland Code | RDKShell Code | Description |
|-----|--------------|---------------|-------------|
| F1 | 59 | 112 | Function key F1 |
| F2 | 60 | 113 | Function key F2 |
| F3 | 61 | 114 | Function key F3 |
| F4 | 62 | 115 | Function key F4 |
| F5 | 63 | 116 | Function key F5 |
| F6 | 64 | 117 | Function key F6 |
| F7 | 65 | 118 | Function key F7 |
| F8 | 66 | 119 | Function key F8 |
| F9 | 67 | 120 | Function key F9 |
| F10 | 68 | 121 | Function key F10 |
| F11 | 87 | 122 | Function key F11 |
| F12 | 88 | 123 | Function key F12 |
| F13 | 183 | 124 | Function key F13 |
| F14 | 184 | 125 | Function key F14 |
| F15 | 185 | 126 | Function key F15 |
| F16 | 186 | 127 | Function key F16 |
| F17 | 187 | 129 | Function key F17 |
| F18 | 188 | 130 | Function key F18 |
| F19 | 189 | 131 | Function key F19 |
| F20 | 190 | 132 | Function key F20 |
| F21 | 191 | 133 | Function key F21 |
| F22 | 192 | 134 | Function key F22 |
| F23 | 193 | 135 | Function key F23 |
| F24 | 194 | 136 | Function key F24 |

### Navigation Keys

| Key | Wayland Code | RDKShell Code | Description |
|-----|--------------|---------------|-------------|
| Up Arrow | 103 | 38 | Directional up navigation key |
| Down Arrow | 108 | 40 | Directional down navigation key |
| Left Arrow | 105 | 37 | Directional left navigation key |
| Right Arrow | 106 | 39 | Directional right navigation key |
| Home | 102 | 36 | Home navigation key |
| End | 107 | 35 | End navigation key |
| Page Up | 104 | 33 | Page up navigation key |
| Page Down | 109 | 34 | Page down navigation key |
| Insert | 110 | 45 | Insert key |
| Delete | 111 | 46 | Delete key |

### Control and Modifier Keys

| Key | Wayland Code | RDKShell Code | Flag Value | Description |
|-----|--------------|---------------|------------|-------------|
| Escape | 1 | 27 | - | Escape key for canceling operations |
| Tab | 15 | 9 | - | Tab key for navigation and focus control |
| Enter | 28 | 13 | - | Enter key for confirmation and line breaks |
| Space | 57 | 32 | - | Space bar for text input and selection |
| Backspace | 14 | 8 | - | Backspace key for deleting characters |
| Left Shift | 42 | 16 | 8 | Left shift modifier key |
| Right Shift | 54 | 16 | 8 | Right shift modifier key |
| Left Ctrl | 29 | 17 | 16 | Left control modifier key |
| Right Ctrl | 97 | 17 | 16 | Right control modifier key |
| Left Alt | 56 | 18 | 32 | Left alt modifier key |
| Right Alt | 100 | 18 | 32 | Right alt modifier key |
| Caps Lock | 58 | 20 | - | Caps lock toggle key |
| Num Lock | 69 | 144 | - | Numeric keypad lock toggle |
| Scroll Lock | 70 | 145 | - | Scroll lock toggle key |
| Pause | 119 | 19 | - | Pause/break key |

### Special Media and Remote Control Keys

| Key | Wayland Code | RDKShell Code | Description |
|-----|--------------|---------------|-------------|
| Red | 0x190 | 405 | Red colored key typically found on remote controls |
| Green | 0x191 | 406 | Green colored key typically found on remote controls |
| Yellow | 0x18e | 403 | Yellow colored key typically found on remote controls |
| Blue | 0x18f | 404 | Blue colored key typically found on remote controls |
| Back | 158 | 407 | Back navigation key for returning to previous screens |
| Menu | 139 | 408 | Menu key for accessing application menus |
| Home Page | 172 | 409 | Home page key for returning to main interface |
| Volume Up | 115 | 175 | Volume increase key |
| Volume Down | 114 | 174 | Volume decrease key |
| Mute | 113 | 173 | Audio mute toggle key |
| Play/Pause | 164 | 227 | Media play/pause toggle key |
| Play | 207 | 226 | Media play key |
| Fast Forward | 208 | 223 | Media fast forward key |
| Rewind | 168 | 224 | Media rewind key |

### Numeric Keypad

| Key | Wayland Code | RDKShell Code | Description |
|-----|--------------|---------------|-------------|
| Keypad 0 | 82 | 96 | Numeric keypad zero |
| Keypad 1 | 79 | 97 | Numeric keypad one |
| Keypad 2 | 80 | 98 | Numeric keypad two |
| Keypad 3 | 81 | 99 | Numeric keypad three |
| Keypad 4 | 75 | 100 | Numeric keypad four |
| Keypad 5 | 76 | 101 | Numeric keypad five |
| Keypad 6 | 77 | 102 | Numeric keypad six |
| Keypad 7 | 71 | 103 | Numeric keypad seven |
| Keypad 8 | 72 | 104 | Numeric keypad eight |
| Keypad 9 | 73 | 105 | Numeric keypad nine |
| Keypad Plus | 78 | 107 | Numeric keypad addition operator |
| Keypad Minus | 74 | 109 | Numeric keypad subtraction operator |
| Keypad Multiply | 55 | 106 | Numeric keypad multiplication operator |
| Keypad Divide | 98 | 111 | Numeric keypad division operator |
| Keypad Decimal | 83 | 110 | Numeric keypad decimal point |
| Keypad Enter | 96 | 13 | Numeric keypad enter key |

## Modifier Key Flags

RDKShell uses flag values to represent modifier key states that can be combined with regular key codes to create complex key combinations. These flags can be combined using bitwise OR operations to represent multiple simultaneous modifier keys.

| Modifier | Flag Value | Description |
|----------|------------|-------------|
| Shift | 8 | Shift key modifier for uppercase letters and symbol access |
| Control | 16 | Control key modifier for keyboard shortcuts and commands |
| Alt | 32 | Alt key modifier for alternative character input and shortcuts |
| Command | 64 | Command/Windows key modifier for system-level shortcuts |

### Modifier Combination Examples

```cpp
// Ctrl+C combination
uint32_t keyCode = 67;  // C key
uint32_t flags = 16;    // Control modifier

// Ctrl+Shift+F combination  
uint32_t keyCode = 70;  // F key
uint32_t flags = 24;    // Control (16) + Shift (8)

// Alt+Tab combination
uint32_t keyCode = 9;   // Tab key
uint32_t flags = 32;    // Alt modifier

// Ctrl+Alt+Delete combination
uint32_t keyCode = 46;  // Delete key
uint32_t flags = 48;    // Control (16) + Alt (32)
```

## Input Event Processing

=== "Key Event Types"

    RDKShell processes two primary types of key events: key press events and key release events. Each event includes the key code, modifier flags, and timing metadata. The system maintains state information about which keys are currently pressed to support complex input scenarios and modifier key combinations.

=== "Key Repeat Handling"

    The system supports configurable key repeat functionality with separate settings for initial delay and repeat interval. Key repeat events are marked with a special flag to distinguish them from initial key press events. The repeat behavior can be configured globally or on a per-application basis.

    ```cpp
    #define RDKSHELL_KEYDOWN_REPEAT 128
    ```

    The key repeat system includes sophisticated logic to handle modifier keys correctly and ensure that repeat events are only generated for appropriate key types. Navigation keys and character keys typically support repeat, while modifier keys and special function keys do not.

=== "Event Routing and Interception"

    Applications can register to intercept specific key combinations even when they are not in focus. This enables global hotkey functionality and allows background applications to respond to specific input events. The interception system supports complex routing scenarios where multiple applications may be interested in the same key events.

    The event routing system includes priority mechanisms to ensure that critical system functions can always access required key combinations. Applications can register for different types of key interception, including exclusive access, shared access, and monitoring-only access.

## Mouse and Pointer Input

### Mouse Button Mappings

| Button | Flag Value | Description |
|--------|------------|-------------|
| Left Button | 1 | Primary mouse button for selection and activation |
| Middle Button | 2 | Middle mouse button typically used for scrolling |
| Right Button | 4 | Secondary mouse button for context menus |

### Pointer Event Processing

RDKShell processes pointer motion events and button press/release events, providing applications with precise cursor position information and button state changes. The system supports both absolute and relative pointer positioning and can handle multiple pointer devices simultaneously.

The pointer event system includes support for touch interfaces and gesture recognition when available. It provides coordinate transformation capabilities to support different display resolutions and scaling factors.

## Input Device Configuration

=== "Device Type Classifications"

    The input system supports various device type classifications that determine how input events are processed and routed through the system. Different device types may have different key mappings, repeat behaviors, and event processing characteristics.

=== "Custom Input Device Support"

    RDKShell can be configured to support custom input devices through the input device configuration file, allowing for specialized remote controls and input hardware commonly used in set-top box and smart TV environments. The system includes support for device-specific key mappings and behavior customization.

## Virtual Key Support

=== "Virtual Key Generation"

    The system supports programmatic generation of virtual key events, enabling applications to simulate user input for automation and testing scenarios. Virtual key events are processed through the same routing and interception mechanisms as physical key events.

=== "Virtual Key Mapping"

    Virtual keys can be mapped to physical key codes through string-based identifiers, providing a flexible interface for dynamic key mapping scenarios. This enables applications to define custom key mappings that can be configured at runtime.

## Best Practices

=== "Key Intercept Registration"

    Applications should register for key intercepts only for the specific key combinations they need to handle globally. Excessive key intercept registrations can impact system performance and interfere with other applications. Applications should also properly remove their key intercept registrations when they are suspended or terminated.

=== "Modifier Key Handling"

    When processing key events with modifiers, applications should check for the specific modifier combinations they support and ignore unexpected modifier states to ensure robust input handling. Applications should also be prepared to handle cases where modifier keys are pressed or released independently of other keys.

=== "Input Event Cleanup"

    Applications should properly remove their key intercept registrations when they are suspended or terminated to prevent resource leaks and ensure proper input routing for other applications. The system includes automatic cleanup mechanisms, but applications should not rely solely on these mechanisms.

=== "Performance Considerations"

    Input event processing should be optimized to minimize latency and ensure responsive user interaction. Applications should avoid performing heavy processing in input event handlers and should use efficient data structures for key mapping and event routing operations.
