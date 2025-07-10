# Preview RDK Broadband

------------------------------------------------------------------------

  

**RDK**

RDK is a fully modular, portable, and customizable open source software solution that standardizes core functions used in video, broadband, and IoT devices. Deployed on over a hundred million devices around the globe, RDK enables operators to manage devices and easily customize their UIs and apps, providing analytics to improve the customer experience. RDK is platform and operator agnostic, so it can easily be ported & adopted by multiple SoC/OEM/Operators, significantly reducing the time to market
. With over 600 companies, RDK has an active open source community that regularly contributes cutting edge technologies to the stack.

**RDK Broadband (RDK-B)**
software is capable of powering next-gen gateways across DOCSIS, PON, DSL, 5G, and Ethernet, enabling OEMs to standardize elements of their modems, gateways, and converged devices. It provides common functionalities such as routing, Wi-Fi, DNS, diagnostics, remote management, and IoT interfaces, such as Bluetooth, Thread, and Zigbee.

------------------------------------------------------------------------

# RDK Architecture

RDK middleware is powered by generic open source software along with RDK specific open source components. The RDK
Broadband middleware stack architecture is pictured below:

                                                                                                 
![rdkbarchitecture](./preview-rdk-broadband-images/rdkbarchitecture.png)

------------------------------------------------------------------------

# Implementing RDK

Getting started with RDK is easy. A simple image depicting adoption of RDK is below:

![rdk-b_porting](./preview-rdk-broadband-images/rdk-b_porting.png)

------------------------------------------------------------------------

# Broadband User Interface

WebUI is a graphical user interface that is available on connected devices. It acts as an application running on the RDK-B stack and performs the functions of a device management interface similar to TR69 & SNMP. Users can monitor and modify RDK-B feature settings/rules using WebUI. It is a client–server application: the client runs in a web browser (as part of devices connected over LAN) and Lighttpd on the RDK-B stack acts as server.

WebUi can be accessed by both the LAN clients and from the WAN Side.

**WebUI From WAN Side:**

Give 'http://&lt;WAN IP Address of RaspberryPi&gt;:8080' in browser.

-   Example: 
    [http://192.168.1.35:8080](http://192.168.1.35:8080)

If you use erouter0 IP, then it opens admin page

Login Credentials:

Username: admin  
Password: password

Once the login is successful, the user can verify and control various aspects of the Network Connection (like the SSID of the network, password of the network etc.).

![adminimage-png](./preview-rdk-broadband-images/adminimage-png)

**WebUI For LAN Clients**
:

In browser on the LAN client/machine give the url
[http://10.0.0.1](http://10.0.0.1)
to launch the
captive portal page.

![captiveportal-png](./preview-rdk-broadband-images/captiveportal-png)

------------------------------------------------------------------------

# Try Out RDK

# Further Reading

-   [RDK-B Raspberry Pi](https://wiki.rdkcentral.com/display/RDK/RDK-B+Raspberry+Pi)
-   [RDK-B R-Pi Build guide](https://wiki.rdkcentral.com/display/RDK/RDK-B+R-Pi+Build+guide)
-   [RDK Documentation](https://wiki.rdkcentral.com/display/RDK/RDK+Documentation)
-   [RDK Broadband Documentation](https://wiki.rdkcentral.com/display/RDK/RDK+Broadband+Documentation)
[rdk+faq](https://wiki.rdkcentral.com/display/RDK/RDK+FAQ)

```
.oc-documentation-card-s&#123;
position: relative;
flex-direction: column!important;
display: flex!important;
margin-block-end:1rem!important; display: flex;
align-items: center;
border: 0.1px solid \#d7d7d7;
box-shadow: 4px 2px 2px 0 rgba(128, 128, 128, 30);
margin-bottom: 0.5rem;
box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.1);
&#125;
.oc-documentation-card-s:hover&#123;border: 3px solid \#d7d7d7;&#125;
.support&#123;
position: relative;
flex-direction: column!important;
display: flex!important;
margin-block-end:1rem!important; display: flex;
border: 0.1px solid \#d7d7d7;
box-shadow: 4px 2px 2px 0 rgba(128, 128, 128, 30);
border-radius:30;
margin-bottom: 0.5rem;
align-items: center;
box-shadow: 2px 2px 6px 0 rgba(0, 0, 0, 0.1);
&#125;
```
