<<<<<<< HEAD
# OSM iD: Custom Background Layers & Comment Suggester

## Overview

OSM iD: Custom Background Layers is a lightweight Chrome extension designed to enhance your mapping experience in the OpenStreetMap iD editor. It allows you to easily add and switch between your frequently used custom map background layers **and** automatically generate descriptive changeset comments.

## Features

### 🗺️ Custom Background Layers
=======
# OSM iD: Custom Background Layers

## Overview

OSM iD: Custom Background Layers is a lightweight Chrome extension designed to enhance your mapping experience in the OpenStreetMap iD editor. It allows you to easily add and switch between your frequently used custom map background layers, streamlining your workflow without needing to manually paste URLs every time.

## Features

>>>>>>> 0ff50aaef8e79f022551e88d59928d159ad852fe
* **Quick Access:** Add your favorite custom background map layers directly from a dedicated popup panel within the iD editor.
* **Seamless Integration:** Designed to blend visually with the iD editor's interface, providing a native feel.
* **One-Click Application:** Apply any of your defined custom layers with a single click – the extension automatically handles the URL input and confirms the selection in iD.
* **Customizable Layers:** Define a name and URL template for each layer.

<<<<<<< HEAD
### 💡 Changeset Comment Suggester (NEW!)
* **Automatic Analysis:** Scans your edits (landuse, natural, building, amenity, historic, etc.) directly from the OSMChange file.
* **Smart Area Detection:** Identifies the current location from iD's location panel or coordinates via Nominatim.
* **One-Click Generation:** Adds a **"Suggest"** button to the save dialog. Click it to generate a comment like:  
  `"landuses, buildings in Ancona area"`
* **Intelligent Sorting:** Lists the top 3 most modified object types in your comment. If you modify more than 3 types, it adds "and other improvements".
* **Privacy First:** Everything happens locally — no external API calls except for area name resolution (optional).

=======
>>>>>>> 0ff50aaef8e79f022551e88d59928d159ad852fe
## Installation

Please note that this extension is currently released in developer mode and is not yet packaged. To install it, you will need to load it as an "unpacked" extension in Chrome.
To install OSM iD: Custom Background Layers, follow these steps:

1.  **Download the Extension:**
    * Create a folder on your computer and download all the files from this repo.
2.  **Open Chrome Extensions Page:**
    * Open Chrome.
    * Type `chrome://extensions` in the address bar and press Enter.
    * Alternatively, go to `Menu (⋮) > More tools > Extensions`.
3.  **Enable Developer Mode:**
    * On the Extensions page, toggle the "Developer mode" switch to the **ON** position (usually in the top right corner).
4.  **Load the Extension:**
    * Click the "Load unpacked" button that appears.
    * Navigate to the folder where you unzipped/cloned the extension (the folder containing `manifest.json`).
    * Select that folder and click "Select Folder".
5.  **Pin the Extension (Optional but Recommended):**
    * Click the puzzle piece icon (Extensions icon) in your Chrome toolbar.
    * Find "OSM iD: Custom Layer Settings" and click the pin icon next to it to make it visible in your toolbar for easy access.

## Usage

<<<<<<< HEAD
### Custom Background Layers

1.  **Configure Your Custom Layers:**
    * Click on the **OSM iD: Custom Layer Settings** icon in your Chrome toolbar (the extension's popup).
    * Use the "Add New Layer" button to create new entries.
    * For each layer, enter a **Button Text** (what you want to see on the button, e.g., "OpenTopoMap") and the **URL Template** for your map service (e.g., `https://tile.opentopomap.org/{z}/{x}/{y}.png`).
=======
1.  **Configure Your Custom Layers:**
    * Click on the **OSM iD: Custom Layer Settings** icon in your Chrome toolbar (the extension's popup).
    * Use the "Add New Layer" button to create new entries.
    * For each layer, enter a **Button Text** (what you want to see on the button, e.g., "OpenTopoMap") and the **URL Template** for your map service (e.g., `[https://tile.opentopomap.org/{z}/{x}/{y}.png]`).
>>>>>>> 0ff50aaef8e79f022551e88d59928d159ad852fe
    * Click "Save Settings".
2.  **Access Layers in iD Editor:**
    * Open the OpenStreetMap iD editor (e.g., `https://www.openstreetmap.org/edit`).
    * In the iD editor, click on the **"Background Settings"** button (looks like an icon with multiple layers, typically on the right side).
    * In the "Background Settings" panel, click on **"Edit custom background"** (represented by a three dots icon `...`).
    * A new pop-up panel from this extension will appear.
3.  **Select Your Layer:**
    * Simply click on the button corresponding to the custom background layer you wish to apply. The extension will automatically fill the URL and confirm your choice in iD.

<<<<<<< HEAD
### 💡 Using the Comment Suggester

1. **Make your edits** in iD Editor as usual.
2. **Click "Save"** to open the upload dialog.
3. **Click the green "Suggest" button** (appears next to Cancel/Save).
4. The extension will:
   - Analyze the OSMChange file to detect modified objects
   - Identify the current area (from location panel or coordinates)
   - Generate a descriptive comment
5. **Review and edit** the suggested comment if needed, then upload normally.

> **Tip:** Press `Ctrl+Shift+L` in iD Editor to open the location panel — this helps the extension detect the area name more accurately.

## Supported Object Types

The comment suggester detects and counts **any OSM tag key**, including but not limited to:
- `landuse` (farmland, orchard, etc.)
- `natural` (wood, scrub, grassland)
- `building`
- `highway` (residential, footway, path)
- `waterway`, `leisure`, `amenity`, `historic`, `shop`, `office`, `tourism`

The top 3 most modified types appear in the comment. If more than 3 types are modified, it adds `"and other improvements"`.

=======
>>>>>>> 0ff50aaef8e79f022551e88d59928d159ad852fe
## Contributing

Contributions are welcome! If you have suggestions for improvements, bug reports, or would like to contribute code, please open an issue or submit a pull request on the [GitHub repository](https://github.com/dp7x/iD-multilayer).

<<<<<<< HEAD
For feedback or questions about the Comment Suggester, you can also [contact me on OpenStreetMap](https://www.openstreetmap.org/messages/new/dp7).

=======
>>>>>>> 0ff50aaef8e79f022551e88d59928d159ad852fe
## License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) file for details.

## Credits

<<<<<<< HEAD
© 2024-2026 **dp7** [@OpenStreetMap](https://www.openstreetmap.org/user/dp7)
=======
&copy; 2024 <a href="https://www.openstreetmap.org/user/dp7" target="_blank">**dp7**@OpenStreetMap</a>
>>>>>>> 0ff50aaef8e79f022551e88d59928d159ad852fe
