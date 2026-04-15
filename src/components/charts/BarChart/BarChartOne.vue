<template>
  <div class="max-w-full overflow-x-auto custom-scrollbar">
    <div id="chartOne" class="-ml-5 min-w-[650px] xl:min-w-full pl-2">
      <VueApexCharts type="bar" height="180" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const series = ref([
  {
    name: 'Sales',
    data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
  },
])

const chartOptions = ref({
  colors: ['#465fff'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    toolbar: {
      show,
    },
  },
  plotOptions: {
    bar: {
      horizontal,
      columnWidth: '39%',
      borderRadius,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled,
  },
  stroke: {
    show,
    width,
    colors: ['transparent'],
  },
  xaxis: {
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
  },
  legend: {
    show,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
    markers: {
      radius,
    },
  },
  yaxis: {
    title,
  },
  grid: {
    yaxis: {
      lines: {
        show,
      },
    },
  },
  fill: {
    opacity,
  },
  tooltip: {
    x: {
      show,
    },
    y: {
      formatter (val) {
        return val.toString()
      },
    },
  },
})
</script>

