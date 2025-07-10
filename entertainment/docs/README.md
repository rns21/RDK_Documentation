---
title: "RDK Documentation?"
description: "RDK is the software that helps run video, broadband, and IoT devices more efficiently by standardizing the software stacks that run on most TV set-top boxes, internet gateways, and IoT devices in the home"
hide:
  - navigation
  - toc
---
<div style="margin: auto; padding: 0px; text-align: center; font-family: Arial, sans-serif;">
  <h1 style="color: #607D8B;margin-top: 5px; margin-bottom: 10px;">Getting Started with RDK for Entertainment</h1>
</div>

---
<div style="display: flex; justify-content: center; gap: 5%; padding: 0px; flex-wrap: wrap;">

  <!-- First Message Box -->
  <div class="custom-box">
    <div style="font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">Architecture</h2>
      <p>
        The latest release of RDK6 comes with major changes in its architecture, including Firebolt - RDK's resident app platform - and the vendor porting kit - among other major changes. To know more details of the RDK Architecture, follow the below link
        <br><br>
        <a href="./architecture/">Click Here</a>
      </p>
    </div>
  </div>


  <!-- Second Message Box -->
  <div class="custom-box">
    <div style="font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">Features</h2>
      <p>
        A deciding factor of any software stack is the number of user centric features that are supported by that software.  To know what are the features supported by the RDK software stack for various target profiles, follow the below link
        <br><br>
        <a href="./tryoutrdkv/">Click Here</a>
      </p>
    </div>
  </div>

  
   <!-- First Message Box -->
  <div class="custom-box">
    <div style="font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">Device Profiles</h2>
      <p>
        From the fundamental RDK IP STB to the more sophisticated RDK TV, RDK offers a variety of device profiles: IP STB, Hybrid STB, and RDK TV. To know the details of core components available across profiles, as well as on the differentiating components, please follow below link
        <br><br>
        <a href="./deviceprofiles/">Click Here</a>
      </p>
    </div>
  </div>

  <!-- Second Message Box -->
  <div class="custom-box">
    <div style="font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">Try Out RDK</h2>
      <p>
        The best way to experience RDK is to try out RDK youself in a platform. Get yourself started in exploring RDK, by generating an RDK build of your own, and then getting it up on the popular generic reference platform Raspberry Pi 4
        <br><br>
        <a href="./tryoutrdkv/">Click Here</a>
      </p>
    </div>
  </div>

  
   <!-- First Message Box -->
  <div class="custom-box">
    <div style="font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">Vendor Porting Guide</h2>
      <p>
         If you are trying to bring up/ port RDK to your SOC platform, you can refer to the Hardware Porting Kit to understand the various HAL APIs that need to be implemented in order to complete the RDK Porting
        <br><br>
        <a href="./deviceprofiles/">Click Here</a>
      </p>
    </div>
  </div>

  <!-- Second Message Box -->
  <div class="custom-box">
    <div style="font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">RDK Components</h2>
      <p>
        To understand the architecture of each RDK component, how the component interfaces with other components as well as other layers of RDK, please follow the below link
        <br><br>
        <a href="./components/">Click Here</a>
      </p>
    </div>
  </div>

</div>

---
<h2 style="color: #009485;margin-top: 5px; margin-bottom: 10px;font-family: Arial, sans-serif;text-align:center;"> Need Help?</h2>
<p style="text-align:center">If you require support/have questions, you can always email the RDK Central support team to get help<p>
<div style="text-align: center; margin-top: 10px;">
  <a href="mailto:support@rdkcentral.com" style="display: inline-block; margin-top: 10px; padding: 10px 10px; background-color: var(--md-accent-fg-color); color: white !important; text-decoration: none; border-radius: 5px;">Get Support</a>

<style>
.md-content__button{
  display:none !important
}
.custom-box {
  width: 45%;
  overflow: hidden;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease;
  background-color: #f9f9f9;
  color: #000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Hover effect */
.custom-box:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

/* Support both common dark mode schemes */
html[data-md-color-scheme="slate"] .custom-box,
html[data-md-color-scheme="dark"] .custom-box {
  background-color: #1c1c1c;
  color: #ffffff;
}

/* Make heading inside custom box use theme's primary color */
.custom-box h2 {
  color: var(--md-default-fg-color);
  text-align: center;
  margin-top: 0;
}

/* Override for dark mode heading */
html[data-md-color-scheme="slate"] .custom-box h2,
html[data-md-color-scheme="dark"] .custom-box h2 {
  color: var(--md-default-fg-color);
}

/* Link styling */
.custom-box a {
  font-weight: bold;
  color: #607D8B;
  transition: color 0.3s ease;
}

/* Link color in dark mode */
html[data-md-color-scheme="slate"] .custom-box a,
html[data-md-color-scheme="dark"] .custom-box a {
  color: #90caf9;
}
/* ----------------------------
   Bottom Banner (Footer Ribbon)
---------------------------- */
.bottom-banner {
  background-color:var(--md-default-bg-color) !important;
  color: var(--md-default-fg-color) !important;
  padding: 2em;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  font-family: var(--md-text-font, Arial, sans-serif);
  margin-top: 3em;
  border-top: 0.1px solid var(--md-default-fg-color) !important;;
}
.banner-column {
  flex: 1 1 180px;
  margin: 1em;
  min-width: 150px;
  color: var(--md-default-fg-color) !important;
}
.banner-column h3 {
  font-size: 1.1em;
  border-bottom: 1px solid #ffffff44;
  padding-bottom: 0.3em;
  margin-bottom: 0.5em;
  color: var(--md-default-fg-color) !important;
}
.banner-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.banner-column ul li {
  margin: 0.4em 0;
}
.banner-column ul li a {
  color: var(--md-default-fg-color) !important;
  text-decoration: none;
  font-size: 0.95em;
}
.banner-column ul li a:hover {
  color: var(--md-default-fg-color) !important;
  text-decoration: underline;
}
/* Global heading color override for Markdown content */
.md-typeset h1,
.md-typeset h2,
.md-typeset h3,
.md-typeset h4,
.md-typeset h5,
.md-typeset h6 {
  /* color: #009485 !important; /* Your preferred heading color */
   color: var(--md-default-fg-color) !important;
   font-weight: bold;
   font-family: 'IBM Plex Sans', sans-serif !important;
} 
.md-typeset p {
   font-family: 'IBM Plex Sans', sans-serif !important;
} 
</style>

