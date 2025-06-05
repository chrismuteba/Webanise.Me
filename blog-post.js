document.addEventListener('DOMContentLoaded', async function() {
    // Debug information
    console.log('Blog Post Page - Base URL:', window.location.href);
    console.log('Blog Post Page - Path:', window.location.pathname);
    console.log('Blog Post Page - Origin:', window.location.origin);
    console.log('Blog Post Page - Search:', window.location.search);
    
    // Add more detailed debugging
    console.log('Blog Post Page - All URL Params:', new URLSearchParams(window.location.search).toString());
    // Get the current slug from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const currentSlug = urlParams.get('slug');
    
    console.log('Extracted slug from URL:', currentSlug);
    
    if (!currentSlug) {
        showError('Blog post not found - No slug parameter in URL');
        return;
    }
    
    // Fetch the blog post data
    await loadBlogPost(currentSlug);
    
    // Setup theme switcher
    setupThemeSwitcher();
    
    // Mobile menu toggle
    setupMobileMenu();
});

// Contentful credentials
const spaceId = '7rdix4olosoz';
const accessToken = 'mGfX5V-d5lT1htDzVHimXxJ4eEJ4vn3M8OPtXcdL4as';
const contentTypeId = 'webaniseMe';
const environmentId = 'master';

// Function to fetch a specific blog post by slug
async function loadBlogPost(slug) {
    try {
        console.log('Attempting to load blog post with slug:', slug);
        console.log('Using content type ID:', contentTypeId);
        console.log('Using space ID:', spaceId);
        console.log('Using environment ID:', environmentId);
        const post = await fetchBlogPostBySlug(slug);
        
        console.log('Post data received:', post ? 'Yes' : 'No');
        if (post) {
            console.log('Post title:', post.fields?.title);
        }
        
        if (!post) {
            showError('Blog post not found');
            return;
        }
        
        // Render the blog post
        renderBlogPost(post);
        
        // Setup social sharing buttons
        setupSocialSharing(post);
        
        // Load related posts
        loadRelatedPosts(post);
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        // Show more detailed error information
        showError(`Failed to load blog post: ${error.message}`);
    }
}

// Function to fetch a blog post by slug from Contentful
async function fetchBlogPostBySlug(slug) {
    console.log('Fetching blog post with slug:', slug);
    try {
        // Use a simpler query without the select parameter
        console.log('Constructing URL with slug:', slug);
        console.log('Content type ID:', contentTypeId);
        
        // Simplified URL without select parameter
        const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries?access_token=${accessToken}&content_type=${contentTypeId}&fields.slug=${slug}`;
        
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data ? 'Yes' : 'No');
        console.log('Raw data:', JSON.stringify(data));
        
        if (!data.items || data.items.length === 0) {
            console.log('No items found in response');
            return null;
        }
        
        console.log('Number of items found:', data.items.length);
        console.log('First item fields:', data.items[0].fields);
        
        // Get the post and assets
        const post = data.items[0];
        const assets = data.includes?.Asset || [];
        
        // Find the featured image asset
        const featuredImageId = post.fields.featuredImage?.sys?.id;
        const featuredImage = featuredImageId ?
            assets.find(asset => asset.sys.id === featuredImageId) : null;
        
        // Add the featured image URL to the post object
        if (featuredImage) {
            post.featuredImageUrl = `https:${featuredImage.fields.file.url}`;
        }
        
        return post;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        // Log more details about the request
        console.log('Request URL:', `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=${contentTypeId}&fields.slug=${slug}&select=fields.title,fields.excerpt,fields.slug,fields.featuredImage,fields.content,fields.category,sys.createdAt`);
        console.log('Slug being requested:', slug);
        return null;
    }
}

// Function to render Contentful Rich Text format to HTML
function renderRichText(richText) {
    // Check if the rich text object has the expected structure
    if (!richText || !richText.content) {
        return 'No content available';
    }
    
    // Add a wrapper div with styling
    return `<div class="rich-text-content">${processRichTextNode(richText)}</div>`;
}

// Helper function to process a Rich Text node
function processRichTextNode(node) {
    // If node is null or undefined, return empty string
    if (!node) return '';
    
    // Process based on node type
    switch (node.nodeType) {
        case 'document':
            return node.content.map(processRichTextNode).join('');
            
        case 'paragraph':
            return `<p>${node.content.map(processRichTextNode).join('')}</p>`;
            
        case 'heading-1':
            return `<h1>${node.content.map(processRichTextNode).join('')}</h1>`;
            
        case 'heading-2':
            return `<h2>${node.content.map(processRichTextNode).join('')}</h2>`;
            
        case 'heading-3':
            return `<h3>${node.content.map(processRichTextNode).join('')}</h3>`;
            
        case 'heading-4':
            return `<h4>${node.content.map(processRichTextNode).join('')}</h4>`;
            
        case 'heading-5':
            return `<h5>${node.content.map(processRichTextNode).join('')}</h5>`;
            
        case 'heading-6':
            return `<h6>${node.content.map(processRichTextNode).join('')}</h6>`;
            
        case 'unordered-list':
            return `<ul>${node.content.map(processRichTextNode).join('')}</ul>`;
            
        case 'ordered-list':
            return `<ol>${node.content.map(processRichTextNode).join('')}</ol>`;
            
        case 'list-item':
            return `<li>${node.content.map(processRichTextNode).join('')}</li>`;
            
        case 'blockquote':
            return `<blockquote>${node.content.map(processRichTextNode).join('')}</blockquote>`;
            
        case 'hr':
            return '<hr>';
            
        case 'hyperlink':
            return `<a href="${node.data.uri}" target="_blank" rel="noopener noreferrer">${node.content.map(processRichTextNode).join('')}</a>`;
            
        case 'text':
            let text = node.value;
            
            // Apply marks (bold, italic, etc.)
            if (node.marks && node.marks.length > 0) {
                node.marks.forEach(mark => {
                    switch (mark.type) {
                        case 'bold':
                            text = `<strong>${text}</strong>`;
                            break;
                        case 'italic':
                            text = `<em>${text}</em>`;
                            break;
                        case 'underline':
                            text = `<u>${text}</u>`;
                            break;
                        case 'code':
                            text = `<code>${text}</code>`;
                            break;
                    }
                });
            }
            
            return text;
            
        default:
            console.log('Unknown node type:', node.nodeType);
            return '';
    }
}

// Function to render the blog post content
function renderBlogPost(post) {
    // Set the page title and meta tags dynamically
    updateMetaTags(post);
    
    // Set the post content
    document.getElementById('post-title').textContent = post.fields.title;
    
    // Format date
    const date = new Date(post.sys.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('post-date').textContent = formattedDate;
    
    // Set category
    const categoryElement = document.getElementById('post-category');
    categoryElement.textContent = post.fields.category || 'General';
    
    // Set featured image
    const featuredImageElement = document.getElementById('featured-image');
    if (post.featuredImageUrl) {
        featuredImageElement.src = post.featuredImageUrl;
        featuredImageElement.alt = post.fields.title;
    } else {
        featuredImageElement.style.display = 'none';
    }
    
    // Set content
    const contentElement = document.getElementById('post-content');
    
    // Check if content is an object (rich text) or a string
    if (typeof post.fields.content === 'object') {
        console.log('Content is a Rich Text object');
        // Render Rich Text content
        contentElement.innerHTML = renderRichText(post.fields.content);
    } else {
        contentElement.innerHTML = post.fields.content || post.fields.excerpt || 'No content available';
    }
}

// Function to update meta tags for SEO
function updateMetaTags(post) {
    // Add fallbacks as specified in the requirements
    const metaTitle = post.fields.title || "Affordable SME Websites | Webanise.Me";
    const metaDesc = post.fields.excerpt || "Webanise.Me helps SMEs get affordable websites";
    const metaImage = post.featuredImageUrl || "";
    const metaSlug = post.fields.slug || "";
    
    // Update the document title
    document.title = `${metaTitle} | Affordable SME Websites | Webanise.Me`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', metaDesc);
    }
    
    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', metaTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.setAttribute('content', metaDesc);
    }
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && metaImage) {
        // Don't add https: prefix again since it's already included in featuredImageUrl
        ogImage.setAttribute('content', metaImage);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && metaSlug) {
        canonicalLink.setAttribute('href', `https://webanise.me/blog-post.html?slug=${metaSlug}`);
    }
}

// Function to get share counts from local storage
function getShareCounts(postSlug) {
    const countsString = localStorage.getItem(`share_counts_${postSlug}`);
    if (countsString) {
        return JSON.parse(countsString);
    }
    return {
        facebook: 0,
        twitter: 0,
        linkedin: 0,
        whatsapp: 0,
        email: 0,
        copy: 0,
        total: 0
    };
}

// Function to save share counts to local storage
function saveShareCount(postSlug, platform) {
    const counts = getShareCounts(postSlug);
    counts[platform]++;
    counts.total++;
    localStorage.setItem(`share_counts_${postSlug}`, JSON.stringify(counts));
    return counts;
}

// Function to update share count display
function updateShareCountDisplay(postSlug) {
    const counts = getShareCounts(postSlug);
    const totalCountElement = document.getElementById('total-share-count');
    if (totalCountElement) {
        totalCountElement.textContent = counts.total > 0 ? counts.total : '';
        
        // Only show the badge if there are shares
        if (counts.total > 0) {
            totalCountElement.classList.remove('hidden');
        } else {
            totalCountElement.classList.add('hidden');
        }
    }
}

// Function to create and show a toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `flex items-center p-4 mb-3 rounded-lg shadow-lg transition-all transform translate-y-0 opacity-100 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    
    // Add icon based on type
    const icon = document.createElement('i');
    icon.className = `mr-2 ${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}`;
    toast.appendChild(icon);
    
    // Add message
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    toast.appendChild(messageEl);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-2', 'opacity-0');
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Function to setup social sharing buttons
function setupSocialSharing(post) {
    // Get the current page URL
    const currentUrl = window.location.href;
    
    // Get the post title
    const postTitle = post.fields.title;
    
    // Get the post excerpt for description
    const postDescription = post.fields.excerpt || '';
    
    // Get the post slug for tracking shares
    const postSlug = post.fields.slug;
    
    // Initialize share count display
    updateShareCountDisplay(postSlug);
    
    // Setup Facebook sharing
    const facebookBtn = document.querySelector('.share-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            window.open(facebookUrl, 'facebook-share', 'width=580,height=296');
            showToast('Sharing on Facebook');
            saveShareCount(postSlug, 'facebook');
            updateShareCountDisplay(postSlug);
        });
    }
    
    // Setup Twitter/X sharing
    const twitterBtn = document.querySelector('.share-twitter');
    if (twitterBtn) {
        twitterBtn.addEventListener('click', function() {
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(currentUrl)}`;
            window.open(twitterUrl, 'twitter-share', 'width=550,height=235');
            showToast('Sharing on Twitter/X');
            saveShareCount(postSlug, 'twitter');
            updateShareCountDisplay(postSlug);
        });
    }
    
    // Setup LinkedIn sharing
    const linkedinBtn = document.querySelector('.share-linkedin');
    if (linkedinBtn) {
        linkedinBtn.addEventListener('click', function() {
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
            window.open(linkedinUrl, 'linkedin-share', 'width=750,height=600');
            showToast('Sharing on LinkedIn');
            saveShareCount(postSlug, 'linkedin');
            updateShareCountDisplay(postSlug);
        });
    }
    
    // Setup WhatsApp sharing
    const whatsappBtn = document.querySelector('.share-whatsapp');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(postTitle + ' ' + currentUrl)}`;
            window.open(whatsappUrl, 'whatsapp-share', 'width=580,height=296');
            showToast('Sharing on WhatsApp');
            saveShareCount(postSlug, 'whatsapp');
            updateShareCountDisplay(postSlug);
        });
    }
    
    // Setup Email sharing
    const emailBtn = document.querySelector('.share-email');
    if (emailBtn) {
        emailBtn.addEventListener('click', function() {
            const subject = encodeURIComponent(postTitle);
            const body = encodeURIComponent(`Check out this article: ${postTitle}\n\n${postDescription}\n\n${currentUrl}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
            showToast('Opening email client');
            saveShareCount(postSlug, 'email');
            updateShareCountDisplay(postSlug);
        });
    }
    
    // Setup Copy Link functionality
    const copyBtn = document.querySelector('.share-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(currentUrl);
                showToast('Link copied to clipboard!');
                saveShareCount(postSlug, 'copy');
                updateShareCountDisplay(postSlug);
            } catch (err) {
                // Fallback for browsers that don't support clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = currentUrl;
                textArea.style.position = 'fixed';  // Avoid scrolling to bottom
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        showToast('Link copied to clipboard!');
                        saveShareCount(postSlug, 'copy');
                        updateShareCountDisplay(postSlug);
                    } else {
                        showToast('Failed to copy link', 'error');
                    }
                } catch (err) {
                    showToast('Failed to copy link', 'error');
                }
                
                document.body.removeChild(textArea);
            }
        });
    }
}

// Function to load related posts
async function loadRelatedPosts(currentPost) {
    try {
        // Fetch posts with the same category, excluding the current post
        // Remove the select parameter which is causing the 422 error
        const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries?access_token=${accessToken}&content_type=${contentTypeId}&fields.category=${currentPost.fields.category || 'General'}&limit=3`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch related posts');
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            document.getElementById('related-posts').innerHTML = '<p class="text-center col-span-full">No related posts found.</p>';
            return;
        }
        
        // Filter out the current post
        const relatedPosts = data.items.filter(post => post.fields.slug !== currentPost.fields.slug);
        
        // Get assets
        const assets = data.includes?.Asset || [];
        
        // Render related posts
        renderRelatedPosts(relatedPosts, assets);
        
    } catch (error) {
        console.error('Error loading related posts:', error);
        document.getElementById('related-posts').innerHTML = '<p class="text-center col-span-full">Failed to load related posts.</p>';
    }
}

// Function to render related posts
function renderRelatedPosts(posts, assets) {
    const relatedPostsContainer = document.getElementById('related-posts');
    relatedPostsContainer.innerHTML = '';
    
    // If no related posts, hide the section
    if (posts.length === 0) {
        const relatedSection = relatedPostsContainer.closest('.mt-16');
        if (relatedSection) {
            relatedSection.style.display = 'none';
        }
        return;
    }
    
    // Render each related post
    posts.slice(0, 3).forEach(post => {
        // Find the featured image asset
        const featuredImageId = post.fields.featuredImage?.sys?.id;
        const featuredImage = featuredImageId ?
            assets.find(asset => asset.sys.id === featuredImageId) : null;
        
        // Format date
        const date = new Date(post.sys.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create post element
        const postElement = document.createElement('div');
        postElement.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300';
        
        // Generate post HTML
        postElement.innerHTML = `
            <div class="relative">
                ${featuredImage ?
                    `<img src="https:${featuredImage.fields.file.url}" alt="${post.fields.title}" class="w-full h-48 object-cover">` :
                    `<div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-500">No image available</span>
                    </div>`
                }
            </div>
            <div class="p-6">
                <div class="text-sm text-gray-500 mb-2">${formattedDate}</div>
                <h3 class="text-xl font-bold text-secondary mb-3 hover:text-primary transition-colors">
                    ${post.fields.title}
                </h3>
                <p class="text-gray-600 mb-4">${post.fields.excerpt || ''}</p>
                <a href="./blog-post.html?slug=${post.fields.slug}" class="text-primary font-bold hover:underline transition-colors">
                    Read More
                </a>
            </div>
        `;
        
        // Add to container
        relatedPostsContainer.appendChild(postElement);
    });
}

// Function to show error message
function showError(message) {
    const mainContent = document.querySelector('main .container');
    mainContent.innerHTML = `
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 class="text-3xl font-bold text-secondary mb-4">Error</h1>
            <p class="text-xl text-gray-600 mb-6">${message}</p>
            <a href="index.html#blog" class="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-secondary transition duration-300">
                Back to Blog
            </a>
        </div>
    `;
}

// Function to setup theme switcher
function setupThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    if (themeToggle) {
        // Check for saved theme preference or use preferred color scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark-mode');
            themeToggle.checked = true;
            if (mobileThemeToggle) mobileThemeToggle.checked = true;
        }
        
        // Toggle theme when switch is clicked
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                if (mobileThemeToggle) mobileThemeToggle.checked = true;
            } else {
                document.documentElement.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                if (mobileThemeToggle) mobileThemeToggle.checked = false;
            }
        });
        
        // Mobile theme toggle
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('change', function() {
                if (this.checked) {
                    document.documentElement.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                    themeToggle.checked = true;
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                    themeToggle.checked = false;
                }
            });
        }
        
        // Toggle theme when switch is clicked
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                if (mobileThemeToggle) mobileThemeToggle.checked = true;
            } else {
                document.documentElement.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                if (mobileThemeToggle) mobileThemeToggle.checked = false;
            }
        });
        
        // Mobile theme toggle
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('change', function() {
                if (this.checked) {
                    document.documentElement.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                    themeToggle.checked = true;
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                    themeToggle.checked = false;
                }
            });
        }
    }
}

// Function to setup mobile menu
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            // Toggle icon between bars and X
            const icon = menuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}