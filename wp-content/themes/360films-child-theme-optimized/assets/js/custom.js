// Image Gallery Lightbox for Stills (use jQuery explicitly to avoid noConflict issues)
function openImageGalleryLightbox(images, title, $item) {
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
        // Optional per-type meta: photographer if available in localized data
        var postId = resolvePostIdForItem($item, title);
        var data = null;
        if (postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
            data = Films360ChildVars.portfolio_data[postId] || null;
            var sub = '';
            if (data && data.photographer) {
                sub += '<div class="lightbox-photographer">' + data.photographer + '</div>';
            }
            $lightbox.find('.lightbox-submeta').html(sub);
        }
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

    // Configuration - PERFORMANCE OPTIMIZED
    var config = {
        hoverDelay: 50,             // Balanced response time
        leaveDelay: 100,            // Prevent flicker
        videoStartTime: 2,          // Faster video start
        preloadVideos: false,       // Disable preloading for better performance
        maxPreload: 6,              // Reduce preload count
        preloadRootMargin: '200px', // Smaller preload margin
        transitionSpeed: 150,       // Smooth but fast transitions
        respectNativeVP: true,      // Use native VP when available
        debounceDelay: 250          // Debounce DOM updates
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

    // Wait for Visual Portfolio to fully initialize - OPTIMIZED
    function waitForVisualPortfolio(callback) {
        var attempts = 0;
        var maxAttempts = 100; // 10 seconds max wait
        var checkInterval = 100;

        function checkVP() {
            attempts++;

            // Multiple checks for VP readiness
            var hasVPContainer = $('.vp-portfolio').length > 0;
            var hasVPItems = $('.vp-portfolio__item').length > 0;
            var hasVPScript = typeof window.VP !== 'undefined' || $('script[src*="visual-portfolio"]').length > 0;
            
            // Check if VP is ready or if we have portfolio items
            if ((hasVPContainer && hasVPItems) || hasVPScript) {
                console.log('Visual Portfolio detected and ready (attempt ' + attempts + ')');
                // Small delay to ensure DOM is stable
                setTimeout(callback, 50);
                return;
            }

            // Also check for any portfolio-like content
            var hasPortfolioContent = $('.portfolio, [class*="portfolio"], .vp-').length > 0;
            if (hasPortfolioContent && attempts > 20) {
                console.log('Portfolio content detected, proceeding (attempt ' + attempts + ')');
                setTimeout(callback, 50);
                return;
            }

            if (attempts < maxAttempts) {
                setTimeout(checkVP, checkInterval);
            } else {
                console.log('Visual Portfolio not detected after ' + (maxAttempts * checkInterval / 1000) + 's, proceeding anyway');
                callback();
            }
        }

        // Start checking immediately
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
                    autoplayMuted: true
                };
                var params = {
                    autoplay: config.autoplayMuted ? 1 : 0,
                    muted: 1, // start muted to allow autoplay; user can unmute
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
                    try { player.setMuted(true).catch(function(){}); } catch(e) {}
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

            // Top line: Production Company (required)
            if (itemData.int_production_company) {
                customFieldsHtml += '<div class="films360-item-description">' + itemData.int_production_company + '</div>';
            }

            // Middle meta: Director, Agency, SA Service Company (each on a new line; no separators; omit year)
            var metaHtml = '';
            if (itemData.director) {
                metaHtml += '<div class="films360-director">' + itemData.director + '</div>';
            }
            if (itemData.agency) {
                metaHtml += '<div class="films360-agency">' + itemData.agency + '</div>';
            }
            if (itemData.sa_service_co) {
                metaHtml += '<div class="films360-service-co">' + itemData.sa_service_co + '</div>';
            }
            // Optional next steps: per-type meta
            if (itemData.content_type === 'music-videos' && itemData.record_label) {
                metaHtml += '<div class="films360-record-label">' + itemData.record_label + '</div>';
            }
            if (itemData.content_type === 'stills' && itemData.photographer) {
                metaHtml += '<div class="films360-photographer">' + itemData.photographer + '</div>';
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

    // Observe VP container for DOM changes (filtering, ajax loads) and re-apply enhancements - OPTIMIZED
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
                relayoutPortfolioToFitContent();
            }, config.debounceDelay);
        });

        // Observe children additions/removals and attribute changes (class toggles used by filtering)
        observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        container._films360Observed = true;

        // Passive listener on filter clicks to schedule a re-apply after VP updates - DEBOUNCED
        $(document).off('click.films360Filters').on('click.films360Filters', '.vp-filter .vp-filter__item, .vp-filter .vp-filter__item a', function() {
            clearTimeout(debouncedReinit);
            debouncedReinit = setTimeout(function() {
                console.log('Filter clicked, re-applying custom fields after VP update');
                addCustomFieldsToPortfolioItems();
                backfillVideoUrlFromAnchors();
                cleanupGridEmbeds();
                ensureCardContentHeight();
                forceCustomFieldsVisibility();
                relayoutPortfolioToFitContent();
            }, config.debounceDelay);
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

            // If item is a stills gallery, try to open images
            if ($it.hasClass('is-stills')) {
                var postId = resolvePostIdForItem($it, ($it.find('.vp-portfolio__item-title, h3, h2').first().text() || ''));
                var data = (postId && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data)
                    ? (Films360ChildVars.portfolio_data[postId] || null) : null;
                if (data && Array.isArray(data.stills_gallery) && data.stills_gallery.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageGalleryLightbox(data.stills_gallery, data.title || 'Gallery', $it);
                    return;
                }
                // If no gallery data, fall through to native link
                return;
            }

            // For video items, resolve video URL from data- attribute or localized data
            var title = $it.find('.vp-portfolio__item-title, h3, h2').first().text();
            var description = '';
            var itemData = null;
            var postId2 = resolvePostIdForItem($it, title);
            if (postId2 && typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
                itemData = Films360ChildVars.portfolio_data[postId2] || null;
                if (itemData && itemData.description) description = itemData.description;
            }
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

