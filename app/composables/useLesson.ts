// Utility functions for lesson components

// Get default thumbnail based on resource type
export function getResourceTypeThumbnail(type: string): string {
  switch (type) {
    case 'document':
      return 'https://placehold.co/800x450?text=Document+Resource';
    case 'image':
      return 'https://placehold.co/800x450?text=Image+Gallery';
    default:
      return 'https://placehold.co/800x450?text=No+Thumbnail';
  }
}