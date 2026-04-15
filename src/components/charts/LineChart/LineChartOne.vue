<template>
  <div class="max-w-full overflow-x-auto custom-scrollbar">
    <div id="chartThree" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
      <VueApexCharts type="area" height="310" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup >
import { ref } from 'vue'

import VueApexCharts from 'vue3-apexcharts'

const series = ref([
  {
    name: 'Sales',
    data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
  },
  {
    name: 'Revenue',
    data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  },
])

const chartOptions = ref({
  legend: {
    show,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#465FFF', '#9CB9FF'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'area',
    toolbar: {
      show,
    },
  },
  fill: {
    gradient: {
      enabled,
      opacityFrom.55,
      opacityTo,
    },
  },
  stroke: {
    curve: 'straight',
    width: [2, 2],
  },
  markers: {
    size,
  },
  labels: {
    show,
    position: 'top',
  },
  grid: {
    xaxis: {
      lines: {
        show,
      },
    },
    yaxis: {
      lines: {
        show,
      },
    },
  },
  dataLabels: {
    enabled,
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy',
    },
  },
  xaxis: {
    type: 'category',
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    axisBorder: {
      show,
    },
    axisTicks: {
      show,
    },
    tooltip: {
      enabled,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
  },
})
</script>

<style scoped>
.area-chart {
  width%;
}
</style>

