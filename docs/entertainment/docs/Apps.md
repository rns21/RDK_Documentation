<h1>Apps</h1>
<p>RDK video devices support a wide range of applications across OTT services, entertainment, gaming, utilities, and operator-specific functions, enhancing the end-user experience. Its secure app ecosystem enables operators and developers to deliver rich, interactive experiences on televisions and set-top boxes.
Developers can build apps that leverage RDK platform services, user interfaces, and device capabilities — including OTT streaming platforms (e.g., Netflix, YouTube), interactive or casual games, productivity tools, and operator-specific utilities for diagnostics and remote management.<br>
This ecosystem ensures that applications are secure, manageable, and optimized for performance, providing a consistent experience across RDK-based devices.</p>
<hr>
<h2>Why Apps Are Important in RDK</h2>
<p>Applications form a key part of the RDK experience, connecting operators, services, and end-users through interactive and personalized functionality.</p>
<ul>
<li><strong>OTT &amp; Entertainment</strong>: Deliver streaming content, live TV, and interactive media.</li>
<li><strong>Gaming &amp; Interactive Apps</strong>: Enable lightweight and immersive gaming experiences.</li>
<li><strong>Productivity &amp; Utilities</strong>: Provide tools for diagnostics, device management, and personalization.</li>
<li><strong>Operator Services</strong>: Offer exclusive applications and integrated third-party services.</li>
</ul>
<p>RDK ensures these applications are developed in a standardized, high-performance, and secure environment.</p>
<hr>
<h2>Supported App Types</h2>
<p>RDK supports multiple app types designed for different use cases and development workflows:</p>
<table>
<thead>
<tr>
<th><strong>App Type</strong></th>
<th><strong>Typical Use</strong></th>
<th><strong>Key Advantages</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Lightning™ Apps</strong></td>
<td>Interactive TV dashboards, live content guides, animated UIs</td>
<td>Smooth animations, lightweight, optimized for TV/STB, Thunder API access</td>
</tr>
<tr>
<td><strong>HTML5 / Web Apps</strong></td>
<td>OTT video players, operator portals, web-based games</td>
<td>Built with standard web technologies, easy deployment, flexible integration</td>
</tr>
<tr>
<td><strong>Native Apps</strong></td>
<td>High-performance gaming, decoding, or operator tools</td>
<td>Direct device access, maximum performance, ideal for resource-intensive apps</td>
</tr>
<tr>
<td><strong>Firebolt™ Apps</strong></td>
<td>Third-party onboarding, app store integration, lifecycle management</td>
<td>Standardized APIs, independent from RDK source, secure and managed runtime</td>
</tr>
</tbody>
</table>
<hr>
<h2>RDK App Frameworks</h2>
<p>RDK provides two major frameworks that enable app development and management — <strong>Firebolt™</strong> and <strong>Lightning™</strong>.</p>
<h3>Firebolt™</h3>
<p>Firebolt™ is the standardized runtime environment and lifecycle management framework for RDK applications. It provides APIs to onboard, launch, and manage HTML5 and native apps independently of the RDK source. Through Thunder integrations, Firebolt™ ensures consistent access to platform resources and system services.</p>
<p>https://rdkcentral.github.io/firebolt/apis/latest/Learn more →</a></p>
<h3>Lightning™</h3>
<p>Lightning™ is an open-source UI framework designed for fast, animated, and visually rich interfaces on TVs and STBs. It focuses on performance, lightweight rendering, and smooth transitions, enabling developers to create engaging user experiences with minimal resource overhead.</p>
<p>https://lightningjs.io/Learn more →</a></p>
<hr>
<h2>Key Features of the RDK App Framework</h2>
<ul>
<li>Develop and test applications without direct access to RDK source code.</li>
<li>Use standardized APIs to access platform resources and services.</li>
<li>Onboard, manage, and update apps using Firebolt™ and Thunder integrations.</li>
<li>Integrate third-party or operator app stores.</li>
<li>Secure, sandboxed runtime for all applications.</li>
<li>Consistent performance across RDK-based devices.</li>
</ul>
<div class="admonition note">
<p class="admonition-title">Note</p>
<p>RDK supports both Lightning™ and HTML5 apps. Operators can integrate app stores to provide users with a broader selection. Apps and stores should use <strong>Firebolt™ / RDKServices / Thunder APIs</strong> to interact with the platform and manage system resources.</p>
</div>
