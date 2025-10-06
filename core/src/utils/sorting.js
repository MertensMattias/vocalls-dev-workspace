/**
 * Sorting utilities for Vocalls development environment
 */

/**
 * Sort library files according to Vocalls loading order:
 * 1. Files starting with numbers (sorted numerically)
 * 2. Files starting with letters (sorted alphabetically)
 * 
 * @param {string[]} files - Array of filenames
 * @returns {string[]} Sorted array of filenames
 */
export function sortLibraryFiles(files) {
  return files.sort((a, b) => {
    const aStartsWithNumber = /^\d/.test(a);
    const bStartsWithNumber = /^\d/.test(b);
    
    // If both start with numbers, sort numerically
    if (aStartsWithNumber && bStartsWithNumber) {
      const aNum = parseInt(a.match(/^\d+/)[0], 10);
      const bNum = parseInt(b.match(/^\d+/)[0], 10);
      return aNum - bNum;
    }
    
    // If only a starts with number, a comes first
    if (aStartsWithNumber && !bStartsWithNumber) {
      return -1;
    }
    
    // If only b starts with number, b comes first
    if (!aStartsWithNumber && bStartsWithNumber) {
      return 1;
    }
    
    // If neither starts with number, sort alphabetically
    return a.localeCompare(b);
  });
}

/**
 * Sort library files with dependency order support:
 * 1. Use explicit libraryOrder if provided
 * 2. Fall back to numeric then alphabetical sorting
 * 
 * @param {string[]} files - Array of filenames
 * @param {string[]} libraryOrder - Explicit order from project.json
 * @returns {string[]} Sorted array of filenames
 */
export function sortLibraryFilesWithDependencies(files, libraryOrder = null) {
  if (libraryOrder && libraryOrder.length > 0) {
    // Use explicit order, but add any missing files at the end
    const orderedFiles = [...libraryOrder];
    const missingFiles = files.filter(file => !libraryOrder.includes(file));
    return [...orderedFiles, ...sortLibraryFiles(missingFiles)];
  }
  
  return sortLibraryFiles(files);
}