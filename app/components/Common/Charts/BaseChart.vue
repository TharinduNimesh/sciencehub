<script setup lang="ts">
import { defineProps, toRef } from 'vue'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  RadialLinearScale,
  Filler,
  type ChartData
} from 'chart.js'
import { Chart } from 'vue-chartjs'

// Register ChartJS components
ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement,
  RadialLinearScale,
  Filler
)

const props = defineProps({
  chartData: {
    type: Object as () => ChartData,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  },
  chartId: {
    type: String,
    default: 'chart'
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 200
  },
  cssClasses: {
    type: String,
    default: ''
  }
})

const chartData = toRef(props, 'chartData')
const chartOptions = toRef(props, 'chartOptions')
</script>

<template>
  <div class="chart-container">
    <Chart
      :type="'bar'"
      :data="chartData"
      :options="chartOptions"
      :chart-id="chartId"
      :width="width"
      :height="height"
      :css-classes="cssClasses"
    ></Chart>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>