<template>
  <div>
    <h3 class="font-semibold mb-4">Class Performance</h3>
    <div class="h-64">
      <BarChart :chartData="chartData" :chartOptions="chartOptions" :height="240" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import BarChart from '../BarChart.vue';

// Chart data setup
const chartData = reactive({
  labels: ['Physics 101', 'Chemistry Lab', 'Mathematics', 'Biology', 'Computer Science'],
  datasets: [
    {
      label: 'Average Score (%)',
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      data: [78, 82, 76, 85, 92]
    }
  ]
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Average Score (%)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Class'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context: { parsed: { x: number } }) {
          return `Average: ${context.parsed.x}%`;
        }
      }
    }
  }
};
</script>