(function($){'use strict';class WPGBPortfolioLightbox{constructor(){this.isOpen=!1;this.currentPostId=null;this.currentMode=null;this.galleryData=[];this.currentImageIndex=0;this.init()}
init(){this.bindEvents();this.createLightboxHTML()}
bindEvents(){$(document).on('click','.wpgb-card[data-post-id]',(e)=>{e.preventDefault();const $card=$(e.currentTarget);const postId=$card.data('post-id');const contentType=$card.data('content-type');if(postId){this.openLightbox(postId,contentType)}});$(document).on('click','.wpgb-lightbox-close',(e)=>{e.preventDefault();this.closeLightbox()});$(document).on('click','.wpgb-lightbox-overlay',(e)=>{if(e.target===e.currentTarget){this.closeLightbox()}});$(document).on('click','.wpgb-gallery-prev',(e)=>{e.preventDefault();this.previousImage()});$(document).on('click','.wpgb-gallery-next',(e)=>{e.preventDefault();this.nextImage()});$(document).on('click','.wpgb-gallery-thumb',(e)=>{e.preventDefault();const index=$(e.currentTarget).data('index');this.goToImage(index)});$(document).on('click','.wpgb-lightbox-content',(e)=>{e.stopPropagation()});$(document).on('keydown',(e)=>{if(!this.isOpen)return;switch(e.keyCode){case 27:this.closeLightbox();break;case 37:if(this.currentMode==='gallery'){this.previousImage()}
break;case 39:if(this.currentMode==='gallery'){this.nextImage()}
break}});this.bindTouchEvents();$(window).on('resize',()=>{if(this.isOpen){this.adjustLightboxSize()}})}
bindTouchEvents(){let startX=0;let startY=0;$(document).on('touchstart','.wpgb-gallery-image',(e)=>{if(this.currentMode!=='gallery')return;const touch=e.originalEvent.touches[0];startX=touch.clientX;startY=touch.clientY});$(document).on('touchend','.wpgb-gallery-image',(e)=>{if(this.currentMode!=='gallery')return;const touch=e.originalEvent.changedTouches[0];const deltaX=touch.clientX-startX;const deltaY=touch.clientY-startY;if(Math.abs(deltaX)>Math.abs(deltaY)&&Math.abs(deltaX)>50){if(deltaX>0){this.previousImage()}else{this.nextImage()}}})}
createLightboxHTML(){const lightboxHTML=`
                <div class="wpgb-lightbox-overlay" style="display: none;">
                    <div class="wpgb-lightbox-content">
                        <button class="wpgb-lightbox-close" aria-label="Close lightbox">&times;</button>
                        
                        <!-- Video Container -->
                        <div class="wpgb-lightbox-video" style="display: none;">
                            <div class="wpgb-video-container">
                                <div class="wpgb-video-loading">Loading video...</div>
                            </div>
                        </div>
                        
                        <!-- Gallery Container -->
                        <div class="wpgb-lightbox-gallery" style="display: none;">
                            <div class="wpgb-gallery-main">
                                <button class="wpgb-gallery-nav wpgb-gallery-prev" aria-label="Previous image">‹</button>
                                <div class="wpgb-gallery-image-container">
                                    <img class="wpgb-gallery-image" src="" alt="" />
                                    <div class="wpgb-gallery-loading">Loading image...</div>
                                </div>
                                <button class="wpgb-gallery-nav wpgb-gallery-next" aria-label="Next image">›</button>
                                <div class="wpgb-gallery-counter">
                                    <span class="wpgb-gallery-current">1</span> of <span class="wpgb-gallery-total">1</span>
                                </div>
                            </div>
                            <div class="wpgb-gallery-thumbnails">
                                <div class="wpgb-gallery-thumbs-container">
                                    <!-- Thumbnails will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Info Section -->
                        <div class="wpgb-lightbox-info">
                            <h3 class="wpgb-lightbox-title"></h3>
                            <div class="wpgb-lightbox-fields">
                                <div class="wpgb-field" data-field="int_production_company" style="display: none;">
                                    <label>International Production Company:</label>
                                    <span class="wpgb-field-value"></span>
                                </div>
                                <div class="wpgb-field" data-field="director" style="display: none;">
                                    <label>Director:</label>
                                    <span class="wpgb-field-value"></span>
                                </div>
                                <div class="wpgb-field" data-field="agency" style="display: none;">
                                    <label>Agency:</label>
                                    <span class="wpgb-field-value"></span>
                                </div>
                                <div class="wpgb-field" data-field="sa_service_co" style="display: none;">
                                    <label>SA Service Co:</label>
                                    <span class="wpgb-field-value"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;if(!$('.wpgb-lightbox-overlay').length){$('body').append(lightboxHTML)}}
openLightbox(postId,contentType=null){if(this.isOpen){this.closeLightbox()}
this.currentPostId=postId;const $overlay=$('.wpgb-lightbox-overlay');const $content=$('.wpgb-lightbox-content');$content.addClass('loading');$overlay.fadeIn(300);$('body').addClass('wpgb-lightbox-open');this.isOpen=!0;this.resetLightboxContent();this.fetchPortfolioData(postId)}
fetchPortfolioData(postId){$.ajax({url:wpgb_ajax.ajax_url,type:'POST',data:{action:'wpgb_get_portfolio_content',post_id:postId,nonce:wpgb_ajax.nonce},timeout:10000,success:(response)=>{if(response.success&&response.data){this.populateLightbox(response.data)}else{this.showError('Failed to load portfolio content: '+(response.data||'Unknown error'))}},error:(xhr,status,error)=>{console.error('AJAX request failed:',status,error);this.showError('Failed to load content. Please try again.')},complete:()=>{$('.wpgb-lightbox-content').removeClass('loading')}})}
populateLightbox(data){const $lightbox=$('.wpgb-lightbox-overlay');$lightbox.find('.wpgb-lightbox-title').text(data.title||'Untitled');this.currentMode=data.content_type==='stills'?'gallery':'video';if(this.currentMode==='gallery'){this.setupGallery(data)}else{this.setupVideo(data)}
this.populateFields(data);this.adjustLightboxSize()}
setupVideo(data){const $videoContainer=$('.wpgb-lightbox-video');const $galleryContainer=$('.wpgb-lightbox-gallery');$videoContainer.show();$galleryContainer.hide();if(data.video_id){this.embedVimeoVideo(data.video_id)}else{this.showVideoError('No video ID found')}}
setupGallery(data){const $videoContainer=$('.wpgb-lightbox-video');const $galleryContainer=$('.wpgb-lightbox-gallery');$galleryContainer.show();$videoContainer.hide();if(data.gallery&&data.gallery.length>0){this.galleryData=data.gallery;this.currentImageIndex=0;this.buildGallery();this.showImage(0)}else{this.showGalleryError('No images found in gallery')}}
buildGallery(){const $thumbsContainer=$('.wpgb-gallery-thumbs-container');const $total=$('.wpgb-gallery-total');$total.text(this.galleryData.length);let thumbsHTML='';this.galleryData.forEach((image,index)=>{thumbsHTML+=`
                    <div class="wpgb-gallery-thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <img src="${image.thumbnail}" alt="${image.alt}" loading="lazy" />
                    </div>
                `});$thumbsContainer.html(thumbsHTML);if(this.galleryData.length<=1){$('.wpgb-gallery-nav').hide()}else{$('.wpgb-gallery-nav').show()}}
showImage(index){if(!this.galleryData[index])return;this.currentImageIndex=index;const image=this.galleryData[index];const $image=$('.wpgb-gallery-image');const $current=$('.wpgb-gallery-current');const $loading=$('.wpgb-gallery-loading');$loading.show();$image.hide();$current.text(index+1);const img=new Image();img.onload=()=>{$image.attr('src',image.large);$image.attr('alt',image.alt||image.title||'');$loading.hide();$image.fadeIn(300)};img.onerror=()=>{$loading.hide();this.showGalleryError('Failed to load image')};img.src=image.large;$('.wpgb-gallery-thumb').removeClass('active');$(`.wpgb-gallery-thumb[data-index="${index}"]`).addClass('active');this.scrollToActiveThumbnail()}
scrollToActiveThumbnail(){const $container=$('.wpgb-gallery-thumbs-container');const $activeThumb=$('.wpgb-gallery-thumb.active');if($activeThumb.length){const containerWidth=$container.width();const thumbLeft=$activeThumb.position().left;const thumbWidth=$activeThumb.outerWidth();const currentScroll=$container.scrollLeft();if(thumbLeft<0){$container.scrollLeft(currentScroll+thumbLeft-20)}else if(thumbLeft+thumbWidth>containerWidth){$container.scrollLeft(currentScroll+thumbLeft+thumbWidth-containerWidth+20)}}}
previousImage(){if(this.galleryData.length<=1)return;const newIndex=this.currentImageIndex>0?this.currentImageIndex-1:this.galleryData.length-1;this.showImage(newIndex)}
nextImage(){if(this.galleryData.length<=1)return;const newIndex=this.currentImageIndex<this.galleryData.length-1?this.currentImageIndex+1:0;this.showImage(newIndex)}
goToImage(index){if(index>=0&&index<this.galleryData.length){this.showImage(index)}}
embedVimeoVideo(videoId){const videoHTML=`
                <iframe src="https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0&color=ffffff&background=1" 
                        width="100%" 
                        height="100%" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen
                        title="Vimeo video player">
                </iframe>
            `;$('.wpgb-video-container').html(videoHTML)}
populateFields(data){const fields=['int_production_company','director','agency','sa_service_co'];const $lightbox=$('.wpgb-lightbox-overlay');fields.forEach(field=>{const $field=$lightbox.find(`[data-field="${field}"]`);const value=data[field];if(value&&value.trim()!==''){$field.find('.wpgb-field-value').text(value);$field.show()}else{$field.hide()}})}
resetLightboxContent(){const $lightbox=$('.wpgb-lightbox-overlay');$lightbox.find('.wpgb-lightbox-title').text('');$lightbox.find('.wpgb-video-container').html('<div class="wpgb-video-loading">Loading video...</div>');$lightbox.find('.wpgb-gallery-image').attr('src','').hide();$lightbox.find('.wpgb-gallery-thumbs-container').empty();$lightbox.find('.wpgb-gallery-loading').hide();$lightbox.find('.wpgb-field').hide();this.galleryData=[];this.currentImageIndex=0}
showError(message){const $container=$('.wpgb-video-container');$container.html(`<div class="wpgb-video-error">Error: ${message}</div>`)}
showVideoError(message){const $container=$('.wpgb-video-container');$container.html(`<div class="wpgb-video-error">Video Error: ${message}</div>`)}
showGalleryError(message){const $container=$('.wpgb-gallery-image-container');$container.html(`<div class="wpgb-gallery-error">Gallery Error: ${message}</div>`)}
adjustLightboxSize(){const $content=$('.wpgb-lightbox-content');const windowHeight=$(window).height();const maxHeight=windowHeight*0.9;$content.css('max-height',maxHeight+'px')}
closeLightbox(){if(!this.isOpen)return;const $overlay=$('.wpgb-lightbox-overlay');$overlay.fadeOut(300,()=>{$overlay.find('.wpgb-video-container').empty();this.resetLightboxContent()});$('body').removeClass('wpgb-lightbox-open');this.isOpen=!1;this.currentPostId=null;this.currentMode=null}
close(){this.closeLightbox()}
isLightboxOpen(){return this.isOpen}
getCurrentMode(){return this.currentMode}}
$(document).ready(()=>{window.wpgbPortfolioLightbox=new WPGBPortfolioLightbox();if(window.console&&console.log){console.log('WP Grid Builder Portfolio Lightbox (with Gallery) initialized')}});window.WPGBPortfolioLightbox=WPGBPortfolioLightbox})(jQuery);if(typeof jQuery==='undefined'){console.error('WP Grid Builder Portfolio Lightbox: jQuery is required but not loaded')}