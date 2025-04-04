<template>
  <div class="h-full space-y-8">
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/console/lessons"
          class="text-primary-500 hover:underline flex items-center"
        >
          <UIcon name="i-heroicons-arrow-left" class="mr-1" />
          Back to Lessons
        </NuxtLink>
      </div>

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-[400px] w-full rounded-lg mb-6" />
        <USkeleton class="h-10 w-3/4 mb-4" />
        <USkeleton class="h-6 w-1/2 mb-4" />
        <USkeleton class="h-24 w-full" />
      </div>

      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Video Player and Details -->
          <div class="lg:col-span-2">
            <!-- Video Player Section -->
            <div class="bg-gray-900 rounded-lg overflow-hidden mb-6">
              <!-- <video v-if="lesson" class="h-full w-full rounded-lg" controls>
                <source
                  :src="getYouTubeEmbedUrl(lesson.videoUrl)"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video> -->
              <iframe
                v-if="lesson"
                :src="getYouTubeEmbedUrl(lesson.videoUrl)"
                class="w-full h-[400px] rounded-lg"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Lesson Details -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-2xl font-bold">{{ lesson?.title }}</h1>
                <div class="flex items-center gap-3 mt-2">
                  <UBadge color="primary" variant="soft">
                    {{ lesson?.className }}
                  </UBadge>
                  <UBadge color="gray" variant="soft">
                    {{ formatDuration(lesson?.duration || 0) }}
                  </UBadge>
                  <span class="text-sm text-gray-500 flex items-center">
                    <UIcon name="i-heroicons-calendar" class="mr-1" />
                    {{ formatDate(lesson?.createdAt || "") }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Student Materials Section - New Modern Design -->
            <div v-if="hasStudentMaterials" class="mt-8">
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <!-- Header with icon -->
                <div class="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
                  <h3 class="font-medium text-lg flex items-center text-gray-800">
                    <UIcon name="i-heroicons-book-open" class="mr-2 text-primary-500" />
                    Student Materials
                    <UBadge color="primary" variant="soft" class="ml-2" size="sm">
                      {{ materialsCount }} Resources
                    </UBadge>
                  </h3>
                </div>
                
                <!-- Materials content -->
                <div>
                  <!-- Tabbed navigation -->
                  <div class="border-b border-gray-200">
                    <nav class="flex gap-1 px-2 pt-2">
                      <button 
                        v-if="hasDocuments"
                        @click="activeTab = 'documents'" 
                        :class="[
                          'py-3 px-4 text-sm font-medium rounded-t-lg transition-colors',
                          activeTab === 'documents' 
                            ? 'bg-white border-b-2 border-primary-500 text-primary-700' 
                            : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                        ]"
                      >
                        <div class="flex items-center">
                          <UIcon name="i-heroicons-document-text" class="mr-1.5" />
                          Documents
                        </div>
                      </button>
                      
                      <button 
                        v-if="hasImages"
                        @click="activeTab = 'images'" 
                        :class="[
                          'py-3 px-4 text-sm font-medium rounded-t-lg transition-colors',
                          activeTab === 'images' 
                            ? 'bg-white border-b-2 border-primary-500 text-primary-700' 
                            : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                        ]"
                      >
                        <div class="flex items-center">
                          <UIcon name="i-heroicons-photo" class="mr-1.5" />
                          Images
                        </div>
                      </button>
                    </nav>
                  </div>
                  
                  <!-- Tab content -->
                  <div class="p-6">
                    <!-- Documents Tab Content -->
                    <div v-if="activeTab === 'documents'">
                      <div v-if="hasDocuments" class="space-y-4">
                        <div class="grid grid-cols-1 gap-3">
                          <!-- Document links -->
                          <div 
                            v-for="(link, index) in lesson?.documentLinks || []" 
                            :key="`link-${index}`"
                            class="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                          >
                            <!-- Icon based on provider -->
                            <div class="flex-shrink-0 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <UIcon 
                                :name="getLinkProviderIcon(link.url)" 
                                class="text-gray-500 w-6 h-6"
                              />
                            </div>
                            
                            <!-- Document info -->
                            <div class="flex-1 min-w-0">
                              <h5 class="text-base font-medium text-gray-900">
                                {{ link.name || getFileNameFromUrl(link.url) }}
                              </h5>
                              <div class="flex items-center mt-1">
                                <UBadge :color="getDocumentColor(link.name || getFileNameFromUrl(link.url))" size="xs" class="mr-2">
                                  {{ getDocumentType(link.name || getFileNameFromUrl(link.url)) }}
                                </UBadge>
                                <span class="text-xs text-gray-500">
                                  {{ getLinkProviderName(link.url) }}
                                </span>
                              </div>
                            </div>
                            
                            <!-- Action button -->
                            <UButton 
                              tag="a" 
                              :href="link.url" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              color="primary" 
                              variant="solid" 
                              size="sm"
                            >
                              <span class="flex items-center gap-1">
                                <UIcon name="i-heroicons-arrow-top-right-on-square" />
                                Open
                              </span>
                            </UButton>
                          </div>
                        </div>
                      </div>
                      
                      <div v-else class="py-12 text-center">
                        <UIcon name="i-heroicons-document-text" class="mx-auto h-12 w-12 text-gray-300" />
                        <h4 class="mt-2 text-sm font-medium text-gray-900">No documents available</h4>
                        <p class="mt-1 text-sm text-gray-500">
                          This lesson doesn't have any document materials
                        </p>
                      </div>
                    </div>
                    
                    <!-- Images Tab Content -->
                    <div v-if="activeTab === 'images'">
                      <div v-if="hasImages" class="space-y-4">
                        <!-- Gallery layout -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <!-- Image cards -->
                          <div
                            v-for="(link, index) in lesson?.imageLinks || []"
                            :key="`image-${index}`"
                            class="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200"
                          >
                            <!-- Image preview -->
                            <div class="aspect-video bg-gray-100 overflow-hidden">
                              <img
                                :src="link"
                                class="w-full h-full object-cover"
                                :alt="`Image resource ${index + 1}`"
                                loading="lazy"
                              />
                            </div>
                            
                            <!-- Image info -->
                            <div class="p-3 flex items-center justify-between">
                              <div>
                                <h5 class="text-sm font-medium text-gray-900">
                                  Image {{ index + 1 }}
                                </h5>
                              </div>
                              
                              <!-- Action buttons -->
                              <div class="flex space-x-2">
                                <UButton
                                  tag="a"
                                  :href="link"
                                  target="_blank"
                                  color="gray" 
                                  variant="ghost" 
                                  icon="i-heroicons-eye"
                                  size="xs"
                                  square
                                  title="View full size"
                                />
                                <UButton
                                  tag="a"
                                  :href="link"
                                  download
                                  color="primary" 
                                  variant="ghost" 
                                  icon="i-heroicons-arrow-down-tray"
                                  size="xs"
                                  square
                                  title="Download"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div v-else class="py-12 text-center">
                        <UIcon name="i-heroicons-photo" class="mx-auto h-12 w-12 text-gray-300" />
                        <h4 class="mt-2 text-sm font-medium text-gray-900">No images available</h4>
                        <p class="mt-1 text-sm text-gray-500">
                          This lesson doesn't have any image materials
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Related Lessons and Data -->
          <div class="lg:col-span-1">
            <!-- Description Card -->
            <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
              <h3 class="font-medium mb-4">Description</h3>
              <div class="space-y-3">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-700">{{ lesson?.description }}</p>
                </div>
              </div>
            </div>

            <!-- Related Lessons -->
            <div class="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 class="font-medium mb-4">Related Lessons</h3>
              <div v-if="relatedLessons.length" class="space-y-3">
                <div
                  v-for="relatedLesson in relatedLessons"
                  :key="relatedLesson.id"
                  class="flex gap-3 group cursor-pointer bg-white p-2 rounded-lg hover:bg-gray-100 transition"
                  @click="navigateToLesson(relatedLesson.id)"
                >
                  <div
                    class="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0"
                  >
                    <img
                      :src="relatedLesson.thumbnailUrl"
                      :alt="relatedLesson.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-medium text-sm line-clamp-2 group-hover:text-primary-500"
                    >
                      {{ relatedLesson.title }}
                    </h4>
                    <p class="text-xs text-gray-500">
                      {{ formatDuration(relatedLesson.duration) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500 text-center py-4">
                No related lessons found
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

definePageMeta({
  layout: "console",
});

interface DocumentLink {
  url: string;
  name: string;
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  duration: number;
  classId: number;
  className: string;
  thumbnailUrl: string;
  videoUrl: string;
  createdAt: string;
  resourceType?: string;
  documents?: File[];
  documentLinks?: DocumentLink[];
  images?: File[];
  imageLinks?: string[];
}

const route = useRoute();
const router = useRouter();
const lessonId = computed(() => Number(route.params.id));
const loading = ref(true);
const lesson = ref<Lesson | null>(null);
const allLessons = ref<Lesson[]>([]);
const activeTab = ref('documents');

// Material tabs for the student materials section
const materialTabs = [
  {
    label: 'Documents',
    slot: 'documents',
    icon: 'i-heroicons-document-text',
  },
  {
    label: 'Images',
    slot: 'images',
    icon: 'i-heroicons-photo',
  }
];

// Check if lesson has any student materials
const hasStudentMaterials = computed(() => {
  if (!lesson.value) return false;
  
  const hasDocuments = (lesson.value.documents && lesson.value.documents.length > 0) ||
                      (lesson.value.documentLinks && lesson.value.documentLinks.length > 0);
                      
  const hasImages = (lesson.value.images && lesson.value.images.length > 0) ||
                   (lesson.value.imageLinks && lesson.value.imageLinks.length > 0);
                   
  return hasDocuments || hasImages;
});

// Get total count of materials
const materialsCount = computed(() => {
  if (!lesson.value) return 0;
  
  const documentsCount = (lesson.value.documents?.length || 0) + 
                        (lesson.value.documentLinks?.length || 0);
                        
  const imagesCount = (lesson.value.images?.length || 0) + 
                     (lesson.value.imageLinks?.length || 0);
                     
  return documentsCount + imagesCount;
});

// Check if lesson has documents
const hasDocuments = computed(() => {
  if (!lesson.value) return false;
  return (lesson.value.documents && lesson.value.documents.length > 0) || 
         (lesson.value.documentLinks && lesson.value.documentLinks.length > 0);
});

// Check if lesson has images
const hasImages = computed(() => {
  if (!lesson.value) return false;
  return (lesson.value.images && lesson.value.images.length > 0) || 
         (lesson.value.imageLinks && lesson.value.imageLinks.length > 0);
});

// Get related lessons from the same class
const relatedLessons = computed(() => {
  if (!lesson.value) return [];
  return allLessons.value
    .filter(
      (l) => l.classId === lesson.value?.classId && l.id !== lesson.value?.id
    )
    .slice(0, 3);
});

// Fetch data
onMounted(async () => {
  try {
    // Simulate API call - in a real app you'd fetch from an API
    setTimeout(() => {
      const mockLessons = [
        {
          id: 1,
          title: "Introduction to Acids and Bases",
          description:
            "Learn the fundamentals of acids and bases in chemistry. This lesson covers pH scale, neutralization reactions, and examples of common acids and bases in everyday life.",
          duration: 45,
          classId: 2,
          className: "Chemistry Class B",
          thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          createdAt: "2023-09-15T10:30:00",
          resourceType: "document",
          // Mock document data
          documents: [],
          documentLinks: [
            {
              url: "https://drive.google.com/file/d/1abc123/view",
              name: "Acids and Bases Handout"
            },
            {
              url: "https://dropbox.com/s/def456/view",
              name: "pH Scale Worksheet"
            }
          ],
          // Mock image data
          images: [],
          imageLinks: [
            "https://placehold.co/800x600/orange/white?text=Acid+Base+Reaction",
            "https://placehold.co/800x600/blue/white?text=pH+Scale+Diagram"
          ]
        },
        {
          id: 2,
          title: "Force and Motion - Newton's Laws",
          description:
            "Comprehensive overview of Newton's three laws of motion and how they apply to everyday situations. This lesson includes practical examples and demonstrations.",
          duration: 60,
          classId: 1,
          className: "Physics Class A",
          thumbnailUrl: "https://img.youtube.com/vi/L-Wtlv6E7zs/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=L-Wtlv6E7zs",
          createdAt: "2023-09-22T14:00:00",
          resourceType: "image",
          // Mock document data
          documents: [],
          documentLinks: [
            {
              url: "https://docs.google.com/document/d/newton-laws/edit",
              name: "Newton's Laws Summary"
            }
          ],
          // Mock image data
          images: [],
          imageLinks: [
            "https://placehold.co/800x600/42b983/white?text=First+Law+Diagram",
            "https://placehold.co/800x600/9b4dca/white?text=Second+Law+Formula",
            "https://placehold.co/800x600/f06d06/white?text=Third+Law+Example"
          ]
        },
        {
          id: 3,
          title: "Cell Structure and Function",
          description:
            "Explore the basic unit of life - the cell. This lesson covers cell organelles, cell membrane, and differences between plant and animal cells.",
          duration: 55,
          classId: 3,
          className: "Biology Class C",
          thumbnailUrl: "https://img.youtube.com/vi/8IlzKri08kk/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=8IlzKri08kk",
          createdAt: "2023-10-01T09:15:00",
          resourceType: "document",
          // Mock document data
          documents: [],
          documentLinks: [
            {
              url: "https://onedrive.live.com/redir?resid=cell-structure",
              name: "Cell Structure Notes"
            },
            {
              url: "https://sharepoint.com/sites/biology/cell-functions.pptx",
              name: "Cell Functions Presentation"
            },
            {
              url: "https://docs.google.com/spreadsheets/d/cell-comparison/edit",
              name: "Plant vs Animal Cells Comparison"
            }
          ],
          // Mock image data
          images: [],
          imageLinks: []
        },
        {
          id: 4,
          title: "Chemical Bonding Basics",
          description:
            "Introduction to chemical bonds, types of bonds, and how they affect the properties of substances.",
          duration: 40,
          classId: 2,
          className: "Chemistry Class B",
          thumbnailUrl: "https://img.youtube.com/vi/V6lMdlPGDsY/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=V6lMdlPGDsY",
          createdAt: "2023-09-29T13:15:00"
          // No student materials for this lesson
        },
        {
          id: 5,
          title: "Understanding pH and Indicators",
          description:
            "Deeper dive into pH measurement, acid-base indicators and their color changes.",
          duration: 35,
          classId: 2,
          className: "Chemistry Class B",
          thumbnailUrl: "https://img.youtube.com/vi/ckbsHM2igT0/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=ckbsHM2igT0",
          createdAt: "2023-10-06T11:20:00",
          resourceType: "image",
          // Mock document data
          documents: [],
          documentLinks: [],
          // Mock image data
          images: [],
          imageLinks: [
            "https://placehold.co/800x600/e74c3c/white?text=pH+Scale+Colors",
            "https://placehold.co/800x600/3498db/white?text=Litmus+Paper+Test",
            "https://placehold.co/800x600/f1c40f/white?text=Cabbage+Indicator",
            "https://placehold.co/800x600/2ecc71/white?text=Acid+vs+Base+Indicators"
          ]
        },
      ];

      allLessons.value = mockLessons;
      lesson.value = mockLessons.find((l) => l.id === lessonId.value) || null;
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    loading.value = false;
  }
});

// Helper functions
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};

const extractYouTubeVideoId = (url: string): string => {
  if (!url) return "";

  let videoId = "";
  if (url.includes("youtube.com/watch")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    videoId = urlParams.get("v") || "";
  } else if (url.includes("youtu.be")) {
    videoId = url.split("/").pop() || "";
  }

  return videoId;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
  return `${mins} min`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const navigateToLesson = (id: number) => {
  router.push(`/console/lessons/${id}`);
};

const navigateToEdit = (lesson: Lesson) => {
  // You could either implement in-page editing or navigate to an edit page
  // For now, we'll just log it
  console.log("Editing lesson:", lesson);
  // In a real implementation, you might do:
  // router.push(`/console/lessons/${lesson.id}/edit`);
};

// Document and image helper functions
const getDocumentIcon = (filename: string): string => {
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
};

const getDocumentType = (filename: string): string => {
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
};

// Return only valid color values for UBadge component
const getDocumentColor = (filename: string) => {
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
};

// Get icon based on link provider
const getLinkProviderIcon = (url: string): string => {
  if (!url) return 'i-heroicons-link';

  if (url.includes('drive.google.com')) return 'i-heroicons-cloud';
  if (url.includes('dropbox.com')) return 'i-heroicons-cloud';
  if (url.includes('onedrive')) return 'i-heroicons-cloud';
  if (url.includes('sharepoint')) return 'i-heroicons-cloud';

  return 'i-heroicons-link';
};

// Get provider name based on URL
const getLinkProviderName = (url: string): string => {
  if (!url) return 'Link';

  if (url.includes('drive.google.com')) return 'Google Drive';
  if (url.includes('dropbox.com')) return 'Dropbox';
  if (url.includes('onedrive')) return 'OneDrive';
  if (url.includes('sharepoint')) return 'SharePoint';
  if (url.includes('box.com')) return 'Box';

  return 'Web Link';
};

// Extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  if (!url) return 'Unknown File';

  try {
    // Try to extract filename from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();

    if (filename) {
      // Remove query parameters
      return filename.split('?')[0] ?? filename;
    }
  } catch (e) {
    // Silent fail for invalid URLs
  }

  return 'Document Link';
};

// Get image source from File object
const getImageSrc = (image: File): string => {
  // In a real app, you would have a URL for the uploaded file
  // For this demo, we'll return a placeholder
  return 'https://placehold.co/300x300?text=Image+Content';
};
</script>
