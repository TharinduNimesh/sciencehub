<template>
  <div>
    <h3 class="font-semibold mb-4">Subject Performance</h3>
    <div class="h-64">
      <DoughnutChart :chartData="chartData" :chartOptions="chartOptions" :height="240" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import DoughnutChart from '../DoughnutChart.vue';

// Chart data setup
const chartData = reactive({
  labels: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  datasets: [
    {
      backgroundColor: [
        '#3B82F6', // Blue for Physics
        '#10B981', // Green for Chemistry
        '#8B5CF6', // Purple for Mathematics
        '#F59E0B', // Amber for Biology
        '#EC4899'  // Pink for Computer Science
      ],
      data: [85, 78, 92, 80, 95],
      borderWidth: 1
    }
  ]
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 15,
        padding: 15
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: { label?: string; raw?: number }) {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ${value}%`;
        }
      }
    }
  }
};
</script>