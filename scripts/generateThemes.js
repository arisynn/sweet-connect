import fs from "fs/promises";
import path from "path";

async function generate() {
    const themesDir = path.join(process.cwd(), "public", "assets", "themes");
    const themes = [];
    
    // Direktori yang akan di-scan secara dinamis
    const scanDirs = ['menu', 'ui', 'icons', 'effects', 'sfx', 'bgm'];

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
                    
                    const rootFiles = await fs.readdir(path.join(themesDir, folder.name));

                    // Check for background, logo, preview
                    if (rootFiles.includes('background.png')) themeData.background = `/assets/themes/${folder.name}/background.png`;
                    if (rootFiles.includes('logo.png')) themeData.logo = `/assets/themes/${folder.name}/logo.png`;
                    if (rootFiles.includes('preview.png')) themeData.preview = `/assets/themes/${folder.name}/preview.png`;
                    
                    // Scan tiles (Wajib)
                    try {
                        const tilesDir = path.join(themesDir, folder.name, themeData.tilesDir || 'tiles');
                        const tileFiles = await fs.readdir(tilesDir);
                        const validTiles = tileFiles.filter(f => f.match(/\.(png|jpg|jpeg|svg|webp)$/i));
                        if (validTiles.length > 0) {
                            themeData.data = validTiles.map(f => `/assets/themes/${folder.name}/${themeData.tilesDir || 'tiles'}/${f}`);
                        }
                    } catch (e) {}
                    
                    // Scan dynamic optional folders
                    for (const dirName of scanDirs) {
                        try {
                            const targetDir = path.join(themesDir, folder.name, dirName);
                            const files = await fs.readdir(targetDir);
                            const assetMap = {};
                            files.forEach(f => {
                                const match = f.match(/^(.*)\.(png|jpg|jpeg|svg|webp|mp3|wav|ogg)$/i);
                                if (match) {
                                    assetMap[match[1]] = `/assets/themes/${folder.name}/${dirName}/${f}`;
                                }
                            });
                            // Untuk backward compatibility, 'menu' disimpan di 'menuIcons'
                            if (dirName === 'menu') {
                                themeData.menuIcons = assetMap;
                            } else {
                                themeData[dirName] = assetMap;
                            }
                        } catch (e) {
                            if (dirName === 'menu') themeData.menuIcons = {};
                        }
                    }

                    // Scan menu backgrounds
                    try {
                        let bgsDirName = themeData.menuBgDir;
                        if (!bgsDirName) {
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
    console.log("Generated public/themes.json with extended modular assets support.");
}

generate();
