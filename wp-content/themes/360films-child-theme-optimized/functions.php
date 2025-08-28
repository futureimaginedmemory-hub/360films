<?php
/**
 * 360 Films Child Theme functions and definitions
 * PERFORMANCE OPTIMIZED VERSION - Fast loading with proper caching
 *
 * @package 360 Films Child
 */

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
 * Add ACF fields to Visual Portfolio Projects ONLY if they don't exist
 */
function films360_child_add_project_fields() {
    if ( ! function_exists('acf_add_local_field_group') ) {
        return;
    }

    // Check if fields already exist
    if ( films360_child_check_existing_acf_fields() ) {
        return; // Fields already exist, don't add again
    }

    acf_add_local_field_group(array(
        'key' => 'group_films360_project_details',
        'title' => 'Work Item Details',
        'fields' => array(
            array(
                'key' => 'field_films360_short_description',
                'label' => 'Short Description',
                'name' => 'short_description',
                'type' => 'textarea',
                'instructions' => 'Max 160 characters. This will be displayed in the grid and used for SEO.',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ),
                'default_value' => '',
                'placeholder' => '',
                'maxlength' => 160,
                'rows' => 4,
                'new_lines' => 'wpautop',
            ),
            array(
                'key' => 'field_films360_producer_role',
                'label' => 'Producer Role',
                'name' => 'producer_role',
                'type' => 'text',
                'instructions' => 'Your role in this project (e.g., Producer, Executive Producer)',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '50',
                    'class' => '',
                    'id' => '',
                ),
                'default_value' => '',
                'placeholder' => 'e.g., Executive Producer',
                'prepend' => '',
                'append' => '',
                'maxlength' => '',
            ),
            array(
                'key' => 'field_films360_year',
                'label' => 'Year',
                'name' => 'year',
                'type' => 'number',
                'instructions' => 'Production year',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '50',
                    'class' => '',
                    'id' => '',
                ),
                'default_value' => '',
                'placeholder' => '2023',
                'prepend' => '',
                'append' => '',
                'min' => 1990,
                'max' => 2030,
                'step' => 1,
            ),
            array(
                'key' => 'field_films360_credits_captions',
                'label' => 'Credits/Captions',
                'name' => 'credits_captions',
                'type' => 'textarea',
                'instructions' => 'Optional additional credits or captions',
                'required' => 0,
                'conditional_logic' => 0,
                'wrapper' => array(
                    'width' => '',
                    'class' => '',
                    'id' => '',
                ),
                'default_value' => '',
                'placeholder' => '',
                'maxlength' => '',
                'rows' => 4,
                'new_lines' => 'wpautop',
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
        'description' => '',
    ));
}
// Legacy ACF fields removed - using ACF JSON export instead

/**
 * Extract video thumbnail from YouTube or Vimeo URL
 */
function films360_get_video_thumbnail( $video_url ) {
    if ( empty( $video_url ) ) {
        return false;
    }

    // YouTube thumbnail extraction
    if ( preg_match( '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $video_url, $matches ) ) {
        $youtube_id = $matches[1];
        // Try maxresdefault first, fallback to hqdefault if not available
        $thumbnail_url = "https://img.youtube.com/vi/{$youtube_id}/maxresdefault.jpg";

        // Check if maxresdefault exists
        $response = wp_remote_head( $thumbnail_url );
        if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
            $thumbnail_url = "https://img.youtube.com/vi/{$youtube_id}/hqdefault.jpg";
        }

        return $thumbnail_url;
    }

    // Vimeo thumbnail extraction
    if ( preg_match( '/vimeo\.com\/(\d+)/', $video_url, $matches ) ) {
        $vimeo_id = $matches[1];
        $vimeo_data = wp_remote_get( "https://vimeo.com/api/v2/video/{$vimeo_id}.json" );

        if ( ! is_wp_error( $vimeo_data ) ) {
            $vimeo_response = json_decode( wp_remote_retrieve_body( $vimeo_data ), true );
            if ( isset( $vimeo_response[0]['thumbnail_large'] ) ) {
                return $vimeo_response[0]['thumbnail_large'];
            }
        }
    }

    return false;
}

/**
 * Auto-set featured image from video URL for portfolio projects
 */
function films360_auto_set_featured_image( $post_id ) {
    // Only for portfolio post types (support both Kadence/Custom and Visual Portfolio CPT)
    if ( ! in_array( get_post_type( $post_id ), array( 'portfolio', 'vp_portfolio' ), true ) ) {
        return;
    }

    // Skip if this is an autosave
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    // Get video URL from Visual Portfolio's built-in field
    $video_url = get_post_meta( $post_id, '_vp_format_video_url', true );

    if ( ! $video_url ) {
        return;
    }

    $thumbnail_url = films360_get_video_thumbnail( $video_url );
    if ( ! $thumbnail_url ) {
        return;
    }

    // Check if we already have this thumbnail
    $existing_thumbnail_meta = get_post_meta( $post_id, '_films360_video_thumbnail_url', true );
    if ( $existing_thumbnail_meta === $thumbnail_url && has_post_thumbnail( $post_id ) ) {
        return; // Already processed this video URL
    }

    // Download and set as featured image
    $upload_dir = wp_upload_dir();
    $image_data = wp_remote_get( $thumbnail_url, array( 'timeout' => 30 ) );

    if ( ! is_wp_error( $image_data ) && wp_remote_retrieve_response_code( $image_data ) === 200 ) {
        $image_body = wp_remote_retrieve_body( $image_data );
        $filename = 'video-thumb-' . $post_id . '-' . time() . '.jpg';
        $file = $upload_dir['path'] . '/' . $filename;

        if ( file_put_contents( $file, $image_body ) ) {
            $attachment = array(
                'post_mime_type' => 'image/jpeg',
                'post_title'     => sanitize_file_name( $filename ),
                'post_content'   => '',
                'post_status'    => 'inherit'
            );

            $attach_id = wp_insert_attachment( $attachment, $file, $post_id );

            if ( ! is_wp_error( $attach_id ) ) {
                require_once( ABSPATH . 'wp-admin/includes/image.php' );
                $attach_data = wp_generate_attachment_metadata( $attach_id, $file );
                wp_update_attachment_metadata( $attach_id, $attach_data );

                set_post_thumbnail( $post_id, $attach_id );

                // Store the thumbnail URL to avoid reprocessing
                update_post_meta( $post_id, '_films360_video_thumbnail_url', $thumbnail_url );
            }
        }
    }
}
add_action( 'save_post', 'films360_auto_set_featured_image', 20 );

/**
 * Include custom JS/CSS for Visual Portfolio enhancements - OPTIMIZED
 */
function films360_child_custom_scripts() {
    // Only load on pages with Visual Portfolio
    if ( ! is_admin() ) {
        // Use theme version for proper caching
        $version = wp_get_theme()->get('Version');

        // Enqueue Google Fonts (Sora + Inter) for typography with font-display swap
        wp_enqueue_style(
            'films360-google-fonts',
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap',
            array(),
            null
        );

        // Enqueue custom CSS with proper versioning
        wp_enqueue_style( 'films360-child-custom-style',
            get_stylesheet_directory_uri() . '/assets/css/custom.css',
            array('films360-google-fonts'),
            $version
        );

        // Enqueue custom JS with proper versioning
        wp_enqueue_script( 'films360-child-custom-script',
            get_stylesheet_directory_uri() . '/assets/js/custom.js',
            array('jquery'),
            $version,
            true
        );

        // Enqueue WPGridBuilder Video Lightbox JS and CSS
        wp_enqueue_script( 'wpgridbuilder-video-lightbox',
            get_stylesheet_directory_uri() . '/assets/js/wpgridbuilder-video-lightbox.js',
            array('jquery'),
            $version,
            true
        );
        
        wp_enqueue_style( 'wpgridbuilder-video-lightbox',
            get_stylesheet_directory_uri() . '/assets/css/wpgridbuilder-video-lightbox.css',
            array(),
            $version
        );

        // Get all portfolio posts with their data
        $portfolio_data = array();
        // Support both potential CPT slugs used by Visual Portfolio/Kadence
        $portfolio_posts = get_posts( array(
            'post_type' => array( 'portfolio', 'vp_portfolio' ),
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ) );

        foreach ( $portfolio_posts as $post ) {
            // Stable identifiers
            $post_id   = $post->ID;
            $permalink = get_permalink( $post_id );
            $slug      = $post->post_name;

            // New ACF fields
            $video_id               = get_field( 'video_id', $post_id );
            $int_production_company = get_field( 'int_production_company', $post_id );
            $director               = get_field( 'director', $post_id );
            $agency                 = get_field( 'agency', $post_id );
            $sa_service_co          = get_field( 'sa_service_co', $post_id );
            $year                   = get_field( 'year', $post_id ); // ACF date picker returns formatted string (F Y)
            $content_type           = get_field( 'content_type', $post_id ); // commercials | stills | music-videos
            // Conditional per content type
            $record_label           = get_field( 'record_label', $post_id ); // Music Videos
            $photographer           = get_field( 'photographer', $post_id ); // Stills
            $stills_gallery_raw     = function_exists('get_field') ? get_field( 'stills_gallery', $post_id ) : null; // ACF gallery (array) - may not exist
            $stills_gallery         = array();
            if ( is_array( $stills_gallery_raw ) && ! empty( $stills_gallery_raw ) ) {
                // Build from ACF Gallery (if available)
                foreach ( $stills_gallery_raw as $img ) {
                    $url = isset( $img['sizes']['large'] ) ? $img['sizes']['large'] : ( $img['url'] ?? '' );
                    $alt = $img['alt'] ?? '';
                    $width = isset( $img['sizes']['large-width'] ) ? intval( $img['sizes']['large-width'] ) : ( intval( $img['width'] ?? 0 ) );
                    $height = isset( $img['sizes']['large-height'] ) ? intval( $img['sizes']['large-height'] ) : ( intval( $img['height'] ?? 0 ) );
                    if ( $url ) {
                        $stills_gallery[] = array(
                            'url' => $url,
                            'alt' => $alt,
                            'width' => $width,
                            'height' => $height,
                        );
                    }
                }
            } else {
                // Fallback: build from native meta box (up to 6 attachment IDs)
                $ids = get_post_meta( $post_id, '_films360_stills_gallery', true );
                if ( is_array( $ids ) ) {
                    $ids = array_slice( array_filter( array_map( 'intval', $ids ) ), 0, 6 );
                    foreach ( $ids as $aid ) {
                        if ( ! $aid ) continue;
                        $img = wp_get_attachment_image_src( $aid, 'large' );
                        if ( ! $img ) continue;
                        $alt = get_post_meta( $aid, '_wp_attachment_image_alt', true );
                        $meta = wp_get_attachment_metadata( $aid );
                        $stills_gallery[] = array(
                            'url' => $img[0],
                            'alt' => $alt ? $alt : '',
                            'width' => isset( $meta['width'] ) ? intval( $meta['width'] ) : 0,
                            'height' => isset( $meta['height'] ) ? intval( $meta['height'] ) : 0,
                        );
                    }
                }
            }

            // Back-compat: if Visual Portfolio video url exists and no explicit Vimeo ID was provided
            $vp_video_url = get_post_meta( $post_id, '_vp_format_video_url', true );

            // Vimeo-only: construct a Vimeo URL if video_id exists, else fallback to VP url
            $video_url = '';
            if ( ! empty( $video_id ) ) {
                // Normalize to digits-only ID if a full URL was entered accidentally
                if ( preg_match( '/vimeo\.com\/(\d+)/', $video_id, $m ) ) {
                    $video_id = $m[1];
                }
                $video_url = 'https://vimeo.com/' . $video_id;
            } elseif ( ! empty( $vp_video_url ) ) {
                $video_url = $vp_video_url;
            }

            // Categories: support both potential taxonomies
            $categories = get_the_terms( $post_id, 'portfolio_category' );
            if ( ! $categories || is_wp_error( $categories ) ) {
                $categories = get_the_terms( $post_id, 'vp_portfolio_category' );
            }
            $cat_names = array();
            if ( $categories && ! is_wp_error( $categories ) ) {
                foreach ( $categories as $category ) {
                    $cat_names[] = $category->name;
                }
            }

            $portfolio_data[ $post_id ] = array(
                'post_id' => $post_id,
                'slug' => $slug,
                'permalink' => $permalink,
                'title' => $post->post_title,
                // Video
                'video_id' => $video_id,
                'video_url' => $video_url,
                // Display fields (under title)
                'int_production_company' => $int_production_company,
                'director' => $director,
                'agency' => $agency,
                'sa_service_co' => $sa_service_co,
                'year' => $year,
                'content_type' => $content_type,
                // Additional fields per type
                'record_label' => $record_label,
                'photographer' => $photographer,
                'stills_gallery' => $stills_gallery,
                // Taxonomy
                'categories' => $cat_names,
            );
        }

        // Localize script for AJAX URL and portfolio data
        wp_localize_script( 'films360-child-custom-script', 'Films360ChildVars', array(
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'nonce' => wp_create_nonce( 'films360_nonce' ),
            'portfolio_data' => $portfolio_data,
            'cache_buster' => $version, // Use version as cache buster
            'version' => 'v10-vimeo-only' // Version identifier
        ));
    }
}
add_action( 'wp_enqueue_scripts', 'films360_child_custom_scripts' );

/**
 * Add DNS prefetch and preconnect hints for Vimeo to speed up hover video playback.
 */
function films360_resource_hints( $urls, $relation_type ) {
    $vimeo_hosts = array(
        '//player.vimeo.com',
        '//i.vimeocdn.com',
        '//f.vimeocdn.com',
    );
    $youtube_hosts = array(
        '//www.youtube.com',
        '//i.ytimg.com',
        '//s.ytimg.com',
        '//youtube.com',
        '//img.youtube.com'
    );
    // Google Tag Manager / Analytics
    $gtm_hosts = array(
        '//www.googletagmanager.com',
        '//www.google-analytics.com',
    );
    if ( 'dns-prefetch' === $relation_type ) {
        foreach ( array_merge( $vimeo_hosts, $youtube_hosts, $gtm_hosts ) as $host ) {
            if ( ! in_array( $host, $urls, true ) ) {
                $urls[] = $host;
            }
        }
    }
    if ( 'preconnect' === $relation_type ) {
        // Use https scheme for preconnect
        $preconnect_hosts = array(
            'https://player.vimeo.com',
            'https://i.vimeocdn.com',
            'https://f.vimeocdn.com',
            'https://www.youtube.com',
            'https://i.ytimg.com',
            'https://s.ytimg.com',
            // Minimal preconnect to GTM to speed initial tag load
            'https://www.googletagmanager.com',
        );
        foreach ( $preconnect_hosts as $host ) {
            if ( ! in_array( $host, $urls, true ) ) {
                $urls[] = $host;
            }
        }
    }
    return $urls;
}
add_filter( 'wp_resource_hints', 'films360_resource_hints', 10, 2 );

/**
 * Preload hero poster image on key pages with high priority to improve LCP.
 * Attempts to preload the featured image of the front page or the Portfolio/Work page.
 */
function films360_preload_hero_poster() {
    if ( is_admin() ) { return; }

    // Only on initial HTML responses for key landing pages
    if ( ! ( is_front_page() || is_page( 'portfolio' ) || is_page( 'work' ) ) ) { return; }

    // Determine the page object to inspect for a featured image
    $page_id = 0;
    if ( is_front_page() ) {
        $front_id = get_option( 'page_on_front' );
        if ( $front_id ) { $page_id = (int) $front_id; }
    }
    if ( ! $page_id ) {
        $obj = get_queried_object();
        if ( $obj && ! empty( $obj->ID ) ) { $page_id = (int) $obj->ID; }
    }

    if ( ! $page_id ) { return; }

    $thumb_id = get_post_thumbnail_id( $page_id );
    if ( ! $thumb_id ) { return; }

    $src_full = wp_get_attachment_image_src( $thumb_id, 'full' );
    if ( ! $src_full || empty( $src_full[0] ) ) { return; }

    $src       = esc_url( $src_full[0] );
    $type      = esc_attr( get_post_mime_type( $thumb_id ) ?: 'image/jpeg' );
    $srcset    = wp_get_attachment_image_srcset( $thumb_id, 'full' );
    $sizes     = wp_get_attachment_image_sizes( $thumb_id, 'full' );

    // Output early in head so the browser can start fetching ASAP
    echo "\n";
    echo '<link rel="preload" as="image" href="' . $src . '" fetchpriority="high"';
    if ( $type ) {
        echo ' type="' . $type . '"';
    }
    if ( $srcset ) {
        echo ' imagesrcset="' . esc_attr( $srcset ) . '"';
    }
    if ( $sizes ) {
        echo ' imagesizes="' . esc_attr( $sizes ) . '"';
    }
    echo ' />' . "\n";
}
add_action( 'wp_head', 'films360_preload_hero_poster', 5 );

/**
 * Map ACF short description to Rank Math meta description for portfolio projects
 */
add_filter( 'rank_math/frontend/description', 'films360_child_rank_math_meta_description', 10, 1 );
function films360_child_rank_math_meta_description( $description ) {
    if ( is_singular( 'portfolio' ) ) {
        $short_description = get_field( 'short_description' );
        if ( $short_description ) {
            return $short_description;
        }
    }
    return $description;
}

/**
 * Disable single portfolio post pages (redirect to work page)
 */
function films360_disable_portfolio_single_pages() {
    if ( is_singular( array( 'portfolio', 'vp_portfolio' ) ) ) {
        // Redirect to the public facing portfolio page (menu points to /portfolio/)
        wp_redirect( home_url( '/portfolio/' ), 301 );
        exit;
    }
}
add_action( 'template_redirect', 'films360_disable_portfolio_single_pages' );

/**
 * Add custom body class for portfolio pages
 */
function films360_portfolio_body_class( $classes ) {
    if ( is_page( 'work' ) || is_page( 'portfolio' ) || is_post_type_archive( array( 'portfolio', 'vp_portfolio' ) ) ) {
        $classes[] = 'films360-portfolio-page';
    }
    return $classes;
}
add_action( 'body_class', 'films360_portfolio_body_class' );

/**
 * Register WordPress tag taxonomy support for 'portfolio' and 'vp_portfolio' post types
 */
function films360_register_tag_taxonomy_support() {
    register_taxonomy_for_object_type( 'post_tag', 'portfolio' );
    register_taxonomy_for_object_type( 'post_tag', 'vp_portfolio' );
}
add_action( 'init', 'films360_register_tag_taxonomy_support' );

/**
 * Native Stills Gallery Meta Box (no ACF Pro needed)
 * Stores up to 6 attachment IDs in post meta '_films360_stills_gallery' as an array.
 */
function films360_register_stills_gallery_metabox() {
    $screens = array( 'portfolio', 'vp_portfolio' );
    foreach ( $screens as $screen ) {
        add_meta_box(
            'films360_stills_gallery',
            __( 'Stills Gallery (up to 6 images)', 'films360' ),
            'films360_render_stills_gallery_metabox',
            $screen,
            'side',
            'default'
        );
    }
}
add_action( 'add_meta_boxes', 'films360_register_stills_gallery_metabox' );

// Ensure media scripts are available for the meta box uploader
function films360_enqueue_admin_media( $hook ) {
    $screen = get_current_screen();
    if ( $screen && in_array( $screen->post_type, array( 'portfolio', 'vp_portfolio' ), true ) ) {
        wp_enqueue_media();
    }
}
add_action( 'admin_enqueue_scripts', 'films360_enqueue_admin_media' );

function films360_render_stills_gallery_metabox( $post ) {
    wp_nonce_field( 'films360_stills_gallery_nonce', 'films360_stills_gallery_nonce_field' );
    $ids = get_post_meta( $post->ID, '_films360_stills_gallery', true );
    if ( ! is_array( $ids ) ) { $ids = array(); }
    $ids = array_slice( array_filter( array_map( 'intval', $ids ) ), 0, 6 );

    echo '<style>
        .films360-stills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
        .films360-stills-slot{border:1px dashed #ccd0d4;min-height:70px;background:#fafafa;position:relative}
        .films360-stills-slot img{display:block;width:100%;height:auto}
        .films360-stills-actions{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
        .films360-stills-actions button{margin:0}
    </style>';

    echo '<div class="films360-stills-grid" id="films360-stills-grid">';
    for ( $i = 0; $i < 6; $i++ ) {
        $aid = isset( $ids[$i] ) ? intval( $ids[$i] ) : 0;
        $src = $aid ? wp_get_attachment_image_src( $aid, 'thumbnail' ) : false;
        echo '<div class="films360-stills-slot" data-index="' . esc_attr( $i ) . '">';
        echo '<input type="hidden" name="_films360_stills_gallery[]" value="' . esc_attr( $aid ) . '" />';
        if ( $src ) {
            echo '<img src="' . esc_url( $src[0] ) . '" alt="" />';
        } else {
            echo '<div style="padding:18px;text-align:center;color:#666;font-size:12px;">' . esc_html__( 'Empty', 'films360' ) . '</div>';
        }
        echo '</div>';
    }
    echo '</div>';

    echo '<div class="films360-stills-actions">';
    echo '<button type="button" class="button" id="films360-stills-add">' . esc_html__( 'Add/Replace Images', 'films360' ) . '</button>';
    echo '<button type="button" class="button" id="films360-stills-clear">' . esc_html__( 'Clear All', 'films360' ) . '</button>';
    echo '</div>';

    // Inline admin JS for media frame interaction (NOWDOC to avoid PHP variable interpolation)
    echo <<<'HTML'
<script>
(function($){
    var frame;
    function refreshSlots(ids){
        var $grid = $("#films360-stills-grid");
        $grid.find(".films360-stills-slot").each(function(i){
            var id = ids[i] ? parseInt(ids[i],10) : 0;
            $(this).find("input[type=hidden]").val(id || "");
            var $img = $(this).find("img");
            if(id){
                wp.media.attachment(id).fetch().then(function(att){
                    var url = (att && att.sizes && att.sizes.thumbnail) ? att.sizes.thumbnail.url : (att && att.url) ? att.url : '';
                    if($img.length){ $img.attr("src", url); } else { $("<img>").attr("src", url).appendTo($(".films360-stills-slot").eq(i)); }
                });

                // Extra safety: directly process image-wraps in case item selector misses
                $('.vp-portfolio__item-img-wrap').each(function(){
                    var $wrap = $(this);
                    var $link = $wrap.find('a').first();
                    if ($link.length === 0) return;
                    var $ov = $link.find('.films360-title-overlay');
                    if ($ov.length === 0) {
                        $ov = $('<div class="films360-title-overlay" aria-hidden="true"></div>');
                        $link.append($ov);
                        console.debug('Overlay injected (wrap pass)');
                    }
                    // Try to resolve a title from nearby sources quickly
                    var $item = $wrap.closest('.vp-portfolio__item, .vp-portfolio__item-wrap, .vp-portfolio__item-inner');
                    var t = ($item.find('.vp-portfolio__item-title, h3, h2').first().text() || '').trim();
                    if (!t) t = ($link.attr('aria-label') || $link.attr('title') || '').trim();
                    if (!t) t = ($wrap.find('img').attr('alt') || '').trim();
                    if (t) {
                        $ov.text(t);
                        $item.attr('data-title', t);
                    }
                });
            } else {
                if($img.length){ $img.remove(); }
                $(this).append('<div style="padding:18px;text-align:center;color:#666;font-size:12px;">Empty<\/div>');
            }
        });
    }
    $("#films360-stills-add").on("click", function(e){
        e.preventDefault();
        if(frame){ frame.open(); return; }
        frame = wp.media({
            title: "Select up to 6 images",
            library: { type: "image" },
            multiple: true,
            button: { text: "Use images" }
        });
        frame.on("select", function(){
            var selection = frame.state().get("selection");
            var ids = [];
            selection.each(function(att){ ids.push(att.id); });
            ids = ids.slice(0,6);
            // Write into hidden inputs left-to-right
            var $slots = $("#films360-stills-grid .films360-stills-slot");
            $slots.find("input[type=hidden]").val("");
            $slots.find("img").remove();
            ids.forEach(function(id, idx){
                var $slot = $slots.eq(idx);
                $slot.find("input[type=hidden]").val(id);
                var att = wp.media.attachment(id);
                att.fetch().then(function(a){
                    var url = (a && a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : (a && a.url) ? a.url : '';
                    $("<img>").attr("src", url).appendTo($slot);
                    $slot.find("div").remove();
                });
            });
        });
        frame.open();
    });
    $("#films360-stills-clear").on("click", function(){
        var $slots = $("#films360-stills-grid .films360-stills-slot");
        $slots.find("input[type=hidden]").val("");
        $slots.find("img").remove();
    });
})(jQuery);
</script>
HTML;
}

function films360_save_stills_gallery_metabox( $post_id ) {
    // Verify nonce
    if ( ! isset( $_POST['films360_stills_gallery_nonce_field'] ) || ! wp_verify_nonce( $_POST['films360_stills_gallery_nonce_field'], 'films360_stills_gallery_nonce' ) ) {
        return;
    }
    // Cap checks
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) { return; }
    $ptype = isset($_POST['post_type']) ? sanitize_key($_POST['post_type']) : '';
    if ( $ptype && ! current_user_can( 'edit_' . ( $ptype === 'page' ? 'page' : 'post' ), $post_id ) ) { return; }

    // Sanitize IDs
    $ids = isset( $_POST['_films360_stills_gallery'] ) && is_array( $_POST['_films360_stills_gallery'] ) ? $_POST['_films360_stills_gallery'] : array();
    $ids = array_slice( array_filter( array_map( 'intval', $ids ) ), 0, 6 );
    update_post_meta( $post_id, '_films360_stills_gallery', $ids );
}
add_action( 'save_post', 'films360_save_stills_gallery_metabox' );

/**
 * AJAX handler to get portfolio item data
 */
function films360_get_portfolio_item_data() {
    check_ajax_referer( 'films360_nonce', 'nonce' );

    $post_id = intval( $_POST['post_id'] );

    if ( ! $post_id || get_post_type( $post_id ) !== 'portfolio' ) {
        wp_die( 'Invalid post ID' );
    }

    $video_url = get_post_meta( $post_id, '_vp_format_video_url', true );
    $short_description = get_field( 'short_description', $post_id );
    $producer_role = get_field( 'producer_role', $post_id );
    $year = get_field( 'year', $post_id );
    $credits = get_field( 'credits_captions', $post_id );

    // Get categories
    $categories = get_the_terms( $post_id, 'portfolio_category' );
    $cat_names = array();
    if ( $categories && ! is_wp_error( $categories ) ) {
        foreach ( $categories as $category ) {
            $cat_names[] = $category->name;
        }
    }

    wp_send_json_success( array(
        'video_url' => $video_url,
        'short_description' => $short_description,
        'producer_role' => $producer_role,
        'year' => $year,
        'credits' => $credits,
        'categories' => $cat_names,
        'title' => get_the_title( $post_id )
    ) );
}
add_action( 'wp_ajax_films360_get_portfolio_data', 'films360_get_portfolio_item_data' );
add_action( 'wp_ajax_nopriv_films360_get_portfolio_data', 'films360_get_portfolio_item_data' );

/**
 * Add inline script to inject custom fields into Visual Portfolio items
 * SIMPLIFIED VERSION - No hover effects, no play buttons
 */
function films360_add_inline_portfolio_script() {
    if ( ! is_admin() ) {
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            console.log('360 Films Portfolio Inline Script Loading (Cache-Busting Version)...');

            // Function to add custom fields to portfolio items (permanently visible in grid)
            function addCustomFieldsToPortfolioItems() {
                if (typeof Films360ChildVars === 'undefined' || !Films360ChildVars.portfolio_data) {
                    console.log('Films360ChildVars not available');
                    return;
                }

                console.log('Cache buster:', Films360ChildVars.cache_buster);
                console.log('Version:', Films360ChildVars.version);

                $('.vp-portfolio__item, .vp-portfolio__item-wrap, .vp-portfolio__item-inner').each(function() {
                    var $item = $(this);
                    var $title = $item.find('.vp-portfolio__item-title, h3, h2').first();
                    var title = ($title.text() || '').trim();
                    // Try to read a stable post ID from Visual Portfolio markup
                    var vpId = $item.attr('data-id') || $item.attr('data-post-id') || $item.data('id');
                    if (!vpId) {
                        var childWithId = $item.find('[data-id], [data-post-id]').first();
                        if (childWithId.length) {
                            vpId = childWithId.attr('data-id') || childWithId.attr('data-post-id');
                        }
                    }
                    // Expose title for CSS-only hover overlay
                    $item.attr('data-title', title);
                    // Also attach to image wrappers so ::after on the image can read it
                    $item.find('.vp-portfolio__item-img, .vp-portfolio__item-image-wrap').attr('data-title', title);

                    // Ensure a real overlay element exists; host it inside the IMAGE WRAPPER (position:relative)
                    var $imgWrap = $item.find('.vp-portfolio__item-img-wrap, .vp-portfolio__item-image-wrap, .vp-portfolio__item-img, .vp-portfolio__item-figure, .vp-portfolio__item-media').first();
                    if (!$imgWrap.length) { $imgWrap = $item; }
                    var $overlayHost = $imgWrap;
                    var $overlay = $overlayHost.find('.films360-title-overlay');
                    if ($overlay.length === 0) {
                        $overlay = $('<div class="films360-title-overlay" aria-hidden="true"></div>');
                        $overlayHost.append($overlay);
                        console.debug('Overlay element injected into:', $overlayHost.get(0));
                        // Force a reflow so CSS transitions/paint apply immediately
                        void $overlay[0].offsetHeight;
                    }
                    $overlay.text(title);

                    // Find matching portfolio data by title
                    var itemData = null;
                    if (vpId && Films360ChildVars.portfolio_data[vpId]) {
                        itemData = Films360ChildVars.portfolio_data[vpId];
                        $item.attr('data-post-id', vpId);
                    } else {
                        for (var postId in Films360ChildVars.portfolio_data) {
                            if (Films360ChildVars.portfolio_data[postId].title === title) {
                                itemData = Films360ChildVars.portfolio_data[postId];
                                $item.attr('data-post-id', postId);
                                break;
                            }
                        }
                    }

                    if (!itemData) {
                        console.log('No data found for item:', title);
                        // Do not return here; we still want to render the hover title overlay
                    }

                    // Add video URL as data attribute
                    if (itemData.video_url) {
                        $item.attr('data-video-url', itemData.video_url);
                        $item.attr('data-vp-format', 'video');
                    }

                    // Robustly set hover overlay/title attributes using multiple fallbacks
                    (function ensureTitleOverlay() {
                        var overlayText = title;
                        if ((!overlayText || overlayText.length === 0) && itemData && itemData.title) {
                            overlayText = itemData.title;
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var ariaLabel = $item.find('a[aria-label]').attr('aria-label');
                            if (ariaLabel) overlayText = ariaLabel.trim();
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var linkTitle = $item.find('a[title]').attr('title');
                            if (linkTitle) overlayText = linkTitle.trim();
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var imgAlt = $item.find('img[alt]').attr('alt');
                            if (imgAlt) overlayText = imgAlt.trim();
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var vpTitle = $item.attr('data-vp-title') || $item.data('vpTitle');
                            if (vpTitle) overlayText = (vpTitle + '').trim();
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var childVpTitle = $item.find('[data-vp-title]').attr('data-vp-title');
                            if (childVpTitle) overlayText = childVpTitle.trim();
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var childDataTitle = $item.find('[data-title]').attr('data-title');
                            if (childDataTitle) overlayText = childDataTitle.trim();
                        }
                        if (!overlayText || overlayText.length === 0) {
                            var anchorText = ($item.find('a').first().text() || '').trim();
                            if (anchorText) overlayText = anchorText;
                        }
                        // As a last resort, fetch the linked page and read <meta property="og:title"> or <title>
                        if ((!overlayText || overlayText.length === 0)) {
                            try {
                                window.Films360TitleCache = window.Films360TitleCache || {};
                                var href = ($item.find('a').first().attr('href') || '').trim();
                                if (href && !window.Films360TitleCache[href]) {
                                    $.get(href).done(function(html){
                                        var tmp = document.implementation.createHTMLDocument('x');
                                        tmp.documentElement.innerHTML = html;
                                        var og = tmp.querySelector('meta[property="og:title"]');
                                        var tEl = tmp.querySelector('title');
                                        var fetched = og ? (og.getAttribute('content')||'').trim() : '';
                                        if (!fetched && tEl) fetched = (tEl.textContent||'').trim();
                                        if (fetched) {
                                            window.Films360TitleCache[href] = fetched;
                                            var $ov = $overlayHost.find('.films360-title-overlay');
                                            if ($ov.length) {
                                                $ov.text(fetched);
                                                $item.attr('data-title', fetched);
                                                $item.find('.vp-portfolio__item-img, .vp-portfolio__item-image-wrap').attr('data-title', fetched);
                                                console.debug('Overlay title fetched from page:', fetched);
                                            }
                                        }
                                    });
                                } else if (href && window.Films360TitleCache[href]) {
                                    var cached = window.Films360TitleCache[href];
                                    $overlayHost.find('.films360-title-overlay').text(cached);
                                    $item.attr('data-title', cached);
                                    $item.find('.vp-portfolio__item-img, .vp-portfolio__item-image-wrap').attr('data-title', cached);
                                    console.debug('Overlay title from cache:', cached);
                                }
                            } catch(e) { console.warn('Title fetch fallback failed', e); }
                        }
                        if (overlayText && overlayText.length) {
                            $item.attr('data-title', overlayText);
                            $item.find('.vp-portfolio__item-img, .vp-portfolio__item-image-wrap').attr('data-title', overlayText);
                            var $imgWrap2 = $item.find('.vp-portfolio__item-img-wrap, .vp-portfolio__item-image-wrap, .vp-portfolio__item-img, .vp-portfolio__item-figure, .vp-portfolio__item-media').first();
                            var $host2 = $imgWrap2;
                            var $ov2 = $host2.find('.films360-title-overlay');
                            if ($ov2.length === 0) {
                                $ov2 = $('<div class="films360-title-overlay" aria-hidden="true"></div>');
                                $host2.append($ov2);
                                console.debug('Overlay element injected (observer) into:', $host2.get(0));
                                void $ov2[0].offsetHeight;
                            }
                            $ov2.text(overlayText);
                            console.debug('Overlay title applied:', overlayText);
                        } else {
                            console.warn('Overlay title missing for item, selectors fallback exhausted:', $item.get(0));
                        }
                    })();
                });

                    // Check if custom fields already added
                    if ($item.find('.films360-custom-fields').length > 0) {
                        return;
                    }

                    // Build custom fields HTML (Sam Kolder inspired layout - light theme)
                    var customFieldsHtml = '<div class="films360-custom-fields">';

                    // Short description (prominent, like subtitle)
                    if (itemData.short_description) {
                        customFieldsHtml += '<div class="films360-item-description">' + itemData.short_description + '</div>';
                    }

                    // Producer role and year (like client info)
                    var metaItems = [];
                    if (itemData.producer_role) {
                        metaItems.push('<span class="films360-role">' + itemData.producer_role + '</span>');
                    }
                    if (itemData.year) {
                        metaItems.push('<span class="films360-year">' + itemData.year + '</span>');
                    }

                    if (metaItems.length > 0) {
                        customFieldsHtml += '<div class="films360-item-meta">' + metaItems.join(' • ') + '</div>';
                    }

                    // Categories (like tags)
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
                        // If no title found, append to content area
                        var $content = $item.find('.vp-portfolio__item-overlay, .vp-portfolio__item-content');
                        if ($content.length === 0) {
                            $content = $('<div class="vp-portfolio__item-overlay"></div>');
                            $item.append($content);
                        }
                        $content.prepend(customFieldsHtml);
                    }
                });

                // Ensure data-title/overlay updates for dynamically injected items
                try {
                    var $root = $('.vp-portfolio').first().length ? $('.vp-portfolio').first() : $(document.body);
                    if ($root.length && window.MutationObserver) {
                        var observer = new MutationObserver(function(mutations) {
                            $('.vp-portfolio__item, .vp-portfolio__item-wrap, .vp-portfolio__item-inner').each(function() {
                                var $item = $(this);
                                var $t = $item.find('.vp-portfolio__item-title, h3, h2').first();
                                var t = ($t.text() || '').trim();
                                var postId = $item.attr('data-post-id');
                                if (!postId) {
                                    var vpId2 = $item.attr('data-id') || $item.attr('data-post-id') || $item.data('id');
                                    if (!vpId2) {
                                        var childWithId2 = $item.find('[data-id], [data-post-id]').first();
                                        if (childWithId2.length) vpId2 = childWithId2.attr('data-id') || childWithId2.attr('data-post-id');
                                    }
                                    if (vpId2) {
                                        postId = vpId2;
                                        $item.attr('data-post-id', postId);
                                    }
                                }
                                var overlayText = t;
                                if ((!overlayText || overlayText.length === 0) && postId && window.Films360ChildVars && Films360ChildVars.portfolio_data && Films360ChildVars.portfolio_data[postId]) {
                                    overlayText = Films360ChildVars.portfolio_data[postId].title;
                                }
                                if ((!overlayText || overlayText.length === 0)) overlayText = ($item.find('a[aria-label]').attr('aria-label') || '').trim();
                                if ((!overlayText || overlayText.length === 0)) overlayText = ($item.find('a[title]').attr('title') || '').trim();
                                if ((!overlayText || overlayText.length === 0)) overlayText = ($item.find('img[alt]').attr('alt') || '').trim();

                                if (overlayText && overlayText.length) {
                                    $item.attr('data-title', overlayText);
                                    $item.find('.vp-portfolio__item-img, .vp-portfolio__item-image-wrap').attr('data-title', overlayText);
                                    var $imgWrap2 = $item.find('.vp-portfolio__item-img-wrap, .vp-portfolio__item-image-wrap, .vp-portfolio__item-img, .vp-portfolio__item-figure, .vp-portfolio__item-media').first();
                                    var $link2 = $item.find('.vp-portfolio__item-img-wrap a, .vp-portfolio__item-image-wrap a, .vp-portfolio__item-img a, a.vp-portfolio__item-link').first();
                                    var $vpOverlay2 = $item.find('.vp-portfolio__item-overlay').first();
                                    if (!$imgWrap2.length) { $imgWrap2 = $item; }
                                    var $host2 = $vpOverlay2.length ? $vpOverlay2 : ($link2.length ? $link2 : $imgWrap2);
                                    var $ov2 = $host2.find('.films360-title-overlay');
                                    if ($ov2.length === 0) {
                                        $ov2 = $('<div class="films360-title-overlay" aria-hidden="true"></div>');
                                        $host2.append($ov2);
                                        console.debug('Overlay element injected (observer) into:', $host2.get(0));
                                    }
                                    $ov2.text(overlayText);
                                    console.debug('Overlay title applied (observer):', overlayText);
                                }
                            });
                        });
                        observer.observe($root.get(0), { childList: true, subtree: true });
                    }
                } catch(e) { console.warn('MutationObserver setup failed', e); }

                console.log('Custom fields added to portfolio items (Simplified Version)');
            }

            // Run immediately
            addCustomFieldsToPortfolioItems();

            // Run after Visual Portfolio loads/reloads
            $(document).on('vpf_loaded vpf_init', function() {
                setTimeout(addCustomFieldsToPortfolioItems, 100);
            });

            // Run on window load as fallback
            $(window).on('load', function() {
                setTimeout(addCustomFieldsToPortfolioItems, 500);
            });

            // Global function for manual refresh
            window.films360RefreshPortfolio = addCustomFieldsToPortfolioItems;
        });
        </script>
        <?php
    }
}
// Enable inline footer injection so overlay/title logic runs reliably on the frontend
add_action( 'wp_footer', 'films360_add_inline_portfolio_script' );

/**
 * Google Tag Manager injection
 * - Script goes into <head> via wp_head
 * - Noscript iframe goes right after <body> via wp_body_open
 */
function films360_gtm_head() {
    ?>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-WKWH6XLP');</script>
    <!-- End Google Tag Manager -->
    <?php
}
add_action( 'wp_head', 'films360_gtm_head', 0 );

function films360_gtm_body() {
    ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WKWH6XLP"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <?php
}
add_action( 'wp_body_open', 'films360_gtm_body' );

?>

