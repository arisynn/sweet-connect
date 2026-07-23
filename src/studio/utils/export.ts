import JSZip from 'jszip';
import { StudioTheme } from '../types';

export const exportTheme = async (theme: StudioTheme) => {
  // Validate theme
  if (!theme.metadata.name) throw new Error('Theme Name is required.');
  if (!theme.metadata.id) throw new Error('Theme ID is required.');
  
  // Create ZIP
  const zip = new JSZip();
  const themeFolderId = theme.metadata.id || 'my-theme';
  const folder = zip.folder(themeFolderId);

  if (!folder) throw new Error('Failed to create zip folder');

  // We will build a JSON that only contains strings (relative paths), not File objects
  const themeJson = {
    metadata: theme.metadata,
    colors: theme.colors,
    assets: {
      tiles: {} as Record<string, string>,
      ui: {} as Record<string, string>,
      background: '',
      logo: '',
      particles: '',
      audio: {}
    }
  };

  const addAsset = async (folderPath: string, key: string, fileOrString: string | File | undefined, jsonTarget: any, jsonKey: string) => {
    if (!fileOrString) return;
    
    if (fileOrString instanceof File) {
      // It's a file, we need to add it to the ZIP
      const arrayBuffer = await fileOrString.arrayBuffer();
      const ext = fileOrString.name.split('.').pop() || 'png';
      const fileName = `${jsonKey}.${ext}`;
      const path = `${folderPath}/${fileName}`;
      
      folder.file(path, arrayBuffer);
      jsonTarget[jsonKey] = path; 
    } else if (typeof fileOrString === 'string' && fileOrString.startsWith('blob:')) {
       // Ideally we don't just have blob URLs in export, 
       // but if we do and can't fetch it, we might have an issue. 
       // We should try to fetch the blob.
       try {
         const res = await fetch(fileOrString);
         const blob = await res.blob();
         const arrayBuffer = await blob.arrayBuffer();
         // Attempt to guess extension from blob type or fallback to png
         const ext = blob.type.split('/')[1] || 'png';
         const fileName = `${jsonKey}.${ext}`;
         const path = `${folderPath}/${fileName}`;
         
         folder.file(path, arrayBuffer);
         jsonTarget[jsonKey] = path;
       } catch (e) {
         console.warn('Failed to fetch blob URL for export:', fileOrString);
       }
    } else {
      // It's just a string path (maybe an existing default asset)
      jsonTarget[jsonKey] = fileOrString;
    }
  };

  await addAsset('', 'thumbnail', theme.assets.thumbnail, themeJson.metadata, 'thumbnail');
  await addAsset('backgrounds', 'background', theme.assets.background, themeJson.assets, 'background');
  await addAsset('ui', 'logo', theme.assets.logo, themeJson.assets, 'logo');

  for (const [key, value] of Object.entries(theme.assets.tiles)) {
    await addAsset('tiles', key, value as string | File | undefined, themeJson.assets.tiles, key);
  }
  for (const [key, value] of Object.entries(theme.assets.ui)) {
    await addAsset('ui', key, value as string | File | undefined, themeJson.assets.ui, key);
  }

  // Add the JSON config
  folder.file('theme.json', JSON.stringify(themeJson, null, 2));

  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.metadata.name || 'theme'}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
