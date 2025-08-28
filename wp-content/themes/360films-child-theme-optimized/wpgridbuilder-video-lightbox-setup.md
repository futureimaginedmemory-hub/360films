# WPGridBuilder Video Lightbox Setup

This solution adds Vimeo video lightbox functionality to WPGridBuilder grids, allowing video thumbnails to open in a clean, modern lightbox instead of displaying the image thumbnail.

## What's Included

1. **JavaScript File**: `assets/js/wpgridbuilder-video-lightbox.js`
   - Detects WPGridBuilder elements
   - Extracts Vimeo IDs from ACF fields
   - Creates and manages video lightboxes

2. **CSS File**: `assets/css/wpgridbuilder-video-lightbox.css`
   - Clean, modern lightbox styles
   - Responsive design
   - Accessibility features

3. **Functions.php Updates**
   - Enqueues the new JS and CSS files
   - Ensures portfolio data is available to JavaScript

## How It Works

### Data Source Priority
The script looks for video data in the following order:

1. **Direct data attributes** on the element:
   - `data-vimeo-id="123456789"`
   - `data-video-url="https://vimeo.com/123456789"`

2. **ACF Field Data** from the existing `Films360ChildVars.portfolio_data`:
   - Matches WPGridBuilder cards by title
   - Uses `video_id` or `video_url` from ACF fields

3. **Title extraction** from multiple sources:
   - Element's `data-title` attribute
   - H2, H3, H4 headings within the card
   - Image alt attributes
   - Falls back to "Video"

### WPGridBuilder Integration
The script automatically:
- Detects `.wpgb-grid` containers
- Handles clicks on `.wpgb-card` elements
- Works with AJAX-loaded content
- Provides fallback for elements with `[data-vimeo-id]`

## Setup Instructions

### 1. Add Video Data to ACF Fields
Make sure your portfolio items have either:
- `video_id` field with Vimeo ID (e.g., "123456789")
- `video_url` field with full Vimeo URL (e.g., "https://vimeo.com/123456789")

### 2. Configure WPGridBuilder
In your WPGridBuilder grid:
- Display the video thumbnail image as usual
- The script will automatically detect and replace the click behavior
- No additional configuration needed

### 3. Testing
1. Clear any caching plugins
2. Visit a page with WPGridBuilder grid
3. Click on a video thumbnail
4. Video should open in lightbox instead of image

## Troubleshooting

### Videos Not Opening in Lightbox
1. **Check Browser Console**: Look for "WPGridBuilder Video Lightbox" log messages
2. **Verify Data**: Ensure ACF fields contain valid Vimeo URLs or IDs
3. **Check Grid Structure**: Confirm you're using WPGridBuilder (not Visual Portfolio)

### Debug Commands
Open browser console and run:
```javascript
// Check if script loaded
console.log(window.wpgbVideoLightbox);

// Manual initialization
wpgbVideoLightbox.init();

// View configuration
console.log(wpgbVideoLightbox.config);
```

### Common Issues

**Issue**: Click opens image instead of video
**Solution**: Ensure the portfolio item has a valid `video_id` or `video_url` field in ACF

**Issue**: Lightbox doesn't appear
**Solution**: Check for JavaScript errors and ensure jQuery is loaded

**Issue**: Video doesn't autoplay
**Solution**: Most browsers require user interaction for autoplay - this is normal behavior

## Customization

### CSS Customization
Edit `wpgridbuilder-video-lightbox.css` to modify:
- Lightbox background color (`.wpgb-lightbox-overlay`)
- Video container styling (`.wpgb-lightbox-video`)
- Close button appearance (`.wpgb-lightbox-close`)

### JavaScript Configuration
Modify the `config` object in the JS file:
```javascript
const config = {
    vimeoSelector: '[data-vimeo-id]', // Elements with Vimeo ID
    gridSelector: '.wpgb-grid',       // WPGridBuilder container
    cardSelector: '.wpgb-card',       // Individual grid cards
    lightboxClass: 'wpgb-video-lightbox',
    activeClass: 'wpgb-lightbox-active'
};
```

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile devices
- Accessibility features (keyboard navigation, focus management)
- Graceful degradation for older browsers

## Performance Notes
- Lightweight solution (~8KB total)
- No external dependencies except jQuery
- Lazy loading of video iframes
- Efficient event delegation for dynamic content