// Image Gallery Lightbox for Stills (use jQuery explicitly to avoid noConflict issues)
function openImageGalleryLightbox(images, title, $item, itemDataOpt) {
    // images: [{url, alt, width, height}, ...]
    if (!Array.isArray(images) || !images.length) return;

    jQuery('.films360-custom-lightbox').remove();

    var index = 0;
    var $lightbox = jQuery('<div class="films360-custom-lightbox" role="dialog" aria-modal="true" aria-label="Image lightbox">\
        <div class="lightbox-close" role="button" aria-label="Close">&times;</div>\
        <button class="lightbox-nav lightbox-prev" aria-label="Previous" type="button">&#10094;</button>\
        <button class="lightbox-nav lightbox-next" aria-label="Next" type="button">&#10095;</button>\
        <div class="lightbox-overlay" aria-hidden="true"></div>\
        <div class="lightbox-content">\
            <div class="lightbox-image-wrap"><img class="lightbox-image" alt="" /></div>\
            <div class="lightbox-meta" aria-hidden="false">\
                <h3 class="lightbox-title">' + (title || 'Gallery') + '</h3>\
                <div class="lightbox-submeta"></div>\
            </div>\
        </div>\
    </div>');

    jQuery('body').append($lightbox);
    setTimeout(function(){ $lightbox.addClass('active'); }, 10);

    function render(i) {
        if (i < 0) i = images.length - 1;
        if (i >= images.length) i = 0;
        index = i;
        var img = images[index];
        var $img = $lightbox.find('.lightbox-image');
        $img.attr('src', img.url || '').attr('alt', img.alt || '');
        // Build stills sub-meta (match video lightbox styles)
        // Local safe resolver to avoid dependency on missing global helper due to minification/caching
        var _usedLocalResolver = false;
        var safeResolvePostId = (typeof resolvePostIdForItem === 'function') ? resolvePostIdForItem : function($it, t){
            _usedLocalResolver = true;
            try {
                var pd = (typeof Films360ChildVars !== 'undefined') ? Films360ChildVars.portfolio_data : null;
                if (!pd) return null;
                // Try link slug first
                try {
                    var href = $it && $it.find ? ($it.find('a').first().attr('href') || '') : '';
                    if (href) {
                        var u = document.createElement('a'); u.href = href;
                        var parts = (u.pathname || '').split('/').filter(Boolean);
                        var slug = parts.length ? parts[parts.length - 1] : null;
                        if (slug) {
                            for (var id in pd) {
                                if (!pd.hasOwnProperty(id)) continue;
                                var d = pd[id] || {};
                                if ((d.slug && d.slug === slug) || (d.permalink && d.permalink.indexOf('/' + slug + '/') !== -1)) {
                                    return String(id);
                                }
                            }
                        }
                    }
                } catch(e){}
                // Fallback by normalized title
                var nTitle = (t || '').toString().toLowerCase().trim();
                for (var id2 in pd) {
                    if (!pd.hasOwnProperty(id2)) continue;
                    var d2 = pd[id2] || {};
                    if (((d2.title || '').toString().toLowerCase().trim()) === nTitle) {
                        return String(id2);
                    }
                }
            } catch(e){}
            return null;
        };
        var postId = safeResolvePostId($item, title);
        try { console.log('[LB stills resolver]', _usedLocalResolver ? 'local-fallback' : 'global', 'postId=', postId, 'title=', title); } catch(e){}
        var data = null;
        var sub = '';
        var credits = [];
        // Helper: resolve International Production Company from various possible keys
        function resolveIntl(obj) {
            if (!obj) return '';
            var cand = [
                'international_production_company',
                'int_production_company',
                'intl_production_company',
                'int_prod_company',
                'international_company',
                'international_prod_company',
                'intl_company',
                'prod_company_international',
                'production_company_international'
            ];
            for (var i = 0; i < cand.length; i++) {
                var k = cand[i];
                if (obj[k]) return obj[k];
            }
            // Soft scan for any key containing both 'prod' and 'company' and either 'int' or 'international'
            try {
                for (var key in obj) {
                    if (!obj.hasOwnProperty(key)) continue;
                    var low = String(key).toLowerCase();
                    if ((low.indexOf('prod') !== -1 || low.indexOf('production') !== -1) &&
                        low.indexOf('company') !== -1 &&
                        (low.indexOf('international') !== -1 || low.indexOf('intl') !== -1 || low.indexOf('int_') !== -1)) {
                        if (obj[key]) return obj[key];
                    }
                }
            } catch(e) {}
            return '';
        }
        // Prefer already resolved item data if provided
        if (itemDataOpt) {
            try {
                var d0 = (itemDataOpt && itemDataOpt.data) ? itemDataOpt.data : (itemDataOpt || {});
                var intl0 = resolveIntl(d0);
                // Backfill International Production Company if missing in itemDataOpt
                if (!intl0) {
                    try {
                        if (postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
                            var dLoc = Films360ChildVars.portfolio_data[postId] || null;
                            var dLoc2 = (dLoc && dLoc.data) ? dLoc.data : (dLoc || {});
                            intl0 = resolveIntl(dLoc2) || intl0;
                        }
                        if (!intl0) {
                            var domIntl0 = ($item.find('.films360-item-description').first().text() || '').trim();
                            if (domIntl0) intl0 = domIntl0;
                        }
                    } catch(e){}
                }
                try { console.log('[LB stills itemDataOpt]', { title: title, intl0: intl0, sa_service_co: d0.sa_service_co, photographer: d0.photographer }); } catch(e) {}
                var credits0 = [];
                if (intl0) credits0.push('<span class="lb-credit-item"><span class="lb-credit-label">International Production Company</span> ' + intl0 + '</span>');
                if (d0.director) credits0.push('<span class="lb-credit-item"><span class="lb-credit-label">Director:</span> ' + d0.director + '</span>');
                if (d0.photographer) credits0.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Photographer</span> ' + d0.photographer + '</span>');
                if (d0.agency) credits0.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Agency</span> ' + d0.agency + '</span>');
                if (d0.sa_service_co) credits0.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">SA Service Company</span> ' + d0.sa_service_co + '</span>');
                if (credits0.length) sub += '<div class="lightbox-credits">' + credits0.join(' \u2022 ') + '</div>';
            } catch(e) {}
        } else if (postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
            data = Films360ChildVars.portfolio_data[postId] || null;
            // Support both nested .data and top-level structures
            var d = (data && data.data) ? data.data : (data || {});
            // Support alternate ACF keys for International Production Company
            var intlCo = resolveIntl(d);
            try { console.log('[LB stills] postId=', postId, 'title=', title, 'intlCo=', intlCo, 'sa_service_co=', d.sa_service_co, 'photographer=', d.photographer); } catch(e) {}
            if (intlCo) {
                credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">International Production Company</span> ' + intlCo + '</span>');
            }
            if (d.director) {
                credits.push('<span class="lb-credit-item"><span class="lb-credit-label">Director:</span> ' + d.director + '</span>');
            }
            if (d.photographer) {
                credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Photographer</span> ' + d.photographer + '</span>');
            }
            if (d.agency) {
                credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Agency</span> ' + d.agency + '</span>');
            }
            if (d.sa_service_co) {
                credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">SA Service Company</span> ' + d.sa_service_co + '</span>');
            }
            if (credits.length) sub += '<div class="lightbox-credits">' + credits.join(' \u2022 ') + '</div>';
        } else {
            // As an extra fallback, try to glean from DOM
            try {
                var domIntl = ($item.find('.films360-item-description').first().text() || '').trim();
                var domAgency = ($item.find('.films360-agency').first().text() || '').trim();
                var domSA = ($item.find('.films360-service-co').first().text() || '').trim();
                var domPhotog = ($item.find('.films360-photographer').first().text() || '').trim();
                try { console.log('[LB stills fallback] title=', title, 'domIntl=', domIntl, 'domAgency=', domAgency, 'domSA=', domSA, 'domPhotog=', domPhotog); } catch(e) {}
                if (domIntl) {
                    credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">International Production Company</span> ' + domIntl + '</span>');
                }
                if (domPhotog) {
                    credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Photographer</span> ' + domPhotog + '</span>');
                }
                if (domAgency) {
                    credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Agency</span> ' + domAgency + '</span>');
                }
                if (domSA) {
                    credits.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">SA Service Company</span> ' + domSA + '</span>');
                }
                if (credits.length) {
                    sub += '<div class=\"lightbox-credits\">' + credits.join(' \u2022 ') + '</div>';
                }
            } catch(e) {}
        }

        // Final robustness: if still empty, try merging any available data sources (itemDataOpt + localized by postId + title search)
        try {
            if (!sub || sub.trim() === '') {
                var merged = {};
                var pick = function(obj){ if (!obj) return; try { for (var k in obj) { if (obj.hasOwnProperty(k) && (merged[k] == null || merged[k] === '')) merged[k] = obj[k]; } } catch(e){} };
                var fromItem = (itemDataOpt && itemDataOpt.data) ? itemDataOpt.data : (itemDataOpt || null);
                pick(fromItem);
                if (!fromItem && postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
                    var pd1 = Films360ChildVars.portfolio_data[postId];
                    pick((pd1 && pd1.data) ? pd1.data : pd1);
                }
                if (!merged.sa_service_co || !merged.photographer) {
                    // title-based fallback search
                    try {
                        var pd = (typeof Films360ChildVars !== 'undefined') ? Films360ChildVars.portfolio_data : null;
                        if (pd) {
                            var nTitle = (title || '').toString().toLowerCase().trim();
                            for (var id in pd) {
                                if (!pd.hasOwnProperty(id)) continue;
                                var d3 = pd[id] || {};
                                var t3 = (d3.title || '').toString().toLowerCase().trim();
                                if (t3 === nTitle) { pick((d3 && d3.data) ? d3.data : d3); break; }
                            }
                        }
                    } catch(e){}
                }
                var intlF = resolveIntl(merged);
                var creditsF = [];
                if (intlF) creditsF.push('<span class="lb-credit-item"><span class="lb-credit-label">International Production Company</span> ' + intlF + '</span>');
                if (merged.director) creditsF.push('<span class="lb-credit-item"><span class="lb-credit-label">Director:</span> ' + merged.director + '</span>');
                if (merged.photographer) creditsF.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Photographer</span> ' + merged.photographer + '</span>');
                if (merged.agency) creditsF.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">Agency</span> ' + merged.agency + '</span>');
                if (merged.sa_service_co) creditsF.push('<span class=\"lb-credit-item\"><span class=\"lb-credit-label\">SA Service Company</span> ' + merged.sa_service_co + '</span>');
                if (creditsF.length) sub += '<div class=\"lightbox-credits\">' + creditsF.join(' \u2022 ') + '</div>';
            }
        } catch(e) {}

        try { console.log('[LB stills inject] title=', title, 'sub.length=', (sub||'').length, 'html=', sub); } catch(e){}
        $lightbox.find('.lightbox-submeta').html(sub);
    }

    function navigate(delta) { render(index + delta); }

    $lightbox.on('click', '.lightbox-close, .lightbox-overlay', function(){
        $lightbox.removeClass('active');
        setTimeout(function(){ $lightbox.remove(); }, 200);
    });
    $lightbox.on('click', '.lightbox-prev', function(e){ e.stopPropagation(); navigate(-1); });
    $lightbox.on('click', '.lightbox-next', function(e){ e.stopPropagation(); navigate(1); });
    jQuery(document).on('keydown.films360ImageLightbox', function(ev){
        if (!$lightbox.length) return;
        if (ev.key === 'Escape') { $lightbox.find('.lightbox-close').trigger('click'); }
        if (ev.key === 'ArrowLeft') { navigate(-1); }
        if (ev.key === 'ArrowRight') { navigate(1); }
    });

    render(0);
}
/* Visual Portfolio Custom JavaScript for 360 Films - NATIVE VISUAL PORTFOLIO SUPPORT */
/* Focus: Work WITH Visual Portfolio's native functionality + Kadence colors + optimized hover video */

jQuery(document).ready(function($){

    console.log('360 Films Portfolio JavaScript Loading (Native VP Support + Kadence Colors)...');

    // Handle anchor links with offset for sticky header
    function handleAnchorLinks() {
        // Get header element and calculate height
        const header = document.querySelector('.kadence-sticky-header');
        // Use exact header height (147px for desktop) with fallback to measured height
        const headerHeight = header ? (window.innerWidth >= 1024 ? 147 : header.offsetHeight) : 100;
        // Include WP admin bar if present
        const adminBar = document.getElementById('wpadminbar');
        const adminBarHeight = (adminBar && adminBar.offsetHeight) ? adminBar.offsetHeight : 0;
        // Add extra padding so the section title above the anchor is visible
        const extraPad = window.innerWidth >= 1024 ? 100 : 70;
        const offset = headerHeight + adminBarHeight + extraPad;

        // Function to scroll to target element with offset (prefer the nearest heading above the target)
        function scrollToTarget(targetId) {
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            let scrollEl = targetElement;
            try {
                // Search upwards for the closest previous heading sibling or an ancestor's previous heading
                const isHeading = (el) => el && /^H[1-6]$/.test(el.tagName);
                let probe = targetElement;
                let found = null;
                for (let depth = 0; depth < 5 && probe && !found; depth++) {
                    let prev = probe.previousElementSibling;
                    let steps = 0;
                    while (prev && steps < 20 && !found) {
                        if (isHeading(prev)) { found = prev; break; }
                        // If sibling contains a heading as its first child, use that
                        const innerH = prev.querySelector && prev.querySelector('h1, h2, h3, h4, h5, h6');
                        if (innerH) { found = innerH; break; }
                        prev = prev.previousElementSibling; steps++;
                    }
                    if (!found) probe = probe.parentElement;
                }
                if (found) scrollEl = found;
            } catch(e) {}

            const elementPosition = scrollEl.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }

        // Function to handle smooth scroll with offset
        function scrollToAnchor(event) {
            // Only handle links that point to the current page
            if (this.getAttribute('href').startsWith('#')) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                scrollToTarget(targetId);
                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        }

        // Add click event to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', scrollToAnchor);
        });

        // Handle page load with hash (both direct and cross-page) with retries
        function handleHashOnLoad() {
            if (!window.location.hash) return;
            var hash = window.location.hash;
            var delays = [0, 100, 250, 500, 800, 1200];
            for (var i = 0; i < delays.length; i++) {
                (function(d){ setTimeout(function(){ scrollToTarget(hash); }, d); })(delays[i]);
            }
        }

        // Run on initial load
        handleHashOnLoad();

        // Also run when the page is fully loaded (including all resources)
        window.addEventListener('load', handleHashOnLoad);
        // Run on bfcache restore (cross-page navigations)
        window.addEventListener('pageshow', handleHashOnLoad);
        // Run when hash changes (e.g., cross-page link finishes loading)
        window.addEventListener('hashchange', handleHashOnLoad);

        // And run after any AJAX content loads
        document.addEventListener('wpAjaxContentLoaded', handleHashOnLoad);
    }

    // Run on document ready and after any AJAX content loads
    document.addEventListener('DOMContentLoaded', handleAnchorLinks);
    document.addEventListener('wpAjaxContentLoaded', handleAnchorLinks); // For AJAX-loaded content

    // Configuration - OPTIMIZED
    var config = {
        hoverDelay: 30,             // Faster response on hover
        leaveDelay: 80,             // Slightly longer to avoid flicker on small slips
        videoStartTime: 4,          // Start video ~4 seconds in to reduce seek latency
        preloadVideos: true,        // Enable viewport-based preloading
        maxPreload: 12,             // Warm more items like modern hover grids
        preloadRootMargin: '400px', // Preload ahead of scroll
        transitionSpeed: 100,       // Fast transitions
        respectNativeVP: false      // Force custom lightbox for reliable outro suppression testing
    };

    // Initialize all functionality
    function initFilms360Portfolio() {
        console.log('Initializing 360 Films Portfolio (Native VP Support + Kadence Colors)...');

        // Wait for Visual Portfolio to fully initialize
        waitForVisualPortfolio(function() {
            // Add custom fields to portfolio items (permanently visible)
            addCustomFieldsToPortfolioItems();
            // Ensure entire card is clickable via full-card overlay link
            ensureFullCardAnchor();
            // Backfill video URLs from anchors if missing (robustness)
            backfillVideoUrlFromAnchors();

            // [DISABLED] Initialize optimized hover-to-play video functionality
            // initOptimizedHoverToPlayVideo();

            // Initialize lightbox functionality (work with VP's native lightbox)
            initLightboxFunctionality();

            if (typeof initFilterAccessibilityOnly === 'function') {
                initFilterAccessibilityOnly();
            } else {
                try { console.warn('initFilterAccessibilityOnly is not defined'); } catch(e) {}
            }
            enhanceAccessibility();

            // Ensure cards expand to fit content
            ensureCardContentHeight();

            // Watch for VP DOM updates (filters/loads) and re-apply fields
            observePortfolioChanges();

            console.log('360 Films Portfolio initialized (Native VP Support + Kadence Colors)');
        });
    }

    // Fallback: infer video URLs directly from anchors if ACF/localized data missing
    function backfillVideoUrlFromAnchors() {
        var updated = 0;
        $('.vp-portfolio__item').each(function() {
            var $item = $(this);
            // Do not assign video URLs to stills-only items
            if ($item.hasClass('is-stills')) return;
            if ($item.data('video-url')) return;
            var href = ($item.find('a[href*="vimeo.com/"]').first().attr('href')) || '';
            if (!href) return;
            var vId = extractVimeoId(href);
            if (vId) {
                var vurl = 'https://vimeo.com/' + vId;
                $item.attr('data-video-url', vurl);
                $item.attr('data-vimeo-id', vId);
                $item.addClass('has-video');
                updated++;
            }
        });
        if (updated) {
            console.log('Backfilled video URLs from anchors for', updated, 'items');
        }
    }

    // Wait for Visual Portfolio to fully initialize
    function waitForVisualPortfolio(callback) {
        var attempts = 0;
        var maxAttempts = 50; // 5 seconds max wait

        function checkVP() {
            attempts++;

            // Check if Visual Portfolio is loaded and portfolio items exist
            if ($('.vp-portfolio__items').length > 0 && $('.vp-portfolio__item').length > 0) {
                console.log('Visual Portfolio detected and ready');
                callback();
                return;
            }

            if (attempts < maxAttempts) {
                setTimeout(checkVP, 100);
            } else {
                console.log('Visual Portfolio not detected, proceeding anyway');
                callback();
            }
        }

        checkVP();
    }

    // Helpers to robustly resolve a post ID for a VP item (stable even if title changes)
    function normalizeTitle(str) {
        return (str || '').toString().toLowerCase().trim().replace(/\s+/g, ' ');
    }
    function getItemHrefSlug($item) {
        try {
            var href = $item.find('a').first().attr('href') || '';
            if (!href) return null;
            // Extract last non-empty path segment as slug
            var u = document.createElement('a');
            u.href = href;
            var parts = (u.pathname || '').split('/').filter(Boolean);
            return parts.length ? parts[parts.length - 1] : null;
        } catch (e) { return null; }
    }
    function resolvePostIdForItem($item, title) {
        var pd = (typeof Films360ChildVars !== 'undefined') ? Films360ChildVars.portfolio_data : null;
        if (!pd) return null;

        // 1) From attributes
        var pid = $item.data('post-id') || $item.attr('data-id');
        if (!pid) {
            // 2) From class names like post-123, item-123, portfolio-123
            var classes = ($item.attr('class') || '');
            var m = classes.match(/(?:post|item|portfolio)[-_](\d+)/);
            if (m && m[1]) pid = m[1];
        }
        if (pid && pd[pid]) return String(pid);

        // 3) From slug in link
        var slug = getItemHrefSlug($item);
        if (slug) {
            for (var id in pd) {
                if (!pd.hasOwnProperty(id)) continue;
                var d = pd[id] || {};
                if ((d.slug && d.slug === slug) || (d.permalink && d.permalink.indexOf('/' + slug + '/') !== -1)) {
                    return String(id);
                }
            }
        }

        // 4) Fallback by normalized title (legacy)
        var nTitle = normalizeTitle(title);
        for (var id2 in pd) {
            if (!pd.hasOwnProperty(id2)) continue;
            var d2 = pd[id2] || {};
            if (normalizeTitle(d2.title) === nTitle) {
                return String(id2);
            }
        }
        return null;
    }

    // Hide Visual Portfolio outro overlays globally (including dynamically inserted ones)
    function hideOutroNodes(root) {
        try {
            var scope = (root && root.querySelectorAll) ? root : document;
            var selectors = [
                '.vp-outro-wrapper',
                '.vp-outro',
                '[class*="vp-outro"]',
                '[class*="Outro_module_outroWrapper"]',
                '[class*="outroWrapper"]',
                '[class*="Outro"]',
                '[class*="outro"]'
            ];
            var nodes = scope.querySelectorAll(selectors.join(','));
            if (!nodes || !nodes.length) return;
            nodes.forEach(function(el){
                try {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                    el.style.setProperty('opacity', '0', 'important');
                    el.style.setProperty('pointer-events', 'none', 'important');
                } catch(e) {}
            });
        } catch(e) {}
    }

    function observeAndHideOutros() {
        try { hideOutroNodes(document); } catch(e) {}
        try {
            if (!document.body) return;
            var observer = new MutationObserver(function(mutations){
                try {
                    mutations.forEach(function(m){
                        if (!m.addedNodes || !m.addedNodes.length) return;
                        m.addedNodes.forEach(function(node){
                            if (node && node.nodeType === 1) {
                                hideOutroNodes(node);
                            }
                        });
                    });
                } catch(e) {}
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } catch(e) {}
    }

    // Start observing as soon as DOM is ready
    (function(){
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observeAndHideOutros);
        } else {
            observeAndHideOutros();
        }
    })();

    // --- Vimeo + Hover helpers (missing implementations restored) ---
    function ensureVimeoPlayerAPI(cb) {
        try {
            if (window.Vimeo && window.Vimeo.Player) { cb && cb(); return; }
            if (document.getElementById('vimeo-player-api')) {
                // Poll until available
                var tries = 0; var t = setInterval(function(){
                    tries++;
                    if (window.Vimeo && window.Vimeo.Player) { clearInterval(t); cb && cb(); }
                    if (tries > 100) { clearInterval(t); cb && cb(); }
                }, 50);
                return;
            }
            var s = document.createElement('script');
            s.id = 'vimeo-player-api';
            s.src = 'https://player.vimeo.com/api/player.js';
            s.async = true;
            s.onload = function(){ cb && cb(); };
            document.head.appendChild(s);
        } catch(e) { try { cb && cb(); } catch(_) {} }
    }
    function extractVimeoId(url) {
        try {
            if (!url) return null;
            var u = String(url);
            // Grab the LAST numeric segment in the path to handle showcase/album/channel URLs
            // Examples handled:
            // - https://vimeo.com/123456789
            // - https://player.vimeo.com/video/123456789
            // - https://vimeo.com/showcase/111222333/video/123456789
            // - https://vimeo.com/channels/staffpicks/123456789
            var path = u.replace(/^https?:\/\//, '').split('?')[0];
            var segs = path.split('/');
            for (var i = segs.length - 1; i >= 0; i--) {
                if (/^\d+$/.test(segs[i])) return segs[i];
            }
            // Fallback: any digits in URL
            var m = u.match(/(\d{7,})/);
            return m ? m[1] : null;
        } catch (e) { return null; }
    }

    function getOptimizedVimeoEmbedUrl(vimeoId, mutedPreload) {
        // mutedPreload=true => warm iframe without autoplay; false => allow autoplay for hover
        var params = {
            autoplay: mutedPreload ? 0 : 1,
            muted: 1, // required for autoplay on most browsers
            loop: 0,
            autopause: 1,
            playsinline: 1,
            transparent: 0,
            controls: 1,
            title: 0,
            byline: 0,
            portrait: 0,
            badge: 0,
            dnt: 1
        };
        var q = Object.keys(params).map(function(k){ return k + '=' + encodeURIComponent(params[k]); }).join('&');
        return 'https://player.vimeo.com/video/' + vimeoId + '?' + q;
    }

    // Build an iframe embed for a given video URL (supports Vimeo URLs)
    function getVideoEmbed(videoUrl) {
        try {
            if (!videoUrl) return '';
            // If it's a Vimeo URL, normalize to player embed with minimized UI
            var vId = extractVimeoId(videoUrl);
            if (vId) {
                var config = {
                    respectNativeVP: false,
                    autoplayMuted: false
                };
                var params = {
                    autoplay: 1, // request autoplay; allowed due to user click opening lightbox
                    muted: 0, // play with sound as requested
                    loop: 0,
                    autopause: 1,
                    playsinline: 1,
                    transparent: 0,
                    controls: 1,   // restore native controls
                    title: 0,      // hide title
                    byline: 0,     // hide byline
                    portrait: 0,   // hide portrait
                    badge: 0,      // hide badge/user info
                    dnt: 1
                };
                var query = Object.keys(params).map(function(k){ return k + '=' + encodeURIComponent(params[k]); }).join('&');
                var embedSrc = 'https://player.vimeo.com/video/' + vId + '?' + query;
                return '<div class="films360-embed-wrap"><iframe src="' + embedSrc + '" width="1280" height="720" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen playsinline loading="lazy"></iframe></div>';
            }
            // Fallback: return a simple link if unknown
            return '<a class="films360-video-link" href="' + String(videoUrl) + '" target="_blank" rel="noopener">Open video</a>';
        } catch (e) {
            return '';
        }
    }

    // Try to programmatically start playback on Vimeo iframe
    function tryStartVimeo($container) {
        try {
            var $iframe = $container.find('iframe');
            if (!$iframe.length) return;
            var iframe = $iframe.get(0);
        // Ensure required attributes for autoplay/inline and controls reliability
        try {
            $iframe.attr('allow', 'autoplay; fullscreen; picture-in-picture');
            $iframe.attr('allowfullscreen', '');
            $iframe.attr('playsinline', '');
            $iframe.attr('webkit-playsinline', '');
        } catch(e) {}
            // PostMessage play command (Vimeo Player API)
            iframe.contentWindow && iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
            // As a fallback, bind click-to-play on container
            $container.off('click.films360play').on('click.films360play', function() {
                try {
                    // Unmute and set volume on user interaction, then play
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage(JSON.stringify({ method: 'setMuted', value: false }), '*');
                        iframe.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 1 }), '*');
                        iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
                    }
                } catch(e) {}
            });
        } catch (e) { /* silent */ }
    }

    // Bind minimal Vimeo events (no custom controls). Suppress Vimeo outro by pre-end rewind and on end.
    function bindLightboxControls($lightbox) {
        var $videoWrap = $lightbox.find('.lightbox-video');
        var $iframe = $videoWrap.find('iframe');
        if (!$iframe.length) return;
        var iframe = $iframe.get(0);
        try {
            $iframe.attr('allow', 'autoplay; fullscreen; picture-in-picture');
            $iframe.attr('allowfullscreen', '');
            $iframe.attr('playsinline', '');
            $iframe.attr('webkit-playsinline', '');
        } catch(e) {}

        ensureVimeoPlayerAPI(function(){
            var player = $iframe.data('vimeoPlayer');
            if (!player && window.Vimeo && window.Vimeo.Player) {
                try { player = new window.Vimeo.Player(iframe); $iframe.data('vimeoPlayer', player); } catch(e) { player = null; }
            }
            if (!player) return;
            try {
                player.ready().then(function(){
                    try { player.setMuted(false).catch(function(){}); } catch(e) {}
                    try { player.setVolume(1).catch(function(){}); } catch(e) {}
                    try { player.play().catch(function(){ /* autoplay may still be blocked by policy */ }); } catch(e) {}
                    // Pre-end rewind to avoid showing Vimeo endscreen
                    try {
                        var durationCache = null;
                        player.getDuration().then(function(d){ durationCache = d; }).catch(function(){});
                        player.on('timeupdate', function(data){
                            try {
                                var dur = durationCache || (data && data.duration) || null;
                                var cur = (data && data.seconds) || 0;
                                if (dur && cur > Math.max(0, dur - 0.5)) {
                                    player.setCurrentTime(0).then(function(){ player.pause().catch(function(){}); }).catch(function(){});
                                }
                            } catch(e) {}
                        });
                    } catch(e) {}
                    // Safety: also handle ended
                    try {
                        player.on('ended', function(){
                            try { player.setCurrentTime(0).then(function(){ player.pause().catch(function(){}); }).catch(function(){}); } catch(e) {}
                        });
                    } catch(e) {}
                }).catch(function(){});
            } catch(e) {}
        });
    }

    // Add custom fields to portfolio items - PERMANENT DISPLAY
    function addCustomFieldsToPortfolioItems() {
        console.log('Adding custom fields to portfolio items...');

        if (typeof Films360ChildVars === 'undefined' || !Films360ChildVars.portfolio_data) {
            console.log('Films360ChildVars not available');
            return;
        }

        $('.vp-portfolio__item').each(function() {
            var $item = $(this);
            var $title = $item.find('.vp-portfolio__item-title, h3, h2').first();
            var title = $title.text().trim();

            // Resolve by post ID/slug/attributes; fallback to normalized title
            var resolvedPostId = resolvePostIdForItem($item, title);
            var itemData = resolvedPostId ? Films360ChildVars.portfolio_data[resolvedPostId] : null;
            if (resolvedPostId) {
                $item.attr('data-post-id', resolvedPostId);
            }

            if (!itemData) {
                console.log('No data found for item:', title);
                return;
            }

            // Stills vs Video: ensure stills are NOT treated as video
            var hasStillsGallery = Array.isArray(itemData.stills_gallery) && itemData.stills_gallery.length > 0;
            var isStillsType = (itemData.content_type && String(itemData.content_type).toLowerCase() === 'stills');
            if (hasStillsGallery || isStillsType) {
                // Mark as stills and remove any video hover markers
                $item.addClass('is-stills');
                $item.removeClass('has-video');
                $item.removeAttr('data-video-url');
                $item.removeAttr('data-vimeo-id');
                $item.removeAttr('data-vp-format');
            } else {
                // Add Vimeo data for lightbox functionality (prefer explicit Vimeo ID)
                if (itemData.video_id) {
                    $item.attr('data-vimeo-id', itemData.video_id);
                    // Ensure a URL exists for lightbox/native popup as fallback
                    if (!itemData.video_url) {
                        itemData.video_url = 'https://vimeo.com/' + itemData.video_id;
                    }
                }
                if (itemData.video_url) {
                    $item.attr('data-video-url', itemData.video_url);
                    $item.addClass('has-video');
                }
                // Ensure VP does not auto-embed players in the grid
                if ($item.attr('data-vp-format')) {
                    $item.removeAttr('data-vp-format');
                }
            }

            // Remove any previously injected custom fields to avoid duplicates
            $item.find('.films360-custom-fields').remove();

            // Ensure content area exists
            var $content = $item.find('.vp-portfolio__item-overlay, .vp-portfolio__item-content').first();
            if ($content.length === 0) {
                // If no content area, create one
                $content = $('<div class="vp-portfolio__item-overlay"></div>');
                $item.append($content);
            }

            // Build custom fields HTML (left aligned with separators)
            var customFieldsHtml = '<div class="films360-custom-fields">';

            // Add the title at the very top
            if (title) {
                customFieldsHtml += '<div class="films360-item-title" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + title + '</div>';
            }

            // Top line: Production Company (required)
            if (itemData.int_production_company) {
                customFieldsHtml += '<div class="films360-item-description" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + itemData.int_production_company + '</div>';
            }

            // Middle meta: Director, Agency, SA Service Company (each on a new line; no separators; omit year)
            var metaHtml = '';
            if (itemData.director) {
                metaHtml += '<div class="films360-director" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + itemData.director + '</div>';
            }
            if (itemData.agency) {
                metaHtml += '<div class="films360-agency" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + itemData.agency + '</div>';
            }
            if (itemData.sa_service_co) {
                metaHtml += '<div class="films360-service-co" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + itemData.sa_service_co + '</div>';
            }
            // Optional next steps: per-type meta
            if (itemData.content_type === 'music-videos' && itemData.record_label) {
                metaHtml += '<div class="films360-record-label" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + itemData.record_label + '</div>';
            }
            if (itemData.content_type === 'stills' && itemData.photographer) {
                metaHtml += '<div class="films360-photographer" style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; font-size: 1em; font-weight: 400; line-height: 1.4; margin: 0 0 3px 0; padding: 0; color: inherit; text-transform: none; letter-spacing: 0;">' + itemData.photographer + '</div>';
            }
            if (metaHtml) {
                customFieldsHtml += '<div class="films360-item-meta">' + metaHtml + '</div>';
            }

            // Categories (like tags) - NO SEPARATOR (last element)
            if (itemData.categories && itemData.categories.length > 0) {
                customFieldsHtml += '<div class="films360-item-categories">';
                for (var i = 0; i < itemData.categories.length; i++) {
                    customFieldsHtml += '<span class="films360-category">' + itemData.categories[i] + '</span>';
                }
                customFieldsHtml += '</div>';
            }

            customFieldsHtml += '</div>';

            // Insert custom fields after the title
            if ($title.length > 0) {
                $title.after(customFieldsHtml);
            } else {
                $content.prepend(customFieldsHtml);
            }

            console.log('Custom fields added for:', title);
        });

        console.log('Custom fields added to', $('.vp-portfolio__item').length, 'portfolio items');

        // After injecting fields, ensure layout recalculates to fit content
        cleanupGridEmbeds();
        relayoutPortfolioToFitContent();
    }

    // Create/ensure a full-card overlay anchor so the entire card is clickable
    function ensureFullCardAnchor() {
        $('.vp-portfolio__item').each(function() {
            var $item = $(this);
            // Skip if already added
            if ($item.find('a.films360-card-link').length) return;

            // Prefer permalink for href to avoid third-party auto-embeds/popups
            var permalink = null;
            var videoUrl = $item.data('video-url') || null;
            var title = $item.find('.vp-portfolio__item-title, h3, h2').first().text();
            var resolvedPostId = resolvePostIdForItem($item, title);
            if (resolvedPostId && typeof Films360ChildVars !== 'undefined') {
                var d = Films360ChildVars.portfolio_data[resolvedPostId];
                if (d && d.permalink) permalink = d.permalink;
                if (!videoUrl && d && d.video_url) videoUrl = d.video_url;
            }
            var href = permalink || '#';

            // Ensure the item is positioned for absolute overlay
            if ($item.css('position') === 'static') {
                $item.css('position', 'relative');
            }

            var $overlayLink = $('<a class="films360-card-link" aria-label="Open item" role="button" rel="noopener"></a>');
            $overlayLink.attr('href', href);
            if (videoUrl) { $overlayLink.attr('data-video-url', videoUrl); }
            // Insert as first child to keep it underneath injected elements if needed
            $item.prepend($overlayLink);
        });
    }

    // Observe VP container for DOM changes (filtering, ajax loads) and re-apply enhancements
    function observePortfolioChanges() {
        var container = document.querySelector('.vp-portfolio .vp-portfolio__items');
        if (!container) return;
        if (container._films360Observed) return;

        var debouncedReinit;
        var observer = new MutationObserver(function() {
            clearTimeout(debouncedReinit);
            debouncedReinit = setTimeout(function() {
                console.log('VP DOM changed, re-applying custom fields and layout fixes');
                addCustomFieldsToPortfolioItems();
                ensureFullCardAnchor();
                backfillVideoUrlFromAnchors();
                cleanupGridEmbeds();
                ensureCardContentHeight();
                forceCustomFieldsVisibility();
                // [DISABLED] Re-init hover videos for newly visible/added items
                // initOptimizedHoverToPlayVideo();
                relayoutPortfolioToFitContent();
            }, 150);
        });

        // Observe children additions/removals and attribute changes (class toggles used by filtering)
        observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        container._films360Observed = true;

        // Passive listener on filter clicks to schedule a re-apply after VP updates
        $(document).off('click.films360Filters').on('click.films360Filters', '.vp-filter .vp-filter__item, .vp-filter .vp-filter__item a', function() {
            clearTimeout(debouncedReinit);
            debouncedReinit = setTimeout(function() {
                console.log('Filter clicked, re-applying custom fields after VP update');
                addCustomFieldsToPortfolioItems();
                backfillVideoUrlFromAnchors();
                cleanupGridEmbeds();
                ensureCardContentHeight();
                forceCustomFieldsVisibility();
                // [DISABLED] Re-init hover videos after filtering
                // initOptimizedHoverToPlayVideo();
                relayoutPortfolioToFitContent();
            }, 200);
        });
    }

    // Remove inline heights and trigger relayout so cards expand to content
    function relayoutPortfolioToFitContent() {
        var $items = $('.vp-portfolio__item');
        if ($items.length === 0) return;

        $items.each(function() {
            var $item = $(this);
            $item.css({ height: 'auto', minHeight: 'auto' });
            $item.find('.vp-portfolio__item-inner, .vp-portfolio__item-content, .vp-portfolio__item-overlay, .vp-portfolio__item-text')
                 .css({ height: 'auto', minHeight: 'auto', maxHeight: 'none', overflow: 'visible' });
        });

        // Nudge layout engines
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
        try { document.querySelectorAll('.vp-portfolio').forEach(function(el){ el.style.transform='translateZ(0)'; el.offsetHeight; el.style.transform=''; }); } catch (e) {}

        // If VP exposes an update method, call it safely
        if (window.VP && typeof window.VP.update === 'function') {
            try { window.VP.update(); } catch (e) {}
        }
    }


    // Initialize lightbox click handlers (Videos + Stills gallery)
    function initLightboxFunctionality() {
        // Remove any existing click handlers to avoid duplicates
        $(document).off('click.films360Lightbox');

        // Delegate: capture clicks on the entire card and any descendants/anchors.
        $(document).on('click.films360Lightbox', '.vp-portfolio__item, .vp-portfolio__item *', function(e) {
            // Avoid interfering with filter controls
            if ($(e.target).closest('.vp-filter').length) return;

            var $it = $(this).closest('.vp-portfolio__item');
            if ($it.length === 0) return;

            // Resolve title and data once
            var title = $it.find('.vp-portfolio__item-title, h3, h2').first().text();
            var description = '';
            var postId = resolvePostIdForItem($it, (title || ''));
            var itemData = (postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data)
                ? (Films360ChildVars.portfolio_data[postId] || null) : null;

            // Prefer opening stills gallery when available
            if (itemData && Array.isArray(itemData.stills_gallery) && itemData.stills_gallery.length) {
                e.preventDefault();
                e.stopPropagation();
                openImageGalleryLightbox(itemData.stills_gallery, itemData.title || title || 'Gallery', $it, itemData);
                return;
            }

            // For video items, resolve video URL from data- attribute or localized data
            var videoUrl = $it.data('video-url');
            if (!videoUrl && itemData && itemData.video_url) {
                videoUrl = itemData.video_url;
                $it.attr('data-video-url', videoUrl);
            }
            if (videoUrl) {
                e.preventDefault();
                e.stopPropagation();
                openVideoLightbox(videoUrl, title || 'Video', description, $it);
                return;
            }

            // Otherwise fall through to native link behavior
        });

        console.log('Lightbox functionality initialized (delegated - full card)');
    }

    // Open video lightbox using VP's native popup when available, fallback to custom
    function openVideoLightbox(videoUrl, title, description, $item) {
        console.log('Opening video lightbox...');

        var usedNative = false;
        if (window.VP && window.VP.popup && config.respectNativeVP) {
            try {
                window.VP.popup.open([{
                    type: 'video',
                    url: videoUrl,
                    title: title,
                    description: description
                }]);
                usedNative = true;
            } catch (e) {
                console.log('VP popup failed, using custom lightbox');
            }
        }

        if (!usedNative) {
            createCustomLightbox(videoUrl, title, description, $item);
        }
    }

    // Custom lightbox with overlay-close button, navigation, and page scroll passthrough
    function createCustomLightbox(videoUrl, title, description, $item) {
        // Remove any existing instance
        $('.films360-custom-lightbox').remove();

        // Prepare navigation dataset from current grid context
        var $grid = $item.closest('.vp-portfolio');
        var itemsData = [];
        $grid.find('.vp-portfolio__item[data-video-url]').each(function() {
            var $it = $(this);
            var t = $it.find('.vp-portfolio__item-title, h3, h2').first().text() || 'Video';
            // Try to enrich with itemData from localized dataset
            var postId = resolvePostIdForItem($it, t);
            var itemData = null;
            if (postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
                itemData = Films360ChildVars.portfolio_data[postId] || null;
            }
            itemsData.push({ el: this, $el: $it, url: $it.data('video-url'), title: t, data: itemData });
        });
        var currentIndex = Math.max(0, itemsData.findIndex(function(d){ return d.$el.is($item); }));

        var $lightbox = $('<div class="films360-custom-lightbox" role="dialog" aria-modal="true" aria-label="Video lightbox">\
            <div class="lightbox-close" role="button" aria-label="Close">&times;</div>\
            <button class="lightbox-nav lightbox-prev" aria-label="Previous" type="button">&#10094;</button>\
            <button class="lightbox-nav lightbox-next" aria-label="Next" type="button">&#10095;</button>\
            <div class="lightbox-overlay" aria-hidden="true"></div>\
            <div class="lightbox-content">\
                <div class="lightbox-video">' + getVideoEmbed(videoUrl) + '</div>\
                <div class="lightbox-meta" aria-hidden="false">\
                    <h3 class="lightbox-title">' + title + '</h3>\
                    <div class="lightbox-submeta"></div>\
                </div>\
            </div>\
        </div>');

        $('body').append($lightbox);
        // Activate (fade/transition in) after insertion, matching image lightbox behavior
        setTimeout(function(){ $lightbox.addClass('active'); }, 10);

        // Render helper for switching items
        function render(index) {
            if (index < 0 || index >= itemsData.length) return;
            currentIndex = index;
            var data = itemsData[currentIndex] || {};
            var newUrl = data.url;
            var newTitle = data.title || 'Video';
            // Remove any previously injected custom controls, if any existed
            try { $lightbox.find('.lightbox-controls').remove(); } catch (e) {}
            // Inject Vimeo iframe with native controls (minimal UI)
            $lightbox.find('.lightbox-video').html(getVideoEmbed(newUrl));
            // Bind custom controls and event handlers (including 'ended' outro suppression)
            try { bindLightboxControls($lightbox); } catch(e) {}
            $lightbox.find('.lightbox-title').text(newTitle);
            // Build submeta if available
            var sub = '';
            if (data && data.data) {
                // Inject ACF credits when available (regardless of content_type)
                var credits = [];
                if (data.data.int_production_company) {
                    credits.push('<span class="lb-credit-item"><span class="lb-credit-label">Production Company</span> ' + data.data.int_production_company + '</span>');
                }
                if (data.data.director) {
                    credits.push('<span class="lb-credit-item"><span class="lb-credit-label">Director</span> ' + data.data.director + '</span>');
                }
                if (data.data.agency) {
                    credits.push('<span class="lb-credit-item"><span class="lb-credit-label">Agency</span> ' + data.data.agency + '</span>');
                }
                // Music video specific: add Record Label after Agency with fallbacks
                (function(){
                    try {
                        var ct = (data.data.content_type || '').toString().toLowerCase();
                        var isMusic = (ct === 'music-videos' || ct === 'music_video' || ct === 'music' || ct === 'musicvideo' || ct === 'music videos');
                        if (!isMusic) return;
                        var rl = data.data.record_label || '';
                        if (!rl && data.$el && data.$el.length) {
                            // DOM fallback from grid-injected fields
                            var domRL = (data.$el.find('.films360-record-label').first().text() || '').trim();
                            if (domRL) rl = domRL;
                        }
                        if (!rl && typeof resolvePostIdForItem === 'function') {
                            // Re-resolve via localized portfolio data by postId
                            var pid = resolvePostIdForItem(data.$el || $(data.el), newTitle);
                            if (pid && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
                                var dLoc = Films360ChildVars.portfolio_data[pid] || null;
                                var dLoc2 = (dLoc && dLoc.data) ? dLoc.data : (dLoc || {});
                                if (dLoc2 && dLoc2.record_label) rl = dLoc2.record_label;
                            }
                        }
                        if (rl) {
                            credits.push('<span class="lb-credit-item"><span class="lb-credit-label">Record Label</span> ' + rl + '</span>');
                        }
                    } catch(e) {}
                })();
                if (data.data.sa_service_co) {
                    credits.push('<span class="lb-credit-item"><span class="lb-credit-label">SA Service Company</span> ' + data.data.sa_service_co + '</span>');
                }
                if (credits.length) {
                    sub += '<div class="lightbox-credits">' + credits.join(' \u2022 ') + '</div>';
                }
                if (data.data.content_type === 'stills' && data.data.photographer) {
                    sub += '<div class="lightbox-photographer">' + data.data.photographer + '</div>';
                }
            }
            $lightbox.find('.lightbox-submeta').html(sub);
        }

        // Initial render
        render(currentIndex);

        function navigate(delta) {
            if (!itemsData.length) return;
            var next = currentIndex + delta;
            if (next < 0) next = itemsData.length - 1; // wrap
            if (next >= itemsData.length) next = 0; // wrap
            render(next);
        }

        // Nav button handlers
        $lightbox.find('.lightbox-prev').on('click', function(e){ e.stopPropagation(); navigate(-1); });
        $lightbox.find('.lightbox-next').on('click', function(e){ e.stopPropagation(); navigate(1); });

        // Forward overlay scroll to page
        var $overlay = $lightbox.find('.lightbox-overlay');
        var touchStartY = null;
        $overlay.on('wheel.films360scroll', function(e) {
            var oe = e.originalEvent || e;
            if (oe && typeof oe.deltaY === 'number') {
                e.preventDefault();
                window.scrollBy(0, oe.deltaY);
            }
        });
        $overlay.on('touchstart.films360scroll', function(e) {
            var t = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0] : null;
            touchStartY = t ? t.clientY : null;
        });
        $overlay.on('touchmove.films360scroll', function(e) {
            var t = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0] : null;
            if (touchStartY == null || !t) return;
            var dy = touchStartY - t.clientY;
            if (Math.abs(dy) > 0) {
                e.preventDefault();
                window.scrollBy(0, dy);
                touchStartY = t.clientY;
            }
        });
        $overlay.on('touchend.films360scroll touchcancel.films360scroll', function() {
            touchStartY = null;
        });

        // Close handlers
        $lightbox.find('.lightbox-close, .lightbox-overlay').on('click', function(e) {
            e.stopPropagation();
            $lightbox.removeClass('active');
            setTimeout(function() {
                $overlay.off('.films360scroll');
                $(document).off('keydown.films360lightbox');
                $lightbox.remove();
            }, 300);
        });

        // Keyboard handler
        $(document).on('keydown.films360lightbox', function(ev) {
            if (!$lightbox.length) return;
            if (ev.key === 'Escape') {
                $lightbox.find('.lightbox-close').trigger('click');
            } else if (ev.key === 'ArrowLeft') {
                navigate(-1);
            } else if (ev.key === 'ArrowRight') {
                navigate(1);
            }
        });
    }


    // Enhance accessibility
    function enhanceAccessibility() {
        // Add keyboard navigation
        $('.vp-portfolio__item[data-video-url]').attr('tabindex', '0').off('keydown.films360').on('keydown.films360', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).click();
            }
        });

        // Add ARIA labels
        $('.vp-portfolio__item[data-video-url]').each(function() {
            var title = $(this).find('.vp-portfolio__item-title, h3, h2').first().text();
            $(this).attr('aria-label', 'Open video: ' + title);
            $(this).attr('role', 'button');
        });

        // Enhance filter accessibility
        $('.vp-filter .vp-filter__item').each(function() {
            var $item = $(this);
            if (!$item.attr('tabindex')) {
                $item.attr('tabindex', '0');
            }

            $item.off('keydown.films360filter').on('keydown.films360filter', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    $(this).click();
                }
            });
        });
    }

    // Ensure cards expand to fit content
    function ensureCardContentHeight() {
        console.log('Ensuring cards expand to fit content...');

        $('.vp-portfolio__item').each(function() {
            var $item = $(this);
            var $content = $item.find('.vp-portfolio__item-overlay, .vp-portfolio__item-content');

            // Remove any height constraints
            $item.css({
                'height': 'auto',
                'min-height': 'auto'
            });

            $content.css({
                'height': 'auto',
                'min-height': 'auto',
                'flex': '1'
            });
        });

        console.log('Card content height ensured for', $('.vp-portfolio__item').length, 'items');
    }

    // Handle responsive adjustments
    function handleResponsiveAdjustments() {
        // Add touch-specific feedback for mobile
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            $('.vp-portfolio__item[data-video-url]').on('touchstart.films360', function() {
                $(this).addClass('touch-active');
            }).on('touchend.films360', function() {
                var $item = $(this);
                setTimeout(function() {
                    $item.removeClass('touch-active');
                }, 200);
            });
        }
    }

    // Remove any accidentally injected Vimeo/oEmbed players inside grid items
    function cleanupGridEmbeds() {
        try {
            var grid = document.querySelector('.vp-portfolio .vp-portfolio__items');
            if (!grid) return;
            var toRemove = [];
            grid.querySelectorAll('.vp-portfolio__item iframe').forEach(function(iframe){
                try {
                    var src = iframe.getAttribute('src') || '';
                    if (/player\.vimeo\.com\/video\//.test(src)) {
                        toRemove.push(iframe);
                    }
                } catch(e) {}
            });
            grid.querySelectorAll('.vp-portfolio__item .vp-embed, .vp-portfolio__item .wp-block-embed, .vp-portfolio__item .wp-embed-aspect-16-9').forEach(function(wrapper){
                toRemove.push(wrapper);
            });
            toRemove.forEach(function(node){
                try { node.parentNode && node.parentNode.removeChild(node); } catch(e) {}
            });
        } catch(e) {}
    }

    // Force custom fields to be visible (in case of CSS issues)
    function forceCustomFieldsVisibility() {
        try {
            $('.films360-custom-fields').css({ display: 'block', visibility: 'visible', opacity: 1 });
        } catch(e) {}
        $('.films360-item-description, .films360-item-meta, .films360-item-categories').each(function() {
            $(this).css({
                'display': 'block',
                'visibility': 'visible',
                'opacity': '1',
                'background': 'transparent'
            });
        });

        console.log('Custom fields visibility forced');
    }

    // Main initialization function
    function init() {
        console.log('Starting 360 Films Portfolio initialization (Native VP Support + Kadence Colors)...');

        // Initialize immediately, then wait for VP
        initFilms360Portfolio();
        // [REMOVED] inline highlight animation initialization
        handleResponsiveAdjustments();
    }

    // Run initialization
    init();

    // Re-initialize when Visual Portfolio loads new content
    $(document).on('vpf_loaded vpf_init vp_loaded', function() {
        console.log('Visual Portfolio reloaded, re-initializing...');
        setTimeout(function() {
            initFilms360Portfolio();
        }, 200);
    });

    // Also initialize on window load
    $(window).on('load', function() {
        setTimeout(function() {
            initFilms360Portfolio();
            forceCustomFieldsVisibility();
        }, 500);
    });

    // Global functions for debugging and manual refresh
    window.films360RefreshPortfolio = function() {
        console.log('Manually refreshing 360 Films Portfolio...');
        initFilms360Portfolio();
    };

    window.films360Debug = function() {
        var counts = {
            portfolioItems: $('.vp-portfolio__item').length,
            videoItems: $('.vp-portfolio__item[data-video-url]').length,
            customFields: $('.films360-custom-fields').length,
            hoverVideoContainers: $('.films360-hover-video').length,
            preloadIframes: $('.films360-preload-iframe').length,
            filterButtons: $('.vp-filter .vp-filter__item').length
        };
        var env = {
            touch: ('ontouchstart' in window || navigator.maxTouchPoints > 0) === true,
            hasVP: !!window.VP,
            vpType: window.VP ? typeof window.VP : 'none',
            cacheBuster: (typeof Films360ChildVars !== 'undefined') ? Films360ChildVars.cache_buster : null,
            version: (typeof Films360ChildVars !== 'undefined') ? Films360ChildVars.version : null
        };
        var gridInfo = (function(){
            var $c = $('.vp-portfolio__items');
            if ($c.length === 0) return null;
            var cs = window.getComputedStyle($c[0]);
            return {
                className: $c[0].className,
                display: cs.display,
                gridTemplateColumns: cs.gridTemplateColumns,
                gridGap: cs.gridGap
            };
        })();
        var sampleItems = [];
        $('.vp-portfolio__item').each(function(index) {
            if (index >= 10) return false; // cap to 10 for brevity
            var $item = $(this);
            sampleItems.push({
                index: index + 1,
                videoUrl: $item.data('video-url') || null,
                postId: $item.data('post-id') || null,
                title: $item.find('.vp-portfolio__item-title, h3, h2').first().text() || '',
                hasCustomFields: $item.find('.films360-custom-fields').length > 0,
                hasHoverVideo: $item.find('.films360-hover-video').length > 0,
                hasVideoClass: $item.hasClass('has-video'),
                categoriesCount: $item.find('.films360-category').length,
                height: $item.height(),
                contentHeight: $item.find('.vp-portfolio__item-overlay, .vp-portfolio__item-content').height()
            });
        });

        var summary = {
            counts: counts,
            config: config,
            env: env,
            grid: gridInfo,
            sampleItems: sampleItems
        };

        // Logging (kept for console-based troubleshooting)
        console.log('=== 360 Films Portfolio Debug Info (Native VP Support + Kadence Colors) ===');
        console.log('Counts:', counts);
        console.log('Config:', config);
        if (gridInfo) console.log('Grid:', gridInfo);
        if (typeof Films360ChildVars !== 'undefined') {
            console.log('Portfolio data items:', Object.keys(Films360ChildVars.portfolio_data || {}).length);
            console.log('Cache buster:', Films360ChildVars.cache_buster);
            console.log('Version:', Films360ChildVars.version);
        } else {
            console.log('Films360ChildVars not available');
        }
        console.log('Env:', env);
        console.log('Sample items (first up to 10):', sampleItems);

        return summary;
    };

    // Auto-debug on load
    setTimeout(function() {
        if (typeof window.films360Debug === 'function') {
            window.films360Debug();
        }
    }, 2000);

});

// CSS-in-JS for critical styles (Kadence colors)
(function() {
    var kadenceColorCSS = `
        /* REMOVE ALL PLAY BUTTONS COMPLETELY */
        .vp-portfolio .vp-portfolio__item::before,
        .vp-portfolio .vp-portfolio__item.has-video::before {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        /* Kadence color variables */
        :root {
            --films360-primary-dark: #0b3948;
            --films360-primary-medium: #416165;
            --films360-primary-light: #14617b;
            --films360-secondary-dark: #4c4b63;
            --films360-neutral-light: #c9cad9;
            --films360-neutral-very-light: #ededff;
            --films360-white: #ffffff;
        }

        /* Ensure cards expand to fit content */
        .vp-portfolio .vp-portfolio__item {
            height: auto !important;
            min-height: auto !important;
            background-color: var(--films360-neutral-very-light) !important;
        }

        .vp-portfolio .vp-portfolio__item .vp-portfolio__item-overlay,
        .vp-portfolio .vp-portfolio__item .vp-portfolio__item-content {
            height: auto !important;
            min-height: auto !important;
            flex: 1 !important;
            text-align: left !important;
            background: var(--films360-neutral-very-light) !important;
        }

        /* Ensure custom fields are visible */
        .films360-custom-fields {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            text-align: left !important;
        }

        /* Filter button full clickability */
        .vp-filter .vp-filter__item {
            cursor: pointer !important;
            position: relative !important;
        }

        /* DO NOT OVERRIDE VISUAL PORTFOLIO GRID */
        .vp-portfolio .vp-portfolio__items {
            /* Let Visual Portfolio handle all grid properties */
        }
    `;

    var style = document.createElement('style');
    style.textContent = kadenceColorCSS;
    document.head.appendChild(style);
})();

