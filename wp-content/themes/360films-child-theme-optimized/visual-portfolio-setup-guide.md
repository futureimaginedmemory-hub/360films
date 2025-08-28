# Visual Portfolio Block Setup Guide - 360 Films (Updated)

This guide provides step-by-step instructions for setting up Visual Portfolio using blocks in the WordPress page editor. It addresses common issues with ACF fields and hover video functionality.

## Step 1: Clean Up Previous Installations (Crucial!)

Before installing the new child theme, it is **CRUCIAL** to clean up any previous installations to avoid conflicts and duplicate ACF fields.

1.  **Deactivate and Delete Previous Child Theme:**
    - Go to WordPress Admin → Appearance → Themes.
    - Find any previous versions of "360 Films Child" or "Films 360 Child".
    - Click on the theme, then click "Deactivate" (if active), and then "Delete". Confirm the deletion.

2.  **Clean Up Duplicate ACF Field Groups:**
    - Go to WordPress Admin → ACF (Advanced Custom Fields) → Field Groups.
    - Look for any field groups named "Work Item Details" or similar, especially if you see duplicates.
    - **IMPORTANT:** Only keep ONE field group that targets the "Portfolio" post type and contains the fields: Short Description, Producer Role, Year, Credits/Captions. If you see multiple, delete the duplicates.
    - If you are unsure, delete ALL "Work Item Details" field groups. The new child theme will automatically create the correct one upon activation.

3.  **Clear All Caches:**
    - Clear your WordPress caching plugin (e.g., Breeze, WP Super Cache, WP Rocket).
    - Clear any server-side caches (e.g., Cloudways, Cloudflare).
    - Clear your browser cache.

## Step 2: Install the Updated Child Theme

1.  **Upload the new child theme:**
    - Download the `360films-child-theme-v5.zip` file.
    - Go to WordPress Admin → Appearance → Themes.
    - Click "Add New" → "Upload Theme".
    - Select the zip file and click "Install Now".
    - Click "Activate" to activate the child theme.

2.  **Verify installation:**
    - Go to Appearance → Themes.
    - Confirm "360 Films Child" is the active theme.
    - The parent theme "Kadence" should still be installed.

## Step 3: Install Required Plugins

Ensure the following plugins are installed and active:

1.  **Visual Portfolio** (Free)
    - Go to Plugins → Add New.
    - Search for "Visual Portfolio".
    - Install and activate the plugin by nK.

2.  **Advanced Custom Fields (ACF)** (Free)
    - Search for "Advanced Custom Fields".
    - Install and activate.

3.  **Rank Math SEO** (if not already installed)
    - Search for "Rank Math".
    - Install and activate.

## Step 4: Create Portfolio Projects

The child theme automatically adds the necessary ACF fields to Visual Portfolio's Project post type. After activating the child theme, you should see the "Work Item Details" field group when editing a Visual Portfolio Project.

**To create a new project:**

1.  **Go to Visual Portfolio → Projects → Add New**

2.  **Add project details:**
    -   **Title:** Enter a descriptive title.
    -   **Format:** In the Document sidebar (right side), find the "Format" dropdown and **set it to "Video" (crucial!)**.
    -   **Video URL:** Add your YouTube or Vimeo URL in the "Video" section that appears after selecting "Video" format.
    -   **Work Item Details (ACF Fields):** Fill in the custom fields:
        -   **Short Description:** Max 160 characters (for SEO and grid display).
        -   **Producer Role:** Your role in the project.
        -   **Year:** Production year.
        -   **Credits/Captions:** Optional additional information.

3.  **Assign categories and tags:**
    -   **Categories:** Use for main groupings (e.g., TV Commercials, Music Videos, Films).
    -   **Tags:** Use for specific details (e.g., client names, techniques, etc.).

4.  **Featured image:**
    -   The child theme will attempt to automatically extract and set the video thumbnail. You can also manually set a custom thumbnail if preferred.

5.  **Publish the project.**

## Step 5: Set Up Your Work Page with Visual Portfolio Block

**Important:** Do not use a page template. Use the Visual Portfolio block directly in the page editor.

1.  **Edit your Work page:**
    -   Go to Pages → All Pages.
    -   Edit your "Work" page.
    -   Remove any existing shortcodes or content.

2.  **Add Visual Portfolio block:**
    -   Click the "+" button to add a new block.
    -   Search for "Visual Portfolio".
    -   Add the Visual Portfolio block.

3.  **Configure the block settings:**

    **Content Settings:**
    -   Content Source: Post-based
    -   Posts Source: Portfolio
    -   Posts Per Page: -1 (show all)
    -   Order By: Date
    -   Order Direction: DESC

    **Layout Settings:**
    -   Layout: Grid
    -   Items Gap: 20
    -   Grid Columns: 3
    -   Grid Columns (Tablet): 2
    -   Grid Columns (Mobile): 1

    **Filter Settings:**
    -   Filter: Enable
    -   Filter Taxonomies: `portfolio_category`, `portfolio_tag`
    -   Filter Show Count: Disable
    -   Filter Align: Center

    **Popup Gallery Settings:**
    -   Popup Gallery: Enable
    -   Popup Gallery Each Item: Disable
    -   Popup Gallery Controls: Enable
    -   Popup Gallery Counter: Enable
    -   Popup Gallery Arrows: Enable
    -   Popup Gallery Mouse Wheel: Enable
    -   Popup Gallery Keyboard: Enable
    -   Popup Gallery Iframe: Enable

4.  **Save/Update the page.**

## Step 6: Test Functionality

Visit your Work page and verify:

1.  **ACF Fields Display in Grid:**
    -   Each portfolio item should display the Short Description, Producer Role, Year, and Categories below the title.
2.  **Hover Play Functionality:**
    -   When you hover over a video thumbnail, you should see a subtle visual effect and the play icon should become more prominent.
3.  **Video thumbnails display** (not placeholder images).
4.  **Clicking items opens lightbox** (doesn't redirect to YouTube).
5.  **Filter buttons appear and work**.
6.  **Lightbox shows video and metadata**.

## Troubleshooting Common Issues

### Issue: Duplicate ACF Fields in Backend

**Solution:** This is usually caused by multiple sources trying to register the same ACF fields. Follow **Step 1: Clean Up Previous Installations** very carefully, especially deleting duplicate ACF Field Groups. The child theme now includes a robust check to prevent re-registration.

### Issue: ACF Fields Not Showing in Grid

**Solution:**
1.  **Verify Child Theme is Active:** Ensure `360films-child-theme` is the active theme.
2.  **Check ACF Field Group:** Go to ACF → Field Groups. Confirm there is only ONE field group named "Work Item Details" targeting the "Portfolio" post type.
3.  **Ensure Fields are Populated:** Edit a Visual Portfolio Project and make sure the ACF fields (Short Description, Producer Role, Year, etc.) have content.
4.  **Clear All Caches:** Clear your WordPress caching plugin, server-side caches, and browser cache.

### Issue: Hover Play Functionality Not Working

**Solution:**
1.  **Ensure Video Format:** For each project, confirm the "Format" is set to "Video" in the Document sidebar.
2.  **Valid Video URL:** Ensure a valid YouTube or Vimeo URL is entered in the "Video URL" field.
3.  **Clear All Caches:** Clear all caches (WordPress, server, browser).
4.  **Check Browser Console:** Open your browser's developer tools (F12) and check the "Console" tab for any JavaScript errors.

### Issue: Items Redirect to YouTube Instead of Opening Lightbox

**Solution:**
1.  **Verify Visual Portfolio Block Settings:** Ensure "Popup Gallery" and "Popup Gallery Iframe" are enabled in the Visual Portfolio block settings on your Work page.
2.  **Clear All Caches:** Clear all caches.

### Issue: Placeholder Images Instead of Video Thumbnails

**Solution:**
1.  **Ensure Video Format and URL:** Confirm "Format" is "Video" and a valid YouTube/Vimeo URL is provided.
2.  **Re-save Project:** Sometimes simply updating the project will trigger thumbnail generation.
3.  **Clear All Caches:** Clear all caches.

## Important Notes:

1.  **Always set Format to "Video"** for video projects.
2.  **Use valid YouTube/Vimeo URLs** in the Video URL field.
3.  **Clear caches** after making any changes (adding projects, changing settings, updating theme).

## Support:

If you encounter issues after following all steps:
1.  Check the browser console for JavaScript errors.
2.  Verify all plugin versions are up to date.
3.  Test with other themes to isolate conflicts.
4.  Provide detailed screenshots and console logs for further assistance.

---

**Version:** 5.0.0  
**Last Updated:** August 2025  
**Compatible With:** WordPress 5.0+, Kadence Free Theme, Visual Portfolio Free, PHP 7.4+

