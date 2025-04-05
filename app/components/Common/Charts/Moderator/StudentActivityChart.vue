<template>
  <div>
    <h3 class="font-semibold mb-4">Student Activity</h3>
    <div class="h-64">
      <LineChart
        :chartData="chartData"
        :chartOptions="chartOptions"
        :height="240"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import LineChart from "../LineChart.vue";

// Generate weekday labels
const generateWeekLabels = () => {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const currentDay = today.getDay();

  for (let i = 6; i >= 0; i--) {
    const dayIndex = (currentDay - i + 7) % 7;
    days.push(dayNames[dayIndex]);
  }

  return days;
};

// Chart data setup
const chartData = reactive({
  labels: generateWeekLabels(),
  datasets: [
    {
      label: "Lesson Completion",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderColor: "#10B981",
      borderWidth: 2,
      pointBackgroundColor: "#10B981",
      data: [62, 78, 85, 92, 76, 88, 94],
      tension: 0.3,
    },
    {
      label: "Quiz Attempts",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      borderColor: "#F59E0B",
      borderWidth: 2,
      pointBackgroundColor: "#F59E0B",
      data: [45, 53, 42, 68, 72, 48, 63],
      tension: 0.3,
    },
  ],
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
        text: "Completion Rate (%)",
      },
      max: 100,
    },
    x: {
      title: {
        display: true,
        text: "Day",
      },
    },
  },
  plugins: {
    legend: {
      position: "top",
    },
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (context: { dataset: { label: string }; parsed: { y: number } }) {
          return `${context.dataset.label}: ${context.parsed.y}%`;
        },
      },
    },
  },
};
</script>
