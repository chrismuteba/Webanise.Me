document.addEventListener('DOMContentLoaded', async function() {
    // Debug information
    console.log('Blog Post Page - Base URL:', window.location.href);
    console.log('Blog Post Page - Path:', window.location.pathname);
    console.log('Blog Post Page - Origin:', window.location.origin);
    console.log('Blog Post Page - Search:', window.location.search);
    // Get the current slug from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const currentSlug = urlParams.get('slug');
    
    if (!currentSlug) {
        showError('Blog post not found');
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
const contentTypeId = 'blogPost';

// Function to fetch a specific blog post by slug
async function loadBlogPost(slug) {
    try {
        console.log('Attempting to load blog post with slug:', slug);
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
    try {
        // Ensure these fields are requested as specified in the requirements
        const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=${contentTypeId}&fields.slug=${slug}&select=fields.title,fields.excerpt,fields.slug,fields.featuredImage,fields.content,fields.category,sys.createdAt`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch blog post');
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            return null;
        }
        
        // Get the post and assets
        const post = data.items[0];
        const assets = data.includes?.Asset || [];
        
        // Find the featured image asset
        const featuredImageId = post.fields.featuredImage?.sys?.id;
        const featuredImage = featuredImageId ?
            assets.find(asset => asset.sys.id === featuredImageId) : null;
        
        // Add the featured image URL to the post object
        if (featuredImage) {
            post.featuredImageUrl = featuredImage.fields.file.url;
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
    contentElement.innerHTML = post.fields.content;
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
        ogImage.setAttribute('content', `https:${metaImage}`);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && metaSlug) {
        canonicalLink.setAttribute('href', `https://webanise.me/blog-post.html?slug=${metaSlug}`);
    }
}

// Function to load related posts
async function loadRelatedPosts(currentPost) {
    try {
        // Fetch posts with the same category, excluding the current post
        const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=${contentTypeId}&fields.category=${currentPost.fields.category || 'General'}&limit=3&select=fields.title,fields.excerpt,fields.slug,fields.featuredImage,sys.createdAt`;
        
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
                    `<img src="${featuredImage.fields.file.url}" alt="${post.fields.title}" class="w-full h-48 object-cover">` :
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
            <a href="../index.html#blog" class="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-secondary transition duration-300">
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
