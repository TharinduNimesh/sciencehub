<template>
  <UFormGroup label="Document Files" required>
    <!-- Toggle between upload and link modes -->
    <div class="flex mb-3 border rounded-md overflow-hidden">
      <UButton
        class="flex-1 rounded-none"
        :color="documentInputMode === 'upload' ? 'primary' : 'gray'"
        :variant="documentInputMode === 'upload' ? 'solid' : 'ghost'"
        label="Upload Files"
        icon="i-heroicons-arrow-up-tray"
        @click="documentInputMode = 'upload'"
      />
      <UButton
        class="flex-1 rounded-none"
        :color="documentInputMode === 'link' ? 'primary' : 'gray'"
        :variant="documentInputMode === 'link' ? 'solid' : 'ghost'"
        label="Add Links"
        icon="i-heroicons-link"
        @click="documentInputMode = 'link'"
      />
    </div>

    <!-- File Upload Section -->
    <div v-if="documentInputMode === 'upload'" class="space-y-4">
      <!-- Direct file input option -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        @click="fileUploadReady && $refs.fileInput?.click()"
        @dragover.prevent
        @dragleave.prevent
        @drop.prevent="handleFileDrop"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          @change="handleFileSelect"
          :disabled="!fileUploadReady"
        />
        <UIcon
          name="i-heroicons-arrow-up-tray"
          class="mx-auto h-12 w-12 text-gray-400"
        />
        <div class="mt-2">
          <span class="font-medium text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
        </div>
        <p class="text-xs text-gray-500">
          PDF, Word, PowerPoint, Excel (max 10MB each)
        </p>
      </div>

      <!-- Only show UUpload when document input is ready -->
      <template v-if="fileUploadReady">
        <p class="text-sm text-center text-gray-500">
          Or use the standard uploader below:
        </p>
        <UUpload
          v-model="localDocuments"
          :ui="{ base: 'w-full' }"
          :accept="'.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'"
          label="Drop files or click to upload"
          description="PDF, Word, PowerPoint, Excel (max 10MB each)"
          :max-file-size="10 * 1024 * 1024"
          :multiple="true"
          lazy
        />
      </template>
    </div>

    <!-- Document Link Section -->
    <div v-else class="space-y-3">
      <div
        v-for="(link, index) in localDocumentLinks"
        :key="index"
        class="space-y-2"
      >
        <div class="flex items-start gap-2">
          <UInput
            v-model="localDocumentLinks[index].url"
            placeholder="Enter document URL (Drive, Dropbox, etc.)"
            icon="i-heroicons-link"
            class="flex-1"
            @blur="validateLinkInput(index)"
            lazy
          />
          <UButton
            v-if="index === localDocumentLinks.length - 1"
            color="primary"
            variant="soft"
            icon="i-heroicons-plus"
            @click="addDocumentLink"
          />
          <UButton
            v-else
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="removeDocumentLink(index)"
          />
        </div>
        <UInput
          v-model="localDocumentLinks[index].name"
          placeholder="Document name (optional)"
          icon="i-heroicons-document-text"
          size="sm"
          lazy
        />
      </div>

      <UAlert
        v-if="localDocumentLinks.length === 0"
        color="info"
        icon="i-heroicons-information-circle"
      >
        <template #title>Add Documents from Cloud Storage</template>
        <template #default>
          Add links to documents from Google Drive, Dropbox, OneDrive, or
          other services.
          <div class="mt-2">
            <UButton
              color="primary"
              variant="soft"
              icon="i-heroicons-plus"
              size="sm"
              label="Add Document Link"
              @click="addDocumentLink"
            />
          </div>
        </template>
      </UAlert>
    </div>

    <!-- Document Preview List - only render when needed -->
    <div
      v-if="
        localDocuments.length > 0 ||
        localDocumentLinks.some((link) => link.url)
      "
      class="mt-4 space-y-2"
    >
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Document Resources:
      </p>

      <!-- Uploaded Files -->
      <div
        v-for="(doc, index) in localDocuments"
        :key="`file-${index}`"
        class="flex items-center justify-between p-2 border rounded-md"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="getDocumentIcon(doc.name)"
            class="text-gray-500 w-5 h-5"
          />
          <span class="truncate max-w-[180px]">{{ doc.name }}</span>
          <UBadge :color="getDocumentColor(doc.name)" size="xs">{{
            getDocumentType(doc.name)
          }}</UBadge>
        </div>
        <UButton
          color="red"
          variant="ghost"
          icon="i-heroicons-trash"
          size="xs"
          @click="removeDocument(index)"
        />
      </div>

      <!-- Document Links -->
      <div
        v-for="(link, index) in localDocumentLinks.filter((l) => l.url)"
        :key="`link-${index}`"
        class="flex items-center justify-between p-2 border rounded-md"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="getLinkProviderIcon(link.url)"
            class="text-gray-500 w-5 h-5"
          />
          <span class="truncate max-w-[180px]">{{
            link.name || getFileNameFromUrl(link.url)
          }}</span>
          <UBadge color="blue" size="xs">{{
            getLinkProviderName(link.url)
          }}</UBadge>
        </div>
        <UButton
          color="red"
          variant="ghost"
          icon="i-heroicons-trash"
          size="xs"
          @click="removeDocumentLink(index)"
        />
      </div>
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
import { ref, watch, markRaw, onMounted, nextTick } from 'vue';

interface DocumentLink {
  url: string;
  name: string;
}

const props = defineProps({
  documents: {
    type: Array as () => File[],
    default: () => []
  },
  documentLinks: {
    type: Array as () => DocumentLink[],
    default: () => [{ url: '', name: '' }]
  },
});

const emit = defineEmits(['update:documents', 'update:documentLinks']);

// Local state for v-model binding
const documentInputMode = ref<'upload' | 'link'>('upload');
const localDocuments = ref<File[]>([]);
const localDocumentLinks = ref<DocumentLink[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const fileUploadReady = ref(false);

// Set initial values on mounted to improve first load performance
onMounted(async () => {
  // Use nextTick to ensure the component is fully rendered first
  await nextTick();
  
  // Only now initialize the file arrays
  localDocuments.value = [...props.documents];
  localDocumentLinks.value = [...props.documentLinks];
  
  // Mark upload as ready
  fileUploadReady.value = true;
});

// Optimized watch setup - wait until component is mounted
watch(() => props.documents, (newDocs) => {
  if (fileUploadReady.value) {
    localDocuments.value = [...newDocs];
  }
}, { deep: true });

watch(() => props.documentLinks, (newLinks) => {
  if (fileUploadReady.value) {
    localDocumentLinks.value = [...newLinks];
  }
}, { deep: true });

// Lazy update parent with debounce - prevents excessive updates
let documentsUpdateTimeout: number | null = null;
watch(localDocuments, (newDocs) => {
  if (!fileUploadReady.value) return;

  if (documentsUpdateTimeout) {
    clearTimeout(documentsUpdateTimeout);
  }

  documentsUpdateTimeout = window.setTimeout(() => {
    emit('update:documents', markRaw([...newDocs]));
  }, 300);
}, { deep: true });

// Optimized watch for document links with debouncing
let documentLinksUpdateTimeout: number | null = null;
watch(localDocumentLinks, (newLinks) => {
  if (!fileUploadReady.value) return;

  if (documentLinksUpdateTimeout) {
    clearTimeout(documentLinksUpdateTimeout);
  }
  
  documentLinksUpdateTimeout = window.setTimeout(() => {
    emit('update:documentLinks', markRaw([...newLinks]));
  }, 300);
}, { deep: true });

// Document link handlers
function addDocumentLink() {
  // Only add if the last link has content
  const lastLink = localDocumentLinks.value[localDocumentLinks.value.length - 1];
  if (lastLink && !lastLink.url.trim()) {
    // Focus on the last input instead of showing a toast
    return;
  }
  
  // Add new empty link
  localDocumentLinks.value.push({ url: '', name: '' });
  
  // Focus the new input on the next render cycle
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[placeholder="Enter document URL (Drive, Dropbox, etc.)"]');
    const lastInput = inputs[inputs.length - 1];
    if (lastInput) {
      (lastInput as HTMLInputElement).focus();
    }
  }, 10);
}

function removeDocumentLink(index: number) {
  localDocumentLinks.value.splice(index, 1);
  if (localDocumentLinks.value.length === 0) {
    addDocumentLink(); // Always keep at least one empty link input
  }
}

// Remove document from list
function removeDocument(index: number) {
  localDocuments.value.splice(index, 1);
}

// Optimized file upload handlers - use lazy loading and processing
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  // Process files in chunks for better performance
  const files = Array.from(target.files);
  processFiles(files);
  
  // Reset the input so the same file can be selected again
  target.value = '';
}

function handleFileDrop(event: DragEvent) {
  if (!event.dataTransfer) return;
  
  // Process files in chunks for better performance
  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
}

// Process files in batches for better UI responsiveness
function processFiles(files: File[]) {
  // Show processing indicator if many files
  if (files.length > 3) {
    useToast().add({
      title: "Processing Files",
      description: `Processing ${files.length} files...`,
      color: "blue",
      timeout: 2000
    });
  }
  
  // Process in batches for better performance
  const processBatch = (startIndex: number) => {
    const batch = files.slice(startIndex, startIndex + 3);
    
    if (batch.length === 0) return;
    
    // Filter valid files
    const validFiles = batch.filter(isValidFile);
    
    // Add valid files to the array
    if (validFiles.length > 0) {
      localDocuments.value = [...localDocuments.value, ...validFiles];
    }
    
    // Process next batch if there are more files
    if (startIndex + 3 < files.length) {
      setTimeout(() => processBatch(startIndex + 3), 10);
    }
  };
  
  // Start processing first batch
  processBatch(0);
}

// More efficient file validation
function isValidFile(file: File): boolean {
  // File extensions to check
  const validExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
  const fileName = file.name.toLowerCase();
  
  // Quick extension check
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  // Check mime type only if extension check passes
  const validMimeTypes = [
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const isValidType = hasValidExtension || validMimeTypes.includes(file.type);
  
  // Validate file size (max 10MB)
  const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
  
  if (!isValidType) {
    useToast().add({
      title: "Invalid File Type",
      description: `${file.name} is not an allowed file type. Please upload PDF, Word, PowerPoint or Excel files.`,
      color: "red"
    });
  }
  
  if (!isValidSize) {
    useToast().add({
      title: "File Too Large",
      description: `${file.name} exceeds the 10MB size limit.`,
      color: "red"
    });
  }
  
  return isValidType && isValidSize;
}

// Document utility functions
function getDocumentIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return 'i-heroicons-document-text';
    case 'doc':
    case 'docx':
      return 'i-heroicons-document';
    case 'ppt':
    case 'pptx':
      return 'i-heroicons-presentation-chart-bar';
    case 'xls':
    case 'xlsx':
      return 'i-heroicons-table-cells';
    default:
      return 'i-heroicons-paper-clip';
  }
}

function getDocumentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'doc':
    case 'docx':
      return 'Word';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint';
    case 'xls':
    case 'xlsx':
      return 'Excel';
    default:
      return ext?.toUpperCase() || 'File';
  }
}

function getDocumentColor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return 'red';
    case 'doc':
    case 'docx':
      return 'blue';
    case 'ppt':
    case 'pptx':
      return 'orange';
    case 'xls':
    case 'xlsx':
      return 'green';
    default:
      return 'gray';
  }
}

// Get icon based on link provider
function getLinkProviderIcon(url: string): string {
  if (!url) return 'i-heroicons-link';

  if (url.includes('drive.google.com')) return 'i-heroicons-cloud';
  if (url.includes('dropbox.com')) return 'i-heroicons-cloud';
  if (url.includes('onedrive')) return 'i-heroicons-cloud';
  if (url.includes('sharepoint')) return 'i-heroicons-cloud';

  return 'i-heroicons-link';
}

// Get provider name based on URL
function getLinkProviderName(url: string): string {
  if (!url) return 'Link';

  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('dropbox.com')) return 'Dropbox';
  if (url.includes('onedrive')) return 'OneDrive';
  if (url.includes('sharepoint')) return 'SharePoint';
  if (url.includes('box.com')) return 'Box';

  return 'Web Link';
}

// Extract filename from URL
function getFileNameFromUrl(url: string): string {
  if (!url) return 'Unknown File';

  try {
    // Try to extract filename from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();

    if (filename) {
      // Remove query parameters
      return filename.split('?')[0];
    }
  } catch (e) {
    // Silent fail for invalid URLs
  }

  return 'Document Link';
}

// Only validate on blur, not on every keystroke
function validateLinkInput(index: number) {
  const link = localDocumentLinks.value[index];
  
  // Only validate non-empty links
  if (link.url.trim() && !isValidLink(link.url)) {
    useToast().add({
      title: "Invalid URL format",
      description: "Please enter a valid URL starting with http:// or https://",
      color: "yellow",
    });
  }
}

// More efficient URL validator
function isValidLink(url: string): boolean {
  if (!url.trim()) return false;
  
  // Simple validation for performance
  return url.includes('://') || 
         url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('ftp://');
}
</script>