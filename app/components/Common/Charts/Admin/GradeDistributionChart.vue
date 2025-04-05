<template>
  <div>
    <h3 class="font-semibold mb-4">Grade Distribution</h3>
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
  labels: ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (Below 60%)'],
  datasets: [
    {
      backgroundColor: [
        '#10B981', // Green for A
        '#3B82F6', // Blue for B
        '#F59E0B', // Amber for C
        '#F97316', // Orange for D
        '#EF4444'  // Red for F
      ],
      data: [35, 28, 22, 10, 5],
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
        label: function(context: { label?: string; raw?: number; dataset: { data: number[] } }) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} students (${percentage}%)`;
        }
      }
    }
  }
};
</script>