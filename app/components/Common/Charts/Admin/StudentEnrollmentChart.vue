<template>
  <div>
    <h3 class="font-semibold mb-4">Student Enrollment Trends</h3>
    <div class="h-64">
      <LineChart :chartData="chartData" :chartOptions="chartOptions" :height="240" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import LineChart from '../LineChart.vue';

// Generate monthly labels for the past year
const generateMonthLabels = () => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const currentMonth = today.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    months.push(monthNames[monthIndex]);
  }
  
  return months;
};

// Chart data setup
const chartData = reactive({
  labels: generateMonthLabels(),
  datasets: [
    {
      label: 'New Students',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      borderColor: '#7C3AED',
      borderWidth: 2,
      pointBackgroundColor: '#7C3AED',
      data: [15, 22, 28, 18, 25, 30, 35, 42, 28, 32, 38, 45],
      tension: 0.3
    },
    {
      label: 'Total Students',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      pointBackgroundColor: '#3B82F6',
      data: [95, 117, 145, 163, 188, 218, 253, 295, 323, 355, 393, 438],
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
        text: 'Number of Students'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Month'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  }
};
</script>