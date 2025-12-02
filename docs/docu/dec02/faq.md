### How are RDK-V and RDK-E connected?

RDK-V ( RDK for Video devices ) is the legacy name. From RDK7 release( 2025 ), the RDK for Video devices are called RDK-E ( RDK for Entertainment ) to emphasise their role in Entertainment domain

### How widely adopted is RDK?

The community includes **600+ companies** and **100M+ devices** globally

### What business value does RDK deliver?

- **Speed to market:** Frequent releases and community contributions reduce development cycles.  
- **Control:** Own your UX, apps, telemetry, data, and deployment cadence.  
- **Choice of vendors:** Standard interfaces across SoCs and OEMs reduce lock‑in. 

### How do I download old versions of RDK?

Older versions of RDK can be downloaded by following the instructions in respective release's release notes. The details are available in our [Releases](https://wiki.rdkcentral.com/spaces/CMF/pages/16973991/RDK+Releases) page

### I am not an RDK licensee. Can I still try out RDK?

While it is highly recommended to sign up and get the free RDK License, you can still try out RDK without requiring to be a member.

- The open source code repositories are openly available at our [GitHub](https://github.com/rdkcentral) and our [Gerrit](https://code.rdkcentral.com)
- The documentation is openly available at [developer portal](https://developer.rdkcentral.com)

### Is there a pre-built RDK image available - which I can use directly in my device?

If you have a Raspberry Pi 4 device( for Video ) or a Banana Pi  P4 device ( for Broadband ), you can make use of the available pre-built image for these platforms
Note: You need a valid account in RDK Wiki. If you already do not have it, please create a new account at our [signup page](https://wiki.rdkcentral.com/signup.action)

- Go to [this page](https://rdkcentral.com/rdk-profiles/)
- Select the profile you need to try out ( Video or Broadband ). Follow the instructions in the page
- Once prompted with RDK wiki lgin , pleaese login

### Are there any publicly available boards/devices/platforms to try out RDK?

For video, a port of RDK is available for the popular hobby platform [Raspberry Pi 4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/). For broadband, a port of RDK is available in [Banana Pi R4](https://docs.banana-pi.org/en/BPI-R4/BananaPi_BPI-R4)

### How can I contribute to RDK Community?

You can contribute by

- Submitting code changes for feature addition/ enhancement/ bug fixes in RDK source code
- Test tool and test coverage additions
- Integation of new/superior components to the code base
- Improve documentation

**Note: Update link after Pradeepta finalizes on this**<br>
You can follow the guidelines at [here](https://wiki.rdkcentral.com/spaces/RDK/pages/370049268/How+to+Contribute) to know about our contribution process

### How can I add our custom component to the RDK-B stack?

Details of how to add a custom component, as well as how to interact with it using TR-181 data models are detailed in our [Integration guide](https://wiki.rdkcentral.com/spaces/RDK/pages/123896069/Integration+Guide+for+third-party+applications+into+RDK-B+stack)

### What is the process for adding data models to an existing RDK-B component to support a feature?

Details of how to add data models to a component is available in our [Integration guide](https://wiki.rdkcentral.com/spaces/RDK/pages/123896069/Integration+Guide+for+third-party+applications+into+RDK-B+stack)

### Is there a timeline available for the upcoming RDK releases?

The upcoming RDK release schedule is available at [here](https://wiki.rdkcentral.com/spaces/CMF/pages/71016852/Release+Schedule )

### I see RDK release is pre-certified for YouTube & Amazon. What does this mean?

YouTube and Amazon SDKs are integrated to the reference platform devices and are certified for the applicable features ( pre-certification ). However, there are still a set of features that need to be certified by the operator( after their integrations in the device going to field ) to claim fully certified by YouTube/ Amazon. The pre-certification in RDK reference platforms make sure that most of the heavy lifting for the App certification is already done as part of the integration and operators are left with only a part of the engineering requirements to achieve full certifications

### Is there a spec defined for platforms by RDK ?

Yes, a spec published for platform vendors is available as part of the [Vendor Porting Guide](https://developer.rdkcentral.com/documentation/documentation/rdk_video_documentation/rdk7/rdk7-vendor-porting-guide/) . SOC vendors can implement their platform HAL based on this specification.

### What are the different WAN types supported by RDK-B?

RDK, in general, is agnostic to WAN hardware. RDK has different WAN managers for each type of WAN ( DOCSIS, GPON, Cellular, EthWAN etc. ), so depending on your target platform capabilities, you can create an RDK-B image with the relevant WAN Manager included in the build

### Where can I find training materials?

RDK documentation is openly available at [developer portal](https://developer.rdkcentral.com). For preferred members, additional contents ( webinars, videos from summits and tech sessions ) are also available

### How to request for a new feature in RDK?

RDK - just like any other popular open source communities - always weigh the feature requests before deciding on the next steps. If you are a premium member ( refer our membership details [here](https://rdkcentral.com/memberships/) ) , you can raise a feature request in RDK JIRA - which will be evaluated by the RDK Technical Advisory Board(RTAB) for relevance , and based on the decision of RTAB, next steps will be taken. As a community, we highly encourage you to develop the feature and contribute back to community

### How does RDK handle OTA (Over-The-Air) updates, and what are the rollback mechanisms?

RDK do offer XConf based device upgrade mechanisms. However, please note that the actual logic to do the device upgrade is implemented by the OEM / Operator and the role of RDK is restricted in invoking those mechanisms in device properly

### What is RDK Certification? What do I need to do to get my device RDK Certified?

RDK Certification is offered by RDKM to ensure that the RDK port in a specific platform meets the RDK porting requirements. You can run the RDK Certification suite in your target platform, and once the results are satisfactory, send the results and devices across to RDKM - who will then repeat the exercise. Once the certification tests are done from RDKM side successfully, the device will be declared by RDKM as "RDK Certified". For more details please refer [this link](https://wiki.rdkcentral.com/spaces/TDK/pages/131729119/RDK+Certification+Suites)

### What are the remote device management facilities supported by RDK?

RDK supports the popular older protocols like SNMP, TR69, as well as the modern TR369 (USP ). The RDK in-house webPA protocol is also a popular optimal remote device management method within RDK deployments. On the server side, RDK has the XConf device management framework that is capable of performing device configurations, firmware upgrades etc.

### Can I integrate a GPLv3 open source softawre to RDK and use in deployments?

Users are free to integrate any component to the existing RDK releases, for their platforms. It is up to the user to check the legal implications of these integrations

### How to get compatible remote control devices for RDK based video devices?

RDKM publishes the compatible key code details [here](https://developer.rdkcentral.com/support/support/articles/remote_controls_architecture/) - which can be adopted for devices. Moreover, there are a few remote control devices that are out of the box compatible with RDK devices. The details of those RCU is available at [here](https://rdkcentral.com/certification/)

### Does RDK support DVB standard?

RDK as such doesnt restrict support for any broadcasting standard. However, a DVB stack is not part of the standard RDK release. Community members can integrate third party DVB stacks ( like DTVKit ) to RDK and use for their purposes

### Is there a migration framework available to migrate a non RDK device to RDK?

Migrating a non RDK device to RDK requires support from SOC vendor ( with SOC SDK ), OEM & Operator ( for bootloader, provisioning and OTA ). Currently a publicly available framework for the migration is not available. However, there are known migration efforts in RDK Community in this regard

~~### Is RDK fully compliant with WiFi 6 specifications?~~

~~While RDK stack supports WiFi 6 features, the actual WiFi compliance/certification is done by the SOC provider for the respective platform~~

~~### Does RDK has an associated App store with it?~~

~~### What are the App life cycle management (LCM) support available in RDK?~~

~~### How is security handled in RDK?~~

~~### Is there a feature coverage document available for RDK?~~

~~### Is there a list of open standards ( RFC, BBF etc. ) for which RDK is known to be compliant ?~~

~~### Is there a consolidated logging system like SYSLOG available?~~

~~Yes, all logs are maintained in persistent path (/opt/logs) by default. Log rotation feature is also available if log file size goes beyond a threshold~~

~~### Is there a way to try out RDK without a physical device?~~

~~RDK Community did had a PC Emulator version to try out RDK. This was phased out in favour of real devices and is now not actively maintained. The reference platforms for RDK include popularly available hobby circuit devices like Raspberry Pi or Banana Pi - which does provide a closer experience to a real world device, than a PC Emulator~~

~~### How are Firebolt & Lightning related?~~

~~Firebolt is a framework that exposes standardized set of interfaces for user applications to consume system resources and services. Lightning is a JavaScript based app development language that provides a lightweight, highly-efficient UI framework for app developers~~

~~Apps developed using Lightning will interact with Firebolt APIs to access system resources/services~~

~~### How to get a list of planned features for the upcoming releases?~~

~~A live document of the features planned for RDK8 ( the upcoming release in 2026 Q1) is available [here](https://wiki.rdkcentral.com/spaces/RDK/pages/404114984/RDK8+Feature+Integration) . Please note that this is a dynamic page and changes in feature list is expected to happen due to third party dependencies~~

~~### What are the recommended wifi mesh or extender devices that will work with RDK devices~~

~~RDK is a middleware stack and doesnt recommend a peripheral device for usage. However, adopters can easily integrate agent components of these peripheral devices ( if any ) to RDK, and make them work along their RDK devices~~

~~### How can I get RDK running on my SOC?~~

~~You can refer the [Vendor Porting Guide](https://developer.rdkcentral.com/documentation/documentation/rdk_video_documentation/rdk7/rdk7-vendor-porting-guide/) to know how to get RDK ported to your platform. Once you follow this to complete the vendor side implementatins, you can run the vendor test suite to make sure your vendor layer is meeting the certification expectations~~

~~### What are the system requirements for RDK to run?~~

~~The system requirements ( RAM, ROM capacities ) depends on the features and capabilities of the targeted device.~~

~~For e.g., an IP STB will need a minimum 256MB ROM and 512MB RAM for base RDK image, where as the RAM increases in 1GB if Premium streaming apps like Amazon/ YouTube are included. For a hybrid STB ( QAM + IP ), the requirements for base RDK itself will be higher~~

~~Similarly, a DOCSIS 3.0 gateway could run on 128MB ROM and 512MB RAM devices, whereas a DOCSIS 3.1 gateway device will need a 512MB RAM and ROM. Additional 3rd  party software stacks like Voice/MTA stacks can increase the resource requirements~~

~~In short, there is no single answer to the system requirements of RDK. Rather, the figure needs to be arrived depending on the feature requirements~~

