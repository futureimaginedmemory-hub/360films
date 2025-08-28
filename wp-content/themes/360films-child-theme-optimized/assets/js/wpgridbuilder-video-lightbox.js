/**
 * WPGridBuilder Video Lightbox Integration
 * Simple solution to make video thumbnails open Vimeo videos in a lightbox
 * 
 * @package 360Films
 */

jQuery(document).ready(function($) {
    console.log('WPGridBuilder Video Lightbox Loading...');

    // Configuration
    const config = {
        vimeoSelector: '[data-vimeo-id]', // Elements with Vimeo ID data attribute
        gridSelector: '.wpgb-grid', // WPGridBuilder grid container
        cardSelector: '.wpgb-card', // Individual grid cards
        lightboxClass: 'wpgb-video-lightbox',
        activeClass: 'wpgb-lightbox-active'
    };

    /**
     * Extract Vimeo ID from URL
     */
    function extractVimeoId(url) {
        if (!url) return null;
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    /**
     * Get Vimeo embed URL with proper parameters
     */
    function getVimeoEmbedUrl(vimeoId) {
        const params = new URLSearchParams({
            autoplay: 1,
            muted: 1,
            loop: 0,
            controls: 1,
            title: 0,
            byline: 0,
            portrait: 0,
            dnt: 1
        });
        return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
    }

    /**
     * Create lightbox HTML
     */
    function createLightbox(vimeoId, title = 'Video') {
        const embedUrl = getVimeoEmbedUrl(vimeoId);
        
        return `
            <div class="${config.lightboxClass}" role="dialog" aria-modal="true" aria-label="Video lightbox">
                <div class="wpgb-lightbox-overlay" aria-hidden="true"></div>
                <div class="wpgb-lightbox-content">
                    <button class="wpgb-lightbox-close" aria-label="Close lightbox" type="button">&times;</button>
                    <div class="wpgb-lightbox-video">
                        <div class="wpgb-video-wrapper">
                            <iframe 
                                src="${embedUrl}" 
                                width="1280" 
                                height="720" 
                                frameborder="0" 
                                allow="autoplay; fullscreen; picture-in-picture" 
                                allowfullscreen
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>
                    <div class="wpgb-lightbox-meta">
                        <h3 class="wpgb-lightbox-title">${title}</h3>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Open video lightbox
     */
    function openVideoLightbox(vimeoId, title, $clickedElement) {
        // Remove any existing lightbox
        $(`.${config.lightboxClass}`).remove();
        
        // Create and append new lightbox
        const lightboxHtml = createLightbox(vimeoId, title);
        $('body').append(lightboxHtml);
        
        const $lightbox = $(`.${config.lightboxClass}`);
        
        // Add active class after a short delay for smooth transition
        setTimeout(() => {
            $lightbox.addClass(config.activeClass);
            $('body').addClass('wpgb-lightbox-open');
        }, 10);
        
        // Close handlers
        $lightbox.find('.wpgb-lightbox-close, .wpgb-lightbox-overlay').on('click', function(e) {
            e.stopPropagation();
            closeLightbox();
        });
        
        // Keyboard handler
        $(document).on('keydown.wpgbLightbox', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
        
        console.log('Video lightbox opened for Vimeo ID:', vimeoId);
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        const $lightbox = $(`.${config.lightboxClass}`);
        $lightbox.removeClass(config.activeClass);
        $('body').removeClass('wpgb-lightbox-open');
        
        setTimeout(() => {
            $lightbox.remove();
            $(document).off('keydown.wpgbLightbox');
        }, 300);
        
        console.log('Video lightbox closed');
    }

    /**
     * Get video data from ACF fields
     */
    function getVideoData($element) {
        // Try to get Vimeo ID from data attribute first
        let vimeoId = $element.data('vimeo-id') || $element.attr('data-vimeo-id');
        
        if (!vimeoId) {
            // Try to get from video URL
            const videoUrl = $element.data('video-url') || $element.attr('data-video-url');
            if (videoUrl) {
                vimeoId = extractVimeoId(videoUrl);
            }
        }
        
        // Try to get title
        let title = $element.data('title') || $element.attr('data-title');
        if (!title) {
            title = $element.find('h2, h3, h4, .title, .wpgb-card-title').first().text().trim();
        }
        if (!title) {
            title = $element.find('img').first().attr('alt');
        }
        if (!title) {
            title = 'Video';
        }
        
        return {
            vimeoId: vimeoId,
            title: title
        };
    }

    /**
     * Initialize video lightbox for WPGridBuilder elements
     */
    function initVideoLightbox() {
        console.log('Initializing WPGridBuilder video lightbox...');
        
        // Remove any existing handlers to prevent duplicates
        $(document).off('click.wpgbVideoLightbox');
        
        // Add click handler to WPGridBuilder cards
        $(document).on('click.wpgbVideoLightbox', `${config.gridSelector} ${config.cardSelector}`, function(e) {
            const $card = $(this);
            const videoData = getVideoData($card);
            
            if (videoData.vimeoId) {
                e.preventDefault();
                e.stopPropagation();
                openVideoLightbox(videoData.vimeoId, videoData.title, $card);
                console.log('Opening video for card:', videoData);
                return false;
            }
            
            // If no video data, let the default action proceed (image lightbox, etc.)
        });
        
        // Also handle direct clicks on elements with video data
        $(document).on('click.wpgbVideoLightbox', config.vimeoSelector, function(e) {
            const $element = $(this);
            const videoData = getVideoData($element);
            
            if (videoData.vimeoId) {
                e.preventDefault();
                e.stopPropagation();
                openVideoLightbox(videoData.vimeoId, videoData.title, $element);
                return false;
            }
        });
        
        console.log('WPGridBuilder video lightbox initialized');
    }

    /**
     * Add video data attributes from ACF fields
     */
    function addVideoDataAttributes() {
        if (typeof Films360ChildVars !== 'undefined' && Films360ChildVars.portfolio_data) {
            console.log('Adding video data attributes from ACF...');
            
            // Loop through WPGridBuilder cards and match them with ACF data
            $(`${config.gridSelector} ${config.cardSelector}`).each(function() {
                const $card = $(this);
                
                // Try to match card with portfolio data
                const cardTitle = $card.find('h2, h3, h4, .title, .wpgb-card-title').first().text().trim();
                
                if (cardTitle) {
                    // Look for matching portfolio data
                    for (const postId in Films360ChildVars.portfolio_data) {
                        const itemData = Films360ChildVars.portfolio_data[postId];
                        
                        if (itemData.title === cardTitle) {
                            // Add video data attributes
                            if (itemData.video_id) {
                                $card.attr('data-vimeo-id', itemData.video_id);
                            }
                            if (itemData.video_url) {
                                $card.attr('data-video-url', itemData.video_url);
                            }
                            $card.attr('data-title', itemData.title);
                            
                            console.log('Added video data to card:', cardTitle, itemData);
                            break;
                        }
                    }
                }
            });
        }
    }

    /**
     * Initialize when DOM is ready
     */
    function init() {
        // Add video data attributes from ACF
        addVideoDataAttributes();
        
        // Initialize lightbox functionality
        initVideoLightbox();
        
        console.log('WPGridBuilder Video Lightbox ready');
    }

    // Initialize immediately
    init();
    
    // Re-initialize when new content is loaded (AJAX, infinite scroll, etc.)
    $(document).on('wpgb_loaded wpgb_init', function() {
        console.log('WPGridBuilder content reloaded, re-initializing video lightbox...');
        setTimeout(init, 100);
    });
    
    // Also handle generic AJAX complete events
    $(document).ajaxComplete(function() {
        if ($(`${config.gridSelector} ${config.cardSelector}`).length > 0) {
            setTimeout(init, 200);
        }
    });
    
    // Expose global functions for debugging
    window.wpgbVideoLightbox = {
        init: init,
        openVideo: openVideoLightbox,
        close: closeLightbox,
        config: config
    };
    
    console.log('WPGridBuilder Video Lightbox script loaded');
});