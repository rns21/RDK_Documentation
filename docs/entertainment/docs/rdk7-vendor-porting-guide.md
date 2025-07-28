# RDK7 Vendor Porting Guide

------------------------------------------------------------------------

This document helps vendors understand how to create a 
successful
port of RDK on their platform with the help of the HAL API Specification for different RDK Components, as well as how the port can be successfully certified. Depending on the device profile ( IP STB or IP TV
), vendors may choose the relevant components and perform the port by implementing the HAL layer.

Details of how to port third-party software stacks or applications to a SoC platform are out of the scope of this porting guide.

------------------------------------------------------------------------

# Version details

| RDK Version                                                                                   | Vendor Porting Kit Version                                                                 | Applicability         |
|-----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|------------------------|
| [RDK7 Release Notes](https://wiki.rdkcentral.com/display/RDK/RDK7+Release+Notes)<br>7         | [1.4.5](https://rdkcentral.github.io/rdk-hpk-documentation/)                                | IP STB, IP TV profiles |


------------------------------------------------------------------------

# Prerequisites

The vendor is expected to have certain prerequisites before proceeding to the porting process, which include:

-   **RDK device profile:**

    -   Decide on the profile by referring to the available RDK profiles ( IP STB or IP TV )
         and
        have
        a platform with the expected capabilities for the chosen profile. Depending on the device profile selected, the components that are required to be ported are available in the HAL table below. 

-   **RDK HAL API Source code access**
    :  
    -   The RDK source code is distributed across multiple source code repositories which are available in
        [RDK Central GitHub](https://github.com/rdkcentral)
        .

-   **Platform-specific Kernel:**

    -   It is highly recommended to use ACK for the target platform as RDK7 is recommended to run on top of ACK 5.15 64-bit version

------------------------------------------------------------------------

# Porting

The
[Hardware Porting Kit](https://rdkcentral.github.io/rdk-hpk-documentation/1.4.4.0/)
( HPK ) provide both Hardware Abstraction Layer (API) Header files, and software tests to ensure compatibility with the RDK Middleware Stack. HPK enables vendor to implement the required interfaces that will enable them to bring RDK on top of their platform. Once the HAL layer for each component is implemented, vendors can use the respective test component
to certify their port

The elaborated documentation on HAL APIs, the test suites and how to build and execute them are all available at the
[HPK Documentation portal](https://rdkcentral.github.io/rdk-hpk-documentation/1.4.4.0/)

For an exhaustive list of component versions, as well as test suite version for each of the HAL component, please refer below table

| #  | Component Name                                                                                     | HAL Interface Version                                                                 | Change Info                                                                                   | Previous                                                                 | HAL Testing Suite Version                                                | Change Info | Previous                                                                 |
|----|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------|-------------|---------------------------------------------------------------------------|
|    |                                                                                                     | **Current**                                                                            | **Change Info**                                                                                | **Previous**                                                              | **Current**                                                              | **Change Info** | **Previous**                                                              |
| 1  | [Deep Sleep Manager](https://github.com/rdkcentral/rdk-halif-deepsleep_manager)                    | No change                                                                             |                                                                                                | [1.0.4](https://github.com/rdkcentral/rdk-halif-deepsleep_manager/milestone/1)                 | No change                                                                |             | [1.3.0](https://github.com/rdkcentral/rdk-halif-test-deepsleep_manager/tree/1.3.0)                 |
| 2  | [Power Manager](https://github.com/rdkcentral/rdk-halif-power_manager)                              | No change                                                                             |                                                                                                | [1.0.3](https://github.com/rdkcentral/rdk-halif-power_manager/milestone/1)                     | No change                                                                |             | [1.4.0](https://github.com/rdkcentral/rdk-halif-test-power_manager/tree/1.4.0)                     |
| 3  | [Device Settings](https://github.com/rdkcentral/rdk-halif-device_settings/)                         | [4.1.2](https://github.com/rdkcentral/rdk-halif-device_settings/tree/4.1.2)           | [4.1.1...4.1.2](https://github.com/rdkcentral/rdk-halif-device_settings/compare/4.1.1...4.1.2) | [4.1.1](https://github.com/rdkcentral/rdk-halif-device_settings/tree/4.1.1)                   | No change                                                                |             | [3.5.0](https://github.com/rdkcentral/rdk-halif-test-device_settings/tree/3.5.0)                   |
| 4  | [HDMI CEC](https://github.com/rdkcentral/rdk-halif-hdmi_cec)                                        | [1.3.10](https://github.com/rdkcentral/rdk-halif-hdmi_cec/tree/1.3.10)                | [1.3.9...1.3.10](https://github.com/rdkcentral/rdk-halif-hdmi_cec/compare/1.3.9...1.3.10)       | [1.3.9](https://github.com/rdkcentral/rdk-halif-hdmi_cec/tree/1.3.9)                         | No change                                                                |             | [1.4.0](https://github.com/rdkcentral/rdk-halif-test-hdmi_cec/tree/1.4.0)                         |
| 5  | [RMF Audio Capture](https://github.com/rdkcentral/rdk-halif-rmf_audio_capture)                      | No change                                                                             |                                                                                                | [1.0.5](https://github.com/rdkcentral/rdk-halif-rmf_audio_capture/milestone/1)                 | No change                                                                |             | [1.4.0](https://github.com/rdkcentral/rdk-halif-test-rmf_audio_capture/tree/1.4.0)                 |
| 6  | [RDK-V TVSettings](https://github.com/rdkcentral/rdkv-halif-tvsettings)                             | No change                                                                             |                                                                                                | [2.1.0](https://github.com/rdkcentral/rdkv-halif-tvsettings/tree/2.1.0)                        | No change                                                                |             | [2.1.3](https://github.com/rdkcentral/rdkv-halif-test-tvsettings/tree/2.1.3)                       |
| 7  | [RDK-V WiFi](https://github.com/rdkcentral/rdkv-halif-wifi)                                         | No change                                                                             |                                                                                                | [2.0.0](https://github.com/rdkcentral/rdkv-halif-wifi/blob/2.0.0)                              | No change                                                                |             | [1.0.0](https://github.com/rdkcentral/rdkv-halif-test-wifi/blob/1.0.0)                             |
| 8  | [LibDRM](https://github.com/rdkcentral/rdk-halif-libdrm)                                            | No change                                                                             |                                                                                                | [1.0.0](https://github.com/rdkcentral/rdk-halif-libdrm/blob/1.0.0)                             | NYA                                                                      |             |                                                                           |
| 9  | [AvSync](https://github.com/rdkcentral/rdk-halif-avsync)                                            | No change                                                                             |                                                                                                | [1.0.0](https://github.com/rdkcentral/rdk-halif-avsync/blob/1.0.0)                             | NYA                                                                      |             |                                                                           |
| 10 | [V4L2](https://github.com/rdkcentral/rdk-halif-v4l2)                                                | No change                                                                             |                                                                                                | [1.0.0](https://github.com/rdkcentral/rdk-halif-v4l2/blob/1.0.0)                               | NYA                                                                      |             |                                                                           |


------------------------------------------------------------------------

# Certification

While the test suite associated with the vendor porting kit helps to certify the port is working as expected, RDK certification program facilitates users to get their product certified as an RDK compliance device.

RDKM provides the
[RDK Certification Suites](https://wiki.rdkcentral.com/display/TDK/RDK+Certification+Suites)
RDK Certification suite
 to verify the compliance of the RDK Video Accelerator device. The certification program includes testing that validates the RDK  stack on the user platform with a defined test suite called as RDK Certification Test Suite.  It is mandatory to go through this program in order to brand the user’s platform as an RDK-compliant product.
