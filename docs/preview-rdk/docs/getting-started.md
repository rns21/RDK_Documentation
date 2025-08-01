---
hide:
  - toc
  - navigation
---

<div class="tab-container">
  <div class="tab-buttons">
    <button class="tab-button active" onclick="showTabs('entertainment', event)">Entertainment</button>
    <button class="tab-button" onclick="showTabs('connectivity', event)">Connectivity</button>
  </div>

  <div id="tab-entertainment" class="tab-content">
    <p>RDK is a fully modular, portable, and customizable open source software solution that standardizes core functions used in video, broadband, and IoT devices. Deployed on over a hundred million devices around the globe, RDK enables operators to manage devices and easily customize their UIs and apps, providing analytics to improve the customer experience. RDK is platform and operator agnostic, so it can easily be ported & adopted by multiple SoC/OEM/Operators, significantly reducing the time to market. With over 600 companies, RDK has an active open source community that regularly contributes cutting edge technologies to the stack.</p>
    <img alt="rdk_ux_home.png" src="../../images/rdk_ux_home.png">
    <p><strong>RDK for Entertainment </strong></p>
    <p> RDK middleware enables operators to add video streaming capabilities to their IP or hybrid devices. The latest version of the RDK Video software stack is designed to simplify app development and integration on any set-top device, while allowing companies to maintain complete control of their apps, device data, and customer experience. This is achieved through Firebolt™, the RDK application platform, which ensures compatibility with the latest app releases, eliminating the need for future updates. The seamless integration of global streaming apps provides operators with an easy path to offer subscribers today's most popular content.</p>
    <hr />
    <p><strong>Video User Interface Preview</strong></p>
    <p>The front end of any video device is the user interface that consumers will see. RDK comes with an open-source UI written in Lightning™, or you can create your own. To experience the RDK UI, watch the Video:  </p>
    <video width="640" height="480" controls>
      <source src="../../images/rdk-ui.mp4" type="video/mp4">
    </video>
    <p><strong>Try Out RDK</strong></p>
    <p>If you want to play around RDK, a port of RDK is available on the popular open source platform Raspberry Pi. A guide on how to bring up RDK for Entertainment in Raspberry Pi is available <a href="../../entertainment/docs/tryout_rdkv.md">here</a></p>
  </div>

  <div id="tab-connectivity" class="tab-content" >
    <h3>Preview RDK Broadband</h3>
    <p><strong>RDK Broadband (RDK-B) </strong> software is capable of powering next-gen gateways across DOCSIS, PON, DSL, 5G, and Ethernet, enabling OEMs to standardize elements of their modems, gateways, and converged devices. It provides common functionalities such as routing, Wi-Fi, DNS, diagnostics, remote management, and IoT interfaces, such as Bluetooth, Thread, and Zigbee.</p>
    <h4>RDK Architecture</h4>
    <p>RDK middleware is powered by generic open source software along with RDK specific open source components. The RDK Broadband middleware stack architecture is pictured below:</p>
    <img alt="rdk_ux_home.png" src="../../images/rdkbarchitecture.png">
    <h4>Implementing RDK</h4>
    <p>Getting started with RDK is easy. A simple image depicting adoption of RDK is below:</p>
    <img alt="rdk_ux_home.png" src="../../images/rdk-b_porting.png">
    <h4>Broadband User Interface</h4>
    <p>WebUI is a graphical user interface that is available on connected devices. It acts as an application running on the RDK-B stack and performs the functions of a device management interface similar to TR69 & SNMP. Users can monitor and modify RDK-B feature settings/rules using WebUI. It is a client–server application: the client runs in a web browser (as part of devices connected over LAN) and Lighttpd on the RDK-B stack acts as server.</p>
    <p>WebUi can be accessed by both the LAN clients and from the WAN Side.</p>
    <hr/>
    <h3>WebUI From WAN Side:</h3>
    <p>Give <code>http://&lt;WAN IP Address of RaspberryPi&gt;:8080</code> in browser.</p>
    <p>Example: If you use erouter0 IP, then it opens admin page</p>
    <p><strong>Login Credentials:</strong></p>
    <ol>
      <li>Username: admin</li>
      <li>Password: password</li>
    </ol>
    <p>Once the login is successful, the user can verify and control various aspects of the Network Connection (like the SSID of the network, password of the network etc.).</p>
    <img alt="admin-image.png" src="../../images/adminimage.png">
    <h3>WebUI For LAN Clients:</h3>
    <p>In browser on the LAN client/machine give the URL to launch the captive portal page.</p>
    <img alt="captive-portal.png" src="../../images/captiveportal.png">
    <hr />
    <h4>Try Out RDK</h4>
    <h4>Further Reading</h4>
    <ul>
      <li><a href="https://wiki.rdkcentral.com/display/RDK/RDK-B+Raspberry+Pi">RDK-B Raspberry Pi</a></li>
      <li><a href="https://wiki.rdkcentral.com/display/RDK/RDK-B+R-Pi+Build+guide">RDK-B R-Pi Build guide</a></li>
      <li><a href="https://wiki.rdkcentral.com/display/RDK/RDK+Broadband+Documentation">RDK Broadband Documentation</a></li>
      <li><a href="https://wiki.rdkcentral.com/display/RDK/RDK+Documentation">RDK Documentation</a></li>
    </ul>
  </div>
</div>


