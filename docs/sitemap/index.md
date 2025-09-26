---
hide:
  - toc
  - navigation
---

<h1>Sitemap</h1>
<p style="text-align:center"><a href="/">Home</a></p>
<div id="sitemap-list-wrapper">
  <div id="sitemap-list" class="sitemap-grid" aria-live="polite"></div>
</div>

<script>
(function () {
  const sitemapURL = new URL(
    (window.location.origin + window.location.pathname).replace(/\/sitemap\/.*$/, '/sitemap.xml')
  );

  fetch(sitemapURL)
    .then(r => r.text())
    .then(txt => {
      const xml = new DOMParser().parseFromString(txt, 'application/xml');
      const urls = Array.from(xml.querySelectorAll('url > loc')).map(n => n.textContent);
      const grouped = {};

      urls.forEach(href => {
        const u = new URL(href);
        const parts = u.pathname.replace(/^\/|\/$/g, '').split('/');
        if (parts.length < 2) return; // Skip top-level like Home

        const category = parts[0];
        const label = decodeURIComponent(parts[parts.length - 1].replace(/[-_]/g, ' '));

        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({ label, href });
      });

      const container = document.getElementById('sitemap-list');
      Object.entries(grouped).forEach(([category, links]) => {
        const column = document.createElement('div');
        column.className = 'sitemap-column';

        const heading = document.createElement('h2');
        heading.textContent = category.charAt(0).toUpperCase() + category.slice(1).replace(/[-_]/g, ' ');
        column.appendChild(heading);

        const ul = document.createElement('ul');
        links
          .sort((a, b) => a.label.localeCompare(b.label))
          .forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.href;
            a.innerHTML = `${item.label.charAt(0).toUpperCase()+ item.label.slice(1).replace(/[-_]/g, ' ')}`;
            li.appendChild(a);
            ul.appendChild(li);
          });

        column.appendChild(ul);
        container.appendChild(column);
      });
    })
    .catch(err => {
      console.error('Failed to load sitemap.xml', err);
      document.getElementById('sitemap-list').textContent =
        'Could not load sitemap. Please try again later.';
    });
})();
</script>