document.addEventListener('DOMContentLoaded', function() {
    // Debug information
    console.log('Base URL:', window.location.href);
    console.log('Path:', window.location.pathname);
    console.log('Origin:', window.location.origin);
    
    // Test Contentful API access
    const testContentfulAccess = async () => {
        try {
            const spaceId = '7rdix4olosoz';
            const accessToken = 'mGfX5V-d5lT1htDzVHimXxJ4eEJ4vn3M8OPtXcdL4as';
            const url = `https://cdn.contentful.com/spaces/${spaceId}?access_token=${accessToken}`;
            
            console.log('Testing Contentful API access...');
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Contentful API accessible:', response.ok);
            console.log('Space name:', data.name);
            return response.ok;
        } catch (error) {
            console.error('Error accessing Contentful API:', error);
            return false;
        }
    };
    
    testContentfulAccess();
    
    // Test content types
    const testContentTypes = async () => {
        try {
            const spaceId = '7rdix4olosoz';
            const accessToken = 'mGfX5V-d5lT1htDzVHimXxJ4eEJ4vn3M8OPtXcdL4as';
            const url = `https://cdn.contentful.com/spaces/${spaceId}/content_types?access_token=${accessToken}`;
            
            console.log('Fetching content types...');
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Content types accessible:', response.ok);
            if (response.ok && data.items) {
                console.log('Available content types:');
                data.items.forEach(type => {
                    console.log(`- ${type.sys.id}: ${type.name}`);
                });
            }
        } catch (error) {
            console.error('Error fetching content types:', error);
        }
    };
    
    testContentTypes();
    
    // Test for any entries
    const testEntries = async () => {
        try {
            const spaceId = '7rdix4olosoz';
            const accessToken = 'mGfX5V-d5lT1htDzVHimXxJ4eEJ4vn3M8OPtXcdL4as';
            const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}`;
            
            console.log('Fetching all entries...');
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('Entries accessible:', response.ok);
            if (response.ok && data.items) {
                console.log('Total entries found:', data.items.length);
                if (data.items.length > 0) {
                    console.log('First entry content type:', data.items[0].sys.contentType.sys.id);
                    console.log('First entry fields:', Object.keys(data.items[0].fields));
                }
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };
    
    testEntries();
    // Update copyright year automatically
    const copyrightYearElement = document.getElementById('copyright-year');
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // In a real application, you would send this to your server
                console.log('Newsletter subscription for:', emailInput.value);
                
                // Show success message
                const formHTML = newsletterForm.innerHTML;
                newsletterForm.innerHTML = `
                    <div class="bg-green-500 bg-opacity-20 text-white p-4 rounded-md text-center">
                        <i class="fas fa-check-circle text-2xl mb-2"></i>
                        <p>Thank you for subscribing!</p>
                    </div>
                `;
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    newsletterForm.innerHTML = formHTML;
                }, 3000);
            }
        });
    }
    
    // Add hover animations for social icons
    const socialIcons = document.querySelectorAll('.social-icon-link');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            const iconElement = this.querySelector('i');
            iconElement.classList.add('animate-bounce');
            setTimeout(() => {
                iconElement.classList.remove('animate-bounce');
            }, 1000);
        });
    });
    
    // Mobile menu toggle
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
    
    // Sticky header with logo shrink on scroll
    const mainNav = document.getElementById('main-nav');
    const logoImg = mainNav.querySelector('img');
    const initialLogoSize = 'h-20';
    const scrolledLogoSize = 'h-16';
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            mainNav.classList.add('bg-white', 'shadow-md');
            if (logoImg.classList.contains(initialLogoSize)) {
                logoImg.classList.remove(initialLogoSize);
                logoImg.classList.add(scrolledLogoSize);
                logoImg.classList.add('transition-all', 'duration-300');
            }
        } else {
            if (logoImg.classList.contains(scrolledLogoSize)) {
                logoImg.classList.remove(scrolledLogoSize);
                logoImg.classList.add(initialLogoSize);
            }
        }
    });
    
    // FAQ section has been removed
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    menuBtn.querySelector('i').classList.remove('fa-times');
                    menuBtn.querySelector('i').classList.add('fa-bars');
                }
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Enhanced form validation and submission with real-time validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');
        const submitButton = document.getElementById('submit-button');
        const loadingSpinner = submitButton.querySelector('.loading-spinner');
        const formSuccess = document.getElementById('formSuccess');
        const fileInput = document.getElementById('attachment');
        const fileNameDisplay = document.getElementById('file-name');
        
        // Real-time validation for inputs
        const inputs = [nameInput, emailInput, phoneInput, messageInput];
        
        inputs.forEach(input => {
            if (!input) return;
            
            // Validate on blur (when user leaves the field)
            input.addEventListener('blur', function() {
                validateInput(input);
            });
            
            // Clear error on input
            input.addEventListener('input', function() {
                const validationMessage = input.parentElement.querySelector('.validation-message');
                if (validationMessage) {
                    validationMessage.classList.add('hidden');
                    input.classList.remove('border-red-500');
                }
            });
        });
        
        // File upload handling
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        fileNameDisplay.textContent = 'File is too large. Maximum size is 5MB.';
                        fileNameDisplay.classList.add('text-red-500');
                        fileInput.value = ''; // Clear the input
                        return;
                    }
                    
                    // Display file name
                    fileNameDisplay.textContent = `Selected file: ${file.name}`;
                    fileNameDisplay.classList.remove('text-red-500');
                }
            });
        }
        
        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all required inputs
            let isValid = true;
            
            // Reset previous error states
            const allInputs = contactForm.querySelectorAll('input, textarea, select');
            allInputs.forEach(input => {
                if (input.required) {
                    const isInputValid = validateInput(input);
                    if (!isInputValid) isValid = false;
                }
            });
            
            if (isValid) {
                // Show loading spinner
                loadingSpinner.classList.remove('hidden');
                submitButton.disabled = true;
                
                // Simulate form submission (replace with actual AJAX in production)
                setTimeout(() => {
                    // Hide form and show success message
                    contactForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                    
                    // Reset form
                    contactForm.reset();
                    if (fileNameDisplay) fileNameDisplay.textContent = '';
                    
                    // Hide loading spinner
                    loadingSpinner.classList.add('hidden');
                    submitButton.disabled = false;
                    
                    // In a real application, you would send the form data to a server here
                    console.log('Form submitted successfully');
                }, 1500);
            }
        });
    }
    
    // Function to validate a single input
    function validateInput(input) {
        if (!input) return true;
        
        const validationMessage = input.parentElement.querySelector('.validation-message');
        if (!validationMessage) return true;
        
        let isValid = true;
        let message = '';
        
        // Check if required field is empty
        if (input.required && !input.value.trim()) {
            isValid = false;
            message = `This field is required`;
        }
        // Email validation
        else if (input.type === 'email' && input.value.trim() && !isValidEmail(input.value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
        // Phone validation if has a pattern
        else if (input.type === 'tel' && input.value.trim() && input.pattern && !new RegExp(input.pattern).test(input.value)) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
        
        if (!isValid) {
            input.classList.add('border-red-500');
            validationMessage.textContent = message;
            validationMessage.classList.remove('hidden');
        } else {
            input.classList.remove('border-red-500');
            validationMessage.classList.add('hidden');
        }
        
        return isValid;
    }
    
    // Design process animations are handled by the scroll animations
    
    // No testimonial slider needed for commitment section
    
    // Animate elements on scroll
    setupScrollAnimations();
    
    // Initialize theme switcher
    setupThemeSwitcher();
    
    // Initialize scroll to top button
    setupScrollToTop();
    
    // Initialize blog functionality if the blog section exists
    if (document.getElementById('blog-posts')) {
        setupBlog();
    }
});

// Helper functions
function showError(input, message) {
    input.classList.add('border-red-500');
    
    const errorMessage = document.createElement('p');
    errorMessage.className = 'text-red-500 text-sm mt-1 error-message';
    errorMessage.textContent = message;
    
    input.parentElement.appendChild(errorMessage);
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Function removed: setupPortfolioFilter was removed as it's no longer needed

// Function removed: setupTestimonialSlider was removed as it's no longer needed

function setupScrollAnimations() {
    // Add animation classes to elements when they come into view
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .checkmark-icon, footer .container');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Special animation for checkmark icon
                    if (entry.target.classList.contains('checkmark-icon')) {
                        // Add a slight delay for the checkmark animation
                        setTimeout(() => {
                            entry.target.style.animationPlayState = 'running';
                        }, 300);
                    }
                    
                    // Optional: remove from observation once animated
                    // observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(element => {
            // Set checkmark icons to have paused animation initially
            if (element.classList.contains('checkmark-icon')) {
                element.style.animationPlayState = 'paused';
            }
            observer.observe(element);
        });
    }
}

// Add a simple theme switcher (light/dark mode)
function setupThemeSwitcher() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    // Function to set theme
    const setTheme = function(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (themeToggle) themeToggle.checked = true;
            if (mobileThemeToggle) mobileThemeToggle.checked = true;
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (themeToggle) themeToggle.checked = false;
            if (mobileThemeToggle) mobileThemeToggle.checked = false;
        }
    };
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setTheme(true);
    }
    
    // Toggle theme when switches are clicked
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            setTheme(this.checked);
        });
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('change', function() {
            setTheme(this.checked);
        });
    }
}

// Setup scroll to top button functionality
function setupScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    if (scrollTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when button is clicked
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Blog functionality with Contentful integration - SIMPLIFIED VERSION
function setupBlog() {
    const blogPostsContainer = document.getElementById('blog-posts');
    const loadMoreButton = document.getElementById('load-more-posts');
    let currentPage = 1;
    const postsPerPage = 10; // Show more posts at once
    
    // Function to fetch blog posts from Contentful
    async function fetchBlogPosts(page = 1) {
        try {
            // Contentful credentials
            const spaceId = '7rdix4olosoz';
            const accessToken = 'mGfX5V-d5lT1htDzVHimXxJ4eEJ4vn3M8OPtXcdL4as';
            const contentTypeId = 'webaniseMe';
            const environmentId = 'master';
            
            const skip = (page - 1) * postsPerPage;
            // Ensure these fields are requested as specified in the requirements - now including content field
            const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries?access_token=${accessToken}&content_type=${contentTypeId}&limit=${postsPerPage}&skip=${skip}&order=-sys.createdAt`;
            
            console.log('Fetching blog posts from URL:', url);
            
            const response = await fetch(url);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch blog posts: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Data received:', data ? 'Yes' : 'No');
            return data;
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            console.log('Error details:', error.message);
            return null;
        }
    }
    
    // Function to render blog posts
    function renderBlogPosts(posts, assets) {
        // Clear loading placeholders if it's the first page
        if (currentPage === 1) {
            blogPostsContainer.innerHTML = '';
        }
        
        // If no posts are returned, show a message
        if (!posts || posts.length === 0) {
            const noPostsMessage = document.createElement('div');
            noPostsMessage.className = 'col-span-full text-center py-8';
            noPostsMessage.innerHTML = `
                <p class="text-xl text-gray-600">No blog posts found. Check back soon!</p>
            `;
            blogPostsContainer.appendChild(noPostsMessage);
            
            // Hide load more button
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
            }
            return;
        }
        
        // Process and render each post
        posts.forEach(post => {
            // Find the featured image asset
            const featuredImageId = post.fields.featuredImage?.sys?.id;
            const featuredImage = featuredImageId ?
                assets.find(asset => asset.sys.id === featuredImageId) : null;
            
            // Create post element
            const postElement = document.createElement('div');
            postElement.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 animate-on-scroll';
            
            // Format date
            const date = new Date(post.sys.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Generate post HTML - now showing full content directly
            postElement.innerHTML = `
                <div class="relative">
                    ${featuredImage ?
                        `<img src="${featuredImage.fields.file.url}" alt="${post.fields.title}" class="w-full h-48 object-cover">` :
                        `<div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span class="text-gray-500">No image available</span>
                        </div>`
                    }
                    <div class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 m-2 rounded">
                        ${post.fields.category || 'General'}
                    </div>
                </div>
                <div class="p-6">
                    <div class="text-sm text-gray-500 mb-2">${formattedDate}</div>
                    <h3 class="text-xl font-bold text-secondary mb-3">
                        ${post.fields.title}
                    </h3>
                    <p class="text-gray-600 mb-4">
                        ${post.fields.excerpt || (post.fields.content ? post.fields.content.substring(0, 200) + '...' : 'No content available')}
                    </p>
                    <a href="./blog-post.html?slug=${post.fields.slug}" class="text-primary font-bold hover:underline transition-colors">Read More</a>
                </div>
            `;
            
            // No click event needed as the link now navigates directly to the blog post page
            
            // Add to container
            blogPostsContainer.appendChild(postElement);
        });
        
        // Initialize animations for new elements
        setupScrollAnimations();
    }
    
    // We're now showing full content directly on the page, so no modal needed
    
    // Load initial blog posts
    async function loadBlogPosts(page = 1) {
        console.log('Fetching blog posts, page:', page);
        const data = await fetchBlogPosts(page);
        
        console.log('Blog data received:', data ? 'Yes' : 'No');
        
        if (data) {
            const posts = data.items;
            console.log('Number of posts received:', posts?.length);
            if (posts && posts.length > 0) {
                console.log('First post title:', posts[0].fields?.title);
                console.log('First post slug:', posts[0].fields?.slug);
            }
            
            const assets = data.includes?.Asset || [];
            console.log('Number of assets received:', assets.length);
            
            renderBlogPosts(posts, assets);
            
            // Hide load more button if no more posts
            if (posts.length < postsPerPage) {
                if (loadMoreButton) {
                    loadMoreButton.style.display = 'none';
                }
            }
        }
    }
    
    // Add event listener to load more button
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            currentPage++;
            loadBlogPosts(currentPage);
        });
    }
    
    // Initial load
    loadBlogPosts();
}