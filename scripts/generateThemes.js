import fs from "fs/promises";
import path from "path";

async function generate() {
    const themesDir = path.join(process.cwd(), "public", "assets", "themes");
    const themes = [];
    
    try {
        const folders = await fs.readdir(themesDir, { withFileTypes: true });
        for (const folder of folders) {
            if (folder.isDirectory()) {
                const themeJsonPath = path.join(themesDir, folder.name, "theme.json");
                try {
                    const content = await fs.readFile(themeJsonPath, "utf-8");
                    const themeData = JSON.parse(content);
                    if (themeData.category && !themeData.type) themeData.type = themeData.category;
                    if (!themeData.id) themeData.id = folder.name;
                    themeData.folder = folder.name;
                    
                    // Check for background, logo, preview
                    const files = await fs.readdir(path.join(themesDir, folder.name));
                    if (files.includes('background.png')) themeData.background = `/assets/themes/${folder.name}/background.png`;
                    if (files.includes('logo.png')) themeData.logo = `/assets/themes/${folder.name}/logo.png`;
                    if (files.includes('preview.png')) themeData.preview = `/assets/themes/${folder.name}/preview.png`;
                    
                    // Scan tiles
                    try {
                        const tilesDir = path.join(themesDir, folder.name, themeData.tilesDir || 'tiles');
                        const tileFiles = await fs.readdir(tilesDir);
                        const validTiles = tileFiles.filter(f => f.match(/\.(png|jpg|jpeg|svg|webp)$/i));
                        if (validTiles.length > 0) {
                            themeData.data = validTiles.map(f => `/assets/themes/${folder.name}/${themeData.tilesDir || 'tiles'}/${f}`);
                        }
                    } catch (e) {
                    }
                    
                    // Scan menu icons
                    try {
                        const menuDir = path.join(themesDir, folder.name, themeData.menuDir || 'menu');
                        const menuFiles = await fs.readdir(menuDir);
                        const menuIcons = {};
                        menuFiles.forEach(f => {
                            const match = f.match(/^(.*)\.(png|jpg|jpeg|svg|webp)$/i);
                            if (match) {
                                menuIcons[match[1]] = `/assets/themes/${folder.name}/${themeData.menuDir || 'menu'}/${f}`;
                            }
                        });
                        themeData.menuIcons = menuIcons;
                    } catch (e) {
                        themeData.menuIcons = {};
                    }

                    // Scan menu backgrounds
                    try {
                        let bgsDirName = themeData.menuBgDir;
                        if (!bgsDirName) {
                            const rootFiles = await fs.readdir(path.join(themesDir, folder.name));
                            if (rootFiles.includes('background')) bgsDirName = 'background';
                            else if (rootFiles.includes('backgrounds')) bgsDirName = 'backgrounds';
                            else if (rootFiles.includes('cards')) bgsDirName = 'cards';
                            else bgsDirName = 'background';
                        }
                        const bgsDir = path.join(themesDir, folder.name, bgsDirName);
                        const bgFiles = await fs.readdir(bgsDir);
                        const bgIcons = {};
                        bgFiles.forEach(f => {
                            const match = f.match(/^(.*)\.(png|jpg|jpeg|svg|webp)$/i);
                            if (match) {
                                bgIcons[match[1]] = `/assets/themes/${folder.name}/${bgsDirName}/${f}`;
                            }
                        });
                        themeData.menuBackgrounds = bgIcons;
                        if (bgIcons["game"]) themeData.background = bgIcons["game"];
                        else if (bgIcons["board"]) themeData.background = bgIcons["board"];
                        else if (bgIcons["background"]) themeData.background = bgIcons["background"];
                    } catch (e) {
                        themeData.menuBackgrounds = {};
                    }
                    
                    themes.push(themeData);
                } catch (err) {
                    console.warn(`Could not read theme.json in ${folder.name}`);
                }
            }
        }
    } catch (err) {
        console.warn("Themes directory does not exist or cannot be read.");
    }

    await fs.writeFile(path.join(process.cwd(), "public", "themes.json"), JSON.stringify({ themes }, null, 2));
    console.log("Generated public/themes.json");
}

generate();
