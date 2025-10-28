# Apps
 
RDK video devices support a wide range of applications across OTT services, entertainment, gaming, utilities, and operator-specific functions, enhancing the end-user experience. Its secure app ecosystem enables operators and developers to deliver rich, interactive experiences on televisions and set-top boxes.
Developers can build apps that leverage RDK platform services, user interfaces, and device capabilities — including OTT streaming platforms (e.g., Netflix, YouTube), interactive or casual games, productivity tools, and operator-specific utilities for diagnostics and remote management.  
This ecosystem ensures that applications are secure, manageable, and optimized for performance, providing a consistent experience across RDK-based devices.
 
---
 
## Why Apps Are Important in RDK
 
Applications form a key part of the RDK experience, connecting operators, services, and end-users through interactive and personalized functionality.
 
- **OTT & Entertainment**: Deliver streaming content, live TV, and interactive media.  
- **Gaming & Interactive Apps**: Enable lightweight and immersive gaming experiences.  
- **Productivity & Utilities**: Provide tools for diagnostics, device management, and personalization.  
- **Operator Services**: Offer exclusive applications and integrated third-party services.  
 
RDK ensures these applications are developed in a standardized, high-performance, and secure environment.
 
---
 
## Supported App Types
 
RDK supports multiple app types designed for different use cases and development workflows:
 
| **App Type** | **Typical Use** | **Key Advantages** |
|---------------|------------------|---------------------|
| **Lightning™ Apps** | Interactive TV dashboards, live content guides, animated UIs | Smooth animations, lightweight, optimized for TV/STB, Thunder API access |
| **HTML5 / Web Apps** | OTT video players, operator portals, web-based games | Built with standard web technologies, easy deployment, flexible integration |
| **Native Apps** | High-performance gaming, decoding, or operator tools | Direct device access, maximum performance, ideal for resource-intensive apps |
| **Firebolt™ Apps** | Third-party onboarding, app store integration, lifecycle management | Standardized APIs, independent from RDK source, secure and managed runtime |

---
 
## RDK App Frameworks
 
RDK provides two major frameworks that enable app development and management — **Firebolt™** and **Lightning™**.
 
### Firebolt™
 
Firebolt™ is the standardized runtime environment and lifecycle management framework for RDK applications. It provides APIs to onboard, launch, and manage HTML5 and native apps independently of the RDK source. Through Thunder integrations, Firebolt™ ensures consistent access to platform resources and system services.
 
### Lightning™
 
Lightning™ is an open-source UI framework designed for fast, animated, and visually rich interfaces on TVs and STBs. It focuses on performance, lightweight rendering, and smooth transitions, enabling developers to create engaging user experiences with minimal resource overhead.
 

<div class="apps-boxes" style="display:flex;gap:5%;">
    <div class="custom-container" onclick="window.open('https://rdkcentral.github.io/firebolt/apis/latest/', '_blank')"style="min-width:45%">
        <div class="title_section">
           <span><img src="/assets/icons/firebolt-logo-small.png" style="width:20px;height:20px;margin-top:5px"></span>
           <h2>Firebolt</h2>
        </div>
        <div class="content-section">
           <p>Learn more about firebolt applications.</p>
           <div class="link-row">
               <a target="_blank" href="https://rdkcentral.github.io/firebolt/apis/latest/" class="custom-link">Know More</a>
               <span class="material-icons custom-icon-arrow">arrow_forward</span>
            </div>
        </div>
    </div>
    <div class="custom-container" onclick="window.open('https://lightningjs.io/', '_blank')" style="min-width:45%">
        <div class="title_section">
           <span><img src="/assets/icons/lightningjs-logo.png" style="width:20px;height:20px;margin-top:5px"></span>
           <h2>Lightning™</h2>
        </div>
        <div class="content-section">
           <p>Learn more about lightning applications.</p>
           <div class="link-row">
               <a target="_blank" href="https://lightningjs.io/" class="custom-link">Know More</a>
               <span class="material-icons custom-icon-arrow">arrow_forward</span>
            </div>
        </div>
    </div>
</div>

---
 
## Key Features of the RDK App Framework
 
- Develop and test applications without direct access to RDK source code.  
- Use standardized APIs to access platform resources and services.  
- Onboard, manage, and update apps using Firebolt™ and Thunder integrations.  
- Integrate third-party or operator app stores.  
- Secure, sandboxed runtime for all applications.  
- Consistent performance across RDK-based devices.
 
!!! note
    RDK supports both Lightning™ and HTML5 apps. Operators can integrate app stores to provide users with a broader selection. Apps and stores should use **Firebolt™ / RDKServices / Thunder APIs** to interact with the platform and manage system resources.

---

