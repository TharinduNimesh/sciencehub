<script setup lang="ts">
import { computed, defineProps } from 'vue'
import BaseChart from './BaseChart.vue'
import { defaultsDeep } from 'lodash'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  },
  chartId: {
    type: String,
    default: 'doughnut-chart'
  },
  height: {
    type: Number,
    default: 200
  },
  width: {
    type: Number,
    default: 400
  }
})

// Default options for doughnut charts
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#2D3748',
      bodyColor: '#718096',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 8,
      usePointStyle: true,
      callbacks: {
        label: function(context: { label?: string; raw?: number; chart: { data: { datasets: { data: number[] }[] } } }) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = (context.chart.data.datasets[0]?.data ?? []).reduce((a: number, b: number) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${percentage}% (${value})`;
        }
      }
    }
  },
  animation: {
    animateScale: true
  }
}

// Merge custom options with default options
const options = computed(() => defaultsDeep({}, props.chartOptions, defaultOptions))

// Set the chart type to doughnut
const chartData = computed(() => ({
  ...props.chartData,
  type: 'doughnut',
  datasets: props.chartData.datasets || [] // Ensure datasets is included
}))
</script>

<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="options"
    :chart-id="chartId"
    :width="width"
    :height="height"
  />
</template>