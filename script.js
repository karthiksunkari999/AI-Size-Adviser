// State
let purchases = [];
let collections = [];

// DOM Elements
const purchaseForm = document.getElementById('purchase-form');
const purchaseList = document.getElementById('purchase-list');
const recommendationForm = document.getElementById('recommendation-form');
const chatForm = document.getElementById('chat-form');
const apiKeyInput = document.getElementById('api-key');
const collectionsGrid = document.getElementById('collections-grid');
const emptyCollectionMsg = document.getElementById('empty-collection-msg');

// Initialize
function init() {
    renderPurchases();
    renderCollections();
}

// --- Navigation Logic ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all nav buttons and views
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

        // Add active class to clicked button and target view
        btn.classList.add('active');
        const targetViewId = btn.getAttribute('data-target');
        const targetView = document.getElementById(targetViewId);
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
    });
});

// --- Shop Features (Filter & Search) ---
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('#main-product-grid .product-card');

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const brandFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'All';

    productCards.forEach(card => {
        const brand = card.getAttribute('data-brand');
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        
        const matchesSearch = title.includes(searchTerm) || brand.toLowerCase().includes(searchTerm);
        const matchesBrand = brandFilter === 'All' || brand === brandFilter;

        if (matchesSearch && matchesBrand) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

if(searchInput) searchInput.addEventListener('input', filterProducts);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProducts();
    });
});


// --- Collections Logic ---
document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const brand = card.querySelector('.product-brand').textContent;
        const title = card.querySelector('.product-title').textContent;
        const price = card.querySelector('.product-price').textContent;
        const imgSrc = card.querySelector('.product-image').src;
        
        const item = { id: Date.now().toString(), brand, title, price, imgSrc };
        
        // Check if already saved (basic check by title)
        if (!collections.some(c => c.title === title)) {
            collections.push(item);
            renderCollections();
            
            btn.textContent = '❤️ Saved!';
            btn.style.backgroundColor = '#ec4899';
            btn.style.color = 'white';
        } else {
            btn.textContent = 'Already Saved';
        }
        
        setTimeout(() => {
            btn.textContent = '❤️ Save';
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }, 2000);
    });
});

function removeFromCollection(id) {
    collections = collections.filter(c => c.id !== id);
    renderCollections();
}

function renderCollections() {
    if (!collectionsGrid) return;
    collectionsGrid.innerHTML = '';
    
    if (collections.length === 0) {
        emptyCollectionMsg.style.display = 'block';
    } else {
        emptyCollectionMsg.style.display = 'none';
        collections.forEach(item => {
            const div = document.createElement('div');
            div.className = 'product-card glass-panel';
            div.innerHTML = `
                <img src="${item.imgSrc}" alt="${item.title}" class="product-image">
                <div class="product-info">
                    <h3 class="product-brand">${item.brand}</h3>
                    <h2 class="product-title">${item.title}</h2>
                    <p class="product-price">${item.price}</p>
                    <div class="product-actions" style="margin-top: auto;">
                        <button class="btn secondary-btn btn-small" onclick="removeFromCollection('${item.id}')" style="width: 100%; border-color: var(--danger); color: var(--danger);">Remove</button>
                    </div>
                </div>
            `;
            collectionsGrid.appendChild(div);
        });
    }
}

// (Sidebar elements removed, now using view-advisor)

// Product Size Help Buttons
document.querySelectorAll('.size-help-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const productInfo = e.target.closest('.product-info');
        const brand = productInfo.querySelector('.product-brand').getAttribute('data-brand') || productInfo.querySelector('.product-brand').textContent;
        const itemType = productInfo.querySelector('.product-title').getAttribute('data-item') || productInfo.querySelector('.product-title').textContent;

        document.getElementById('target-brand').value = brand;
        document.getElementById('target-item').value = itemType;

        // Navigate to the size advisor view
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

        const advisorBtn = document.querySelector('.nav-btn[data-target="view-advisor"]');
        if (advisorBtn) advisorBtn.classList.add('active');
        
        const advisorView = document.getElementById('view-advisor');
        advisorView.classList.remove('hidden');
        advisorView.classList.add('active');
        
        // Highlight the form slightly to draw attention
        const recForm = document.getElementById('recommendation-form');
        recForm.style.transform = 'scale(1.02)';
        recForm.style.boxShadow = '0 0 15px var(--primary-color)';
        setTimeout(() => {
            recForm.style.transform = '';
            recForm.style.boxShadow = '';
        }, 1000);
        
        // Scroll to the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Add to cart placeholder
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const cartText = document.querySelector('.nav-cart');
        const currentCount = parseInt(cartText.textContent.match(/\d+/)[0]);
        cartText.textContent = `Cart (${currentCount + 1})`;
        btn.textContent = 'Added!';
        btn.style.backgroundColor = 'var(--success)';
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.style.backgroundColor = '';
        }, 1500);
    });
});

// System Prompt for Domain Restriction
const SYSTEM_PROMPT = `
You are the "AI Online Shopping Size Advisor". Your ONLY purpose is to suggest the right clothing size based on past purchases or answer general questions strictly related to clothing sizing, fit, and apparel dimensions.

CRITICAL RULES:
1. DO NOT answer any questions outside the domain of clothing sizes, footwear sizes, apparel fit, or fashion sizing advice.
2. If the user asks about anything else (e.g., coding, history, math, weather, general chatting), respond with exactly: "I am a Size Advisor. I can only help you with questions related to clothing and footwear sizing."
3. When giving size recommendations based on past purchases, analyze the brands, item types, sizes, and how they fit to deduce the best size for the target brand and item.
4. Keep your responses concise, helpful, and formatted beautifully using markdown (bolding key parts).
5. If the past purchase data is insufficient, tell the user what typical sizing looks like for the target brand.
`;

// Helper: Call Gemini API directly from browser
async function callGeminiAPI(promptText, retries = 3, delay = 1500) {
    const apiKey = document.getElementById('api-key').value.trim();
    if (!apiKey) {
        throw new Error("Please enter your Gemini API Key in the box above.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT + "\n\nUser Request: " + promptText }]
            }
        ],
        generationConfig: {
            temperature: 0.2,
        }
    };

    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData.error?.message || "Failed to fetch response from AI.";
            
            if (response.status === 503 && i < retries - 1) {
                console.warn(`API overloaded, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; 
                continue;
            }
            
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}

// Format Markdown-like text to HTML simply
function formatResponse(text) {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
}

// Add Purchase
if(purchaseForm) {
    purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const brand = document.getElementById('brand').value.trim();
        const itemType = document.getElementById('item-type').value.trim();
        const size = document.getElementById('size').value.trim();
        const fit = document.getElementById('fit').value;

        const purchase = {
            id: Date.now().toString(),
            brand,
            itemType,
            size,
            fit
        };

        purchases.push(purchase);
        
        purchaseForm.reset();
        renderPurchases();
    });
}

// Delete Purchase
function deletePurchase(id) {
    purchases = purchases.filter(p => p.id !== id);
    renderPurchases();
}

// Render Purchases
function renderPurchases() {
    if(!purchaseList) return;
    purchaseList.innerHTML = '';
    
    if (purchases.length === 0) {
        purchaseList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 10px;">No past purchases added yet.</p>';
        return;
    }

    purchases.forEach(p => {
        const div = document.createElement('div');
        div.className = 'purchase-item';
        div.innerHTML = `
            <div class="purchase-details">
                <span class="purchase-title">${p.brand} - ${p.itemType}</span>
                <span class="purchase-meta">Size: ${p.size} | Fit: ${p.fit}</span>
            </div>
            <button class="delete-btn" onclick="deletePurchase('${p.id}')" title="Delete">&times;</button>
        `;
        purchaseList.appendChild(div);
    });
}

// Handle Recommendation Request
if(recommendationForm) {
    recommendationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const targetBrand = document.getElementById('target-brand').value.trim();
        const targetItem = document.getElementById('target-item').value.trim();
        
        const container = document.getElementById('result-container');
        const loader = document.getElementById('loader');
        const responseDiv = document.getElementById('ai-response');

        container.classList.remove('hidden');
        loader.classList.remove('hidden');
        responseDiv.innerHTML = '';

        const purchaseHistoryText = purchases.length > 0 
            ? purchases.map(p => `- Bought ${p.brand} ${p.itemType} in size ${p.size}, fit was: ${p.fit}`).join('\n')
            : "No past purchase history provided.";

        const promptText = `
        I am looking to buy a **${targetItem}** from **${targetBrand}**.
        
        Here is my past purchase history:
        ${purchaseHistoryText}
        
        Based on this data, what size should I get for the ${targetBrand} ${targetItem}? Please provide a clear recommendation and a brief explanation.
        `;

        try {
            const aiText = await callGeminiAPI(promptText);
            responseDiv.innerHTML = formatResponse(aiText);
        } catch (error) {
            responseDiv.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
        } finally {
            loader.classList.add('hidden');
        }
    });
}

// Handle Chat Request
if(chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const input = document.getElementById('chat-input').value.trim();
        
        const container = document.getElementById('chat-result-container');
        const loader = document.getElementById('chat-loader');
        const responseDiv = document.getElementById('chat-response');

        container.classList.remove('hidden');
        loader.classList.remove('hidden');
        responseDiv.innerHTML = '';

        try {
            const aiText = await callGeminiAPI(input);
            responseDiv.innerHTML = formatResponse(aiText);
        } catch (error) {
            responseDiv.innerHTML = `<span style="color: var(--danger);">Error: ${error.message}</span>`;
        } finally {
            loader.classList.add('hidden');
        }
    });
}

init();
