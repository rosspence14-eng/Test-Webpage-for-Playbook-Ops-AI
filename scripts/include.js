// Function to load external HTML components
function loadComponent(elementId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading component:', error));
}

// Function to initialize scripts after components are loaded
function initializeScripts() {
    // Initialize hamburger menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (navToggle && mainNav) {
        // Remove any existing listeners by cloning and replacing
        const newToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newToggle, navToggle);
        
        // Add the click listener to the new element
        newToggle.addEventListener('click', function() {
            mainNav.classList.toggle('expanded');
            newToggle.setAttribute('aria-expanded', mainNav.classList.contains('expanded'));
        });
    }
    
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load both components and initialize after both are done
    Promise.all([
        loadComponent('header-container', 'components/header.html'),
        loadComponent('footer-container', 'components/footer.html')
    ]).then(() => {
        initializeScripts();
    });
});
