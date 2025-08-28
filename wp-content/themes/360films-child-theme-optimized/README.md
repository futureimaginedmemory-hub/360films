# 360 Films Child Theme - Setup Guide (Visual Portfolio Blocks)

This guide provides step-by-step instructions for installing and configuring the 360 Films child theme with Visual Portfolio blocks for video portfolio functionality.

## Overview

This child theme is designed for the 360 Films website and includes:
- Integration with Visual Portfolio's Project post type using blocks
- Additional ACF fields for project metadata
- Custom styling and JavaScript for enhanced video portfolio functionality
- SEO integration with Rank Math
- Automatic video thumbnail extraction from YouTube/Vimeo
- Lightbox functionality with metadata display
- Fixed click-through behavior (no external redirects)

## Prerequisites

Before starting, ensure you have:
- WordPress site with Kadence Free theme installed
- Admin access to WordPress dashboard
- FTP/SFTP access to your hosting account
- The following plugins installed:
  - Advanced Custom Fields (ACF) - Free version
  - Visual Portfolio - Free version
  - Rank Math SEO
  - Breeze (for caching)
  - Object Cache Pro

## Installation Instructions

### Step 1: Install Child Theme

1. **Upload the child theme:**
   - Download the `360films-child-theme-v3.zip` file
   - Go to WordPress Admin → Appearance → Themes
   - Click "Add New" → "Upload Theme"
   - Select the zip file and click "Install Now"
   - Click "Activate" to activate the child theme

2. **Verify installation:**
   - Go to Appearance → Themes
   - Confirm "360 Films Child" is the active theme
   - The parent theme "Kadence" should still be installed

### Step 2: Install Required Plugins

Install the following plugins if not already installed:

1. **Visual Portfolio** (Free)
   - Go to Plugins → Add New
   - Search for "Visual Portfolio"
   - Install and activate the plugin by nK

2. **Advanced Custom Fields (ACF)** (Free)
   - Search for "Advanced Custom Fields"
   - Install and activate

3. **Rank Math SEO** (if not already installed)
   - Search for "Rank Math"
   - Install and activate

### Step 3: Create Portfolio Projects

The child theme automatically adds additional ACF fields to Visual Portfolio's Project post type.

**To create a new project:**

1. **Go to Visual Portfolio → Projects → Add New**

2. **Add project details:**
   - **Title:** Enter a descriptive title
   - **Format:** Set to "Video" (crucial!)
   - **Video URL:** Add your YouTube or Vimeo URL
   - **Short Description:** Max 160 characters (for SEO)
   - **Producer Role:** Your role in the project
   - **Year:** Production year
   - **Credits/Captions:** Optional additional information

3. **Assign categories and tags:**
   - **Categories:** Main groupings (TV Commercials, Music Videos, Films)
   - **Tags:** Specific details (client names, techniques, etc.)

4. **Featured image:**
   - Will be automatically extracted from video URL
   - You can also manually set a custom thumbnail

5. **Publish the project**

### Step 4: Set Up Work Page with Visual Portfolio Block

**Important:** Do not use the page template approach. Use blocks instead.

1. **Edit your Work page:**
   - Go to Pages → All Pages
   - Edit your "Work" page
   - Remove any existing shortcodes or content

2. **Add Visual Portfolio block:**
   - Click the "+" button to add a new block
   - Search for "Visual Portfolio"
   - Add the Visual Portfolio block

3. **Configure the block settings:**

   **Content Settings:**
   - Content Source: Post-based
   - Posts Source: Portfolio
   - Posts Per Page: -1 (show all)
   - Order By: Date
   - Order Direction: DESC

   **Layout Settings:**
   - Layout: Grid
   - Items Gap: 20
   - Grid Columns: 3
   - Grid Columns (Tablet): 2
   - Grid Columns (Mobile): 1

   **Filter Settings:**
   - Filter: Enable
   - Filter Taxonomies: portfolio_category, portfolio_tag
   - Filter Show Count: Disable
   - Filter Align: Center

   **Popup Gallery Settings:**
   - Popup Gallery: Enable
   - Popup Gallery Each Item: Disable
   - Popup Gallery Controls: Enable
   - Popup Gallery Counter: Enable
   - Popup Gallery Arrows: Enable
   - Popup Gallery Mouse Wheel: Enable
   - Popup Gallery Keyboard: Enable
   - Popup Gallery Iframe: Enable

4. **Save/Update the page**

### Step 5: Test Functionality

Visit your Work page and verify:

1. **Video thumbnails display** (not placeholder images)
2. **Clicking items opens lightbox** (doesn't redirect to YouTube)
3. **Filter buttons appear and work**
4. **Lightbox shows video and metadata**
5. **Hover effects work on desktop**

## Key Features

### Automatic Video Thumbnail Extraction
- YouTube and Vimeo thumbnails are automatically extracted
- Thumbnails are set as featured images when projects are saved
- Fallback handling for API failures

### Fixed Lightbox Behavior
- Items open in lightbox instead of redirecting to external URLs
- Video plays within the lightbox with full controls
- Metadata from ACF fields is displayed below the video

### Enhanced Filtering
- Filter projects by categories and tags
- No page reload required
- Responsive filter buttons

### Hover Effects
- Enhanced hover effects for video projects
- Play button overlay on video thumbnails
- Smooth transitions and animations

### Mobile Optimization
- Responsive grid layout
- Touch-friendly interactions
- Optimized lightbox for mobile devices

## Troubleshooting

### Common Issues and Solutions

1. **Placeholder images instead of video thumbnails:**
   - Ensure project Format is set to "Video"
   - Check that Video URL field contains valid YouTube/Vimeo URL
   - Save the project to trigger thumbnail extraction
   - If still not working, manually upload a featured image

2. **Items redirect to YouTube instead of opening lightbox:**
   - Verify "Popup Gallery" is enabled in block settings
   - Ensure "Popup Gallery Iframe" is enabled
   - Clear all caches (Breeze, Object Cache Pro, Cloudflare)
   - The child theme should automatically prevent external redirects

3. **No filter buttons showing:**
   - Check that "Filter" is enabled in block settings
   - Ensure "Filter Taxonomies" includes both categories and tags
   - Verify your projects have categories and tags assigned

4. **Lightbox not opening:**
   - Check browser console for JavaScript errors
   - Disable other lightbox plugins that might conflict
   - Ensure Visual Portfolio plugin is up to date
   - Clear browser cache

5. **ACF fields not showing:**
   - Verify the child theme is activated
   - Check that you're editing a Portfolio project (not regular post)
   - Ensure ACF plugin is activated

### Performance Issues

1. **Slow loading:**
   - Enable all caching options in Breeze
   - Optimize video thumbnails
   - Use Cloudflare CDN settings

2. **Mobile performance:**
   - Test on actual mobile devices
   - Check image sizes and compression
   - Monitor Core Web Vitals

## Content Management

### Adding New Projects

1. Go to Visual Portfolio → Projects → Add New
2. Set Format to "Video"
3. Add video URL (YouTube or Vimeo)
4. Fill in all metadata fields
5. Assign categories and tags
6. Publish the project
7. Clear caches if needed

### Organizing Content

1. **Categories:** Use for main groupings
   - TV Commercials
   - Music Videos
   - Films
   - Corporate Videos

2. **Tags:** Use for specific details
   - Client names
   - Techniques used
   - Awards won
   - Collaboration partners

### Managing Video URLs

**Supported formats:**
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube Short: `https://youtu.be/VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`

**Best practices:**
- Use high-quality video uploads for better thumbnails
- Ensure videos are public or unlisted (not private)
- Test video URLs before publishing

## SEO Configuration

### Rank Math Integration

The child theme automatically maps ACF short descriptions to Rank Math meta descriptions for portfolio projects.

1. **Configure Open Graph for videos:**
   - Go to Rank Math → Titles & Meta → Post Types
   - Click on "Portfolio" post type
   - Enable Open Graph settings
   - Set appropriate defaults for video content

2. **Sitemap configuration:**
   - Ensure Portfolio post type is included in XML sitemap
   - Set appropriate priority and change frequency

## Performance and Caching

### Breeze Cache Settings

1. **Go to Breeze → Settings:**
   - **Basic Options:** Enable all basic caching options
   - **File Optimization:** Enable CSS and JS minification
   - **Advanced Options:** Enable browser caching

2. **Exclude from caching:**
   - Add `/wp-admin/admin-ajax.php` if using AJAX filtering

### Object Cache Pro

1. **Verify Object Cache Pro is active:**
   - Check dashboard for cache statistics
   - Monitor cache hit rates

### Cloudflare Configuration

1. **Page Rules:**
   - Create rule for `yoursite.com/work/*`
   - Set Cache Level to "Cache Everything"
   - Set Edge Cache TTL to "1 month"

2. **Purge cache after updates:**
   - Clear Cloudflare cache when adding new projects

## File Structure

```
360films-child-theme/
├── style.css                           # Child theme stylesheet header
├── functions.php                       # Theme functions and Visual Portfolio integration
├── assets/
│   ├── css/
│   │   └── custom.css                 # Custom styles for Visual Portfolio
│   └── js/
│       └── custom.js                  # Custom JavaScript enhancements
├── visual-portfolio-setup-guide.md    # Detailed block setup guide
└── README.md                          # This setup guide
```

## Testing Checklist

### Desktop Testing
- [ ] Grid displays correctly with proper spacing
- [ ] Video thumbnails load from YouTube/Vimeo
- [ ] Click opens lightbox (not external redirect)
- [ ] Lightbox shows video and metadata
- [ ] Filters work without page reload
- [ ] Lightbox is keyboard accessible (Tab, Esc)
- [ ] Videos play correctly in lightbox
- [ ] Hover effects work properly

### Mobile Testing
- [ ] Grid is responsive and displays properly
- [ ] Touch interactions work (tap to open lightbox)
- [ ] Lightbox works on touch devices
- [ ] Videos play correctly on mobile browsers
- [ ] Filters are accessible and functional
- [ ] No horizontal scrolling issues

### SEO Testing
- [ ] Portfolio projects have proper meta descriptions
- [ ] Open Graph tags are present for video content
- [ ] URLs are SEO-friendly
- [ ] Sitemap includes portfolio projects

### Performance Testing
- [ ] Desktop Lighthouse score >= 90
- [ ] Mobile Lighthouse score >= 75
- [ ] Page load time < 3 seconds
- [ ] Video thumbnails load quickly
- [ ] Caching is working properly

## Support and Maintenance

### Cache Management

**When to clear caches:**
- After adding new portfolio projects
- After changing Visual Portfolio block settings
- After updating the child theme
- After modifying custom CSS/JS

**How to clear caches:**
1. Breeze: Go to Breeze → Settings → Purge Cache
2. Object Cache Pro: Automatic, but can be manually flushed
3. Cloudflare: Use Cloudflare dashboard or plugin

### Regular Maintenance

1. **Weekly:** Check for broken video links
2. **Monthly:** Review and optimize video thumbnails
3. **Quarterly:** Update categories and tags as needed
4. **As needed:** Add new portfolio projects

## Security Considerations

1. **Regular Updates:** Keep WordPress, themes, and plugins updated
2. **Backup:** Regular backups before making changes
3. **User Permissions:** Limit who can add/edit portfolio projects
4. **Video URLs:** Validate video URLs to prevent malicious content

---

**Version:** 3.0.0  
**Last Updated:** August 2025  
**Compatible With:** WordPress 5.0+, Kadence Free Theme, Visual Portfolio Free, PHP 7.4+

