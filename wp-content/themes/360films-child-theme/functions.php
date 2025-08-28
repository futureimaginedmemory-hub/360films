<?php
/**
 * 360 Films Child Theme functions and definitions
 * CACHE-BUSTING VERSION - Forces fresh CSS/JS loading
 */

// @package 360 Films Child

/**
 * Enqueue parent theme stylesheet
 */
function films360_child_enqueue_styles() {
    wp_enqueue_style( 'kadence-style', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'films360-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( 'kadence-style' ),
        wp_get_theme()->get('Version')
    );
}
add_action( 'wp_enqueue_scripts', 'films360_child_enqueue_styles' );

/**
 * Check if ACF fields already exist to prevent duplication
 */
function films360_child_check_existing_acf_fields() {
    if ( ! function_exists('acf_get_field_groups') ) {
        return false;
    }
    
    $field_groups = acf_get_field_groups();
    foreach ( $field_groups as $group ) {
        if ( $group['key'] === 'group_films360_project_details' || 
             strpos( $group['title'], 'Work Item Details' ) !== false ) {
            return true;
        }
    }
    
    return false;
}

/**
 * Add ACF Fields for Portfolio Items
 */
function films360_child_add_acf_fields() {
    if ( ! function_exists('acf_add_local_field_group') ) {
        return;
    }
    
    // Check if fields already exist
    if ( films360_child_check_existing_acf_fields() ) {
        return;
    }
    
    acf_add_local_field_group(array(
        'key' => 'group_films360_project_details',
        'title' => 'Work Item Details',
        'fields' => array(
            array(
                'key' => 'field_films360_video_id',
                'label' => 'Video ID',
                'name' => 'video_id',
                'type' => 'text',
                'instructions' => 'Enter the Vimeo video ID (numbers only)',
                'required' => 0,
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_films360_content_type',
                            'operator' => '!=',
                            'value' => 'Stills',
                        ),
                    ),
                ),
            ),
            array(
                'key' => 'field_films360_content_type',
                'label' => 'Content Type',
                'name' => 'content_type',
                'type' => 'select',
                'instructions' => 'Select the type of content',
                'required' => 1,
                'choices' => array(
                    'Commercials' => 'Commercials',
                    'Music Videos' => 'Music Videos',
                    'Stills' => 'Stills',
                ),
                'default_value' => 'Commercials',
                'allow_null' => 0,
                'multiple' => 0,
            ),
            array(
                'key' => 'field_films360_gallery',
                'label' => 'Gallery',
                'name' => 'gallery',
                'type' => 'gallery',
                'instructions' => 'Upload images for the gallery (for Stills content type)',
                'required' => 0,
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_films360_content_type',
                            'operator' => '==',
                            'value' => 'Stills',
                        ),
                    ),
                ),
                'return_format' => 'array',
                'preview_size' => 'medium',
                'insert' => 'append',
                'library' => 'all',
            ),
            array(
                'key' => 'field_films360_int_production_company',
                'label' => 'International Production Company',
                'name' => 'int_production_company',
                'type' => 'text',
                'instructions' => 'Enter the international production company name',
                'required' => 0,
            ),
            array(
                'key' => 'field_films360_director',
                'label' => 'Director',
                'name' => 'director',
                'type' => 'text',
                'instructions' => 'Enter the director name',
                'required' => 0,
            ),
            array(
                'key' => 'field_films360_agency',
                'label' => 'Agency',
                'name' => 'agency',
                'type' => 'text',
                'instructions' => 'Enter the agency name',
                'required' => 0,
            ),
            array(
                'key' => 'field_films360_sa_service_co',
                'label' => 'SA Service Co',
                'name' => 'sa_service_co',
                'type' => 'text',
                'instructions' => 'Enter the South African service company name',
                'required' => 0,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'portfolio',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'hide_on_screen' => '',
        'active' => true,
        'description' => 'Fields for portfolio work items',
    ));
}
add_action('acf/init', 'films360_child_add_acf_fields');

/**
 * WP Grid Builder Portfolio Implementation - Updated with Stills Gallery Support
 */

/**
 * Get Vimeo thumbnail URL with caching
 */
function get_vimeo_thumbnail($video_id, $size = 'large') {
    if (empty($video_id)) {
        return false;
    }
    
    $transient_key = 'vimeo_thumb_' . $video_id . '_' . $size;
    $thumbnail_url = get_transient($transient_key);
    
    if (false === $thumbnail_url) {
        $vimeo_api_url = "https://vimeo.com/api/v2/video/{$video_id}.json";
        $response = wp_remote_get($vimeo_api_url, array(
            'timeout' => 15,
            'headers' => array(
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . '; ' . home_url()
            )
        ));
        
        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!empty($data[0])) {
                $video_data = $data[0];
                switch ($size) {
                    case 'small':
                        $thumbnail_url = $video_data['thumbnail_small'];
                        break;
                    case 'medium':
                        $thumbnail_url = $video_data['thumbnail_medium'];
                        break;
                    case 'large':
                    default:
                        $thumbnail_url = $video_data['thumbnail_large'];
                        break;
                }
                
                // Cache for 24 hours
                set_transient($transient_key, $thumbnail_url, 24 * HOUR_IN_SECONDS);
            }
        }
    }
    
    return $thumbnail_url;
}

/**
 * Get featured image for stills (first image from gallery or featured image)
 */
function get_stills_featured_image($post_id) {
    // First try to get featured image
    if (has_post_thumbnail($post_id)) {
        return get_the_post_thumbnail_url($post_id, 'large');
    }
    
    // If no featured image, get first image from gallery
    $gallery = get_field('gallery', $post_id);
    if ($gallery && is_array($gallery) && !empty($gallery)) {
        $first_image = $gallery[0];
        if (is_array($first_image) && isset($first_image['sizes']['large'])) {
            return $first_image['sizes']['large'];
        } elseif (is_numeric($first_image)) {
            return wp_get_attachment_image_url($first_image, 'large');
        }
    }
    
    return false;
}

/**
 * Auto-update thumbnails when content is saved
 */
function update_portfolio_thumbnail_on_save($post_id) {
    // Skip if not portfolio post type
    if (get_post_type($post_id) !== 'portfolio') {
        return;
    }
    
    // Skip if this is an autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Skip if user doesn't have permission
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    $content_type = get_field('content_type', $post_id);
    
    if ($content_type === 'Stills') {
        // Handle stills - set first gallery image as featured image
        if (!has_post_thumbnail($post_id)) {
            $gallery = get_field('gallery', $post_id);
            if ($gallery && is_array($gallery) && !empty($gallery)) {
                $first_image_id = is_array($gallery[0]) ? $gallery[0]['ID'] : $gallery[0];
                if ($first_image_id) {
                    set_post_thumbnail($post_id, $first_image_id);
                }
            }
        }
    } else {
        // Handle video content (Commercials, Music Videos)
        $video_id = get_field('video_id', $post_id);
        if ($video_id) {
            $thumbnail_url = get_vimeo_thumbnail($video_id, 'large');
            if ($thumbnail_url) {
                // Update featured image if not set or if video_id changed
                $current_thumbnail = get_post_meta($post_id, '_vimeo_thumbnail_url', true);
                
                if (!has_post_thumbnail($post_id) || $current_thumbnail !== $thumbnail_url) {
                    // Download and set as featured image
                    $image_id = media_sideload_image($thumbnail_url, $post_id, get_the_title($post_id), 'id');
                    
                    if (!is_wp_error($image_id)) {
                        set_post_thumbnail($post_id, $image_id);
                        update_post_meta($post_id, '_vimeo_thumbnail_url', $thumbnail_url);
                    }
                }
            }
        }
    }
}
add_action('save_post', 'update_portfolio_thumbnail_on_save');

/**
 * Add post data to WP Grid Builder cards for JavaScript targeting
 */
function wpgb_add_post_data_to_card($attributes, $post) {
    if (get_post_type($post) === 'portfolio') {
        $content_type = get_field('content_type', $post->ID);
        $attributes['data-post-id'] = $post->ID;
        $attributes['data-content-type'] = strtolower($content_type);
        
        if ($content_type === 'Stills') {
            $attributes['data-gallery-count'] = count(get_field('gallery', $post->ID) ?: array());
        } else {
            $attributes['data-video-id'] = get_field('video_id', $post->ID);
        }
    }
    return $attributes;
}
add_filter('wpgb/card/attributes', 'wpgb_add_post_data_to_card', 10, 2);

/**
 * Enqueue custom scripts and styles for portfolio lightbox
 */
function wpgb_portfolio_assets() {
    // Only load on pages that might have the portfolio grid
    if (!is_admin()) {
        wp_enqueue_script(
            'wpgb-portfolio-lightbox',
            get_stylesheet_directory_uri() . '/assets/js/wpgb-portfolio-lightbox-updated.js',
            array('jquery'),
            '1.1.0',
            true
        );
        
        wp_enqueue_style(
            'wpgb-portfolio-lightbox',
            get_stylesheet_directory_uri() . '/assets/css/wpgb-portfolio-lightbox-updated.css',
            array(),
            '1.1.0'
        );
        
        // Localize script with AJAX URL and nonce
        wp_localize_script('wpgb-portfolio-lightbox', 'wpgb_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wpgb_portfolio_nonce')
        ));
    }
}
add_action('wp_enqueue_scripts', 'wpgb_portfolio_assets');

/**
 * AJAX handler for lightbox content (updated for stills support)
 */
function wpgb_get_portfolio_lightbox_content() {
    // Verify nonce
    if (!check_ajax_referer('wpgb_portfolio_nonce', 'nonce', false)) {
        wp_send_json_error('Security check failed');
        return;
    }
    
    $post_id = intval($_POST['post_id']);
    if (!$post_id || get_post_type($post_id) !== 'portfolio') {
        wp_send_json_error('Invalid post ID');
        return;
    }
    
    // Get post data
    $post = get_post($post_id);
    if (!$post || $post->post_status !== 'publish') {
        wp_send_json_error('Post not found or not published');
        return;
    }
    
    // Get common fields
    $content_type = get_field('content_type', $post_id);
    $title = get_the_title($post_id);
    $int_production_company = get_field('int_production_company', $post_id);
    $director = get_field('director', $post_id);
    $agency = get_field('agency', $post_id);
    $sa_service_co = get_field('sa_service_co', $post_id);
    
    // Prepare base response data
    $response = array(
        'content_type' => strtolower($content_type),
        'title' => $title,
        'int_production_company' => $int_production_company,
        'director' => $director,
        'agency' => $agency,
        'sa_service_co' => $sa_service_co,
        'post_url' => get_permalink($post_id)
    );
    
    // Add content-specific data
    if ($content_type === 'Stills') {
        // Get gallery images
        $gallery = get_field('gallery', $post_id);
        $gallery_images = array();
        
        if ($gallery && is_array($gallery)) {
            foreach ($gallery as $image) {
                if (is_array($image)) {
                    $gallery_images[] = array(
                        'id' => $image['ID'],
                        'url' => $image['url'],
                        'large' => $image['sizes']['large'] ?? $image['url'],
                        'medium' => $image['sizes']['medium'] ?? $image['url'],
                        'thumbnail' => $image['sizes']['thumbnail'] ?? $image['url'],
                        'alt' => $image['alt'] ?? '',
                        'caption' => $image['caption'] ?? '',
                        'title' => $image['title'] ?? ''
                    );
                } elseif (is_numeric($image)) {
                    $attachment = wp_get_attachment_image_src($image, 'large');
                    $medium = wp_get_attachment_image_src($image, 'medium');
                    $thumbnail = wp_get_attachment_image_src($image, 'thumbnail');
                    
                    if ($attachment) {
                        $gallery_images[] = array(
                            'id' => $image,
                            'url' => $attachment[0],
                            'large' => $attachment[0],
                            'medium' => $medium ? $medium[0] : $attachment[0],
                            'thumbnail' => $thumbnail ? $thumbnail[0] : $attachment[0],
                            'alt' => get_post_meta($image, '_wp_attachment_image_alt', true),
                            'caption' => wp_get_attachment_caption($image),
                            'title' => get_the_title($image)
                        );
                    }
                }
            }
        }
        
        $response['gallery'] = $gallery_images;
        $response['gallery_count'] = count($gallery_images);
    } else {
        // Video content
        $response['video_id'] = get_field('video_id', $post_id);
    }
    
    wp_send_json_success($response);
}
add_action('wp_ajax_wpgb_get_portfolio_content', 'wpgb_get_portfolio_lightbox_content');
add_action('wp_ajax_nopriv_wpgb_get_portfolio_content', 'wpgb_get_portfolio_lightbox_content');

?>

