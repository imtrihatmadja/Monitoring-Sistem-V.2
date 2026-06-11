/**
 * Service to manage Google Drive interactions using standard client-side fetch APIs.
 */

export interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string; // formatted size, e.g. "4.8 MB"
  createdTime: string;
  webViewLink?: string;
  projectCode?: string;
  category?: string;
}

/**
 * Searches for a file or folder by name and parents.
 */
export async function findDriveItem(
  accessToken: string,
  name: string,
  mimeType: string,
  parentId?: string
): Promise<string | null> {
  let query = `name = '${name.replace(/'/g, "\\'")}' and mimeType = '${mimeType}' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('Error finding drive item:', err);
    return null;
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Creates a folder in Google Drive.
 */
export async function createDriveFolder(
  accessToken: string,
  name: string,
  parentId?: string
): Promise<string> {
  const url = 'https://www.googleapis.com/drive/v3/files';
  const body: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gagal membuat folder: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Helper to dynamically resolve folders based on project and categories:
 * Root Folder ("DFW_Monitoring_Documents")
 *   -> Project Folder ("Nama Proyek (KODE)")
 *        -> Category Folder ("ToR", "Laporan", etc)
 */
export async function getOrCreateDriveFolderPath(
  accessToken: string,
  projectCode: string,
  projectName: string,
  category: string
): Promise<string> {
  // 1. Get or create master root folder
  const rootFolderName = 'DFW_Monitoring_Documents';
  let rootFolderId = await findDriveItem(accessToken, rootFolderName, 'application/vnd.google-apps.folder');
  if (!rootFolderId) {
    rootFolderId = await createDriveFolder(accessToken, rootFolderName);
  }

  // 2. Get or create Project specific folder
  const projectFolderName = `${projectName} (${projectCode})`;
  let projectFolderId = await findDriveItem(accessToken, projectFolderName, 'application/vnd.google-apps.folder', rootFolderId);
  if (!projectFolderId) {
    projectFolderId = await createDriveFolder(accessToken, projectFolderName, rootFolderId);
  }

  // 3. Get or create Category specific subfolder
  let categoryFolderId = await findDriveItem(accessToken, category, 'application/vnd.google-apps.folder', projectFolderId);
  if (!categoryFolderId) {
    categoryFolderId = await createDriveFolder(accessToken, category, projectFolderId);
  }

  return categoryFolderId;
}

/**
 * Uploads a file to a specific folder in Google Drive using a secure two-step protocol.
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId: string
): Promise<GDriveFile> {
  // Step 1: Create metadata record
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const metadata = {
    name: file.name,
    parents: [folderId],
    mimeType: file.type || 'application/octet-stream',
  };

  const metaResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!metaResponse.ok) {
    const err = await metaResponse.json().catch(() => ({}));
    throw new Error(`Gagal inisiasi upload: ${err.error?.message || metaResponse.statusText}`);
  }

  const fileMeta = await metaResponse.json();
  const fileId = fileMeta.id;

  // Step 2: Upload raw file binary chunks using PATCH
  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    // If the upload failed, clean up the metadata record to prevent orphaned trash
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});

    const err = await uploadResponse.json().catch(() => ({}));
    throw new Error(`Gagal mentransfer data berkas: ${err.error?.message || uploadResponse.statusText}`);
  }

  // Retrieve finished fields (webViewLink, size, createdTime)
  const infoUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,webViewLink`;
  const infoResponse = await fetch(infoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!infoResponse.ok) {
    return {
      id: fileId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      createdTime: new Date().toISOString(),
    };
  }

  const completeInfo = await infoResponse.json();
  const sizeFormatted = completeInfo.size 
    ? `${(parseInt(completeInfo.size) / (1024 * 1024)).toFixed(2)} MB`
    : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

  return {
    id: completeInfo.id,
    name: completeInfo.name,
    mimeType: completeInfo.mimeType,
    size: sizeFormatted,
    createdTime: completeInfo.createdTime,
    webViewLink: completeInfo.webViewLink,
  };
}

/**
 * Lists all documents in DFW_Monitoring_Documents recursively.
 */
export async function listAllMonitoringFiles(accessToken: string): Promise<GDriveFile[]> {
  // Find the DFW_Monitoring_Documents root folder first
  const rootFolderName = 'DFW_Monitoring_Documents';
  const rootFolderId = await findDriveItem(accessToken, rootFolderName, 'application/vnd.google-apps.folder');
  if (!rootFolderId) {
    return [];
  }

  // Fetch all kids recursively or step-by-step
  // Go broad and select all files where 'application/vnd.google-apps.folder' != mimeType
  // To verify they are under DFW_Monitoring_Documents, we query parents of parents or retrieve drive item with parent names.
  // We can query all files inside the User's drive and filter or query directly using the Google Drive `q` parameter.
  // Using: "trashed = false and mimeType != 'application/vnd.google-apps.folder'"
  // We can select files, and for each file we recover parent info to reconstruct project code and category!
  // To avoid recursive O(N) fetch calls, let's query all folders first to make a quick map, and then map the files.
  
  // 1. Fetch all folders under DFW_Monitoring_Documents
  const foldersQuery = `mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const foldResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(foldersQuery)}&fields=files(id,name,parents)&pageSize=1000`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!foldResponse.ok) {
    throw new Error('Gagal memuat peta folder Google Drive');
  }

  const foldData = await foldResponse.json();
  const folders: any[] = foldData.files || [];

  // Build structure mapas
  const folderMap = new Map<string, { id: string, name: string, parentId?: string }>();
  for (const f of folders) {
    folderMap.set(f.id, {
      id: f.id,
      name: f.name,
      parentId: f.parents && f.parents.length > 0 ? f.parents[0] : undefined,
    });
  }

  // 2. Fetch all files
  const filesQuery = `mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
  const filesResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(filesQuery)}&fields=files(id,name,mimeType,size,createdTime,webViewLink,parents)&pageSize=1000`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!filesResponse.ok) {
    throw new Error('Gagal memuat berkas Google Drive');
  }

  const filesData = await filesResponse.json();
  const rawFiles: any[] = filesData.files || [];

  const processedFiles: GDriveFile[] = [];

  for (const file of rawFiles) {
    const parentId = file.parents && file.parents.length > 0 ? file.parents[0] : null;
    if (!parentId) continue;

    // Check if parent folder is in our folder tree
    const categoryFolder = folderMap.get(parentId);
    if (!categoryFolder) continue;

    const projectFolderId = categoryFolder.parentId;
    if (!projectFolderId) continue;

    const projectFolder = folderMap.get(projectFolderId);
    if (!projectFolder) continue;

    // Finally check if the project folder is under our master root
    if (projectFolder.parentId !== rootFolderId) continue;

    // This file is inside DFW_Monitoring_Documents
    // Reconstruct Project Code & Category
    // Project Folder name structure: "Nama Proyek (CODE)"
    const pName = projectFolder.name;
    const codeMatch = pName.match(/\(([^)]+)\)$/);
    const projectCode = codeMatch ? codeMatch[1] : pName;
    const category = categoryFolder.name;

    const sizeFormatted = file.size 
      ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(2)} MB`
      : '0.00 MB';

    processedFiles.push({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: sizeFormatted,
      createdTime: file.createdTime,
      webViewLink: file.webViewLink,
      projectCode,
      category,
    });
  }

  // Sort by date descending
  return processedFiles.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
}

/**
 * Deletes a file in Google Drive.
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gagal menghapus berkas: ${err.error?.message || response.statusText}`);
  }
}
