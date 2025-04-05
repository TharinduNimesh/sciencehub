<template>
  <div>
    <h3 class="font-semibold mb-4">Learning Progress</h3>
    <div class="h-64">
      <LineChart :chartData="chartData" :chartOptions="chartOptions" :height="240" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import LineChart from '../LineChart.vue';

// Generate week labels
const generateWeekLabels = () => {
  const weeks = [];
  const today = new Date();
  
  for (let i = 7; i >= 0; i--) {
    weeks.push(`Week ${8-i}`);
  }
  
  return weeks;
};

// Chart data setup
const chartData = reactive({
  labels: generateWeekLabels(),
  datasets: [
    {
      label: 'Your Progress',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10B981',
      borderWidth: 2,
      pointBackgroundColor: '#10B981',
      data: [65, 72, 78, 75, 82, 85, 88, 92],
      tension: 0.3
    },
    {
      label: 'Class Average',
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      borderColor: '#6B7280',
      borderDash: [5, 5],
      borderWidth: 2,
      pointBackgroundColor: '#6B7280',
      data: [62, 68, 71, 73, 75, 76, 78, 80],
      tension: 0.3
    }
  ]
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Score (%)'
      },
      max: 100
    },
    x: {
      title: {
        display: true,
        text: 'Time Period'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context: { dataset: { label: string }; parsed: { y: number } }) {
          return `${context.dataset.label}: ${context.parsed.y}%`;
        }
      }
    }
  }
};
</script>
