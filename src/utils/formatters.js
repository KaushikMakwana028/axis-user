/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 B';
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Format date string into readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Format extension name cleanly (e.g. '.dxf' -> 'DXF')
 */
export const formatExtension = (ext) => {
  if (!ext) return '';
  return ext.replace(/^\./, '').toUpperCase();
};
