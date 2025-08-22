# RDK-V Features

------------------------------------------------------------------------

RDK is a community-based project that enables developers, vendors, and cable operators to utilize a defined stack of software on one layer for provisioning set-top boxes and gateways. Unique features of RDK, such as its commitment to open source, the speed, and flexibility of RDK-based devices, set it apart from conventional set-top software stacks.

The standardized RDK‐V stack provides a common method for managing complex video and management functions, including rendering, content, content security, device management, networking, and peripherals.

The RDK‐V Feature List is categorized based on the following functions. Enhancements and new features are developed and contributed asynchronously by members of the RDK Community.

!!! Note 
     The device dependency in this context meant that the feature is only available in some OEM devices and not generally available in raspberry pi like reference devices. 



| **Category**                | **Feature**                                      | **Description**                                           | **Supported by IP/Hybrid/TV** | **Dependency (If any)** |
|-----------------------------|--------------------------------------------------|-----------------------------------------------------------|--------------------------------|-------------------------|
| **Conditional Access**      | DRM                                              | PlayReady 4.4                                           | IP STB, Hybrid STB, and TV     | Device Dependency       |
|                             |                                                  | Widevine 16                                             | IP STB, Hybrid STB, and TV     | Device Dependency       |
|                             || Common SVP                                      |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             | |Support HTML5 encrypted video via EME v3 for Widevine |                                                       IP STB, Hybrid STB, and TV    | Device Dependency       |
| | Conditional Access|Verimatrix                                      |                                                            Hybrid                         | Device Dependency       |
|                             | |AnyCAS                                          |                                                            Hybrid                         | Device Dependency       |
|                             || CommScope CableCard Decrypt, PPV Ready          |                                                            Hybrid                         | Device Dependency       |
|                             | |Technicolor CableCard Decrypt, PPV Ready        |                                                            Hybrid                         | Device Dependency       |
|                             | DTCP                                          | DTCP integration                                         | Hybrid-media client            | No                      |
|   |Device Security| Input sanitization                               |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             | |Upgrade to OpenSSL 1.1.1.l                      |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             | |Upgrade to NTP 4.2.8.p11                        |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             | |Run applications in a secure container          |                                                           IP STB, Hybrid STB, and TV    | NO                      |
|                             || Secure bootloader                               |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|  |Security  |DAC (Containerization) using Dobby              |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             | |Rialto                                         |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             | |Packager (Lisa)                                |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             | |AppArmor                                       |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                          |   | Kernel Hardening                                                                                            | IP STB, Hybrid STB, and TV    | Device Dependency       |
| **Build & Platform**       | Yocto version                                    | Yocto 3.1 (Dunfell)                                      | IP STB, Hybrid STB, and TV    | NO                      |
|                             | Kernel                                         | Android common kernel                                     | IP STB, Hybrid STB, and TV    | NO                      |
|                             | Init system                                    | Systemd v244 (Yocto 3.1)                                 | IP STB, Hybrid STB, and TV    | NO                      |
|                             | Application Manager                             | RDK Shell                                                | IP STB, Hybrid STB, and TV    | NO                      |
|                 **Video Player**                                  | IP                                             | UVE (AAMP)                                               | IP STB, Hybrid STB, and TV    | NO                      |
|                             | QAM                                            | UVE via RMF (QAMSrc)                                    | Hybrid STB                     | Device Dependency       |
|                             | DVB (Mediarite)                                | UVE via RMF                                             | Hybrid STB                     | Device Dependency       |
|                             | DVB (DTVKit)                                   | Sessionmanager via RMF                                   | Hybrid STB                     | NO                      |
|                             | TSB                                            | Fog                                                     | IP STB, Hybrid STB, and TV    | NO                      |
|                             | DAC Apps                                       | RIALTO                                                 |                                | NO                      |
| **Content Related**        | Adaptive Bit Rate                               | HLS (HLS v3 and HLS v4)                                | IP STB, Hybrid STB, and TV    | NO                      |
|                             | |MPEG-DASH                                      |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             || HTML-5 Video (MSE/ESE)                         |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|          || MPEG-DASH (Native)                              |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|   | Audio Output Formats |Stereo                                          |                                                            IP STB, Hybrid STB, and TV    | NO                      |
|                             || Dolby Digital                                   |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || Dolby ATMOS                                     |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || Dolby Digital Plus (7.1 Channels)              |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || Split HDMI and SPDIF audio outputs              |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || Bit stream Pass-through                          |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || Dolby MS12                                      |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             | Audio Tracks                                    | SAP, DVS                                                 | IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             | Codecs                                         | H264                                                     | IP STB, Hybrid STB, and TV    | NO                      |
|                             || MPEG2, VP8, VP9, High Efficiency Video Coding (HEVC) (H.265/MPEG-H Part 10) |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || HDR 10 Bit (HEVC HLS) for IP settop            |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             | Captions               | 608, 708, subtec VTT                                     | IP STB, Hybrid STB             | Region Dependency       |
|                             | Delivery               | Broadcast, Video on Demand                               | IP STB, Hybrid STB, and TV    | NO                      |
|                             || Video over Wi-Fi Ready                          |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             | |Secondary Audio Output to Bluetooth devices      |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|         || IP Multiroom Music Playback (STB to Speakers)   | IP STB, Hybrid STB, and TV                                | Device Dependency              |                         
|                             |DVB| Broadcast DVB support                            |                                                            Hybrid STB, and TV            | Device Dependency       |
|                             | |Subtitles                                        |                                                            IP STB                        | Device Dependency       |
|                             | |Teletext                                         |                                                            Hybrid STB, and TV            | Device Dependency       |
|                             |                             | In-Band System Information                       | Hybrid STB                    | Device Dependency       |
|                             | EAS | QAM EAS                                         | Hybrid STB                    | NO                      |
|                             | | IP EAS                                          | TV                             | NO                      |
|                             | UHD/4K  | RDKServices for 4K and HDR capability information across devices | IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             | | Supports IP Time Shift Buffer for DASH Linear content | IP STB, Hybrid STB, and TV    | NO                      |
| **Content Delivery**                            | Video Input Formats                             | MPEG2, H.264, VP8 (h264 for RPI4)                        | TV, IP STB                    | NO                      |
|                             | Video Output Resolutions| 480i (not in Amlogic), 480p, 720p, 1080i, 1080p | IP STB, Hybrid STB, and TV    | NO                      |
|                             || Ultra HD/4K, Advanced High Dynamic Range (HDR) |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || Dolby Vision Advanced HDR for VOD               |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
|                             || HDR 10                                          |                                                            IP STB, Hybrid STB, and TV    | Device Dependency       |
| |Video Over WiFi      | UPnP                                           |                                                           | IP STB, Hybrid STB, and TV    | NO                      |
|                             | VOD                   | IP VOD                                         |                                                           | IP STB, Hybrid STB, and TV    | NO                      |
| **Ad Insertion** | Ad Insertion     | Client Side Ad Insertion (Linear Segmented Advertisement) | Hybrid STB                    | Device Dependency       |
|                             || Server side Ad Insertion                         |                                                           IP STB                        | Cloud Dependency        |
||Ad Insertion – Linear Segmented Advertising |          LSA support for ad content read failure            |                                                                      Hybrid STB                    | Cloud Dependency        |                                                                                                                  
| ||     LSA support for back-to-back ads                         |                                                                     Hybrid STB                    | Cloud Dependency        |                                                                                           |
|                             | IP DAI                                     | Handle DASH IP VOD Dynamic Ad Insertion (DAI) Transitions                                          | IP STB and TV                      | Cloud Dependency          |
| **Rendering** | Framework     | Firebolt V1.0                             | IP STB, Hybrid STB, and TV         | NO                        |
|||Ripple                                     |                                                                                                      IP STB, Hybrid STB, and TV         | NO                        |
|| |Lightning V2.8                             |                                                                                                     IP STB, Hybrid STB, and TV         | NO                        |
|| |QT for BLE V5.1.1 OSS version              |                                                                                                      IP STB, Hybrid STB, and TV         | NO                        |
||| Core Thunder framework Version R2          |                                                                                                     IP STB, Hybrid STB, and TV         | NO                        |
|                             || Browser - WPEWebkit V2.28                  | IP STB, Hybrid STB, and TV         | NO                        |
|| Browser Engine | QT WebKit                                  | IP STB, Hybrid STB, and TV         | NO                        |
||| WebKit Pure Embedded integration            |                                                                                                      IP STB, Hybrid STB, and TV         | NO                        |
|| Connection Security                    | SSL/TLS                                                                                             | IP STB, Hybrid STB, and TV         | NO                        |
| |Plugins                                | WebRTC                                                                                              | IP STB, Hybrid STB, and TV         | NO                        |
| |Graphics                              | OpenGL ES                                                                                           | IP STB, Hybrid STB, and TV         | NO                        |
| |Rendering                           | ESSOS with Westeros                                                                                 | IP STB, Hybrid STB, and TV         | NO                        |
| **Gstreamer**                              | Gstreamer 1.18                                                                                     | IP STB, Hybrid STB, and TV         | NO                        |
| **Device Management**                       | Feature Control | Securing RFC parameters via encryption                                                              | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | RFC with Xconf rules                                                                                | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Firmware Download Enhancements   | Omit IP Address From Xconf Firmware Download Request                                                | IP STB, Hybrid STB, and TV         | NO                        |
|                                           | | Firmware Upgrade-SWUpdate with XConf and Webpa                                                    | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Logging | TFTP Log Upload, HTTP Log Upload                                                                    | IP STB, Hybrid STB, and TV         | Cloud Dependency          |
|                                            || Distribute (smear) logging uploads (dependent on XCONF Server)                                     | IP STB, Hybrid STB, and TV         | Cloud Dependency          |
|                                            | Memory Optimization                   | Use Flash/SD Card for Firmware Download Temporary Storage (CDL scratchpad)                          | IP STB, Hybrid STB, and TV         | Device Dependency         |
|                                            | Platform Enhancements   | Common WiFi HAL for RDK Video                                                                       | IP STB, Hybrid STB, and TV         | NO                        |
|                                           | | Converge to GCC V9.3x for all Yocto versions                                                       | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Power | Standby, Light Sleep                                                                                 | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | |Deep Sleep on IP Clients                                                                             | IP STB and TV                       | Device Dependency         |
|| Power Save                           | Supports ability to enable HDMI port while in standby mode                                          | IP STB, Hybrid STB, and TV         | Device Dependency         |
|                                            | Remote Management  | TR-069                                                                                              | IP STB, Hybrid STB, and TV         | Cloud Dependency          |
|                                            || WebPA (IP Clients)                                                                                  | IP STB                             | NO                        |
|                                            || WebPA (QAM Clients)                                                                                 | Hybrid STB                         | NO                        |
|                                            | |ssh (secure shell into the device)/ reverse ssh (send trigger to have device initiate ssh)         | IP STB, Hybrid STB, and TV         | Cloud Dependency          |
|                                            | |Feature Control (Remotely enable/disable individual features on devices without new code deployment) | IP STB, Hybrid STB, and TV         | Cloud Dependency          |
| |Resource Optimization                 | Improved handling of app termination/suspension conditions (based on available memory rather than concurrency) | IP STB, Hybrid STB, and TV         | NO                        |
|| Revenant                             | Persistent WiFi Enable/Disable                                                                       | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Self Healing   | Supports hardware self test                                                                          | IP STB, Hybrid STB, and TV         | Device Dependency         |
|                                           | |Thermal Monitoring and Shutdown                                                                      |\| IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Telemetry| Telemetry 2.0 (via WebPA)                                                                           |                                      | NO                        |
|                                            | |TR-181 Object Telemetry                                                                              | IP STB, Hybrid STB, and TV         | Cloud Dependency          |
|                                            | |IP Video Telemetry                                                                                  | IP STB, Hybrid STB, and TV         | NO                        |
|                              | WiFi Band & AP Steering             | Dual Band WiFi                                                                                       | IP STB and TV                       | NO                        |
| **Networking**| WAN IP                                    | eSTB IPv4                                                                                                     | IP STB, Hybrid STB, and TV         | NO                        |
|                                            || IPv6 for IP clients                                                                                            | IP STB, Hybrid STB, and TV         | NO                        |
| |LAN IP                                    | Auto IP, DHCP, Dual Virtual                                                                                   | Hybrid STB                         | NO                        |
|                                            | |Wi-Fi                                                                                                         | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | |LAN                                                                                                           | IP STB, Hybrid STB, and TV         | NO                        |
|                      | Wi-Fi                                     | WPA Enterprise (IP settop to use Wi-Fi 802.1x authentication) Ready                                           | IP STB and TV                      | Device Dependency          |
| **Ports/Peripherals**| Audio Output Ports                        | Bluetooth Audio Output Ready                                                                                  | IP STB, Hybrid STB, and TV         | Device Dependency          |
| |HDMI                                      | HDMI Out, HDCP Enforcement                                                                                     | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | |HDMI In                                                                                                       | TV                                  | Device Dependency          |
|                                            || HDMI Consumer Electronics Control (HDMI-CEC) Power Sync                                                      | IP STB, Hybrid STB, and TV         | NO                        |
|                                            || HDMI Switching (Combine CEC and HDMI Input features to enable advanced switching)                             | TV                                  | Device Dependency          |
|| USB                                       | WebRTC Camera Ready                                                                                            | IP STB, Hybrid STB, and TV         | Device Dependency          |
|                                            | |USB Port Detection and Control Ready                                                                           | IP STB, Hybrid STB, and TV         | Device Dependency          |
|                                            || USB Camera Support Ready                                                                                      | IP STB, Hybrid STB, and TV         | Device Dependency          |
|                                            || WebRTC HW acceleration for encode/decode to enhance performance                                               | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | |USB Filesystem Support                                                                                         | IP STB, Hybrid STB, and TV         | NO                        |
|                                          |  | USB Hot-plug                                                                                                  | IP STB, Hybrid STB, and TV         | NO                        |
|                                            | User Input | RF4CE remote                               | IP STB, Hybrid STB, and TV         | Device and Cloud Dependency |
|| |BLE voice remote                           |                                                                                               IP STB, Hybrid STB, and TV         | NO                        |
|| |External Audio support                     |                                                                                                IP STB, Hybrid STB, and TV         | Device Dependency          |
|| |IR Remote                                  |                                                                                                IP STB, Hybrid STB, and TV         | Device Dependency          |
| ||Voice Remote (RF4CE based) Ready          |                                                                                               | IP STB, Hybrid STB, and TV         | Device and Cloud Dependency |
|| Video Output Ports                         | HDMI                                                                                          | IP STB, Hybrid STB, and TV         | NO                        |
| **Apps**                                   | Streaming Apps                                                                                | YouTube V23 and Amazon Prime V4    | IP STB, Hybrid STB, and TV | Device Dependency          |
| **TV Settings**                            | Power, Standby                                                                                | |TV                                  | NO                        |
|                                            | LED                                                                                           | |TV                                  | NO                        |
|                                            | Zoom, aspect ratio                                                                           | |TV                                  | NO                        |
| **AQ/PQ**                                  | QoS                                                                                           | |TV                                  | NO                        |
| **Screen cast**                           | Application Casting & control                                                                 | DIAL V2.2.1                        | IP STB, Hybrid STB, and TV | NO                        |
| **UI/UX**                                  | Reference App                                                                                 || IP STB, Hybrid STB, and TV         | NO                        |
| **Gaming**                                 | HDMI-CEC DAL - Dynamic Auto Lipsync                                                           | |TV                                  | NO                        |
|                                            | Low Latency Game Mode for HDMI Input                                                          | |TV                                  | NO                        |
|                                            | Game Mode, Auto Low Latency Mode                                                              || TV                                  | NO                        |
|                                            | AQ/PQ                                                                                         | |TV                                  | Device dependency          |
| **Digital Assistant (Voice)**              | Alexa (Push to talk)                                                                          || IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Voice enabled Bluetooth remote                                                                | |IP STB, Hybrid STB, and TV         | NO                        |
|                                            | Voice Assistant                                                                                || IP STB, Hybrid STB, and TV         | Device dependency          |



