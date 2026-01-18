/**
 * Zero-Point Culinary Logistics Agent - Logic Core (v3 Agentic)
 */

window.addEventListener('DOMContentLoaded', () => {
    initAutocomplete();
    updateInventoryUI(); // Load persisted items on start
});

function initAutocomplete() {
    if (typeof INGREDIENT_DB === 'undefined') return;

    const dataList = document.getElementById('ingredient-suggestions');
    if (!dataList) return;

    Object.keys(INGREDIENT_DB).forEach(key => {
        const option = document.createElement('option');
        option.value = key.charAt(0).toUpperCase() + key.slice(1);
        dataList.appendChild(option);
    });
}

// --- UI TABS LOGIC ---
// --- UI TABS LOGIC ---
function switchTab(tabId) {
    // 1. Remove active class from all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
        el.style.display = ''; // Clear any inline styles causing conflicts
    });

    // 2. Add active class to target
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
    }
}

// INTELLIGENCE ENGINE V3: AGENTIC CORE
class CulinaryAgent {
    constructor() {
        this.knowledgeBase = (typeof INGREDIENT_DB !== 'undefined') ? INGREDIENT_DB : {};
    }

    /**
     * Agentic Classification: Determines what an item IS based on heuristics
     */
    classify(itemName) {
        const lower = itemName.toLowerCase();

        // 1. Heuristic Rules (The "Brain")
        if (lower.match(/chicken|beef|pork|fish|egg|tofu|meat|lamb|shrimp|salmon|steak|turkey/)) return { type: 'protein', storage: 'Refrigerate immediately. Cook within 2 days.' };
        if (lower.match(/rice|pasta|bread|quinoa|oats|noodle|flour|potato|couscous|grain/)) return { type: 'carb', storage: 'Keep in a cool, dry place.' };
        if (lower.match(/spinach|kale|lettuce|carrot|broccoli|pepper|onion|garlic|tomato|cucumber|zucchini|cabbage|veg/)) return { type: 'veg', storage: 'Keep in crisper drawer.' };
        if (lower.match(/apple|banana|orange|berry|grape|fruit|lemon|lime|melon/)) return { type: 'fruit', storage: 'Countertop or fridge depending on ripeness.' };
        if (lower.match(/salt|pepper|oil|sauce|spice|herb|sugar|honey|vinegar/)) return { type: 'flavor', storage: 'Pantry shelf.' };
        if (lower.match(/milk|cheese|yogurt|cream|butter/)) return { type: 'dairy', storage: 'Refrigerate. Check expiry.' };

        // 2. Database Fallback
        const dbEntry = this.knowledgeBase[lower];
        if (dbEntry) return { type: 'known', storage: 'Standard pantry/fridge rules.' };

        // 3. Default
        return { type: 'other', storage: 'Check label for storage instructions.' };
    }

    /**
     * Agentic Recipe Generation
     */
    generatePlan(expiringItems, pantryItems, prefs) {
        // Helper: Extract name if object, else return string
        const getName = i => (typeof i === 'object' && i.name) ? i.name : i;
        const getQty = i => (typeof i === 'object' && i.quantity) ? i.quantity : "";

        // Normalize inputs to lists of objects if possible, or string mapping
        // We will assume the inputs might be mixed, so we handle safely.

        const expiringList = expiringItems; // Already objects from new logic or strings
        const pantryList = pantryItems;

        if (!expiringList || expiringList.length === 0) return { wasteSaved: "0", day1: "No items selected.", day2: "-", shoppingList: [], tip: "" };

        const mainObj = expiringList[0];
        const mainItem = getName(mainObj);
        const mainQty = getQty(mainObj) ? `(${getQty(mainObj)})` : "";
        const mainProfile = this.classify(mainItem);

        const secObj = expiringList[1] || pantryList[0] || "Generic Staples";
        const secondaryItem = getName(secObj);
        const secondaryProfile = this.classify(secondaryItem);

        let day1 = { name: "", reason: "" };
        let day2 = { name: "", reason: "" };
        let needed = [];

        // --- Reasoning Logic ---

        // Rule 1: High Heat (Protein)
        if (mainProfile.type === 'protein') {
            day1 = {
                name: `Pan-Seared ${mainItem} with ${secondaryItem}`,
                reason: `High heat kills bacteria on your <b>${mainItem} ${mainQty}</b>. Pair with <b>${secondaryItem}</b> for a balanced meal.`
            };
            day2 = {
                name: `${mainItem} Fried Rice/Hash`,
                reason: `Chop leftover cooked ${mainItem} small and fry with rice/grains to refresh the flavor.`
            };
            needed.push('Soy Sauce', 'Ginger');
        }

        // Rule 2: Quick Sauté (Veg)
        else if (mainProfile.type === 'veg') {
            day1 = {
                name: `Rustic ${mainItem} & ${secondaryItem} Stir-Fry`,
                reason: `Sautéing all <b>${mainQty} of ${mainItem}</b> extracts sweetness before it spoils.`
            };
            day2 = {
                name: `Creamy ${mainItem} Soup`,
                reason: `Puree the leftovers to create a completely new texture.`
            };
            needed.push('Cream or Coconut Milk');
        }

        // Rule 3: Fresh Application (Fruit)
        else if (mainProfile.type === 'fruit') {
            day1 = {
                name: `Fresh ${mainItem} Salad`,
                reason: `Eat <b>${mainItem} ${mainQty}</b> raw while it still has texture.`
            };
            day2 = {
                name: `Warm ${mainItem} Compote`,
                reason: `Cook down the softening fruit into a sauce for yogurt or oats.`
            };
            needed.push('Honey', 'Cinnamon');
        }

        // Rule 4: Dairy/Other
        else if (mainProfile.type === 'dairy') {
            day1 = {
                name: `Creamy ${mainItem} Pasta`,
                reason: `Use <b>${mainItem} ${mainQty}</b> to make a rich sauce.`
            };
            day2 = {
                name: `${mainItem} Pancakes/Savory Galette`,
                reason: `Incorporate into dough or batter.`
            };
            needed.push('Pasta/Flour');
        }

        // Rule 5: Unknown/Generic
        else {
            day1 = {
                name: `Spiced ${mainItem} Skillet`,
                reason: `When in doubt, a hot skillet with spices makes <b>${mainItem} ${mainQty}</b> safe and tasty.`
            };
            day2 = {
                name: `${mainItem} Fritters`,
                reason: `Mash leftovers with binding agents to extend shelf life.`
            };
            needed.push('Eggs', 'Flour');
        }

        // --- Shopping List Logic ---
        // Helper specifically for list of objects/strings
        const checkHas = (list, item) => {
            if (!list) return false;
            return list.some(i => getName(i).toLowerCase().includes(item.toLowerCase()));
        };

        if (!checkHas(pantryList, 'oil')) needed.push('Cooking Oil');
        if (!checkHas(pantryList, 'garlic')) needed.push('Garlic');

        // Cleanup needed list
        needed = [...new Set(needed)].filter(n => !checkHas(pantryList, n));

        // Use a generic weight calc if qty not parseable
        const savedAmt = (expiringList.length * 0.5).toFixed(1) + " kg";

        return {
            wasteSaved: savedAmt,
            day1: `<strong>Agent Recommendation:</strong> <u>${day1.name}</u><br>${day1.reason}`,
            day2: `<strong>Transformation:</strong> <u>${day2.name}</u><br>${day2.reason}`,
            shoppingList: needed,
            tip: `<strong>Chef's Logic:</strong> ${mainProfile.storage}`
        };
    }

    hasItem(list, item) {
        if (!list) return false;
        return list.some(i => i.toLowerCase().includes(item.toLowerCase()));
    }
}

const Agent = new CulinaryAgent();


// --- FORM GENERATION ---
function generateLogisticsPlan() {
    const expiringInput = document.getElementById('expiring').value;
    const pantryInput = document.getElementById('pantry').value;
    const prefsInput = document.getElementById('preferences').value || "";

    // 1. Parse Inputs (Standard List)
    // We do NOT auto-save manual constraints to DB anymore to avoid clutter without quantity
    let expiringItems = parseList(expiringInput);
    let pantryItems = parseList(pantryInput);

    // 2. Fetch All Valid Items from Backend
    const dbItems = InventoryDB.getAllItems();

    dbItems.forEach(itemObj => {
        // Priority Items -> Expiring List
        if (itemObj.isPriority) {
            expiringItems.push(itemObj);
        }
        // Non-Priority Items -> Pantry List (Merge)
        else {
            const nameKey = itemObj.name.toLowerCase();
            const exists = pantryItems.some(i => (typeof i === 'string' ? i : i.name).toLowerCase() === nameKey);
            if (!exists) pantryItems.push(itemObj);
        }
    });

    if (expiringItems.length === 0) {
        alert("CRITICAL: Please choose items to 'Focus on Inventory' (or ensure Inventory has Priority items).");
        return;
    }

    // 2. Operational Logic
    const plan = Agent.generatePlan(expiringItems, pantryItems, prefsInput);

    // 3. Render
    renderOutput(plan);

    // 4. Auto-Switch to Results Tab
    switchTab('tab-results');
}


// --- VISION OCR LOGIC ---
// --- UNIVERSAL SCANNER LOGIC ---
async function handleUniversalUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const statusEl = document.getElementById('scan-status');
    const resultDiv = document.getElementById('scan-results');

    resultDiv.style.display = 'block';
    statusEl.textContent = "Detecting file type...";

    // 1. Excel Check
    if (file.name.match(/\.(xlsx|xls)$/i)) {
        statusEl.textContent = "Processing Excel File...";
        await processExcel(file);
    }
    // 2. Image Check
    else if (file.type.match(/^image\//)) {
        statusEl.textContent = "Processing Image (OCR)...";
        await processImage(file);
    }
    else {
        statusEl.innerHTML = "<span style='color: var(--urgent-accent);'>❌ Unsupported file type. Please upload Excel or Image.</span>";
    }
}

async function processExcel(file) {
    const statusEl = document.getElementById('scan-status');
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let addedCount = 0;

        json.forEach((row, index) => {
            if (row.length < 2) return;
            if (index === 0 && (row[0].toString().toLowerCase().includes('ingredient') || row[0].toString().toLowerCase().includes('name'))) return;

            const name = row[0];
            const qty = row[1];

            if (name) {
                InventoryDB.addItem(name.toString().trim(), qty ? qty.toString().trim() : "", false);
                addedCount++;
            }
        });

        statusEl.innerHTML = `✅ Added ${addedCount} items from Excel.<br>Check <a href="#" onclick="toggleInventoryView()" style="color: var(--primary-accent);">Inventory</a>.`;

    } catch (err) {
        console.error(err);
        statusEl.textContent = "Error reading Excel file.";
    }
}

async function processImage(file) {
    const statusEl = document.getElementById('scan-status');

    try {
        statusEl.textContent = "Scanning image for ingredients & quantities...";

        const { data: { text } } = await Tesseract.recognize(
            file,
            'eng',
            { logger: m => console.log(m) }
        );

        console.log("OCR Raw:", text);
        const items = parseOCRText(text);

        if (items.length > 0) {
            items.forEach(i => InventoryDB.addItem(i.name, i.qty, false));
            statusEl.innerHTML = `✅ Found ${items.length} items from Image.<br>Check Inventory.`;
        } else {
            statusEl.textContent = "⚠️ Could not identify food items clearly. Please try a clearer image.";
        }

    } catch (err) {
        console.error("OCR Error:", err);
        statusEl.textContent = "Failed to scan image. Network required for Tesseract.";
    }
}

function parseOCRText(text) {
    const cleanText = text.replace(/[^a-zA-Z0-9\s,.\n]/g, " ").toLowerCase();
    const lines = cleanText.split(/\n+/);
    const detected = [];

    lines.forEach(line => {
        // Regex to find things like "500g Chicken", "Milk 1L", "2 apples"
        // Strategy: Concept + nearby Number/Unit

        const words = line.split(/\s+/).filter(w => w.length > 2);

        words.forEach(word => {
            const profile = Agent.classify(word);
            if (profile.type !== 'other') {
                // Found a known food concept!
                // Look for quantity in the FULL line
                let qty = "";

                // Match: Number + (g|kg|ml|l|oz|lb|pcs)
                const qtyMatch = line.match(/(\d+\s?(?:g|kg|ml|l|oz|lb|pcs|pack|bottle|can)s?)/i);
                if (qtyMatch) {
                    qty = qtyMatch[1];
                } else {
                    // Match simple number before/after? Risk of prices. 
                    // Let's stick to units or just generic "1" if implies single item? 
                    // For now, leave blank if no unit found to be safe.
                }

                detected.push({ name: word, qty: qty });
            }
        });
    });

    return detected;
}

function renderDetectedInventory(items) {
    // We need a container for this. If not exists, we interact with existing elements or create new ones dynamically.
    // For now, let's look for 'vision-results' and append/update a 'detected-checklist' container.

    let container = document.getElementById('detected-inventory-container');
    if (!container) {
        // Create it if it doesn't exist (Dynamic UI Injection)
        const visionResults = document.getElementById('vision-results');
        container = document.createElement('div');
        container.id = 'detected-inventory-container';
        container.style.marginTop = '15px';
        container.style.padding = '10px';
        container.style.background = 'rgba(255,255,255,0.05)';
        container.style.borderRadius = '8px';

        // Insert before the recipe grid (which is children[2] usually, or just append after status)
        visionResults.insertBefore(container, visionResults.children[1]);
    }

    container.innerHTML = `
        <h4 style="color: var(--primary-accent); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>📋 Detected for Stocking</span>
            <button onclick="stockSelectedItems()" style="background: var(--primary-accent); border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; color: white;">Stock Selected</button>
        </h4>
        <ul id="detected-inventory-list" style="list-style: none; max-height: 150px; overflow-y: auto;">
            <!-- Items -->
        </ul>
    `;

    const list = document.getElementById('detected-inventory-list');

    items.forEach(item => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '10px';
        li.style.marginBottom = '5px';

        li.innerHTML = `
            <input type="checkbox" id="check-${item.name}" class="detected-checkbox" value="${item.name}" checked>
            <label for="check-${item.name}" style="cursor: pointer; color: var(--text-main); text-transform: capitalize;">
                ${item.name} <span style="color: var(--text-muted); font-size: 0.8em;">(${item.profile.type})</span>
            </label>
        `;
        list.appendChild(li);
    });
}

// Global function for the button
window.stockSelectedItems = function () {
    const checkboxes = document.querySelectorAll('.detected-checkbox:checked');
    let addedCount = 0;
    checkboxes.forEach(cb => {
        const name = cb.value;
        InventoryDB.addItem(name, false); // Add as pantry stock
        addedCount++;
    });

    if (addedCount > 0) {
        updateInventoryUI();
        alert(`${addedCount} items added to your Inventory!`);
        // Optional: switchTab('tab-inventory');
    }
};


// --- OUTPUT RENDERING ---
function renderOutput(plan) {
    const resultsDiv = document.getElementById('results');
    const recipeGrid = document.getElementById('recipe-hub-grid');
    const shoppingListContainer = document.getElementById('shopping-list-container'); // Changed to container

    // 1. Render Strategy Text
    document.getElementById('waste-saved').textContent = `Saved: ~${plan.wasteSaved} Food Waste`;
    document.getElementById('day1-plan').innerHTML = plan.day1;
    document.getElementById('day2-plan').innerHTML = plan.day2;
    document.getElementById('efficiency-tip').innerHTML = plan.tip;

    // 2. Render Recipe Hub (Cards)
    recipeGrid.innerHTML = "";

    const card1 = createRecipeCard("Day 1: Primary Meal", plan.day1, plan.shoppingList);
    const card2 = createRecipeCard("Day 2: Transformation", plan.day2, []);

    recipeGrid.appendChild(card1);
    recipeGrid.appendChild(card2);

    // 3. Render Categorized Shopping List
    shoppingListContainer.innerHTML = '';

    if (!plan.shoppingList || plan.shoppingList.length === 0) {
        shoppingListContainer.innerHTML = '<li><em>No extra shopping needed! Use your pantry.</em></li>';
    } else {
        // Categorize
        const categories = { 'Produce': [], 'Protein': [], 'Dairy': [], 'Pantry': [] };

        plan.shoppingList.forEach(item => {
            const type = Agent.classify(item).type;
            if (type === 'veg' || type === 'fruit') categories['Produce'].push(item);
            else if (type === 'protein') categories['Protein'].push(item);
            else if (type === 'dairy') categories['Dairy'].push(item);
            else categories['Pantry'].push(item);
        });

        // Render groups
        Object.keys(categories).forEach(cat => {
            if (categories[cat].length > 0) {
                // Header
                const catHeader = document.createElement('h4');
                catHeader.style.cssText = "color: var(--secondary-accent); margin: 10px 0 5px 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;";
                catHeader.textContent = cat;
                shoppingListContainer.appendChild(catHeader);

                // List
                const ul = document.createElement('ul');
                ul.style.listStyle = 'none';

                categories[cat].forEach(item => {
                    const li = document.createElement('li');
                    li.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);";

                    const blinkitUrl = `https://blinkit.com/s/?q=${encodeURIComponent(item)}`;
                    li.innerHTML = `
                        <span>${item}</span>
                        <a href="${blinkitUrl}" target="_blank" style="color: var(--primary-accent); text-decoration: none; font-size: 0.8rem;">🛒 Buy</a>
                    `;
                    ul.appendChild(li);
                });
                shoppingListContainer.appendChild(ul);
            }
        });
    }

    resultsDiv.style.display = 'grid';
    // Smooth scroll only if triggered from main form, not small vision updates
}

// Logic to Copy List
function copyShoppingList() {
    const container = document.getElementById('shopping-list-container');
    let textToCopy = "🛒 *MY SHOPPING LIST*\n\n";

    // Iterate over headers and ULs we just created
    // The container has h4, ul, h4, ul...
    const children = container.children;
    for (let child of children) {
        if (child.tagName === 'H4') {
            textToCopy += `[${child.textContent}]\n`;
        } else if (child.tagName === 'UL') {
            for (let li of child.children) {
                // Get just the text name, ignore the "Buy" link text
                const name = li.querySelector('span').textContent;
                textToCopy += `- ${name}\n`;
            }
            textToCopy += "\n";
        }
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Shopping List copied to clipboard!");
    });
}

function createRecipeCard(title, descriptionHtml, missingItems) {
    const card = document.createElement('div');
    card.className = "recipe-card";
    card.style.cssText = "background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);";

    const match = descriptionHtml.match(/<u>(.*?)<\/u>/);
    const mealName = match ? match[1] : title;

    let missingHtml = "";
    if (missingItems && missingItems.length > 0) {
        missingHtml = `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.2);">
            <strong style="color: var(--urgent-accent); font-size: 0.85rem;">You Need:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px;">
                ${missingItems.map(i => `<span style="background: rgba(255, 159, 28, 0.2); color: var(--urgent-accent); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i}</span>`).join('')}
            </div>
        </div>`;
    } else {
        missingHtml = `<div style="margin-top: 10px; color: var(--primary-accent); font-size: 0.9rem;">✅ You have everything!</div>`;
    }

    card.innerHTML = `
        <h3 style="color: var(--secondary-accent); margin-bottom: 8px;">${mealName}</h3>
        <p style="font-size: 0.9rem; line-height: 1.4; color: var(--text-muted);">${descriptionHtml.replace(/<u>.*?<\/u>/, 'this dish')}</p>
        ${missingHtml}
    `;

    return card;
}

// --- HELPERS ---
function parseList(inputStr) {
    if (!inputStr) return [];
    return inputStr.split(',')
        .map(item => item.trim().toLowerCase())
        .filter(i => i.length > 0);
}

function addToInventory() {
    const inputField = document.getElementById('batch-input');
    const qtyField = document.getElementById('batch-qty');

    const rawValue = inputField.value;
    let qtyValue = qtyField.value.trim();

    if (!rawValue.trim()) return;

    const newItems = parseList(rawValue);
    newItems.forEach(name => {
        InventoryDB.addItem(name, qtyValue, false);
    });

    const qtyMsg = qtyValue ? ` (Qty: ${qtyValue})` : " (Qty: 1)";
    alert(`Added ${newItems.length} items to Inventory${qtyMsg}.`);

    inputField.value = "";
    qtyField.value = "";
}

function updateInventoryUI() {
    // Deprecated: Main list removed from UI.
    // Could re-implement if we want to show a preview, but task request said "remove row... remove live inventory"
    // actually "Remove Live Inventory (SQL)" referred to the modal subsections.
    // But user also said "Remove row Plan & Scan | Inventory | Recipe Hub", so no tab for Inventory list.
}
// --- DATABASE VIEW LOGIC ---
// --- DATABASE VIEW LOGIC ---
function toggleInventoryView() {
    const modal = document.getElementById('db-modal');
    const invView = document.getElementById('db-inventory-view');

    if (modal.style.display === 'none' || !modal.style.display) {
        // OPEN and RENDER
        modal.style.display = 'block';

        const inventory = InventoryDB.getAllItems();
        if (inventory.length === 0) {
            invView.innerHTML = "<em>No items in inventory.</em>";
        } else {
            let html = '<table style="width:100%; text-align: left; border-collapse: collapse;">';
            html += `<thead>
                        <tr>
                            <th style="border-bottom: 2px solid var(--primary-accent); padding: 8px; width: 60%;">Ingredient</th>
                            <th style="border-bottom: 2px solid var(--primary-accent); padding: 8px; width: 30%;">Quantity</th>
                            <th style="border-bottom: 2px solid var(--primary-accent); padding: 8px; width: 10%;"></th>
                        </tr>
                     </thead><tbody>`;

            inventory.forEach(i => {
                html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <td style="padding: 12px 8px; font-weight: 500;">${i.name}</td>
                    <td style="padding: 12px 8px; color: var(--text-muted);">${i.quantity || '-'}</td>
                    <td style="padding: 12px 8px; text-align: right;">
                        <span onclick="InventoryDB.removeItem('${i.name}'); toggleInventoryView();" 
                              style="cursor: pointer; color: var(--urgent-accent); font-weight: bold;">&times;</span>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            invView.innerHTML = html;
        }

    } else {
        // CLOSE
        modal.style.display = 'none';
    }
}

function clearInventory() {
    if (confirm("Are you sure you want to delete ALL items from the Inventory?")) {
        InventoryDB.clearAll();
        toggleInventoryView(); // Refresh view (which will show empty state)
    }
}
