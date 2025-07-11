// popup.js

document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('saveButton').addEventListener('click', saveSettings);

const settingsForm = document.getElementById('settingsForm');
const feedbackDiv = document.getElementById('feedback');

// To add buttons for new layers
const addLayerButton = document.createElement('button');
addLayerButton.textContent = 'Add New Layer';
addLayerButton.type = 'button'; 
addLayerButton.style.cssText = `
    display: block;
    width: 100%;
    padding: 8px 10px;
    background-color: #6c757d; 
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-top: 10px;
    margin-bottom: 15px;
`;
addLayerButton.onmouseover = () => addLayerButton.style.backgroundColor = '#5a6268';
addLayerButton.onmouseout = () => addLayerButton.style.backgroundColor = '#6c757d';
settingsForm.parentNode.insertBefore(addLayerButton, settingsForm.nextSibling);  

addLayerButton.addEventListener('click', () => {
    addLayerInputGroup({ text: '', url: '' }); // new empty group
});


function addLayerInputGroup(layer = { text: '', url: '' }) {
    const layerCount = settingsForm.children.length; // Checks existing layers
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group');
    inputGroup.dataset.index = layerCount; // Assigns an index

    inputGroup.innerHTML = `
        <label for="layerName${layerCount}">Button Text:</label>
        <input type="text" id="layerName${layerCount}" placeholder="e.g. OSM Standard" value="${layer.text}" required>

        <label for="layerUrl${layerCount}" style="margin-top: 10px;">URL Template:</label>
        <input type="text" id="layerUrl${layerCount}" placeholder="e.g. https://tile.openstreetmap.org/{z}/{x}/{y}.png" value="${layer.url}" required>

        <button type="button" class="remove-layer-button" style="background-color: #dc3545; margin-top: 10px; padding: 5px 10px; font-size: 12px; width: auto; display: inline-block;">Remove</button>
    `;

    const removeButton = inputGroup.querySelector('.remove-layer-button');
    removeButton.addEventListener('click', () => {
        inputGroup.remove();
        Array.from(settingsForm.children).forEach((group, index) => {
            group.dataset.index = index;
            group.querySelector('label[for^="layerName"]').htmlFor = `layerName${index}`;
            group.querySelector('input[id^="layerName"]').id = `layerName${index}`;
            group.querySelector('label[for^="layerUrl"]').htmlFor = `layerUrl${index}`;
            group.querySelector('input[id^="layerUrl"]').id = `layerUrl${index}`;
        });
    });

    settingsForm.appendChild(inputGroup);
}

async function loadSettings() {
    const items = await chrome.storage.sync.get('customLayerSettings');
    if (items.customLayerSettings && items.customLayerSettings.length > 0) {
        items.customLayerSettings.forEach(layer => addLayerInputGroup(layer));
    } else {
        // Adds an empty input group by default if there are no saved settings
        addLayerInputGroup({ text: 'OSM Standard', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' });
    }
}

function saveSettings() {
    const customLayerSettings = [];
    const inputGroups = settingsForm.querySelectorAll('.input-group');

    inputGroups.forEach(group => {
        const textInput = group.querySelector('input[id^="layerName"]');
        const urlInput = group.querySelector('input[id^="layerUrl"]');

        if (textInput.value.trim() && urlInput.value.trim()) {
            customLayerSettings.push({
                text: textInput.value.trim(),
                url: urlInput.value.trim()
            });
        }
    });

    chrome.storage.sync.set({ customLayerSettings }, () => {
        feedbackDiv.textContent = 'Settings saved!';
        setTimeout(() => feedbackDiv.textContent = '', 3000);
    });
}