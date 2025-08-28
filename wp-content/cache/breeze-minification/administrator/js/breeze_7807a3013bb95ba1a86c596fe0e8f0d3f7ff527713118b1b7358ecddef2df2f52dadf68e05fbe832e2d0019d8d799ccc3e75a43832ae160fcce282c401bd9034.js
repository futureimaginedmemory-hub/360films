(function($){'use strict';$(document).ready(function(){console.log('WP Grid Builder Portfolio Lightbox Override initialized');setTimeout(function(){initPortfolioLightbox()},1000)});function initPortfolioLightbox(){$('.wpgb-handle-lb, .wpgb-lightbox').off('click');$(document).on('click','.wpgb-card',function(e){e.preventDefault();e.stopPropagation();const postId=getPostIdFromCard(this);if(postId){console.log('Opening custom lightbox for post ID:',postId);openPortfolioLightbox(postId)}
return!1});console.log('Custom lightbox handlers attached')}
function getPostIdFromCard(cardElement){const classes=cardElement.className;const match=classes.match(/wpgb-post-(\d+)/);return match?match[1]:null}
function openPortfolioLightbox(postId){showLoadingOverlay();$.ajax({url:wpgb_portfolio_ajax.ajax_url,type:'POST',data:{action:'get_portfolio_lightbox_content',post_id:postId,nonce:wpgb_portfolio_ajax.nonce},success:function(response){hideLoadingOverlay();if(response.success){const data=response.data;if(data.content_type==='Stills'){openGalleryLightbox(data)}else{openVideoLightbox(data)}}else{console.error('Failed to load portfolio content:',response.data);alert('Failed to load portfolio content')}},error:function(xhr,status,error){hideLoadingOverlay();console.error('AJAX error:',error);alert('Error loading portfolio content')}})}
function openVideoLightbox(data){const lightboxHtml=`
            <div id="wpgb-portfolio-lightbox" class="wpgb-portfolio-lightbox">
                <div class="wpgb-lightbox-overlay"></div>
                <div class="wpgb-lightbox-container">
                    <button class="wpgb-lightbox-close">&times;</button>
                    <div class="wpgb-lightbox-content">
                        <div class="wpgb-video-container">
                            <iframe 
                                src="https://player.vimeo.com/video/${data.video_id}?autoplay=1&title=0&byline=0&portrait=0" 
                                frameborder="0" 
                                allow="autoplay; fullscreen; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                        <div class="wpgb-lightbox-info">
                            <h2 class="wpgb-lightbox-title">${data.title}</h2>
                            <div class="wpgb-lightbox-meta">
                                ${data.int_production_company ? `<div class="wpgb-meta-item"><strong>Production Company:</strong>${data.int_production_company}</div>` : ''}
                                ${data.director ? `<div class="wpgb-meta-item"><strong>Director:</strong>${data.director}</div>` : ''}
                                ${data.agency ? `<div class="wpgb-meta-item"><strong>Agency:</strong>${data.agency}</div>` : ''}
                                ${data.sa_service_co ? `<div class="wpgb-meta-item"><strong>Service Company:</strong>${data.sa_service_co}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;$('body').append(lightboxHtml);$('body').addClass('wpgb-lightbox-open');bindLightboxCloseEvents()}
function openGalleryLightbox(data){if(!data.gallery||data.gallery.length===0){alert('No images found in gallery');return}
let currentIndex=0;const lightboxHtml=`
            <div id="wpgb-portfolio-lightbox" class="wpgb-portfolio-lightbox wpgb-gallery-lightbox">
                <div class="wpgb-lightbox-overlay"></div>
                <div class="wpgb-lightbox-container">
                    <button class="wpgb-lightbox-close">&times;</button>
                    <div class="wpgb-lightbox-content">
                        <div class="wpgb-gallery-container">
                            <div class="wpgb-gallery-main">
                                <button class="wpgb-gallery-nav wpgb-gallery-prev">&larr;</button>
                                <div class="wpgb-gallery-image-container">
                                    <img class="wpgb-gallery-image" src="${data.gallery[0].url}" alt="${data.gallery[0].alt}">
                                </div>
                                <button class="wpgb-gallery-nav wpgb-gallery-next">&rarr;</button>
                            </div>
                            <div class="wpgb-gallery-counter">
                                <span class="wpgb-current-image">1</span> / <span class="wpgb-total-images">${data.gallery.length}</span>
                            </div>
                            <div class="wpgb-gallery-thumbnails">
                                ${data.gallery.map((img, index) => `<img class="wpgb-gallery-thumb ${index === 0 ? 'active' : ''}"
src="${img.sizes && img.sizes.thumbnail ? img.sizes.thumbnail : img.url}"
data-index="${index}"
alt="${img.alt}">`).join('')}
                            </div>
                        </div>
                        <div class="wpgb-lightbox-info">
                            <h2 class="wpgb-lightbox-title">${data.title}</h2>
                            <div class="wpgb-lightbox-meta">
                                ${data.int_production_company ? `<div class="wpgb-meta-item"><strong>Production Company:</strong>${data.int_production_company}</div>` : ''}
                                ${data.director ? `<div class="wpgb-meta-item"><strong>Director:</strong>${data.director}</div>` : ''}
                                ${data.agency ? `<div class="wpgb-meta-item"><strong>Agency:</strong>${data.agency}</div>` : ''}
                                ${data.sa_service_co ? `<div class="wpgb-meta-item"><strong>Service Company:</strong>${data.sa_service_co}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;$('body').append(lightboxHtml);$('body').addClass('wpgb-lightbox-open');bindGalleryEvents(data.gallery);bindLightboxCloseEvents()}
function bindGalleryEvents(gallery){let currentIndex=0;$('.wpgb-gallery-prev').on('click',function(){currentIndex=currentIndex>0?currentIndex-1:gallery.length-1;updateGalleryImage(gallery,currentIndex)});$('.wpgb-gallery-next').on('click',function(){currentIndex=currentIndex<gallery.length-1?currentIndex+1:0;updateGalleryImage(gallery,currentIndex)});$('.wpgb-gallery-thumb').on('click',function(){currentIndex=parseInt($(this).data('index'));updateGalleryImage(gallery,currentIndex)});$(document).on('keydown.wpgb-gallery',function(e){if(e.keyCode===37){$('.wpgb-gallery-prev').click()}else if(e.keyCode===39){$('.wpgb-gallery-next').click()}});let startX=null;$('.wpgb-gallery-image-container').on('touchstart',function(e){startX=e.originalEvent.touches[0].clientX});$('.wpgb-gallery-image-container').on('touchend',function(e){if(startX===null)return;const endX=e.originalEvent.changedTouches[0].clientX;const diff=startX-endX;if(Math.abs(diff)>50){if(diff>0){$('.wpgb-gallery-next').click()}else{$('.wpgb-gallery-prev').click()}}
startX=null})}
function updateGalleryImage(gallery,index){const image=gallery[index];$('.wpgb-gallery-image').attr('src',image.url).attr('alt',image.alt);$('.wpgb-current-image').text(index+1);$('.wpgb-gallery-thumb').removeClass('active');$(`.wpgb-gallery-thumb[data-index="${index}"]`).addClass('active');const activeThumb=$(`.wpgb-gallery-thumb[data-index="${index}"]`);const thumbContainer=$('.wpgb-gallery-thumbnails');const scrollLeft=activeThumb.position().left+thumbContainer.scrollLeft()-thumbContainer.width()/2+activeThumb.width()/2;thumbContainer.animate({scrollLeft:scrollLeft},300)}
function bindLightboxCloseEvents(){$('.wpgb-lightbox-close').on('click',closeLightbox);$('.wpgb-lightbox-overlay').on('click',closeLightbox);$(document).on('keydown.wpgb-lightbox',function(e){if(e.keyCode===27){closeLightbox()}})}
function closeLightbox(){$('#wpgb-portfolio-lightbox').fadeOut(300,function(){$(this).remove()});$('body').removeClass('wpgb-lightbox-open');$(document).off('keydown.wpgb-lightbox keydown.wpgb-gallery')}
function showLoadingOverlay(){const loadingHtml=`
            <div id="wpgb-loading-overlay" class="wpgb-loading-overlay">
                <div class="wpgb-loading-spinner"></div>
            </div>
        `;$('body').append(loadingHtml)}
function hideLoadingOverlay(){$('#wpgb-loading-overlay').remove()}})(jQuery)