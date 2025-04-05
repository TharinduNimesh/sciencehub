<template>
  <div>
    <h3 class="font-semibold mb-4">Revenue Overview</h3>
    <div class="h-64">
      <BarChart :chartData="chartData" :chartOptions="chartOptions" :height="240" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import BarChart from '../BarChart.vue';

// Generate quarterly labels
const generateQuarterLabels = () => {
  const quarters = [];
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  
  // Determine current quarter (0-based: 0=Q1, 1=Q2, 2=Q3, 3=Q4)
  const currentQuarter = Math.floor(month / 3);
  
  // Create labels for last 4 quarters
  for (let i = 3; i >= 0; i--) {
    const quarterNumber = ((currentQuarter - i + 4) % 4) + 1;
    const quarterYear = year - (i > currentQuarter ? 1 : 0);
    quarters.push(`Q${quarterNumber} ${quarterYear}`);
  }
  
  return quarters;
};

// Chart data setup
const chartData = reactive({
  labels: generateQuarterLabels(),
  datasets: [
    {
      label: 'Subscription Revenue',
      backgroundColor: 'rgba(124, 58, 237, 0.8)',
      data: [42000, 48000, 53000, 59000]
    },
    {
      label: 'One-time Payments',
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      data: [18000, 21000, 25000, 28000]
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
        text: 'Revenue ($)'
      },
      ticks: {
        callback: function(value: number) {
          return '$' + value.toLocaleString();
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Quarter'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context: { dataset: { label?: string }; parsed: { y: number | null } }) {
          let label = context.dataset.label || '';
          if (label) {
              label += ': ';
          }
          if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
};
</script>
