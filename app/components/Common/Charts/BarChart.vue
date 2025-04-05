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
    default: 'bar-chart'
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

// Default options for bar charts
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
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
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: '#EDF2F7'
      }
    }
  }
}

// Merge custom options with default options
const options = computed(() => defaultsDeep({}, props.chartOptions, defaultOptions))

// Set the chart type to bar
const chartData = computed(() => ({
  ...props.chartData,
  type: 'bar',
  datasets: props.chartData.datasets || [] // Ensure datasets is provided
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