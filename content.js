// content.js

(() => { 

    let buttonUrls = [];
    let panelInstance = null; 
    let observerFieldTemplate = null; 

    // fixed colors
    const FIXED_BUTTON_COLORS = [
        '#34495e', 
        '#2c3e50', 
        '#22303e', 
        '#4a617c', 
        '#5e7c9b', 
        '#7b9cb9', 
        // Add more colors if you create new layer buttons
    ];

    // CUSTOM BACKGROUND SETUP
    async function loadButtonUrlsFromStorage() {
        const items = await chrome.storage.sync.get('customLayerSettings');
        if (items.customLayerSettings && items.customLayerSettings.length > 0) {
            buttonUrls = items.customLayerSettings.map((layer, index) => ({
                text: layer.text,
                url: layer.url,
                color: FIXED_BUTTON_COLORS[index % FIXED_BUTTON_COLORS.length] // We cycle colors and assign one
            }));
            console.log('Custom layer settings loaded from storage:', buttonUrls);
        } else {
            console.warn('No custom layer settings found in storage. Please configure them in the extension popup.');
        }
    }

	// Lets look for the text area
    function findFieldTemplateInModal() {
        const settingsModal = document.querySelector('.settings-modal.settings-custom-background');
        if (settingsModal) {
            const fieldTemplate = settingsModal.querySelector('.field-template');
            if (fieldTemplate) {
                console.log('Div .field-template found inside the settings modal!');
                return fieldTemplate;
            }
        }
        return null;
    }

	//panel with layer buttons
    function showFloatingPanel(fieldTemplate) {
        if (panelInstance) {
            console.log('Panel already open, not opening again.');
            return;
        }

        if (buttonUrls.length === 0) {
            alert("Please configure your custom background layers in the extension's popup options.");
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'osm-custom-layer-panel';
        panel.style.cssText = `
            position: fixed;
            top: 45%; 
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f8f8f8; 
            border: 1px solid #ccc; 
            padding: 15px; 
            box-shadow: none; 
            z-index: 1000;
            text-align: center;
            width: fit-content; 
            min-width: 350px; 
            max-width: 90vw; 
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 4px; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        `;

        const title = document.createElement('h4');
        title.textContent = 'Choose a custom background layer';
        title.style.cssText = `
            text-align: center;
            font-size: 14px;
            margin-top: 0;
            margin-bottom: 10px;
            color: #333;
        `;
        panel.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            border: none;
            background-color: transparent;
            font-size: 16px;
            cursor: pointer;
            color: #666;
            font-weight: bold;
        `;
        closeButton.onclick = () => {
            panel.remove();
            panelInstance = null;
            if (observerFieldTemplate) {
                observerFieldTemplate.disconnect();
                observerFieldTemplate = null;
            }
        };
        panel.appendChild(closeButton);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: row; 
            flex-wrap: nowrap; 
            gap: 8px; 
            justify-content: center; 
        `;
        panel.appendChild(buttonContainer);

        buttonUrls.forEach(buttonData => {
            if (!buttonData.url || !buttonData.text) {
                return;
            }

            const btn = document.createElement('button');
            btn.textContent = buttonData.text;
            btn.style.cssText = `
                background-color: ${buttonData.color || FIXED_BUTTON_COLORS[0]}; 
                color: white;
                border: 1px solid ${darkenColor(buttonData.color || FIXED_BUTTON_COLORS[0], 25)};
                padding: 8px 12px; 
                cursor: pointer;
                border-radius: 3px; 
                font-size: 13px; 
                font-weight: bold;
                transition: background-color 0.2s ease, border-color 0.2s ease;
                white-space: nowrap; 
                width: auto; 
            `;
            btn.onmouseover = () => {
                btn.style.backgroundColor = darkenColor(buttonData.color || FIXED_BUTTON_COLORS[0], 15);
                btn.style.borderColor = darkenColor(buttonData.color || FIXED_BUTTON_COLORS[0], 35);
            };
            btn.onmouseout = () => {
                btn.style.backgroundColor = buttonData.color || FIXED_BUTTON_COLORS[0];
                btn.style.borderColor = darkenColor(buttonData.color || FIXED_BUTTON_COLORS[0], 25);
            };

            btn.onclick = () => {
                fieldTemplate.value = buttonData.url;
                const event = new Event('input', { bubbles: true });
                fieldTemplate.dispatchEvent(event);
                fieldTemplate.focus();
				
				const okButton = document.querySelector('.settings-modal.settings-custom-background .ok-button');
                if (okButton) {
                    console.log('Clicking iD OK button.');
                    okButton.click(); // ID standard OK button
                }
				
                panel.remove();
                panelInstance = null;
                if (observerFieldTemplate) {
                    observerFieldTemplate.disconnect();
                    observerFieldTemplate = null;
                }
            };
            buttonContainer.appendChild(btn);
        });

        document.body.appendChild(panel);
        panelInstance = panel;

        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                panel.remove();
                panelInstance = null;
                document.removeEventListener('keydown', handleEscapeKey);
                if (observerFieldTemplate) {
                    observerFieldTemplate.disconnect();
                    observerFieldTemplate = null;
                }
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
    }

    function darkenColor(hex, percent) {
        let f = parseInt(hex.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = f >> 16,
            G = (f >> 8) & 0x00ff,
            B = f & 0x0000ff;
        return (
            "#" +
            (
                0x1000000 +
                (Math.round((t - R) * p) + R) * 0x10000 +
                (Math.round((t - G) * p) + G) * 0x100 +
                (Math.round((t - B) * p) + B)
            )
            .toString(16)
            .slice(1)
        );
    }

	//Monitors the DOM for the appearance of the final modal with the text area. It is only launched when the .layer-browse button is clicked.
    function observeFieldTemplateModal() {
        if (observerFieldTemplate) {
            observerFieldTemplate.disconnect(); 
        }

        observerFieldTemplate = new MutationObserver((mutationsList, observer) => {
            const fieldTemplate = findFieldTemplateInModal();
            const settingsModal = document.querySelector('.settings-modal.settings-custom-background');

            // checks for modal with the text area
            if (settingsModal && settingsModal.style.opacity === '1' && fieldTemplate && !panelInstance) {
                console.log('Custom Background Settings modal appeared with field-template. Showing custom panel.');
                showFloatingPanel(fieldTemplate);
            } else if (!settingsModal && panelInstance) {
                console.log('Custom Background Settings modal disappeared. Closing custom panel.');
                panelInstance.remove();
                panelInstance = null;
                observer.disconnect();
                observerFieldTemplate = null;
            }
        });

        observerFieldTemplate.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        console.log('Started observing for Custom Background Settings modal.');
    }

	//Main function for configuring listeners for the iD interface. This runs within the iD iframe.
    async function setupIDEditorListeners() {
        await loadButtonUrlsFromStorage();

        // Listener for "Background Settings" button
        document.body.addEventListener('click', (event) => {
            const backgroundButton = event.target.closest('.map-control.map-pane-control.background-control button');
            if (backgroundButton) {
                const useElement = backgroundButton.querySelector('use[xlink\\:href="#iD-icon-layers"]');
                if (useElement) {
                    console.log('Background Settings button clicked (delegated event).');
                }
            }

            const layerBrowseButton = event.target.closest('button.layer-browse');
            if (layerBrowseButton) {
                console.log('.layer-browse button clicked (delegated event).');
                observeFieldTemplateModal();
            }
        });

        console.log('Delegated click listeners set up for iD editor buttons.');
    }

	// ==============================================
	// NEW FEATURE: Changeset comment suggester
    // ==============================================
    
    // Pluralize names (simple, works for English)
    function pluralize(type) {
        const irregulars = {
            'highway': 'highways',
            'building': 'buildings',
            'landuse': 'landuses',
            'natural': 'naturals',
            'leisure': 'leisures',
            'waterway': 'waterways',
            'amenity': 'amenities',
            'historic': 'historics',
            'shop': 'shops',
            'office': 'offices'
        };
        return irregulars[type] || type + 's';
    }

	// Download and parse OSMChange file to extract object types
	async function analyzeChangesFromOsmChange() {
		// Find the link to download the OSMChange file
		const downloadLink = document.querySelector('.download-changes');
		if (!downloadLink) {
			console.log("cOSMetics for iD: Link OSMChange not found");
			return null;
		}
		
		const osmChangeUrl = downloadLink.href;
		if (!osmChangeUrl || !osmChangeUrl.startsWith('blob:')) {
			console.log("cOSMetics for iD: URL OSMChange invalid");
			return null;
		}
		
		try {
			const response = await fetch(osmChangeUrl);
			const osmChangeText = await response.text();
			
			// Parsing XML
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(osmChangeText, 'text/xml');
			
			const created = {};
			const modified = {};
			
			// Master tags that define the object type
			const MASTER_TAGS = [
				'landuse', 'natural', 'building', 'highway', 
				'waterway', 'leisure', 'amenity', 'historic', 
				'shop', 'office', 'tourism', 'man_made', 'barrier'
			];
			
			// Helper function to process tags from an element
			function processTags(element, action) {
				const tags = element.getElementsByTagName('tag');
				for (const tag of tags) {
					const key = tag.getAttribute('k');
					if (!MASTER_TAGS.includes(key)) continue;
					
					if (action === 'create') {
						created[key] = (created[key] || 0) + 1;
					} else if (action === 'modify') {
						modified[key] = (modified[key] || 0) + 1;
					}
				}
			}
			
			// Helper to check if a node has any master tags
			function hasMasterTags(node) {
				const tags = node.getElementsByTagName('tag');
				for (const tag of tags) {
					const key = tag.getAttribute('k');
					if (MASTER_TAGS.includes(key)) return true;
				}
				return false;
			}
			
			// Analyze <create> and <modify> sections
			const actions = ['create', 'modify'];
			actions.forEach(action => {
				const elements = xmlDoc.getElementsByTagName(action);
				for (const element of elements) {
					// Process ways
					const ways = element.getElementsByTagName('way');
					for (const way of ways) {
						processTags(way, action);
					}
					
					// Process relations
					const relations = element.getElementsByTagName('relation');
					for (const relation of relations) {
						processTags(relation, action);
					}
					
					// Process INDEPENDENT nodes only (nodes with their own tags)
					const nodes = element.getElementsByTagName('node');
					for (const node of nodes) {
						// Only count nodes that have master tags themselves
						// (skip nodes that are just geometry for ways/relations)
						if (hasMasterTags(node)) {
							processTags(node, action);
						}
					}
				}
			});
			
			const totalTypes = Object.keys(created).length + Object.keys(modified).length;
			
			if (totalTypes === 0) {
				console.log("cOSMetics for iD: No master tags found in OSMChange");
				return null;
			}
			
			console.log("cOSMetics for iD: Created types:", created);
			console.log("cOSMetics for iD: Modified types:", modified);
			
			return { created, modified };
			
		} catch (error) {
			console.error("cOSMetics for iD: Error in parsing OSMChange:", error);
			return null;
		}
	}
     
// Gets geographic area from coordinates
async function getCurrentArea() {
    try {
        // 1. Try to get area from location panel (Ctrl+Shift+L)
        const locationControl = document.querySelector('.location-control .location-status, .map-control.map-pane-control.location-control');
        if (locationControl) {
            const locationText = locationControl.textContent || locationControl.innerText;
            const lines = locationText.split('\n').filter(l => l.trim());
            
            for (const line of lines) {
                if (line.includes(',') && !line.includes('°') && !line.includes('′')) {
                    const parts = line.split(',');
                    if (parts.length > 0) {
                        const city = parts[0].trim();
                        if (city && city !== '') {
                            console.log(`cOSMetics for iD: Area from location panel: ${city}`);
                            return city;
                        }
                    }
                }
            }
            
            for (const line of lines) {
                const coordMatch = line.match(/(\d+\.\d+),\s*(\d+\.\d+)/);
                if (coordMatch) {
                    const lat = parseFloat(coordMatch[1]);
                    const lon = parseFloat(coordMatch[2]);
                    const area = await getAreaFromNominatim(lat, lon);
                    if (area) return area;
                    break;
                }
            }
        }
        
        // 2. Try to get coordinates from parent URL (the one in the address bar)
        try {
            const parentUrl = window.parent.location.href || document.referrer || window.location.href;
            const match = parentUrl.match(/#map=\d+\/([\d.]+)\/([\d.]+)/);
            if (match) {
                const lat = parseFloat(match[1]);
                const lon = parseFloat(match[2]);
                console.log(`cOSMetics for iD: Coordinates from URL: ${lat}, ${lon}`);
                const area = await getAreaFromNominatim(lat, lon);
                if (area) {
                    console.log(`cOSMetics for iD: Area from URL: ${area}`);
                    return area;
                }
            }
        } catch (e) {
            console.log("cOSMetics for iD: Cannot access parent URL:", e);
        }
        
        // 3. Try to get coordinates from OSMChange file nodes
        const downloadLink = document.querySelector('.download-changes');
        if (downloadLink) {
            const osmChangeUrl = downloadLink.href;
            if (osmChangeUrl && osmChangeUrl.startsWith('blob:')) {
                const response = await fetch(osmChangeUrl);
                const osmChangeText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(osmChangeText, 'text/xml');
                
                let lats = [], lons = [];
                const nodes = xmlDoc.getElementsByTagName('node');
                for (const node of nodes) {
                    const lat = parseFloat(node.getAttribute('lat'));
                    const lon = parseFloat(node.getAttribute('lon'));
                    if (!isNaN(lat) && !isNaN(lon)) {
                        lats.push(lat);
                        lons.push(lon);
                    }
                }
                
                if (lats.length > 0) {
                    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                    const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;
                    const area = await getAreaFromNominatim(centerLat, centerLon);
                    if (area) return area;
                }
            }
        }
        
    } catch (error) {
        console.error("cOSMetics for iD: Error getting the area:", error);
    }
    
    return "area unknown";
}

// Helper function to get area from Nominatim
async function getAreaFromNominatim(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=10&format=json&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'cOSMetics for iD-extension/1.0 (https://github.com/dp7x/iD-multilayer)'
                }
            }
        );
        const data = await response.json();
        const area = data.address?.city || 
                    data.address?.town || 
                    data.address?.village || 
                    data.address?.county;
        return area || null;
    } catch (e) {
        console.log("cOSMetics for iD: Nominatim error:", e);
        return null;
    }
}
    
    // Generate comment text based on created and modified types
    function generateComment(typeCount, areaName) {
        const created = typeCount.created || {};
        const modified = typeCount.modified || {};
        
        const sortedCreated = Object.entries(created).sort((a, b) => b[1] - a[1]);
        const sortedModified = Object.entries(modified).sort((a, b) => b[1] - a[1]);
        
        let parts = [];
        let totalTypes = 0;
        
        // Build "created" part
        const createdTypes = sortedCreated.slice(0, 3).map(([key]) => pluralize(key));
        if (createdTypes.length > 0) {
            parts.push(`created ${createdTypes.join(', ')}`);
            totalTypes += sortedCreated.length;
        }
        
        // Build "modified" part
        const modifiedTypes = sortedModified.slice(0, 3).map(([key]) => pluralize(key));
        if (modifiedTypes.length > 0) {
            parts.push(`modified ${modifiedTypes.join(', ')}`);
            totalTypes += sortedModified.length;
        }
        
        // If nothing found, return null
        if (parts.length === 0) return null;
        
        // Join the parts
        let comment = parts.join(' + ');
        
        // Add "other improvements" only once at the end if there are more than 3 types total
        if (totalTypes > 3) {
            comment += ` + other improvements`;
        }
        
        comment += ` in ${areaName} area`;
        return comment;
    }
    
   // Updated version of insertSuggestedComment
    async function insertSuggestedComment() {
        //console.log("cOSMetics for iD: Generating suggested comment...");
        
        // Show loading indicator
        const suggestBtn = document.getElementById('id-multilayer-suggest-btn');
        const originalText = suggestBtn ? suggestBtn.textContent : '';
        if (suggestBtn) {
            suggestBtn.textContent = '⏳ Analyzing...';
            suggestBtn.disabled = true;
        }
        
        try {
            const typeCount = await analyzeChangesFromOsmChange();
            
            if (!typeCount) {
                alert("⚠️ No changes detected in OSMChange file.\n\nMake sure you have made changes in this session.");
                return;
            }
            
            const areaName = await getCurrentArea();
            const suggestion = generateComment(typeCount, areaName);
            
            if (suggestion) {
                const commentField = document.querySelector('.form-field-comment textarea');
                if (commentField) {
                    commentField.value = suggestion;
                    commentField.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    commentField.style.backgroundColor = '#e8f5e9';
                    commentField.style.transition = 'background-color 0.5s ease';
                    setTimeout(() => {
                        commentField.style.backgroundColor = '';
                    }, 1000);
                    
                    //console.log(`cOSMetics for iD: Comment inserted: "${suggestion}"`);
                } else {
                    alert("Comment field not found.");
                }
            }
        } finally {
            // Restore button
            if (suggestBtn) {
                suggestBtn.textContent = originalText;
                suggestBtn.disabled = false;
            }
        }
    }
    
    // Add "Suggest comment" button to the save dialog
    let saveDialogObserver = null;
    
    function addSuggestionButtonToSaveDialog() {
        // Prevent duplicate observers
        if (saveDialogObserver) return;
        
        saveDialogObserver = new MutationObserver(() => {
            // Look for the changeset panel (when the save dialog appears)
            const changesetEditor = document.querySelector('.modal-section.changeset-editor');
            const existingButton = document.getElementById('id-multilayer-suggest-btn');
            
            // If we find the changeset editor and the button doesn't exist yet
            if (changesetEditor && !existingButton) {
                // Look for the button container (where Cancel and Save are)
                const buttonContainer = document.querySelector('.save-section .buttons');
                
                if (buttonContainer) {
                    const suggestBtn = document.createElement('button');
                    suggestBtn.id = 'id-multilayer-suggest-btn';
                    suggestBtn.textContent = '💡 Suggest';
                    suggestBtn.className = 'action button';  // Uses ID class for style
                    suggestBtn.style.marginRight = '8px';
                    suggestBtn.style.backgroundColor = '#4CAF50';
                    suggestBtn.style.color = 'white';
                    suggestBtn.style.border = 'none';
                    suggestBtn.style.borderRadius = '3px';
                    suggestBtn.style.padding = '6px 12px';
                    suggestBtn.style.cursor = 'pointer';
                    suggestBtn.style.fontSize = '13px';
                    suggestBtn.style.fontWeight = 'bold';
                    
                    // Hover effect
                    suggestBtn.onmouseover = () => { suggestBtn.style.backgroundColor = '#45a049'; };
                    suggestBtn.onmouseout = () => { suggestBtn.style.backgroundColor = '#4CAF50'; };
                    
                    suggestBtn.onclick = insertSuggestedComment;
                    
                    // Insert it as the first button (before "Cancel")
                    if (buttonContainer.firstChild) {
                        buttonContainer.insertBefore(suggestBtn, buttonContainer.firstChild);
                    } else {
                        buttonContainer.appendChild(suggestBtn);
                    }
                    
                    //console.log("cOSMetics for iD: 'Suggest comment' button added to save dialog");
                }
            }
        });
        
        // Observe the entire document for the save panel addition
        saveDialogObserver.observe(document.body, { childList: true, subtree: true });
        //console.log("cOSMetics for iD: Save dialog observer activated");
    }
    
    // ==============================================
	// EXTENSION of setupIDEditorListeners function
    // ==============================================
    
    // Save original function
    const originalSetupID = setupIDEditorListeners;
    
    // Redefine it including the new functionality
    window.setupIDEditorListeners = async function() {
        //console.log("cOSMetics for iD: Starting extended setupIDEditorListeners");
        
        await originalSetupID();
        
        // Add comment suggester
        addSuggestionButtonToSaveDialog();
        //console.log("cOSMetics for iD: Comment Suggester ready");
    };
    
    // Start everything
    console.log("cOSMetics for iD: Extension initialization...");
    window.setupIDEditorListeners();

})();