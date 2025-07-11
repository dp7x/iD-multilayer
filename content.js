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

    setupIDEditorListeners();

})(); 
